import logging
from pathlib import Path

from flask import Flask
from flask_cors import CORS

from config import CORS_ORIGINS, FLASK_ENV, PORT
from routes.prediction import prediction_bp
from routes.metrics import metrics_bp
from routes.dataset import dataset_bp
from routes.dashboard import dashboard_bp
from routes.chatbot import chatbot_bp
from routes.shap import shap_bp
from routes.visualization import visualization_bp
from routes.live_shap import live_shap_bp


logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s %(message)s')

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
CORS(app, origins=CORS_ORIGINS, supports_credentials=True)

app.register_blueprint(prediction_bp, url_prefix='/api')
app.register_blueprint(metrics_bp, url_prefix='/api')
app.register_blueprint(dataset_bp, url_prefix='/api')
app.register_blueprint(dashboard_bp, url_prefix='/api')
app.register_blueprint(chatbot_bp, url_prefix='/api')
app.register_blueprint(shap_bp, url_prefix='/api')
app.register_blueprint(visualization_bp, url_prefix='/api')
app.register_blueprint(live_shap_bp, url_prefix='/api')


@app.errorhandler(404)
def not_found(_error):
    return {'success': False, 'error': 'Resource not found'}, 404


@app.errorhandler(500)
def server_error(_error):
    return {'success': False, 'error': 'Internal server error'}, 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=(FLASK_ENV == 'development'))
