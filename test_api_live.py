import httpx
import time

# Targeted Endpoint (Assuming main.py is locally active on typical 8000)
API_URL = "http://127.0.0.1:8000/ai-evaluate"

def test_api_integration():
    """
    Executes a high-fidelity REST test by simulating a real-world 
    clinical interaction through the unified AI gateway.
    """
    print("\n" + "="*60)
    print("NEURAMED AI - LIVE INTEGRATION TEST".center(60))
    print("="*60 + "\n")

    payload = {
        "patient_id": 505,
        "drug1": "Aspirin", # Mixed case to test internal .lower() normalization
        "drug2": "Warfarin",
        "adherence_history": [
            {"taken": True, "date": "2023-10-01T08:00:00Z"},
            {"taken": False, "date": "2023-10-02T08:00:00Z"},
            {"taken": False, "date": "2023-10-03T08:00:00Z"}
        ]
    }

    try:
        print(f"Firing POST request to: {API_URL}")
        start = time.time()
        
        with httpx.Client() as client:
            response = client.post(API_URL, json=payload, timeout=10.0)
            
        latency = time.time() - start
        
        if response.status_code == 200:
            print(f"\n✅ SUCCESS (HTTP 200) | Latency: {latency:.4f}s")
            data = response.json()
            
            print("\n[AI ORCHESTRATOR OUTPUT]")
            print(f" - Reported Interaction: {data['interaction_alert']['severity'].upper()}")
            print(f" - Adherence Risk Score: {data['adherence_risk']*100:.2f}%")
            print(f" - Recommended Action  : {data['recommended_action'].upper()}")
            
            # Check for Fallback Detection (All 0s logic)
            if data['adherence_risk'] == 0.0 and data['interaction_alert']['severity'] == 'none':
                print("\n⚠️ [NOTICE] The API returned Neutral results. Ensure .pkl files are in the root directory!")
        else:
            print(f"\n❌ FAILED | HTTP {response.status_code}")
            print(f" - Error Detail: {response.text}")

    except Exception as e:
        print(f"\n❌ NETWORK ERROR: {str(e)}")
        print("   Ensure 'python run_server.py' is active in another terminal.")

    # FALLBACK TEST: Unknown Drug
    print("\n" + "-"*40)
    print("EXECUTING UNKNOWN DRUG FALLBACK TEST...")
    payload["drug1"] = "NonExistentDrugXYZ"
    
    try:
        with httpx.Client() as client:
            response = client.post(API_URL, json=payload, timeout=5.0)
            
        print(f"Status Output: {response.status_code}")
        if response.status_code == 200:
            res_data = response.json()
            print(f"Orchestrator Result for Unknown Drug: {res_data['interaction_alert']['severity']}")
            print("Status: [PASS] System correctly handled OOV drug without crashing.")
    except Exception as e:
        print(f"Fallback Test Failed: {str(e)}")

    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    test_api_integration()
