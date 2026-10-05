# 🫀 CardioVision AI
**Enterprise Multimodal Cardiovascular Decision Support System**

![Status](https://img.shields.io/badge/Status-Enterprise_Blueprint_Phase-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js&logoColor=white)
![Python](https://img.shields.io/badge/ML_Engine-Python_3.10-3776AB?logo=python&logoColor=white)

CardioVision is a clinical-grade platform that helps cardiologists assess Coronary Artery Disease (CAD) risk using a **multimodal AI architecture**. By fusing clinical vitals, 12-lead ECG signals, and unstructured EHR clinical notes, CardioVision provides a unified, highly accurate risk score backed by transparent AI explainability (SHAP).

---

## ✨ Core Platform Features

### 1. Multimodal AI Fusion Engine
* **Tabular Vitals Analysis:** Processes blood pressure, cholesterol, troponin, and demographic data using XGBoost.
* **Diagnostic ECG Processing:** 1D CNN architecture for automated waveform analysis, rhythm classification, and anomaly detection.
* **Clinical NLP:** Extracts high-risk cardiovascular symptoms from unstructured doctor's notes (EHR) using clinical language models (BioBERT).

### 2. Clinical Trust & Explainability
* **SHAP Value Breakdowns:** Visualizes exactly which vitals (e.g., elevated Troponin-I) contributed most heavily to the patient's risk score.
* **Automated AI Synthesis:** Generates a human-readable clinical summary synthesizing all three data modalities for immediate doctor review.

### 3. Enterprise Triage Dashboard
* **Patient Roster Management:** Live triage tracking categorizing patients into High, Moderate, and Low risk tiers.
* **Multimodal Profile Viewer:** A comprehensive, single-pane-of-glass dashboard displaying fused risk probabilities and modality-specific breakdowns.

---

## 🏗️ System Architecture
CardioVision utilizes a fully decoupled, modern web architecture:
* **Presentation Layer:** Next.js (React), TypeScript, and Tailwind CSS.
* **API Layer:** FastAPI (Python) serving RESTful endpoints for patient data and model inference.
* **Machine Learning Layer:** Scikit-learn, XGBoost, and PyTorch (for upcoming deep learning integration).

---

## 💻 Local Development Setup

To run CardioVision locally, you must run both the backend API and the frontend client simultaneously.

### 1. Start the AI Backend (FastAPI)
Open a terminal in the root directory:
```bash
# Activate your virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate # Mac/Linux

# Start the server
uvicorn backend.main:app --reload