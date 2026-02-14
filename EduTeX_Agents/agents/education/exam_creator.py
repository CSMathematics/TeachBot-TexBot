import sys
import os
import json
import argparse
from datetime import datetime
from typing import Dict, Any, List, Optional, Union, TYPE_CHECKING

# Add project root FIRST so all core.* imports resolve
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

if TYPE_CHECKING:
    from core.template_registry import TemplateRegistry as _TemplateRegistryType
    from core.latex_specs import build_llm_context as _build_llm_context_type
    from core.llm import LLMService as _LLMServiceType
    from agents.education.exercise_generator import ExerciseGenerator
    from agents.education.difficulty_calibrator import DifficultyCalibrator

# Template system
try:
    from core.template_registry import TemplateRegistry
    from core.latex_specs import build_llm_context
    _HAS_TEMPLATES = True
except ImportError:
    _HAS_TEMPLATES = False
    TemplateRegistry = None
    build_llm_context = None

try:
    from agents.education.exercise_generator import ExerciseGenerator  # type: ignore[no-redef]
    from agents.education.difficulty_calibrator import DifficultyCalibrator  # type: ignore[no-redef]
except ImportError:
    from exercise_generator import ExerciseGenerator  # type: ignore[no-redef]
    from difficulty_calibrator import DifficultyCalibrator  # type: ignore[no-redef]

class ExamCreator:
    """
    Role: The "Exam Creator"
    Responsibility: Assemble exercises into a full exam paper.
    """
    def __init__(self):
        self.role: str = "Exam Creator"
        self.generator: 'ExerciseGenerator' = ExerciseGenerator()
        self.calibrator: 'DifficultyCalibrator' = DifficultyCalibrator()
        self.template_registry = TemplateRegistry() if TemplateRegistry else None

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from exam-creator.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "exam-creator.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def create_exam(
        self,
        topic: str,
        num_questions: int = 3,
        difficulty: str = "medium",
        template_style: str = "scientific",
        maincolor: str = "#1285cc",
        api_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Creates a full exam with 'num_questions' on 'topic' using LLM.
        """
        print(f"Agent {self.role}: Assembling exam on '{topic}'...")

        # Build LaTeX context for LLM
        latex_context = ''
        if build_llm_context:
            latex_context = build_llm_context()

        # Available class commands for LLM
        cls_commands = ''
        registry = self.template_registry
        if registry:
            cmds = registry.get_available_commands()
            cls_commands = '\n'.join(
                f'  - {info["description"]}' for info in cmds.values()
            )

        # Use LLM Service
        from core.llm import LLMService
        from core.workflow_loader import load_workflow
        from core.skill_loader import load_skill
        llm = LLMService(api_key=api_key)

        # Load Workflow Specification
        workflow_spec = load_workflow("exam")
        latex_skill = load_skill("latex_core")
        agent_definition = self._load_agent_definition()
        
        # 1. Generate Questions via LLM
        system_prompt = f"""You are an expert mathematics educator creating a test.
        
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
        Count: {num_questions}

        Output MUST be a JSON object with a list 'exercises'. Each exercise must have:
        - 'latex': The LaTeX code for the question statement.
        - 'solution': The LaTeX code for the step-by-step solution.
        - 'metadata': {{ "points": 10, "difficulty": "{difficulty}", "tags": ["{topic}"] }}

        IMPORTANT: Do NOT include \\documentclass or preamble. Only the exercise body.
        Use these custom commands and environments:
{cls_commands}

{latex_context}
        """

        user_prompt = f"Generate {num_questions} {difficulty} exercises for {topic}."

        try:
            result = llm.generate_json(user_prompt, system_instruction=system_prompt)
            exercises = result.get("exercises", [])
            
            # Additional check: If LLM returns empty list (e.g. safety filter or error)
            if not exercises:
                raise ValueError("LLM returned empty exercise list")
                
        except Exception as e:
            print(f"LLM Error in ExamCreator: {e}")
            # User requested NO MOCK FALLBACK. Re-raising exception to notify frontend.
            raise RuntimeError(f"Failed to generate exam via AI: {e}")

        # 2. Calibrate
        calibration = self.calibrator.calibrate_exam(exercises)

        # 3. Assemble LaTeX using template
        exam_latex = self._assemble_latex(
            exercises, topic, difficulty, template_style, maincolor
        )

        return {
            "exam_latex": exam_latex,
            "exercises": exercises,
            "calibration": calibration,
            "metadata": {
                "created_at": datetime.now().isoformat(),
                "topic": topic,
                "difficulty": difficulty,
                "template_style": template_style,
                "maincolor": maincolor,
            }
        }

    def _assemble_latex(self, exercises, topic, difficulty, style="scientific", maincolor="#1285cc"):
        """
        Stitches exercises into a single LaTeX document using exam.cls template.
        """
        # Use TemplateRegistry if available
        # Use TemplateRegistry if available
        registry = self.template_registry
        if registry:
            # Prepare content
            content = "\\askhseis\n\n"
            for idx, ex in enumerate(exercises):
                # Handle both dictionary (from LLM) and string (fallback) formats
                q_text = ex.get("latex", "") if isinstance(ex, dict) else str(ex)
                content += f"\\paragraph{{Θέμα {idx+1}}}\n{q_text}\n\n"

            return registry.get_document_custom(
                content=content,
                style=style,
                title=topic,
                subtitle=f'Difficulty: {difficulty}',
                chapter=difficulty.capitalize(),
                maincolor=maincolor,
            )

        # Fallback to basic template
        return (
            f'\\documentclass{{article}}\n'
            f'\\usepackage{{amsmath}}\n'
            f'\\usepackage[greek]{{babel}}\n'
            f'\\title{{Διαγώνισμα: {topic}}}\n'
            f'\\begin{{document}}\n'
            f'\\maketitle\n'
            f'{content}\n'
            f'\\end{{document}}'
        )

if __name__ == "__main__":
    creator = ExamCreator()
    exam = creator.create_exam("Quadratic Equations", 3, "medium")
    print("\n--- Generated Exam ---")
    print(exam["exam_latex"][:500] + "...\n(truncated)")
    print("\n--- Calibration ---")
    print(exam["calibration"])
