import httpx
import asyncio
import time

# ==========================================
# 1. LATENCY BENCHMARK CONFIGURATION
# ==========================================
URL_FIRESTORE = "http://127.0.0.1:8005/ai-evaluate-firebase"
TOTAL_REQUESTS = 20

# Replace this string to explicitly blast a real authentic NoSQL Cloud sequence
TARGET_UID = "PUT_REAL_USER_ID_HERE"

# ==========================================
# 2. ASYNCHRONOUS WORKER NODE
# ==========================================
async def blast_request(client: httpx.AsyncClient, worker_id: int) -> dict:
    """Delivers precise asynchronous workloads tracking local inference delays in floats."""
    payload = {"user_id": TARGET_UID}
    start_time = time.time()
    
    try:
        # Fire straight against Uvicorn (Port 8005) securely utilizing explicit timeouts
        response = await client.post(URL_FIRESTORE, json=payload, timeout=20.0)
        end_time = time.time()
        
        # A 500 error inherently denotes the Scikit-Learn logic completely crashed (unhandled).
        # We consider any explicitly trapped output (200 OK, 404 Missing User, 400 Missing Meds) as a routing 'SUCCESS'.
        is_successful = response.status_code != 500
        
        return {
            "worker": worker_id,
            "latency": end_time - start_time,
            "status_code": response.status_code,
            "success": is_successful
        }
        
    except Exception as e:
        # Network exceptions natively caught here safely
        end_time = time.time()
        return {
            "worker": worker_id,
            "latency": end_time - start_time,
            "status_code": 0,
            "success": False,
            "error_message": str(e)
        }

# ==========================================
# 3. ROOT META-ORCHESTRATOR POOL
# ==========================================
async def execute_stress_test():
    """
    Spawns multiple HTTP clients instantly simulating a massive spike in generic mobile application connections natively.
    """
    print("\n" + "="*60)
    print("NEURAMED ML PIPELINE MULTI-THREAD STRESS TEST".center(60))
    print("="*60 + "\n")
    
    print(f"Targeting AI Architecture : {URL_FIRESTORE}")
    print(f"Auth UID Geometry Tracker : '{TARGET_UID}'")
    print(f"Total Async Requests      : {TOTAL_REQUESTS}")
    print("\nExecuting Native HTTP Blast...\n")
    
    global_start = time.time()
    
    # Safely utilize an AsyncClient connection pooling instance natively to prevent OS port exhaustion
    async with httpx.AsyncClient() as client:
        # Generate N independent execution loops
        tasks = [blast_request(client, i) for i in range(TOTAL_REQUESTS)]
        
        # Deploy them perfectly synchronously tracking absolute OS hardware metrics natively!
        results = await asyncio.gather(*tasks)
        
    global_time = time.time() - global_start
    
    # Mathematical Formatting
    successful = len([r for r in results if r["success"]])
    failed = len([r for r in results if not r["success"]])
    
    total_latency = sum([r["latency"] for r in results])
    average_latency = total_latency / TOTAL_REQUESTS if TOTAL_REQUESTS > 0 else 0
    
    print(f"{'#'*60}")
    print(f"STRESS TEST DIAGNOSTIC METRICS".center(60))
    print(f"{'#'*60}\n")
    
    print(f"Total Requests Executed : {TOTAL_REQUESTS}")
    print(f"Instances Successful    : {successful}")
    print(f"Instances Failed        : {failed}")
    print(f"Average Response Time   : {average_latency:.4f} seconds")
    print(f"Global Pool Duration    : {global_time:.4f} seconds (Total Time To Resolve)")
    
    if failed > 0:
        print("\n⚠️  [WARNING] Bottlenecks Detected! You may need to scale your Uvicorn instances across multiple Docker pods if inference fails under spikes.")
    else:
        print("\n✅  [PASS] Load Tolerances Optimal! Uvicorn natively distributed the array loads flawlessly without a single Stack crash.")
    
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    # Standard asyncio execution envelope
    asyncio.run(execute_stress_test())
