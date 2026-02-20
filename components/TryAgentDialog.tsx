import React, { useState, useCallback } from 'react';
import { X, Zap, Loader2, Copy, Check, AlertCircle } from 'lucide-react';
import {
    Bot, FileText, Brain, CheckCircle as CheckCircleIcon, Gauge,
    Lightbulb, AlertTriangle, ClipboardCheck, Network, ListChecks,
    GitBranch, GraduationCap, Shapes, Table, BookMarked,
    LayoutTemplate, Wrench, FileCheck, Presentation, Copy as CopyIcon,
} from 'lucide-react';
import { AgentCapability, AgentDomain } from '../types';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
    Button, Input, Label, Textarea, Select
} from './ui';
import { cn } from '../lib/utils';
import * as api from '../services/agentApiService';

interface TryAgentDialogProps {
    agent: AgentCapability | null;
    open: boolean;
    onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
    Brain: <Brain className="w-5 h-5" />,
    Bot: <Bot className="w-5 h-5" />,
    CheckCircle: <CheckCircleIcon className="w-5 h-5" />,
    FileText: <FileText className="w-5 h-5" />,
    FileCheck: <FileCheck className="w-5 h-5" />,
    Copy: <CopyIcon className="w-5 h-5" />,
    Gauge: <Gauge className="w-5 h-5" />,
    Lightbulb: <Lightbulb className="w-5 h-5" />,
    AlertTriangle: <AlertTriangle className="w-5 h-5" />,
    ClipboardCheck: <ClipboardCheck className="w-5 h-5" />,
    Network: <Network className="w-5 h-5" />,
    ListChecks: <ListChecks className="w-5 h-5" />,
    GitBranch: <GitBranch className="w-5 h-5" />,
    GraduationCap: <GraduationCap className="w-5 h-5" />,
    Shapes: <Shapes className="w-5 h-5" />,
    Table: <Table className="w-5 h-5" />,
    Presentation: <Presentation className="w-5 h-5" />,
    BookMarked: <BookMarked className="w-5 h-5" />,
    LayoutTemplate: <LayoutTemplate className="w-5 h-5" />,
    Wrench: <Wrench className="w-5 h-5" />,
};

// Per-agent form configurations
interface FormField {
    key: string;
    label: string;
    type: 'input' | 'textarea' | 'select' | 'number';
    placeholder?: string;
    options?: { value: string; label: string }[];
    defaultValue?: string | number;
    required?: boolean;
}

const AGENT_FORMS: Record<string, FormField[]> = {
    'isomorphic-generator': [
        { key: 'exercise', label: 'Άσκηση (LaTeX)', type: 'textarea', placeholder: 'Επικολλήστε την άσκηση σε LaTeX...', required: true },
        { key: 'count', label: 'Πλήθος παραλλαγών', type: 'number', defaultValue: 2 },
    ],
    'difficulty-calibrator': [
        { key: 'exercises', label: 'Ασκήσεις (JSON)', type: 'textarea', placeholder: 'Εισάγετε ασκήσεις σε JSON format...', required: true },
    ],
    'hint-generator': [
        { key: 'exercise', label: 'Άσκηση (LaTeX)', type: 'textarea', placeholder: 'Επικολλήστε την άσκηση...', required: true },
        {
            key: 'levels', label: 'Βάθος υποδείξεων', type: 'select', defaultValue: '3', options: [
                { value: '1', label: '1 - Ιδέα' },
                { value: '2', label: '2 - Μεθοδολογία' },
                { value: '3', label: '3 - Κοντά στη λύση' },
            ]
        },
    ],
    'pitfall-detector': [
        { key: 'topic', label: 'Θεματική ενότητα', type: 'input', placeholder: 'π.χ. Παράγωγος, Ολοκληρώματα...', required: true },
    ],
    'rubric-designer': [
        { key: 'exam', label: 'Διαγώνισμα (LaTeX)', type: 'textarea', placeholder: 'Επικολλήστε το διαγώνισμα...', required: true },
        { key: 'totalPoints', label: 'Σύνολο μονάδων', type: 'number', defaultValue: 100 },
    ],
    'prerequisite-checker': [
        { key: 'topic', label: 'Θεματική ενότητα', type: 'input', placeholder: 'π.χ. Ακολουθίες, Παράγωγος...', required: true },
        {
            key: 'gradeLevel', label: 'Τάξη', type: 'select', defaultValue: 'Β Λυκείου', options: [
                { value: 'Α Γυμνασίου', label: 'Α Γυμνασίου' },
                { value: 'Β Γυμνασίου', label: 'Β Γυμνασίου' },
                { value: 'Γ Γυμνασίου', label: 'Γ Γυμνασίου' },
                { value: 'Α Λυκείου', label: 'Α Λυκείου' },
                { value: 'Β Λυκείου', label: 'Β Λυκείου' },
                { value: 'Γ Λυκείου', label: 'Γ Λυκείου' },
            ]
        },
    ],
    'multi-method-solver': [
        { key: 'exercise', label: 'Άσκηση (LaTeX)', type: 'textarea', placeholder: 'Επικολλήστε την άσκηση...', required: true },
    ],
    'panhellenic-formatter': [
        { key: 'topic', label: 'Θεματική ενότητα', type: 'input', placeholder: 'π.χ. Διαφορικός Λογισμός...', required: true },
        { key: 'year', label: 'Έτος (προαιρετικό)', type: 'number', placeholder: '2024' },
    ],
    'fix-agent': [
        { key: 'latexCode', label: 'Κώδικας LaTeX', type: 'textarea', placeholder: 'Επικολλήστε τον κώδικα LaTeX με σφάλμα...', required: true },
        { key: 'errorMessage', label: 'Μήνυμα σφάλματος (προαιρετικό)', type: 'input', placeholder: 'π.χ. Undefined control sequence...' },
    ],
};

