import sys
import os

class PitfallDetector:
    """
    Role: The "Student Simulator" (H)
    Responsibility: Identify common student errors and misconceptions.
    """
    def __init__(self):
        self.role = "Student Simulator"

    def detect_pitfalls(self, exercise):
        """
        Returns a list of potential pitfalls for the given exercise.
        """
        topic = exercise.get("metadata", {}).get("topic", "").lower()
        print(f"Agent {self.role}: scanning for pitfalls in '{topic}'...")

        pitfalls = []
        if "quadratic" in topic:
            pitfalls = [
                {
                    "error": "Sign Error in Discriminant",
                    "description": "Students often forget the negative sign in $b^2 - 4ac$ when $c$ is negative.",
                    "prevention": "Put negative numbers in parentheses."
                },
                {
                    "error": "Denominator Error",
                    "description": "Dividing by $2$ instead of $2a$.",
                    "prevention": "Write down $a=...$ explicitly."
                }
            ]
        
        return {
            "pitfalls": pitfalls,
            "count": len(pitfalls)
        }

if __name__ == "__main__":
    mock_ex = {"metadata": {"topic": "Quadratic Equations"}}
    detector = PitfallDetector()
    print(detector.detect_pitfalls(mock_ex))
