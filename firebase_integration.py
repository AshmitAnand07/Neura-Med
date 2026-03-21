import os
from fastapi import FastAPI, APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

import firebase_admin
from firebase_admin import credentials, firestore

# ==========================================
# 1. ROOT AI ORCHESTRATOR LINKING
# ==========================================
try:
    from ai_orchestrator import ai_evaluate_endpoint, AiEvaluateRequest, PatientData, AiEvaluateResponse
except ImportError:
    # Autonomous failsafe isolation if underlying ML weights vanish
    ai_evaluate_endpoint = None

# Standalone API loop mapped to its own execution domain internally
router = APIRouter()
app = FastAPI(title="NeuraMed Firebase Admin SDK Integration")

# ==========================================
# 2. FIREBASE ADMIN SDK CONFIGURATION
# ==========================================
# Extremely secure initialization using local credential bounds.
# Priority: 1. ENV VAR (JSON String), 2. Local JSON File
cred_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
cred_path = "serviceAccountKey.json"

if not firebase_admin._apps:
    if cred_json:
        try:
            import json
            cred_dict = json.loads(cred_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            print("✅ [FIREBASE] Initialized via Environment Variable.")
        except Exception as e:
            print(f"❌ [FIREBASE] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: {e}")
    elif os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("✅ [FIREBASE] Initialized via local 'serviceAccountKey.json'.")
    else:
        # Graceful Cloud-Run / AppEngine generic initialization bounds
        try:
            firebase_admin.initialize_app()
            print("✅ [FIREBASE] Initialized via Application Default Credentials.")
        except Exception as e:
            print(f"⚠️ [FIREBASE] Could not initialize Admin SDK: {e}")

db = firestore.client() if len(firebase_admin._apps) > 0 else None

class FirebaseEvaluateRequest(BaseModel):
    user_id: str = Field(..., description="The highly unique 28-character Firebase Auth UID explicitly locating the original cloud Document.")

# ==========================================
# 3. FAST FIRESTORE SDK DATA FETCHING
# ==========================================
async def get_user(user_id: str) -> Optional[Dict[str, Any]]:
    """Strictly fetches the standard Authentication document using native Admin bindings."""
    if not db:
         raise Exception("Firestore Admin DB client is uninitialized locally. Missing actual 'serviceAccountKey.json' file.")
         
    doc_ref = db.collection("users").document(user_id)
    doc = doc_ref.get()
    
    if doc.exists:
        return doc.to_dict()
    return None

async def get_user_medicines(user_id: str) -> List[Dict[str, Any]]:
    """
    Executes high-performance indexing streaming the root `medicines` array 
    explicitly enforcing hard filters on the parent `userId`.
    """
    if not db:
         raise Exception("Firestore internal db object missing.")
         
    meds_ref = db.collection("medicines").where("userId", "==", user_id).stream()
    results = []
    
    for med in meds_ref:
        data = med.to_dict()
        med_name = data.get("name", "")
        composition = data.get("composition", "")
        results.append({"name": med_name, "composition": composition})
        
    return results

async def get_user_adherence_logs(user_id: str) -> List[Dict[str, Any]]:
    """
    Mass-streams the specialized `adherenceLogs` documents natively from Firestore.
    Enforces descending chronological ordering via the 'timestamp' index.
    """
    if not db:
         raise Exception("Firestore internal db object missing.")
         
    logs_ref = db.collection("adherenceLogs")\
                 .where("userId", "==", user_id)\
                 .order_by("timestamp", direction=firestore.Query.DESCENDING)\
                 .stream()
    results = []
    
    for log in logs_ref:
        data = log.to_dict()
        status = data.get("status", "")
        ts = data.get("timestamp")
        
        # Parse native Google Datetime timestamp securely back into generic ISO-8601 formatting.
        if hasattr(ts, "timestamp"):  
             ts = datetime.fromtimestamp(ts.timestamp()).isoformat() + "Z"
        elif isinstance(ts, datetime):
             ts = ts.isoformat() + "Z"
             
        results.append({"status": status, "timestamp": ts})
        
    return results

# [BONUS LOGIC] Standalone theoretical lookup hook
async def check_medicine_recall(medicine_name: str) -> bool:
    """Optional cloud script mapping mass FDA recall indexes asynchronously."""
    return False

# ==========================================
# 4. FASTAPI / FIRESTORE ORCHESTRATOR BRIDGE
# ==========================================
@router.post("/ai-evaluate-firebase", response_model=AiEvaluateResponse, tags=["Firebase SDK Integration Layer"])
async def ai_evaluate_firebase(request: FirebaseEvaluateRequest):
    """
    Absorbs purely remote Firebase Cloud NoSQL queries entirely locally using the Python Admin SDK
    and streams them dynamically directly into the Scikit-Learn analytical pipeline mappings.
    """
    if not ai_evaluate_endpoint:
        raise HTTPException(status_code=500, detail="CRITICAL ERROR: Fundamental AI Orchestrator loop physical missing.")
        
    uid = request.user_id
    
    try:
        # A) Retrieve Authentication Context Bounds
        user_data = await get_user(uid)
        if not user_data:
             raise HTTPException(status_code=404, detail=f"User ID '{uid}' could not be computationally located securely inside Firestore 'users' collection.")
            
        # B) Cross-Reference Drug Data Geometries 
        medicines = await get_user_medicines(uid)
        if len(medicines) < 2:
             raise HTTPException(
                 status_code=400, 
                 detail=f"Mathematical Scarcity Error: User '{uid}' strictly has {len(medicines)} bounded medicine(s) detected. The core Combinatorial algorithm mandates at least 2 active inputs unconditionally."
             )
            
        # Prefer exact scientific chemical architectures securely, automatically falling back dynamically to explicit consumer brand names.
        d1 = medicines[0].get("composition") or medicines[0].get("name")
        d2 = medicines[1].get("composition") or medicines[1].get("name")
        
        # C) Stream specialized Adherence Logs natively!
        logs = await get_user_adherence_logs(uid)
        adherence_logs = []
        
        for log in logs:
             status = log.get("status", "").lower()
             if status in ["taken", "missed"]:
                  # Map: "taken" -> 1, "missed" -> 0
                  val = 1 if status == "taken" else 0
                  adherence_logs.append({
                      "taken": val,
                      "date": log.get("timestamp") or datetime.utcnow().isoformat() + "Z"
                  })
        
        # D) Safety Guard: Return warning if history is too shallow for ML inference
        if len(adherence_logs) < 3:
             raise HTTPException(
                 status_code=400, 
                 detail="Insufficient Data: AI mandates at least 3 historical adherence logs (taken/missed) to generate a reliable risk trajectory."
             )
        
        # E) Calculate Metadata for Orchestrator
        taken_val = sum(1 for log in adherence_logs if log["taken"] == 1)
        prev_response = taken_val / len(adherence_logs) if len(adherence_logs) > 0 else 1.0
                     
        # E) Launch Unified Recommendation Topology Response 
        # Hashes purely explicit Cloud strings securely preventing SQL-int casting geometry crashes internally.
        hashed_id = hash(uid) % 100000 
        
        ai_req = AiEvaluateRequest(
            patient_id=hashed_id,
            drug1=d1,
            drug2=d2,
            adherence_history=adherence_logs,
            patient_data=PatientData(
                previous_response_rate=prev_response,
                notification_type="push" # Native explicit assumption default indicating a mobile application interface
            )
        )
        
        # Engage autonomous predictive recommendation core organically.
        recommendation_matrix = await ai_evaluate_endpoint(ai_req)
        return recommendation_matrix
        
    except HTTPException:
        # Prevent bubbling pure logical failures strictly back against OS limits
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firebase Administrator Cloud API Topology Collision Exception: {str(e)}")

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    # Operates autonomously entirely mapped strictly onto port 8005 isolating dependencies
    uvicorn.run("firebase_integration:app", host="0.0.0.0", port=8005, reload=True)
