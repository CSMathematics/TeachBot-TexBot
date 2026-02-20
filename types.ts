// ─── Agent Domain & Status ───────────────────────────────────────────

export enum AgentDomain {
  EDUCATION = 'EDUCATION',
  DOCUMENTS = 'DOCUMENTS',
}

export enum AgentStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  WORKING = 'WORKING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

// ─── Agent Definitions ──────────────────────────────────────────────

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  icon: string;
  domain: AgentDomain;
}

export interface AgentQuickAction {
  label: string;
  labelEl: string;
  route?: string;       // Navigate to this page if available
  tryAgent?: boolean;    // Opens Try Agent modal instead
}

export interface AgentCapability {
  id: string;
  name: string;
  nameEl: string;
  role: string;
  description: string;
  descriptionEl: string;
  domain: AgentDomain;
  icon: string;
  endpoint: string;
  color: string;
  visionAgent?: string; // Maps to future_ideas.md Agent letter (A-J)
  quickAction?: AgentQuickAction;
  capabilities?: string[]; // Bullet list for detail drawer
}

// ─── Exam Types ─────────────────────────────────────────────────────

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Olympiad';
export type SubjectType = 'Algebra' | 'Geometry' | 'Calculus' | 'Physics' | 'Statistics';

export interface Question {
  syllabusId: string;
  parentId: string | null;
  nodeType: 'FIELD' | 'CHAPTER' | 'SECTION' | 'PARAGRAPH' | 'EXERCISE_TYPE' | 'CONTENT_ITEM';
  contentType?: 'THEORY' | 'METHODOLOGY';
  orderIndex: number;
  id: string;
  content: string;
  solution: string;
  difficulty: Difficulty;
  points: number;
  type: string;
  tags: string[];
}

export interface Exam {
  id: string;
  title: string;
  subtitle?: string;
  headerInfo?: string; // Custom header line (e.g. "Grade 10 • Mathematics • Date")
  studentName?: string; // Pre-filled student name
  studentClass?: string; // Pre-filled class
  examDate?: string; // Specific exam date
  subject: string;
  gradeLevel: string;
  durationMinutes: number;
  questions: Question[];
  createdAt: string;
  difficulty: number; // 0-100
  type?: 'exam' | 'worksheet';
  tags?: string[];
  agents?: string[];
}

// ─── Generation Parameters ──────────────────────────────────────────

export type ExerciseType = 'theory' | 'application' | 'proof' | 'true-false' | 'matching' | 'mixed';

export interface DifficultyDistribution {
  easy: number;   // Percentage
  medium: number;
  hard: number;
}

export interface QuestionTopic {
  id: string;
  topic: string;
  selectedNodeIds: string[];
  gradeLevel?: string;
}

export interface GenerationParams {
  topic: string;
  topicMode?: 'global' | 'per-question';
  questionTopics?: QuestionTopic[];
  gradeLevel: string;
  difficulty: number; // 1-5 slider
  questionCount: number;
  includeSolutions: boolean;
  includeVariants?: boolean;
  includeRubric?: boolean;
  includeHints?: boolean;
  includeMultiMethod?: boolean;
  style?: 'standard' | 'panhellenic';
  difficultyDistribution?: DifficultyDistribution; // Feature 2
  templateStyle?: 'classic' | 'modern' | 'scientific';
  mainColor?: string;
  solutionsMode?: 'none' | 'inline' | 'separate';
  exerciseTypes?: ExerciseType[];
}

export interface SectionExerciseCount {
  nodeId: string;
  nodeName: string;
  parentName?: string;
  count: number;
}

export interface ExerciseParams {
  topic: string;
  difficulty: string; // 'easy' | 'medium' | 'hard'
  difficultyDistribution?: DifficultyDistribution; // Feature 2
  count: number;
  mode?: 'practice' | 'remedial';
  mistakes?: string[];
  exerciseTypes?: ExerciseType[];
}

export interface VariantParams {
  exercise: Record<string, unknown>;
  count: number;
}

