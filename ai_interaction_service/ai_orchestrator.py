from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Logic imports from our modular ML pipeline
from interaction_utils import check_rule_based_interaction
from interaction_model import ml_fallback_model

from adherence_model import adherence_model_instance

from reminder_optimizer import extract_bandit_context, calculate_best_timestamp
from bandit_model import contextual_bandit_instance

router = APIRouter()

class PatientData(BaseModel):
    day_of_week: Optional[int] = Field(None, description="0=Monday, 6=Sunday")
    previous_response_rate: float = Field(..., description="Overall historic completion rate 0.0-1.0")
    notification_type: str = Field(..., description="'push', 'sms', or 'email'")

class AiEvaluateRequest(BaseModel):
    patient_data: PatientData
    medicines: List[str] = Field(..., description="List of current drug names")
    adherence_logs: List[Dict[str, Any]] = Field(..., description="List of historical adherence dicts")
    target_time_iso: Optional[str] = Field(None, description="Expected next natural schedule time ISO 8601")

class InteractionAlert(BaseModel):
    drug_pair: List[str]
    severity: str
    explanation: str
    source: str

class AiEvaluateResponse(BaseModel):
    interaction_alerts: List[InteractionAlert]
    adherence_risk: float
    optimized_reminder_time: str

@router.post("/ai-evaluate", response_model=AiEvaluateResponse)
async def ai_evaluate_endpoint(request: AiEvaluateRequest):
    """
    Central API controller uniting NeuraMed's Microservices.
    Simultaneously executes:
    1. O(N^2) combinatorial pairwise drug interaction safety checks.
    2. Logistic regression adherence dropout predictions.
    3. Epsilon-greedy bandit optimizations for reminder delivery.
    """
    alerts: List[InteractionAlert] = []
    
    # 1. Evaluate Drug Interactions (Filters critically dangerous compounds)
    meds = request.medicines
    # Pairwise comparison (combinations)
    for i in range(len(meds)):
        for j in range(i + 1, len(meds)):
            d1 = meds[i]
            d2 = meds[j]
            
            # Rule-Based Check (Highest Priority)
            rule_result = check_rule_based_interaction(d1, d2)
            if rule_result:
                if rule_result["severity"] in ["high", "medium"]:
                    alerts.append(InteractionAlert(
                        drug_pair=[d1, d2],
                        severity=rule_result["severity"],
                        explanation=rule_result["explanation"],
                        source="rule-based"
                    ))
            else:
                # ML Fallback Check
                ml_res = ml_fallback_model.predict_interaction(d1, d2)
                if ml_res["interaction"] and ml_res["severity"] in ["high", "medium"]:
                    alerts.append(InteractionAlert(
                        drug_pair=[d1, d2],
                        severity=ml_res["severity"],
                        explanation=ml_res["explanation"],
                        source="ml"
                    ))
                    
    # 2. Extract Timing Contexts for the Time-series Models
    if request.target_time_iso:
        clean_iso = request.target_time_iso.replace("Z", "+00:00")
        try:
            target_dt = datetime.fromisoformat(clean_iso)
        except ValueError:
            target_dt = datetime.utcnow()
    else:
        target_dt = datetime.utcnow()
        
    target_hour = target_dt.hour
    target_day = target_dt.weekday()
    
    # 3. Request Logistic Regression Adherence Predictions
    adherence_risk = adherence_model_instance.predict_miss_probability(
        request.adherence_logs, target_hour, target_day
    )
    
    # 4. Request Epsilon-Greedy Optimizer Route
    ctx_dict = request.patient_data.dict()
    if ctx_dict.get("day_of_week") is None:
        ctx_dict["day_of_week"] = target_day
        
    context_vector = extract_bandit_context(ctx_dict)
    best_hour, confidence = contextual_bandit_instance.select_action(context_vector)
    best_iso_time = calculate_best_timestamp(best_hour)
    
    return AiEvaluateResponse(
        interaction_alerts=alerts,
        adherence_risk=adherence_risk,
        optimized_reminder_time=best_iso_time
    )
