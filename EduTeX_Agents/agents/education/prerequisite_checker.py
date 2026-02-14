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

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from prerequisite-checker.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "prerequisite-checker.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def check(self, topic: str):
        """
        API Wrapper: Checks prerequisites for a topic.
        """
        
        try:
            from core.llm import LLMService
            from core.workflow_loader import load_workflow
            from core.skill_loader import load_skill
            llm = LLMService()
            workflow_spec = load_workflow("prerequisites")
            latex_skill = load_skill("latex_core")
        except ImportError:
             return self._fallback_check(topic)

        agent_definition = self._load_agent_definition()

        system_prompt = f"""You are an expert curriculum designer checking prerequisites.
        
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
            "status": "clear" or "warning" or "blocked",
            "prerequisites": ["Concept 1", "Concept 2"],
            "messages": ["Advice for the student"]
        }}
        """
        
        user_prompt = f"Check prerequisites for: {topic}"
        
        try:
            return llm.generate_json(user_prompt, system_instruction=system_prompt)
        except Exception as e:
            print(f"LLM Error in PrerequisiteChecker: {e}")
            return self._fallback_check(topic)

    def _fallback_check(self, topic):
        if "calculus" in topic.lower():
             return {
                 "status": "warning",
                 "prerequisites": ["limits", "functions", "trigonometry"],
                 "messages": ["Ensure mastery of unit circle before proceeding."]
             }
        
        return {
            "status": "clear",
            "prerequisites": [],
            "messages": [f"No major prerequisites blocking '{topic}'."]
        }

if __name__ == "__main__":
    checker = PrerequisiteChecker()
    print(checker.check_readiness({}))
