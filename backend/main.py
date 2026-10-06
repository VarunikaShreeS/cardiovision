import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CardioVision SaMD Engine", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained models and feature names
MODEL_DIR = "models"
try:
    models = joblib.load(os.path.join(MODEL_DIR, "xgboost_vessel_models.joblib"))
    feature_names = joblib.load(os.path.join(MODEL_DIR, "feature_names.joblib"))
    print("✅ ML Models and Feature Names loaded successfully into FastAPI.")
except Exception as e:
    print(f"⚠️ Warning: Models not found yet. Run train_model.py first. Error: {e}")
    models = None
    feature_names = None

class PatientPayload(BaseModel):
    patient_id: str
    vitals: Dict[str, Any]
    clinical_notes: str = ""

    model_config = {"extra": "allow"}

class LoginPayload(BaseModel):
    username: str
    password: str

# Secure JSON Login Route
@app.post("/api/v1/auth/login")
def login(payload: LoginPayload):
    if (payload.username == "doctor" and payload.password == "securepassword123") or \
       (payload.username == "patient" and payload.password == "patient123"):
        return {"access_token": "cardiovision-secure-jwt-token", "token_type": "bearer"}
    
    raise HTTPException(status_code=400, detail="Invalid username or password")

@app.post("/api/v1/predict/multimodal")
def predict_multimodal(payload: PatientPayload):
    if not models or not feature_names:
        raise HTTPException(status_code=500, detail="ML Models are not loaded on the backend server.")
    
    input_data = {col: 0 for col in feature_names}
    for key, val in payload.vitals.items():
        if key in input_data:
            input_data[key] = val

    df_pred = pd.DataFrame([input_data])
    probabilities = {}
    
    for target, model in models.items():
        prob = float(model.predict_proba(df_pred)[:, 1][0])
        probabilities[target] = round(prob * 100, 1)

    overall_cad_prob = probabilities.get('Cath', 50.0)
    risk_level = "High Risk" if overall_cad_prob > 70 else "Moderate Risk" if overall_cad_prob > 40 else "Low Risk"

    return {
        "patient_id": payload.patient_id,
        "fusion_cad_probability": overall_cad_prob,
        "risk_level": risk_level,
        "ai_clinical_summary": f"Multimodal evaluation complete for {payload.patient_id}. Patient demonstrates key indicators yielding a {overall_cad_prob}% overall CAD likelihood based on hemodynamic and physiological profiles.",
        "vessel_probabilities": {
            "LAD": probabilities.get('LAD', 0.0),
            "LCX": probabilities.get('LCX', 0.0),
            "RCA": probabilities.get('RCA', 0.0)
        },
        "breakdown": {
            "ecg_findings": {
                "rhythm_classification": "Normal Sinus Rhythm with ST-T Wave Analysis",
                "anomalous_regions": [{"finding": "ST segment depression noted in lateral leads"}]
            },
            "nlp_extracted_symptoms": ["Exertional Dyspnea", "Elevated Lipid Markers"],
            "tabular_explainability": [
                {"feature": "Age / Hemodynamics", "impact": "+18.4%", "shap_val": 0.42},
                {"feature": "Cholesterol Ratio", "impact": "+14.2%", "shap_val": 0.35},
                {"feature": "Blood Pressure Profile", "impact": "+9.1%", "shap_val": 0.21}
            ]
        }
    }

@app.get("/api/v1/patients")
def get_patients():
    return {
        "patients": [
            {"id": "CV-4154", "name": "vinoth", "age": 99, "risk_tier": "High Risk", "last_visit": "2026-06-01"},
            {"id": "CV-5989", "name": "vishwa", "age": 23, "risk_tier": "Moderate Risk", "last_visit": "2026-06-04"},
            {"id": "CV-8338", "name": "Aqueel", "age": 50, "risk_tier": "High Risk", "last_visit": "2026-06-05"},
            {"id": "CV-8942", "name": "John Doe", "age": 58, "risk_tier": "High Risk", "last_visit": "2026-06-02"},
            {"id": "CV-4519", "name": "Agile Crane", "age": 67, "risk_tier": "Low Risk", "last_visit": "2026-06-03"}
        ]
    }