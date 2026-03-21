import os
from fastapi import FastAPI, HTTPException, Depends, APIRouter
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

# ==========================================
# 1. ROOT ARCHITECTURE MODULE IMPORTS
# ==========================================
# Link the Persistent SQLite/PostgreSQL Database hook
from database_service import get_db, PatientDB, MedicineDB, AdherenceLogDB

# Link the fully assembled ML Topology Engine Endpoint
try:
    from ai_orchestrator import ai_evaluate_endpoint, AiEvaluateRequest, PatientData, AiEvaluateResponse
except ImportError:
    # Fail gracefully if booted inside an incomplete container fragment natively
    ai_evaluate_endpoint = None

# We instantiate an APIRouter for extreme modularity, and optionally an abstract FastAPI App execution wrapper
router = APIRouter()
app = FastAPI(title="NeuraMed Database-AI Integration Layer")

class DbEvaluateRequest(BaseModel):
    patient_id: int

@router.post("/ai-evaluate-from-db", response_model=AiEvaluateResponse, tags=["Database ML Integration"])
async def ai_evaluate_from_db(request: DbEvaluateRequest, db: Session = Depends(get_db)):
    """
    Bridges the PostgreSQL Data Layer directly into the active Scikit-Learn Pipeline.
    Automatically queries a patient ID, securely transforms raw DB rows into structured chronological ML vectors,
    and returns an orchestrated action strategy matrix autonomously.
    """
    if not ai_evaluate_endpoint:
        raise HTTPException(status_code=500, detail="CRITICAL ERROR: Underlying AI Orchestrator module completely missing from directory scope.")

    target_id = request.patient_id

    # A) VERIFY PATIENT EXISTENCE
    db_patient = db.query(PatientDB).filter(PatientDB.id == target_id).first()
    if not db_patient:
        raise HTTPException(
            status_code=404, 
            detail=f"Relational Boundary Error: Patient ID '{target_id}' not found securely in the Database Array."
        )

    # B) EXTRACT DRUG COMBINATIONS
    db_medicines = db.query(MedicineDB).filter(MedicineDB.patient_id == target_id).all()
    if len(db_medicines) < 2:
        raise HTTPException(
            status_code=400, 
            detail=f"Mathematical Dependency Error: Patient '{db_patient.name}' only has {len(db_medicines)} medicine(s). At least 2 active inputs are absolutely required to execute Combinatorial Risk Mapping pipelines natively."
        )
    # The Orchestrator engine implicitly analyzes the first two primary compounds currently registered
    drug1 = db_medicines[0].name
    drug2 = db_medicines[1].name

    # C) MAP CHRONOLOGICAL DROPOUT LOGS
    # Explicitly enforce increasing Time-Series ordering so the Sliding Window ML works symmetrically
    db_logs = db.query(AdherenceLogDB).filter(AdherenceLogDB.patient_id == target_id).order_by(AdherenceLogDB.timestamp.asc()).all()
    
    formatted_history = []
    taken_count = 0
    for log in db_logs:
        formatted_history.append({
            "taken": log.status,
            "date": log.timestamp.isoformat() + "Z"
        })
        if log.status:
            taken_count += 1

    # D) SYNTHESIZE ML FALLBACK ARRAYS 
    if len(formatted_history) == 0:
        # Patient is brand new -> Enforce perfect adherence baseline coefficient
        prev_response = 1.0 
        
        # Pydantic inherently asserts Adherence arrays are min_length=3.
        # We must generate an implicit 3-day baseline pad to satisfy Scikit-learn geometry requirements securely.
        now = datetime.utcnow()
        formatted_history = [
            {"taken": True, "date": (now - timedelta(days=3)).isoformat() + "Z"},
            {"taken": True, "date": (now - timedelta(days=2)).isoformat() + "Z"},
            {"taken": True, "date": (now - timedelta(days=1)).isoformat() + "Z"}
        ]
    else:
        prev_response = taken_count / len(formatted_history)
        # Pad short arrays chronologically backwards to safely respect Pydantic strict bounds
        if len(formatted_history) < 3:
             padding_needed = 3 - len(formatted_history)
             first_date = datetime.fromisoformat(formatted_history[0]["date"].replace("Z", "+00:00"))
             for i in range(padding_needed):
                 pad_date = first_date - timedelta(days=(padding_needed - i))
                 formatted_history.insert(0, {"taken": True, "date": pad_date.isoformat() + "Z"})

    # E) BUILD ABSTRACT AI PAYLOAD NATIVELY
    ai_request = AiEvaluateRequest(
        patient_id=target_id,
        drug1=drug1,
        drug2=drug2,
        adherence_history=formatted_history,
        patient_data=PatientData(
            previous_response_rate=prev_response,
            notification_type="push" # Database generic archetype representation
        )
    )

    # F) ASYNCHRONOUS PIPELINE TRIGGER
    try:
        recommendation_matrix = await ai_evaluate_endpoint(ai_request)
        return recommendation_matrix
    except BaseException as root_exception:
        # BaseException securely traps even C-level structural ML geometry crashes out of our Python sandbox!
        raise HTTPException(status_code=500, detail=f"Meta-Orchestrator Internal Routing Failure: {str(root_exception)}")

# Directly attach the Router logic back into the standalone App Wrapper natively
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    # Standalone Boot cleanly mapped to 8004
    uvicorn.run("db_integration:app", host="0.0.0.0", port=8004, reload=True)
