from __future__ import annotations

from flask import Blueprint, request

from services.live_shap_service import live_shap_service
from utils.helpers import error_response, success_response

live_shap_bp = Blueprint('live_shap', __name__)


@live_shap_bp.route('/live-shap/upload', methods=['POST'])
def upload_dataset():
    try:
        if 'file' not in request.files:
            return error_response('Please upload a CSV or XLSX file.', 400)
        uploaded = request.files['file']
        if uploaded.filename == '':
            return error_response('No file selected.', 400)
        filename = uploaded.filename.lower()
        if not (filename.endswith('.csv') or filename.endswith('.xlsx')):
            return error_response('Only CSV and Excel (.xlsx) files are supported.', 400)

        if filename.endswith('.csv'):
            import pandas as pd
            frame = pd.read_csv(uploaded)
        else:
            import pandas as pd
            frame = pd.read_excel(uploaded)

        if frame.empty:
            return error_response('The uploaded dataset is empty.', 400)

        return success_response({
            'rows': int(frame.shape[0]),
            'columns': int(frame.shape[1]),
            'column_names': list(frame.columns),
            'missing_values': int(frame.isnull().sum().sum()),
            'duplicate_rows': int(frame.duplicated().sum()),
        })
    except Exception as exc:
        return error_response(f'Unable to read dataset: {exc}', 400)


@live_shap_bp.route('/live-shap/generate', methods=['POST'])
def generate_analysis():
    try:
        payload = request.get_json(silent=True) or {}
        form_data = request.form
        model_name = str((payload.get('model') or form_data.get('model') or '')).strip().lower()
        feature_name = payload.get('feature_name') or form_data.get('feature_name')

        if not model_name:
            return error_response('Please select a model.', 400)
        if model_name not in {'classification', 'causality', 'regression'}:
            return error_response('Unsupported model.', 400)

        uploaded = None
        if 'file' in request.files and request.files['file'].filename:
            uploaded = request.files['file']
        elif payload.get('file'):
            uploaded = payload.get('file')

        if uploaded is None:
            return error_response('Dataset file is missing.', 400)

        import pandas as pd
        if hasattr(uploaded, 'stream'):
            filename = (uploaded.filename or '').lower()
            if filename.endswith('.csv'):
                frame = pd.read_csv(uploaded)
            else:
                frame = pd.read_excel(uploaded)
        else:
            frame = pd.DataFrame(uploaded)

        report = live_shap_service.analyze(frame, model_name, feature_name=feature_name)
        return success_response(report)
    except Exception as exc:
        return error_response(str(exc), 400)


@live_shap_bp.route('/live-shap/report', methods=['GET'])
def get_report():
    return success_response({'report': None})
