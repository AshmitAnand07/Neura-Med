from pydantic import BaseModel, Field

class DrugInteractionRequest(BaseModel):
    drug1: str = Field(..., description="Name of the first drug")
    drug2: str = Field(..., description="Name of the second drug")

class DrugInteractionResponse(BaseModel):
    interaction: bool = Field(..., description="True if an interaction exists")
    severity: str = Field(..., description="Severity level: low, medium, or high")
    source: str = Field(..., description="Detection source: rule-based or ml")
    explanation: str = Field(..., description="Detailed explanation of the interaction findings")
