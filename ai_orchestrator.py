import os
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any

# Root directory ML paths
INTERACTION_MODEL_PATH = "interaction_model.pkl"
ADHERENCE_MODEL_PATH = "adherence_model.pkl"
ENCODER_PATH = "drug_encoder.pkl"

class NeuraMedOrchestrator:
    """
    Singleton AI Controller:
    Responsible for loading serialized Scikit-Learn binaries and executing 
    multi-vector inferences across the Interaction and Adherence pipelines.
    """
    def __init__(self):
        self.interaction_model = None
        self.adherence_model = None
        self.drug_encoder = None
        
        # Metadata maps from training pipeline
        self.reverse_severity_map = {0: "none", 1: "low", 2: "medium", 3: "high"}
        
        self.load_models()

    def load_models(self):
        """Attempts to hydrate models from disk. Defaults to None if missing."""
        try:
            if os.path.exists(INTERACTION_MODEL_PATH):
                self.interaction_model = joblib.load(INTERACTION_MODEL_PATH)
            if os.path.exists(ADHERENCE_MODEL_PATH):
                self.adherence_model = joblib.load(ADHERENCE_MODEL_PATH)
            if os.path.exists(ENCODER_PATH):
                self.drug_encoder = joblib.load(ENCODER_PATH)
        except Exception as e:
            print(f"⚠️ [ORCHESTRATOR] Failed to load model binaries: {str(e)}")

    def _encode_drug(self, drug_name: str) -> int:
        """Internal Normalization & Safe Encoding Pipeline."""
        name = drug_name.lower().strip()
        if self.drug_encoder and name in self.drug_encoder.classes_:
            return int(self.drug_encoder.transform([name])[0])
        else:
            # Fallback for Out-of-Vocabulary (OOV) drugs
            return -1

    def evaluate(self, request_data: Any) -> Dict[str, Any]:
        """Executes the complete inference loop with safety fallbacks."""
        # 1. Prediction for Drug Interaction (Random Forest)
        interaction_result = {"interaction": False, "severity": "none"}
        
        if self.interaction_model and self.drug_encoder:
            d1_enc = self._encode_drug(request_data.drug1)
            d2_enc = self._encode_drug(request_data.drug2)
            
            # Feature Vector: Sorted tuple to ensure order-agnosticism [DrugA, DrugB] == [DrugB, DrugA]
            features = np.array([sorted([d1_enc, d2_enc])])
            
            pred_idx = self.interaction_model.predict(features)[0]
            severity = self.reverse_severity_map.get(pred_idx, "none")
            
            interaction_result = {
                "interaction": severity != "none",
                "severity": severity
            }

        # 2. Prediction for Adherence Risk (Logistic Regression)
        adherence_risk = 0.0
        if self.adherence_model:
            # Re-use extract_features logic from adherence_model or re-implement here for speed
            from adherence_model import AdherenceModelTrainer
            trainer = AdherenceModelTrainer() 
            # Note: We use the already loaded model weight inside the trainer for prediction
            # but here we can just call the public risk function.
            # To fulfill "joblib.load once", we'd ideally move extraction here.
            
            hist = request_data.adherence_history
            adherence_risk = self._predict_adherence_risk(hist)

        # 3. Decision Matrix
        recommended_action = "normal_reminder"
        if interaction_result["severity"] == "high":
            recommended_action = "critical_alert"
        elif adherence_risk > 0.7:
            recommended_action = "early_reminder"

        return {
            "interaction_alert": interaction_result,
            "adherence_risk": round(float(adherence_risk), 4),
            "recommended_action": recommended_action
        }

    def _predict_adherence_risk(self, history: List[Dict[str, Any]]) -> float:
        """Isolated Adherence prediction using the pre-loaded joblib weights."""
        if not self.adherence_model: return 0.0
        
        # Feature Extraction Logic
        total = len(history)
        taken = sum(1 for log in history if log.get("taken"))
        rate = taken / total if total > 0 else 1.0
        
        streak = 0
        for log in reversed(history):
            if not log.get("taken"): streak += 1
            else: break
            
        last_3 = history[-3:]
        last_3_taken = sum(1 for log in last_3 if log.get("taken"))
        
        features = np.array([[streak, rate, last_3_taken]])
        
        # Get probability of 'Class 1' (Miss/Dropout)
        risk = self.adherence_model.predict_proba(features)[0][1]
        return risk

class InteractionAlertData(BaseModel):
    interaction: bool
    severity: str

class AiEvaluateRequest(BaseModel):
    patient_id: int
    drug1: str
    drug2: str
    adherence_history: List[Dict[str, Any]]

class AiEvaluateResponse(BaseModel):
    interaction_alert: InteractionAlertData
    adherence_risk: float
    recommended_action: str

# Initialize Singleton Orchestrator
orchestrator = NeuraMedOrchestrator()

