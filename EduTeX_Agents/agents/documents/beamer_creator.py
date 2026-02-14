import sys
import os

class BeamerCreator:
    """
    Role: The "Presentation Maker"
    Responsibility: Create Beamer slides from content.
    """
    def __init__(self):
        self.role = "Presentation Maker"
        try:
             from core.llm import LLMService
             self.llm = LLMService()
        except ImportError:
             self.llm = None

    def create_presentation(self, slides_data, title="Presentation"):
        # Legacy
        return ""

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from beamer-creator.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "beamer-creator.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def create(self, title: str, topic: str, slide_count: int) -> dict:
        """
        API Wrapper: Creates a detailed Beamer presentation using LLM.
        """
        print(f"Agent {self.role}: Creating presentation on '{topic}'...")
        
        if self.llm:
            try:
                from core.workflow_loader import load_workflow
                from core.skill_loader import load_skill
                workflow_spec = load_workflow("presentation", domain="documents")
                latex_skill = load_skill("latex_core")
            except ImportError:
                 workflow_spec = "Create standard Beamer slides."
                 latex_skill = "Use standard LaTeX."

            agent_definition = self._load_agent_definition()

            system_prompt = f"""You are an academic presentation expert.
            
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

            Task: Create a Beamer presentation in LaTeX.
            Topic: {topic}
            Title: {title}
            Slide Count: {slide_count}
            Language: Greek (use babel)
            
            Output MUST be valid LaTeX code.
            Structure:
            1. Preamble (theme: Madrid)
            2. Title Page
            3. {slide_count} content slides
            
            Ensure valid syntax for itemize/enumerate/columns.
            """
            
            user_prompt = f"Create a {slide_count}-slide presentation about {topic} titled '{title}'."
            
            try:
                latex_code = self.llm.generate(user_prompt, system_instruction=system_prompt)
                 # Cleanup
                if latex_code.startswith("```latex"): latex_code = latex_code[8:]
                if latex_code.startswith("```"): latex_code = latex_code[3:]
                if latex_code.endswith("```"): latex_code = latex_code[:-3]
                
                return {
                    "latex": latex_code,
                    "type": "beamer",
                    "metadata": {"slides": slide_count, "generator": "AI"}
                }
            except Exception as e:
                print(f"LLM Error in BeamerCreator: {e}")

        # Mock fallback
        slides = []
        for i in range(1, slide_count + 1):
            slides.append({
                "title": f"Slide {i}: {topic} Part {i}",
                "content": f"\\begin{{itemize}}\n  \\item Point 1 about {topic}\n  \\item Point 2\n\\end{{itemize}}"
            })
            
        # Re-use the old logic if needed, or just return basic template
        latex = f"\\documentclass{{beamer}}\n\\usetheme{{Madrid}}\n\\usepackage[greek]{{babel}}\n\\title{{{title}}}\n\\begin{{document}}\n\\frame{{\\titlepage}}\n"
        for s in slides:
             latex += f"\\begin{{frame}}{{{s['title']}}}\n{s['content']}\n\\end{{frame}}\n"
        latex += "\\end{document}"
        
        return {
            "latex": latex,
            "type": "beamer",
            "metadata": {"slides": slide_count, "generator": "Mock"}
        }

if __name__ == "__main__":
    creator = BeamerCreator()
    slides = [{"title": "Slide 1", "content": "\\itemize{\\item Point 1}"}]
    print(creator.create_presentation(slides))
