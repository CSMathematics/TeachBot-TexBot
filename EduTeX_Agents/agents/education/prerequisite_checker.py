import sys
import os

# Add project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

try:
    from skills.syllabus_checker.scripts.check_prerequisites import check_prerequisites
except ImportError:
    # Mock if skill missing
    def check_prerequisites(cls, chap): return True

class PrerequisiteChecker:
    """
    Role: The "Gatekeeper"
    Responsibility: Verify student readiness.
    """
    def __init__(self):
        self.role = "Gatekeeper"

    def check_readiness(self, exercise):
        """
        Checks if the exercise relies on untaught concepts.
        """
        print(f"Agent {self.role}: checking prerequisites...")
        # Mock logic
        return {"status": "ready", "missing_concepts": []}

    def check(self, topic: str):
        """
        API Wrapper: Checks prerequisites for a topic.
        """
        print(f"Agent {self.role}: Checking prerequisites for topic '{topic}'...")
        
        # Mock logic based on topic
        if "calculus" in topic.lower():
             return {
                 "status": "warning",
                 "prerequisites": ["limits", "functions", "trigonometry"],
                 "messages": ["Ensure mastery of unit circle before proceeding."]
             }
        
        return {
            "status": "clear",
            "prerequisites": [],
            "message": f"No major prerequisites blocking '{topic}'."
        }

if __name__ == "__main__":
    checker = PrerequisiteChecker()
    print(checker.check_readiness({}))
