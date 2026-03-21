import json
import os
import sys

# Force UTF-8 encoding for Windows terminal redirection compatibility
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        # Fallback for older Python versions
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def run_health_check():
    print("=" * 60)
    print("NEURAMED DATA HEALTH REPORT".center(60))
    print("=" * 60 + "\n")

    # 1. INTERACTION DATASET AUDIT
    interaction_path = "synthetic_interactions.json"
    if not os.path.exists(interaction_path):
        print(f"❌ [INTERACTIONS] Dataset '{interaction_path}' missing.")
    else:
        with open(interaction_path, 'r') as f:
            data = json.load(f)
        
        normalization_errors = 0
        conflicts = 0
        seen_pairs = {} # pair -> severity
        
        for item in data:
            d1, d2 = item["drug1"], item["drug2"]
            severity = item.get("severity", "none")
            
            # Check Normalization
            if d1 != d1.lower() or d2 != d2.lower():
                normalization_errors += 1
            
            # Check Conflicts
            pair = tuple(sorted([d1.lower(), d2.lower()]))
            if pair in seen_pairs:
                if seen_pairs[pair] != severity:
                    conflicts += 1
                    print(f"  -> Conflict Detected: {pair} exists as both '{severity}' and '{seen_pairs[pair]}'")
            else:
                seen_pairs[pair] = severity
        
        print(f"[1] Interaction Safety Audit:")
        print(f"    - Total Records   : {len(data)}")
        print(f"    - Normalization   : {'[OK] Pass' if normalization_errors == 0 else f'[WARN] Fail ({normalization_errors} non-lowercase keys)'}")
        print(f"    - Conflict-Free   : {'[OK] Pass' if conflicts == 0 else f'[WARN] Fail ({conflicts} duplicate conflicts)'}")


    # 2. ADHERENCE LOGS AUDIT
    adherence_path = "synthetic_adherence_logs.json"
    if not os.path.exists(adherence_path):
        print(f"\n[FAIL] [ADHERENCE] Dataset '{adherence_path}' missing.")
    else:
        with open(adherence_path, 'r') as f:
            logs = json.load(f)
            
        binary_errors = 0
        total_logs = 0
        
        for pat_id, history in logs.items():
            for entry in history:
                total_logs += 1
                if not isinstance(entry.get("taken"), bool):
                    binary_errors += 1
        
        print(f"\n[2] Adherence Telemetry Audit:")
        print(f"    - Total Log Events: {total_logs}")
        print(f"    - Binary Integrity: {'[OK] Pass' if binary_errors == 0 else f'[WARN] Fail ({binary_errors} non-boolean values)'}")


    # 3. FEATURE RANGE AUDIT (In-Memory Probe)
    print(f"\n[3] Feature Topology Analysis:")
    # Simulate a drift test
    try:
        from adherence_model import AdherenceModelTrainer
        trainer = AdherenceModelTrainer()
        # Edge case: All taken, All missed, empty
        edge_cases = [
            [{"taken": True}] * 10,
            [{"taken": False}] * 10,
            []
        ]
        ranges_valid = True
        for case in edge_cases:
            feat = trainer.extract_features(case)[0][1] # Get adherence_rate
            if feat < 0.0 or feat > 1.0:
                ranges_valid = False
                print(f"  -> Range Collision: Features returned {feat}")
        
        print(f"    - Rate Bounding  : {'[OK] Pass (0.0 - 1.0)' if ranges_valid else '[WARN] Fail (Feature Drift Detected)'}")
    except Exception as e:
        print(f"    - Rate Bounding  : [WARN] Test Bypass (Could not import adherence_model logic: {str(e)})")

    print("\n" + "=" * 60)
    print("AUDIT COMPLETE".center(60))
    print("=" * 60 + "\n")

if __name__ == "__main__":
    run_health_check()
