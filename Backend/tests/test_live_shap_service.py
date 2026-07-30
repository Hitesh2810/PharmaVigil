import sys
import unittest
from pathlib import Path
from types import SimpleNamespace

import numpy as np
import pandas as pd
import shap

sys.path.append(str(Path(__file__).resolve().parents[1]))

from services.live_shap_service import LiveShapService


class FakeClassificationModel:
    def __init__(self):
        self.classes_ = np.array([0, 1])

    def predict_proba(self, features):
        return np.array([[0.7, 0.3] for _ in range(len(features))], dtype=float)

    def predict(self, features):
        return np.array([1 for _ in range(len(features))], dtype=int)


class CallableExplainer:
    def __init__(self):
        self.expected_value = 0.1

    def __call__(self, features):
        values = np.array([[0.2, -0.3], [0.1, 0.4]], dtype=float)
        return shap.Explanation(
            values=values,
            data=features.to_numpy(),
            feature_names=list(features.columns),
            base_values=np.array([0.1, 0.1]),
        )


class LiveShapServiceTests(unittest.TestCase):
    def test_analyze_accepts_callable_explainer(self):
        service = LiveShapService()
        service.registry = SimpleNamespace(
            classification_model=FakeClassificationModel(),
            causality_model=FakeClassificationModel(),
            regression_model=FakeClassificationModel(),
            classification_features=['feature_a', 'feature_b'],
            causality_features=['feature_a', 'feature_b'],
            regression_features=['feature_a', 'feature_b'],
            label_encoders={},
        )

        dataset = pd.DataFrame([
            {'feature_a': 1.0, 'feature_b': 2.0},
            {'feature_a': 3.0, 'feature_b': 4.0},
        ])

        service._get_model_bundle = lambda model_name: {
            'model': service.registry.classification_model,
            'explainer': CallableExplainer(),
        }

        report = service.analyze(dataset, 'classification')

        self.assertEqual(report['feature_names'], ['feature_a', 'feature_b'])
        self.assertTrue(report['plots']['summary_plot'])
        self.assertTrue(report['plots']['beeswarm_plot'])
        self.assertTrue(report['plots']['waterfall_plot'])
        self.assertTrue(report['plots']['decision_plot'])
        self.assertTrue(report['plots']['dependence_plot'])


if __name__ == '__main__':
    unittest.main()
