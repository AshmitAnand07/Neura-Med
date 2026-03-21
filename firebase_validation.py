import sys
import asyncio
from datetime import datetime

# ==========================================
# 1. CORE LIBRARY BINDINGS
# ==========================================
# Native import hooks referencing our active Admin SDK abstractions natively!
try:
    from firebase_integration import get_user, get_user_medicines, get_user_alerts
except ImportError:
    print("CRITICAL IMPORT ERROR: The 'firebase_integration.py' module is missing from your working directory.")
    sys.exit(1)

# ==========================================
# 2. ISOLATED TEST BED DIAGNOSTICS
# ==========================================
async def test_firebase_data(user_id: str):
    """
    Extensively isolates explicit NoSQL geometry endpoints to guarantee
    the Admin SDK streams correctly integrate strictly toward the Pydantic ML boundary parameters natively!
    """
    
    print("\n" + "="*60)
    print(f"FIRESTORE DATAPIPE VALIDATION -> UID: {user_id}".center(60))
    print("="*60 + "\n")
    
    # ----------------------------------------
    # STEP A: USER DATA
    # ----------------------------------------
    try:
        user_data = await get_user(user_id)
        print("[USER DATA]")
        print(f" -> Found Document natively: {user_data}\n")
    except Exception as user_e:
        print(f"❌ [USER DATA] Execution Filter Crashed: {str(user_e)}\n")

    # ----------------------------------------
    # STEP B: MEDICINES & DRUG EXTRACTION
    # ----------------------------------------
    try:
        meds_raw = await get_user_medicines(user_id)
        print("[MEDICINES RAW]")
        print(f" -> Snapshot Collections mapped explicitly: {meds_raw}\n")
        
        extracted_drugs = []
        for m in meds_raw:
             # Match exact logic parsing preferences: fallback if formulation is missing.
             drg_val = m.get("composition") or m.get("name")
             if drg_val:
                 extracted_drugs.append(drg_val)
                 
        print("[DRUGS EXTRACTED]")
        print(f" -> Clean Matrix Geometries mapping into ML Pipeline: {extracted_drugs}")
        
        # Validations matching logic boundaries explicitly!
        if len(extracted_drugs) < 2:
             print("\n⚠️ WARNING: Machine Learning Dependency Failure! Less than 2 active medicines tracked. The predictive Drug Interaction combinatorial matrix will inherently fail under these conditions natively!")
        print()
             
    except Exception as med_e:
        print(f"❌ [MEDICINES] Execution Filter Crashed: {str(med_e)}\n")

    # ----------------------------------------
    # STEP C: ALERTS & ADHERENCE LOGIC
    # ----------------------------------------
    try:
        alerts_raw = await get_user_alerts(user_id)
        print("[ALERTS RAW]")
        print(f" -> Cloud Functions / App Snapshots: {alerts_raw}\n")
        
        adherence_history = []
        
        # Strict pipeline mimicking to ensure arrays remain mathematically flawless.
        for alert in alerts_raw:
             atype = alert.get("type", "").lower()
             if atype in ["missed", "taken"]:
                 is_taken = True if atype == "taken" else False
                 adherence_history.append({
                     "taken": is_taken,
                     "date": alert.get("createdAt") or datetime.utcnow().isoformat() + "Z"
                 })
                 
        print("[ADHERENCE ARRAY]")
        print(f" -> Scikit-Learn Formatted Window Geometry mapping natively:")
        for log in adherence_history:
             print(f"    - Taken: {log['taken']}, Date: {log['date']}")
             
        if len(adherence_history) < 3:
             print(f"\n⚠️ WARNING: ML Dropout Topology Dependency Missing! Merely {len(adherence_history)} chronological dose logs were successfully found natively, but the sliding-window topology algorithm mandates a minimum of 3 tracking vectors strictly. (The ML orchestrator natively solves this parameter auto-padding implicitly in production).")
             
    except Exception as alerts_e:
        print(f"❌ [ALERTS] Execution Filter Crashed: {str(alerts_e)}")
        
    print("\n" + "="*60)
    print("VALIDATION DIAGNOSTICS COMPLETE".center(60))
    print("="*60 + "\n")

# ==========================================
# 3. ROOT MAIN EXECUTOR HOOK
# ==========================================
if __name__ == "__main__":
    # Update this target string securely corresponding directly natively strictly back against 
    # an internal existing Firebase Auth User ID string exactly as instructed natively!
    TARGET_UID = "PUT_REAL_USER_ID_HERE"
    
    # Standardize loop invocation protecting cross-environment compatibilities
    asyncio.run(test_firebase_data(TARGET_UID))
