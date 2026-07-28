from flask import Blueprint, request

from services.predict_service import PredictionService
from services.explanation_service import explanation_service
from utils.helpers import error_response, success_response

prediction_bp = Blueprint('prediction', __name__)
predict_service = PredictionService()


@prediction_bp.route('/classification/predict', methods=['POST'])
def classification_predict():
    try:
        payload = request.get_json(silent=True) or {}
        if not payload:
            return error_response('Request body must be a JSON object with model inputs.', 400)
        result = predict_service.predict_classification(payload)
        shap = explanation_service.build_shap_payload('classification', payload)
        return success_response({'prediction': result, 'shap': shap})
    except Exception as exc:
        return error_response(str(exc), 500)


@prediction_bp.route('/causality/predict', methods=['POST'])
def causality_predict():
    try:
        payload = request.get_json(silent=True) or {}
        if not payload:
            return error_response('Request body must be a JSON object with model inputs.', 400)
        result = predict_service.predict_causality(payload)
        shap = explanation_service.build_shap_payload('causality', payload)
        return success_response({'prediction': result, 'shap': shap})
    except Exception as exc:
        return error_response(str(exc), 500)


@prediction_bp.route('/regression/predict', methods=['POST'])
def regression_predict():
    try:
        payload = request.get_json(silent=True) or {}
        if not payload:
            return error_response('Request body must be a JSON object with model inputs.', 400)
        result = predict_service.predict_regression(payload)
        shap = explanation_service.build_shap_payload('regression', payload)
        return success_response({'prediction': result, 'shap': shap})
    except Exception as exc:
        return error_response(str(exc), 500)


@prediction_bp.route('/explain/prediction', methods=['POST'])
def explain_prediction():
    try:
        payload = request.get_json(silent=True) or {}
        if not payload:
            return error_response('Request body must be a JSON object with model inputs.', 400)
        classification = predict_service.predict_classification(payload)
        shap = explanation_service.build_shap_payload('classification', payload)
        return success_response({
            'prediction': classification,
            'top_influencing_features': shap['top_important_features'],
            'plain_english_explanation': shap['natural_language_explanation'],
        })
    except Exception as exc:
        return error_response(str(exc), 500)
