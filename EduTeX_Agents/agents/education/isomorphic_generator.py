import argparse
import json
import sys
import os

# Add project root to path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

try:
    # Try package import (Runtime / Full Context)
    from agents.education.exercise_generator import ExerciseGenerator
except ImportError:
    # Fallback to local import (IDE / Direct Script Run)
    from exercise_generator import ExerciseGenerator

class IsomorphicGenerator:
    """
    Role: The "Twin Generator" (B)
    Responsibility: Create N variations of an exercise.
    """
    def __init__(self):
        self.generator = ExerciseGenerator()

    def generate_variations(self, input_exercise, count=1):
        """
        Generates 'count' variations based on the input exercise's metadata.
        """
        print(f"Agent IsomorphicGenerator: Creating {count} variations...")
        
        data = input_exercise if isinstance(input_exercise, dict) else json.loads(input_exercise)
        metadata = data.get("metadata", {})
        topic = metadata.get("topic", "")
        difficulty = metadata.get("difficulty", "medium")
        
        variations = []
        
        # Simple implementation: Re-run generator N times.
        # Future improvement: Ensure unique roots from original.
        for i in range(count):
            new_exercise = self.generator.generate(topic, difficulty)
            variations.append(new_exercise)
            
        return variations

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Isomorphic Variations")
    parser.add_argument("input_file", help="JSON file containing the original exercise")
    parser.add_argument("--count", type=int, default=1, help="Number of variations")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")

    args = parser.parse_args()
    
    try:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            original = json.load(f)
            
        iso = IsomorphicGenerator()
        vars = iso.generate_variations(original, args.count)
        
        if args.json:
            print(json.dumps(vars, indent=2, ensure_ascii=False))
        else:
            print(f"\n--- Generated {len(vars)} Variations ---")
            for idx, var in enumerate(vars):
                print(f"\nVariation {idx+1}:")
                print(var["latex"])
                
    except Exception as e:
        print(f"Error: {e}")
