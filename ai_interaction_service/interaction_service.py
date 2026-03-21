from fastapi import APIRouter
from interaction_schema import DrugInteractionRequest, DrugInteractionResponse
from interaction_utils import check_rule_based_interaction
from interaction_model import ml_fallback_model

router = APIRouter()

@router.post("/check-interaction", response_model=DrugInteractionResponse)
async def check_interaction_endpoint(request: DrugInteractionRequest):
    """
    Main service pipeline for Drug Interaction Detection.
    
    1. First passes drugs against Rule-Based engine for strict safety protocols.
    2. Uses Scikit-learn Random Forest model only as a fallback.
    """
    drug1 = request.drug1
    drug2 = request.drug2
    
    # 1. Rule-based lookup (Highest Priority -> absolute deterministic safety)
    rule_result = check_rule_based_interaction(drug1, drug2)
    
    if rule_result:
        is_interaction = rule_result["severity"] in ["low", "medium", "high"]
        
        return DrugInteractionResponse(
            interaction=is_interaction,
            severity=rule_result["severity"],
            source="rule-based",
            explanation=rule_result["explanation"]
        )
        
    # 2. ML Model Fallback (When no hardcoded rule exists)
    ml_result = ml_fallback_model.predict_interaction(drug1, drug2)
    
    return DrugInteractionResponse(
        interaction=ml_result["interaction"],
        severity=ml_result["severity"],
        source="ml",
        explanation=ml_result["explanation"]
    )
