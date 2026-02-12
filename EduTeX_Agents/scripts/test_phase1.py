import sys
import os
import json

# Add project root to path
# Project root is ../ from scripts/
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
sys.path.append(PROJECT_ROOT)

try:
    from agents.education.exercise_generator import ExerciseGenerator
    from agents.education.solution_writer import SolutionWriter
    from agents.education.isomorphic_generator import IsomorphicGenerator
except ImportError as e:
    print(f"Error importing agents: {e}")
    sys.exit(1)

def run_test():
    print("Starting Phase 1 Integration Test...\n")
    
    # 1. Generate Exercise
    print("--- Step 1: Generating Exercise (Quadratic) ---")
    gen = ExerciseGenerator()
    exercise = gen.generate("quadratic", "medium")
    print(f"LaTeX: {exercise['latex']}")
    print(f"Metadata: {exercise['metadata']}\n")
    
    # 2. Solve Exercise
    print("--- Step 2: Solving Exercise ---")
    solver = SolutionWriter()
    solution = solver.solve(exercise)
    print(f"Solution LaTeX:\n{solution['solution_latex']}\n")
    
    # 3. Generate Variation
    print("--- Step 3: Generating Variation (Isomorphic) ---")
    iso = IsomorphicGenerator()
    variations = iso.generate_variations(exercise, count=1)
    print(f"Variation LaTeX: {variations[0]['latex']}")
    print(f"Variation Metadata: {variations[0]['metadata']}\n")
    
    print("Phase 1 Test Complete!")

if __name__ == "__main__":
    run_test()
