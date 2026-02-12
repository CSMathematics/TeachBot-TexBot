import sys
import os

class RubricDesigner:
    """
    Role: The "Grader" (J)
    Responsibility: Create grading rubrics (marking schemes).
    """
    def __init__(self):
        self.role = "Grader"

    def create_rubric(self, exercise):
        """
        Generates a grading rubric for the exercise.
        """
        topic = exercise.get("metadata", {}).get("topic", "").lower()
        print(f"Agent {self.role}: designing rubric for '{topic}'...")

        rubric = []
        if "quadratic" in topic:
            rubric = [
                {"step": "Calculate Discriminant", "points": 5, "criteria": "Correct formula and substitution"},
                {"step": "Find Roots", "points": 5, "criteria": "Correct application of quadratic formula"}
            ]
        
        return {
            "rubric": rubric,
            "total_points": sum(r["points"] for r in rubric)
        }

if __name__ == "__main__":
    mock_ex = {"metadata": {"topic": "Quadratic Equations"}}
    designer = RubricDesigner()
    print(designer.create_rubric(mock_ex))
