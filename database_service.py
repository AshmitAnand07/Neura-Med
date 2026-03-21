import os
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
    patient_id: int = Field(..., description="Target parent patient identity")
    name: str = Field(..., min_length=1, description="Active compound identifier")
    dosage: str = Field(..., min_length=1, description="Milligram / frequency metric string")

class MedicineOut(MedicineCreate):
    id: int
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
# 4. FASTAPI CRUD COMPONENT LAYER
# ==========================================
app = FastAPI(
    title="NeuraMed Persistent Storage Engine",
    description="Explicitly partitioned database access layer utilizing SQLAlchemy. Does not interfere with AI/ML logic bindings natively."
)

def get_db():
    """Generator resolving raw DB sessions and safely closing them post-HTTP loop."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Compiles SQL Graph into Table Schemas immediately on execution natively
Base.metadata.create_all(bind=engine)

@app.post("/patients/", response_model=PatientOut, tags=["Users"])
def map_create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    """Stamps a new user firmly into the Database Graph."""
    db_patient = PatientDB(name=patient.name, age=patient.age)
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.post("/medicines/", response_model=MedicineOut, tags=["Prescriptions"])
def map_add_medicine(medicine: MedicineCreate, db: Session = Depends(get_db)):
    """Secures a new medication directly mapping onto a valid Patient ID parent."""
    # Enforce safe foreign relationships globally
    db_patient = db.query(PatientDB).filter(PatientDB.id == medicine.patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Relational Error: Patient ID actively missing.")
        
    db_medicine = MedicineDB(**medicine.model_dump())
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine

@app.post("/adherence/", response_model=AdherenceLogOut, tags=["Telemetry"])
def map_log_adherence(log: AdherenceLogCreate, db: Session = Depends(get_db)):
    """Submits timestamped boolean dose telemetry linking a drug to a specific patient context natively."""
    # Ensure nested relational mapping holds true
    db_medicine = db.query(MedicineDB).filter(MedicineDB.id == log.medicine_id, MedicineDB.patient_id == log.patient_id).first()
    if not db_medicine:
        raise HTTPException(status_code=404, detail="Relational Error: Medicine ID directly conflicts with registered Patient associations.")
        
    db_log = AdherenceLogDB(**log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

if __name__ == "__main__":
    import uvicorn
    # Mapped natively to alternate isolation port 8003
    uvicorn.run("database_service:app", host="0.0.0.0", port=8003, reload=True)
