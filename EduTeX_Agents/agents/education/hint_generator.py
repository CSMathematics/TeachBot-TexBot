import sys
import os
import random

# Add project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

class HintGenerator:
    """
    Role: The "Hint Designer" (I)
    Responsibility: Create progressive hints for exercises.
    """
    def __init__(self):
        self.role = "Hint Designer"

    def generate_hints(self, exercise):
        """
        Generates 3-level hints (Idea -> Methodology -> Solution Step).
        """
        topic = exercise.get("metadata", {}).get("topic", "").lower()
        print(f"Agent {self.role}: generating hints for '{topic}'...")

        hints = []
        if "quadratic" in topic:
            hints = [
                "**Idea**: Use the quadratic formula or try to factorize.",
                "**Method**: Calculate the discriminant $\\Delta = b^2 - 4ac$.",
                "**Step**: If $\\Delta > 0$, the roots are $x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$."
            ]
        else:
            hints = ["Review the theory for this chapter."]

        return {
            "hints": hints,
            "count": len(hints)
        }

if __name__ == "__main__":
    mock_ex = {"metadata": {"topic": "Quadratic Equations"}}
    gen = HintGenerator()
    print(gen.generate_hints(mock_ex))
