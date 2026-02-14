import sys
import os

class PitfallDetector:
    """
    Role: The "Student Simulator" (H)
    Responsibility: Identify common student errors and misconceptions.
    """
    def __init__(self):
        self.role = "Student Simulator"

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from pitfall-detector.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "pitfall-detector.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def detect_pitfalls(self, exercise):
        """
        Returns a list of potential pitfalls for the given exercise.
        """
        topic = exercise.get("metadata", {}).get("topic", "").lower()
        print(f"Agent {self.role}: scanning for pitfalls in '{topic}'...")

        
        try:
            from core.llm import LLMService
            from core.workflow_loader import load_workflow
            from core.skill_loader import load_skill
            llm = LLMService()
            workflow_spec = load_workflow("mistakes")
            latex_skill = load_skill("latex_core")
        except ImportError:
             return self._fallback_pitfalls(topic)

        # Extract context
        latex_content = exercise.get("latex", "")
        agent_definition = self._load_agent_definition()
        
        system_prompt = f"""You are an expert mathematics educator identifying student misconceptions.
        
        === AGENT DEFINITION & RULES ===
        {agent_definition}
        === END AGENT DEFINITION ===

        === LATEX SKILLS & CONVENTIONS ===
        {latex_skill}
        === END SKILLS ===

        Use the following workflow specification:
        
        === WORKFLOW SPECIFICATION ===
        {workflow_spec}
        === END SPECIFICATION ===
        
        Topic: {topic}
        
        Output MUST be a JSON object with:
        {{
            "pitfalls": [
                {{ "error": "Name of error", "description": "What went wrong", "prevention": "How to avoid" }}
            ],
            "count": N
        }}
        """
        
        user_prompt = f"Identify potential student pitfalls for:\n{latex_content}"
        
        try:
            return llm.generate_json(user_prompt, system_instruction=system_prompt)
        except Exception as e:
             print(f"LLM Error in PitfallDetector: {e}")
             return self._fallback_pitfalls(topic)

    def _fallback_pitfalls(self, topic):
        return {
            "pitfalls": [{"error": "Calculation", "description": "Check signs.", "prevention": "Be careful."}],
            "count": 1
        }

if __name__ == "__main__":
    mock_ex = {"metadata": {"topic": "Quadratic Equations"}}
    detector = PitfallDetector()
    print(detector.detect_pitfalls(mock_ex))
