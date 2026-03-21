import json
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

# Import the ML prediction hook from the previously established model
from interaction_model import predict_interaction



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

# Note: ML Model Pipeline logic and rule-based lookup exported for Gateway integration.
