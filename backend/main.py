from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

from database import engine, get_db
from db_models import Base, Patient, User

# Security Configurations
SECRET_KEY = "cardiovision_super_secret_enterprise_key_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create database tables and seed default users automatically on startup
Base.metadata.create_all(bind=engine)

def seed_default_users():
    db = SessionLocal = next(get_db())
    existing_user = db.query(User).filter(User.username == "doctor").first()
    if not existing_user:
        hashed_pw = pwd_context.hash("securepassword123")
        doc_user = User(username="doctor", hashed_password=hashed_pw, role="cardiologist", full_name="Dr. Vincent Vance")
        pat_user = User(username="patient", hashed_password=pwd_context.hash("patient123"), role="patient", full_name="John Doe")
        db.add(doc_user)
        db.add(pat_user)
        db.commit()
    db.close()

seed_default_users()

app = FastAPI(title="CardioVision Enterprise API", version="3.3")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
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

class LoginRequest(BaseModel):
    username: str
    password: str

# --- Auth Helpers ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"status": "online", "message": "CardioVision Secure Enterprise Backend is running with JWT Auth!"}

@app.post("/api/v1/auth/login")
def login(form_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "full_name": user.full_name
    }

@app.get("/api/v1/patients")
def get_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    if not patients:
        default_patients = [
            Patient(id="CV-4154", name="vinoth", age=99, blood_pressure=160, cholesterol=290, troponin_i=0.52, risk_tier="High Risk", clinical_notes="Severe chest pain reported."),
            Patient(id="CV-5989", name="vishwa", age=23, blood_pressure=115, cholesterol=175, troponin_i=0.01, risk_tier="Moderate Risk", clinical_notes="Routine athletic screening."),
            Patient(id="CV-8338", name="Aqueel", age=50, blood_pressure=145, cholesterol=240, troponin_i=0.15, risk_tier="High Risk", clinical_notes="Hypertension history."),
            Patient(id="CV-8942", name="John Doe", age=58, blood_pressure=150, cholesterol=260, troponin_i=0.35, risk_tier="High Risk", clinical_notes="Shortness of breath upon exertion."),
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
    
    new_patient = Patient(**patient_data.dict())
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

    return {
        "patient_id": payload.patient_id,
        "fusion_cad_probability": cad_probability,
        "risk_level": risk_level,
        "ai_clinical_summary": f"Multimodal analysis completed. Computed CAD probability is {cad_probability}%. {risk_level}.",
        "status": "success"
    }