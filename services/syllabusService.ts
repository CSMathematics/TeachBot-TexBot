import {
    SyllabusField,
    SyllabusChapter,
    SyllabusSection,
    SyllabusExerciseType,
    SyllabusFieldNode,
    SyllabusChapterNode,
    SyllabusSectionNode,
    SyllabusParagraphNode
} from '../types';

const API_URL = 'http://localhost:3001/api';

// ─── Types matching DB Schema ───────────────────────────────────────

export interface Syllabus {
    id: string;
    name: string;
    description: string | null;
    type: 'PERSONAL' | 'ORGANIZATION';
    createdAt: string;
    updatedAt: string;
    ownerId: string | null;
    orgId: string | null;
}

interface DbSyllabusNode {
    id: string;
    parentId: string | null;
    title: string;
    nodeType: 'FIELD' | 'CHAPTER' | 'SECTION' | 'EXERCISE_TYPE' | 'PARAGRAPH' | 'CONTENT_ITEM';
    orderIndex: number;
    metadata: any;
    prerequisites?: string | null;
    contentType?: string | null;
    children?: DbSyllabusNode[];
}

// ─── API Helpers ────────────────────────────────────────────────────

async function fetchFromApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
}

async function postToApi<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
}

// ─── Public API ─────────────────────────────────────────────────────

// Cache for performance (optional, could be removed for real-time updates)
let _syllabusCache: SyllabusFieldNode[] | null = null;
let _currentSyllabusId: string | null = null; // Track which syllabus we are viewing

/**
 * Fetch the entire syllabus tree for a given Syllabus ID.
 * Transforms the flat or nested DB nodes into the UI's expected Tree structure.
 */
export async function fetchSyllabusTree(syllabusId: string): Promise<SyllabusFieldNode[]> {
    _currentSyllabusId = syllabusId;

    // fetch all nodes for this syllabus
    // We might need a recursive endpoint or fetch all flat and build tree
    // For now, let's assume we fetch all nodes flat and rebuild tree client-side
    // OR update server to return tree.
    // Let's implement a 'get all nodes' endpoint.

    // For MVP: Fetch just the root fields first, then we might lazy load?
    // Actually, UI expects full tree for search/stats.
    const nodes = await fetchFromApi<DbSyllabusNode[]>(`/syllabus-node?syllabusId=${syllabusId}`);

    // Build Tree
    const nodeMap = new Map<string, DbSyllabusNode & { children: DbSyllabusNode[] }>();
    nodes.forEach(n => nodeMap.set(n.id, { ...n, children: [] }));

    const rootNodes: (DbSyllabusNode & { children: DbSyllabusNode[] })[] = [];

    nodes.forEach(node => {
        if (node.parentId && nodeMap.has(node.parentId)) {
            nodeMap.get(node.parentId)!.children.push(nodeMap.get(node.id)!);
        } else if (!node.parentId && node.nodeType === 'FIELD') {
            rootNodes.push(nodeMap.get(node.id)!);
        }
    });

    // Sort by orderIndex
    const sortNodes = (nodes: any[]) => nodes.sort((a, b) => a.orderIndex - b.orderIndex);

    // Transform to UI types
    const tree: SyllabusFieldNode[] = sortNodes(rootNodes).map(fieldNode => {
        sortNodes(fieldNode.children);

        const chapters = fieldNode.children
            .filter(c => c.nodeType === 'CHAPTER')
            .map(chapterNode => {
                sortNodes(chapterNode.children || []);

                const sections = chapterNode.children
                    .filter(s => s.nodeType === 'SECTION')
                    .map(sectionNode => {
                        sortNodes(sectionNode.children || []);

                        // Paragraphs
                        const paragraphs = sectionNode.children
                            .filter(p => p.nodeType === 'PARAGRAPH')
                            .map(paragraphNode => {
                                sortNodes(paragraphNode.children || []);

                                const contentItems = paragraphNode.children
                                    .filter(c => c.nodeType === 'CONTENT_ITEM')
                                    .map(ci => ({
                                        id: ci.id,
                                        title: ci.title,
                                        name: ci.title
                                    }));

                                const exerciseTypes = paragraphNode.children
                                    .filter(e => e.nodeType === 'EXERCISE_TYPE')
                                    .map(et => ({
                                        Id: et.id,
                                        Name: et.title
                                    }));

                                return {
                                    Id: paragraphNode.id,
                                    Name: paragraphNode.title,
                                    Section: sectionNode.id,
                                    contentType: paragraphNode.contentType as any,
                                    exerciseTypes,
                                    contentItems,
                                    exerciseCount: exerciseTypes.length + contentItems.length
                                } as SyllabusParagraphNode;
                            });

                        // Direct children exercise types (if any - fallback)
                        const directExerciseTypes = sectionNode.children
                            .filter(e => e.nodeType === 'EXERCISE_TYPE')
                            .map(et => ({
                                Id: et.id,
                                Name: et.title
                            } as SyllabusExerciseType));

                        return {
                            Id: sectionNode.id,
                            Name: sectionNode.title,
                            Chapter: chapterNode.id,
                            prerequisites: sectionNode.prerequisites || undefined,
                            paragraphs,
                            exerciseTypes: directExerciseTypes,
                            exerciseCount: paragraphs.reduce((s, p) => s + p.exerciseCount, 0) + directExerciseTypes.length
                        } as SyllabusSectionNode;
                    });

                return {
                    Id: chapterNode.id,
                    Name: chapterNode.title,
                    Field: fieldNode.id,
                    prerequisites: chapterNode.prerequisites || undefined,
                    sections,
                    totalParagraphs: sections.reduce((s, sec) => sec.paragraphs.length + s, 0)
                } as SyllabusChapterNode;
            });

        return {
            Id: fieldNode.id,
            Name: fieldNode.title,
            Description: fieldNode.metadata?.description || null,
            chapters,
            totalChapters: chapters.length,
            totalSections: chapters.reduce((s, c) => s + c.sections.length, 0),
            totalParagraphs: chapters.reduce((s, c) => s + c.totalParagraphs, 0)
        } as SyllabusFieldNode;
    });

    _syllabusCache = tree;
    return tree;
}

