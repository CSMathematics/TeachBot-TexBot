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

    // Use headerInfo if available, otherwise fallback to gradeLevel
    const chapter = exam.headerInfo || exam.gradeLevel || '';

    // ── Title line (Split Layout) ──────────────────────────────────
    // Left: Title, Subtitle, Info
    // Right: Student Info (Name, Class, Date)
    const titleBlock = `
\\begin{minipage}[t]{0.6\\textwidth}
    \\raggedright
    {\\fontsize{18}{22}\\selectfont\\textbf{${exam.title}}}\\\\
    \\vspace{1mm}
    {\\small\\textit{${chapter}}}\\\\
    {\\small\\color{gray}${exam.subtitle || ''}}
\\end{minipage}%
\\begin{minipage}[t]{0.4\\textwidth}
    \\raggedleft
    \\small
    \\begin{tabular}{@{}r@{\\hspace{2mm}}l@{}}
        \\textsc{Όνομα}: & ${exam.studentName ? `\\textbf{${exam.studentName}}` : '\\makebox[4cm]{\\dotfill}'} \\\\
        \\textsc{Τμήμα}: & ${exam.studentClass ? `\\textbf{${exam.studentClass}}` : '\\underline{\\hspace{2cm}}'} \\\\
        \\textsc{Ημ/νία}: & ${exam.examDate ? `\\textbf{${exam.examDate}}` : '\\underline{\\hspace{2cm}}'}
    \\end{tabular}
\\end{minipage}
\\vspace{1cm}
`;

    // ── Exercises / Questions ────────────────────────────────────────
    // If inline solutions, append them content. If separate, collect specific list.
    const solutionsMode = config.solutionsMode || 'none';

    const content = (exam.questions || []).map((q, i) => {
        const heading = isWorksheet
            ? `\\Askhsh{Άσκηση ${i + 1}}`
            : `\\askhsh`;

        const pointsTag = q.points ? ` \\hfill \\framebox{${q.points} μονάδες}` : '';
        const tagsLine = (q.tags && q.tags.length > 0)
            ? `\n{\\small\\color{darkmaincolor1}\\textit{${q.tags.join('\\quad ')}}}`
            : '';

        // Inline Solution
        const solutionBlock = (solutionsMode === 'inline' && q.solution)
            ? `\n\\begin{lysh}\n${q.solution}\n\\end{lysh}`
            : '';

        return `${heading}${pointsTag}\n${q.content || ''}${tagsLine}${solutionBlock}`;
    }).join('\n\n');

    // ── Separate Solutions Block ─────────────────────────────────────
    let solutionsAppendix = '';
    if (solutionsMode === 'separate') {
        const solutionsList = (exam.questions || [])
            .filter(q => q.solution)
            .map((q, i) => `\\paragraph{Θέμα ${i + 1}} ${q.solution}`)
            .join('\n\n');

        if (solutionsList) {
            solutionsAppendix = `
\\newpage
\\section*{Απαντήσεις & Λύσεις}
${solutionsList}
`;
        }
    }

    // ── Assemble document ───────────────────────────────────────────
    const pageStyle = config.style === 'scientific' ? '\\thispagestyle{firstpage}\n' : '';

    return `${preamble}
\\begin{document}
${pageStyle}
${titleBlock}

${content}

${solutionsAppendix}

\\end{document}`;
};
