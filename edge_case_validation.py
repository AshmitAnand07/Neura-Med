import httpx
import asyncio

URL_FIRESTORE = "http://127.0.0.1:8005/ai-evaluate-firebase"

async def execute_edge_case(test_description: str, test_payload: dict):
    """
    Blasts explicit edge geometries against the native WebServer instance.
    Checks explicitly if the underlying API routes trap errors securely (HTTP 404, HTTP 400, HTTP 422)
    instead of throwing fatal stack traces (HTTP 500) breaking the frontend interface identically!
    """
    print(f"\n[TEST CASE] {test_description}")
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(URL_FIRESTORE, json=test_payload, timeout=8.0)
            
        print(f"[RESULT] Status Code Evaluated: {resp.status_code}")
        
        try:
            # Capture JSON detail cleanly parsing the `raise HTTPException(detail=...)` explicitly
            json_response = resp.json()
            print(f"         JSON Body: {json_response}")
        except Exception:
            print(f"         Raw Text: {resp.text}")
            
        # A 500 status strictly means the pipeline completely crashed (e.g. index out of bounds, generic ValueError inside Scikit-learn).
        # We mapped all edge failures structurally into safe HTTP bounds internally.
        if resp.status_code in [200, 400, 404, 422]:
            print("[STATUS] PASS (The System cleanly deflected catastrophic errors without crashing internally!)")
            return True
        else:
            print("[STATUS] FAIL (The System encountered an unhandled HTTP 500 Python Stack Crash!)")
            return False
            
    except httpx.ConnectError:
        print("[RESULT] Network Connection Refused!")
        print("         Ensure `firebase_integration.py` is actively mounted on Port 8005 natively via Uvicorn terminal instance.")
        print("[STATUS] FAIL")
        return False
    except Exception as e:
        print(f"[RESULT] Unexpected Terminal Socket Crash: {str(e)}")
        print("[STATUS] FAIL")
        return False

async def run_edge_cases():
    print("\n" + "="*60)
    print("NEURAMED ML PIPELINE EDGE CASE VALIDATION".center(60))
    print("="*60)
    
    # ---------------------------------------------------------
    # EDGE CASE 1: INVALID / RANDOM USER ID
    # Expected System Output: HTTP 404 Not Found (Graceful Exit)
    # ---------------------------------------------------------
    await execute_edge_case(
        test_description="1. Executing Invalid user_id (Mock non-existent string)",
        test_payload={"user_id": "999_NEVER_EXISTED_UID_999"}
    )
    
    # ---------------------------------------------------------
    # EDGE CASE 2: USER EXISTS BUT HAS 0 MEDICINES
    # Expected Output: HTTP 404 (if user generated didn't mock) OR HTTP 400 (Explicit 'Not Enough Meds' Warning)
    # ---------------------------------------------------------
    await execute_edge_case(
        test_description="2. Executing User with completely zero medicines",
        test_payload={"user_id": "MOCK_UID_ZERO_MEDS"}
    )
    
    # ---------------------------------------------------------
    # EDGE CASE 3: USER HAS ONLY 1 MEDICINE
    # Expected Output: HTTP 400 (Intercepts the combinatorial pipeline BEFORE an Array IndexOut Crash)
    # ---------------------------------------------------------
    await execute_edge_case(
        test_description="3. Executing User with exactly 1 active medicine mapped",
        test_payload={"user_id": "MOCK_UID_ONE_MEDICINE"}
    )
    
    # ---------------------------------------------------------
    # EDGE CASE 4: USER HAS 0 ADHERENCE ALERTS
    # Expected Output: HTTP 200 OK (Clean). The system dynamically injects 3 perfect baseline models to prevent Scikit-Learn Dimension crashes internally!
    # ---------------------------------------------------------
    await execute_edge_case(
        test_description="4. Executing User with zero adherence alerts (Implicit Auto-Pad Test)",
        test_payload={"user_id": "MOCK_UID_NO_ALERTS_LOGGED"} # Assuming patient is authentic but brand new
    )
    
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(run_edge_cases())
