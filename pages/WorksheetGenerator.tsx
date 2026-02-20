import React, { useState } from 'react';
import { ChevronLeft, Wand2, RefreshCw, Save, Download, Copy, Clock, BookOpen, Lightbulb, AlertTriangle, Stethoscope, Wrench, CheckSquare, GitBranch } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Input, Select, Label, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import AgentCard from '../components/AgentCard';
import PdfPreview from '../components/PdfPreview';
import DifficultySlider from '../components/DifficultySlider';
import TimeCalibration from '../components/TimeCalibration';
import TopicSelector from '../components/TopicSelector';
import { Agent, AgentStatus, AgentDomain, Exam, Question, SectionExerciseCount, ExerciseType, DifficultyDistribution } from '../types';
import PrerequisiteChecker from '../components/PrerequisiteChecker';
import SectionExerciseList, { resolveSyllabusNodes, syncSectionExerciseCounts } from '../components/SectionExerciseList';
import ExerciseTypeSelector from '../components/ExerciseTypeSelector';
import DifficultyDistributionSelector from '../components/DifficultyDistributionSelector';
import { apiGenerateExercises, apiGenerateFlowchart } from '../services/agentApiService';
import { useSettings } from '../contexts/SettingsContext';
import { cn } from '../lib/utils';
import TemplateConfigurator from '../components/TemplateConfigurator';
import LatexFixer from '../components/LatexFixer';
import MermaidChart from '../components/MermaidChart';
import { Dialog, DialogContent } from '../components/ui';
import { useGeneratorPipeline } from '../hooks/useGeneratorPipeline';
import { useToast } from '../components/Toast';

