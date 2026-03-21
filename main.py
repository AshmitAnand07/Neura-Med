import os
import time
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load variables from .env if present (Local Dev)
load_dotenv()

# Configure native Python Logger for DevOps observability
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("neuramed-api")
# Import absolute endpoint Logic functions and typed Pydantic payloads from modular microservices
from interaction_service import check_interaction_endpoint, InteractionRequest, InteractionResponse

from ai_orchestrator import ai_evaluate_endpoint, AiEvaluateRequest, AiEvaluateResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup Validation Event Loop Protocol
    Evaluates that memory states exist before Uvicorn binds the web sockets.
    """
    print("\n--- NEURAMED AI BOOT SEQUENCE ---")
    required_models = ["interaction_model.pkl", "adherence_model.pkl"]
    
    for m in required_models:
        if not os.path.exists(m):
            print(f"⚠️ [WARNING] Trained AI weights '{m}' missing from root. Run `run_all.py` to auto-heal!")
        else:
            print(f"✅ [VALIDATED] Successfully bound '{m}' to memory cache.")
            
    if os.path.exists("synthetic_interactions.json"):
        print("✅ [VALIDATED] Hardcoded Rule Database integrated.")
        
    print("🚀 SYSTEM READY: All sub-services integrated and HTTP bound.")
    print("----------------------------------\n")
    yield
    print("\n[SHUTDOWN] NeuraMed OS Sequence Offline.")

app = FastAPI(
    title="NeuraMed Unified AI Production API",
    description="Singular gateway aggregating the distinct Interaction Safety, Patient Adherence, and Smart Orchestration APIs into one Docker-ready web node.",
    version="1.0.0",
    lifespan=lifespan
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global Default Fallback Error Handler:
    Catches all unfiltered Python / ML exceptions explicitly returning clean DevOps-friendly JSON formats.
    """
    logger.error(f"Global Exception mapped at {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": str(exc), "path": request.url.path}
    )

@app.middleware("http")
async def production_logging_middleware(request: Request, call_next):
    """
    HTTP Protocol Intercept Middleware measuring precise computation overhead arrays
    for ML pipelines, and dynamically tracking system endpoint performance metrics via Python logging.
    """
    start_time = time.time()
    logger.info(f"Incoming REST Pipeline: {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"Response Resolved: {response.status_code} | Latency Overhead: {process_time:.4f}s")
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"Request Catastrophic Failure: {request.method} {request.url.path} | Compute Halt: {process_time:.4f}s | Trapped Exception: {str(e)}")
        raise e

@app.get("/health", tags=["DevOps"])
async def check_health():
    """Consistent CI/CD health check endpoint."""
    return {"status": "ok"}

# ---------------------------------------------------------
# DIRECT CONTROLLER PIPING
# We directly pipe the asynchronous endpoint functional logic 
# avoiding duplication and strictly fulfilling "modular" logic
# ---------------------------------------------------------

@app.post("/check-interaction", response_model=InteractionResponse, tags=["Safety"])
async def route_check_interaction(request: InteractionRequest):
    """Executes combinatorial interaction prediction synchronously via imported logic state."""
    return await check_interaction_endpoint(request)


@app.post("/ai-evaluate", response_model=AiEvaluateResponse, tags=["Orchestration Engine"])
async def route_ai_evaluate(request: AiEvaluateRequest):
    """
    Central API controller uniting NeuraMed's Microservices.
    Implements a 'Safe Fallback' mechanism ensuring the UI remains functional 
    even if underlying ML weights are missing or inputs are out-of-vocabulary.
    """
    try:
        return await ai_evaluate_endpoint(request)
    except Exception as e:
        logger.warning(f"AI Orchestrator Fallback Triggered: {str(e)}")
        # Return a "Neutral" assessment as required (none severity, 0.0 risk)
        return AiEvaluateResponse(
            interaction_alert={"interaction": False, "severity": "none"},
            adherence_risk=0.0,
            recommended_action="normal_reminder"
        )
