import { Exam } from '../types';
import { TemplateConfig, DEFAULT_TEMPLATE_CONFIG } from '../services/templateService';

/**
 * Generates a full LaTeX document string from an Exam object,
 * using the exam.cls custom class file.
 */
export const generateLatexFromExam = (
    exam: Exam,
    config: TemplateConfig = DEFAULT_TEMPLATE_CONFIG
): string => {
    const isWorksheet = exam.type === 'worksheet';
    const hexColor = config.mainColor.replace('#', '');

    // ── Preamble (mirrors assets/latex/exam.tex) ────────────────────
    const preamble = `\\documentclass[11pt,a4paper,${config.style}]{exam}
\\usepackage[english,greek]{babel}
\\usepackage[utf8]{inputenc}
\\usepackage{fontspec}
\\setmainfont{Minion Pro}
\\newfontfamily{\\titlefont}{Century Gothic}
\\usepackage{amsmath,diffcoeff,fancyhdr,lipsum}
\\let\\myBbbk\\Bbbk
\\let\\Bbbk\\relax
\\usepackage[amsbb,subscriptcorrection,zswash,mtpcal,mtphrb,mtpfrak]{mtpro2}
\\usepackage{mathimatika,afterpage}
\\definecolor{maincolor}{HTML}{${hexColor}}
\\colorlet{darkmaincolor1}{maincolor!70!black}
\\colorlet{darkmaincolor2}{maincolor!35!black}
\\renewcommand{\\textstigma}{\\textsigma\\texttau}
\\renewcommand{\\textdexiakeraia}{}

\\ekthetesdeiktes`;

    // ── Title line ──────────────────────────────────────────────────
    const chapter = exam.gradeLevel || '';
    const titleCmd = `\\titlos{${exam.title}}{${chapter}}{\\\\today}`;

    // ── Exercises / Questions ────────────────────────────────────────
    const content = (exam.questions || []).map((q, i) => {
        const heading = isWorksheet
            ? `\\Askhsh{Άσκηση ${i + 1}}`
            : `\\askhsh`;

        const pointsTag = q.points ? ` \\hfill \\framebox{${q.points} μονάδες}` : '';
        const tagsLine = (q.tags && q.tags.length > 0)
            ? `\n{\\small\\color{darkmaincolor1}\\textit{${q.tags.join('\\quad ')}}}`
            : '';

        return `${heading}${pointsTag}\n${q.content || ''}${tagsLine}`;
    }).join('\n\n');

    // ── Assemble document ───────────────────────────────────────────
    const pageStyle = config.style === 'scientific' ? '\\thispagestyle{firstpage}\n' : '';

    return `${preamble}
\\begin{document}
${pageStyle}${titleCmd}

${content}

\\end{document}`;
};
