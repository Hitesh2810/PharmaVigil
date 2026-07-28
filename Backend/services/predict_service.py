from __future__ import annotations

import numpy as np
import pandas as pd

from models_loader.loader import registry
from utils.helpers import logger


class PredictionService:
    def __init__(self) -> None:
        self.registry = registry

    def _prepare_features(self, payload: dict, feature_columns: list[str], model_name: str) -> pd.DataFrame:
        frame = pd.DataFrame([payload], columns=payload.keys())
        missing = [col for col in feature_columns if col not in frame.columns]
        if missing:
            raise ValueError(f'Missing required input fields for {model_name}: {missing}')

        frame = frame[feature_columns]
        for col in ['drug_name', 'country', 'reporter_type', 'batch_id']:
            if col in frame.columns:
                if col == 'drug_name':
                    encoder = self.registry.label_encoders['drug']
                elif col == 'country':
                    encoder = self.registry.label_encoders['country']
                elif col == 'reporter_type':
                    encoder = self.registry.label_encoders['reporter']
                elif col == 'batch_id':
                    encoder = self.registry.label_encoders['batch']
                else:
                    encoder = None
                if encoder is not None:
                    values = frame[col].astype(str)
                    unknown = values[~values.isin(encoder.classes_)].unique()
                    if len(unknown):
                        values = values.replace({u: encoder.classes_[0] for u in unknown})
                    frame[col] = encoder.transform(values)
        return frame

    def predict_classification(self, payload: dict) -> dict:
        features = self._prepare_features(payload, self.registry.classification_features, 'classification')
        probabilities = self.registry.classification_model.predict_proba(features)[0]
        prediction_index = int(np.argmax(probabilities))
        label = self.registry.label_encoders['target'].inverse_transform([prediction_index])[0]
        return {
            'prediction': str(label),
            'confidence': float(probabilities[prediction_index]),
            'probabilities': {str(cls): float(prob) for cls, prob in zip(self.registry.classification_model.classes_, probabilities)},
            'class_label': str(label),
        }

    def predict_causality(self, payload: dict) -> dict:
        features = self._prepare_features(payload, self.registry.causality_features, 'causality')
        probabilities = self.registry.causality_model.predict_proba(features)[0]
        prediction_index = int(np.argmax(probabilities))
        label = self.registry.causality_model.classes_[prediction_index]
        return {
            'prediction': str(label),
            'confidence': float(probabilities[prediction_index]),
            'probabilities': {str(cls): float(prob) for cls, prob in zip(self.registry.causality_model.classes_, probabilities)},
        }

    def predict_regression(self, payload: dict) -> dict:
        features = self._prepare_features(payload, self.registry.regression_features, 'regression')
        prediction = float(self.registry.regression_model.predict(features)[0])
        return {'predicted_value': prediction}
