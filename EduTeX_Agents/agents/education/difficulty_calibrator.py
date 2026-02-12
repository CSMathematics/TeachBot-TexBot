import sys
import os
import random

# Add project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

class DifficultyCalibrator:
    """
    Role: The "Exam Balancer" (F)
    Responsibility: Assess/adjust difficulty and check syllabus alignment.
    """
    def __init__(self):
        self.role = "Exam Balancer"

    def assess_difficulty(self, exercise):
        """
        Analyzes an exercise and estimates its difficulty level.
        In a real system, this would use heuristics (number of steps, concept complexity).
        """
        metadata = exercise.get("metadata", {})
        original_diff = metadata.get("difficulty", "medium")
        
        # Mock logic: verify if the label matches (trivial for now)
        return {
            "estimated_difficulty": original_diff,
            "confidence": 0.9,
            "reasoning": "Based on provided metadata tag."
        }

    def calibrate_exam(self, exercises, target_difficulty="medium"):
        """
        Checks if a list of exercises meets the target difficulty distribution.
        """
        print(f"Agent {self.role}: Calibrating exam difficulty...")
        
        counts = {"easy": 0, "medium": 0, "hard": 0}
        
        for ex in exercises:
            diff = ex.get("metadata", {}).get("difficulty", "medium")
            counts[diff] = counts.get(diff, 0) + 1
            
        total = len(exercises)
        if total == 0: return {"status": "empty"}
        
        # Simple heuristic for "medium" exam: 25% easy, 50% medium, 25% hard
        report = {
            "total": total,
            "distribution": counts,
            "analysis": "Balanced" # Mock
        }
        
        return report

if __name__ == "__main__":
    # Simple test
    calibrator = DifficultyCalibrator()
    sample_exam = [
        {"metadata": {"difficulty": "easy"}},
        {"metadata": {"difficulty": "medium"}},
        {"metadata": {"difficulty": "medium"}},
        {"metadata": {"difficulty": "hard"}}
    ]
    report = calibrator.calibrate_exam(sample_exam)
    print("Calibration Report:", report)