// Invoke the right API call
async function invokeAgent(agentId: string, formData: Record<string, any>): Promise<any> {
    switch (agentId) {
        case 'isomorphic-generator':
            return api.apiGenerateVariants({ exercise: { content: formData.exercise }, count: Number(formData.count) || 2 });
        case 'difficulty-calibrator': {
            let exercises: any[];
            try { exercises = JSON.parse(formData.exercises); } catch { exercises = [{ content: formData.exercises }]; }
            return api.apiCalibrateDifficulty({ exercises });
        }
        case 'hint-generator':
            return api.apiGenerateHints({ exercise: { content: formData.exercise }, levels: Number(formData.levels) || 3 });
        case 'pitfall-detector':
            return api.apiDetectPitfalls({ topic: formData.topic });
        case 'rubric-designer':
            return api.apiGenerateRubric({ exam: { content: formData.exam }, totalPoints: Number(formData.totalPoints) || 100 });
        case 'prerequisite-checker':
            return api.apiCheckPrerequisites({ topic: formData.topic, gradeLevel: formData.gradeLevel || 'Β Λυκείου' });
        case 'multi-method-solver':
            return api.apiMultiMethodSolve({ exercise: { content: formData.exercise } });
        case 'panhellenic-formatter':
            return api.apiFormatPanhellenic({ topic: formData.topic, year: formData.year ? Number(formData.year) : undefined });
        case 'fix-agent':
            return api.apiFixLatex({ latexCode: formData.latexCode, errorMessage: formData.errorMessage });
        default:
            throw new Error(`No API handler for agent: ${agentId}`);
    }
}

const TryAgentDialog: React.FC<TryAgentDialogProps> = ({ agent, open, onClose }) => {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fields = agent ? AGENT_FORMS[agent.id] || [] : [];
    const isEducation = agent?.domain === AgentDomain.EDUCATION;
    const icon = agent ? (ICON_MAP[agent.icon] || <Bot className="w-5 h-5" />) : null;

    const handleChange = useCallback((key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!agent) return;
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const res = await invokeAgent(agent.id, formData);
            setResult(res);
        } catch (err: any) {
            setError(err.message || 'Σφάλμα κατά την εκτέλεση');
        } finally {
            setLoading(false);
        }
    }, [agent, formData]);

    const handleCopy = useCallback(() => {
        if (!result) return;
        const text = typeof result === 'string' ? result :
            result.latex || result.solution_latex || JSON.stringify(result, null, 2);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [result]);

    const handleClose = useCallback(() => {
        setFormData({});
        setResult(null);
        setError(null);
        setLoading(false);
        onClose();
    }, [onClose]);

    const renderResult = () => {
        if (!result) return null;

        const displayText = typeof result === 'string' ? result :
            result.latex || result.solution_latex || JSON.stringify(result, null, 2);

        return (
            <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" />
                        Αποτέλεσμα
                    </h4>
                    <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Αντιγράφηκε' : 'Αντιγραφή'}
                    </Button>
                </div>
                <pre className="bg-muted/70 rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap break-words border border-border/50">
                    {displayText}
                </pre>
            </div>
        );
    };

    if (!agent || fields.length === 0) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            isEducation ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        )}>
                            {icon}
                        </div>
                        <div>
                            <div className="text-base font-bold">{agent.nameEl}</div>
                            <div className="text-xs text-muted-foreground font-normal mt-0.5">{agent.descriptionEl}</div>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {fields.map(field => (
                        <div key={field.key} className="space-y-1.5">
                            <Label className="text-xs font-medium">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-0.5">*</span>}
                            </Label>
                            {field.type === 'input' && (
                                <Input
                                    placeholder={field.placeholder}
                                    value={formData[field.key] || ''}
                                    onChange={e => handleChange(field.key, e.target.value)}
                                />
                            )}
                            {field.type === 'textarea' && (
                                <Textarea
                                    placeholder={field.placeholder}
                                    value={formData[field.key] || ''}
                                    onChange={e => handleChange(field.key, e.target.value)}
                                    className="min-h-[100px] font-mono text-xs"
                                />
                            )}
                            {field.type === 'number' && (
                                <Input
                                    type="number"
                                    placeholder={field.placeholder || ''}
                                    value={formData[field.key] ?? field.defaultValue ?? ''}
                                    onChange={e => handleChange(field.key, e.target.value)}
                                    className="max-w-[120px]"
                                />
                            )}
                            {field.type === 'select' && field.options && (
                                <Select
                                    value={formData[field.key] ?? field.defaultValue ?? ''}
                                    onChange={e => handleChange(field.key, e.target.value)}
                                >
                                    {field.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </Select>
                            )}
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 mt-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Result */}
                {renderResult()}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-border/50">
                    <Button variant="outline" onClick={handleClose} className="text-sm">
                        Κλείσιμο
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="gap-2 text-sm min-w-[140px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Εκτέλεση...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                Εκτέλεση
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TryAgentDialog;
