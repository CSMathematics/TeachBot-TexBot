import React, { useState } from 'react';
import { generateExam } from '../services/geminiService';
import { Exam, Agent, AgentStatus, AgentDomain } from '../types';
import AgentCard from '../components/AgentCard';
import TemplateConfigurator from '../components/TemplateConfigurator';
import { DEFAULT_TEMPLATE_CONFIG, TemplateConfig } from '../services/templateService';
import DifficultySlider from '../components/DifficultySlider';
import TimeCalibration from '../components/TimeCalibration';
import TopicSelector from '../components/TopicSelector';
import PrerequisiteChecker from '../components/PrerequisiteChecker';
import LatexFixer from '../components/LatexFixer';
import { Save, Download, ChevronLeft, RefreshCw, Wand2, Copy, Clock, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Input, Select, Label, Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, TabsContent, Dialog, DialogContent } from '../components/ui';
import PdfPreview from '../components/PdfPreview';
import { cn } from '../lib/utils';
import { generateLatexFromExam } from '../lib/latexGenerator';

const ExamGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [activeTab, setActiveTab] = useState('preview');

  // Params
  const [topic, setTopic] = useState('Ανάλυση: Παράγωγος - Κανόνες Παραγώγισης');
  const [manualTopic, setManualTopic] = useState('');
  const [useManualTopic, setUseManualTopic] = useState(false);

  const [grade, setGrade] = useState("Γ' Λυκείου");
  const [difficulty, setDifficulty] = useState(50);
  const [duration, setDuration] = useState(120);
  const [questionCount, setQuestionCount] = useState(3);
  const [includeVariants, setIncludeVariants] = useState(false);
  const [includeSolutions, setIncludeSolutions] = useState(true);
  const [includeRubric, setIncludeRubric] = useState(false);
  const [includeMultiMethod, setIncludeMultiMethod] = useState(false);
  const [style, setStyle] = useState<'standard' | 'panhellenic'>('standard');
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>(DEFAULT_TEMPLATE_CONFIG);
  const [fixerOpen, setFixerOpen] = useState(false);


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

  const [agents, setAgents] = useState<Agent[]>(getActiveAgents());

  // Refresh agents when toggles change
  const refreshAgents = () => {
    setAgents(getActiveAgents());
  };

  const simulateAgentWorkflow = async () => {
    const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
    const currentAgents = getActiveAgents();
    setAgents(currentAgents);
    setLoading(true);
    setExam(null);

    const currentTopic = useManualTopic ? manualTopic : topic;

    try {
      for (const agent of currentAgents) {
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: AgentStatus.WORKING } : a));

        if (agent.id === 'exercise-generator') {
          // This is the main generation call (dual-mode)
          console.log('[ExamGenerator] Calling generateExam with params:', {
            topic: currentTopic,
            gradeLevel: grade,
            difficulty: difficulty,
            questionCount: questionCount
          });

          const generatedExam = await generateExam({
            topic: currentTopic,
            gradeLevel: grade,
            difficulty: difficulty, // Ensure number 0-100 is passed
            questionCount: questionCount,
            includeSolutions,
            includeVariants,
            includeRubric,
            includeMultiMethod,
            style,
            templateStyle: templateConfig.style as 'classic' | 'modern' | 'scientific',
            mainColor: templateConfig.mainColor,
          });

          console.log('[ExamGenerator] Received exam from service:', generatedExam);

          if (!generatedExam || !generatedExam.questions || generatedExam.questions.length === 0) {
            console.error('[ExamGenerator] Exam is empty or invalid!', generatedExam);
            alert('Warning: API returned an empty exam.');
          }

          setExam(generatedExam);
        } else {
          await wait(500 + Math.random() * 400);
        }

        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: AgentStatus.COMPLETED } : a));
      }
    } catch (error) {
      console.error(error);
      setAgents(prev => prev.map(a => ({ ...a, status: AgentStatus.ERROR })));
      alert(`Failed to generate exam: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const getLatexSource = () => {
    if (!exam) return '';
    return generateLatexFromExam(exam, templateConfig);
  };

  const handleDownloadSource = () => {
    if (!exam) return;
    const source = getLatexSource();
    const blob = new Blob([source], { type: 'application/x-latex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-${new Date().toISOString().slice(0, 10)}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            {/* Topic Selection */}
            <div className="space-y-2">
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
                  value={topic} // Although recursive selection doesn't use simple string value back easily
                  onChange={setTopic}
                />
              )}
              {/* Prerequisite Checker Button */}
              <div className="flex justify-end pt-1">
                <PrerequisiteChecker topic={useManualTopic ? manualTopic : topic} grade={grade} />
              </div>

              {(useManualTopic ? manualTopic : topic) && (
                <p className="text-xs text-muted-foreground mt-1">
                  Επιλεγμένο: {useManualTopic ? manualTopic : topic}
                </p>
              )}
            </div>

            {/* Grade & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Τάξη</Label>
                <Select value={grade} onChange={(e) => setGrade(e.target.value)}>
                  <option>Α' Λυκείου</option>
                  <option>Β' Λυκείου</option>
                  <option>Γ' Λυκείου</option>
                </Select>
              </div>
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
            </div>

            {/* Difficulty */}
            <div className="space-y-2 pt-1">
              <Label>Βαθμός Δυσκολίας</Label>
              <DifficultySlider value={difficulty} onChange={setDifficulty} />
            </div>

            {/* Question Count */}
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
            <TemplateConfigurator config={templateConfig} onChange={setTemplateConfig} />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">AI Agents Working</Label>
            <div className="grid gap-2">
              {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-background/50 backdrop-blur">
          <Button
            onClick={simulateAgentWorkflow}
            disabled={loading}
            className="w-full gap-2 h-12 text-base shadow-lg shadow-primary/25"
          >
            {loading ? <RefreshCw className="animate-spin h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
            {loading ? "Generative AI Working..." : "Δημιουργία Διαγωνίσματος"}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-secondary/30">
        {/* Header */}
        <div className="h-14 border-b border-border bg-background flex items-center justify-between px-6">
          <div className="flex bg-muted rounded-md p-1">
            <button
              onClick={() => setActiveTab('preview')}
              className={cn("text-sm font-medium px-3 py-1 rounded-sm transition-all", activeTab === 'preview' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={cn("text-sm font-medium px-3 py-1 rounded-sm transition-all", activeTab === 'code' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              LaTeX
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={cn("text-sm font-medium px-3 py-1 rounded-sm transition-all flex items-center gap-1.5", activeTab === 'time' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              <Clock size={13} /> Χρόνος
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" disabled={!exam} onClick={() => {
              if (exam) {
                import('../services/storageService').then(s => s.saveExam(exam));
                alert('Το διαγώνισμα αποθηκεύτηκε στη βιβλιοθήκη!');
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
                <Button variant="outline" className="gap-2" onClick={() => {
                  navigator.clipboard.writeText(getLatexSource());
                  alert('Copied to clipboard!');
                }}>
                  <Copy size={16} />
                  Αντιγραφή
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => setFixerOpen(true)}>
                  <Wrench size={16} /> Fix
                </Button>
                <Dialog open={fixerOpen} onOpenChange={setFixerOpen}>
                  <DialogContent className="max-w-4xl">
                    <LatexFixer initialCode={getLatexSource()} />
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
              onConfigChange={setTemplateConfig}
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
        </div>
      </div>
    </div >
  );
};

export default ExamGenerator;