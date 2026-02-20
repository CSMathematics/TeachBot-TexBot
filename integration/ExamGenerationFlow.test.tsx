import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ExamGenerator from '../pages/ExamGenerator';
import { SettingsProvider } from '../contexts/SettingsContext';
import { ToastProvider } from '../components/Toast';

// Mock scrollIntoView as it's not implemented in JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock Lucide icons comprehensively
vi.mock('lucide-react', () => ({
    Activity: () => <div data-testid="icon-activity" />,
    AlertCircle: () => <div data-testid="icon-alert-circle" />,
    AlertTriangle: () => <div data-testid="icon-alert-triangle" />,
    ArrowLeftRight: () => <div data-testid="icon-arrow-left-right" />,
    ArrowRight: () => <div data-testid="icon-arrow-right" />,
    ArrowUpRight: () => <div data-testid="icon-arrow-up-right" />,
    BookMarked: () => <div data-testid="icon-book-marked" />,
    BookOpen: () => <div data-testid="icon-book-open" />,
    Bot: () => <div data-testid="icon-bot" />,
    Brain: () => <div data-testid="icon-brain" />,
    Calculator: () => <div data-testid="icon-calculator" />,
    Calendar: () => <div data-testid="icon-calendar" />,
    Check: () => <div data-testid="icon-check" />,
    CheckCircle: () => <div data-testid="icon-check-circle" />,
    CheckSquare: () => <div data-testid="icon-check-square" />,
    ChevronDown: () => <div data-testid="icon-chevron-down" />,
    ChevronLeft: () => <div data-testid="icon-chevron-left" />,
    ChevronRight: () => <div data-testid="icon-chevron-right" />,
    ClipboardCheck: () => <div data-testid="icon-clipboard-check" />,
    Clock: () => <div data-testid="icon-clock" />,
    Code: () => <div data-testid="icon-code" />,
    Copy: () => <div data-testid="icon-copy" />,
    Download: () => <div data-testid="icon-download" />,
    Edit2: () => <div data-testid="icon-edit-2" />,
    Edit3: () => <div data-testid="icon-edit-3" />,
    ExternalLink: () => <div data-testid="icon-external-link" />,
    Eye: () => <div data-testid="icon-eye" />,
    EyeOff: () => <div data-testid="icon-eye-off" />,
    FileCheck: () => <div data-testid="icon-file-check" />,
    FileJson: () => <div data-testid="icon-file-json" />,
    FileText: () => <div data-testid="icon-file-text" />,
    Gauge: () => <div data-testid="icon-gauge" />,
    GitBranch: () => <div data-testid="icon-git-branch" />,
    Globe: () => <div data-testid="icon-globe" />,
    GraduationCap: () => <div data-testid="icon-graduation-cap" />,
    Grid3x3: () => <div data-testid="icon-grid-3x3" />,
    GripVertical: () => <div data-testid="icon-grip-vertical" />,
    Image: () => <div data-testid="icon-image" />,
    Info: () => <div data-testid="icon-info" />,
    Key: () => <div data-testid="icon-key" />,
    Layers: () => <div data-testid="icon-layers" />,
    Layout: () => <div data-testid="icon-layout" />,
    LayoutDashboard: () => <div data-testid="icon-layout-dashboard" />,
    LayoutTemplate: () => <div data-testid="icon-layout-template" />,
    Lightbulb: () => <div data-testid="icon-lightbulb" />,
    List: () => <div data-testid="icon-list" />,
    ListChecks: () => <div data-testid="icon-list-checks" />,
    ListOrdered: () => <div data-testid="icon-list-ordered" />,
    Loader2: () => <div data-testid="icon-loader-2" />,
    Minus: () => <div data-testid="icon-minus" />,
    MoreVertical: () => <div data-testid="icon-more-vertical" />,
    Network: () => <div data-testid="icon-network" />,
    Palette: () => <div data-testid="icon-palette" />,
    Plus: () => <div data-testid="icon-plus" />,
    Presentation: () => <div data-testid="icon-presentation" />,
    Printer: () => <div data-testid="icon-printer" />,
    RefreshCw: () => <div data-testid="icon-refresh-cw" />,
    RotateCcw: () => <div data-testid="icon-rotate-ccw" />,
    Save: () => <div data-testid="icon-save" />,
    Search: () => <div data-testid="icon-search" />,
    Server: () => <div data-testid="icon-server" />,
    Settings: () => <div data-testid="icon-settings" />,
    Shapes: () => <div data-testid="icon-shapes" />,
    Shield: () => <div data-testid="icon-shield" />,
    Shuffle: () => <div data-testid="icon-shuffle" />,
    Sigma: () => <div data-testid="icon-sigma" />,
    Sparkles: () => <div data-testid="icon-sparkles" />,
    Split: () => <div data-testid="icon-split" />,
    Stethoscope: () => <div data-testid="icon-stethoscope" />,
    Table: () => <div data-testid="icon-table" />,
    TableIcon: () => <div data-testid="icon-table" />,
    Tag: () => <div data-testid="icon-tag" />,
    Timer: () => <div data-testid="icon-timer" />,
    Trash2: () => <div data-testid="icon-trash-2" />,
    TrendingUp: () => <div data-testid="icon-trending-up" />,
    Type: () => <div data-testid="icon-type" />,
    Upload: () => <div data-testid="icon-upload" />,
    User: () => <div data-testid="icon-user" />,
    Users: () => <div data-testid="icon-users" />,
    Wand2: () => <div data-testid="icon-wand-2" />,
    Wrench: () => <div data-testid="icon-wrench" />,
    X: () => <div data-testid="icon-x" />,
    Zap: () => <div data-testid="icon-zap" />,
    ZoomIn: () => <div data-testid="icon-zoom-in" />,
    ZoomOut: () => <div data-testid="icon-zoom-out" />
}));

