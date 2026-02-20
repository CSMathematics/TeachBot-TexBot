import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PdfPreview from './PdfPreview';
import { Exam } from '../types';
import * as latexGenerator from '../lib/latexGenerator';

// Mock Lucide icons to avoid SVGs cluttering logs
vi.mock('lucide-react', () => {
    return {
        Eye: () => <div data-testid="icon-eye">Eye</div>,
        EyeOff: () => <div data-testid="icon-eye-off">EyeOff</div>,
        Palette: () => <div data-testid="icon-palette">Palette</div>,
        ZoomIn: () => <div data-testid="icon-zoom-in">ZoomIn</div>,
        ZoomOut: () => <div data-testid="icon-zoom-out">ZoomOut</div>,
        Settings: () => <div data-testid="icon-settings">Settings</div>,
        Type: () => <div data-testid="icon-type">Type</div>,
        Calendar: () => <div data-testid="icon-calendar">Calendar</div>,
        User: () => <div data-testid="icon-user">User</div>,
        Layout: () => <div data-testid="icon-layout">Layout</div>,
        Edit3: () => <div data-testid="icon-edit">Edit3</div>,
        Save: () => <div data-testid="icon-save">Save</div>,
        FileText: () => <div data-testid="icon-file-text">FileText</div>,
        Split: () => <div data-testid="icon-split">Split</div>,
        Code: () => <div data-testid="icon-code">Code</div>,
        Copy: () => <div data-testid="icon-copy">Copy</div>,
        Loader2: () => <div data-testid="icon-loader">Loader2</div>,
        Download: () => <div data-testid="icon-download">Download</div>,
        AlertTriangle: () => <div data-testid="icon-alert">Alert</div>,
        LayoutTemplate: () => <div data-testid="icon-layout-template">Template</div>
    };
});

// Mock LatexRenderer to just return the text
vi.mock('./LatexRenderer', () => {
    return {
        default: ({ latex }: { latex: string }) => <div data-testid="latex-renderer">{latex}</div>
    };
});

// Mock templateService because it's required dynamically in the component
vi.mock('../services/templateService', () => {
    return {
        PRESET_COLORS: [
            { name: 'Blue', hex: '#1285cc' },
            { name: 'Red', hex: '#ef4444' }
        ],
        TEMPLATE_STYLES: [
            { id: 'classic', name: 'Classic', description: 'desc', previewColor: '#000' },
            { id: 'modern', name: 'Modern', description: 'desc', previewColor: '#1285cc' }
        ]
    };
});

// Spy on generateLatexFromExam
vi.spyOn(latexGenerator, 'generateLatexFromExam').mockReturnValue('% Mocked LaTeX Output');

