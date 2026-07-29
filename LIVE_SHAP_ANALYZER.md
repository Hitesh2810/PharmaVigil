# Live SHAP Analyzer

## Overview
The Live SHAP Analyzer is a new, modular feature for the PharmaVigil AI application. It allows users to upload a CSV or Excel dataset and generate SHAP-based explainability outputs using the already trained models and saved SHAP explainers without retraining.

## Architecture
- Backend: Flask routes and services under Backend/routes/live_shap.py and Backend/services/live_shap_service.py
- Frontend: React page at PharmaVigil-main/src/pages/LiveShapAnalyzer.tsx
- Shared utilities: Backend/utils/shap_utils.py

## API
- POST /api/live-shap/upload
- POST /api/live-shap/generate
- GET /api/live-shap/report

## Flow
1. Upload CSV/XLSX dataset
2. Validate and inspect the file
3. Select a model (classification, causality, regression)
4. Generate SHAP plots and prediction table

## Supported datasets
- CSV
- Excel (.xlsx)

## Troubleshooting
- Ensure the file is not empty
- Ensure the file has valid column names
- Confirm the model artifacts exist in the models folder
