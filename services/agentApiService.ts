import {
    Exam, GenerationParams, ExerciseParams, SolutionParams,
    VariantParams, HintParams, PitfallParams, RubricParams,
    DifficultyCalibrationParams, MindmapParams, PrerequisiteParams,
    MultiMethodParams, PanhellenicParams, DocumentParams,
    FigureParams, TableParams, PresentationParams, FixParams,
    ExerciseResult, LatexResult, AgentResponse
} from '../types';

// ─── Config ─────────────────────────────────────────────────────────

function getApiBase(): string {
    try {
        const saved = localStorage.getItem('edutex-settings');
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.backendUrl) return settings.backendUrl;
        }
    } catch { /* ignore */ }
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
}

// ─── Core Fetch Wrapper ─────────────────────────────────────────────

async function apiCall<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${getApiBase()}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || `API error: ${response.status}`);
    }

    return response.json();
}

async function apiGet<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${getApiBase()}${endpoint}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
}

// ─── Health & Discovery ─────────────────────────────────────────────

export async function checkBackendHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${getApiBase()}/`, { signal: AbortSignal.timeout(3000) });
        const data = await res.json();
        return data.status === 'online';
    } catch {
        return false;
    }
}

export interface AgentInfo {
    id: string;
    name: string;
    nameEl: string;
    domain: string;
    description: string;
    endpoint: string;
    status: string;
}

export async function fetchAgentCatalog(): Promise<AgentInfo[]> {
    return apiGet<AgentInfo[]>('/api/agents');
}

// ─── Education Agent Calls ──────────────────────────────────────────

export async function apiGenerateExam(params: GenerationParams): Promise<Exam> {
    return apiCall<Exam>('/api/generate-exam', params);
}

export async function apiGenerateExercises(params: ExerciseParams): Promise<{ exercises: ExerciseResult[]; count: number }> {
    return apiCall('/api/generate-exercises', params);
}

export async function apiGenerateSolutions(params: SolutionParams): Promise<{ solution_latex: string }> {
    return apiCall('/api/generate-solutions', params);
}

export async function apiGenerateVariants(params: VariantParams): Promise<{ variations: ExerciseResult[]; count: number }> {
    return apiCall('/api/generate-variants', params);
}

export async function apiCalibrateDifficulty(params: DifficultyCalibrationParams): Promise<{ total: number; distribution: Record<string, number>; analysis: string }> {
    return apiCall('/api/calibrate-difficulty', { exercises: params.exercises });
}

export async function apiGenerateHints(params: HintParams): Promise<{ hints: string[]; count: number }> {
    return apiCall('/api/generate-hints', params);
}

export async function apiDetectPitfalls(params: PitfallParams): Promise<{ pitfalls: Record<string, unknown>[]; count: number }> {
    return apiCall('/api/detect-pitfalls', { exercise: { metadata: { topic: params.topic } } });
}

export async function apiGenerateRubric(params: RubricParams): Promise<{ rubric: Record<string, unknown>[]; total_points: number }> {
    return apiCall('/api/generate-rubric', { exercise: params.exam });
}

export async function apiGenerateMindmap(params: MindmapParams): Promise<Record<string, unknown>> {
    return apiCall('/api/generate-mindmap', params);
}

export async function apiCheckPrerequisites(params: PrerequisiteParams): Promise<Record<string, unknown>> {
    return apiCall('/api/check-prerequisites', params);
}

export async function apiMultiMethodSolve(params: MultiMethodParams): Promise<Record<string, unknown>> {
    return apiCall('/api/multi-method-solve', params);
}

export async function apiFormatPanhellenic(params: PanhellenicParams): Promise<Record<string, unknown>> {
    return apiCall('/api/format-panhellenic', params);
}

// ─── Document Agent Calls ───────────────────────────────────────────

export async function apiBuildDocument(params: DocumentParams): Promise<LatexResult> {
    return apiCall('/api/build-document', params);
}

export async function apiGenerateFigure(params: FigureParams): Promise<LatexResult> {
    return apiCall('/api/generate-figure', params);
}

export async function apiFormatTable(params: TableParams): Promise<LatexResult> {
    return apiCall('/api/format-table', params);
}

export async function apiCreatePresentation(params: PresentationParams): Promise<LatexResult> {
    return apiCall('/api/create-presentation', params);
}

export async function apiFixLatex(params: FixParams): Promise<LatexResult> {
    return apiCall('/api/fix-latex', params);
}

// ─── Orchestrator ───────────────────────────────────────────────────

export async function apiOrchestrate(prompt: string): Promise<{ detected_domain: string; available_agents: string[] }> {
    return apiCall('/api/orchestrate', { prompt });
}
