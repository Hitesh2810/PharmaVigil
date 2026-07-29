from __future__ import annotations

import io
import json
import math
import os
from typing import Any

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap


class SHAPAnalysisError(Exception):
    """Raised when SHAP analysis cannot be completed."""


def _safe_float(value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def prepare_features(frame: pd.DataFrame, feature_columns: list[str], label_encoders: dict[str, Any]) -> pd.DataFrame:
    prepared = frame.copy()
    for column in feature_columns:
        if column not in prepared.columns:
            raise ValueError(f'Missing required column: {column}')
    prepared = prepared[feature_columns]
    for col in ['drug_name', 'country', 'reporter_type', 'batch_id']:
        if col in prepared.columns and col in label_encoders:
            encoder = label_encoders[col]
            values = prepared[col].astype(str)
            unknown = values[~values.isin(encoder.classes_)].unique()
            if len(unknown):
                values = values.replace({u: encoder.classes_[0] for u in unknown})
            prepared[col] = encoder.transform(values)
    return prepared


def validate_dataset(frame: pd.DataFrame) -> None:
    if frame is None:
        raise SHAPAnalysisError('Dataset is empty.')
    if frame.empty:
        raise SHAPAnalysisError('The uploaded dataset is empty.')
    if frame.columns.duplicated().any():
        raise SHAPAnalysisError('Duplicate columns were found. Please rename them and try again.')
    if frame.shape[0] == 0 or frame.shape[1] == 0:
        raise SHAPAnalysisError('The dataset must contain rows and columns.')


def _normalize_shap_values(shap_values: Any, feature_names: list[str] | None = None) -> np.ndarray:
    if shap_values is None:
        raise SHAPAnalysisError('SHAP values are empty.')

    if isinstance(shap_values, shap.Explanation):
        shap_values = shap_values.values
    elif hasattr(shap_values, 'values') and not isinstance(shap_values, (np.ndarray, list, tuple, pd.DataFrame)):
        shap_values = shap_values.values

    if isinstance(shap_values, list):
        if shap_values and isinstance(shap_values[0], (list, np.ndarray)):
            shap_values = np.asarray(shap_values[0])
        else:
            shap_values = np.asarray(shap_values)
    elif isinstance(shap_values, pd.DataFrame):
        shap_values = shap_values.to_numpy()
    elif not isinstance(shap_values, np.ndarray):
        shap_values = np.asarray(shap_values)

    if shap_values.ndim == 0:
        shap_values = shap_values.reshape(1, -1)
    elif shap_values.ndim == 1:
        shap_values = shap_values.reshape(1, -1)

    if feature_names is not None and shap_values.ndim == 2:
        feature_count = len(feature_names)
        if shap_values.shape[1] != feature_count and shap_values.shape[0] == feature_count:
            shap_values = shap_values.T

    return shap_values


def _build_shap_explanation(shap_values: Any, feature_names: list[str], features: pd.DataFrame | None = None) -> shap.Explanation:
    values = _normalize_shap_values(shap_values, feature_names)
    if values.ndim != 2 or values.shape[1] != len(feature_names):
        raise SHAPAnalysisError('SHAP values shape does not match feature names.')

    if features is None:
        features = pd.DataFrame(values, columns=feature_names)
    elif isinstance(features, pd.DataFrame):
        if list(features.columns) != feature_names:
            features = pd.DataFrame(features.to_numpy(), columns=feature_names)
    else:
        features = pd.DataFrame(features, columns=feature_names)

    return shap.Explanation(values=values, data=features, feature_names=feature_names)


def build_summary_plot(shap_values: Any, feature_names: list[str], features: pd.DataFrame | None = None) -> str:
    shap_exp = _build_shap_explanation(shap_values, feature_names, features)
    fig, ax = plt.subplots(figsize=(10, 6))
    shap.summary_plot(shap_exp, show=False, plot_type='bar')
    fig.tight_layout()
    return _fig_to_base64(fig)


def build_beeswarm_plot(shap_values: Any, feature_names: list[str], features: pd.DataFrame | None = None) -> str:
    shap_exp = _build_shap_explanation(shap_values, feature_names, features)
    fig, ax = plt.subplots(figsize=(10, 6))
    shap.summary_plot(shap_exp, show=False)
    fig.tight_layout()
    return _fig_to_base64(fig)


def build_feature_importance(shap_values: Any, feature_names: list[str]) -> str:
    values = _normalize_shap_values(shap_values, feature_names)
    values = np.abs(values).mean(axis=0)
    order = np.argsort(values)[::-1]
    ordered_names = [feature_names[i] for i in order]
    ordered_values = values[order]
    fig, ax = plt.subplots(figsize=(9, 5))
    ax.barh(ordered_names, ordered_values)
    ax.invert_yaxis()
    ax.set_title('Feature Importance')
    fig.tight_layout()
    return _fig_to_base64(fig)


def build_waterfall_plot(shap_values: Any, feature_names: list[str], sample_index: int = 0) -> str:
    values = _normalize_shap_values(shap_values, feature_names)
    if values.ndim > 1:
        values = values[sample_index] if sample_index < values.shape[0] else values[0]
    ordered = np.argsort(np.abs(values))[::-1][:10]
    names = [feature_names[i] for i in ordered]
    bar_values = values[ordered]
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.barh(names, bar_values)
    ax.invert_yaxis()
    ax.set_title('Waterfall-style Feature Contributions')
    fig.tight_layout()
    return _fig_to_base64(fig)


def build_dependence_plot(shap_values: Any, feature_names: list[str], feature_name: str, values: pd.DataFrame) -> str:
    if feature_name not in feature_names:
        raise SHAPAnalysisError(f'Feature {feature_name} is not available in the dataset.')
    shap_exp = _build_shap_explanation(shap_values, feature_names, values)
    feature_index = feature_names.index(feature_name)
    fig, ax = plt.subplots(figsize=(8, 4))
    shap.dependence_plot(feature_index, shap_exp, values, show=False)
    fig.tight_layout()
    return _fig_to_base64(fig)


def build_heatmap(shap_values: Any, feature_names: list[str], features: pd.DataFrame | None = None) -> str:
    shap_exp = _build_shap_explanation(shap_values, feature_names, features)
    fig, ax = plt.subplots(figsize=(10, 6))
    shap.plots.heatmap(shap_exp, show=False)
    fig.tight_layout()
    return _fig_to_base64(fig)


def build_decision_plot(shap_values: Any, feature_names: list[str], values: pd.DataFrame) -> str:
    values = np.asarray(shap_values)
    if values.ndim > 1:
        values = values[0]
    cumulative = np.cumsum(values)
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(range(len(feature_names) + 1), np.insert(cumulative, 0, 0), marker='o')
    ax.set_xticks(range(len(feature_names) + 1))
    ax.set_xticklabels(['base'] + feature_names, rotation=45, ha='right')
    ax.set_title('Decision Path')
    fig.tight_layout()
    return _fig_to_base64(fig)


def _fig_to_base64(fig: plt.Figure) -> str:
    buffer = io.BytesIO()
    fig.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    return buffer.getvalue().hex()


def make_prediction_table(predictions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            'prediction': item.get('prediction', ''),
            'confidence': _safe_float(item.get('confidence', 0.0)),
            'probability': _safe_float(item.get('probability', 0.0)),
        }
        for item in predictions
    ]
