from flask import Blueprint

from models_loader.loader import registry
from utils.helpers import success_response

metrics_bp = Blueprint('metrics', __name__)


@metrics_bp.route('/metrics/classification', methods=['GET'])
def classification_metrics():
    return success_response({'metrics': registry.classification_metrics})


@metrics_bp.route('/metrics/causality', methods=['GET'])
def causality_metrics():
    return success_response({'metrics': registry.causality_metrics})


@metrics_bp.route('/metrics/regression', methods=['GET'])
def regression_metrics():
    return success_response({'metrics': registry.regression_metrics})
