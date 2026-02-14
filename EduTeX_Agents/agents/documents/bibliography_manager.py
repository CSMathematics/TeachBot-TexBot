import sys
import os

class BibliographyManager:
    """
    Role: The "Citation Manager"
    Responsibility: Handle references.
    """
    def __init__(self):
        self.role = "Citation Manager"
        try:
             from core.llm import LLMService
             self.llm = LLMService()
        except ImportError:
             self.llm = None

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from bibliography-manager.md in the same directory.
        """
        try:
            agent_file = os.path.join(os.path.dirname(__file__), "bibliography-manager.md")
            if os.path.exists(agent_file):
                with open(agent_file, "r", encoding="utf-8") as f:
                    return f.read()
        except Exception:
            pass
        return "Role: Citation Manager\nResponsibility: Manage BibTeX references."

    def format_citation(self, source, style="apa"):
        """
        Formats a citation using LLM if available, or fallback.
        """
        print(f"Agent {self.role}: formatting citation for '{source}'...")
        
        if self.llm:
            try:
                from core.workflow_loader import load_workflow
                from core.skill_loader import load_skill
                workflow_spec = load_workflow("bibliography", domain="documents")
                latex_skill = load_skill("latex_core")
            except ImportError:
                 workflow_spec = "Format a citation."
                 latex_skill = "Use standard BibTeX."

            agent_definition = self._load_agent_definition()

            system_prompt = f"""You are a Bibliography Expert.
            
            === AGENT DEFINITION & RULES ===
            {agent_definition}

            === LATEX SKILLS & CONVENTIONS ===
            {latex_skill}
            === END SKILLS ===

            === WORKFLOW SPECIFICATION ===
            {workflow_spec}
            === END WORKFLOW ===
            """
            
            user_prompt = f"Format the citation for '{source}' in '{style}' style. Return the LaTeX/BibTeX code."
            
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

        return f"\\cite{{{source}}}"

if __name__ == "__main__":
    manager = BibliographyManager()
    print(manager.format_citation("euclid"))
