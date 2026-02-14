import sys
import os

class RubricDesigner:
    """
    Role: The "Grader" (J)
    Responsibility: Create grading rubrics (marking schemes).
    """
    def __init__(self):
        self.role = "Grader"

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from rubric-designer.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "rubric-designer.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def create_rubric(self, exercise):
        """
        Generates a grading rubric for the exercise.
        """
        topic = exercise.get("metadata", {}).get("topic", "").lower()
        print(f"Agent {self.role}: designing rubric for '{topic}'...")

        try:
            from core.llm import LLMService
            from core.workflow_loader import load_workflow
            from core.skill_loader import load_skill
            llm = LLMService()
            workflow_spec = load_workflow("rubric")
            latex_skill = load_skill("latex_core")
        except ImportError:
            return self._fallback_rubric(exercise)

        # Extract context
        latex_content = exercise.get("latex", "")
        max_points = exercise.get("metadata", {}).get("points", 10)
        agent_definition = self._load_agent_definition()

        system_prompt = f"""You are an expert grader creating a scoring rubric.
        
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
        Max Points: {max_points}
        
        Output MUST be a JSON object with:
        {{
            "rubric": [
                {{ "step": "Step description", "points": N, "criteria": "Grading criteria" }}
            ]
        }}
        The sum of points MUST equal {max_points}.
        """
        
        user_prompt = f"Create a rubric for:\n{latex_content}"
        
        try:
            result = llm.generate_json(user_prompt, system_instruction=system_prompt)
            rubric = result.get("rubric", [])
            return {
                "rubric": rubric,
                "total_points": sum(r.get("points", 0) for r in rubric)
            }
        except Exception as e:
            print(f"LLM Error in RubricDesigner: {e}")
            return self._fallback_rubric(exercise)

    def _fallback_rubric(self, exercise):
        return {
            "rubric": [{"step": "Correct Answer", "points": 10, "criteria": "Full correctness"}],
            "total_points": 10
        }

if __name__ == "__main__":
    mock_ex = {"metadata": {"topic": "Quadratic Equations"}}
    designer = RubricDesigner()
    print(designer.create_rubric(mock_ex))
