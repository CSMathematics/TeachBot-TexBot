import sys
import os

class TableFormatter:
    """
    Role: The "Table Wizard"
    Responsibility: Create complex LaTeX tables.
    """
    def __init__(self):
        self.role = "Table Wizard"
        try:
             from core.llm import LLMService
             self.llm = LLMService()
        except ImportError:
             self.llm = None

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from table-formatter.md in the same directory.
        """
        try:
            agent_file = os.path.join(os.path.dirname(__file__), "table-formatter.md")
            if os.path.exists(agent_file):
                with open(agent_file, "r", encoding="utf-8") as f:
                    return f.read()
        except Exception:
            pass
        return "Role: Table Wizard\nResponsibility: Format LaTeX tables."

    def format_table(self, data: list, headers: list, style: str = "booktabs") -> dict:
        """
        API Wrapper: Formats a table.
        """
        print(f"Agent {self.role}: formatting table with style '{style}'...")
        
        if self.llm:
            try:
                from core.workflow_loader import load_workflow
                from core.skill_loader import load_skill
                workflow_spec = load_workflow("table", domain="documents")
                latex_skill = load_skill("latex_core")
            except ImportError:
                 workflow_spec = "Create a LaTeX table."
                 latex_skill = "Use standard LaTeX."

            agent_definition = self._load_agent_definition()

            system_prompt = f"""You are a LaTeX Table Expert.
            
            === AGENT DEFINITION & RULES ===
            {agent_definition}

            === LATEX SKILLS & CONVENTIONS ===
            {latex_skill}
            === END SKILLS ===

            === WORKFLOW SPECIFICATION ===
            {workflow_spec}
            === END WORKFLOW ===
            """
            
            user_prompt = f"Format the following data as a LaTeX table using '{style}' style.\nHeaders: {headers}\nData: {data}"
            
            try:
                response = self.llm.generate(user_prompt, system_instruction=system_prompt)
                # Naive extraction if LLM returns text
                latex_code = response
                if "```latex" in response:
                    latex_code = response.split("```latex")[1].split("```")[0].strip()
                elif "```" in response:
                    latex_code = response.split("```")[1].split("```")[0].strip()
                    
                return {
                    "latex": latex_code,
                    "type": "table",
                    "metadata": {"style": style, "rows": len(data)}
                }
            except Exception as e:
                print(f"LLM generation failed: {e}")
                # Fallback to manual generation logic
        
        # Combine headers and data for the internal generator (Fallback)
        combined_data = []
        if headers:
            combined_data.append(headers)
        combined_data.extend(data)
        
        latex_code = self._generate_manual(combined_data, caption="Generated Table")
        
        return {
            "latex": latex_code,
            "type": "table",
            "metadata": {"style": style, "rows": len(data)}
        }

    def _generate_manual(self, data, caption="My Table"):
        """
        Generates a LaTeX table from a list of lists (Legacy/Fallback).
        """
        if not data: return "% No data for table"
        
        num_cols = len(data[0])
        col_def = "|" + "c|" * num_cols
        
        latex = "\\begin{table}[h]\n\\centering\n"
        latex += f"\\begin{{tabular}}{{{col_def}}}\n\\hline\n"
        
        for row in data:
            latex += " & ".join(str(x) for x in row) + " \\\\\n\\hline\n"
            
        latex += f"\\end{{tabular}}\n\\caption{{{caption}}}\n\\end{{table}}"
        
        return latex

if __name__ == "__main__":
    formatter = TableFormatter()
    data = [["Row 1", "Val 1"], ["Row 2", "Val 2"]]
    headers = ["Header 1", "Header 2"]
    print(formatter.format_table(data, headers))
