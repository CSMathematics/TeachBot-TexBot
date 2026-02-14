import argparse
import json
import sys
import os

# Add project root to path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

try:
    # Try package import (Runtime / Full Context)
    from agents.education.exercise_generator import ExerciseGenerator
except ImportError:
    # Fallback to local import (IDE / Direct Script Run)
    from exercise_generator import ExerciseGenerator

class IsomorphicGenerator:
    """
    Role: The "Twin Generator" (B)
    Responsibility: Create N variations of an exercise.
    """
    def __init__(self):
        self.generator = ExerciseGenerator()

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from isomorphic-generator.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "isomorphic-generator.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def generate_variations(self, input_exercise, count=1):
        """
        Generates 'count' variations based on the input exercise's metadata.
        """
        print(f"Agent IsomorphicGenerator: Creating {count} variations...")
        
        data = input_exercise if isinstance(input_exercise, dict) else json.loads(input_exercise)
        metadata = data.get("metadata", {})
        topic = metadata.get("topic", "")
        difficulty = metadata.get("difficulty", "medium")
        
        
        try:
            from core.llm import LLMService
            from core.workflow_loader import load_workflow
            from core.skill_loader import load_skill
            llm = LLMService()
            workflow_spec = load_workflow("variant")
            latex_skill = load_skill("latex_core")
        except ImportError:
            return self._fallback_variations(input_exercise, count)

        # Extract context
        latex_content = input_exercise.get("latex", "")
        agent_definition = self._load_agent_definition()
        
        system_prompt = f"""You are an expert mathematics educator creating isomorphic variations of exercises.
        
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
        
        Original Exercise:
        {latex_content}
        
        Target Count: {count}
        
        Output MUST be a JSON object with:
        {{
            "variations": [
                {{ "latex": "Variation 1 body", "metadata": {{...}} }},
                {{ "latex": "Variation 2 body", "metadata": {{...}} }}
            ]
        }}
        """
        
        user_prompt = f"Create {count} isomorphic variations."
        
        try:
            result = llm.generate_json(user_prompt, system_instruction=system_prompt)
            return result.get("variations", [])
        except Exception as e:
            print(f"LLM Error in IsomorphicGenerator: {e}")
            return self._fallback_variations(input_exercise, count)

    def _fallback_variations(self, input_exercise, count):
        variations = []
        for i in range(count):
            try:
                new_exercise = self.generator.generate(
                    input_exercise.get("metadata", {}).get("topic", ""),
                    input_exercise.get("metadata", {}).get("difficulty", "medium")
                )
                variations.append(new_exercise)
            except:
                variations.append(input_exercise) # Last resort copy
        return variations

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Isomorphic Variations")
    parser.add_argument("input_file", help="JSON file containing the original exercise")
    parser.add_argument("--count", type=int, default=1, help="Number of variations")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")

    args = parser.parse_args()
    
    try:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            original = json.load(f)
            
        iso = IsomorphicGenerator()
        vars = iso.generate_variations(original, args.count)
        
        if args.json:
            print(json.dumps(vars, indent=2, ensure_ascii=False))
        else:
            print(f"\n--- Generated {len(vars)} Variations ---")
            for idx, var in enumerate(vars):
                print(f"\nVariation {idx+1}:")
                print(var["latex"])
                
    except Exception as e:
        print(f"Error: {e}")
