import argparse
import sys
import os
import json

class PanhellenicFormatter:
    """
    Role: The "Style Mimic" (G)
    Responsibility: Format exams to look like official Panhellenic Exams.
    """
    def __init__(self):
        self.role = "Style Mimic"

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from panhellenic-formatter.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "panhellenic-formatter.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def format_exam(self, exam_data):
        """
        Wraps the exam content in a Panhellenic-style LaTeX template.
        """
        print(f"Agent {self.role}: Applying Panhellenic styling...")
        
        try:
            from core.llm import LLMService
            from core.workflow_loader import load_workflow
            from core.skill_loader import load_skill
            llm = LLMService()
            workflow_spec = load_workflow("panhellenic")
            latex_skill = load_skill("latex_core")
        except ImportError:
            return self._fallback_format(exam_data)

        # Context
        # We need to pass the exam content, but it might be large.
        # Let's pass a summary or the raw JSON.
        exam_json_str = json.dumps(exam_data, ensure_ascii=False)
        agent_definition = self._load_agent_definition()
        
        system_prompt = f"""You are an expert LaTeX typesetter for Panhellenic Exams.
        
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
        
        Output MUST be the raw LaTeX source code for the entire document.
        Do not wrap in JSON. Return the string directly.
        """
        
        user_prompt = f"Format this exam into a Panhellenic style document:\n{exam_json_str}"
        
        try:
            # Use generate() instead of generate_json() because we want raw LaTeX
            return llm.generate(user_prompt, system_instruction=system_prompt)
        except Exception as e:
            print(f"LLM Error in PanhellenicFormatter: {e}")
            return self._fallback_format(exam_data)

    def _fallback_format(self, exam_data):
        exercises = exam_data.get("exercises", [])
        topic = exam_data.get("metadata", {}).get("topic", "Διαγώνισμα")
        
        header = r"""
\documentclass[a4paper,12pt]{article}
\usepackage[utf8]{inputenc}
\usepackage[greek]{babel}
\usepackage{amsmath}
\usepackage{geometry}
\geometry{top=2cm, bottom=2cm, left=2cm, right=2cm}

\begin{document}

\begin{center}
    \textbf{\large PANHELLENIC EXAMS SIMULATION}\\
    \textbf{\today} \\
    \textbf{TOPIC: } \MakeUppercase{""" + topic + r"""}
\end{center}
\hrule
\vspace{1cm}
"""
        
        body = ""
        for idx, ex in enumerate(exercises):
            subject_letter = chr(65 + idx)
            body += f"\\textbf{{ΘΕΜΑ {subject_letter}}}\n\n"
            content = ex.get("latex", "")
            # Strip outer exercise environment if present
            content = content.replace("\\begin{exercise}", "").replace("\\end{exercise}", "")
            body += content + "\n\n"
            
        footer = r"""
\vspace{2cm}
\begin{center}
    \textbf{ΚΑΛΗ ΕΠΙΤΥΧΙΑ}
\end{center}
\end{document}
"""
        return header + body + footer

    def format(self, topic: str):
        """
        API Wrapper: Format a mock exam for a topic.
        """
        # Create a mock exam to format
        mock_exam = {
            "metadata": {"topic": topic},
            "exercises": [
                {"latex": f"\\begin{{exercise}}\nExplain the significance of {topic}.\n\\end{{exercise}}"},
                {"latex": f"\\begin{{exercise}}\nSolve a problem related to {topic}.\n\\end{{exercise}}"}
            ]
        }
        return self.format_exam(mock_exam)

if __name__ == "__main__":
    # Mock data
    mock_exam = {
        "metadata": {"topic": "Algebra"},
        "exercises": [
            {"latex": "Exercise 1 content..."},
            {"latex": "Exercise 2 content..."}
        ]
    }
    formatter = PanhellenicFormatter()
    print(formatter.format_exam(mock_exam))
