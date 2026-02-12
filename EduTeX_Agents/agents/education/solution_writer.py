import json
import argparse
import sys

class SolutionWriter:
    """
    Role: The "Solver & Validator" (C)
    Responsibility: Generate step-by-step LaTeX solutions for valid exercises.
    """
    def __init__(self):
        self.role = "Solver"

    def solve(self, exercise_json):
        """
        Generates a LaTeX solution for the given exercise data.
        """
        print(f"Agent {self.role}: solving exercise...")
        
        data = exercise_json if isinstance(exercise_json, dict) else json.loads(exercise_json)
        metadata = data.get("metadata", {})
        topic = metadata.get("topic", "").lower()
        
        if "quadratic" in topic:
            return self._solve_quadratic(data)
        else:
             return {
                "solution_latex": "% Solution not implemented for this topic yet."
            }

    def _solve_quadratic(self, data):
        """
        Generates step-by-step solution for quadratic equation.
        """
        # Metadata contains roots r1, r2
        metadata = data.get("metadata", {})
        roots = metadata.get("roots", [])
        
        if not roots or len(roots) != 2:
            return {"solution_latex": "% Error: Missing roots in metadata"}
        
        r1, r2 = sorted(roots) # Sort for consistent order
        
        # Reconstruct coeffs for display
        b = -(r1 + r2)
        c = r1 * r2
        
        # Calculate Discriminant
        delta = b**2 - 4*1*c
        
        # Steps
        steps = f"""
\\begin{{solution}}
    Η εξίσωση είναι της μορφής $ax^2 + bx + c = 0$ με $a=1, b={b}, c={c}$.
    
    1. Υπολογίζουμε τη Διακρίνουσα:
    \\[ \\Delta = b^2 - 4ac = ({b})^2 - 4 \\cdot 1 \\cdot ({c}) = {b**2} - ({4*c}) = {delta} \\]
    
    2. Επειδή $\\Delta > 0$, η εξίσωση έχει δύο ρίζες πραγματικές και άνισες:
    \\[ x_{{1,2}} = \\frac{{-b \\pm \\sqrt{{\\Delta}}}}{{2a}} = \\frac{{-({b}) \\pm \\sqrt{{{delta}}}}}{{2}} = \\frac{{{-b} \\pm {int(delta**0.5)}}}{{2}} \\]
    
    Άρα:
    \\[ x_1 = \\frac{{{-b} - {int(delta**0.5)}}}{{2}} = {r1} \\quad \\text{{και}} \\quad x_2 = \\frac{{{-b} + {int(delta**0.5)}}}{{2}} = {r2} \\]
\\end{{solution}}
"""
        return {"solution_latex": steps.strip()}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Solutions")
    parser.add_argument("input_file", help="JSON file containing the exercise")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")

    args = parser.parse_args()
    
    try:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            exercise_data = json.load(f)
            
        writer = SolutionWriter()
        result = writer.solve(exercise_data)
        
        if args.json:
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print("\n--- Solution ---")
            print(result["solution_latex"])
            
    except Exception as e:
        print(f"Error: {e}")
