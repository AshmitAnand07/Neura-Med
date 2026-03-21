import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from datetime import datetime

# ==========================================
# 1. DATABASE SETUP & CONNECTIVITY
# ==========================================
# Captures standard PostgreSQL environments (e.g. from Vercel/DigitalOcean) 
# Provides a graceful SQLite fallback to ensure it remains 100% "runnable" natively 
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./neuramed_persistent.db")

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==========================================
# 2. SQLALCHEMY ORM MODELS (TABLES)
# ==========================================
class PatientDB(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    age = Column(Integer, nullable=False)
    
    # Strict relational integrity
    medicines = relationship("MedicineDB", back_populates="patient", cascade="all, delete-orphan")
    adherence_logs = relationship("AdherenceLogDB", back_populates="patient", cascade="all, delete-orphan")

class MedicineDB(Base):
    __tablename__ = "medicines"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    dosage = Column(String, nullable=False)
    
    patient = relationship("PatientDB", back_populates="medicines")
    adherence_logs = relationship("AdherenceLogDB", back_populates="medicine", cascade="all, delete-orphan")

class AdherenceLogDB(Base):
    __tablename__ = "adherence_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(Boolean, nullable=False) # True = Dose Completed, False = Dropout
    
    patient = relationship("PatientDB", back_populates="adherence_logs")
    medicine = relationship("MedicineDB", back_populates="adherence_logs")

class ReminderDB(Base):
    __tablename__ = "reminders"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medicine_name = Column(String, nullable=False)
    time = Column(String, nullable=False) # e.g. "08:00"
    dosage = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    patient = relationship("PatientDB")

# ==========================================
# 3. PYDANTIC DATA VALIDATION (I/O BOUNDARIES)
# ==========================================
class PatientCreate(BaseModel):
    name: str = Field(..., min_length=2, description="Patient's full legal name")
    age: int = Field(..., gt=0, lt=130, description="Demographic age filter")

class PatientOut(PatientCreate):
    id: int
    class Config:
        from_attributes = True

class MedicineCreate(BaseModel):
    patient_id: int
    name: str
    dosage: str
    frequency: Optional[str] = None
    timing: Optional[str] = None
    status: Optional[str] = "active"

class BulkMedicineCreate(BaseModel):
    patient_id: int
    medicines: List[Dict[str, Any]] # List of medicine data

class MedicineOut(MedicineCreate):
    id: int
    class Config:
        from_attributes = True

class ReminderCreate(BaseModel):
    patient_id: int
    medicine_name: str
    time: str
    dosage: Optional[str] = None

class ReminderOut(ReminderCreate):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

class AdherenceLogCreate(BaseModel):
    patient_id: int
    medicine_id: int
    status: bool = Field(..., description="True if safely consumed, False if critically missed")

class AdherenceLogOut(AdherenceLogCreate):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True

# ==========================================
# 4. EXPORTED UTILS (No standalone app)
# ==========================================
def get_db():
    """Generator resolving raw DB sessions and safely closing them post-HTTP loop."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Compiles SQL Graph into Table Schemas immediately on execution natively
Base.metadata.create_all(bind=engine)
