import uvicorn
from fastapi import FastAPI
from interaction_service import router as interaction_router
from adherence_service import router as adherence_router
from reminder_service import router as reminder_router
from ai_orchestrator import router as orchestrator_router

# Initialize core FastAPI instance
app = FastAPI(
    title="NeuraMed ML Interaction API",
    description="Python-based analytical engine containing Adherence Prediction, Timing Optimization, and Interaction detection utilizing Sklearn and Rule-based systems.",
    version="1.0.0"
)

# Connect the cleanly abstracted service routers
app.include_router(interaction_router)
app.include_router(adherence_router)
app.include_router(reminder_router)
app.include_router(orchestrator_router)

@app.get("/")
def health_check():
    """Simple status route for DevOps/Docker to ensure the Python container is alive."""
    return {"status": "ok", "service": "NeuraMed Python ML Layer", "version": "1.0.0"}

if __name__ == "__main__":
    # Provides simple command to run the Python module natively 
    # e.g.: `python main.py` triggers Uvicorn dev server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
