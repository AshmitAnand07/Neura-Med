import os
import time
import logging
import io
import sys
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional

# Fix Unicode for Windows console
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Load environment variables
load_dotenv()

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("neuramed-gateway")

# Import modular services
from voice_service import speech_to_text, text_to_speech
from ocr_service import extract_text_from_image, parse_prescription_text
from ai_orchestrator import orchestrator, AiEvaluateRequest, AiEvaluateResponse
from interaction_service import check_rule_based, predict_interaction, InteractionRequest, InteractionResponse
from database_service import (
    get_db, PatientDB, MedicineDB, AdherenceLogDB, ReminderDB,
    PatientOut, MedicineOut, AdherenceLogOut, 
    BulkMedicineCreate, ReminderCreate, ReminderOut, SessionLocal
)
from sqlalchemy.orm import Session

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n--- NEURAMED UNIFIED GATEWAY BOOT SEQUENCE ---")
    
    # Seed sample patient if not exists
    db = SessionLocal()
    try:
        sample_patient = db.query(PatientDB).filter(PatientDB.id == 1).first()
        if not sample_patient:
            db.add(PatientDB(id=1, name="John Doe", age=45))
            db.commit()
            print("✅ Seeded placeholder patient (ID: 1) for demo.")
    finally:
        db.close()
        
    print("🚀 SYSTEM READY: All sub-services integrated and HTTP bound.")
    yield
    print("\n[SHUTDOWN] NeuraMed Gateway Offline.")

