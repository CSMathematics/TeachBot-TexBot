import sys
import os
import json

# Add project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
sys.path.append(PROJECT_ROOT)

try:
    from agents.education.hint_generator import HintGenerator
    from agents.education.pitfall_detector import PitfallDetector
    from agents.education.rubric_designer import RubricDesigner
    from agents.education.mindmap_generator import MindmapGenerator
    from agents.education.prerequisite_checker import PrerequisiteChecker
    from agents.education.multi_method_solver import MultiMethodSolver
except ImportError as e:
    print(f"Error importing agents: {e}")
    sys.exit(1)

def run_test():
    print("Starting Phase 3 Integration Test...\n")
    
    mock_ex = {"metadata": {"topic": "Quadratic Equations"}}
    
    # 1. Hints
    print("--- 1. Generating Hints ---")
    hints = HintGenerator().generate_hints(mock_ex)
    print(f"Hints ({hints['count']}): {hints['hints'][:1]}...")

    # 2. Pitfalls
    print("\n--- 2. Detecting Pitfalls ---")
    pitfalls = PitfallDetector().detect_pitfalls(mock_ex)
    print(f"Pitfalls ({pitfalls['count']}): {pitfalls['pitfalls'][0]['error']}")

    # 3. Rubric
    print("\n--- 3. Designing Rubric ---")
    rubric = RubricDesigner().create_rubric(mock_ex)
    print(f"Total Points: {rubric['total_points']}")
    
    # 4. Mindmap
    print("\n--- 4. Mindmap Structure ---")
    print(MindmapGenerator().generate_mindmap_data("Quadratic Equations")["root"])

    # 5. Prerequisites
    print("\n--- 5. Readiness Check ---")
    print(PrerequisiteChecker().check_readiness(mock_ex)["status"])

    # 6. Alternative Methods
    print("\n--- 6. Alternative Methods ---")
    methods = MultiMethodSolver().solve_alternatives(mock_ex)
    print(f"Found {len(methods)} methods: {[m['method_name'] for m in methods]}")
    
    print("\nPhase 3 Test Complete!")

if __name__ == "__main__":
    run_test()
