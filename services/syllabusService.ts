import type {
    SyllabusField,
    SyllabusChapter,
    SyllabusSection,
    SyllabusExerciseType,
    SectionExerciseMapping,
    SyllabusFieldNode,
    SyllabusChapterNode,
    SyllabusSectionNode,
} from '../types';

// ─── Raw JSON Imports ───────────────────────────────────────────────

import fieldsData from '../database/Fields.json';
import chaptersData from '../database/Chapters.json';
import sectionsData from '../database/Sections.json';
import exerciseTypesData from '../database/Exercise_Types.json';
import sectionExercisesData from '../database/Sections_Exercises.json';

// ─── Typed Data ─────────────────────────────────────────────────────

const fields: SyllabusField[] = fieldsData as SyllabusField[];
const chapters: SyllabusChapter[] = chaptersData as SyllabusChapter[];
const sections: SyllabusSection[] = sectionsData as SyllabusSection[];
const exerciseTypes: SyllabusExerciseType[] = exerciseTypesData as SyllabusExerciseType[];
const sectionExercises: SectionExerciseMapping[] = sectionExercisesData as SectionExerciseMapping[];

// ─── Lookup Maps (computed once) ────────────────────────────────────

const exerciseTypeMap = new Map<string, SyllabusExerciseType>(
    exerciseTypes.map(et => [et.Id, et])
);

// Section ID → Exercise Type IDs
const sectionToExerciseIds = new Map<string, Set<string>>();
for (const mapping of sectionExercises) {
    if (!sectionToExerciseIds.has(mapping.Section_Id)) {
        sectionToExerciseIds.set(mapping.Section_Id, new Set());
    }
    sectionToExerciseIds.get(mapping.Section_Id)!.add(mapping.Exercise_Id);
}

// ─── Tree Builder ───────────────────────────────────────────────────

function buildSectionNode(section: SyllabusSection): SyllabusSectionNode {
    const exerciseIds = sectionToExerciseIds.get(section.Id) ?? new Set<string>();
    const types: SyllabusExerciseType[] = [];
    for (const id of exerciseIds) {
        const et = exerciseTypeMap.get(id);
        if (et) types.push(et);
    }
    return {
        ...section,
        exerciseTypes: types.sort((a, b) => a.Name.localeCompare(b.Name, 'el')),
        exerciseCount: types.length,
    };
}

function buildChapterNode(chapter: SyllabusChapter): SyllabusChapterNode {
    const chapterSections = sections
        .filter(s => s.Chapter === chapter.Id)
        .map(buildSectionNode)
        .sort((a, b) => a.Name.localeCompare(b.Name, 'el'));

    return {
        ...chapter,
        sections: chapterSections,
        totalExercises: chapterSections.reduce((sum, s) => sum + s.exerciseCount, 0),
    };
}

function buildFieldNode(field: SyllabusField): SyllabusFieldNode {
    const fieldChapters = chapters
        .filter(c => c.Field === field.Id)
        .map(buildChapterNode)
        .sort((a, b) => a.Name.localeCompare(b.Name, 'el'));

    const totalSections = fieldChapters.reduce((sum, c) => sum + c.sections.length, 0);
    const totalExercises = fieldChapters.reduce((sum, c) => sum + c.totalExercises, 0);

    return {
        ...field,
        chapters: fieldChapters,
        totalChapters: fieldChapters.length,
        totalSections,
        totalExercises,
    };
}

// ─── Public API ─────────────────────────────────────────────────────

let _syllabusTree: SyllabusFieldNode[] | null = null;

/** Full syllabus tree: Field[] → Chapter[] → Section[] → ExerciseType[] */
export function getSyllabusTree(): SyllabusFieldNode[] {
    if (!_syllabusTree) {
        _syllabusTree = fields.map(buildFieldNode);
    }
    return _syllabusTree;
}

/** All fields */
export function getFields(): SyllabusField[] {
    return fields;
}

/** Chapters belonging to a specific field */
export function getChaptersByField(fieldId: string): SyllabusChapterNode[] {
    const tree = getSyllabusTree();
    return tree.find(f => f.Id === fieldId)?.chapters ?? [];
}

/** Sections belonging to a specific chapter */
export function getSectionsByChapter(chapterId: string): SyllabusSectionNode[] {
    const tree = getSyllabusTree();
    for (const field of tree) {
        const chapter = field.chapters.find(c => c.Id === chapterId);
        if (chapter) return chapter.sections;
    }
    return [];
}

/** Exercise types for a specific section */
export function getExercisesBySection(sectionId: string): SyllabusExerciseType[] {
    const tree = getSyllabusTree();
    for (const field of tree) {
        for (const chapter of field.chapters) {
            const section = chapter.sections.find(s => s.Id === sectionId);
            if (section) return section.exerciseTypes;
        }
    }
    return [];
}

/** Search sections by name (Greek-aware) */
export function searchSections(query: string): SyllabusSectionNode[] {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const tree = getSyllabusTree();
    const results: SyllabusSectionNode[] = [];
    for (const field of tree) {
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

/** Get summary stats */
export function getSyllabusStats() {
    const tree = getSyllabusTree();
    return {
        fields: tree.length,
        chapters: tree.reduce((s, f) => s + f.totalChapters, 0),
        sections: tree.reduce((s, f) => s + f.totalSections, 0),
        exerciseTypes: exerciseTypes.length,
    };
}
