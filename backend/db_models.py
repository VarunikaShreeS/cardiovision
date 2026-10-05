from sqlalchemy import Column, Integer, String, Float
from database import Base

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