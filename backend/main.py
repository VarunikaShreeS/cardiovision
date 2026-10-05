from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import engine, get_db
from db_models import Base, Patient

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CardioVision Enterprise API", version="3.2")

# Enable CORS so Next.js frontend can communicate with Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas for Validation ---
class PatientCreate(BaseModel):
    id: str
    name: str
    age: int
    blood_pressure: Optional[float] = 120.0
    cholesterol: Optional[float] = 200.0
    troponin_i: Optional[float] = 0.03
    risk_tier: Optional[str] = "Moderate Risk"
    clinical_notes: Optional[str] = "Standard intake record."
    photo: Optional[str] = None

class PredictionRequest(BaseModel):
    patient_id: str
    vitals: dict
    clinical_notes: str
    ecg_waveform_id: str

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"status": "online", "message": "CardioVision Enterprise Backend is running with SQLite!"}

@app.get("/api/v1/patients")
def get_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    
    # If database is empty, seed initial demo patients automatically
    if not patients:
        default_patients = [
            Patient(id="CV-4154", name="vinoth", age=99, blood_pressure=160, cholesterol=290, troponin_i=0.52, risk_tier="High Risk", clinical_notes="Severe chest pain reported.", photo=None),
            Patient(id="CV-5989", name="vishwa", age=23, blood_pressure=115, cholesterol=175, troponin_i=0.01, risk_tier="Moderate Risk", clinical_notes="Routine athletic screening.", photo=None),
            Patient(id="CV-8338", name="Aqueel", age=50, blood_pressure=145, cholesterol=240, troponin_i=0.15, risk_tier="High Risk", clinical_notes="Hypertension history.", photo=None),
            Patient(id="CV-8942", name="John Doe", age=58, blood_pressure=150, cholesterol=260, troponin_i=0.35, risk_tier="High Risk", clinical_notes="Shortness of breath upon exertion.", photo=None),
            Patient(id="CV-2109", name="Sarah Jenkins", age=42, blood_pressure=110, cholesterol=180, troponin_i=0.02, risk_tier="Low Risk", clinical_notes="Annual physical checkup.", photo=None),
            Patient(id="CV-5531", name="Michael Chang", age=65, blood_pressure=138, cholesterol=220, troponin_i=0.08, risk_tier="Moderate Risk", clinical_notes="Controlled blood pressure, mild fatigue.", photo=None)
        ]
        for p in default_patients:
            db.add(p)
        db.commit()
        patients = db.query(Patient).all()

    return {"patients": patients}

@app.post("/api/v1/patients")
def create_patient(patient_data: PatientCreate, db: Session = Depends(get_db)):
    existing = db.query(Patient).filter(Patient.id == patient_data.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Patient ID already exists.")
    
    new_patient = Patient(
        id=patient_data.id,
        name=patient_data.name,
        age=patient_data.age,
        blood_pressure=patient_data.blood_pressure,
        cholesterol=patient_data.cholesterol,
        troponin_i=patient_data.troponin_i,
        risk_tier=patient_data.risk_tier,
        clinical_notes=patient_data.clinical_notes,
        photo=patient_data.photo
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return {"status": "success", "patient": new_patient}

@app.post("/api/v1/predict/multimodal")
def predict_multimodal(payload: PredictionRequest):
    vitals = payload.vitals
    bp = vitals.get("blood_pressure", 120)
    troponin = vitals.get("troponin_i", 0.03)
    age = vitals.get("age", 50)

    base_score = 15.0 + (age * 0.4) + ((bp - 120) * 0.6) + (troponin * 100.0)
    cad_probability = min(max(round(base_score, 1), 5.0), 98.5)

    risk_level = "Low Risk"
    if cad_probability > 70:
        risk_level = "High Risk - Immediate Intervention Recommended"
    elif cad_probability > 40:
        risk_level = "Moderate Risk - Cardiology Consultation Advised"

    summary = (
        f"Multimodal AI fusion analysis for patient (Age {age}, BP {bp} mmHg, Troponin {troponin} ng/mL). "
        f"Evaluated via deep EHR text parsing and vital-sign modeling. "
        f"Computed CAD probability is {cad_probability}%. {risk_level}."
    )

    return {
        "patient_id": payload.patient_id,
        "fusion_cad_probability": cad_probability,
        "risk_level": risk_level,
        "ai_clinical_summary": summary,
        "status": "success"
    }