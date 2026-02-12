import { AgentDomain, AgentCapability, AgentStatus, Agent } from '../types';

// ─── Complete Agent Registry (19 Agents) ────────────────────────────

export const AGENT_REGISTRY: AgentCapability[] = [
    // ── Education Domain (12 Agents) ──────────────────────────────────
    {
        id: 'exercise-generator',
        name: 'Exercise Generator',
        nameEl: 'Γεννήτρια Ασκήσεων',
        role: 'Creating Problems',
        description: 'Creates base exercises from prompts with clean numbers',
        descriptionEl: 'Δημιουργεί ασκήσεις με καθαρούς αριθμούς',
        domain: AgentDomain.EDUCATION,
        icon: 'Bot',
        endpoint: '/api/generate-exercises',
        color: '#06b6d4',
        visionAgent: 'B',
    },
    {
        id: 'exam-creator',
        name: 'Exam Creator',
        nameEl: 'Δημιουργός Διαγωνισμάτων',
        role: 'Assembling Exams',
        description: 'Assembles exercises into full exam papers',
        descriptionEl: 'Συναρμολογεί ασκήσεις σε πλήρη διαγωνίσματα',
        domain: AgentDomain.EDUCATION,
        icon: 'FileCheck',
        endpoint: '/api/generate-exam',
        color: '#0ea5e9',
        visionAgent: 'A',
    },
    {
        id: 'solution-writer',
        name: 'Solution Writer',
        nameEl: 'Συγγραφέας Λύσεων',
        role: 'Solving & Validating',
        description: 'Generates step-by-step LaTeX solutions',
        descriptionEl: 'Δημιουργεί λύσεις βήμα-βήμα',
        domain: AgentDomain.EDUCATION,
        icon: 'CheckCircle',
        endpoint: '/api/generate-solutions',
        color: '#10b981',
        visionAgent: 'C',
    },
    {
        id: 'isomorphic-generator',
        name: 'Variant Generator',
        nameEl: 'Γεννήτρια Παραλλαγών',
        role: 'Creating Variations',
        description: 'Creates N isomorphic variations of exercises (Group A/B)',
        descriptionEl: 'Δημιουργεί παραλλαγές ασκήσεων (Ομάδα Α/Β)',
        domain: AgentDomain.EDUCATION,
        icon: 'Copy',
        endpoint: '/api/generate-variants',
        color: '#8b5cf6',
        visionAgent: 'B',
    },
    {
        id: 'difficulty-calibrator',
        name: 'Difficulty Calibrator',
        nameEl: 'Βαθμονομητής Δυσκολίας',
        role: 'Calibrating Difficulty',
        description: 'Analyzes and calibrates exam difficulty distribution',
        descriptionEl: 'Αναλύει και βαθμονομεί την κατανομή δυσκολίας',
        domain: AgentDomain.EDUCATION,
        icon: 'Gauge',
        endpoint: '/api/calibrate-difficulty',
        color: '#f59e0b',
        visionAgent: 'F',
    },
    {
        id: 'hint-generator',
        name: 'Hint Designer',
        nameEl: 'Σχεδιαστής Υποδείξεων',
        role: 'Designing Hints',
        description: 'Creates graduated hints (idea → methodology → near-solution)',
        descriptionEl: 'Δημιουργεί κλιμακωτές υποδείξεις',
        domain: AgentDomain.EDUCATION,
        icon: 'Lightbulb',
        endpoint: '/api/generate-hints',
        color: '#eab308',
        visionAgent: 'I',
    },
    {
        id: 'pitfall-detector',
        name: 'Pitfall Detector',
        nameEl: 'Ανιχνευτής Παγίδων',
        role: 'Detecting Common Mistakes',
        description: 'Predicts traps and sticking points for students',
        descriptionEl: 'Προβλέπει παγίδες και σημεία που κολλάνε μαθητές',
        domain: AgentDomain.EDUCATION,
        icon: 'AlertTriangle',
        endpoint: '/api/detect-pitfalls',
        color: '#ef4444',
        visionAgent: 'H',
    },
    {
        id: 'rubric-designer',
        name: 'Rubric Designer',
        nameEl: 'Σχεδιαστής Κριτηρίων',
        role: 'Creating Grading Schemes',
        description: 'Produces detailed grading rubrics per question',
        descriptionEl: 'Παράγει αναλυτικά κριτήρια βαθμολόγησης',
        domain: AgentDomain.EDUCATION,
        icon: 'ClipboardCheck',
        endpoint: '/api/generate-rubric',
        color: '#14b8a6',
        visionAgent: 'J',
    },
    {
        id: 'mindmap-generator',
        name: 'Mindmap Generator',
        nameEl: 'Γεννήτρια Εννοιολογικών Χαρτών',
        role: 'Generating Mindmaps',
        description: 'Creates concept maps for topic visualization',
        descriptionEl: 'Δημιουργεί εννοιολογικούς χάρτες',
        domain: AgentDomain.EDUCATION,
        icon: 'Network',
        endpoint: '/api/generate-mindmap',
        color: '#a855f7',
    },
    {
        id: 'prerequisite-checker',
        name: 'Prerequisite Checker',
        nameEl: 'Ελεγκτής Προαπαιτουμένων',
        role: 'Checking Prerequisites',
        description: 'Validates prerequisite knowledge for a topic',
        descriptionEl: 'Ελέγχει τα προαπαιτούμενα ενός θέματος',
        domain: AgentDomain.EDUCATION,
        icon: 'ListChecks',
        endpoint: '/api/check-prerequisites',
        color: '#64748b',
    },
    {
        id: 'multi-method-solver',
        name: 'Multi-Method Solver',
        nameEl: 'Πολυμεθοδικός Λύτης',
        role: 'Solving Multiple Ways',
        description: 'Solves exercises using multiple methods',
        descriptionEl: 'Επιλύει ασκήσεις με πολλαπλές μεθόδους',
        domain: AgentDomain.EDUCATION,
        icon: 'GitBranch',
        endpoint: '/api/multi-method-solve',
        color: '#6366f1',
    },
    {
        id: 'panhellenic-formatter',
        name: 'Panhellenic Formatter',
        nameEl: 'Μορφοποιητής Πανελληνίων',
        role: 'Formatting Panhellenic Style',
        description: 'Formats exercises in Panhellenic exam style',
        descriptionEl: 'Μορφοποιεί ασκήσεις σε στυλ Πανελληνίων',
        domain: AgentDomain.EDUCATION,
        icon: 'GraduationCap',
        endpoint: '/api/format-panhellenic',
        color: '#0284c7',
        visionAgent: 'G',
    },

    // ── Documents Domain (7 Agents) ───────────────────────────────────
    {
        id: 'document-builder',
        name: 'Document Builder',
        nameEl: 'Δημιουργός Εγγράφων',
        role: 'Building Documents',
        description: 'Creates articles, reports, books, CVs, and letters',
        descriptionEl: 'Δημιουργεί άρθρα, αναφορές, βιβλία, CV, επιστολές',
        domain: AgentDomain.DOCUMENTS,
        icon: 'FileText',
        endpoint: '/api/build-document',
        color: '#f97316',
        visionAgent: 'D',
    },
    {
        id: 'tikz-expert',
        name: 'TikZ Expert',
        nameEl: 'Ειδικός TikZ',
        role: 'Creating Figures',
        description: 'Generates geometric figures and plots using TikZ/PGFPlots',
        descriptionEl: 'Δημιουργεί σχήματα και γραφήματα με TikZ',
        domain: AgentDomain.DOCUMENTS,
        icon: 'Shapes',
        endpoint: '/api/generate-figure',
        color: '#fb923c',
    },
    {
        id: 'table-formatter',
        name: 'Table Formatter',
        nameEl: 'Μορφοποιητής Πινάκων',
        role: 'Formatting Tables',
        description: 'Creates professionally styled LaTeX tables',
        descriptionEl: 'Δημιουργεί επαγγελματικούς πίνακες LaTeX',
        domain: AgentDomain.DOCUMENTS,
        icon: 'Table',
        endpoint: '/api/format-table',
        color: '#ea580c',
    },
    {
        id: 'beamer-creator',
        name: 'Beamer Creator',
        nameEl: 'Δημιουργός Παρουσιάσεων',
        role: 'Creating Presentations',
        description: 'Generates Beamer/LaTeX presentation slides',
        descriptionEl: 'Δημιουργεί παρουσιάσεις Beamer',
        domain: AgentDomain.DOCUMENTS,
        icon: 'Presentation',
        endpoint: '/api/create-presentation',
        color: '#d97706',
    },
    {
        id: 'bibliography-manager',
        name: 'Bibliography Manager',
        nameEl: 'Διαχειριστής Βιβλιογραφίας',
        role: 'Managing Citations',
        description: 'Manages BibTeX entries and citation formatting',
        descriptionEl: 'Διαχειρίζεται βιβλιογραφικές αναφορές',
        domain: AgentDomain.DOCUMENTS,
        icon: 'BookMarked',
        endpoint: '/api/manage-bibliography',
        color: '#c2410c',
    },
    {
        id: 'template-curator',
        name: 'Template Curator',
        nameEl: 'Επιμελητής Προτύπων',
        role: 'Curating Templates',
        description: 'Manages and applies LaTeX document templates',
        descriptionEl: 'Διαχειρίζεται πρότυπα εγγράφων LaTeX',
        domain: AgentDomain.DOCUMENTS,
        icon: 'LayoutTemplate',
        endpoint: '/api/manage-templates',
        color: '#9a3412',
    },
    {
        id: 'fix-agent',
        name: 'LaTeX Fix Agent',
        nameEl: 'Διορθωτής LaTeX',
        role: 'Fixing Errors',
        description: 'Diagnoses and fixes LaTeX compilation errors',
        descriptionEl: 'Διαγιγνώσκει και διορθώνει σφάλματα LaTeX',
        domain: AgentDomain.DOCUMENTS,
        icon: 'Wrench',
        endpoint: '/api/fix-latex',
        color: '#b91c1c',
    },
];

