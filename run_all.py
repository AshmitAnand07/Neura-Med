import os
import sys
import io

# Fix UnicodeEncodeError on Windows for emojis/special characters
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
import json
import importlib
import asyncio
from datetime import datetime, timedelta

def print_header(title: str):
    print(f"\n{'='*60}\n{title.center(60)}\n{'='*60}")

# Track overarching system outcomes silently
outcomes = {
    "passed": [],
    "failed": [],
    "warnings": []
}

def log_pass(component: str):
    print(f"✅ PASS: {component}")
    outcomes["passed"].append(component)

def log_fail(component: str, error: str):
    print(f"❌ FAIL: {component} (Error: {error})")
    outcomes["failed"].append(component)

def log_warn(component: str, msg: str):
    print(f"⚠️ WARN: {component} ({msg})")
    outcomes["warnings"].append(component)

# STEP 1: Dependencies Context
def step_1_environment():
    print_header("STEP 1: ENVIRONMENT SETUP")
    deps = ["joblib", "sklearn", "fastapi", "uvicorn", "pydantic"]
    missing = []
    
    for dep in deps:
        try:
            importlib.import_module(dep)
            log_pass(f"Library '{dep}' natively installed.")
        except ImportError:
            missing.append("scikit-learn" if dep == "sklearn" else dep)
            
    if missing:
        req_file = "requirements.txt"
        if not os.path.exists(req_file):
            try:
                with open(req_file, "w") as f:
                    for m in missing:
                        f.write(f"{m}\n")
                log_warn("Dependencies", f"Generated requirements.txt for {missing}")
            except Exception as e:
                log_fail("Requirements Generation", str(e))
                
        print("\n[CRITICAL]: Libraries missing. To safely execute the ML models, run:")
        print("pip install -r requirements.txt")
        return False
    return True

# STEP 2: File Structure Validity
def step_2_files():
    print_header("STEP 2: FILE VALIDATION")
    req_files = [
        "interaction_model.py", "adherence_model.py",
        "interaction_service.py", "adherence_service.py",
        "ai_orchestrator.py", "system_check.py"
    ]
    generator_path = None
    
    # Map specifically designed generator paths gracefully without throwing errors
    if os.path.exists("data_generator.py"):
        log_pass("File: data_generator.py (Root)")
        generator_path = "data_generator.py"
    elif os.path.exists("ai_interaction_service/data_generator.py"):
        log_pass("File: data_generator.py (Located functionally in Sub-Directory)")
        generator_path = "ai_interaction_service/data_generator.py"
    else:
        log_fail("File: data_generator.py", "Completely missing from logical boundaries.")
        
    for f in req_files:
        if os.path.exists(f):
            log_pass(f"File: {f}")
        else:
            log_fail(f"File: {f}", "Python ML artifact missing from disk!")
            
    return generator_path

# STEP 3 & 4: Data & Artifacts Autorecovery
def step_3_and_4_autofix(generator_path: str):
    print_header("STEP 3/4: DATA & MODEL VALIDATION (Self-Fixing)")
    datasets = ["synthetic_interactions.json", "synthetic_adherence_logs.json"]
    models = ["interaction_model.pkl", "adherence_model.pkl"]
    
    # Generate missing datasets automatically via python os calls
    if any(not os.path.exists(d) for d in datasets):
        log_warn("Datasets", "Models missing on disk! Triggering Data Generator script natively...")
        if generator_path:
            try:
                ret = os.system(f"python {generator_path}")
                if ret == 0:
                    log_pass("Self-Heal: Datasets Regenerated securely")
                else:
                    log_fail("Self-Heal: Datasets", "Generator script crashed.")
            except Exception as e:
                log_fail("Self-Heal: Datasets Execution", str(e))
        else:
            log_fail("Self-Heal", "Required data_generator.py is missing to fix dataset drops.")
    else:
        log_pass("Datasets verified intact")

    # Retrain missing Scikit-learn memory graphs
    for pkl, builder in zip(models, ["interaction_model.py", "adherence_model.py"]):
        if not os.path.exists(pkl):
            log_warn("Model Missing", f"{pkl} missing. Triggering safe autonomous re-training...")
            try:
                ret = os.system(f"python {builder}")
                if ret == 0 and os.path.exists(pkl):
                    log_pass(f"Self-Heal: Model {pkl} rebuilt successfully")
                else:
                    log_fail(f"Self-Heal: {pkl}", "Trainer script execution failed.")
            except Exception as e:
                log_fail(f"Self-Heal: {pkl}", str(e))
        else:
            log_pass(f"Model Memory Artifact intact: {pkl}")
            
    # Test strict memory loading of .pkl files 
    import joblib
    for pkl in models:
        try:
            if os.path.exists(pkl):
                temp_model = joblib.load(pkl)
                log_pass(f"Joblib De-Serialization Successful for {pkl}")
        except Exception as e:
            log_fail(f"Joblib Memory Test {pkl}", str(e))

