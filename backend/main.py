from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import datetime

app = FastAPI(
    title="CardioVision Enterprise API",
    description="Multimodal Cardiovascular Decision Support System - Blueprint Phase",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# DATA SCHEMAS (The Blueprint)
# ==========================================
class Vitals(BaseModel):
    age: int
    blood_pressure: int
    cholesterol: int
    troponin_i: float
    heart_rate: int

class MultimodalInput(BaseModel):
    patient_id: str
    vitals: Vitals
    clinical_notes: str
    ecg_waveform_id: Optional[str] = None

# ==========================================
# ENDPOINTS
# ==========================================

@app.get("/")
def home():
    return {"status": "CardioVision Enterprise Blueprint API is live! 🚀"}

@app.get("/api/v1/patients")
def get_patient_roster():
    """Returns a mock list of patients for the triage dashboard."""
    return {
        "patients": [
            {"id": "CV-8942", "name": "John Doe", "age": 58, "last_visit": "2026-10-01", "risk_tier": "High Risk", "pending_review": True},
            {"id": "CV-2109", "name": "Sarah Jenkins", "age": 42, "last_visit": "2026-10-04", "risk_tier": "Low Risk", "pending_review": False},
            {"id": "CV-5531", "name": "Michael Chang", "age": 65, "last_visit": "2026-10-05", "risk_tier": "Moderate Risk", "pending_review": True},
        ]
    }

@app.post("/api/v1/predict/multimodal")
def predict_multimodal(data: MultimodalInput):
    """
    The core Multimodal Fusion mock endpoint. 
    Simulates processing Vitals (XGBoost), ECG Signals (1D CNN), and Clinical Notes (NLP).
    """
    # 1. Mock Vitals Analysis (Simulating Tabular XGBoost + SHAP)
    tabular_risk_score = 0.82
    shap_factors = [
        {"feature": "Troponin-I", "value": data.vitals.troponin_i, "impact": "High Increase", "shap_val": 0.45},
        {"feature": "Blood Pressure", "value": data.vitals.blood_pressure, "impact": "Moderate Increase", "shap_val": 0.21},
    ]

    # 2. Mock ECG Signal Analysis (Simulating 1D CNN / Transformer)
    ecg_analysis = {
        "rhythm_classification": "Sinus Tachycardia with ST Elevation",
        "confidence_score": 0.94,
        "anomalous_regions": [{"lead": "V4", "start_ms": 400, "end_ms": 600, "finding": "ST-Elevation"}]
    }

    # 3. Mock Clinical Text NLP (Simulating BioBERT / LLM Extraction)
    extracted_symptoms = ["exertional chest pain", "shortness of breath"] if len(data.clinical_notes) > 10 else []
    
    # 4. Mock Fusion Logic (Combining all three modalities)
    fusion_probability = 88.5  # Synthesized final CAD risk %
    
    # 5. Automated AI Clinical Summary
    ai_summary = f"Patient {data.patient_id} exhibits high fusion risk ({fusion_probability}%). Elevated Troponin ({data.vitals.troponin_i} ng/mL) and ECG ST-Elevation strongly suggest acute myocardial ischemia. Immediate cardiology consult recommended."

    return {
        "patient_id": data.patient_id,
        "timestamp": datetime.datetime.now().isoformat(),
        "fusion_cad_probability": fusion_probability,
        "risk_level": "Critical / High Risk",
        "breakdown": {
            "tabular_explainability": shap_factors,
            "ecg_findings": ecg_analysis,
            "nlp_extracted_symptoms": extracted_symptoms
        },
        "ai_clinical_summary": ai_summary
    }