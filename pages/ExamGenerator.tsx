import React, { useState, useMemo } from 'react';
import { generateExam } from '../services/geminiService';
import { Exam, Agent, AgentStatus, AgentDomain, QuestionTopic, ExerciseType, DifficultyDistribution } from '../types';
import AgentCard from '../components/AgentCard';
import TemplateConfigurator from '../components/TemplateConfigurator';
import DifficultySlider from '../components/DifficultySlider';
import TimeCalibration from '../components/TimeCalibration';
import TopicSelector from '../components/TopicSelector';
import QuestionTopicList from '../components/QuestionTopicList';
import PrerequisiteChecker from '../components/PrerequisiteChecker';
import LatexFixer from '../components/LatexFixer';
import { Save, Download, ChevronLeft, RefreshCw, Wand2, Copy, Clock, Wrench, GitBranch, BookOpen } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Input, Select, Label, Card, CardHeader, CardTitle, CardContent, Dialog, DialogContent } from '../components/ui';
import PdfPreview from '../components/PdfPreview';
import ExerciseTypeSelector from '../components/ExerciseTypeSelector';
import MermaidChart from '../components/MermaidChart';
import { apiGenerateFlowchart } from '../services/agentApiService';
import DifficultyDistributionSelector from '../components/DifficultyDistributionSelector';
import { cn } from '../lib/utils';
import { useGeneratorPipeline } from '../hooks/useGeneratorPipeline';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../components/Toast';
import { ExerciseBankModal } from '../components/ExerciseBankModal';

