from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "cardiologist" or "patient"
    full_name = Column(String, nullable=True)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    blood_pressure = Column(Float)
    cholesterol = Column(Float)
    troponin_i = Column(Float)
    risk_tier = Column(String)
    clinical_notes = Column(String)
    photo = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)