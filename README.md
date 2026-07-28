# 💊 PharmaVigil AI
### 🧠 AI-Powered Pharmacovigilance Platform

<p align="center">

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-LLM-orange?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

</p>

---

# 📖 Overview

**PharmaVigil AI** is an AI-powered pharmacovigilance platform designed to simplify adverse drug event analysis using Machine Learning, Explainable AI, Retrieval-Augmented Generation (RAG), and Large Language Models.

The platform predicts:

- ✅ Adverse Event Classification
- ✅ Causality Assessment
- ✅ Severity Prediction
- ✅ Explainable AI using SHAP
- ✅ Interactive Visualizations
- ✅ AI Chatbot with Conversation Memory

---

# ✨ Features

## 🤖 AI Chatbot

- 💬 Persistent conversation history
- 🧠 Context-aware follow-up questions
- 📚 RAG-based knowledge retrieval
- 🚫 Domain-restricted responses
- ⚡ Powered by OpenRouter LLM
- 💾 Supabase conversation storage

---

## 🩺 Machine Learning

- Classification Model
- Causality Prediction
- Severity Regression
- Explainable AI (SHAP)
- Model Metrics
- Prediction Confidence

---

## 📊 Visualization Dashboard

- Feature Importance
- SHAP Summary Plot
- Confusion Matrix
- ROC Curve
- Precision-Recall Curve
- Regression Metrics
- Interactive Charts

---

## 📂 Knowledge Base

Supports dynamic loading of:

```
Knowledge/

docs/

Classification.txt

Regression.txt

Causality.txt

SHAP.txt
```

New files are automatically available without retraining.

---

# 🏗 Project Architecture

```
                   User
                     │
                     ▼
            React + Vite Frontend
                     │
                     ▼
              Flask REST API
                     │
       ┌─────────────┼──────────────┐
       ▼             ▼              ▼
 ML Models      RAG Retriever    Chat History
       │             │              │
       ▼             ▼              ▼
 Classification  docs/        Supabase
 Causality      Knowledge/      PostgreSQL
 Regression
       │
       ▼
 OpenRouter LLM
       │
       ▼
 AI Response
```

---

# 🛠 Tech Stack

| Category | Technology |
|------------|------------|
| 🎨 Frontend | React + Vite |
| ⚙ Backend | Flask |
| 🧠 Machine Learning | Scikit-learn |
| 📈 Explainability | SHAP |
| 💬 LLM | OpenRouter |
| 📚 RAG | Custom Document Retrieval |
| 🗄 Database | Supabase PostgreSQL |
| 🎨 Styling | Tailwind CSS |
| 📊 Charts | Plotly / Matplotlib |
| 💾 Model Storage | Joblib |

---

# 📁 Project Structure

```
PharmaVigilAI/

│
├── Backend/
│   ├── app.py
│   ├── routes/
│   ├── services/
│   ├── chatbot/
│   ├── models/
│   ├── utils/
│   └── database/
│
├── Frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── services/
│
├── Knowledge/
│
├── docs/
│
├── models/
│
├── notebooks/
│
└── README.md
```

---

# 🧠 Machine Learning Pipeline

```
Dataset

↓

Preprocessing

↓

Feature Engineering

↓

Training

↓

Evaluation

↓

Model Export

↓

Flask API

↓

Prediction

↓

SHAP Explanation
```

---

# 💬 AI Chatbot Flow

```
User Question

↓

Conversation History

↓

Intent Detection

↓

Domain Guard

↓

Knowledge Retrieval

↓

Prompt Builder

↓

OpenRouter

↓

Response

↓

Store Conversation
```

---

# 🗄 Database

Supabase stores:

- Conversations
- Messages
- Conversation Metadata
- Chat History

---

## Conversation Table

| Column | Type |
|---------|------|
| id | UUID |
| title | TEXT |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| last_message | TEXT |
| message_count | INTEGER |

---

## Messages Table

| Column | Type |
|---------|------|
| id | UUID |
| conversation_id | UUID |
| role | TEXT |
| content | TEXT |
| created_at | TIMESTAMP |
| metadata | JSONB |

---

# 📚 Knowledge Base

Supported file formats

- TXT
- Markdown

Automatically indexed.

No retraining required.

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/PharmaVigilAI.git

cd PharmaVigilAI
```

---

## Backend

```bash
cd Backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

---

## Frontend

```bash
cd Frontend

npm install

npm run dev
```

---

# ⚙ Environment Variables

Create

```
Backend/.env
```

```env
SUPABASE_URL=

SUPABASE_ANON_KEY=

OPENROUTER_API_KEY=

OPENROUTER_MODEL=openrouter/auto
```

---

# ▶ Run Backend

```bash
python app.py
```

---

# ▶ Run Frontend

```bash
npm run dev
```

---

# 🌐 Application Modules

✅ Dashboard

✅ Prediction

✅ Visualization

✅ SHAP

✅ AI Chatbot

✅ Conversation History

✅ Knowledge Base

---

# 📈 Explainable AI

Supports

- SHAP Summary Plot
- Local Explanation
- Global Feature Importance
- Waterfall Plot
- Force Plot

---

# 🔒 Security

- Environment Variables
- API Key Protection
- Domain Restricted Chatbot
- Secure Supabase Connection

---

# 🎯 Future Enhancements

- 🔐 Authentication
- 👥 Multi-user Support
- 📄 PDF Knowledge Base
- 🔎 Semantic Search
- 🌐 Multilingual Chatbot
- 📊 Advanced Analytics
- ☁ Cloud Deployment

---

# 👨‍💻 Developed By

**Hitesh Kumar S**

B.Tech Computer Science and Engineering

Amrita Vishwa Vidyapeetham

---

# ⭐ Acknowledgements

- Flask
- React
- Supabase
- OpenRouter
- SHAP
- Scikit-learn
- Tailwind CSS
- Plotly

---

# 📜 License

This project is developed for academic and research purposes.

---

<p align="center">

### 💙 If you found this project useful, don't forget to ⭐ the repository!

**Made with ❤️ using AI, Machine Learning, and Explainable AI**

</p>