const ExamGenerator: React.FC = () => {
  const { settings } = useSettings();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialStyle = searchParams.get('style') || 'scientific';

  const [exam, setExam] = useState<Exam | null>(null);

  // Params — use settings defaults
  const [topic, setTopic] = useState('Ανάλυση: Παράγωγος - Κανόνες Παραγώγισης');
  const [manualTopic, setManualTopic] = useState('');
  const [useManualTopic, setUseManualTopic] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  // Per-question topic selection
  const [topicMode, setTopicMode] = useState<'global' | 'per-question'>('global');
  const [bankModalOpen, setBankModalOpen] = useState(false);

  const handleAddFromBank = (ex: any) => {
    const newQuestion = {
      id: crypto.randomUUID(),
      syllabusId: 'mock',
      parentId: null,
      nodeType: 'PARAGRAPH',
      orderIndex: exam ? exam.questions.length : 0,
      type: 'exercise',
      content: ex.content,
      difficulty: ex.difficulty,
      points: 10,
      solution: ex.solution || '',
      tags: ex.tags || []
    };
    if (exam) {
      setExam({ ...exam, questions: [...exam.questions, newQuestion] });
    } else {
      setExam({
        id: crypto.randomUUID(),
        title: `Διαγώνισμα: Επιλεγμένες Ασκήσεις`,
        createdAt: new Date().toISOString(),
        subject: 'Μαθηματικά',
        gradeLevel: grade,
        difficulty: 3,
        durationMinutes: duration,
        questions: [newQuestion]
      });
      pipeline.setActiveTab('preview');
    }
  };
  const [questionTopics, setQuestionTopics] = useState<QuestionTopic[]>([
    { id: crypto.randomUUID(), topic: '', selectedNodeIds: [] },
  ]);

  // Aggregate selectedNodeIds for PrerequisiteChecker in per-question mode
  const aggregatedNodeIds = useMemo(() => {
    if (topicMode === 'global') return selectedNodeIds;
    return questionTopics.flatMap(q => q.selectedNodeIds);
  }, [topicMode, selectedNodeIds, questionTopics]);

  const [grade, setGrade] = useState(settings.defaultGradeLevel);
  const [difficulty, setDifficulty] = useState(50);
  const [difficultyMode, setDifficultyMode] = useState<'simple' | 'advanced'>('simple');
  const [difficultyDist, setDifficultyDist] = useState<DifficultyDistribution>({ easy: 30, medium: 50, hard: 20 });

  const [duration, setDuration] = useState(120);
  const [questionCount, setQuestionCount] = useState(3);
  const [includeVariants, setIncludeVariants] = useState(false);
  const [includeSolutions, setIncludeSolutions] = useState(true);
  const [includeRubric, setIncludeRubric] = useState(false);
  const [includeMultiMethod, setIncludeMultiMethod] = useState(false);
  const [style, setStyle] = useState<'standard' | 'panhellenic'>('standard');
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([]);
  const [flowchartData, setFlowchartData] = useState<any>(null);
  const [flowchartLoading, setFlowchartLoading] = useState(false);


  // Dynamic agent pipeline based on toggles
  const getActiveAgents = (): Agent[] => {
    const base: Agent[] = [
      { id: 'prerequisite-checker', name: 'Prerequisite Checker', role: 'Checking Prerequisites', description: 'Validating prerequisites', status: AgentStatus.IDLE, icon: 'ListChecks', domain: AgentDomain.EDUCATION },
      { id: 'exercise-generator', name: 'Exercise Generator', role: 'Creating Problems', description: 'Generating exercises', status: AgentStatus.IDLE, icon: 'Bot', domain: AgentDomain.EDUCATION },
    ];

    if (includeSolutions) {
      base.push({ id: 'solution-writer', name: 'Solution Writer', role: 'Solving & Validating', description: 'Step-by-step solutions', status: AgentStatus.IDLE, icon: 'CheckCircle', domain: AgentDomain.EDUCATION });
    }

    base.push({ id: 'difficulty-calibrator', name: 'Difficulty Calibrator', role: 'Calibrating Difficulty', description: 'Checking balance', status: AgentStatus.IDLE, icon: 'Gauge', domain: AgentDomain.EDUCATION });

    if (includeVariants) {
      base.push({ id: 'isomorphic-generator', name: 'Variant Generator', role: 'Creating Variants', description: 'Group A/B', status: AgentStatus.IDLE, icon: 'Copy', domain: AgentDomain.EDUCATION });
    }

    if (includeRubric) {
      base.push({ id: 'rubric-designer', name: 'Rubric Designer', role: 'Creating Rubric', description: 'Grading scheme', status: AgentStatus.IDLE, icon: 'ClipboardCheck', domain: AgentDomain.EDUCATION });
    }

    if (includeMultiMethod) {
      base.push({ id: 'multi-method-solver', name: 'Multi-Method Solver', role: 'Checking Methods', description: 'Alternative solutions', status: AgentStatus.IDLE, icon: 'GitBranch', domain: AgentDomain.EDUCATION });
    }

    if (style === 'panhellenic') {
      base.push({ id: 'panhellenic-formatter', name: 'Panhellenic Formatter', role: 'Formatting', description: 'Exam style', status: AgentStatus.IDLE, icon: 'GraduationCap', domain: AgentDomain.EDUCATION });
    }

    return base;
  };

  // Shared pipeline hook
  const pipeline = useGeneratorPipeline(getActiveAgents, { style: initialStyle });
  const { loading, activeTab, agents, templateConfig, fixerOpen } = pipeline;

  const refreshAgents = () => {
    pipeline.setAgents(getActiveAgents());
  };

  const simulateAgentWorkflow = async () => {
    const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
    const currentAgents = pipeline.startAgentPipeline(getActiveAgents);
    setExam(null);

    const currentTopic = useManualTopic ? manualTopic : topic;

    const baseParams = {
      gradeLevel: grade,
      difficulty: difficulty,
      difficultyDistribution: difficultyMode === 'advanced' ? difficultyDist : undefined,
      includeSolutions,
      includeVariants,
      includeRubric,
      includeMultiMethod,
      style,
      templateStyle: templateConfig.style as 'classic' | 'modern' | 'scientific',
      mainColor: templateConfig.mainColor,
      exerciseTypes: exerciseTypes.length > 0 ? exerciseTypes : undefined,
    };

    try {
      for (const agent of currentAgents) {
        pipeline.markAgent(agent.id, AgentStatus.WORKING);

        if (agent.id === 'exercise-generator') {
          if (topicMode === 'per-question' && questionTopics.length > 0) {
            // Validate: skip questions without a topic
            const validTopics = questionTopics.filter(qt => qt.topic && qt.topic.trim() !== '');
            if (validTopics.length === 0) {
              toast('Παρακαλώ επιλέξτε ύλη για τουλάχιστον ένα θέμα.', 'warning');
              throw new Error('No topics selected');
            }
            if (validTopics.length < questionTopics.length) {
              console.warn(`[ExamGenerator] ${questionTopics.length - validTopics.length} question(s) skipped: no topic selected`);
            }

            // Per-question mode: generate one question per topic, then merge
            console.log('[ExamGenerator] Per-question mode, generating', validTopics.length, 'questions');
            const allQuestions: Exam['questions'] = [];
            let firstResult: Exam | null = null;

            for (const qt of validTopics) {
              // Use per-question gradeLevel if available, fallback to global
              const questionGrade = qt.gradeLevel || grade;
              console.log(`[ExamGenerator] Generating question for topic: ${qt.topic} (grade: ${questionGrade})`);

              const result = await generateExam({
                ...baseParams,
                gradeLevel: questionGrade,
                topic: qt.topic,
                questionCount: 1,
              });

              if (!firstResult) firstResult = result;
              if (result?.questions?.length > 0) {
                allQuestions.push(...result.questions);
              }
            }

            if (allQuestions.length === 0) {
              console.error('[ExamGenerator] Per-question mode: no questions generated');
              toast('Δεν δημιουργήθηκαν θέματα. Δοκιμάστε ξανά.', 'error');
            }

            const mergedExam: Exam = {
              ...(firstResult || {} as Exam),
              id: crypto.randomUUID(),
              title: `Διαγώνισμα: Πολλαπλές Ενότητες`,
              questions: allQuestions,
              createdAt: new Date().toISOString(),
            };

            setExam(mergedExam);
          } else {
            // Global mode: single call (existing behavior)
            console.log('[ExamGenerator] Global mode, calling generateExam with params:', {
              topic: currentTopic,
              gradeLevel: grade,
              difficulty: difficulty,
              questionCount: questionCount
            });

            const generatedExam = await generateExam({
              ...baseParams,
              topic: currentTopic,
              questionCount: questionCount,
            });

            console.log('[ExamGenerator] Received exam from service:', generatedExam);

            if (!generatedExam || !generatedExam.questions || generatedExam.questions.length === 0) {
              console.error('[ExamGenerator] Exam is empty or invalid!', generatedExam);
              toast('Το API επέστρεψε κενό διαγώνισμα.', 'warning');
            }

            setExam(generatedExam);
          }
        } else {
          await wait(500 + Math.random() * 400);
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

  const getLatexSource = () => pipeline.getLatexSource(exam);

  const handleDownloadSource = () => {
    pipeline.handleDownloadSource(exam, 'exam');
    toast('Το αρχείο .tex κατέβηκε!', 'success');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar: Configuration */}
      <div className="w-[400px] border-r border-border bg-background flex flex-col z-10 shadow-xl">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="font-semibold text-lg">Δημιουργία Διαγωνίσματος</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            {/* Topic Mode Toggle */}
            <div className="space-y-2">
              <Label>Λειτουργία Θεμάτων</Label>
              <div className="flex bg-muted rounded-md p-1">
                <button
                  onClick={() => setTopicMode('global')}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-sm transition-all flex-1 text-center",
                    topicMode === 'global'
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Για όλο το διαγώνισμα
                </button>
                <button
                  onClick={() => {
                    setTopicMode('per-question');
                    // Initialize with current questionCount if empty
                    if (questionTopics.length === 0 || (questionTopics.length === 1 && !questionTopics[0].topic)) {
                      const items: QuestionTopic[] = Array.from({ length: questionCount }, () => ({
                        id: crypto.randomUUID(),
                        topic: '',
                        selectedNodeIds: [],
                      }));
                      setQuestionTopics(items);
                    }
                  }}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-sm transition-all flex-1 text-center",
                    topicMode === 'per-question'
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Ανά θέμα
                </button>
              </div>
            </div>

            {/* Topic Selection */}
            <div className="space-y-2">
              {topicMode === 'global' && (
                <>
                  <div className="flex items-center justify-between">
                    <Label>Θέμα Εξέτασης</Label>
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
                      placeholder="π.χ. Διαγώνισμα Τριμήνου..."
                    />
                  ) : (
                    <TopicSelector
                      value={topic}
                      onChange={setTopic}
                      onGradeLevelChange={(gl) => setGrade(gl)}
                      onSelectedIdsChange={setSelectedNodeIds}
                    />
                  )}

                  {(useManualTopic ? manualTopic : topic) && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={useManualTopic ? manualTopic : topic}>
                      Επιλεγμένο: {useManualTopic ? manualTopic : topic}
                    </p>
                  )}
                </>
              )}

              {topicMode === 'per-question' && (
                <QuestionTopicList
                  items={questionTopics}
                  onChange={setQuestionTopics}
                  onGradeLevelChange={(gl) => setGrade(gl)}
                />
              )}

              {/* Prerequisite Checker Button */}
              <div className="flex justify-end pt-1">
                <PrerequisiteChecker selectedNodeIds={aggregatedNodeIds} />
              </div>
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

            {/* Duration */}
            <div className="space-y-2">
              <Label>Διάρκεια</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={30}
                  max={180}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">λεπτά</span>
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <Label>Βαθμός Δυσκολίας</Label>
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
                <DifficultySlider value={difficulty} onChange={setDifficulty} />
              ) : (
                <DifficultyDistributionSelector value={difficultyDist} onChange={setDifficultyDist} />
              )}
            </div>

            {/* Exercise Types */}
            <ExerciseTypeSelector selected={exerciseTypes} onChange={setExerciseTypes} />

            {/* Question Count — only visible in global mode */}
            {topicMode === 'global' && (
              <div className="space-y-2">
                <Label>Πλήθος Θεμάτων ({questionCount})</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="1"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="flex-1 accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-medium w-4 text-center">{questionCount}</span>
                </div>
              </div>
            )}
            {topicMode === 'per-question' && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Πλήθος Θεμάτων:</span>
                <span className="text-foreground font-semibold">{questionTopics.length}</span>
                <span>(διαχείριση από τη λίστα παραπάνω)</span>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3 pt-3 border-t border-border">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Επιλογές</Label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeVariants}
                  onChange={(e) => { setIncludeVariants(e.target.checked); setTimeout(refreshAgents, 0); }}
                  className="accent-primary w-4 h-4 rounded border-gray-300"
                />
                <Copy size={14} className="text-blue-500" />
                <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors">Παραλλαγές (Ομάδες Α/Β)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeRubric}
                  onChange={(e) => { setIncludeRubric(e.target.checked); setTimeout(refreshAgents, 0); }}
                  className="accent-primary w-4 h-4 rounded border-gray-300"
                />
                <Clock size={14} className="text-emerald-500" />
                <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors">Οδηγός Βαθμολόγησης</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includeMultiMethod}
                  onChange={(e) => { setIncludeMultiMethod(e.target.checked); setTimeout(refreshAgents, 0); }}
                  className="accent-primary w-4 h-4 rounded border-gray-300"
                />
                <div className="w-3.5 h-3.5 flex items-center justify-center font-bold text-xs text-purple-500">M</div>
                <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors">Πολλαπλές Μέθοδοι</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={style === 'panhellenic'}
                  onChange={(e) => { setStyle(e.target.checked ? 'panhellenic' : 'standard'); setTimeout(refreshAgents, 0); }}
                  className="accent-primary w-4 h-4 rounded border-gray-300"
                />
                <div className="w-3.5 h-3.5 flex items-center justify-center font-bold text-xs text-blue-500">P</div>
                <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors">Πανελλήνιο Πρότυπο</span>
              </label>
            </div>

            {/* Template Configurator */}
            <TemplateConfigurator config={templateConfig} onChange={pipeline.setTemplateConfig} />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">AI Agents Working</Label>
            <div className="grid gap-2">
              {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-background/50 backdrop-blur space-y-3">
          <Button
            onClick={simulateAgentWorkflow}
            disabled={loading}
            className="w-full gap-2 h-12 text-base shadow-lg shadow-primary/25"
          >
            {loading ? <RefreshCw className="animate-spin h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
            {loading ? "Generative AI Working..." : "Δημιουργία Διαγωνίσματος"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setBankModalOpen(true)}
            className="w-full gap-2 h-10 text-sm border-dashed border-2 hover:border-solid transition-all"
          >
            <BookOpen className="h-4 w-4 text-blue-500" />
            Προσθήκη από Τράπεζα
          </Button>
        </div>
      </div>
      <ExerciseBankModal
        open={bankModalOpen}
        onOpenChange={setBankModalOpen}
        onSelect={handleAddFromBank}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-secondary/30">
        {/* Header */}
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
            <Button variant="outline" size="sm" className="gap-2" disabled={!exam} onClick={() => {
              if (pipeline.handleSave(exam)) {
                toast('Αποθηκεύτηκε στη βιβλιοθήκη!', 'success');
              }
            }}>
              <Save className="h-4 w-4" /> Save
            </Button>
            <Button size="sm" className="gap-2" disabled={!exam} onClick={handleDownloadSource}>
              <Download className="h-4 w-4" /> Export LaTeX
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 flex justify-center">
          {!exam && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground max-w-md text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Έτοιμο για Δημιουργία</h3>
              <p className="text-sm mt-2">Επιλέξτε παραμέτρους από την sidebar και πατήστε δημιουργία για να ενεργοποιήσετε τους EduTeX Agents.</p>
            </div>
          )}

          {loading && !exam && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-secondary" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <p className="text-muted-foreground font-medium animate-pulse">Generative AI Reasoning...</p>
            </div>
          )}

          {exam && activeTab === 'code' && (
            <Card className="w-full max-w-4xl h-fit font-mono text-sm">
              <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
                <CardTitle className="text-base">LaTeX Source</CardTitle>
                <Button variant="outline" className="gap-2" onClick={async () => {
                  if (await pipeline.handleCopyLatex(exam)) {
                    toast('Αντιγράφηκε!', 'success');
                  }
                }}>
                  <Copy size={16} />
                  Αντιγραφή
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => pipeline.setFixerOpen(true)}>
                  <Wrench size={16} /> Fix
                </Button>
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

          {exam && activeTab === 'preview' && (
            <PdfPreview
              exam={exam}
              onExamChange={setExam}
              templateConfig={templateConfig}
              onConfigChange={pipeline.setTemplateConfig}
            />
          )}

          {exam && activeTab === 'time' && (
            <Card className="w-full max-w-2xl h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Ανάλυση Χρόνου</CardTitle>
              </CardHeader>
              <CardContent>
                <TimeCalibration questions={exam.questions} totalMinutes={duration} />
              </CardContent>
            </Card>
          )}

          {exam && activeTab === 'flowchart' && (
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
    </div >
  );
};

export default ExamGenerator;