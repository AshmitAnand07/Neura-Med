import re

# Mock dataset of known interactions for the rule-based approach
KNOWN_INTERACTIONS = {
    frozenset(["aspirin", "warfarin"]): {
        "severity": "high",
        "explanation": "Increased risk of bleeding and hemorrhagic complications when taken together."
    },
    frozenset(["ibuprofen", "lisinopril"]): {
        "severity": "medium",
        "explanation": "NSAIDs may reduce the antihypertensive effect of ACE inhibitors."
    },
    frozenset(["amoxicillin", "clavulanate"]): {
        "severity": "low",
        "explanation": "Commonly combined safely, but monitor for gastrointestinal effects. No severe interaction."
    }
}

def normalize_drug_name(drug_name: str) -> str:
    """
    Simulates RxNorm-style standardization.
    Lowercases and removes special characters and dosages to find the active ingredient term.
    """
    if not drug_name:
        return ""
    # Remove standard dosages like '500mg' or '10ml'
    name = re.sub(r'\d+\s*(mg|ml|mcg|g)\b', '', drug_name.lower())
    # Strip all non-alphabetical characters except spaces
    name = re.sub(r'[^a-z\s]', '', name)
    return name.strip()

def check_rule_based_interaction(drug1: str, drug2: str):
    """
    Checks the local JSON/dictionary dataset for known high-priority interactions.
    Rule-based lookup should always take precedence over ML for medical safety.
    """
    normalized1 = normalize_drug_name(drug1)
    normalized2 = normalize_drug_name(drug2)
    
    pair = frozenset([normalized1, normalized2])
    
    if pair in KNOWN_INTERACTIONS:
        return KNOWN_INTERACTIONS[pair]
    
    return None

def extract_drug_features(drug1: str, drug2: str):
    """
    Dummy feature extraction for the ML fallback model.
    In a true production environment, this would convert drug SMILES chords or molecular 
    fingerprints into vector format (e.g. via RDKit).
    Here we extract lengths and character overlap as a placeholder feature vector.
    """
    d1 = normalize_drug_name(drug1)
    d2 = normalize_drug_name(drug2)
    
    len1 = len(d1)
    len2 = len(d2)
    # Number of shared letters as a mock structural similarity score
    overlap = len(set(d1).intersection(set(d2)))
    
    # Feature vector: [len_drug1, len_drug2, combined_length, char_overlap]
    return [[len1, len2, len1 + len2, overlap]]
