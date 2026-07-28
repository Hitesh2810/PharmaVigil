from flask import Blueprint, request

from services.explanation_service import explanation_service
from utils.helpers import error_response, success_response

shap_bp = Blueprint('shap', __name__)


@shap_bp.route('/shap/classification', methods=['POST'])
def classification_shap():
    try:
        payload = request.get_json(silent=True) or {}
        if not payload:
            return error_response('Request body must be a JSON object with model inputs.', 400)
        return success_response({'shap': explanation_service.build_shap_payload('classification', payload)})
    except Exception as exc:
        return error_response(str(exc), 500)


@shap_bp.route('/shap/causality', methods=['POST'])
def causality_shap():
    try:
        payload = request.get_json(silent=True) or {}
        if not payload:
            return error_response('Request body must be a JSON object with model inputs.', 400)
        return success_response({'shap': explanation_service.build_shap_payload('causality', payload)})
    except Exception as exc:
        return error_response(str(exc), 500)


@shap_bp.route('/shap/regression', methods=['POST'])
def regression_shap():
    try:
        payload = request.get_json(silent=True) or {}
        if not payload:
            return error_response('Request body must be a JSON object with model inputs.', 400)
        return success_response({'shap': explanation_service.build_shap_payload('regression', payload)})
    except Exception as exc:
        return error_response(str(exc), 500)
