import os
import json
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# Configuration Paths - Assuming synthetic_interactions.json was generated in the current execution folder
DATASET_PATH = "synthetic_interactions.json"
MODEL_PATH = "interaction_model.pkl"
ENCODER_PATH = "drug_encoder.pkl"

class DrugInteractionModelPipeline:
    def __init__(self):
        self.model = None
        self.label_encoder = LabelEncoder()
        # Explicit Mapping for Multiclass Severity
        self.severity_map = {"none": 0, "low": 1, "medium": 2, "high": 3}
        self.reverse_severity_map = {0: "none", 1: "low", 2: "medium", 3: "high"}
        
        # Hydrate the model continuously if it previously exists
        if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
            self.model = joblib.load(MODEL_PATH)
            self.label_encoder = joblib.load(ENCODER_PATH)

    def train(self):
        """
        Pipeline Execution:
        1. Validates dataset existence.
        2. Fits label embeddings for structural dimensions.
        3. Trains an imbalanced-aware RandomForest.
        4. Serializes models to disk safely.
        """
        # Requirement: Clear error message if dataset is missing
        if not os.path.exists(DATASET_PATH):
            raise FileNotFoundError(f"CRITICAL ML ERROR: Required training dataset '{DATASET_PATH}' was not found. Please execute the data generator script first.")

        with open(DATASET_PATH, 'r') as f:
            data = json.load(f)

        if not data:
            raise ValueError("CRITICAL ML ERROR: Dataset is mathematically empty.")

        # 1. Vocabulary extraction for consistent embedding
        all_drugs = set()
        for item in data:
            all_drugs.add(item["drug1"])
            all_drugs.add(item["drug2"])

        # Sort array deterministically to lock encoder weights across different environments
        self.label_encoder.fit(sorted(list(all_drugs)))

        X = []
        y = []

        for item in data:
            # 2. Vectorization - Transform drugs into mathematical integer arrays
            d1_encoded = self.label_encoder.transform([item["drug1"]])[0]
            d2_encoded = self.label_encoder.transform([item["drug2"]])[0]

            # Structure forces order-agnostic memory so [drug1, drug2] == [drug2, drug1]
            features = sorted([d1_encoded, d2_encoded])
            X.append(features)

            # 3. Y Output Vector Transformation
            target = self.severity_map.get(item["severity"], 0)
            y.append(target)

        X = np.array(X)
        y = np.array(y)

        # 4. Fit the ML Core
        print("Training RandomForest Classifier on interaction combinations...")
        # Utilize class_weight="balanced" specifically because 'none' dominates the 80% distribution
        self.model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced")
        self.model.fit(X, y)
        print("Model topology training complete.")

        # 5. Disk Serialization
        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(self.label_encoder, ENCODER_PATH)
        print(f"Artifacts successfully serialized to '{MODEL_PATH}'.")

    def _encode_drug_safe(self, drug: str) -> int:
        """Helper to catch out-of-vocabulary injections without destroying inference."""
        if drug in self.label_encoder.classes_:
            return self.label_encoder.transform([drug])[0]
        else:
            # Standard NLP pattern: Return integer bound that Random Forest will segment uniquely
            return -1

    def do_prediction(self, drug1: str, drug2: str) -> dict:
        """Calculates probabilistic boundaries on incoming drug strings."""
        if self.model is None:
            raise RuntimeError("Model weight graph is uninitialized. Call .train() first.")

        d1_encoded = self._encode_drug_safe(drug1.lower().strip())
        d2_encoded = self._encode_drug_safe(drug2.lower().strip())

        feature_vector = np.array([sorted([d1_encoded, d2_encoded])])

        # Execute tree traversal inference
        pred_class = self.model.predict(feature_vector)[0]
        probabilities = self.model.predict_proba(feature_vector)[0]

        severity_result = self.reverse_severity_map.get(pred_class, "none")
        confidence_metric = max(probabilities)
        
        return {
            "interaction": severity_result != "none",
            "probability": round(float(confidence_metric), 4),
            "severity": severity_result
        }

# Exposed purely functional interface as requested:
def predict_interaction(drug1: str, drug2: str) -> dict:
    """
    Public access function:
    Output -> interaction probability + severity classification
    """
    pipeline = DrugInteractionModelPipeline()
    if pipeline.model is None:
        print("Auto-triggering Training Pipeline...")
        pipeline.train()
        
    return pipeline.do_prediction(drug1, drug2)

if __name__ == "__main__":
    ml_system = DrugInteractionModelPipeline()
    ml_system.train()
    
    # Diagnostic test bounds
    print("\nDiagnostic Unit Tests:")
    try:
        print("Aspirin vs Warfarin:", predict_interaction("aspirin", "warfarin"))
    except Exception as e:
        print(f"Simulation failed cleanly as designed: {str(e)}")