const WorksheetGenerator: React.FC = () => {
    const { settings } = useSettings();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    const initialStyle = searchParams.get('style') || 'scientific';

    const [result, setResult] = useState<{ exercises: any[]; count: number } | null>(null);

    // Params - read defaults from settings
    const [mode, setMode] = useState<'practice' | 'remedial'>('practice');
    const [mistakes, setMistakes] = useState('');
    const [includeSolutions, setIncludeSolutions] = useState(settings.showSolutions);

    const [topic, setTopic] = useState('Άλγεβρα: Εξισώσεις & Ανισώσεις - Εξισώσεις 2ου βαθμού');
    const [manualTopic, setManualTopic] = useState('');
    const [useManualTopic, setUseManualTopic] = useState(false);
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

    const [grade, setGrade] = useState(settings.defaultGradeLevel);
    const [difficulty, setDifficulty] = useState(50);
    const [difficultyMode, setDifficultyMode] = useState<'simple' | 'advanced'>('simple');
    const [difficultyDist, setDifficultyDist] = useState<DifficultyDistribution>({ easy: 30, medium: 50, hard: 20 });

    const [exerciseCount, setExerciseCount] = useState(5);
    const [duration, setDuration] = useState(45);
    const [includeHints, setIncludeHints] = useState(false);

    const [includePitfalls, setIncludePitfalls] = useState(false);
    const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([]);
    const [flowchartData, setFlowchartData] = useState<any>(null);
    const [flowchartLoading, setFlowchartLoading] = useState(false);

    // Per-section exercise count
    const [exerciseCountMode, setExerciseCountMode] = useState<'global' | 'per-section'>('global');
    const [sectionExerciseCounts, setSectionExerciseCounts] = useState<SectionExerciseCount[]>([]);

    // Agents - dynamic pipeline
    const getActiveAgents = (): Agent[] => {
        const base: Agent[] = [];

        if (mode === 'remedial') {
            base.push({ id: 'mistake-analyzer', name: 'Mistake Analyzer', role: 'Ανάλυση Λαθών', description: 'Analyzing patterns', status: AgentStatus.IDLE, icon: 'Stethoscope', domain: AgentDomain.EDUCATION });
        }

        base.push({ id: 'exercise-generator', name: 'Exercise Generator', role: 'Δημιουργία Ασκήσεων', description: 'Generating exercises', status: AgentStatus.IDLE, icon: 'Bot', domain: AgentDomain.EDUCATION });
        base.push({ id: 'solution-writer', name: 'Solution Writer', role: 'Λύσεις & Επαλήθευση', description: 'Step-by-step solutions', status: AgentStatus.IDLE, icon: 'CheckCircle', domain: AgentDomain.EDUCATION });

        if (includeHints || mode === 'remedial') {
            base.push({ id: 'hint-generator', name: 'Hint Generator', role: 'Δημιουργία Υποδείξεων', description: 'Progressive hints', status: AgentStatus.IDLE, icon: 'Lightbulb', domain: AgentDomain.EDUCATION });
        }

        if (includePitfalls || mode === 'remedial') {
            base.push({ id: 'pitfall-detector', name: 'Pitfall Detector', role: 'Εντοπισμός Παγίδων', description: 'Common mistakes', status: AgentStatus.IDLE, icon: 'AlertTriangle', domain: AgentDomain.EDUCATION });
        }

        base.push({ id: 'difficulty-calibrator', name: 'Difficulty Calibrator', role: 'Βαθμονόμηση', description: 'Checking balance', status: AgentStatus.IDLE, icon: 'Gauge', domain: AgentDomain.EDUCATION });

        return base;
    };

    // Shared pipeline hook
    const pipeline = useGeneratorPipeline(getActiveAgents, { style: initialStyle });
    const { loading, activeTab, agents, templateConfig, fixerOpen } = pipeline;

    const refreshAgents = () => pipeline.setAgents(getActiveAgents());

    const handleGenerate = async () => {
        const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
        const currentAgents = pipeline.startAgentPipeline(getActiveAgents);
        setResult(null);

        const currentTopic = useManualTopic ? manualTopic : topic;

        try {
            for (const agent of currentAgents) {
                pipeline.markAgent(agent.id, AgentStatus.WORKING);

                if (agent.id === 'exercise-generator') {
                    const diffLabel = difficulty < 25 ? 'easy' : difficulty < 50 ? 'medium' : difficulty < 75 ? 'hard' : 'advanced';

                    if (exerciseCountMode === 'per-section' && sectionExerciseCounts.length > 0) {
                        // Per-section mode: one call per section, then merge
                        console.log('[WorksheetGenerator] Per-section mode, generating for', sectionExerciseCounts.length, 'sections');
                        let allExercises: any[] = [];

                        for (const sec of sectionExerciseCounts) {
                            const sectionTopic = sec.parentName ? `${sec.parentName}: ${sec.nodeName}` : sec.nodeName;
                            console.log(`[WorksheetGenerator] Generating ${sec.count} exercises for: ${sectionTopic}`);

                            const apiResult = await apiGenerateExercises({
                                topic: sectionTopic,
                                difficulty: diffLabel,
                                count: sec.count,
                                mode,
                                mistakes: mode === 'remedial' ? mistakes.split('\n').filter(Boolean) : undefined,
                                exerciseTypes: exerciseTypes.length > 0 ? exerciseTypes : undefined
                            });

                            if (apiResult.exercises?.length > 0) {
                                allExercises = [...allExercises, ...apiResult.exercises];
                            }
                        }

                        if (allExercises.length === 0) {
                            toast('Δεν δημιουργήθηκαν ασκήσεις. Δοκιμάστε ξανά.', 'error');
                            throw new Error('No exercises generated');
                        }

                        setResult({ exercises: allExercises, count: allExercises.length });
                        setResult({ exercises: allExercises, count: allExercises.length });
                    } else if (exerciseCountMode === 'global' && difficultyMode === 'advanced') {
                        // Global Advanced Mode: Split into 3 parallel calls
                        console.log('[WorksheetGenerator] Global Advanced Mode: Splitting by difficulty');

                        // Calculate counts
                        const countEasy = Math.round(exerciseCount * (difficultyDist.easy / 100));
                        const countMedium = Math.round(exerciseCount * (difficultyDist.medium / 100));
                        let countHard = exerciseCount - countEasy - countMedium;
                        // Adjust if rounding caused negative hard (rare but possible with low count)
                        if (countHard < 0) { countHard = 0; } // Should not happen with well-behaved rounding but safety first

                        const requests = [];
                        if (countEasy > 0) requests.push({ diff: 'easy', count: countEasy });
                        if (countMedium > 0) requests.push({ diff: 'medium', count: countMedium });
                        if (countHard > 0) requests.push({ diff: 'hard', count: countHard });

                        const results = await Promise.all(requests.map(req => apiGenerateExercises({
                            topic: currentTopic,
                            difficulty: req.diff,
                            count: req.count,
                            mode,
                            mistakes: mode === 'remedial' ? mistakes.split('\n').filter(Boolean) : undefined,
                            exerciseTypes: exerciseTypes.length > 0 ? exerciseTypes : undefined
                        })));

                        const allExercises = results.flatMap(r => r.exercises || []);
                        setResult({ exercises: allExercises, count: allExercises.length });
                    } else {
                        // Global Simple Mode: single call
                        let exercises: any[];
                        try {
                            const apiResult = await apiGenerateExercises({
                                topic: currentTopic,
                                difficulty: diffLabel,
                                count: exerciseCount,
                                mode,
                                mistakes: mode === 'remedial' ? mistakes.split('\n').filter(Boolean) : undefined,
                                exerciseTypes: exerciseTypes.length > 0 ? exerciseTypes : undefined
                            });
                            exercises = apiResult.exercises;
                        } catch (error) {
                            console.error("API Error in WorksheetGenerator:", error);
                            throw error;
                        }
                        setResult({ exercises, count: exercises.length });
                    }
                } else {
                    await wait(300 + Math.random() * 200);
                }

                pipeline.markAgent(agent.id, AgentStatus.COMPLETED);
            }
        } catch (error) {
            console.error(error);
            pipeline.markAllAgentsError();
            toast(`Αποτυχία δημιουργίας: ${error instanceof Error ? error.message : String(error)}`, 'error');
        } finally {
            pipeline.setLoading(false);
        }
    };

    // Build mock Exam for PdfPreview
    const mockExam: Exam | null = result ? {
        id: `ws-${Date.now()}`,
        title: mode === 'remedial' ? `Ενισχυτική Διδασκαλία: ${useManualTopic ? manualTopic : topic}` : `Φυλλάδιο: ${useManualTopic ? manualTopic : topic}`,
        subject: useManualTopic ? manualTopic : topic,
        gradeLevel: grade,
        difficulty: difficulty < 25 ? 1 : difficulty < 50 ? 2 : difficulty < 75 ? 3 : 4,
        durationMinutes: duration,
        createdAt: new Date().toISOString(),
        questions: result.exercises.map((ex, i) => ({
            id: `q${i + 1}`,
            syllabusId: 'mock',
            parentId: null,
            nodeType: 'PARAGRAPH',
            orderIndex: i,
            type: 'exercise',
            content: ex.latex || `Άσκηση ${i + 1}`,
            difficulty: ex.metadata?.difficulty || 'Medium',
            points: 10,
            solution: ex.solution || `Λύση άσκησης ${i + 1}: x = ...`,
            tags: ex.metadata?.tags || [],
        })),
    } : null;



    // Update result when mockExam changes (e.g. edited in preview)
    const handleExamChange = (newExam: Exam) => {
        // Reconstruct result from newExam if needed, or just update local state if we had one
        // Since result and mockExam are derived, this is tricky. 
        // Better to store 'exercises' in state and derive mockExam, or store 'exam' in state.
        // For now, let's try to update 'result' exercises from the edited exam questions
        if (!result) return;

        const updatedExercises = newExam.questions.map(q => ({
            latex: q.content,
            metadata: { difficulty: q.difficulty, tags: q.tags },
            solution: q.solution
        }));

        setResult({ ...result, exercises: updatedExercises });
    };

    const getLatexSource = () => pipeline.getLatexSource(mockExam);

    const handleDownloadSource = () => {
        pipeline.handleDownloadSource(mockExam, 'worksheet');
        toast('Το αρχείο .tex κατέβηκε!', 'success');
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            {/* Sidebar Config */}
            <div className="w-[400px] border-r border-border bg-background flex flex-col z-10 shadow-xl">
                <div className="p-4 border-b border-border flex items-center gap-2">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="font-semibold text-lg">Δημιουργία Φυλλαδίου</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Mode Selection */}
                    <div className="bg-secondary/30 p-1 rounded-lg flex">
                        <button
                            onClick={() => { setMode('practice'); setTimeout(refreshAgents, 0); }}
                            className={cn("flex-1 py-1.5 text-sm font-medium rounded-md transition-all", mode === 'practice' ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground")}
                        >
                            Εξάσκηση
                        </button>
                        <button
                            onClick={() => { setMode('remedial'); setTimeout(refreshAgents, 0); }}
                            className={cn("flex-1 py-1.5 text-sm font-medium rounded-md transition-all", mode === 'remedial' ? "bg-background shadow text-rose-500" : "text-muted-foreground hover:text-foreground")}
                        >
                            Ενισχυτική (Remedial)
                        </button>
                    </div>

                    <div className="space-y-4">
                        {mode === 'remedial' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label className="text-rose-500 flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4" />
                                    Ανάλυση Λαθών / Αδυναμίες
                                </Label>
                                <textarea
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                                    placeholder="Περιγράψτε τα λάθη (π.χ. αδυναμία στις ταυτότητες, λάθη πρόσημου...)"
                                    value={mistakes}
                                    onChange={(e) => setMistakes(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Θέμα</Label>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs"
                                    onClick={() => setUseManualTopic(!useManualTopic)}
                                >
                                    {useManualTopic ? 'Επιλογή από Ύλη' : 'Χειροκίνητη Εισαγωγή'}
                                </Button>
                            </div>

                            {useManualTopic ? (
                                <Input
                                    value={manualTopic}
                                    onChange={(e) => setManualTopic(e.target.value)}
                                    placeholder="π.χ. Δευτεροβάθμιες Εξισώσεις"
                                />
                            ) : (
                                <TopicSelector
                                    value={topic}
                                    onChange={setTopic}
                                    onGradeLevelChange={(gl) => setGrade(gl)}
                                    onSelectedIdsChange={(ids) => {
                                        setSelectedNodeIds(ids);
                                        // Sync section counts immediately to avoid effects
                                        const resolved = resolveSyllabusNodes(ids);
                                        setSectionExerciseCounts(prev => syncSectionExerciseCounts(prev, resolved));
                                    }}
                                />
                            )}

                            {/* Prerequisite Checker */}
                            {!useManualTopic && (
                                <div className="flex justify-end pt-1">
                                    <PrerequisiteChecker selectedNodeIds={selectedNodeIds} />
                                </div>
                            )}

                            {(useManualTopic ? manualTopic : topic) && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={useManualTopic ? manualTopic : topic}>
                                    Επιλεγμένο: {useManualTopic ? manualTopic : topic}
                                </p>
                            )}
                        </div>

                        {/* Grade Level (auto-filled from syllabus, overridable) */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Βαθμίδα</Label>
                                {!useManualTopic && (
                                    <span className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
                                        auto-fill από ύλη
                                    </span>
                                )}
                            </div>
                            <Select value={grade} onChange={(e) => setGrade(e.target.value)}>
                                <option>Α' Γυμνασίου</option>
                                <option>Β' Γυμνασίου</option>
                                <option>Γ' Γυμνασίου</option>
                                <option>Α' Λυκείου</option>
                                <option>Β' Λυκείου</option>
                                <option>Γ' Λυκείου</option>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Χρόνος</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={15}
                                    max={120}
                                    step={5}
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="w-full"
                                />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">λεπτά</span>
                            </div>
                        </div>

                        {/* Difficulty Slider */}
                        <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                                <Label>Δυσκολία</Label>
                                <div className="flex bg-muted rounded-md p-0.5">
                                    <button
                                        onClick={() => setDifficultyMode('simple')}
                                        className={cn(
                                            "text-[10px] font-medium px-2 py-0.5 rounded-sm transition-all",
                                            difficultyMode === 'simple' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        Απλός
                                    </button>
                                    <button
                                        onClick={() => setDifficultyMode('advanced')}
                                        className={cn(
                                            "text-[10px] font-medium px-2 py-0.5 rounded-sm transition-all",
                                            difficultyMode === 'advanced' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        Σύνθετος
                                    </button>
                                </div>
                            </div>

                            {difficultyMode === 'simple' ? (
                                <DifficultySlider value={difficulty} onChange={setDifficulty} showDistribution={true} />
                            ) : (
                                <DifficultyDistributionSelector value={difficultyDist} onChange={setDifficultyDist} />
                            )}
                        </div>

                        {/* Exercise Types */}
                        <ExerciseTypeSelector selected={exerciseTypes} onChange={setExerciseTypes} />

                        <div className="space-y-2">
                            {/* Exercise Count Mode Toggle */}
                            <div className="flex bg-muted rounded-md p-1">
                                <button
                                    onClick={() => setExerciseCountMode('global')}
                                    className={cn(
                                        "text-xs font-medium px-3 py-1.5 rounded-sm transition-all flex-1 text-center",
                                        exerciseCountMode === 'global'
                                            ? "bg-background shadow-sm text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Συνολικό πλήθος
                                </button>
                                <button
                                    onClick={() => {
                                        setExerciseCountMode('per-section');
                                        // Ensure counts are synced when switching mode
                                        const resolved = resolveSyllabusNodes(selectedNodeIds);
                                        setSectionExerciseCounts(prev => syncSectionExerciseCounts(prev, resolved));
                                    }}
                                    className={cn(
                                        "text-xs font-medium px-3 py-1.5 rounded-sm transition-all flex-1 text-center",
                                        exerciseCountMode === 'per-section'
                                            ? "bg-background shadow-sm text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Ανά ενότητα
                                </button>
                            </div>

                            {/* Global count */}
                            {exerciseCountMode === 'global' && (
                                <div className="space-y-1">
                                    <Label>Ασκήσεις ({exerciseCount})</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={exerciseCount}
                                        onChange={(e) => setExerciseCount(Number(e.target.value))}
                                    />
                                </div>
                            )}

                            {/* Per-section count */}
                            {exerciseCountMode === 'per-section' && (
                                <SectionExerciseList
                                    selectedNodeIds={selectedNodeIds}
                                    items={sectionExerciseCounts}
                                    onChange={setSectionExerciseCounts}
                                />
                            )}
                        </div>

                        {/* Options */}
                        <div className="space-y-3 pt-3 border-t border-border">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Επιλογές</Label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={includeSolutions} onChange={(e) => { setIncludeSolutions(e.target.checked); setTimeout(refreshAgents, 0); }} className="accent-primary w-4 h-4" />
                                <CheckSquare size={14} className="text-emerald-500" />
                                <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors">Λύσεις</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={includeHints} onChange={(e) => { setIncludeHints(e.target.checked); setTimeout(refreshAgents, 0); }} className="accent-primary w-4 h-4" />
                                <Lightbulb size={14} className="text-amber-500" />
                                <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors">Υποδείξεις (Hints)</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={includePitfalls} onChange={(e) => { setIncludePitfalls(e.target.checked); setTimeout(refreshAgents, 0); }} className="accent-primary w-4 h-4" />
                                <AlertTriangle size={14} className="text-red-500" />
                                <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors">Κοινά Λάθη (Pitfalls)</span>
                            </label>
                        </div>
                    </div>

                    {/* Template Configurator */}
                    <div className="pt-3 border-t border-border">
                        <TemplateConfigurator config={templateConfig} onChange={pipeline.setTemplateConfig} />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">AI Pipeline</Label>
                        <div className="grid gap-2">
                            {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-border bg-background/50 backdrop-blur">
                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full gap-2 h-12 text-base shadow-lg shadow-primary/25"
                    >
                        {loading ? <RefreshCw className="animate-spin h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                        {loading ? "Δημιουργία..." : "Δημιουργία Φυλλαδίου"}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-secondary/30">
                <div className="h-14 border-b border-border bg-background flex items-center justify-between px-6">
                    <div className="flex bg-muted rounded-md p-1">
                        <button
                            onClick={() => pipeline.setActiveTab('preview')}
                            className={cn("text-sm font-medium px-3 py-1 rounded-sm transition-all", activeTab === 'preview' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                        >
                            Preview
                        </button>
                        <button
                            onClick={() => pipeline.setActiveTab('code')}
                            className={cn("text-sm font-medium px-3 py-1 rounded-sm transition-all", activeTab === 'code' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                        >
                            LaTeX
                        </button>
                        <button
                            onClick={() => pipeline.setActiveTab('time')}
                            className={cn("text-sm font-medium px-3 py-1 rounded-sm transition-all flex items-center gap-1.5", activeTab === 'time' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                        >
                            <Clock size={13} /> Χρόνος
                        </button>
                        <button
                            onClick={async () => {
                                pipeline.setActiveTab('flowchart');
                                if (!flowchartData && !flowchartLoading) {
                                    setFlowchartLoading(true);
                                    try {
                                        const currentTopic = useManualTopic ? manualTopic : topic;
                                        const data = await apiGenerateFlowchart({ topic: currentTopic, depth: 2 });
                                        setFlowchartData(data);
                                    } catch (err) {
                                        console.error('Flowchart generation failed:', err);
                                    } finally {
                                        setFlowchartLoading(false);
                                    }
                                }
                            }}
                            className={cn("text-sm font-medium px-3 py-1 rounded-sm transition-all flex items-center gap-1.5", activeTab === 'flowchart' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                        >
                            <GitBranch size={13} /> Flowchart
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2" disabled={!result} onClick={() => {
                            if (mockExam) {
                                const extraData = {
                                    type: 'worksheet' as const,
                                    tags: [topic.toLowerCase(), 'worksheet', ...getActiveAgents().filter(a => a.status === AgentStatus.COMPLETED).map(a => a.id)],
                                    agents: getActiveAgents().filter(a => a.status === AgentStatus.COMPLETED).map(a => a.id),
                                    difficulty: difficulty
                                };
                                if (pipeline.handleSave(mockExam, extraData)) {
                                    toast('Αποθηκεύτηκε στη βιβλιοθήκη!', 'success');
                                }
                            }
                        }}>
                            <Save className="h-4 w-4" /> Αποθήκευση
                        </Button>
                        <Button size="sm" className="gap-2" disabled={!result} onClick={handleDownloadSource}>
                            <Download className="h-4 w-4" /> Export LaTeX
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-8 flex justify-center">
                    {!result && !loading && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground max-w-md text-center">
                            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                                <BookOpen className="h-8 w-8 opacity-50" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Έτοιμο για Δημιουργία</h3>
                            <p className="text-sm mt-2">Ρυθμίστε τις παραμέτρους αριστερά και δημιουργήστε φυλλάδιο ασκήσεων.</p>
                        </div>
                    )}

                    {loading && !result && (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 rounded-full border-4 border-secondary" />
                                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                            </div>
                            <p className="text-muted-foreground font-medium animate-pulse">Δημιουργία Φυλλαδίου...</p>
                        </div>
                    )}

                    {mockExam && activeTab === 'preview' && (
                        <PdfPreview
                            exam={mockExam}
                            onExamChange={handleExamChange}
                            templateConfig={templateConfig}
                            onConfigChange={pipeline.setTemplateConfig}
                        />
                    )}

                    {result && activeTab === 'code' && (
                        <Card className="w-full max-w-4xl h-fit font-mono text-sm">
                            <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
                                <CardTitle className="text-base">LaTeX Source</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" className="gap-2" onClick={async () => {
                                        if (await pipeline.handleCopyLatex(mockExam)) {
                                            toast('Αντιγράφηκε!', 'success');
                                        }
                                    }}>
                                        <Copy size={16} />
                                        Αντιγραφή
                                    </Button>
                                    <Button variant="outline" className="gap-2" onClick={() => pipeline.setFixerOpen(true)}>
                                        <Wrench size={16} /> Fix
                                    </Button>
                                </div>
                                <Dialog open={fixerOpen} onOpenChange={pipeline.setFixerOpen}>
                                    <DialogContent className="max-w-4xl">
                                        <LatexFixer code={getLatexSource()} />
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent className="p-0 bg-[#282c34]">
                                <pre className="p-6 overflow-x-auto text-[#abb2bf] leading-relaxed">
                                    {getLatexSource()}
                                </pre>
                            </CardContent>
                        </Card>
                    )}

                    {mockExam && activeTab === 'time' && (
                        <Card className="w-full max-w-2xl h-fit">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Εκτίμηση Χρόνου</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TimeCalibration questions={mockExam.questions} totalMinutes={duration} />
                            </CardContent>
                        </Card>
                    )}

                    {mockExam && activeTab === 'flowchart' && (
                        <Card className="w-full max-w-4xl h-fit">
                            <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
                                <CardTitle className="flex items-center gap-2 text-base"><GitBranch className="w-5 h-5" /> Flowchart Επίλυσης</CardTitle>
                                <Button variant="outline" size="sm" onClick={async () => {
                                    setFlowchartData(null);
                                    setFlowchartLoading(true);
                                    try {
                                        const currentTopic = useManualTopic ? manualTopic : topic;
                                        const data = await apiGenerateFlowchart({ topic: currentTopic, depth: 2 });
                                        setFlowchartData(data);
                                    } catch (err) { console.error(err); } finally { setFlowchartLoading(false); }
                                }}>
                                    <RefreshCw className={cn("w-4 h-4 mr-2", flowchartLoading && "animate-spin")} /> Regenerate
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 bg-slate-50 dark:bg-slate-900/50">
                                {flowchartLoading && (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                                {!flowchartLoading && flowchartData?.mermaid && (
                                    <MermaidChart chart={flowchartData.mermaid} className="w-full" />
                                )}
                                {!flowchartLoading && flowchartData?.steps?.length > 0 && (
                                    <div className="mt-6 border-t border-border pt-4 space-y-2">
                                        <h4 className="text-sm font-semibold text-muted-foreground">Βήματα Επίλυσης</h4>
                                        {flowchartData.steps.map((step: any, i: number) => (
                                            <div key={i} className="flex gap-2 items-start text-sm">
                                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                                <div><span className="font-medium">{step.label}</span>{step.description && <span className="text-muted-foreground"> — {step.description}</span>}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {!flowchartLoading && !flowchartData && (
                                    <div className="text-center py-16 text-muted-foreground">
                                        <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Πατήστε το tab ξανά για να δημιουργηθεί flowchart.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorksheetGenerator;
