import json
import argparse
import sys
import os

class SolutionWriter:
    """
    Role: The "Solver & Validator" (C)
    Responsibility: Generate step-by-step LaTeX solutions for valid exercises.
    """
    def __init__(self):
        self.role = "Solver"

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from solution-writer.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "solution-writer.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def solve(self, exercise_json):
        """
        Generates a LaTeX solution for the given exercise data.
        """
        print(f"Agent {self.role}: solving exercise...")
        
        
        try:
            from core.llm import LLMService
            from core.workflow_loader import load_workflow
            from core.skill_loader import load_skill
            llm = LLMService()
            workflow_spec = load_workflow("solutions")
            latex_skill = load_skill("latex_core")
        except ImportError:
            return {"solution_latex": "% LLM Service unavailable."}

        # Extract context
        data = exercise_json if isinstance(exercise_json, dict) else json.loads(exercise_json)
        metadata = data.get("metadata", {})
        topic = metadata.get("topic", "")
        latex_content = data.get("latex", "")
        agent_definition = self._load_agent_definition()
        
        system_prompt = f"""You are an expert mathematics solver.
        
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
            "solution_latex": "The full Step-by-Step LaTeX solution environment (\\begin{{solution}}...\\end{{solution}})."
        }}
        """
        
        user_prompt = f"Solve this exercise step-by-step:\n{latex_content}"
        
        try:
            return llm.generate_json(user_prompt, system_instruction=system_prompt)
        except Exception as e:
            print(f"LLM Error in SolutionWriter: {e}")
            raise e

    def _unused_quadratic_logic(self):
        # Kept for reference or removed
        pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Solutions")
    parser.add_argument("input_file", help="JSON file containing the exercise")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")

    args = parser.parse_args()
    
    try:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            exercise_data = json.load(f)
            
        writer = SolutionWriter()
        result = writer.solve(exercise_data)
        
        if args.json:
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print("\n--- Solution ---")
            print(result["solution_latex"])
            
    except Exception as e:
        print(f"Error: {e}")
