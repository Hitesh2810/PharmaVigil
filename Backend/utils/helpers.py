import json
import logging
from pathlib import Path
from typing import Any, Dict

from flask import jsonify


logger = logging.getLogger(__name__)


def error_response(message: str, status_code: int = 400, details: Any = None):
    payload = {'success': False, 'error': message}
    if details is not None:
        payload['details'] = details
    return jsonify(payload), status_code


def success_response(payload: Dict[str, Any], status_code: int = 200):
    payload = {'success': True, **payload}
    return jsonify(payload), status_code


def load_json(path: Path):
    with path.open('r', encoding='utf-8') as fh:
        return json.load(fh)
