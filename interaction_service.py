import json
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

# Import the ML prediction hook from the previously established model
from interaction_model import predict_interaction

app = FastAPI(title="Interaction Service Layer")

class InteractionRequest(BaseModel):
    drug1: str = Field(..., min_length=1, description="First drug active ingredient", json_schema_extra={"example": "aspirin"})
    drug2: str = Field(..., min_length=1, description="Second drug active ingredient", json_schema_extra={"example": "warfarin"})

class InteractionResponse(BaseModel):
    interaction: bool = Field(..., description="True if any risky interaction occurs")
    severity: str = Field(..., description="'none', 'low', 'medium', or 'high'")
    source: str = Field(..., description="'rule' if found natively in JSON, 'ml' if fallback used")

DATASET_PATH = "synthetic_interactions.json"

def check_rule_based(drug1: str, drug2: str) -> Optional[Dict[str, Any]]:
    """
    Cross-references the static synthetic dataset for known hardcoded rules.
    Operates synchronously to provide highest-priority deterministic safety maps.
    """
    if not os.path.exists(DATASET_PATH):
        # Dataset not found, gracefully skip to ML layer
        return None
        
    try:
        with open(DATASET_PATH, "r") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        return None
            
    # Standardize casing to avoid false negatives
    d1 = drug1.lower().strip()
    d2 = drug2.lower().strip()
    
    target_pair = set([d1, d2])
    
    for item in data:
        item_pair = set([item["drug1"].lower(), item["drug2"].lower()])
        if target_pair == item_pair:
            # Rule found!
            return {
                "interaction": item["severity"] != "none",
                "severity": item["severity"],
                "source": "rule"
            }
            
    # Rule not present in static database
    return None

@app.post("/check-interaction", response_model=InteractionResponse)
async def check_interaction_endpoint(request: InteractionRequest):
    """
    Evaluates medication combinations combining absolute hardcoded safety rules
    with a predictive Scikit-Learn Random Forest fallback topology.
    """
    # 1. Primary Rule-Based Lookup (Deterministic Safety Pipeline)
    rule_result = check_rule_based(request.drug1, request.drug2)
    
    if rule_result is not None:
        return InteractionResponse(**rule_result)
        
    # 2. ML Engine Fallback 
    # (interaction_model.py natively loads 'interaction_model.pkl' when invoked)
    try:
        ml_prediction = predict_interaction(request.drug1, request.drug2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML Model Pipeline Error: {str(e)}")
        
    return InteractionResponse(
        interaction=ml_prediction["interaction"],
        severity=ml_prediction["severity"],
        source="ml"
    )

if __name__ == "__main__":
    import uvicorn
    # Execute standalone API hook
    uvicorn.run("interaction_service:app", host="0.0.0.0", port=8000, reload=True)
