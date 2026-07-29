import io
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app import app


class LiveShapRoutesTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_upload_and_generate_accept_multipart_dataset(self):
        csv_bytes = b'age,drug_name\n30,RHEUMATRIX\n40,ALBUTEROL\n'

        with patch('routes.live_shap.live_shap_service.analyze', return_value={
            'model_used': 'classification',
            'plots': {},
            'predictions': [],
        }) as mock_analyze:
            upload_response = self.client.post(
                '/api/live-shap/upload',
                data={'file': (io.BytesIO(csv_bytes), 'sample.csv')},
                content_type='multipart/form-data',
            )
            self.assertEqual(upload_response.status_code, 200)

            generate_response = self.client.post(
                '/api/live-shap/generate',
                data={'file': (io.BytesIO(csv_bytes), 'sample.csv'), 'model': 'classification'},
                content_type='multipart/form-data',
            )

            self.assertEqual(generate_response.status_code, 200)
            payload = generate_response.get_json()
            self.assertTrue(payload['success'])
            self.assertEqual(payload['data']['model_used'], 'classification')
            mock_analyze.assert_called_once()


if __name__ == '__main__':
    unittest.main()
