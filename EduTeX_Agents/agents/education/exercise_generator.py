import os
import sys
import json
import argparse
from typing import Dict, Any, List

# Add project root to path
# Project root is ../../ from agents/education/
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

# Attempt to import skills
try:
    from skills.clean_numbers.scripts.verify import is_clean_number, verify_expression
except ImportError:
    # Fallback or mock if running in isolation
    pass

class ExerciseGenerator:
    """
    Role: The "Math Generator" (B)
    Responsibility: Create base exercises from prompts with clean numbers.
    """
    def __init__(self):
        self.role = "Math Generator"
        
    def generate(self, topic: str, difficulty: str = "medium") -> Dict[str, Any]:
        """
        Generates a math exercise based on the topic.
        In a real SaaS, this would call an LLM. Here we mock/template it for the MVP.
        """
        print(f"Agent {self.role}: Generating {difficulty} exercise for '{topic}'...")
        
        # Mock Logic for MVP - Templates
        if "quadratic" in topic.lower():
            return self._generate_quadratic(difficulty)
        elif "integral" in topic.lower():
            return self._generate_integral(difficulty)
        else:
            return {
                "type": "unknown",
                "latex": f"% Exercise for {topic} (Not implemented in MVP)",
                "solution": "N/A"
            }

    def _generate_quadratic(self, difficulty):
        """
        Generates a quadratic equation with integer roots (Clean Numbers).
        """
        # We want roots r1, r2 to be integers.
        # Equation: (x - r1)(x - r2) = x^2 - (r1+r2)x + r1*r2 = 0
        from random import randint
        
        r1 = randint(-5, 5)
        r2 = randint(-5, 5)
        
        # Ensure distinct roots for "hard"
        if difficulty == "hard" and r1 == r2:
            r2 += 1
            
        b = -(r1 + r2)
        c = r1 * r2
        
        # Formatting coeffs
        sign_b = "+" if b >= 0 else "-"
        abs_b = abs(b)
        str_b = f" {sign_b} {abs_b}x" if abs_b != 1 else f" {sign_b} x"
        if b == 0: str_b = ""
        
        sign_c = "+" if c >= 0 else "-"
        abs_c = abs(c)
        str_c = f" {sign_c} {abs_c}"
        if c == 0: str_c = ""

        equation = f"x^2{str_b}{str_c} = 0"
        
        latex = f"""
\\begin{{exercise}}
    Nα λύσετε την εξίσωση:
    \\[ {equation} \\]
\\end{{exercise}}
"""
        metadata = {
            "topic": "Quadratic Equations",
            "tags": ["algebra", "polynomials"],
            "difficulty": difficulty,
            "roots": [r1, r2],
            "clean_numbers": True
        }
        
        return {
            "latex": latex.strip(),
            "metadata": metadata,
            "raw_equation": equation
        }

    def _generate_integral(self, difficulty):
        # Placeholder for integrals
        return {
            "latex": "\\[ \\int x^2 \\,dx \\]",
            "metadata": {"topic": "Integrals", "difficulty": difficulty}
        }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Math Exercises")
    parser.add_argument("topic", help="Topic of the exercise (e.g. 'quadratic')")
    parser.add_argument("--difficulty", default="medium", help="Difficulty level")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")
    
    args = parser.parse_args()
    
    generator = ExerciseGenerator()
    result = generator.generate(args.topic, args.difficulty)
    
    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print("\n--- Generated Exercise ---")
        print(result["latex"])
        print("\n--- Metadata ---")
        print(json.dumps(result["metadata"], indent=2, ensure_ascii=False))
