import React, { useState } from 'react';
import { ChevronLeft, Wand2, RefreshCw, Save, Copy, FileText, Code, Plus, Trash2, ChevronDown, ChevronRight, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, Textarea } from '../components/ui';
import AgentCard from '../components/AgentCard';
import TopicSelector from '../components/TopicSelector';
import { Agent, AgentStatus, AgentDomain, ExerciseType } from '../types';
import PrerequisiteChecker from '../components/PrerequisiteChecker';
import { apiGenerateExercises } from '../services/agentApiService';
import { useSettings } from '../contexts/SettingsContext';
import { cn } from '../lib/utils';
import { useToast } from '../components/Toast';
import { ExerciseEditForm } from '../components/ExerciseEditForm';
import LatexRenderer from '../components/LatexRenderer';

// A local mock of how we track the exercise state
interface CurrentExercise {
    latex: string;
    solution?: string;
}

const ExerciseCreator: React.FC = () => {
    const { settings } = useSettings();
    const { toast } = useToast();

    // Editor State
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [loading, setLoading] = useState(false);

    // Generation Params
    const [topic, setTopic] = useState('');
    const [manualTopic, setManualTopic] = useState('');
    const [useManualTopic, setUseManualTopic] = useState(false);
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

    const [difficultyStr, setDifficultyStr] = useState<'easy' | 'medium' | 'hard' | 'advanced'>('medium');
    const [includeSolutions, setIncludeSolutions] = useState(true);

    // Phase 2 Enhancements State
    const [extraInstructions, setExtraInstructions] = useState('');
    const [isMultipart, setIsMultipart] = useState(false);
    const [subQuestions, setSubQuestions] = useState<{ id: string, topicPath: string, topicId: string }[]>([]);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(true);
    const [isMetaOpen, setIsMetaOpen] = useState(false);

    // Current Edit State
    const [exercise, setExercise] = useState<CurrentExercise | null>(null);
    const [editedLatex, setEditedLatex] = useState('');

    // Bank Metadata State
    const [metadata, setMetadata] = useState({
        title: '',
        difficulty: 3,
        hasSolution: true,
        solution: '',
        description: '',
        bibliography: '',
        tags: [] as string[],
        isPublic: false,
        topicId: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    // Agents
    const [agents, setAgents] = useState<Agent[]>([
        { id: 'exercise-generator', name: 'Exercise Generator', role: 'Δημιουργία Άσκησης', description: 'Generating content', status: AgentStatus.IDLE, icon: 'Bot', domain: AgentDomain.EDUCATION }
    ]);

    const handleGenerate = async () => {
        let finalTopicPrompt = '';

        if (isMultipart) {
            if (subQuestions.length === 0) {
                toast('Παρακαλώ προσθέστε τουλάχιστον ένα υποερώτημα.', 'error');
                return;
            }
            finalTopicPrompt = `Δημιούργησε μια άσκηση με ${subQuestions.length} υποερωτήματα. Τα υποερωτήματα αφορούν την εξής ύλη:\n` +
                subQuestions.map((sq, i) => `${String.fromCharCode(97 + i)}) ${sq.topicPath}`).join('\n');
            if (extraInstructions) {
                finalTopicPrompt += `\n\nΠρόσθετες Οδηγίες:\n${extraInstructions}`;
            }
        } else {
            const currentTopic = useManualTopic ? manualTopic : topic;
            if (!currentTopic) {
                toast('Επιλέξτε ή πληκτρολογήστε θέμα.', 'error');
                return;
            }
            finalTopicPrompt = currentTopic;
            if (extraInstructions) {
                finalTopicPrompt += `\n\nΠρόσθετες Οδηγίες:\n${extraInstructions}`;
            }
        }

        setLoading(true);
        setAgents(agents.map(a => ({ ...a, status: AgentStatus.WORKING })));

        try {
            const apiResult = await apiGenerateExercises({
                topic: finalTopicPrompt,
                difficulty: difficultyStr,
                count: 1, // Only one
                mode: 'practice',
            });

            if (apiResult.exercises && apiResult.exercises.length > 0) {
                const ex = apiResult.exercises[0];
                setExercise({ latex: ex.latex, solution: ex.solution });
                setEditedLatex(ex.latex);

                // Pre-fill metadata
                let defaultTitle = 'Νέα Άσκηση';
                let primaryTopicId = '';
                if (!isMultipart && topic) {
                    defaultTitle = `Άσκηση: ${topic.split(' - ').pop() || topic}`;
                    primaryTopicId = selectedNodeIds[0] || '';
                } else if (isMultipart && subQuestions.length > 0) {
                    defaultTitle = `Συνδυαστική Άσκηση (${subQuestions.length} Ερωτήματα)`;
                    primaryTopicId = subQuestions[0].topicId; // Assign first topic as primary for bank indexing
                }

                setMetadata(prev => ({
                    ...prev,
                    title: defaultTitle,
                    difficulty: difficultyStr === 'easy' ? 2 : difficultyStr === 'medium' ? 3 : difficultyStr === 'hard' ? 4 : 5,
                    hasSolution: !!ex.solution,
                    solution: ex.solution || '',
                    topicId: primaryTopicId,
                }));
            } else {
                toast('Δεν δημιουργήθηκε άσκηση.', 'error');
            }
            setAgents(agents.map(a => ({ ...a, status: AgentStatus.COMPLETED })));
        } catch (error) {
            console.error(error);
            setAgents(agents.map(a => ({ ...a, status: AgentStatus.ERROR })));
            toast(`Αποτυχία: ${error instanceof Error ? error.message : String(error)}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const addSubQuestion = () => {
        setSubQuestions([...subQuestions, { id: crypto.randomUUID(), topicPath: '', topicId: '' }]);
    };

    const removeSubQuestion = (id: string) => {
        setSubQuestions(subQuestions.filter(sq => sq.id !== id));
    };

    const updateSubQuestion = (id: string, topicPath: string, topicId: string) => {
        setSubQuestions(subQuestions.map(sq => sq.id === id ? { ...sq, topicPath, topicId } : sq));
    };

    const handleSaveToBank = async () => {
        if (!editedLatex) return;
        if (!metadata.topicId) {
            toast('Επιλέξτε Θεματική Ενότητα (Syllabus) για να αποθηκεύσετε.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/exercises', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: editedLatex,
                    ...metadata,
                    ownerId: 'user_1', // Mock auth
                }),
            });

            if (!res.ok) throw new Error('Αποτυχία αποθήκευσης');

            toast('Η άσκηση αποθηκεύτηκε επιτυχώς στην Τράπεζα!', 'success');
        } catch (error: any) {
            toast(error.message || 'Σφάλμα κατά την αποθήκευση.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            {/* Sidebar Config */}
            <div className="w-[400px] border-r border-border bg-background flex flex-col z-10 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center gap-2 flex-none">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="font-semibold text-lg">Δημιουργία Άσκησης</h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Collapsible Section 1: Generation Settings */}
                    <div className="border-b border-border">
                        <button
                            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                        >
                            <span className="font-semibold text-sm flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-slate-500" /> Ρυθμίσεις Δημιουργίας
                            </span>
                            {isAdvancedOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>

                        <div className={cn("px-4 pb-6 space-y-6 overflow-hidden transition-all", isAdvancedOpen ? "block" : "hidden")}>
                            {/* Toggle Multipart */}
                            <div className="flex bg-slate-100 rounded-md p-1 mt-2">
                                <button
                                    onClick={() => setIsMultipart(false)}
                                    className={cn("text-xs font-semibold px-2 py-2 rounded-md transition-all flex-1 text-center shadow-sm", !isMultipart ? "bg-white text-blue-700" : "bg-transparent text-slate-500 shadow-none hover:text-slate-700")}
                                >
                                    Ενιαίο Θέμα
                                </button>
                                <button
                                    onClick={() => setIsMultipart(true)}
                                    className={cn("text-xs font-semibold px-2 py-2 rounded-md transition-all flex-1 text-center shadow-sm", isMultipart ? "bg-white text-blue-700" : "bg-transparent text-slate-500 shadow-none hover:text-slate-700")}
                                >
                                    Υποερωτήματα
                                </button>
                            </div>

                            {/* Single vs Multipart UI */}
                            {!isMultipart ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Επιλογή Ύλης</Label>
                                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-600" onClick={() => setUseManualTopic(!useManualTopic)}>
                                            {useManualTopic ? 'Επιλογή από Ύλη' : 'Χειροκίνητα'}
                                        </Button>
                                    </div>
                                    {useManualTopic ? (
                                        <Input value={manualTopic} onChange={(e) => setManualTopic(e.target.value)} placeholder="π.χ. Δευτεροβάθμιες Εξισώσεις" className="bg-white border-slate-200" />
                                    ) : (
                                        <div className="bg-white rounded-md">
                                            <TopicSelector value={topic} onChange={setTopic} onSelectedIdsChange={(ids) => { setSelectedNodeIds(ids); setMetadata(m => ({ ...m, topicId: ids[0] || '' })); }} />
                                        </div>
                                    )}
                                    {!useManualTopic && <div className="flex justify-end pt-1"><PrerequisiteChecker selectedNodeIds={selectedNodeIds} /></div>}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Δομή Ερωτημάτων</Label>
                                    {subQuestions.length === 0 && (
                                        <div className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-md">
                                            Δεν έχουν προστεθεί υποερωτήματα.
                                        </div>
                                    )}
                                    {subQuestions.map((sq, index) => (
                                        <div key={sq.id} className="flex gap-3 items-start bg-slate-50/50 p-2.5 rounded-lg border border-slate-200 shadow-sm relative group">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                {String.fromCharCode(97 + index)}
                                            </div>
                                            <div className="flex-1 min-w-0 bg-white rounded-md overflow-hidden">
                                                <TopicSelector
                                                    value={sq.topicPath}
                                                    onChange={(val) => updateSubQuestion(sq.id, val, sq.topicId)}
                                                    onSelectedIdsChange={(ids) => updateSubQuestion(sq.id, sq.topicPath, ids[0] || '')}
                                                />
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0" onClick={() => removeSubQuestion(sq.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={addSubQuestion} className="w-full border-dashed border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-300 gap-2 mt-2 bg-slate-50/50">
                                        <Plus className="w-4 h-4" /> Προσθήκη Ερωτήματος
                                    </Button>
                                </div>
                            )}

                            {/* Extra Instructions */}
                            <div className="space-y-3 pt-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Πρόσθετες Οδηγίες (Προαιρετικό)</Label>
                                <Textarea
                                    className="resize-none text-sm min-h-[80px] bg-white border-slate-200 shadow-sm"
                                    placeholder="π.χ. Να έχει εφαρμογή στη φυσική... Ή να επιλυθεί με την μέθοδο αντικατάστασης."
                                    value={extraInstructions}
                                    onChange={(e) => setExtraInstructions(e.target.value)}
                                />
                            </div>

                            {/* Difficulty */}
                            <div className="space-y-3 pt-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Επίπεδο Δυσκολίας (AI)</Label>
                                <div className="flex bg-slate-100 rounded-md p-1">
                                    {(['easy', 'medium', 'hard', 'advanced'] as const).map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficultyStr(d)}
                                            className={cn("text-xs font-semibold px-2 py-2 rounded-md transition-all flex-1 text-center capitalize shadow-sm", difficultyStr === d ? "bg-white text-blue-700" : "bg-transparent text-slate-500 shadow-none hover:text-slate-700")}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2 shadow-md h-11 text-base bg-blue-600 hover:bg-blue-700 text-white mt-4">
                                {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                                AI Δημιουργία
                            </Button>
                        </div>
                    </div>

                    {/* Collapsible Section 2: Metadata & Save */}
                    <div className={cn("transition-opacity duration-300 border-b border-border", exercise ? "opacity-100 bg-emerald-50/30" : "opacity-40 pointer-events-none")}>
                        <button
                            onClick={() => setIsMetaOpen(!isMetaOpen)}
                            className="w-full p-4 flex items-center justify-between text-left hover:bg-emerald-50/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset"
                        >
                            <span className="font-semibold text-sm flex items-center gap-2">
                                <Save className={cn("w-4 h-4", exercise ? "text-emerald-600" : "text-slate-400")} />
                                Αποθήκευση στην Τράπεζα
                            </span>
                            {isMetaOpen || exercise ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>

                        <div className={cn("transition-all overflow-hidden", isMetaOpen || exercise ? "block" : "hidden")}>
                            <ExerciseEditForm exerciseData={metadata} onChange={setMetadata} onSave={handleSaveToBank} isSaving={isSaving} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-slate-50">
                <div className="h-14 border-b border-border bg-white flex items-center justify-between px-6 shrink-0">
                    <div className="flex bg-slate-100 rounded-md p-1">
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={cn("text-sm font-medium px-4 py-1.5 rounded-md transition-all flex items-center gap-2", activeTab === 'preview' ? "bg-white shadow-sm text-blue-700" : "text-slate-500 hover:text-slate-700")}
                        >
                            <FileText className="w-4 h-4" /> Preview
                        </button>
                        <button
                            onClick={() => setActiveTab('code')}
                            className={cn("text-sm font-medium px-4 py-1.5 rounded-md transition-all flex items-center gap-2", activeTab === 'code' ? "bg-white shadow-sm text-blue-700" : "text-slate-500 hover:text-slate-700")}
                        >
                            <Code className="w-4 h-4" /> LaTeX Editor
                        </button>
                    </div>
                    {exercise && (
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                            navigator.clipboard.writeText(editedLatex);
                            toast('Αντιγράφηκε!', 'success');
                        }}>
                            <Copy className="h-4 w-4" /> Αντιγραφή LaTeX
                        </Button>
                    )}
                </div>

                <div className="flex-1 overflow-auto p-8 flex justify-center h-full">
                    {!exercise && !loading && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                            <Wand2 className="w-16 h-16 opacity-20" />
                            <p className="text-lg font-medium text-slate-600">Πατήστε AI Δημιουργία για να ξεκινήσετε</p>
                            <p className="text-sm">Ή επικολλήστε δικό σας κώδικα LaTeX στον Editor.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-blue-600">
                            <RefreshCw className="w-12 h-12 animate-spin opacity-50" />
                            <p className="font-medium animate-pulse">Δημιουργία Άσκησης...</p>
                        </div>
                    )}

                    {exercise && !loading && activeTab === 'preview' && (
                        <Card className="w-full max-w-4xl h-fit max-h-full flex flex-col shadow-lg border-0 bg-white">
                            <CardContent className="p-8 overflow-y-auto flex-1">
                                <div className="prose max-w-none">
                                    <LatexRenderer latex={editedLatex} />
                                </div>
                                {metadata.hasSolution && metadata.solution && (
                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                        <h4 className="text-sm font-bold text-emerald-600 mb-4 uppercase tracking-wider">Λύση</h4>
                                        <div className="prose max-w-none text-slate-600">
                                            <LatexRenderer latex={metadata.solution} />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {exercise && !loading && activeTab === 'code' && (
                        <Card className="w-full max-w-4xl h-full flex flex-col shadow-lg border-0 overflow-hidden">
                            <CardContent className="p-0 bg-[#282c34] flex-1 flex flex-col">
                                <textarea
                                    className="w-full h-full p-6 bg-transparent text-[#abb2bf] font-mono text-sm resize-none focus:outline-none focus:ring-0"
                                    value={editedLatex}
                                    onChange={(e) => setEditedLatex(e.target.value)}
                                    spellCheck={false}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExerciseCreator;
