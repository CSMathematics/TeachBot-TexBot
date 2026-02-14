import sys
import os
import argparse
import subprocess

# Add project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from typing import TYPE_CHECKING, Optional, Dict, Any

if TYPE_CHECKING:
    from skills.latex_core.scripts.compile import compile_latex # type: ignore

try:
    from skills.latex_core.scripts.compile import compile_latex # type: ignore
except ImportError:
    # Fallback or mock
    # type: ignore
    def compile_latex(path): print(f"Mock compiling {path}..."); return True

class DocumentBuilder:
    """
    Role: The "Typesetter" (D)
    Responsibility: Assemble final PDFs from various components.
    """
    def __init__(self):
        self.role = "Typesetter"
        try:
             from core.llm import LLMService
             self.llm = LLMService()
        except ImportError:
             self.llm = None

    def build_document(self, content, title="Document", output_filename="output.tex"):
        # Legacy method (kept for potential script usage)
        return self.build("article", title, content)

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from document-builder.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "document-builder.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def build(self, doc_type: str, title: str, content: str) -> dict:
        """
        API Wrapper: Builds a document and returns the LaTeX code using LLM.
        """
        print(f"Agent {self.role}: Building {doc_type} '{title}'...")
        
        if self.llm:
            try:
                from core.workflow_loader import load_workflow
                from core.skill_loader import load_skill
                workflow_spec = load_workflow("document", domain="documents")
                latex_skill = load_skill("latex_core")
            except ImportError:
                 workflow_spec = "Create a standard LaTeX document."
                 latex_skill = "Use standard LaTeX."

            agent_definition = self._load_agent_definition()

            system_prompt = f"""You are a LaTeX expert.
            
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

            Task: Create a valid {doc_type} document.
            Title: {title}
            Language: Greek (use babel).
            
            Output MUST be valid LaTeX code starting with \\documentclass and ending with \\end{{document}}.
            Ensure all packages (amsmath, geometry, etc.) are included.
            The user provided content/outline is:
            """
            
            user_prompt = content
            
            try:
                latex_code = self.llm.generate(user_prompt, system_instruction=system_prompt)
                # Cleanup if LLM adds markdown blocks
                if latex_code.startswith("```latex"): latex_code = latex_code[8:]
                if latex_code.startswith("```"): latex_code = latex_code[3:]
                if latex_code.endswith("```"): latex_code = latex_code[:-3]
                
                return {
                    "latex": latex_code,
                    "type": doc_type,
                    "metadata": {"title": title, "generator": "AI"}
                }
            except Exception as e:
                print(f"LLM Error in DocumentBuilder: {e}")
        
        # Fallback to template if no LLM or error
        latex_code = ""
        if doc_type == "article":
            latex_code = f"\\documentclass{{article}}\n\\usepackage[greek]{{babel}}\n\\usepackage{{amsmath}}\n\\title{{{title}}}\n\\begin{{document}}\n\\maketitle\n{content}\n\\end{{document}}"
        else:
             latex_code = f"\\documentclass{{article}}\n\\title{{{title}}}\n\\begin{{document}}\n\\maketitle\n% Type: {doc_type}\n{content}\n\\end{{document}}"

        return {
            "latex": latex_code,
            "type": doc_type,
            "metadata": {"title": title, "generator": "Template"}
        }

if __name__ == "__main__":
    builder = DocumentBuilder()
    builder.build_document("Hello World", "Test Document", "test_doc.tex")
