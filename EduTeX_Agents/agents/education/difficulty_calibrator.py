import sys
import os
import random
import json

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

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from difficulty-calibrator.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "difficulty-calibrator.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def calibrate_exam(self, exercises, target_difficulty="medium"):
        """
        Checks if a list of exercises meets the target difficulty distribution.
        """
        print(f"Agent {self.role}: Calibrating exam difficulty...")
        
        try:
            from core.llm import LLMService
            from core.workflow_loader import load_workflow
            from core.skill_loader import load_skill
            llm = LLMService()
            workflow_spec = load_workflow("calibrate")
            latex_skill = load_skill("latex_core")
        except ImportError:
            return self._fallback_calibration(exercises)

        exercises_text = json.dumps([
            {"id": i, "difficulty": ex.get("metadata", {}).get("difficulty", "unknown"), "content": ex.get("latex", "")[:100]} 
            for i, ex in enumerate(exercises)
        ], ensure_ascii=False)
        
        agent_definition = self._load_agent_definition()

        system_prompt = f"""You are an expert exam balancer.
        
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
        
        Analyze the distribution of the provided exercises.
        
        Output MUST be a JSON object with:
        {{
            "total": {len(exercises)},
            "distribution": {{ "easy": N, "medium": N, "hard": N }},
            "analysis": "Brief analysis of the balance.",
            "suggestions": ["Suggestion 1", "Suggestion 2"]
        }}
        """
        
        user_prompt = f"Calibrate this exam set:\n{exercises_text}"
        
        try:
             return llm.generate_json(user_prompt, system_instruction=system_prompt)
        except Exception as e:
            print(f"LLM Error in DifficultyCalibrator: {e}")
            return self._fallback_calibration(exercises)

    def _fallback_calibration(self, exercises):
        counts = {"easy": 0, "medium": 0, "hard": 0}
        for ex in exercises:
            diff = ex.get("metadata", {}).get("difficulty", "medium")
            counts[diff] = counts.get(diff, 0) + 1
            
        return {
            "total": len(exercises),
            "distribution": counts,
            "analysis": "Mock Calibration (LLM Failed)",
            "suggestions": []
        }

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
