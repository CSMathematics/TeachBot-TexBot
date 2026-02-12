import sys
import os

class PanhellenicFormatter:
    """
    Role: The "Style Mimic" (G)
    Responsibility: Format exams to look like official Panhellenic Exams.
    """
    def __init__(self):
        self.role = "Style Mimic"

    def format_exam(self, exam_data):
        """
        Wraps the exam content in a Panhellenic-style LaTeX template.
        """
        print(f"Agent {self.role}: Applying Panhellenic styling...")
        
        exercises = exam_data.get("exercises", [])
        topic = exam_data.get("metadata", {}).get("topic", "Διαγώνισμα")
        
        # Build the specific Panhellenic header
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
            # Panhellenic exams use "Subject A", "Subject B", etc.
            subject_letter = chr(65 + idx) # A, B, C...
            body += f"\\textbf{{ΘΕΜΑ {subject_letter}}}\n\n"
            body += ex["latex"].replace("\\begin{exercise}", "").replace("\\end{exercise}", "") + "\n\n"
            
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
