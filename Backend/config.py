import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
MODELS_DIR = PROJECT_ROOT / 'models'
DATASET_PATH = PROJECT_ROOT / 'AE FINAL.csv'
KNOWLEDGE_DIR = PROJECT_ROOT / 'Knowledge'
DOCS_DIR = PROJECT_ROOT / 'docs'

FLASK_ENV = os.getenv('FLASK_ENV', 'development')
PORT = int(os.getenv('PORT', '5000'))
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
OPENROUTER_MODEL = os.getenv('OPENROUTER_MODEL', 'openrouter/auto')

CORS_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']
