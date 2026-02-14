import os

class TemplateRegistry:
    def __init__(self):
        # Path relative to EduTeX_Agents/core/template_registry.py
        # Expected structure:
        # EduTeX/
        #   EduTeX_Agents/core/template_registry.py
        #   assets/latex/exam.cls
        self.templates_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../assets/latex'))
        self.cls_file = "exam.cls"

    def get_preamble(self, style="scientific", maincolor="#1285cc"):
        """
        Returns the full LaTeX preamble for the exam class.
        """
        hex_color = maincolor.lstrip('#')
        
        # Preamble matches the frontend 'latexGenerator.ts' logic
        # wrapping around the custom 'exam.cls'
        return f"""\\documentclass[11pt,a4paper,{style}]{{exam}}
\\usepackage[english,greek]{{babel}}
\\usepackage{{fontspec}}
\\setmainfont{{Minion Pro}}
\\newfontfamily{{\\titlefont}}{{Century Gothic}}
\\usepackage{{amsmath,diffcoeff,fancyhdr,lipsum}}
\\let\\myBbbk\\Bbbk
\\let\\Bbbk\\relax
\\usepackage[amsbb,subscriptcorrection,zswash,mtpcal,mtphrb,mtpfrak]{{mtpro2}}
\\usepackage{{mathimatika,afterpage}}
\\definecolor{{maincolor}}{{HTML}}{{{hex_color}}}
\\colorlet{{darkmaincolor1}}{{maincolor!70!black}}
\\colorlet{{darkmaincolor2}}{{maincolor!35!black}}
\\renewcommand{{\\textstigma}}{{\\textsigma\\texttau}}
\\renewcommand{{\\textdexiakeraia}}{{}}

\\ekthetesdeiktes
"""

    def get_document_custom(self, content, style="scientific", title="", subtitle="", 
                          chapter="", date="\\today", maincolor="#1285cc", header_info="",
                          student_name="", student_class="", exam_date=""):
        """
        Wraps the content in the full document structure.
        """
        preamble = self.get_preamble(style, maincolor)
        
        # Title Command Construction
        # If subtitle is present, append it to the title with layout commands
        title_text = title
        if subtitle:
            title_text = f"{title}\\\\\\\\vspace{{2mm}}\\\\large {subtitle}"

        # Header Info logic (chapter/header_info fallback)
        header_text = header_info if header_info else chapter

        title_cmd = f"\\titlos{{{title_text}}}{{{header_text}}}{{{date}}}"
        
        # Page Style (First page handling for scientific style)
        page_style = "\\thispagestyle{firstpage}\n" if style == 'scientific' else ""

        # Student Info Block (Dashed lines / Pre-filled)
        name_field = f"\\makebox[8cm][l]{{{student_name} \\dotfill}}" if student_name else "\\makebox[8cm]{\\dotfill}"
        class_field = f"\\underline{{\\makebox[2cm][c]{{{student_class}}}}}" if student_class else "\\underline{\\hspace{2cm}}"
        date_field = f"\\underline{{\\makebox[3cm][c]{{{exam_date}}}}}" if exam_date else "\\underline{\\hspace{3cm}}"

        student_info = f"""
\\vspace{{0.5cm}}
\\noindent
\\textbf{{Όνομα:}} {name_field} \\hfill 
\\textbf{{Τμήμα:}} {class_field} \\hfill 
\\textbf{{Ημερομηνία:}} {date_field}
\\vspace{{0.5cm}}
"""

        return f"""{preamble}
\\begin{{document}}
{page_style}{title_cmd}
{student_info}

{content}

\\end{{document}}
"""

    def get_available_commands(self):
        """
        Returns a dictionary of custom commands available in the template,
        useful for the LLM context.
        """
        return {
            "askhsh": {"description": "\\askhsh - Starts a new exercise"},
            "lysh": {"description": "\\lysh - Starts the solution section"},
            "thewria": {"description": "\\thewria - Starts a theory section"},
            "askhseis": {"description": "\\askhseis - Header for exercises section"},
            "rlist": {"description": "\\begin{rlist} - Roman numeral list (i, ii, iii)"},
            "alist": {"description": "\\begin{alist} - Alpha list (a, b, c)"},
            "mytblr": {"description": "\\begin{mytblr}{...} - Tabularray table wrapper"},
        }