export interface SolutionParams {
  exercise: Record<string, unknown>;
}

export interface HintParams {
  exercise: Record<string, unknown>;
  levels: number; // 1-3 hint depth
}

export interface PitfallParams {
  topic: string;
  exercises?: Record<string, unknown>[];
}

export interface RubricParams {
  exam: Record<string, unknown>;
  totalPoints: number;
}

export interface DifficultyCalibrationParams {
  exercises: Record<string, unknown>[];
}

export interface PrerequisiteParams {
  topic: string;
  gradeLevel: string;
}

export interface FlowchartParams {
  topic: string;
  depth: number;
  method?: string;
}

export interface MultiMethodParams {
  exercise: Record<string, unknown>;
}

export interface PanhellenicParams {
  topic: string;
  year?: number;
}

// ─── Document Agent Parameters ──────────────────────────────────────

export interface DocumentParams {
  type: 'article' | 'report' | 'book' | 'cv' | 'letter';
  title: string;
  content?: string;
  language?: string;
}

export interface FigureParams {
  description: string;
  type?: 'plot' | 'geometry' | 'diagram';
}

export interface TableParams {
  data: string[][];
  headers: string[];
  style?: 'scientific' | 'simple' | 'booktabs';
}

export interface PresentationParams {
  title: string;
  slideCount: number;
  topic: string;
  theme?: string;
}

export interface BibliographyParams {
  entries: string[];
  style?: 'apa' | 'ieee' | 'chicago';
}

export interface FixParams {
  latexCode: string;
  errorMessage?: string;
}

// ─── API Response Types ─────────────────────────────────────────────

export interface AgentResponse<T = unknown> {
  success: boolean;
  data: T;
  agent: string;
  executionTime?: number;
  error?: string;
}

export interface ExerciseResult {
  latex: string;
  metadata: Record<string, unknown>;
  raw_equation?: string;
  solution?: string;
}

export interface LatexResult {
  latex: string;
  type?: string;
}

// ─── Syllabus Types ─────────────────────────────────────────────────

export interface SyllabusField {
  Id: string;
  Name: string;
  Description: string | null;
}

export interface SyllabusChapter {
  Id: string;
  Name: string;
  Field: string;
  prerequisites?: string;
}

export interface SyllabusSection {
  Id: string;
  Name: string;
  Chapter: string;
  prerequisites?: string;
}

export interface SyllabusExerciseType {
  Id: string;
  Name: string;
}

export interface SectionExerciseMapping {
  Section_Id: string;
  Exercise_Id: string;
}

// Tree nodes for rendering
export interface SyllabusSectionNode extends SyllabusSection {
  paragraphs: SyllabusParagraphNode[];
  // Legacy support for direct children if needed, or we move them to paragraphs
  exerciseTypes: SyllabusExerciseType[];
  exerciseCount: number;
}

export interface SyllabusParagraph {
  Id: string;
  Name: string;
  Section: string;
  contentType?: 'THEORY' | 'METHODOLOGY';
}

export interface SyllabusNode {
  id: string;
  name: string; // Helper for legacy compatibility if we map title -> name
  title: string;
}

export interface SyllabusParagraphNode extends SyllabusParagraph {
  exerciseTypes: SyllabusExerciseType[]; // Legacy? Or keep for specific methods if using EXERCISE_TYPE
  contentItems: SyllabusNode[]; // New generic content items
  exerciseCount: number;
}

export interface SyllabusChapterNode extends SyllabusChapter {
  sections: SyllabusSectionNode[];
  totalParagraphs: number;
}

export interface SyllabusFieldNode extends SyllabusField {
  chapters: SyllabusChapterNode[];
  totalChapters: number;
  totalSections: number;
  totalParagraphs: number;
}

// ─── Pipeline Types ─────────────────────────────────────────────────

export interface PipelineStep {
  agentId: string;
  status: AgentStatus;
  result?: unknown;
  error?: string;
}

export interface PipelineConfig {
  steps: string[]; // agent IDs in order
  params: Record<string, unknown>;
}