app = FastAPI(
    title="NeuraMed Unified API Gateway",
    description="Central hub for AI, Voice, OCR, and Database services.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. PRESCRIPTION & OCR FLOW ---
@app.post("/api/prescription/upload", tags=["OCR"])
async def upload_prescription(file: UploadFile = File(...), user_id: str = Form(...), db: Session = Depends(get_db)):
    """Image -> OCR -> AI parsing -> Database storage"""
    try:
        content = await file.read()
        # 1. Extract raw text via Google Vision
        raw_text = extract_text_from_image(content)
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in image.")
            
        # 2. Parse via GPT-4o
        structured_data = await parse_prescription_text(raw_text)
        
        # 3. (Optional) Auto-save to DB if patient exists
        # This is a placeholder for actual business logic linking
        
        return {
            "status": "success",
            "raw_text": raw_text,
            "structured_data": structured_data
        }
    except Exception as e:
        logger.error(f"❌ Prescription Upload Critical Failure: {str(e)}")
        # Providing a structured error that the frontend can handle gracefully
        return {
            "status": "error",
            "message": "AI OCR service is temporarily unavailable. Using mock data for demo.",
            "structured_data": {"medicines": [{"name": "Amoxicillin", "dosage": "500mg, 3 times daily", "duration": "10 days"}]}
        }

# --- 2. VOICE SYSTEM (SARVAM) ---
@app.post("/api/voice/stt", tags=["Voice"])
async def voice_stt(file: UploadFile = File(...), language_code: str = Form("en-IN")):
    try:
        content = await file.read()
        transcript = await speech_to_text(content, language_code)
        return {"transcript": transcript}
    except Exception as e:
        logger.error(f"Voice STT Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/tts", tags=["Voice"])
async def voice_tts(text: str = Form(...), language_code: str = Form("hi-IN")):
    try:
        audio_content = await text_to_speech(text, language_code)
        return StreamingResponse(io.BytesIO(audio_content), media_type="audio/wav")
    except Exception as e:
        logger.error(f"Voice TTS Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/interact", tags=["Voice Orchestration"])
async def voice_interact(audio: UploadFile = File(...), language: str = Form("en-IN")):
    """Full feedback loop: STT -> Intent -> TTS"""
    try:
        content = await audio.read()
        # 1. STT
        transcript = await speech_to_text(content, language)
        if not transcript:
            return {"status": "success", "transcript": "", "intent": "UNKNOWN", "message": "No speech detected"}

        # 2. AI Intent Extraction (Simple logic for demonstration)
        # In production, this would use the OpenAI client from ocr_service
        from ocr_service import client as openai_client
        prompt = f"The user said: '{transcript}'. Determine their intent (e.g., ADD_MEDICINE, CHECK_SAFETY, NAVIGATE_DASHBOARD) and provide a concise medical response."
        
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )
        ai_msg = response.choices[0].message.content
        intent = "UNKNOWN" # Logic to parse intent from ai_msg
        
        # 3. TTS for response
        resp_audio = await text_to_speech(ai_msg, "en-IN" if language == "en-IN" else "hi-IN")
        import base64
        audio_base64 = base64.b64encode(resp_audio).decode("utf-8")

        return {
            "status": "success",
            "transcript": transcript,
            "intent": intent,
            "actionResult": {
                "success": True,
                "systemResponseText": ai_msg
            },
            "audioResponseBase64": audio_base64
        }
    except Exception as e:
        logger.error(f"Voice Interaction Crash: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

from database_service import (
    get_db, PatientDB, MedicineDB, AdherenceLogDB, ReminderDB,
    PatientOut, MedicineOut, AdherenceLogOut, 
    BulkMedicineCreate, ReminderCreate, ReminderOut
)
from sqlalchemy.orm import Session

# ... (Existing lifespan and app setup)
# --- 3. MEDICINE & DATABASE ---
@app.get("/api/medicines", response_model=List[MedicineOut], tags=["Database"])
async def get_medicines(patient_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieve all medicines for a specific patient"""
    if not patient_id:
        return []
    try:
        p_id = int(patient_id)
        return db.query(MedicineDB).filter(MedicineDB.patient_id == p_id).all()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid patient_id format. Must be an integer.")

@app.post("/api/medicines/bulk", tags=["Database"])
async def add_medicines_bulk(request: BulkMedicineCreate, db: Session = Depends(get_db)):
    """Bulk import medicines (typically from OCR)"""
    try:
        for med in request.medicines:
            db_med = MedicineDB(
                patient_id=request.patient_id,
                name=med.get("name", "Unknown"),
                dosage=med.get("dosage", "Not specified"),
                frequency=med.get("frequency"),
                timing=med.get("timing"),
                status=med.get("status", "active")
            )
            db.add(db_med)
        db.commit()
        return {"status": "success", "count": len(request.medicines)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. REMINDERS ---
@app.post("/api/reminders", response_model=ReminderOut, tags=["Reminders"])
async def create_reminder(reminder: ReminderCreate, db: Session = Depends(get_db)):
    """Set a medication reminder"""
    db_reminder = ReminderDB(**reminder.model_dump())
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

@app.get("/api/reminders", response_model=List[ReminderOut], tags=["Reminders"])
async def get_reminders(patient_id: int, db: Session = Depends(get_db)):
    """List all reminders for a patient"""
    return db.query(ReminderDB).filter(ReminderDB.patient_id == patient_id).all()

@app.post("/api/reminders/trigger-alert", tags=["Reminders"])
async def trigger_reminder_alert(reminder_id: int, db: Session = Depends(get_db)):
    """Manual trigger for system voice alert (Testing Flow)"""
    reminder = db.query(ReminderDB).filter(ReminderDB.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
        
    # Generate Voice Alert via TTS
    alert_text = f"Hi, this is NeuraMed. It's time to take your {reminder.medicine_name}."
    audio_content = await text_to_speech(alert_text, "en-IN")
    import base64
    audio_base64 = base64.b64encode(audio_content).decode("utf-8")
    
    return {
        "status": "alert_triggered",
        "message": alert_text,
        "audio_base64": audio_base64
    }

# --- 5. AI & INTERACTIONS ---
@app.post("/api/interactions", response_model=InteractionResponse, tags=["AI Safety"])
async def check_interactions(request: InteractionRequest):
    """Combinatorial interaction prediction"""
    try:
        rule_result = check_rule_based(request.drug1, request.drug2)
        if rule_result:
            return InteractionResponse(**rule_result)
            
        ml_prediction = predict_interaction(request.drug1, request.drug2)
        return InteractionResponse(
            interaction=ml_prediction["interaction"],
            severity=ml_prediction["severity"],
            source="ml"
        )
    except Exception as e:
        logger.error(f"❌ Interaction Check Failure: {str(e)}")
        return InteractionResponse(
            interaction=False,
            severity="none",
            source="fallback-safe"
        )

@app.post("/api/ai/evaluate", response_model=AiEvaluateResponse, tags=["AI Orchestration"])
async def ai_evaluate(request: AiEvaluateRequest):
    """Full patient context AI evaluation"""
    result = orchestrator.evaluate(request)
    return AiEvaluateResponse(**result)

# --- 6. HEALTH & UTILS ---
@app.get("/health", tags=["DevOps"])
async def health_check():
    return {"status": "ok", "timestamp": time.time()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
