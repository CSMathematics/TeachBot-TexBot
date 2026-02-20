import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as syllabusService from './syllabusService';

const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('syllabusService', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock a successful API fetch response
        fetchMock.mockResolvedValue({
            ok: true,
            statusText: 'OK',
            json: async () => ([]) // Default to empty array
        });
    });

    describe('fetchSyllabusTree', () => {
        it('should build a nested tree structure from flat API response', async () => {
            const mockNodes = [
                { id: 'f1', parentId: null, title: 'Field 1', nodeType: 'FIELD', orderIndex: 1, metadata: {} },
                { id: 'c1', parentId: 'f1', title: 'Chapter 1', nodeType: 'CHAPTER', orderIndex: 1, metadata: {} },
                { id: 's1', parentId: 'c1', title: 'Section 1', nodeType: 'SECTION', orderIndex: 1, metadata: {} },
                { id: 'p1', parentId: 's1', title: 'Paragraph 1', nodeType: 'PARAGRAPH', orderIndex: 1, metadata: {} },
                { id: 'ci1', parentId: 'p1', title: 'Content Item 1', nodeType: 'CONTENT_ITEM', orderIndex: 1, metadata: {} },
                { id: 'et1', parentId: 'p1', title: 'Exercise Type 1', nodeType: 'EXERCISE_TYPE', orderIndex: 2, metadata: {} },
            ];

            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockNodes
            });

            const tree = await syllabusService.fetchSyllabusTree('sys-123');

            // Assert Tree Top Level (Field)
            expect(tree).toHaveLength(1);
            expect(tree[0].Id).toBe('f1');
            expect(tree[0].Name).toBe('Field 1');

            // Assert Chapter
            expect(tree[0].chapters).toHaveLength(1);
            expect(tree[0].chapters[0].Id).toBe('c1');

            // Assert Section
            expect(tree[0].chapters[0].sections).toHaveLength(1);
            expect(tree[0].chapters[0].sections[0].Id).toBe('s1');

            // Assert Paragraph
            expect(tree[0].chapters[0].sections[0].paragraphs).toHaveLength(1);
            expect(tree[0].chapters[0].sections[0].paragraphs[0].Id).toBe('p1');

            // Assert Leaf nodes (ContentItems, ExerciseTypes)
            expect(tree[0].chapters[0].sections[0].paragraphs[0].contentItems).toHaveLength(1);
            expect(tree[0].chapters[0].sections[0].paragraphs[0].contentItems[0].id).toBe('ci1');

            expect(tree[0].chapters[0].sections[0].paragraphs[0].exerciseTypes).toHaveLength(1);
            expect(tree[0].chapters[0].sections[0].paragraphs[0].exerciseTypes[0].Id).toBe('et1');

            // Assert counts
            expect(tree[0].chapters[0].sections[0].paragraphs[0].exerciseCount).toBe(2); // 1 ci + 1 et
        });

        it('should correctly sort nodes by orderIndex', async () => {
            const mockNodes = [
                { id: 'c2', parentId: 'f1', title: 'Chapter 2', nodeType: 'CHAPTER', orderIndex: 2, metadata: {} },
                { id: 'f1', parentId: null, title: 'Field 1', nodeType: 'FIELD', orderIndex: 2, metadata: {} },
                { id: 'c1', parentId: 'f1', title: 'Chapter 1', nodeType: 'CHAPTER', orderIndex: 1, metadata: {} },
                { id: 'f0', parentId: null, title: 'Field 0', nodeType: 'FIELD', orderIndex: 1, metadata: {} }
            ];

            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockNodes
            });

            const tree = await syllabusService.fetchSyllabusTree('sys-456');

            // Validate array order constraints (f0 before f1)
            expect(tree[0].Id).toBe('f0');
            expect(tree[1].Id).toBe('f1');

            // Validate chapters inside f1 are sorted (c1 before c2)
            expect(tree[1].chapters[0].Id).toBe('c1');
            expect(tree[1].chapters[1].Id).toBe('c2');
        });
    });

    describe('searchSections', () => {
        it('should perform a case-insensitive search and return matching sections', async () => {
            const mockNodes = [
                { id: 'f1', parentId: null, title: 'Field', nodeType: 'FIELD', orderIndex: 1, metadata: {} },
                { id: 'c1', parentId: 'f1', title: 'Chapter', nodeType: 'CHAPTER', orderIndex: 1, metadata: {} },
                { id: 's1', parentId: 'c1', title: 'Algebra Equations', nodeType: 'SECTION', orderIndex: 1, metadata: {} },
                { id: 's2', parentId: 'c1', title: 'Geometry Shapes', nodeType: 'SECTION', orderIndex: 2, metadata: {} }
            ];

            fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockNodes });

            await syllabusService.fetchSyllabusTree('sys-search');

            expect(syllabusService.searchSections('algebra')).toHaveLength(1);
            expect(syllabusService.searchSections('oMetry')).toHaveLength(1);
            expect(syllabusService.searchSections('NOT_EXIST')).toHaveLength(0);
        });

        it('should return empty array if cache is missing or query is empty', () => {
            expect(syllabusService.searchSections(' ')).toEqual([]);
        });
    });

    describe('API Helpers', () => {
        it('should throw an error on fetch failure when requesting to updateNode', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                statusText: 'Bad Request'
            });

            await expect(syllabusService.updateNode('n1', 'Test')).rejects.toThrow('API Error: Bad Request');
        });

        it('createSyllabus should post correct data structure', async () => {
            fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'new' }) });

            const res = await syllabusService.createSyllabus('Math 101', 'PERSONAL', 'user-1', 'Grade 10');

            expect(res).toEqual({ id: 'new' });
            expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/syllabus', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ name: 'Math 101', type: 'PERSONAL', ownerId: 'user-1', gradeLevel: 'Grade 10' })
            }));
        });
    });
});
