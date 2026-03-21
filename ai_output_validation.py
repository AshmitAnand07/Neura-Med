import httpx
import asyncio

URL_FIRESTORE_INTEGRATION = "http://127.0.0.1:8005/ai-evaluate-firebase"

async def run_ai_prediction_validation(user_id: str):
    """
    Acts as an external HTTP client firing real Cloud variables into the local AI Node.
    Explicitly decodes the Machine Learning inferences mapping them safely back to 
    expected baseline logic actions locally to definitively ensure absolute safety bounds.
    """
    print("\n" + "="*60)
    print(f"AI INFERENCE LOGIC VALIDATION -> UID: {user_id}".center(60))
    print("="*60 + "\n")
    
    payload = {"user_id": user_id}
    
    try:
        print(f"Executing explicit POST request natively to -> {URL_FIRESTORE_INTEGRATION}")
        
        # Fire asynchronous networking hook to intercept FastAPI response
        async with httpx.AsyncClient() as client:
            resp = await client.post(URL_FIRESTORE_INTEGRATION, json=payload, timeout=12.0)
            
        if resp.status_code != 200:
            print(f"\n❌ [HTTP ERROR {resp.status_code}]: {resp.text}")
            print("\nEnsure 'firebase_integration.py' is currently actively running on Native Port 8005 via Uvicorn.")
            return
            
        json_data = resp.json()
        
        # Output exactly as requested by user bounds
        print("\n[FULL API RESPONSE]")
        print(json_data)
        
        # Safely extract Pydantic formatted outputs implicitly handling null arrays
        interaction_schema = json_data.get("interaction_alert", {})
        interaction_severity = interaction_schema.get("severity", "none").lower()
        adherence_risk = float(json_data.get("adherence_risk", 0.0))
        actual_action = json_data.get("recommended_action", "UNKNOWN")
        
        # ===============================================
        # Hardcoded Safety Geometries / Validation Rules
        # ===============================================
        if interaction_severity == "high":
            expected_action = "critical_alert"
            
        elif adherence_risk > 0.7:
            expected_action = "early_reminder"
            
        else:
            expected_action = "normal_reminder"
            
        # Logging computation values directly back to console
        print("\n[PREDICTION VARIABLES EXAMINED]")
        print(f" - Scikit-Learn Interaction Severity   : {interaction_severity}")
        print(f" - Scikit-Learn Adherence Dropout Risk : {adherence_risk}")
        
        print("\n[ORCHESTRATOR DECISION MATCHING]")
        print(f" - ACTUAL ACTION ISSUED : {actual_action}")
        print(f" - EXPECTED LOGIC ACTON : {expected_action}")
        
        print("\n[VERDICT]")
        if expected_action == actual_action:
            print("✅ PASS: The internal AI Orchestrator perfectly honored the deterministic health-safety thresholding bounds!")
        else:
             print(f"⚠️  WARNING: Critical Logic Mismatch Detected! Expected '{expected_action}' but the endpoint arbitrarily forced '{actual_action}'.")
        
    except httpx.ConnectError:
        print("\n❌  [EXECUTION FAILED]: Networking Connection Refused.")
        print("    Ensure your terminal is actively executing 'firebase_integration.py' on Port 8005!")
        
    except Exception as general_anomaly:
        print(f"\n❌  [EXECUTION FAILED]: Trapped an unexpected topology error -> {str(general_anomaly)}")
        
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    TARGET_UID = "PUT_REAL_USER_ID_HERE"
    
    # Map execution loop explicitly out executing standard asyncio routines
    asyncio.run(run_ai_prediction_validation(TARGET_UID))