// ─── Helper Functions ───────────────────────────────────────────────

export function getAgentsByDomain(domain: AgentDomain): AgentCapability[] {
    return AGENT_REGISTRY.filter(a => a.domain === domain);
}

export function getAgentById(id: string): AgentCapability | undefined {
    return AGENT_REGISTRY.find(a => a.id === id);
}

export function getAgentEndpoint(id: string): string {
    const agent = getAgentById(id);
    return agent?.endpoint ?? '';
}

export function getEducationAgents(): AgentCapability[] {
    return getAgentsByDomain(AgentDomain.EDUCATION);
}

export function getDocumentAgents(): AgentCapability[] {
    return getAgentsByDomain(AgentDomain.DOCUMENTS);
}

/** Converts an AgentCapability to a runtime Agent with IDLE status */
export function capabilityToAgent(cap: AgentCapability): Agent {
    return {
        id: cap.id,
        name: cap.name,
        role: cap.role,
        description: cap.description,
        status: AgentStatus.IDLE,
        icon: cap.icon,
        domain: cap.domain,
    };
}

/** Gets the exam generation pipeline agents in execution order */
export function getExamPipelineAgents(): AgentCapability[] {
    const pipelineOrder = [
        'prerequisite-checker',
        'exercise-generator',
        'solution-writer',
        'difficulty-calibrator',
        'isomorphic-generator',
        'rubric-designer',
    ];
    return pipelineOrder
        .map(id => getAgentById(id))
        .filter((a): a is AgentCapability => a !== undefined);
}
