from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(
    title="CardioVision API",
    description="Multimodal AI-Powered Cardiovascular Decision Support System",
    version="1.0.0"
)

# Enable CORS so your frontend can talk to this backend smoothly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to saved model and features
MODEL_PATH = Path("backend/models/xgboost_cad_model.joblib")
FEATURES_PATH = Path("backend/models/feature_names.joblib")

# Load model and feature names on startup
try:
    model = joblib.load(MODEL_PATH)
    feature_names = joblib.load(FEATURES_PATH)
    print("✓ Model and features loaded successfully into FastAPI!")
except Exception as e:
    print(f"❌ Error loading model files: {e}")

# Define the data structure for incoming patient requests
class PatientData(BaseModel):
    features: dict

@app.get("/")
def home():
    return {"status": "CardioVision Backend is live and running! 🚀"}

@app.post("/predict")
def predict_cardio_risk(data: PatientData):
    try:
        # Convert incoming dictionary to DataFrame
        input_df = pd.DataFrame([data.features])
        
        # Ensure all training features are present (fill missing ones with 0)
        for col in feature_names:
            if col not in input_df.columns:
                input_df[col] = 0
                
        # Reorder columns to match the exact training layout
        input_df = input_df[feature_names]
        
        # Run prediction and probability score
        prediction = int(model.predict(input_df)[0])
        probability = float(model.predict_proba(input_df)[0][1]) # Probability of CAD
        
        risk_level = "High Risk" if probability > 0.5 else "Low Risk"
        
        return {
            "prediction": prediction,
            "cad_probability": round(probability * 100, 2),
            "risk_level": risk_level,
            "message": f"Patient assessed as {risk_level} with {round(probability * 100, 2)}% CAD probability."
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))