describe('PdfPreview Component', () => {
    const mockExam: Exam = {
        id: 'exam-1',
        title: 'Test Exam',
        subject: 'Math',
        gradeLevel: 'A Lykeiou',
        durationMinutes: 60,
        difficulty: 50,
        questions: [],
        createdAt: new Date().toISOString(),
    };

    const mockTemplateConfig = {
        style: 'modern',
        mainColor: '#1285cc'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Stub window.fetch for SVG loading and compilation
        vi.stubGlobal('fetch', vi.fn((url) => {
            if (typeof url === 'string' && url.includes('/templates/exam.svg')) {
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve('<svg>Mock Background</svg>')
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            });
        }));
    });

    it('renders empty state when no questions exist', async () => {
        render(<PdfPreview exam={mockExam} templateConfig={mockTemplateConfig} />);

        // Find the empty state message
        expect(screen.getByText('Δεν βρέθηκαν ερωτήσεις.')).toBeInTheDocument();
    });

    it('renders paginated questions', async () => {
        const examWithQuestions: Exam = {
            ...mockExam,
            questions: [
                { id: 'q1', type: 'exercise', content: 'Question 1', difficulty: 'Easy', points: 10, orderIndex: 0, syllabusId: 's1', nodeType: 'PARAGRAPH', parentId: null, solution: 'sol1', tags: [] },
                { id: 'q2', type: 'exercise', content: 'Question 2', difficulty: 'Medium', points: 20, orderIndex: 1, syllabusId: 's1', nodeType: 'PARAGRAPH', parentId: null, solution: 'sol2', tags: [] }
            ]
        };

        render(<PdfPreview exam={examWithQuestions} templateConfig={mockTemplateConfig} />);

        // The layout calculation happens after a setTimeout, so we need to wait
        await waitFor(() => {
            expect(screen.getByText('Question 1')).toBeInTheDocument();
            expect(screen.getByText('Question 2')).toBeInTheDocument();
        }, { timeout: 1000 });
    });

    it('handles view mode switching (Preview -> Code -> PDF)', async () => {
        const examWithQuestions: Exam = {
            ...mockExam,
            questions: [
                { id: 'q1', type: 'exercise', content: 'Question 1', difficulty: 'Easy', points: 10, orderIndex: 0, syllabusId: 's1', nodeType: 'PARAGRAPH', parentId: null, solution: 'sol1', tags: [] }
            ]
        };
        render(<PdfPreview exam={examWithQuestions} templateConfig={mockTemplateConfig} />);

        // temporary debugging prints
        console.log("Interactive HTML Preview class:", screen.getByTitle('Interactive HTML Preview').className);
        console.log("LaTeX Source Code class:", screen.getByTitle('LaTeX Source Code').className);
        console.log("Compiled PDF View class:", screen.getByTitle('Compiled PDF View').className);

        // Initially in preview mode
        expect(screen.getByText('Question 1')).toBeInTheDocument();

        // Switch to Code Mode
        fireEvent.click(screen.getByTitle('LaTeX Source Code'));

        // Wait for textarea to appear
        await waitFor(() => {
            const textareas = screen.getAllByRole('textbox');
            expect(textareas.length).toBeGreaterThan(0);
        }, { timeout: 2000 });

        // Switch to PDF Mode
        fireEvent.click(screen.getByTitle('Compiled PDF View'));

        // "No PDF compiled yet" is usually an empty state when PDF is not available.
        // We look for the compile button to ensure we are in the right state/pane.
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Compile & View PDF/i })).toBeInTheDocument();
        });
    });

    it('triggers PDF compilation correctly', async () => {
        // Prepare mock for the compilation POST request - Avoid new Blob() due to JSDOM opaque origins error
        const mockPdfBlob = { size: 1024, type: 'application/pdf' } as any;
        const fetchMock = vi.fn().mockImplementation((url, options) => {
            if (url === 'http://localhost:8000/api/compile-pdf') {
                return Promise.resolve({
                    ok: true,
                    blob: () => Promise.resolve(mockPdfBlob)
                });
            }
            // fallback for svg
            return Promise.resolve({ ok: true, text: () => Promise.resolve('<svg></svg>') });
        });
        vi.stubGlobal('fetch', fetchMock);

        // Required to mock URL.createObjectURL in JSDOM
        const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
        Object.defineProperty(global.URL, 'createObjectURL', { value: createObjectURLMock });

        render(<PdfPreview exam={mockExam} templateConfig={mockTemplateConfig} />);

        // Click compile button
        const compileButton = screen.getByRole('button', { name: /Compile & View PDF/i });
        fireEvent.click(compileButton);

        // Should show loader text
        expect(screen.getByText('Compiling...')).toBeInTheDocument();

        // Wait for it to finish and switch to PDF view with iframe
        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/api/compile-pdf', expect.any(Object));
            expect(createObjectURLMock).toHaveBeenCalledWith(mockPdfBlob);

            // Should now see the iframe
            const iframe = screen.getByTitle('PDF Preview');
            expect(iframe).toBeInTheDocument();
            expect(iframe).toHaveAttribute('src', 'blob:mock-url');
        }, { timeout: 3000 });
    });

    it('toggles solution modes correctly', async () => {
        const examWithSolutions: Exam = {
            ...mockExam,
            questions: [
                { id: 'q1', type: 'exercise', content: 'Question 1', solution: 'Solution 1', difficulty: 'Easy', points: 10, orderIndex: 0, syllabusId: 's1', nodeType: 'PARAGRAPH', parentId: null, tags: [] },
            ]
        };

        render(<PdfPreview exam={examWithSolutions} templateConfig={mockTemplateConfig} />);

        // Wait for initial render of questions
        await waitFor(() => {
            expect(screen.getByText('Question 1')).toBeInTheDocument();
        });

        // 1. None (Default) - solution should NOT be visible
        // We look for 'Solution 1' within the actually rendered pages, but since it's "none", it's nowhere.
        // screen.queryByText is better.
        expect(screen.queryByText('Solution 1')).not.toBeInTheDocument();

        // 2. Inline
        const inlineBtn = screen.getByRole('button', { name: 'Inline' });
        fireEvent.click(inlineBtn);

        await waitFor(() => {
            // Now the measuring container AND the page will render it
            const solutionElements = screen.getAllByText('Solution 1');
            expect(solutionElements.length).toBeGreaterThan(0);
            // We also expect the "ΛΥΣΗ" label block
            expect(screen.getAllByText('ΛΥΣΗ').length).toBeGreaterThan(0);
        });

        // 3. Separate
        const separateBtn = screen.getByRole('button', { name: 'Ξεχωριστά' });
        fireEvent.click(separateBtn);

        await waitFor(() => {
            // Check for the "Απαντήσεις & Λύσεις" header block
            expect(screen.getByText('Απαντήσεις & Λύσεις')).toBeInTheDocument();
            expect(screen.getByText('Θέμα 1')).toBeInTheDocument();
            const solutionElements = screen.getAllByText('Solution 1');
            expect(solutionElements.length).toBeGreaterThan(0);
        });
    });
});
