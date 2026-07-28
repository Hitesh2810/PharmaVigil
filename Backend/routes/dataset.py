from flask import Blueprint, request

from services.dataset_service import dataset_service
from utils.helpers import error_response, success_response


dataset_bp = Blueprint('dataset', __name__)


@dataset_bp.route('/dataset/summary', methods=['GET'])
def dataset_summary():
    return success_response({'summary': dataset_service.summary()})


@dataset_bp.route('/dataset/features', methods=['GET'])
def dataset_features():
    return success_response({'features': dataset_service.features()})


@dataset_bp.route('/dataset/statistics', methods=['GET'])
def dataset_statistics():
    return success_response({'statistics': dataset_service.statistics()})


@dataset_bp.route('/dataset/search', methods=['GET'])
def dataset_search():
    query = request.args.get('q', '')
    if not query:
        return error_response('Query parameter q is required.', 400)
    return success_response({'results': dataset_service.search(query)})
