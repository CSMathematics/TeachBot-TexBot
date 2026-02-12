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

    def generate_mindmap_data(self, topic):
        """
        Returns structure for a TikZ mindmap using LLM.
        """
        print(f"Agent {self.role}: mapping concepts for '{topic}'...")

        if self.llm:
            system_prompt = """You are an expert educator creating a concept map.
            Output MUST be a JSON object with the following structure:
            {
                "root": "Main Topic",
                "branches": [
                    {
                        "name": "Subtopic 1",
                        "nodes": ["Detail 1", "Detail 2"]
                    },
                    ...
                ]
            }
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
