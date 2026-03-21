import numpy as np
from sklearn.ensemble import RandomForestClassifier
from interaction_utils import extract_drug_features

class DrugInteractionModel:
    """
    ML Fallback model for detecting interactions between unknown or unmapped drug pairs.
    """
    def __init__(self):
        # Initialize a fallback sklearn model utilizing RandomForest
        self.model = RandomForestClassifier(n_estimators=10, random_state=42)
        self._train_dummy_model()

    def _train_dummy_model(self):
        """
        Trains the model on a dummy structural dataset.
        Inputs format: [len1, len2, total_len, overlap]
        Classes: 0=None, 1=Low, 2=Medium, 3=High
        """
        # X: Mock array of feature shapes
        X_dummy = np.array([
            [5, 5, 10, 2], [8, 8, 16, 4], [10, 5, 15, 1],
            [4, 6, 10, 3], [12, 10, 22, 5], [7, 7, 14, 0]
        ])
        
        # y: Corresponding target interactions
        y_dummy = np.array([0, 2, 0, 1, 3, 0])
        
        self.model.fit(X_dummy, y_dummy)

    def predict_interaction(self, drug1: str, drug2: str) -> dict:
        """
        Predicts interaction probability and severity using the ML model structure.
        Ensures high-severity outputs are flagged with extreme prejudice.
        """
        features = extract_drug_features(drug1, drug2)
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        
        # Mapping numerical output classes back to severity strings
        severity_map = {0: "none", 1: "low", 2: "medium", 3: "high"}
        severity = severity_map.get(prediction, "none")
        
        # Calculate confidence percentage
        confidence = round(max(probabilities) * 100, 2)
        interaction = severity != "none"
        
        explanation = f"ML model predicted a '{severity}' severity interaction with {confidence}% confidence based on extracted drug features."
        
        # Safety strict requirement: high-risk must always return warning flag
        if severity == "high":
            explanation = f"WARNING [HIGH RISK]: {explanation} Extreme medical caution advised."
            
        if not interaction:
            explanation = "ML model found no significant structural markers or vectors indicating an interaction."
            
        return {
            "interaction": interaction,
            "severity": severity if interaction else "low", # Enforces type matching for schema
            "explanation": explanation
        }

# Instantiate singleton for the FastAPI router memory
ml_fallback_model = DrugInteractionModel()
