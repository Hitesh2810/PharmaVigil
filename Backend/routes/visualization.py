"""Read-only endpoints for the model-artifact visualization viewer."""
import csv
import json
from pathlib import Path

import joblib
from flask import Blueprint, jsonify, send_file

from config import MODELS_DIR


visualization_bp = Blueprint('visualization', __name__)
_ALLOWED_KINDS = {'classification', 'causality', 'regression'}


def _artifact_root(kind: str) -> Path:
    if kind not in _ALLOWED_KINDS:
        raise ValueError('Unknown visualization type')
    return MODELS_DIR / kind


def _first_attribute(model, names, default='Not available'):
    for name in names:
        value = getattr(model, name, None)
        if value is not None:
            return int(value) if isinstance(value, (int, float)) else str(value)
    return default


@visualization_bp.route('/visualization/<kind>', methods=['GET'])
def visualization_data(kind):
    """Return existing metadata, metrics, report, CSV rows and plot names only."""
    try:
        root = _artifact_root(kind)
    except ValueError:
        return {'success': False, 'error': 'Unknown visualization type'}, 404

    model_files = list((root / 'model').glob('*_model.pkl'))
    feature_files = list((root / 'model').glob('*feature_columns.pkl'))
    model = joblib.load(model_files[0]) if model_files else None
    features = joblib.load(feature_files[0]) if feature_files else []
    metrics_path = root / 'metrics' / 'metrics.json'
    report_path = root / 'metrics' / 'classification_report.txt'
    predictions_path = root / 'predictions' / 'predictions.csv'
    residuals_path = root / 'metrics' / 'residuals.csv'

    def csv_rows(path):
        if not path.exists():
            return []
        with path.open('r', encoding='utf-8-sig', newline='') as handle:
            return list(csv.DictReader(handle))

    plots = sorted(
        file.name for file in (root / 'plots').glob('*')
        if file.suffix.lower() in {'.png', '.jpg', '.jpeg', '.svg'}
    )
    payload = {
        'kind': kind,
        'model_info': {
            'best_model': type(model).__name__ if model is not None else 'Not available',
            'model_type': _first_attribute(model, ['_estimator_type'], 'Regression' if kind == 'regression' else 'Classification'),
            'target_variable': {
                'classification': 'Adverse event seriousness',
                'causality': 'Causality assessment',
                'regression': 'Regression outcome',
            }[kind],
            'feature_count': len(features) if hasattr(features, '__len__') else _first_attribute(model, ['n_features_in_']),
        },
        'metrics': json.loads(metrics_path.read_text(encoding='utf-8')) if metrics_path.exists() else {},
        'report': report_path.read_text(encoding='utf-8') if report_path.exists() else '',
        'predictions': csv_rows(predictions_path),
        'residuals': csv_rows(residuals_path),
        'plots': plots,
    }
    return jsonify({'success': True, 'data': payload})


@visualization_bp.route('/visualization/<kind>/plot/<filename>', methods=['GET'])
def visualization_plot(kind, filename):
    try:
        root = _artifact_root(kind)
    except ValueError:
        return {'success': False, 'error': 'Unknown visualization type'}, 404
    path = root / 'plots' / Path(filename).name
    if not path.is_file() or path.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.svg'}:
        return {'success': False, 'error': 'Visualization not found'}, 404
    return send_file(path, conditional=True)
