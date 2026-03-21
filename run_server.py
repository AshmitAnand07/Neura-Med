import uvicorn
import os

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("NEURAMED UNIFIED AI PRODUCTION ENGINE".center(60))
    print("=" * 60)
    
    # Pre-flight environment check
    missing_models = [m for m in ["interaction_model.pkl", "adherence_model.pkl"] if not os.path.exists(m)]
    
    if missing_models:
        print(f"⚠️  [WARNING] Missing Scikit-Learn ML Weights: {missing_models}")
        print("💡 TIP: Please execute `python run_all.py` first to auto-generate missing datasets and train the topologies natively!\n")
    else:
        print("✅ Core ML Weights Verified intact locally.")
        print("🚀 Igniting FastAPI Uvicorn Server on http://0.0.0.0:8000...\n")
        
    try:
        # Utilizing string architecture "main:app" correctly binds the ASGI workers
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except KeyboardInterrupt:
        print("\n[SHUTDOWN] Terminating ML backend routing loops gracefully...")
