import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateExam, listAvailableModels, getPrerequisiteSuggestion } from './geminiService';
import * as agentApi from './agentApiService';

// Mock the GoogleGenAI class locally
const mockGenerateContent = vi.fn();
vi.mock('@google/genai', () => ({
    GoogleGenAI: class {
        models = {
            generateContent: mockGenerateContent
        };
    }
}));

// Partially mock agentApiService
vi.mock('./agentApiService', () => ({
    checkBackendHealth: vi.fn(),
    apiGenerateExam: vi.fn()
}));

// Mock global fetch for listAvailableModels
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('geminiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Setup a dummy API key to avoid initialization errors
        localStorage.setItem('edutex-settings', JSON.stringify({ geminiApiKey: 'test-genai-key' }));

        // Default mock fetch for listAvailableModels
        fetchMock.mockResolvedValue({
            ok: true,
            statusText: 'OK',
            json: async () => ({ models: [{ name: 'models/gemini-pro', supportedGenerationMethods: ['generateContent'] }] })
        });
    });

    describe('generateExam', () => {
        const dummyParams = {
            topic: 'Algebra',
            gradeLevel: 'High School',
            difficulty: 3,
            questionCount: 5,
            includeSolutions: false
        };

        it('should use backend apiGenerateExam if checkBackendHealth is true', async () => {
            vi.mocked(agentApi.checkBackendHealth).mockResolvedValueOnce(true);
            const backendApiResponse = { id: 'backend-1', title: 'Backend Exam' };
            vi.mocked(agentApi.apiGenerateExam).mockResolvedValueOnce(backendApiResponse as any);

            const exam = await generateExam(dummyParams);
            expect(agentApi.checkBackendHealth).toHaveBeenCalled();
            expect(agentApi.apiGenerateExam).toHaveBeenCalledWith(dummyParams);
            expect(exam).toEqual(backendApiResponse);
            expect(mockGenerateContent).not.toHaveBeenCalled();
        });

        it('should fallback to direct Gemini API if checkBackendHealth is false', async () => {
            vi.mocked(agentApi.checkBackendHealth).mockResolvedValueOnce(false);

            // Setup mock response from Gemini
            mockGenerateContent.mockResolvedValueOnce({
                text: JSON.stringify({
                    title: 'Gemini Exam',
                    subject: 'Math',
                    gradeLevel: 'High School',
                    durationMinutes: 45,
                    difficulty: 4,
                    questions: []
                })
            });

            const exam = await generateExam(dummyParams);
            expect(agentApi.checkBackendHealth).toHaveBeenCalled();
            expect(agentApi.apiGenerateExam).not.toHaveBeenCalled();
            expect(mockGenerateContent).toHaveBeenCalled();

            expect(exam.title).toBe('Gemini Exam');
            expect(exam.durationMinutes).toBe(45);
            expect(exam.questions).toBeInstanceOf(Array);
        });

        it('should properly strip markdown block from Gemini JSON output', async () => {
            vi.mocked(agentApi.checkBackendHealth).mockResolvedValueOnce(false);

            mockGenerateContent.mockResolvedValueOnce({
                text: "```json\n{\n\"title\": \"Stripped Exam\",\n\"questions\": []\n}\n```"
            });

            const exam = await generateExam(dummyParams);
            expect(exam.title).toBe('Stripped Exam');
        });

        it('should fall back to Gemini API if checkBackendHealth throws an error', async () => {
            vi.mocked(agentApi.checkBackendHealth).mockRejectedValueOnce(new Error('Network error'));

            mockGenerateContent.mockResolvedValueOnce({
                text: JSON.stringify({
                    title: 'Fallback Exam'
                })
            });

            const exam = await generateExam(dummyParams);
            expect(exam.title).toBe('Fallback Exam');
        });
    });

    describe('listAvailableModels', () => {
        it('should return a list of parsed model names', async () => {
            const models = await listAvailableModels();
            expect(fetchMock).toHaveBeenCalledWith('https://generativelanguage.googleapis.com/v1beta/models?key=test-genai-key');
            expect(models).toEqual(['gemini-pro']);
        });

        it('should return fallback list on fetch failure', async () => {
            fetchMock.mockRejectedValueOnce(new Error('Fetch failed'));
            const models = await listAvailableModels();
            expect(models).toContain('gemini-1.5-flash');
            expect(models).toContain('gemini-1.5-pro');
        });
    });

    describe('getPrerequisiteSuggestion', () => {
        it('should request suggestion from Gemini cleanly', async () => {
            mockGenerateContent.mockResolvedValueOnce({
                text: "Derivative basics, Limits"
            });

            const result = await getPrerequisiteSuggestion('Derivatives', 'Section');
            expect(mockGenerateContent).toHaveBeenCalled();
            expect(result).toBe('Derivative basics, Limits');
        });

        it('should throw an error if model generation fails completely', async () => {
            mockGenerateContent.mockRejectedValueOnce(new Error('Quota exceeded'));
            await expect(getPrerequisiteSuggestion('Limits', 'Chapter')).rejects.toThrow('Quota exceeded');
        });
    });
});
