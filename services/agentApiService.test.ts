import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as agentApi from './agentApiService';

// Mock the global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('agentApiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear localStorage mock before each test
        localStorage.clear();

        // Default to a successful fetch response
        fetchMock.mockResolvedValue({
            ok: true,
            json: async () => ({ status: 'success' })
        });
    });

    describe('checkBackendHealth', () => {
        it('should return true when backend is online', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'online' })
            });

            const result = await agentApi.checkBackendHealth();
            expect(result).toBe(true);
            expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/', expect.any(Object));
        });

        it('should return false when backend returns offline or unexpected status', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'offline' })
            });

            const result = await agentApi.checkBackendHealth();
            expect(result).toBe(false);
        });

        it('should return false on fetch throw (e.g., timeout)', async () => {
            fetchMock.mockRejectedValueOnce(new Error('Timeout'));
            const result = await agentApi.checkBackendHealth();
            expect(result).toBe(false);
        });
    });

    describe('apiGenerateExam', () => {
        const dummyParams = {
            topic: 'Algebra',
            gradeLevel: 'High School',
            difficulty: 3,
            questionCount: 5,
            includeSolutions: false
        };

        it('should POST to /api/generate-exam with correct params and return Exam', async () => {
            const mockResponse = { id: 'exam-123', title: 'Test Exam' };
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await agentApi.apiGenerateExam(dummyParams);

            expect(fetchMock).toHaveBeenCalledWith(
                'http://localhost:8000/api/generate-exam',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify(dummyParams)
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('should throw an error when API is not OK', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                statusText: 'Internal Server Error',
                json: async () => ({ detail: 'Something went wrong' })
            });

            await expect(agentApi.apiGenerateExam(dummyParams)).rejects.toThrow('Something went wrong');
        });

        it('should include Gemini API Key in headers if available in localStorage', async () => {
            localStorage.setItem('edutex-settings', JSON.stringify({ geminiApiKey: 'test-key' }));

            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({})
            });

            await agentApi.apiGenerateExam(dummyParams);

            expect(fetchMock).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'X-Gemini-API-Key': 'test-key'
                    })
                })
            );
        });
    });
});
