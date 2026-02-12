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
}

// ─── Exam Types ─────────────────────────────────────────────────────

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Olympiad';
export type SubjectType = 'Algebra' | 'Geometry' | 'Calculus' | 'Physics' | 'Statistics';

export interface Question {
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

export interface GenerationParams {
  topic: string;
  gradeLevel: string;
  difficulty: number; // 1-5 slider
  questionCount: number;
  includeSolutions: boolean;
  includeVariants?: boolean;
  includeRubric?: boolean;
  includeHints?: boolean;
  includeMultiMethod?: boolean;
  style?: 'standard' | 'panhellenic';
  templateStyle?: 'classic' | 'modern' | 'scientific';
  mainColor?: string;
}

export interface ExerciseParams {
  topic: string;
  difficulty: string; // 'easy' | 'medium' | 'hard'
  count: number;
  mode?: 'practice' | 'remedial';
  mistakes?: string[];
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

export interface MindmapParams {
  topic: string;
  depth: number;
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
}

export interface SyllabusSection {
  Id: string;
  Name: string;
  Chapter: string;
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
  exerciseTypes: SyllabusExerciseType[];
  exerciseCount: number;
}

export interface SyllabusChapterNode extends SyllabusChapter {
  sections: SyllabusSectionNode[];
  totalExercises: number;
}

export interface SyllabusFieldNode extends SyllabusField {
  chapters: SyllabusChapterNode[];
  totalChapters: number;
  totalSections: number;
  totalExercises: number;
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