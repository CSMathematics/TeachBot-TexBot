import sys
import os

class TikZExpert:
    """
    Role: The "Visual Artist"
    Responsibility: Generate geometric figures and function plots using TikZ/PGFPlots.
    """
    def __init__(self):
        self.role = "Visual Artist"
        try:
             from core.llm import LLMService
             self.llm = LLMService()
        except ImportError:
             self.llm = None

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from tikz-expert.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "tikz-expert.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def generate_figure(self, description):
        """
        Generates TikZ code based on a description using LLM.
        """
        print(f"Agent {self.role}: generating figure for '{description}'...")
        
        if self.llm:
            try:
                from core.workflow_loader import load_workflow
                from core.skill_loader import load_skill
                workflow_spec = load_workflow("figure", domain="documents")
                latex_skill = load_skill("latex_core")
            except ImportError:
                 workflow_spec = "Create a TikZ figure."
                 latex_skill = "Use standard TikZ."

            agent_definition = self._load_agent_definition()
            
            system_prompt = f"""You are a TikZ expert.
            
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

            Output MUST be valid LaTeX code starting with \\begin{{tikzpicture}} and ending with \\end{{tikzpicture}}.
            Do NOT include \\documentclass or preamble.
            Use pgfplots if plotting functions.
            """
            user_prompt = f"Create a TikZ figure for: {description}"
            
            try:
                latex_code = self.llm.generate(user_prompt, system_instruction=system_prompt)
                 # Cleanup
                if latex_code.startswith("```latex"): latex_code = latex_code[8:]
                if latex_code.startswith("```"): latex_code = latex_code[3:]
                if latex_code.endswith("```"): latex_code = latex_code[:-3]

                return {
                    "latex": latex_code,
                    "type": "tikz",
                     "metadata": {"generator": "AI"}
                }
            except Exception as e:
                print(f"LLM Error in TikZExpert: {e}")

        # Fallback (mock)
        tikz_code = "% Placeholder (LLM Failed)\n\\begin{tikzpicture}\n\\draw (0,0) circle (1cm);\n\\end{tikzpicture}"
        return {
            "latex": tikz_code,
            "type": "tikz"
        }

if __name__ == "__main__":
    expert = TikZExpert()
    print(expert.generate_figure("parabola")["latex"])
