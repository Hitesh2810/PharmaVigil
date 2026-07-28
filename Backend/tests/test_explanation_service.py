import sys
import unittest
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from services.explanation_service import ExplanationService


class ExplanationServiceTests(unittest.TestCase):
    def test_build_shap_payload_accepts_categorical_strings(self):
        service = ExplanationService()
        payload = {
            'patient_age': 52,
            'drug_name': 'RHEUMATRIX',
            'dose_amount_mg': 250,
            'country': 'Brazil',
            'reporter_type': 'Other',
            'batch_id': 'B1090-B',
            'historical_ae_frequency': 6,
        }

        result = service.build_shap_payload('classification', payload)

        self.assertIn('feature_names', result)
        self.assertIn('shap_values', result)
        self.assertIn('top_important_features', result)
        self.assertTrue(len(result['shap_values']) > 0)


if __name__ == '__main__':
    unittest.main()