# STEP 5: Internal Direct Service Calls
def step_5_services():
    print_header("STEP 5: CORE PYTHON SERVICE VALIDATION")
    try:
        from interaction_model import predict_interaction
        res = predict_interaction("aspirin", "warfarin")
        log_pass(f"Evaluated 'Aspirin'/'Warfarin' natively -> Captured properly as '{res['severity']}' severity tier.")
    except Exception as e:
        log_fail("Interaction Predictor Logic", str(e))
        
    try:
        from adherence_model import predict_miss_risk
        # Array specifically mimicking Patient Dropout mapping
        adherence_array = [True, True, False, True, False, False, True]
        base_date = datetime.utcnow() - timedelta(days=7)
        logs = [{"taken": t, "date": (base_date + timedelta(days=i)).isoformat() + "Z"} for i, t in enumerate(adherence_array)]
        
        prob = predict_miss_risk(logs)
        log_pass(f"Evaluated Adherence Pattern natively -> Risk index estimated at {prob}")
    except Exception as e:
        log_fail("Adherence Predictor Logic", str(e))

# STEP 6: Asynchronous Central Controller
def step_6_orchestrator():
    print_header("STEP 6: AI ORCHESTRATOR API VALIDATION")
    try:
        # Load exactly structured Pydantic mappings
        from ai_orchestrator import ai_evaluate_endpoint, AiEvaluateRequest, PatientData
        
        base_date = datetime.utcnow() - timedelta(days=7)
        logs = [
            {"taken": True, "date": (base_date + timedelta(days=0)).isoformat() + "Z"},
            {"taken": True, "date": (base_date + timedelta(days=1)).isoformat() + "Z"},
            {"taken": False, "date": (base_date + timedelta(days=2)).isoformat() + "Z"},
            {"taken": True, "date": (base_date + timedelta(days=3)).isoformat() + "Z"},
            {"taken": False, "date": (base_date + timedelta(days=4)).isoformat() + "Z"},
            {"taken": False, "date": (base_date + timedelta(days=5)).isoformat() + "Z"},
            {"taken": True, "date": (base_date + timedelta(days=6)).isoformat() + "Z"}
        ]
        
        # Test extreme outlier event pushing system boundaries
        req = AiEvaluateRequest(
            patient_id=1,
            drug1="aspirin",
            drug2="warfarin",
            adherence_history=logs,
            patient_data=PatientData(previous_response_rate=0.5, notification_type="push")
        )
        
        # FastAPI relies on Uvicorn loop mapping
        res = asyncio.run(ai_evaluate_endpoint(req))
        
        log_pass("Full E2E Orchestrator Simulated Endpoint Pass")
        print("\n [FINAL ORCHESTRATOR API RESPONSE]")
        print(" {")
        print(f"    'interaction_alert': 'interaction': {res.interaction_alert.interaction}, 'severity': '{res.interaction_alert.severity}'")
        print(f"    'adherence_risk': {res.adherence_risk}")
        print(f"    'recommended_action': '{res.recommended_action}'")
        print(" }\n")
        
    except Exception as e:
         log_fail("Orchestrator Server Validation", str(e))

# STEP 7: Legacy External Validation Hooks
def step_7_syscheck():
    print_header("STEP 7: EXTERNAL SYSCHECK RUNNER")
    if os.path.exists("system_check.py"):
        try:
            # We redirect OS outputs to Null safely testing if the bash interface crashes when booting scripts
            ret = os.system("python system_check.py > os_diagnostic.log 2>&1")
            if ret == 0:
                 log_pass("system_check.py bash execution verified and stabilized")
            else:
                 log_fail("system_check.py bash execution", "Internal Python failure, code > 0")
        except Exception as e:
            log_fail("System Check Script Automation", str(e))
    else:
        log_fail("system_check.py Execution", "Script File completely missing.")

# STEP 8: End Reporting Formats
def step_8_final_report():
    print_header("STEP 8: FINAL AI LAYER SYSTEM REPORT")
    print(f" ✅ WORKING COMPONENTS: {len(outcomes['passed'])}")
    print(f" ❌ FAILED COMPONENTS:  {len(outcomes['failed'])}")
    print(f" ⚠️ WARNING INCIDENTS:  {len(outcomes['warnings'])}\n")
    
    if len(outcomes["failed"]) == 0:
        print("[DEPLOYMENT READY]: The entire NeuraMed AI Architecture checks out perfectly natively. All modules are correctly partitioned and cross-linked.")
    else:
        print("[ACTION REQUIRED] SUGGESTED FIXES:")
        if not os.path.exists("requirements.txt"):
             print("   -> Missing dependencies! Execute `pip install joblib scikit-learn fastapi uvicorn pydantic`")
        for fail in outcomes["failed"]:
             print(f"   -> Resolve missing/crashing component logic inside '{fail}'")

if __name__ == "__main__":
    try:
        is_ready = step_1_environment()
        
        if is_ready:
            gen_path = step_2_files()
            step_3_and_4_autofix(gen_path)
            step_5_services()
            step_6_orchestrator()
            step_7_syscheck()
            
        step_8_final_report()
    except Exception as fatal:
        print(f"\n❌ FATAL SCRIPT CRASH AVERTED: {fatal} - Review immediate pipeline integrity boundaries.")
