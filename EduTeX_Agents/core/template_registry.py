"""
TemplateRegistry - Loads and manages LaTeX templates from assets/latex/.
Provides preambles and document wrappers for exam/worksheet generation.
"""
import os
from typing import Optional

# Resolve assets directory relative to project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ASSETS_DIR = os.path.join(PROJECT_ROOT, 'assets', 'latex')


class TemplateRegistry:
    """Registry for LaTeX templates and class files."""

    VALID_STYLES = ('classic', 'modern', 'scientific')
    DEFAULT_STYLE = 'scientific'
    DEFAULT_MAINCOLOR = '#1285cc'

    def __init__(self, assets_dir: Optional[str] = None):
        self.assets_dir = assets_dir or ASSETS_DIR
        self.cls_name = 'exam'

    # ── Public API ───────────────────────────────────────────────────

    def get_preamble(
        self,
        style: str = DEFAULT_STYLE,
        maincolor: str = DEFAULT_MAINCOLOR,
        engine: str = 'xelatex',
    ) -> str:
        """
        Returns a full LaTeX preamble that loads exam.cls with the
        given style and configures maincolor + fonts.
        """
        style = style if style in self.VALID_STYLES else self.DEFAULT_STYLE
        hex_color = maincolor.lstrip('#')

        lines = [
            f'\\documentclass[11pt,a4paper,{style}]{{{self.cls_name}}}',
            '\\usepackage[english,greek]{babel}',
        ]

        # Engine-specific font loading
        if engine == 'xelatex':
            lines += [
                '\\usepackage{fontspec}',
                '\\setmainfont{Minion Pro}',
                '\\newfontfamily{\\titlefont}{Century Gothic}',
            ]
        else:
            lines += [
                '\\usepackage[utf8]{inputenc}',
                '\\usepackage{nimbusserif}',
                '\\usepackage[T1]{fontenc}',
            ]

        lines += [
            '\\usepackage{amsmath,diffcoeff,fancyhdr,lipsum}',
            '\\let\\myBbbk\\Bbbk',
            '\\let\\Bbbk\\relax',
            '\\usepackage[amsbb,subscriptcorrection,zswash,mtpcal,mtphrb,mtpfrak]{mtpro2}',
            '\\usepackage{mathimatika,afterpage}',
            f'\\definecolor{{maincolor}}{{HTML}}{{{hex_color}}}',
            '\\colorlet{darkmaincolor1}{maincolor!70!black}',
            '\\colorlet{darkmaincolor2}{maincolor!35!black}',
            "\\renewcommand{\\textstigma}{\\textsigma\\texttau}",
            "\\renewcommand{\\textdexiakeraia}{}",
            '',
            '\\ekthetesdeiktes',
        ]

        return '\n'.join(lines)

    def get_document_wrapper(
        self,
        style: str = DEFAULT_STYLE,
        title: str = 'Title',
        chapter: str = 'Chapter',
        content: str = '',
        maincolor: str = DEFAULT_MAINCOLOR,
        engine: str = 'xelatex',
    ) -> str:
        """
        Returns a complete LaTeX document string that wraps content
        using the exam.cls template.
        """
        preamble = self.get_preamble(style, maincolor, engine)

        page_style = ''
        if style == 'scientific':
            page_style = '\\thispagestyle{firstpage}'

        return '\n'.join([
            preamble,
            '\\begin{document}',
            page_style,
            f'\\titlos{{{title}}}{{{chapter}}}{{\\today}}',
            '',
            content,
            '',
            '\\end{document}',
        ])

    def get_available_commands(self) -> dict:
        """Returns a dictionary of custom commands available in exam.cls."""
        return {
            'titlos': {
                'args': 3,
                'description': '\\titlos{Title}{Chapter}{Date} - Page header with branding',
            },
            'askhsh': {
                'args': 0,
                'description': '\\askhsh - Auto-numbered exercise label',
            },
            'Askhsh': {
                'args': 1,
                'description': '\\Askhsh{Name} - Named exercise section',
            },
            'lysh': {
                'args': 0,
                'description': '\\lysh - Solution label',
            },
            'thewria': {
                'args': 0,
                'description': '\\thewria - Theory section heading',
            },
            'askhseis': {
                'args': 0,
                'description': '\\askhseis - Exercises section heading',
            },
            'ekthetesdeiktes': {
                'args': 0,
                'description': '\\ekthetesdeiktes - Configure math subscript/superscript sizes',
            },
            'eng': {
                'args': 1,
                'description': '\\eng{text} - Switch to English within Greek text',
            },
        }

    def get_available_environments(self) -> dict:
        """Returns custom list and table environments from exam.cls."""
        return {
            'lists': {
                'alist': 'a. b. c. labeling',
                'balist': 'Bold a. b. c. labeling',
                'Alist': 'A. B. C. labeling',
                'bAlist': 'Bold A. B. C. labeling',
                'rlist': 'Roman numerals (colored)',
            },
            'tables': {
                'mytblr': 'Styled tabularray table with maincolor header',
            },
        }

    def get_styles_info(self) -> list:
        """Returns metadata for each template style (for frontend)."""
        return [
            {
                'id': 'classic',
                'name': 'Classic',
                'nameEl': 'Κλασικό',
                'description': 'Centred single-column layout with MathWorld branding',
            },
            {
                'id': 'modern',
                'name': 'Modern',
                'nameEl': 'Μοντέρνο',
                'description': 'Two-column layout with side branding and social links',
            },
            {
                'id': 'scientific',
                'name': 'Scientific',
                'nameEl': 'Επιστημονικό',
                'description': 'Grid header with math formulas, decorative squares, two-column body',
            },
        ]


if __name__ == '__main__':
    reg = TemplateRegistry()
    print('=== Scientific Preamble ===')
    print(reg.get_preamble('scientific'))
    print()
    print('=== Full Document ===')
    print(reg.get_document_wrapper('scientific', 'Παράγωγος', 'Κεφάλαιο 5', '\\askhsh Να βρείτε...'))
