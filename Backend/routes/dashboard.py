from flask import Blueprint

from services.dashboard_service import dashboard_service
from utils.helpers import success_response


dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard', methods=['GET'])
def dashboard():
    return success_response({'dashboard': dashboard_service.dashboard_payload()})
