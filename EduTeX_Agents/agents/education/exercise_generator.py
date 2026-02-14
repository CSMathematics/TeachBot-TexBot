import os
import sys
import json
import argparse
from typing import Dict, Any, List

# Add project root to path
# Project root is ../../ from agents/education/
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

# Attempt to import skills
try:
    from skills.clean_numbers.scripts.verify import is_clean_number, verify_expression  # type: ignore
except ImportError:
    # Fallback or mock if running in isolation
    pass

class ExerciseGenerator:
    """
    Role: The "Math Generator" (B)
    Responsibility: Create base exercises from prompts with clean numbers.
    """
    def __init__(self):
        self.role = "Math Generator"
        
    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from exercise-generator.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "exercise-generator.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def generate(self, topic: str, difficulty: str = "medium", **kwargs) -> Dict[str, Any]:
        """
        Generates a math exercise based on the topic.
        """
        print(f"Agent {self.role}: Generating {difficulty} exercise for '{topic}'...")
        
        mistakes = kwargs.get("mistakes")
        agent_definition = self._load_agent_definition()
        
        # Load LLM, Workflow, and Skills
        try:
            from core.llm import LLMService  # type: ignore
            from core.workflow_loader import load_workflow  # type: ignore
            from core.skill_loader import load_skill # type: ignore
            
            api_key = kwargs.get("api_key")
            llm = LLMService(api_key=api_key)
            workflow_spec = load_workflow("worksheet")
            latex_skill = load_skill("latex_core")
        except ImportError:
            print("Warning: Core modules not found. Using fallback.")
            return self._fallback_response(topic, difficulty)

        # Build Prompts
        system_prompt = f"""You are an expert mathematics educator creating exercises.
        
        === AGENT DEFINITION & RULES ===
        {agent_definition}
        === END AGENT DEFINITION ===

        === LATEX SKILLS & CONVENTIONS ===
        {latex_skill}
        === END SKILLS ===

        Use the following workflow specification as your primary guide:
        
        === WORKFLOW SPECIFICATION ===
        {workflow_spec}
        === END SPECIFICATION ===

        Topic: {topic}
        Difficulty: {difficulty}
        """
        
        if mistakes:
            system_prompt += f"\nFocus on addressing these student mistakes: {', '.join(mistakes)}"
        
        system_prompt += """
        Output MUST be a single JSON object representing ONE exercise.
        Schema:
        {
            "latex": "The LaTeX code for the exercise body (no preamble).",
            "solution": "The LaTeX code for the solution.",
            "metadata": { "points": 10, "difficulty": "difficulty", "tags": ["topic"] }
        }
        """
        
        user_prompt = f"Generate a unique {difficulty} exercise for {topic}."

        try:
            return llm.generate_json(user_prompt, system_instruction=system_prompt)
        except Exception as e:
            print(f"LLM Error in ExerciseGenerator: {e}")
            raise e # User requested no mock fallback

    def _fallback_response(self, topic, difficulty):
        return {
            "type": "Algebra",
            "latex": f"\\begin{{exercise}}\\n    FALLBACK: {topic}\\n\\end{{exercise}}",
            "solution": "Fallback solution.",
            "metadata": {"topic": topic, "difficulty": difficulty, "tags": ["fallback"]}
        }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Math Exercises")
    parser.add_argument("topic", help="Topic of the exercise (e.g. 'quadratic')")
    parser.add_argument("--difficulty", default="medium", help="Difficulty level")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")
    
    args = parser.parse_args()
    
    generator = ExerciseGenerator()
    result = generator.generate(args.topic, args.difficulty)
    
    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print("\n--- Generated Exercise ---")
        print(result["latex"])
        print("\n--- Metadata ---")
        print(json.dumps(result["metadata"], indent=2, ensure_ascii=False))