export function getSyllabusTreeSync(): SyllabusFieldNode[] {
    return _syllabusCache || []; // Fallback if not loaded
}

// ─── CRUD Operations ────────────────────────────────────────────────

export async function fetchAllSyllabuses() {
    return fetchFromApi<any[]>('/syllabus');
}

export async function createSyllabus(name: string, type: 'PERSONAL' | 'ORGANIZATION', ownerId: string, gradeLevel?: string) {
    return postToApi('/syllabus', { name, type, ownerId, gradeLevel });
}

export async function importSyllabus(name: string, type: 'PERSONAL' | 'ORGANIZATION', tree: any[], ownerId: string) {
    return postToApi('/syllabus/import', { name, type, tree, ownerId });
}

export async function updateSyllabus(id: string, name: string, type?: 'PERSONAL' | 'ORGANIZATION', description?: string, gradeLevel?: string) {
    return fetch(`${API_URL}/syllabus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, description, gradeLevel })
    }).then(res => {
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    });
}

export async function deleteSyllabus(id: string) {
    const response = await fetch(`${API_URL}/syllabus/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
}

export async function createNode(
    syllabusId: string,
    parentId: string | null,
    title: string,
    type: 'FIELD' | 'CHAPTER' | 'SECTION' | 'PARAGRAPH' | 'EXERCISE_TYPE' | 'CONTENT_ITEM',
    contentType?: 'THEORY' | 'METHODOLOGY',
    prerequisites?: string
) {
    return postToApi('/syllabus-node', {
        syllabusId,
        parentId,
        title,
        type,
        contentType,
        prerequisites
    });
}

export async function updateNode(nodeId: string, title: string, contentType?: 'THEORY' | 'METHODOLOGY', prerequisites?: string) {
    return fetch(`${API_URL}/syllabus-node/${nodeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, contentType, prerequisites })
    }).then(res => {
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    });
}

export async function fetchNodePrerequisites(nodeIds: string[]) {
    return postToApi('/syllabus/prerequisites', { nodeIds });
}

export async function deleteNode(nodeId: string) {
    const response = await fetch(`${API_URL}/syllabus-node/${nodeId}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
}

// ─── Exercise Types ─────────────────────────────────────────────────

export interface ExerciseType {
    id: string;
    name: string;
    description?: string;
    isSystem: boolean;
}

export async function getExerciseTypes() {
    return fetchFromApi<ExerciseType[]>('/exercise-type');
}

export async function createExerciseType(name: string) {
    return postToApi<ExerciseType>('/exercise-type', { name });
}

export async function deleteExerciseType(id: string) {
    const response = await fetch(`${API_URL}/exercise-type/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
}


// ─── Legacy/Compatibility Shims (for existing UI) ───────────────────

export function getFields(): SyllabusField[] {
    return _syllabusCache?.map(f => ({ Id: f.Id, Name: f.Name, Description: f.Description })) || [];
}

export function searchSections(query: string): SyllabusSectionNode[] {
    if (!_syllabusCache || !query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const results: SyllabusSectionNode[] = [];

    for (const field of _syllabusCache) {
        for (const chapter of field.chapters) {
            for (const section of chapter.sections) {
                if (section.Name.toLowerCase().includes(lowerQuery)) {
                    results.push(section);
                }
            }
        }
    }
    return results;
}

export function getSyllabusStats() {
    if (!_syllabusCache) return { fields: 0, chapters: 0, sections: 0, paragraphs: 0 };
    return {
        fields: _syllabusCache.length,
        chapters: _syllabusCache.reduce((s, f) => s + f.totalChapters, 0),
        sections: _syllabusCache.reduce((s, f) => s + f.totalSections, 0),
        paragraphs: _syllabusCache.reduce((s, f) => s + f.totalParagraphs, 0),
    };
}

