# PharmaVigil Flask Backend

This backend exposes Flask APIs for the trained pharmacovigilance models and dataset in the workspace.

## Installation

```bash
cd Backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

## Running the backend

```bash
cd Backend
.\venv\Scripts\activate
python app.py
```

## Running the frontend

```bash
cd PharmaVigil-main
npm install
npm run dev
```

## API overview

- POST /api/classification/predict
- POST /api/causality/predict
- POST /api/regression/predict
- GET /api/metrics/classification
- GET /api/metrics/causality
- GET /api/metrics/regression
- GET /api/dashboard
- GET /api/dataset/summary
- GET /api/dataset/features
- GET /api/dataset/statistics
- GET /api/dataset/search
- POST /api/chatbot
