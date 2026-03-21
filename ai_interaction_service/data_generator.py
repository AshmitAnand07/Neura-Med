import json
import random
import datetime
from typing import List, Dict, Any

def generate_interaction_dataset(num_pairs: int = 1000) -> List[Dict[str, str]]:
    """
    Generates a mock dataset of drug pairs and their interaction severity.
    Ensures class imbalance: Most drugs do NOT interact (severity: 'none').
    """
    # Extended mock list of real-world drug active ingredients
    drugs = [
        "aspirin", "warfarin", "ibuprofen", "lisinopril", "amoxicillin", 
        "clavulanate", "metformin", "atorvastatin", "amlodipine", 
        "omeprazole", "simvastatin", "losartan", "albuterol", "gabapentin",
        "hydrochlorothiazide", "sertraline", "fluticasone", "tramadol", 
        "citalopram", "azithromycin"
    ]
    
    dataset = []
    seen_pairs = set()
    
    # Calculate maximum possible unique pairs (Combinations nCr where r=2)
    max_pairs = (len(drugs) * (len(drugs) - 1)) // 2
    actual_target = min(num_pairs, max_pairs)
    
    while len(dataset) < actual_target:
        d1, d2 = random.sample(drugs, 2)
        # Normalize strictly to prevent casing-based duplication
        d1, d2 = d1.lower().strip(), d2.lower().strip()
        
        # Ensure alphabetical order for uniqueness
        pair = tuple(sorted([d1, d2]))
        if pair in seen_pairs:
            continue
            
        seen_pairs.add(pair)
        
        # Intentional Class Imbalance Distribution: 
        # ~80% None, ~12% Low, ~6% Medium, ~2% High
        rand_val = random.random()
        if rand_val < 0.80:
            severity = "none"
        elif rand_val < 0.92:
            severity = "low"
        elif rand_val < 0.98:
            severity = "medium"
        else:
            severity = "high"
            
        dataset.append({
            "drug1": pair[0],
            "drug2": pair[1],
            "severity": severity
        })
            
    return dataset

def generate_adherence_logs(num_patients: int = 100, days: int = 30) -> Dict[str, List[Dict[str, Any]]]:
    """
    Generates 30-day historical adherence logs per synthetic patient.
    Distributes patients into realistic archetypes models:
    - Highly adherent (~80% of patients)
    - Sporadic (~15% of patients)
    - Non-adherent (~5% of patients)
    """
    patients_data = {}
    base_date = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    
    for i in range(1, num_patients + 1):
        patient_id = f"PATIENT_{i:03d}"
        logs = []
        
        # Determine archetype
        rand_val = random.random()
        if rand_val < 0.80:
            adherence_prob = random.uniform(0.85, 1.0)
        elif rand_val < 0.95:
            adherence_prob = random.uniform(0.40, 0.85)
        else:
            adherence_prob = random.uniform(0.10, 0.40)
            
        # Optional: Introduce "missed streak" clusters for mid-adherence patients
        in_streak = False
        streak_length = 0
            
        for day_offset in range(days):
            log_date = base_date + datetime.timedelta(days=day_offset)
            
            # Simulate a realistic scheduled time block (e.g. 08:00 or 20:00)
            scheduled_hour = random.choice([8, 20])
            log_time = log_date.replace(hour=scheduled_hour, minute=0, second=0, microsecond=0)
            
            # Determine if taken utilizing streak multipliers if needed
            if in_streak and streak_length < 3:
                taken = False
                streak_length += 1
                if streak_length == 3:
                    in_streak = False
            else:
                taken = random.random() < adherence_prob
                if not taken and adherence_prob > 0.4:
                    # Random chance to enter a localized missed streak
                    in_streak = random.random() < 0.2
                    streak_length = 1
            
            logs.append({
                "date": log_time.isoformat() + "Z",
                "taken": taken
            })
            
        patients_data[patient_id] = logs
        
    return patients_data

def save_to_json(data: Any, filename: str):
    """Utility wrapper for consistent encoding specifications."""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
        
if __name__ == "__main__":
    print("Booting Synthetic Dataset Generator...")
    
    print("\n1. Generating Drug Interaction Dataset (Class Imbalanced)...")
    # Generates maximum possible pairs from our 20 drugs (190 combinations)
    interaction_data = generate_interaction_dataset(num_pairs=500)
    save_to_json(interaction_data, "synthetic_interactions.json")
    print(f" -> Successfully saved {len(interaction_data)} interaction records to 'synthetic_interactions.json'")
    
    print("\n2. Generating Adherence Patient Histories...")
    # Generates 30 patients, each harboring 30 days of data via Archetypes
    adherence_data = generate_adherence_logs(num_patients=100, days=30)
    save_to_json(adherence_data, "synthetic_adherence_logs.json")
    print(f" -> Successfully saved historical logs for {len(adherence_data)} patients to 'synthetic_adherence_logs.json'")
    
    print("\n[Done] Pipeline Ready! Models can now be re-trained utilizing these `.json` blobs natively.")
