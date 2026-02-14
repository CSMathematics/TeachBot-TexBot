import { GoogleGenAI, Type } from "@google/genai";
import { Exam, GenerationParams } from "../types";
import { apiGenerateExam, checkBackendHealth } from "./agentApiService";

const getApiKey = (): string | undefined => {
  try {
    const saved = localStorage.getItem('edutex-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      if (settings.geminiApiKey) return settings.geminiApiKey;
    }
  } catch { /* ignore */ }
  return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
};

// Initialize Gemini Client
const getAi = () => {
  const key = getApiKey();
  if (!key) throw new Error("API Key is missing. Please configure it in Settings or .env");
  return new GoogleGenAI({ apiKey: key });
};

export const listAvailableModels = async (): Promise<string[]> => {
  try {
    const ai = getAi();
    // Check SDK documentation or try typical path. Some versions use ai.getGenerativeModel directly.
    // But for listing, it might be on the client or specific manager.
    // Assuming fetch for now if SDK method is obscure, but let's try assuming standard SDK method exists if typed.
    // Actually, @google/genai might not expose listModels easily in all versions.
    // Let's try to use the API directly via fetch if SDK fails or just use a known list for now as fallback?
    // User asked to FETCH from internet.
    // The error message "Call ListModels" implies it's possible.
    // Let's try:
    // const response = await ai.models.list();
    // But `ai` is GoogleGenAI instance.
    // It likely has `getGenerativeModel`.
    // Let's look for `listModels` on `ai` or `ai.getGenerativeModel`.
    // Better: use raw fetch to https://generativelanguage.googleapis.com/v1beta/models?key=...
    const key = getApiKey();
    if (!key) return [];
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return data.models
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name.replace('models/', ''));
  } catch (e) {
    console.error("Failed to list models", e);
    return ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro']; // Fallback
  }
};

/**
 * Dual-mode exam generation:
 * 1. Try FastAPI backend (Python agents)
 * 2. Fallback to Gemini API (direct LLM)
 */
export const generateExam = async (params: GenerationParams): Promise<Exam> => {
  // Try API backend first
  try {
    const backendAvailable = await checkBackendHealth();
    if (backendAvailable) {
      console.log("[EduTeX] Using Python Agent backend");
      return await apiGenerateExam(params);
    }
  } catch (e) {
    console.warn("[EduTeX] Backend unavailable, falling back to Gemini:", e);
  }

  // Fallback: direct Gemini API
  console.log("[EduTeX] Using Gemini API fallback");
  return generateExamViaGemini(params);
};

/** Direct Gemini API call (fallback mode) */
async function generateExamViaGemini(params: GenerationParams): Promise<Exam> {
  const ai = getAi(); // Initialize here

  let modelId = 'gemini-2.0-flash';
  try {
    const saved = localStorage.getItem('edutex-settings');
    if (saved) {
      const s = JSON.parse(saved);
      if (s.geminiModel) modelId = s.geminiModel;
    }
  } catch { }

  const prompt = `
    Act as EduTeX, an advanced AI system for generating Math and Physics exams in LaTeX.
    
    You are composed of 4 agents:
    1. Curriculum Architect: Structures the exam based on grade ${params.gradeLevel} and topic "${params.topic}".
    2. Math Generator: Creates unique problems.
    3. Solver & Validator: Solves them to ensure correctness.
    4. LaTeX Typesetter: Formats everything in clean LaTeX.

    Generate a JSON response representing a full exam with ${params.questionCount} questions.
    Difficulty Level: ${params.difficulty} (on a scale of 1-5, where 5 is Olympiad level).
    
    The response MUST strictly follow this schema:
    {
      "title": "Exam Title",
      "subject": "Math or Physics",
      "gradeLevel": "${params.gradeLevel}",
      "durationMinutes": 60,
      "difficulty": 75,
      "questions": [
        {
          "id": "q1",
          "content": "Question text mixed with LaTeX. Wrap inline math in $...$ and display equations in $$...$$.",
          "solution": "Solution with mixed text and LaTeX. Wrap inline math in $...$ and display equations in $$...$$.",
          "difficulty": "Medium",
          "points": 10,
          "type": "Calculus",
          "tags": ["Derivatives", "Chain Rule"]
        }
      ]
    }

    Ensure LaTeX is valid (escape backslashes properly in JSON).
    Use $...$ for inline math and $$...$$ for display math (equations).
    Use \\begin{align*}...\\end{align*} inside $$...$$ for multi-line equations.
    Do not add markdown formatting like \`\`\`json or \`\`\` around the response.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text;
    console.log("[EduTeX] Gemini Raw Response:", responseText);
    if (!responseText) throw new Error("No response from Gemini");

    // Clean markdown manually just in case
    const cleanedText = responseText.replace(/```json\n?|```/g, '').trim();

    const parsedData = JSON.parse(cleanedText);
    console.log("[EduTeX] Parsed Data:", parsedData);

    return {
      title: parsedData.title || `Διαγώνισμα: ${params.topic}`,
      subject: parsedData.subject || params.topic,
      gradeLevel: parsedData.gradeLevel || params.gradeLevel,
      durationMinutes: typeof parsedData.durationMinutes === 'number' ? parsedData.durationMinutes : 60,
      difficulty: typeof parsedData.difficulty === 'number' ? parsedData.difficulty : params.difficulty,
      questions: Array.isArray(parsedData.questions) ? parsedData.questions : [],
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    } as Exam;

  } catch (error) {
    console.error("Error generating exam:", error);
    throw error;
  }
}
