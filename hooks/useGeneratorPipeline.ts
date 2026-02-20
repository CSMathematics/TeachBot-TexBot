import { useState, useCallback } from 'react';
import { Agent, AgentStatus, Exam } from '../types';
import { generateLatexFromExam } from '../lib/latexGenerator';
import { TemplateConfig, DEFAULT_TEMPLATE_CONFIG } from '../services/templateService';
import { saveExam } from '../services/storageService';

// ── Types ────────────────────────────────────────────────────────────

export interface GeneratorState {
    loading: boolean;
    activeTab: 'preview' | 'code' | 'time' | 'flowchart';
    agents: Agent[];
    templateConfig: TemplateConfig;
    fixerOpen: boolean;
}

export interface GeneratorActions {
    setLoading: (v: boolean) => void;
    setActiveTab: (tab: GeneratorState['activeTab']) => void;
    setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
    setTemplateConfig: (config: TemplateConfig) => void;
    setFixerOpen: (v: boolean) => void;

    // Utility actions
    getLatexSource: (exam: Exam | null) => string;
    handleDownloadSource: (exam: Exam | null, filenamePrefix?: string) => void;
    handleCopyLatex: (exam: Exam | null) => Promise<boolean>;
    handleSave: (exam: Exam | null, extraData?: Partial<Exam>) => boolean;

    // Agent pipeline helpers
    startAgentPipeline: (agentFactory: () => Agent[]) => Agent[];
    markAgent: (agentId: string, status: AgentStatus) => void;
    markAllAgentsError: () => void;
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useGeneratorPipeline(
    initialAgents: () => Agent[],
    initialConfig?: Partial<TemplateConfig>
): GeneratorState & GeneratorActions {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<GeneratorState['activeTab']>('preview');
    const [agents, setAgents] = useState<Agent[]>(initialAgents);
    const [templateConfig, setTemplateConfig] = useState<TemplateConfig>({ ...DEFAULT_TEMPLATE_CONFIG, ...initialConfig });
    const [fixerOpen, setFixerOpen] = useState(false);

    // ── LaTeX utilities ─────────────────────────────────────────────

    const getLatexSource = useCallback((exam: Exam | null): string => {
        if (!exam) return '';
        return generateLatexFromExam(exam, templateConfig);
    }, [templateConfig]);

    const handleDownloadSource = useCallback((exam: Exam | null, filenamePrefix = 'export') => {
        if (!exam) return;
        const source = generateLatexFromExam(exam, templateConfig);
        const blob = new Blob([source], { type: 'application/x-latex' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.tex`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [templateConfig]);

    const handleCopyLatex = useCallback(async (exam: Exam | null): Promise<boolean> => {
        if (!exam) return false;
        const source = generateLatexFromExam(exam, templateConfig);
        try {
            await navigator.clipboard.writeText(source);
            return true;
        } catch {
            return false;
        }
    }, [templateConfig]);

    const handleSave = useCallback((exam: Exam | null, extraData?: Partial<Exam>): boolean => {
        if (!exam) return false;
        const examToSave = { ...exam, ...extraData };
        saveExam(examToSave);
        return true;
    }, []);

    // ── Agent pipeline helpers ──────────────────────────────────────

    const startAgentPipeline = useCallback((agentFactory: () => Agent[]): Agent[] => {
        const currentAgents = agentFactory();
        setAgents(currentAgents);
        setLoading(true);
        return currentAgents;
    }, []);

    const markAgent = useCallback((agentId: string, status: AgentStatus) => {
        setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status } : a));
    }, []);

    const markAllAgentsError = useCallback(() => {
        setAgents(prev => prev.map(a => ({ ...a, status: AgentStatus.ERROR })));
    }, []);

    return {
        // State
        loading,
        activeTab,
        agents,
        templateConfig,
        fixerOpen,
        // Setters
        setLoading,
        setActiveTab,
        setAgents,
        setTemplateConfig,
        setFixerOpen,
        // Utilities
        getLatexSource,
        handleDownloadSource,
        handleCopyLatex,
        handleSave,
        // Pipeline
        startAgentPipeline,
        markAgent,
        markAllAgentsError,
    };
}
