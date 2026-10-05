from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import shap
from pathlib import Path

app = FastAPI(
    title="CardioVision API",
    description="Multimodal AI-Powered Cardiovascular Decision Support System with SHAP Explainability",
    version="2.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
MODEL_PATH = Path("backend/models/xgboost_cad_model.joblib")
FEATURES_PATH = Path("backend/models/feature_names.joblib")
DATA_PATH = Path("data/raw/z_alizadeh_sani.csv")

# Initialize global variables
model = None
feature_names = []
explainer = None

try:
    model = joblib.load(MODEL_PATH)
    feature_names = joblib.load(FEATURES_PATH)
    
    # Load raw data to initialize the SHAP TreeExplainer baseline safely
    if DATA_PATH.exists():
        df_raw = pd.read_csv(DATA_PATH)
        df_raw.columns = df_raw.columns.str.strip()
        if 'Cath' in df_raw.columns:
            df_raw['Target'] = df_raw['Cath'].map({'CAD': 1, 'Normal': 0})
            drop_cols = [c for c in ['LAD', 'LCX', 'RCA', 'Cath', 'Target'] if c in df_raw.columns]
            X_bg = pd.get_dummies(df_raw.drop(columns=drop_cols))
            X_bg = X_bg.reindex(columns=feature_names, fill_value=0).astype(float)
            explainer = shap.TreeExplainer(model, X_bg.sample(min(50, len(X_bg)), random_state=42))
            print("✓ SHAP TreeExplainer initialized successfully!")
    else:
        print("⚠️ Data path not found, running without SHAP background explainer.")
        
    print("✓ Model and features loaded successfully into FastAPI!")
except Exception as e:
    print(f"❌ Error during startup initialization: {e}")

class PatientData(BaseModel):
    features: dict

@app.get("/")
def home():
    return {"status": "CardioVision Backend with SHAP is live and running! 🚀"}

@app.post("/predict")
def predict_cardio_risk(data: PatientData):
    try:
        global model, feature_names, explainer
        if model is None or not feature_names:
            raise HTTPException(status_code=500, detail="Model not loaded properly on startup.")

        # Convert input dictionary to DataFrame & coerce to float
        input_df = pd.DataFrame([data.features])
        
        # Align with training features
        for col in feature_names:
            if col not in input_df.columns:
                input_df[col] = 0
        input_df = input_df[feature_names].astype(float)
        
        # Prediction & Probability
        prediction = int(model.predict(input_df)[0])
        probability = float(model.predict_proba(input_df)[0][1])
        risk_level = "High Risk" if probability > 0.5 else "Low Risk"
        
        # Generate SHAP Explanations
        top_factors = []
        if explainer is not None:
            try:
                shap_values = explainer(input_df)
                vals = shap_values.values
                if len(vals.shape) == 3:
                    feature_vals = vals[0, :, 1]
                else:
                    feature_vals = vals[0]
                    
                impact_df = pd.DataFrame({
                    "feature": feature_names,
                    "shap_value": feature_vals,
                    "user_value": input_df.iloc[0].values
                })
                impact_df['abs_impact'] = impact_df['shap_value'].abs()
                impact_df = impact_df.sort_values(by="abs_impact", ascending=False)
                
                for _, row in impact_df.head(3).iterrows():
                    direction = "increased" if row['shap_value'] > 0 else "decreased"
                    top_factors.append({
                        "feature": row['feature'],
                        "value": row['user_value'],
                        "impact_direction": direction,
                        "shap_score": round(float(row['shap_value']), 4)
                    })
            except Exception as shap_err:
                print(f"SHAP calculation warning: {shap_err}")

        return {
            "prediction": prediction,
            "cad_probability": round(probability * 100, 2),
            "risk_level": risk_level,
            "key_factors": top_factors,
            "message": f"Patient assessed as {risk_level} with {round(probability * 100, 2)}% CAD probability."
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))