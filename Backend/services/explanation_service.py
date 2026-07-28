import numpy as np
import pandas as pd

from models_loader.loader import registry


class ExplanationService:
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

    def _build_feature_frame(self, payload: dict, feature_columns: list[str], model_name: str) -> pd.DataFrame:
        return self._prepare_features(payload, feature_columns, model_name)

    def build_shap_payload(self, model_name: str, payload: dict) -> dict:
        if model_name == 'classification':
            feature_columns = self.registry.classification_features
            explainer = self.registry.classification_explainer
            model = self.registry.classification_model
            values = self._build_feature_frame(payload, feature_columns, 'classification')
            shap_values = explainer.shap_values(values)[0] if hasattr(explainer, 'shap_values') else None
            feature_names = feature_columns
        elif model_name == 'causality':
            feature_columns = self.registry.causality_features
            explainer = self.registry.causality_explainer
            model = self.registry.causality_model
            values = self._build_feature_frame(payload, feature_columns, 'causality')
            shap_values = explainer.shap_values(values)[0] if hasattr(explainer, 'shap_values') else None
            feature_names = feature_columns
        else:
            feature_columns = self.registry.regression_features
            explainer = self.registry.regression_explainer
            model = self.registry.regression_model
            values = self._build_feature_frame(payload, feature_columns, 'regression')
            shap_values = explainer.shap_values(values)[0] if hasattr(explainer, 'shap_values') else None
            feature_names = feature_columns

        if shap_values is None:
            shap_values = np.zeros(len(feature_columns))

        if isinstance(shap_values, list):
            if shap_values and isinstance(shap_values[0], list):
                shap_values = np.array(shap_values[0])
            else:
                shap_values = np.array(shap_values)
        elif not isinstance(shap_values, np.ndarray):
            shap_values = np.asarray(shap_values)

        if shap_values.ndim > 1:
            shap_values = shap_values[0]

        ranked = sorted(
            zip(feature_names, shap_values.tolist()),
            key=lambda item: abs(item[1]),
            reverse=True,
        )
        top_features = ranked[:5]
        explanation = (
            'The most influential features were ' + ', '.join([f"{name} ({value:+.2f})" for name, value in top_features]) +
            '. They drove the model toward the selected prediction.'
        )
        base_value = 0.0
        try:
            if hasattr(model, 'predict_proba'):
                base_value = float(model.predict_proba(values)[0][0])
            else:
                base_value = float(model.predict(values)[0])
        except Exception:
            base_value = 0.0

        return {
            'feature_names': feature_names,
            'shap_values': [float(v) for v in shap_values],
            'base_value': base_value,
            'top_important_features': [
                {'feature': name, 'shap_value': float(value)} for name, value in top_features
            ],
            'natural_language_explanation': explanation,
        }


explanation_service = ExplanationService()
