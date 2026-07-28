import joblib
import pandas as pd
from pathlib import Path
from typing import Any, Dict, List

from config import MODELS_DIR, DATASET_PATH


class ModelRegistry:
    def __init__(self) -> None:
        self.models_dir = MODELS_DIR
        self.dataset_path = DATASET_PATH
        self._registry: Dict[str, Any] = {}
        self._load_all()

    def _load_all(self) -> None:
        self.classification_model = self._load_pickle('classification_model.pkl')
        self.causality_model = self._load_pickle('causality_model.pkl')
        self.regression_model = self._load_pickle('regression_model.pkl')

        self.classification_features = self._load_pickle('feature_columns.pkl')
        self.causality_features = self._load_pickle('causality_feature_columns.pkl')
        self.regression_features = self._load_pickle('regression_feature_columns.pkl')

        self.classification_metrics = self._load_json('classification_metrics.json')
        self.causality_metrics = self._load_json('causality_metrics.json')
        self.regression_metrics = self._load_json('regression_metrics.json')

        self.classification_report = self._load_text('classification_report.txt')
        self.causality_report = self._load_text('causality_report.txt')
        self.regression_report = self._load_text('regression_report.txt')

        self.classification_shap_values = self._load_pickle('classification_shap_values.pkl')
        self.causality_shap_values = self._load_pickle('causality_shap_values.pkl')
        self.regression_shap_values = self._load_pickle('regression_shap_values.pkl')

        self.classification_explainer = self._load_pickle('classification_shap_explainer.pkl')
        self.causality_explainer = self._load_pickle('causality_shap_explainer.pkl')
        self.regression_explainer = self._load_pickle('regression_shap_explainer.pkl')

        self.label_encoders = {
            'batch': self._load_pickle('le_batch.pkl'),
            'country': self._load_pickle('le_country.pkl'),
            'drug': self._load_pickle('le_drug.pkl'),
            'reporter': self._load_pickle('le_reporter.pkl'),
            'target': self._load_pickle('le_target.pkl'),
        }

        self.dataset = pd.read_csv(self.dataset_path)

    def _load_pickle(self, filename: str) -> Any:
        path = self.models_dir / filename
        if not path.exists():
            raise FileNotFoundError(f'Model file not found: {path}')
        return joblib.load(path)

    def _load_json(self, filename: str) -> Dict[str, Any]:
        path = self.models_dir / filename
        if not path.exists():
            raise FileNotFoundError(f'Metrics file not found: {path}')
        import json
        with path.open('r', encoding='utf-8') as fh:
            return json.load(fh)

    def _load_text(self, filename: str) -> str:
        path = self.models_dir / filename
        if not path.exists():
            return ''
        return path.read_text(encoding='utf-8')

    def get_dataset(self) -> pd.DataFrame:
        return self.dataset.copy()


registry = ModelRegistry()
