import os
import joblib
import asyncio
from datetime import datetime, timedelta

# Global verification counters
tests_passed = 0
tests_failed = 0

def run_test(test_name: str, func):
    """Execution wrapper to standardize validation output prints and error catching."""
    global tests_passed, tests_failed
    print(f"\n[EVALUATING] {test_name}")
    try:
        result = func()
        print(f"✅ PASS | Result: {result}")
        tests_passed += 1
    except Exception as e:
        print(f"❌ FAIL | Error: {str(e)}")
        tests_failed += 1

# A) Physical File Existence Hook
def check_file(filename: str):
    if not os.path.exists(filename):
        raise FileNotFoundError(f"Native artifact completely missing from disk boundary: {filename}")
    return "Artifact successfully verified natively."

# B) ML Weights Load Verification
def load_model(filename: str):
    model = joblib.load(filename)
    return f"Memory allocation successful. Engine Type: {type(model).__name__}"

# C) Isolated Function Pipelines
def test_interaction_function():
    from interaction_model import predict_interaction
    
    res = predict_interaction("aspirin", "warfarin")
    if "interaction" not in res:
         raise ValueError("Corrupted Dictionary Format from ML Pipeline.")
    return f"Severity Tier -> [{res['severity']}], Structural Confidence -> {res['probability']}"



# D) FastAPI Service Interfaces directly
def test_interaction_service():
    from interaction_service import check_interaction_endpoint, InteractionRequest
    req = InteractionRequest(drug1="ibuprofen", drug2="lisinopril")
    
    # The FastAPI endpoints are asynchronously defined (`async def`)
    # We must run them natively in an event loop using `asyncio`
    res = asyncio.run(check_interaction_endpoint(req))
    return f"API Route Evaluated -> Severity '{res.severity}' triggered by [{res.source}] Engine."


# E) Complete Abstract AI Orchestrator Stack 
def test_orchestrator():
    from ai_orchestrator import ai_evaluate_endpoint, AiEvaluateRequest, PatientData
    
    patient_data = PatientData(previous_response_rate=0.45, notification_type="push")
    
    # Aggressively simulate a highly non-adherent patient payload
    base_date = datetime.utcnow() - timedelta(days=5)
    logs = [{"taken": False, "date": (base_date + timedelta(days=i)).isoformat() + "Z"} for i in range(5)]
    
    req = AiEvaluateRequest(
        patient_id=5381,
        drug1="amoxicillin",
        drug2="clavulanate",
        adherence_history=logs
    )
    
    res = asyncio.run(ai_evaluate_endpoint(req))
    return f"Orchestrator Executed! Optimal Action -> [{res.recommended_action}] | Internal Adherence Core Risk: {res.adherence_risk} | Internal Interaction Priority: {res.interaction_alert.severity}"

if __name__ == "__main__":
    print("\n" + "=" * 55)
    print("NEURAMED ML PIPELINE | COMPLETE SYSTEM VALIDATION".center(55))
    print("=" * 55)
    
    # 1. State Physical Disks Checks
    run_test("Artifact Existence Check: interaction_model.pkl", lambda: check_file("interaction_model.pkl"))
    run_test("Artifact Existence Check: adherence_model.pkl", lambda: check_file("adherence_model.pkl"))
    run_test("Artifact Existence Check: synthetic_interactions.json", lambda: check_file("synthetic_interactions.json"))
    run_test("Artifact Existence Check: synthetic_adherence_logs.json", lambda: check_file("synthetic_adherence_logs.json"))

    # 2. Serialize States from Disks
    run_test("Deserialization Integrity: Random Forest Classifier", lambda: load_model("interaction_model.pkl"))
    run_test("Deserialization Integrity: Logistic Regression Model", lambda: load_model("adherence_model.pkl"))
    
    # 3. Core Math Engines
    run_test("Inference Test: Interaction Component (Aspirin + Warfarin)", test_interaction_function)

    # 4. FastAPI Native Integrity Links
    run_test("FastAPI Route Verification: Interaction Payload", test_interaction_service)

    # 5. The Unified Multi-Service Hub Integrations
    run_test("Unified Controller Integrations test: AI Orchestrator Stack", test_orchestrator)
    
    print("\n" + "█" * 55)
    print("                 SYSTEM VALIDATION SUMMARY               ")
    print("█" * 55)
    print(f" TOTAL PASSED: {tests_passed}".ljust(54) + "█")
    print(f" TOTAL FAILED: {tests_failed}".ljust(54) + "█")
    print("█" * 55 + "\n")
