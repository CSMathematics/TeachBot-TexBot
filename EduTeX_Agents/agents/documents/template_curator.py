import sys
import os

class TemplateCurator:
    """
    Role: The "Template Library"
    Responsibility: Provide LaTeX templates.
    """
    def __init__(self):
        self.role = "Template Library"
        try:
             from core.llm import LLMService
             self.llm = LLMService()
        except ImportError:
             self.llm = None

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from template-curator.md in the same directory.
        """
        try:
            agent_file = os.path.join(os.path.dirname(__file__), "template-curator.md")
            if os.path.exists(agent_file):
                with open(agent_file, "r", encoding="utf-8") as f:
                    return f.read()
        except Exception:
            pass
        return "Role: Template Library\nResponsibility: Provide LaTeX templates."

    def get_template(self, name="exam"):
        """
        Returns a LaTeX template string using LLM if available, or fallback.
        """
        print(f"Agent {self.role}: retrieving template '{name}'...")
        
        if self.llm:
            try:
                from core.workflow_loader import load_workflow
                from core.skill_loader import load_skill
                workflow_spec = load_workflow("template", domain="documents")
                latex_skill = load_skill("latex_core")
            except ImportError:
                 workflow_spec = "Provide a LaTeX template."
                 latex_skill = "Use standard LaTeX."

            agent_definition = self._load_agent_definition()

            system_prompt = f"""You are a LaTeX Template Expert.
            
            === AGENT DEFINITION & RULES ===
            {agent_definition}

            === LATEX SKILLS & CONVENTIONS ===
            {latex_skill}
            === END SKILLS ===

            === WORKFLOW SPECIFICATION ===
            {workflow_spec}
            === END WORKFLOW ===
            """
            
            user_prompt = f"Provide a complete LaTeX template for: {name}. Return ONLY the LaTeX code."
            
            try:
                response = self.llm.generate(user_prompt, system_instruction=system_prompt)
                
                # Cleanup markdown code blocks
                if "```latex" in response:
                    return response.split("```latex")[1].split("```")[0].strip()
                elif "```" in response:
                    return response.split("```")[1].split("```")[0].strip()
                return response
            except Exception as e:
                print(f"LLM generation failed: {e}")
        
        # Fallback
        if name == "exam":
            return "\\documentclass{article}\n\\begin{document}\n\\end{document}"
        return "% Template not found"

if __name__ == "__main__":
    curator = TemplateCurator()
    print(curator.get_template("exam"))
