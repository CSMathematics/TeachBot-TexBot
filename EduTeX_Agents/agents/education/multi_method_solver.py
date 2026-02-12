import sys
import os

class MultiMethodSolver:
    """
    Role: The "Alternative Perspective"
    Responsibility: Provide alternative solution methods.
    """
    def __init__(self):
        self.role = "Alternative Solver"
    
    def solve_alternatives(self, exercise):
        """
        Generates alternative solution paths.
        """
        topic = exercise.get("metadata", {}).get("topic", "").lower()
        print(f"Agent {self.role}: finding alternative methods for '{topic}'...")

        methods = []
        if "quadratic" in topic:
            methods.append({
                "method_name": "Factorization",
                "latex": "Find two numbers that multiply to $c$ and add to $b$."
            })
            methods.append({
                "method_name": "Completing the Square",
                "latex": "$(x + \\frac{b}{2a})^2 = ...$"
            })
            
        return methods

    def solve(self, exercise):
        """
        API Wrapper: Solve exercise.
        """
        return self.solve_alternatives(exercise)

if __name__ == "__main__":
    solver = MultiMethodSolver()
    mock_ex = {"metadata": {"topic": "Quadratic Equations"}}
    print(solver.solve_alternatives(mock_ex))
