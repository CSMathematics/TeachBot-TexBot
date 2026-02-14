import sys
import os

class MultiMethodSolver:
    """
    Role: The "Alternative Perspective"
    Responsibility: Provide alternative solution methods.
    """
    def __init__(self):
        self.role = "Alternative Solver"
    
    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from multi-method-solver.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "multi-method-solver.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def solve_alternatives(self, exercise):
        """
        Generates alternative solution paths.
        """
        topic = exercise.get("metadata", {}).get("topic", "").lower()
        print(f"Agent {self.role}: finding alternative methods for '{topic}'...")

        try:
            from core.llm import LLMService
            from core.workflow_loader import load_workflow
            from core.skill_loader import load_skill
            llm = LLMService()
            workflow_spec = load_workflow("multi-method")
            latex_skill = load_skill("latex_core")
        except ImportError:
             return self._fallback_methods(topic)

        # Extract context
        latex_content = exercise.get("latex", "")
        agent_definition = self._load_agent_definition()
        
        system_prompt = f"""You are an expert mathematics solver specializing in alternative methods.
        
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
            "methods": [
                {{ "method_name": "Method 1", "latex": "Description and key formula" }},
                {{ "method_name": "Method 2", "latex": "..." }}
            ]
        }}
        """
        
        user_prompt = f"Provide alternative solving methods for:\n{latex_content}"
        
        try:
            return llm.generate_json(user_prompt, system_instruction=system_prompt).get("methods", [])
        except Exception as e:
            print(f"LLM Error in MultiMethodSolver: {e}")
            return self._fallback_methods(topic)

    def _fallback_methods(self, topic):
        if "quadratic" in topic.lower():
            return [{
                "method_name": "Factorization",
                "latex": "Find two numbers..."
            }]
        return []

    def solve(self, exercise):
        """
        API Wrapper: Solve exercise.
        """
        return self.solve_alternatives(exercise)

if __name__ == "__main__":
    solver = MultiMethodSolver()
    mock_ex = {"metadata": {"topic": "Quadratic Equations"}}
    print(solver.solve_alternatives(mock_ex))