// Mock services
vi.mock('../services/syllabusService', () => ({
    fetchAllSyllabuses: vi.fn(() => Promise.resolve([{ id: 's1', name: 'Math A', gradeLevel: 'A Lykeiou' }])),
    fetchSyllabusTree: vi.fn(() => Promise.resolve([
        { Id: 'f1', Name: 'Algebra', chapters: [{ Id: 'c1', Name: 'Functions', sections: [{ Id: 'sec1', Name: 'Rules' }] }] }
    ])),
}));

vi.mock('../services/geminiService', () => ({
    generateExam: vi.fn(() => Promise.resolve({
        id: 'exam-123',
        title: 'Mock Exam',
        subject: 'Math',
        gradeLevel: 'A Lykeiou',
        questions: [
            { id: 'q1', content: 'What is 1+1?', points: 10, difficulty: 'Easy', type: 'exercise', solution: '2' }
        ],
        createdAt: new Date().toISOString()
    })),
}));

vi.mock('../services/templateService', () => ({
    PRESET_COLORS: [{ name: 'Blue', hex: '#1285cc' }],
    TEMPLATE_STYLES: [{ id: 'scientific', name: 'Scientific', description: 'desc', previewColor: '#000' }]
}));

// Mock fetch for SVG loading
vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
    ok: true,
    text: () => Promise.resolve('<svg>mock</svg>'),
    json: () => Promise.resolve({})
})));

const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
        <SettingsProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </SettingsProvider>
    </BrowserRouter>
);

describe('Exam Generation Flow Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('completes the full generation flow from choice to preview', async () => {
        render(<ExamGenerator />, { wrapper: AllProviders });

        // 1. Initial State
        expect(screen.getByText('Έτοιμο για Δημιουργία')).toBeInTheDocument();

        // 2. Select Syllabus & Topic
        await waitFor(() => screen.getByText('Math A'));
        fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 's1' } });

        await waitFor(() => screen.getByText('Algebra'));
        fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'f1' } });

        // Select the topic in TopicSelector
        await waitFor(() => screen.getByText('Functions'));
        fireEvent.click(screen.getByText('Functions')); // Expand

        // In TopicSelector, the checkbox is a button before the text
        const functionsText = screen.getByText('Functions');
        const checkbox = functionsText.previousElementSibling as HTMLElement;
        fireEvent.click(checkbox);

        // 3. Set Count and Start Generation
        // Find the "Δημιουργία Διαγωνίσματος" button
        const generateBtn = screen.getByRole('button', { name: /Δημιουργία Διαγωνίσματος/i });
        fireEvent.click(generateBtn);

        // 4. Verify AI Pipeline is working
        await waitFor(() => {
            // Exercise Generator should show up in the agents list
            expect(screen.getByText('Exercise Generator')).toBeInTheDocument();
        });

        // 5. Verify Results appear in PdfPreview
        await waitFor(() => {
            // "Mock Exam" should appear as a title in the preview if rendered
            // Actually, PdfPreview renders questions.
            expect(screen.getByText('What is 1+1?')).toBeInTheDocument();
        }, { timeout: 10000 });

        // 6. Navigate to LaTeX tab
        const latexTab = screen.getByRole('button', { name: 'LaTeX' });
        fireEvent.click(latexTab);

        await waitFor(() => {
            expect(screen.getByText('LaTeX Source')).toBeInTheDocument();
        });
    });
});
