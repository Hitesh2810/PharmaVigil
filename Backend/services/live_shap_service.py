from __future__ import annotations

import json
import logging
import os
from typing import Any

import numpy as np
import pandas as pd
import shap

from models_loader.loader import registry
from utils.shap_utils import SHAPAnalysisError, build_beeswarm_plot, build_decision_plot, build_dependence_plot, build_feature_importance, build_heatmap, build_summary_plot, build_waterfall_plot, prepare_features, validate_dataset

logger = logging.getLogger(__name__)


class LiveShapService:
    def __init__(self) -> None:
        self.registry = registry
        self._model_cache: dict[str, Any] = {}
        self._explainer_cache: dict[str, Any] = {}

    def _get_model_bundle(self, model_name: str) -> dict[str, Any]:
        if model_name in self._model_cache and model_name in self._explainer_cache:
            return {'model': self._model_cache[model_name], 'explainer': self._explainer_cache[model_name]}
        if model_name == 'classification':
            model = self.registry.classification_model
            explainer = self.registry.classification_explainer
        elif model_name == 'causality':
            model = self.registry.causality_model
            explainer = self.registry.causality_explainer
        elif model_name == 'regression':
            model = self.registry.regression_model
            explainer = self.registry.regression_explainer
        else:
            raise SHAPAnalysisError('Unsupported model selection.')
        self._model_cache[model_name] = model
        self._explainer_cache[model_name] = explainer
        return {'model': model, 'explainer': explainer}

    def _prepare_input_frame(self, frame: pd.DataFrame, model_name: str) -> pd.DataFrame:
        if model_name == 'classification':
            feature_columns = self.registry.classification_features
        elif model_name == 'causality':
            feature_columns = self.registry.causality_features
        else:
            feature_columns = self.registry.regression_features
        return prepare_features(frame, feature_columns, self.registry.label_encoders)

    def _predict(self, model_name: str, features: pd.DataFrame) -> dict[str, Any]:
        if model_name == 'classification':
            probabilities = self._get_model_bundle(model_name)['model'].predict_proba(features)[0]
            pred_index = int(np.argmax(probabilities))
            label = self.registry.label_encoders['target'].inverse_transform([pred_index])[0]
            return {
                'prediction': str(label),
                'confidence': float(probabilities[pred_index]),
                'probability': float(probabilities[pred_index]),
                'probabilities': {str(cls): float(prob) for cls, prob in zip(self._get_model_bundle(model_name)['model'].classes_, probabilities)},
            }
        if model_name == 'causality':
            probabilities = self._get_model_bundle(model_name)['model'].predict_proba(features)[0]
            pred_index = int(np.argmax(probabilities))
            label = self._get_model_bundle(model_name)['model'].classes_[pred_index]
            return {
                'prediction': str(label),
                'confidence': float(probabilities[pred_index]),
                'probability': float(probabilities[pred_index]),
                'probabilities': {str(cls): float(prob) for cls, prob in zip(self._get_model_bundle(model_name)['model'].classes_, probabilities)},
            }
        prediction = float(self._get_model_bundle(model_name)['model'].predict(features)[0])
        return {'prediction': str(prediction), 'confidence': 0.0, 'probability': 0.0}

    def _safe_plot(self, plot_func: Any, *args: Any) -> str:
        try:
            return plot_func(*args)
        except Exception as exc:
            logger.exception('Live SHAP plot failed: %s', exc)
            return ''

    def analyze(self, dataset: pd.DataFrame, model_name: str, sample_index: int = 0, feature_name: str | None = None) -> dict[str, Any]:
        validate_dataset(dataset)
        features = self._prepare_input_frame(dataset, model_name)
        bundle = self._get_model_bundle(model_name)
        explainer = bundle['explainer']
        model = bundle['model']

        try:
            shap_values = explainer.shap_values(features)[0] if hasattr(explainer, 'shap_values') else None
        except Exception as exc:
            raise SHAPAnalysisError(f'SHAP explanation failed: {exc}') from exc

        if shap_values is None:
            raise SHAPAnalysisError('The selected explainer did not return SHAP values.')

        if isinstance(shap_values, list):
            if shap_values and isinstance(shap_values[0], list):
                shap_values = np.array(shap_values[0])
            else:
                shap_values = np.asarray(shap_values)
        elif not isinstance(shap_values, np.ndarray):
            shap_values = np.asarray(shap_values)

        if shap_values.ndim == 1:
            shap_values = shap_values.reshape(1, -1)

        feature_names = list(features.columns)
        predictions = []
        for idx in range(min(len(dataset), 10)):
            row = features.iloc[[idx]]
            predictions.append(self._predict(model_name, row))

        report = {
            'model_used': model_name,
            'rows': int(dataset.shape[0]),
            'columns': int(dataset.shape[1]),
            'missing_values': int(dataset.isnull().sum().sum()),
            'duplicate_rows': int(dataset.duplicated().sum()),
            'prediction_time': 'N/A',
            'average_confidence': round(float(np.mean([item.get('confidence', 0.0) for item in predictions])) if predictions else 0.0, 4),
            'feature_names': feature_names,
            'plots': {
                'summary_plot': self._safe_plot(build_summary_plot, shap_values, feature_names, features),
                'beeswarm_plot': self._safe_plot(build_beeswarm_plot, shap_values, feature_names, features),
                'feature_importance': self._safe_plot(build_feature_importance, shap_values, feature_names),
                'waterfall_plot': self._safe_plot(build_waterfall_plot, shap_values, feature_names, sample_index),
                'heatmap': self._safe_plot(build_heatmap, shap_values, feature_names, features),
                'decision_plot': self._safe_plot(build_decision_plot, shap_values, feature_names, features),
            },
            'predictions': predictions,
        }

        if feature_name and feature_name in feature_names:
            report['plots']['dependence_plot'] = build_dependence_plot(shap_values, feature_names, feature_name, features)
        else:
            report['plots']['dependence_plot'] = ''

        return report


live_shap_service = LiveShapService()
