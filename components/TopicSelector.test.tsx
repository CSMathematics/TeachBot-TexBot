import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TopicSelector from './TopicSelector';

// Mock lucide icons
vi.mock('lucide-react', () => ({
    ChevronRight: () => <div data-testid="icon-chevron-right">Right</div>,
    ChevronDown: () => <div data-testid="icon-chevron-down">Down</div>,
    Check: () => <div data-testid="icon-check">Check</div>,
    Minus: () => <div data-testid="icon-minus">Minus</div>,
}));

// Mock Data
const mockSyllabuses = [
    { id: 's1', name: 'Syllabus 1', gradeLevel: 'A Lykeiou' },
    { id: 's2', name: 'Syllabus 2', gradeLevel: 'B Lykeiou' }
];

const mockTree = [
    {
        Id: 'f1', Name: 'Field 1', syllabusId: 's1', orderIndex: 1, nodeType: 'FIELD', chapters: [
            {
                Id: 'c1', Name: 'Chapter 1', syllabusId: 's1', orderIndex: 1, nodeType: 'CHAPTER', parentId: 'f1', sections: [
                    {
                        Id: 'sec1', Name: 'Section 1', syllabusId: 's1', orderIndex: 1, nodeType: 'SECTION', parentId: 'c1', paragraphs: [
                            { Id: 'p1', Name: 'Paragraph 1', syllabusId: 's1', orderIndex: 1, nodeType: 'PARAGRAPH', parentId: 'sec1' },
                            { Id: 'p2', Name: 'Paragraph 2', syllabusId: 's1', orderIndex: 2, nodeType: 'PARAGRAPH', parentId: 'sec1' }
                        ]
                    },
                    {
                        Id: 'sec2', Name: 'Section 2', syllabusId: 's1', orderIndex: 2, nodeType: 'SECTION', parentId: 'c1', paragraphs: []
                    }
                ]
            }
        ]
    }
];

// Mock syllabusService
vi.mock('../services/syllabusService', () => {
    return {
        fetchAllSyllabuses: vi.fn(() => Promise.resolve(mockSyllabuses)),
        fetchSyllabusTree: vi.fn((syllabusId: string) => {
            if (syllabusId === 's1') return Promise.resolve(mockTree);
            return Promise.resolve([]);
        })
    };
});

describe('TopicSelector Component', () => {
    let onChangeMock: any;
    let onGradeLevelChangeMock: any;

    beforeEach(() => {
        vi.clearAllMocks();
        onChangeMock = vi.fn();
        onGradeLevelChangeMock = vi.fn();
    });

    it('renders and loads initial syllabuses', async () => {
        render(<TopicSelector value="" onChange={onChangeMock} onGradeLevelChange={onGradeLevelChangeMock} />);

        // Wait for syllabuses to load and display in select
        await waitFor(() => {
            expect(screen.getByText('Syllabus 1')).toBeInTheDocument();
            expect(screen.getByText('Syllabus 2')).toBeInTheDocument();
        });
    });

    it('loads fields and tree when syllabus is selected', async () => {
        render(<TopicSelector value="" onChange={onChangeMock} onGradeLevelChange={onGradeLevelChangeMock} />);

        await waitFor(() => {
            expect(screen.getByText('Syllabus 1')).toBeInTheDocument();
        });

        // Select Syllabus 1
        const syllabusSelect = screen.getAllByRole('combobox')[0];
        fireEvent.change(syllabusSelect, { target: { value: 's1' } });

        // Expected Grade Level emit
        await waitFor(() => {
            expect(onGradeLevelChangeMock).toHaveBeenCalledWith('A Lykeiou');
        });

        // Field should be loaded
        await waitFor(() => {
            expect(screen.getByText('Field 1')).toBeInTheDocument();
        });
    });

    it('expands tree and shows chapters and sections', async () => {
        render(<TopicSelector value="" onChange={onChangeMock} onGradeLevelChange={onGradeLevelChangeMock} />);

        // Select syllabus
        await waitFor(() => screen.getByText('Syllabus 1'));
        fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 's1' } });

        // Select field
        await waitFor(() => screen.getByText('Field 1'));
        fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'f1' } });

        // Once the field is selected, the chapter should render (collapsed)
        await waitFor(() => {
            expect(screen.getByText('Chapter 1')).toBeInTheDocument();
        });

        // Expand chapter 1
        fireEvent.click(screen.getByText('Chapter 1'));

        // Ensure sections are rendered underneath
        await waitFor(() => {
            expect(screen.getByText('Section 1')).toBeInTheDocument();
            expect(screen.getByText('Section 2')).toBeInTheDocument();
        });

        // Expand section 1
        fireEvent.click(screen.getByText('Section 1'));

        // Ensure paragraphs are rendered
        await waitFor(() => {
            expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
            expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
        });
    });

    it('builds topic string properly with partial and full selection', async () => {
        render(<TopicSelector value="" onChange={onChangeMock} onGradeLevelChange={onGradeLevelChangeMock} />);

        await waitFor(() => screen.getByText('Syllabus 1'));
        fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 's1' } });

        await waitFor(() => screen.getByText('Field 1'));
        fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'f1' } });

        await waitFor(() => screen.getByText('Chapter 1'));

        // Let's expand everything so we can click checkboxes
        fireEvent.click(screen.getByText('Chapter 1'));
        await waitFor(() => screen.getByText('Section 1'));
        fireEvent.click(screen.getByText('Section 1'));
        await waitFor(() => screen.getByText('Paragraph 1'));

        // Case 1: Select only Paragraph 1
        // (Getting the checkbox can be tricky. We know TreeCheckbox is rendered beside the name. 
        // We'll rely on our mocked lucide icons for state, or we can just grab all buttons and find the right one.
        // Or find the text and traverse to its sibling button.)
        const p1Text = screen.getByText('Paragraph 1');
        const p1Checkbox = p1Text.previousElementSibling as HTMLElement;
        fireEvent.click(p1Checkbox);

        await waitFor(() => {
            expect(onChangeMock).toHaveBeenCalledWith('Field 1: Chapter 1: Section 1 (Paragraph 1)');
        });

        // Case 2: Select the whole Section 2
        const sec2Text = screen.getByText('Section 2');
        const sec2Checkbox = sec2Text.previousElementSibling as HTMLElement;
        fireEvent.click(sec2Checkbox);

        await waitFor(() => {
            expect(onChangeMock).toHaveBeenCalledWith('Field 1: Chapter 1: Section 1 (Paragraph 1); Section 2');
        });
    });
});
