import sys
import os

# Add project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from core.llm import LLMService

class MindmapGenerator:
    """
    Role: The "Concept Mapper"
    Responsibility: Create visual concept maps for revision.
    """
    def __init__(self):
        self.role = "Concept Mapper"
        try:
             self.llm = LLMService()
        except ImportError:
             self.llm = None

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from mindmap-generator.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "mindmap-generator.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def generate_mindmap_data(self, topic):
        """
        Returns structure for a TikZ mindmap using LLM.
        """
        print(f"Agent {self.role}: mapping concepts for '{topic}'...")

        if self.llm:
            try:
                from core.workflow_loader import load_workflow
                from core.skill_loader import load_skill
                workflow_spec = load_workflow("mindmap")
                latex_skill = load_skill("latex_core")
            except ImportError:
                workflow_spec = "Generate a JSON concept map."
                latex_skill = "Use standard LaTeX constraints."
            
            agent_definition = self._load_agent_definition()
            
            system_prompt = f"""You are an expert educator creating a concept map.
            
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

            Output MUST be a JSON object with the following structure:
            {{
                "root": "Main Topic",
                "branches": [
                    {{
                        "name": "Subtopic 1",
                        "nodes": ["Detail 1", "Detail 2"]
                    }}
                ]
            }}
            Keep it concise and hierarchical. Use LaTeX math mode ($...$) for formulas.
            """
            
            user_prompt = f"Create a mindmap for the topic: {topic}"
            
            try:
                return self.llm.generate_json(user_prompt, system_instruction=system_prompt)
            except Exception as e:
                print(f"Error generating mindmap: {e}")

        # Fallback (Mock structure)
        if "quadratic" in topic.lower():
             return {
                "root": "Quadratic Equations",
                "branches": [
                    {"name": "Standard Form", "nodes": ["$ax^2+bx+c=0$"]},
                    {"name": "Methods", "nodes": ["Factorization", "Discriminant", "Completing Square"]},
                    {"name": "Graph", "nodes": ["Parabola", "Vertex", "Axis of Symmetry"]}
                ]
            }
        return {"root": topic, "branches": []}

if __name__ == "__main__":
    gen = MindmapGenerator()
    print(gen.generate_mindmap_data("Quadratic Equations"))
