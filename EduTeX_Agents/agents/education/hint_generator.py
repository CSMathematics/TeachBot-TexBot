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

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from hint-generator.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "hint-generator.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def generate_hints(self, exercise):
        """
        Generates 3-level hints (Idea -> Methodology -> Solution Step).
        """
        
        try:
            from core.llm import LLMService
            from core.workflow_loader import load_workflow
            from core.skill_loader import load_skill
            llm = LLMService()
            workflow_spec = load_workflow("hints")
            latex_skill = load_skill("latex_core")
        except ImportError:
            return self._fallback_hints(exercise)

        topic = exercise.get("metadata", {}).get("topic", "")
        latex_content = exercise.get("latex", "")
        agent_definition = self._load_agent_definition()
        
        system_prompt = f"""You are an expert mathematics tutor providing hints.
        
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
        Context: The user is stuck on this exercise.
        
        Output MUST be a JSON object with:
        {{
            "hints": ["Hint 1 (Idea)", "Hint 2 (Method)", "Hint 3 (Partial Step)"],
            "count": 3
        }}
        """
        
        user_prompt = f"Generate hints for this exercise:\n{latex_content}"

        try:
            return llm.generate_json(user_prompt, system_instruction=system_prompt)
        except Exception as e:
            print(f"LLM Error in HintGenerator: {e}")
            raise e

    def _fallback_hints(self, exercise):
        return {
            "hints": ["Review the theory.", "Check similar examples."],
            "count": 2
        }

if __name__ == "__main__":
    mock_ex = {"metadata": {"topic": "Quadratic Equations"}}
    gen = HintGenerator()
    print(gen.generate_hints(mock_ex))
