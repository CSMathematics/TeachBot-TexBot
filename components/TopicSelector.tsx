import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Select, Label } from './ui';
import { SyllabusFieldNode, SyllabusChapterNode, SyllabusSectionNode, SyllabusParagraphNode } from '../types';
import { ChevronRight, ChevronDown, Check, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopicSelectorProps {
    value: string;
    onChange: (value: string) => void;
    onGradeLevelChange?: (gradeLevel: string) => void;
    onSelectedIdsChange?: (ids: string[]) => void;
    className?: string;
    compact?: boolean;
}

// ─── Selection helpers ──────────────────────────────────────────────

/** Collect all selectable IDs under a field */
function getAllIds(field: SyllabusFieldNode): string[] {
    const ids: string[] = [];
    for (const ch of field.chapters) {
        ids.push(ch.Id);
        for (const sec of ch.sections) {
            ids.push(sec.Id);
            for (const par of sec.paragraphs || []) {
                ids.push(par.Id);
            }
        }
    }
    return ids;
}

function getChapterIds(chapter: SyllabusChapterNode): string[] {
    const ids: string[] = [chapter.Id];
    for (const sec of chapter.sections) {
        ids.push(sec.Id);
        for (const par of sec.paragraphs || []) {
            ids.push(par.Id);
        }
    }
    return ids;
}

function getSectionIds(section: SyllabusSectionNode): string[] {
    const ids: string[] = [section.Id];
    for (const par of section.paragraphs || []) {
        ids.push(par.Id);
    }
    return ids;
}

// Check state: 'none' | 'some' | 'all'
type CheckState = 'none' | 'some' | 'all';

function getCheckState(childIds: string[], selected: Set<string>): CheckState {
    if (childIds.length === 0) return 'none';
    const count = childIds.filter(id => selected.has(id)).length;
    if (count === 0) return 'none';
    if (count === childIds.length) return 'all';
    return 'some';
}

// ─── Checkbox Component ─────────────────────────────────────────────

const TreeCheckbox: React.FC<{
    state: CheckState;
    onChange: () => void;
    className?: string;
}> = ({ state, onChange, className }) => (
    <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className={cn(
            "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
            state === 'all' ? "bg-primary border-primary text-primary-foreground" :
                state === 'some' ? "bg-primary/50 border-primary text-primary-foreground" :
                    "border-border hover:border-primary/50 bg-background",
            className
        )}
    >
        {state === 'all' && <Check className="w-3 h-3" />}
        {state === 'some' && <Minus className="w-3 h-3" />}
    </button>
);

// ─── Main Component ─────────────────────────────────────────────────

const TopicSelector: React.FC<TopicSelectorProps> = ({ value, onChange, onGradeLevelChange, onSelectedIdsChange, className, compact = false }) => {
    const [syllabuses, setSyllabuses] = useState<{ id: string, name: string, gradeLevel?: string }[]>([]);
    const [tree, setTree] = useState<SyllabusFieldNode[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedSyllabusId, setSelectedSyllabusId] = useState<string>('');
    const [selectedFieldId, setSelectedFieldId] = useState<string>('');

    // Multi-selection state: Set of selected node IDs (chapters, sections, paragraphs)
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // Notify parent when selected node IDs change
    useEffect(() => {
        if (onSelectedIdsChange) {
            onSelectedIdsChange(Array.from(selected));
        }
    }, [selected, onSelectedIdsChange]);

    // Expanded state for tree nodes
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Load syllabuses
    useEffect(() => {
        const load = async () => {
            try {
                const { fetchAllSyllabuses } = await import('../services/syllabusService');
                const list = await fetchAllSyllabuses();
                setSyllabuses(list);
            } catch (err) {
                console.error("TopicSelector failed to load syllabuses:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Load tree when syllabus changes
    useEffect(() => {
        if (!selectedSyllabusId) { setTree([]); return; }
        const loadTree = async () => {
            try {
                const { fetchSyllabusTree } = await import('../services/syllabusService');
                const data = await fetchSyllabusTree(selectedSyllabusId);
                setTree(data);
            } catch (err) {
                console.error("Failed to load tree:", err);
            }
        };
        loadTree();
    }, [selectedSyllabusId]);

    // Active field
    const activeField = useMemo(() =>
        tree.find(f => f.Id === selectedFieldId),
        [tree, selectedFieldId]);

    // Build topic string from selection and notify parent
    const buildTopicString = useCallback(() => {
        if (!activeField || selected.size === 0) return '';

        const parts: string[] = [];

        for (const chapter of activeField.chapters) {
            // Check if any descendant is selected
            const selectedSections: string[] = [];

            for (const section of chapter.sections) {
                const selectedParagraphs = (section.paragraphs || [])
                    .filter(p => selected.has(p.Id))
                    .map(p => p.Name);

                if (selected.has(section.Id)) {
                    if (selectedParagraphs.length > 0 && selectedParagraphs.length < (section.paragraphs?.length || 0)) {
                        // Partial paragraph selection
                        selectedSections.push(`${section.Name} (${selectedParagraphs.join(', ')})`);
                    } else {
                        selectedSections.push(section.Name);
                    }
                } else if (selectedParagraphs.length > 0) {
                    selectedSections.push(`${section.Name} (${selectedParagraphs.join(', ')})`);
                }
            }

            if (selected.has(chapter.Id) && selectedSections.length === 0) {
                // Entire chapter selected
                parts.push(chapter.Name);
            } else if (selectedSections.length > 0) {
                parts.push(`${chapter.Name}: ${selectedSections.join('; ')}`);
            }
        }

        return `${activeField.Name} → ${parts.join(' | ')}`;
    }, [activeField, selected]);

    // Sync topic string to parent
    useEffect(() => {
        const topicStr = buildTopicString();
        if (topicStr && value !== topicStr) {
            onChange(topicStr);
        }
    }, [buildTopicString, value, onChange]);

    // Toggle helpers
    const toggleIds = useCallback((ids: string[]) => {
        setSelected(prev => {
            const next = new Set(prev);
            const allSelected = ids.every(id => next.has(id));
            if (allSelected) {
                ids.forEach(id => next.delete(id));
            } else {
                ids.forEach(id => next.add(id));
            }
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        if (!activeField) return;
        const allIds = getAllIds(activeField);
        toggleIds(allIds);
    }, [activeField, toggleIds]);

    // Stats
    const selectionStats = useMemo(() => {
        if (!activeField) return { chapters: 0, sections: 0, paragraphs: 0 };
        let chapters = 0, sections = 0, paragraphs = 0;
        for (const ch of activeField.chapters) {
            if (selected.has(ch.Id)) chapters++;
            for (const sec of ch.sections) {
                if (selected.has(sec.Id)) sections++;
                for (const par of sec.paragraphs || []) {
                    if (selected.has(par.Id)) paragraphs++;
                }
            }
        }
        return { chapters, sections, paragraphs };
    }, [activeField, selected]);

    const totalSelected = selectionStats.chapters + selectionStats.sections + selectionStats.paragraphs;

    return (
        <div className={cn(compact ? 'space-y-2' : 'space-y-3', className)}>
            <div className={compact ? 'grid gap-2' : 'grid gap-3'}>
                {/* Syllabus Select */}
                <div>
                    <Label className={cn('text-muted-foreground mb-1 block', compact ? 'text-[10px]' : 'text-xs')}>Πρόγραμμα Σπουδών</Label>
                    <Select
                        value={selectedSyllabusId}
                        onChange={(e) => {
                            setSelectedSyllabusId(e.target.value);
                            setSelectedFieldId('');
                            setSelected(new Set());
                            // Emit gradeLevel from selected syllabus
                            const syl = syllabuses.find(s => s.id === e.target.value);
                            if (syl?.gradeLevel && onGradeLevelChange) {
                                onGradeLevelChange(syl.gradeLevel);
                            }
                        }}
                    >
                        <option value="" disabled>Επιλέξτε Ύλη</option>
                        {syllabuses.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </Select>
                </div>

                {/* Field Select */}
                <div>
                    <Label className={cn('text-muted-foreground mb-1 block', compact ? 'text-[10px]' : 'text-xs')}>Πεδίο</Label>
                    <Select
                        value={selectedFieldId}
                        onChange={(e) => {
                            setSelectedFieldId(e.target.value);
                            setSelected(new Set());
                            setExpandedChapters(new Set());
                            setExpandedSections(new Set());
                        }}
                        disabled={!selectedSyllabusId}
                    >
                        <option value="" disabled>Επιλέξτε Πεδίο</option>
                        {tree.map(field => (
                            <option key={field.Id} value={field.Id}>{field.Name}</option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* Checkbox Tree */}
            {activeField && (
                <div className="border border-border rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-secondary/30 border-b border-border">
                        <span className="text-xs font-medium text-muted-foreground">
                            Επιλέξτε Κεφάλαια & Ενότητες
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!activeField) return;
                                    const allChapterIds = new Set(activeField.chapters.map(c => c.Id));
                                    const allSectionIds = new Set(activeField.chapters.flatMap(c => c.sections.map(s => s.Id)));
                                    const allExpanded = activeField.chapters.every(c => expandedChapters.has(c.Id));
                                    if (allExpanded) {
                                        setExpandedChapters(new Set());
                                        setExpandedSections(new Set());
                                    } else {
                                        setExpandedChapters(allChapterIds);
                                        setExpandedSections(allSectionIds);
                                    }
                                }}
                                className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {activeField.chapters.every(c => expandedChapters.has(c.Id)) ? 'Σύμπτυξη' : 'Ανάπτυξη'}
                            </button>
                            <span className="text-border">|</span>
                            <button
                                type="button"
                                onClick={toggleSelectAll}
                                className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                {totalSelected > 0 ? 'Αποεπιλογή Όλων' : 'Επιλογή Όλων'}
                            </button>
                        </div>
                    </div>

                    {/* Tree */}
                    <div className={compact ? 'max-h-[180px] overflow-y-auto' : 'max-h-[280px] overflow-y-auto'}>
                        {activeField.chapters.map(chapter => {
                            const chapterIds = getChapterIds(chapter);
                            const chapterState = getCheckState(chapterIds, selected);
                            const isExpanded = expandedChapters.has(chapter.Id);

                            return (
                                <div key={chapter.Id} className="border-b border-border/50 last:border-0">
                                    {/* Chapter row */}
                                    <div className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/20 transition-colors">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedChapters(prev => {
                                                const next = new Set(prev);
                                                next.has(chapter.Id) ? next.delete(chapter.Id) : next.add(chapter.Id);
                                                return next;
                                            })}
                                            className="p-0.5 rounded hover:bg-secondary text-muted-foreground"
                                        >
                                            {isExpanded
                                                ? <ChevronDown className="w-3.5 h-3.5" />
                                                : <ChevronRight className="w-3.5 h-3.5" />
                                            }
                                        </button>
                                        <TreeCheckbox
                                            state={chapterState}
                                            onChange={() => toggleIds(chapterIds)}
                                        />
                                        <span
                                            className="text-sm font-medium flex-1 cursor-pointer"
                                            onClick={() => setExpandedChapters(prev => {
                                                const next = new Set(prev);
                                                next.has(chapter.Id) ? next.delete(chapter.Id) : next.add(chapter.Id);
                                                return next;
                                            })}
                                        >
                                            {chapter.Name}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {chapter.sections.length} εν.
                                        </span>
                                    </div>

                                    {/* Sections */}
                                    {isExpanded && chapter.sections.map(section => {
                                        const sectionIds = getSectionIds(section);
                                        const sectionState = getCheckState(sectionIds, selected);
                                        const isSectionExpanded = expandedSections.has(section.Id);
                                        const hasParagraphs = (section.paragraphs?.length || 0) > 0;

                                        return (
                                            <div key={section.Id}>
                                                <div className="flex items-center gap-2 pl-8 pr-3 py-1.5 hover:bg-secondary/20 transition-colors">
                                                    {hasParagraphs ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpandedSections(prev => {
                                                                const next = new Set(prev);
                                                                next.has(section.Id) ? next.delete(section.Id) : next.add(section.Id);
                                                                return next;
                                                            })}
                                                            className="p-0.5 rounded hover:bg-secondary text-muted-foreground"
                                                        >
                                                            {isSectionExpanded
                                                                ? <ChevronDown className="w-3 h-3" />
                                                                : <ChevronRight className="w-3 h-3" />
                                                            }
                                                        </button>
                                                    ) : (
                                                        <div className="w-4" />
                                                    )}
                                                    <TreeCheckbox
                                                        state={sectionState}
                                                        onChange={() => toggleIds(sectionIds)}
                                                    />
                                                    <span
                                                        className="text-sm flex-1 cursor-pointer text-foreground/80"
                                                        onClick={() => hasParagraphs && setExpandedSections(prev => {
                                                            const next = new Set(prev);
                                                            next.has(section.Id) ? next.delete(section.Id) : next.add(section.Id);
                                                            return next;
                                                        })}
                                                    >
                                                        {section.Name}
                                                    </span>
                                                    {hasParagraphs && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {section.paragraphs!.length} παρ.
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Paragraphs */}
                                                {isSectionExpanded && section.paragraphs?.map(paragraph => (
                                                    <div
                                                        key={paragraph.Id}
                                                        className="flex items-center gap-2 pl-14 pr-3 py-1 hover:bg-secondary/20 transition-colors"
                                                    >
                                                        <TreeCheckbox
                                                            state={selected.has(paragraph.Id) ? 'all' : 'none'}
                                                            onChange={() => toggleIds([paragraph.Id])}
                                                        />
                                                        <span className="text-xs text-foreground/70 flex-1">
                                                            {paragraph.Name}
                                                        </span>
                                                        {paragraph.contentType && (
                                                            <span className={cn(
                                                                "text-[9px] px-1 py-0.5 rounded border uppercase",
                                                                paragraph.contentType === 'METHODOLOGY'
                                                                    ? "border-amber-200 text-amber-600 bg-amber-50/50"
                                                                    : "border-blue-200 text-blue-600 bg-blue-50/50"
                                                            )}>
                                                                {paragraph.contentType === 'METHODOLOGY' ? 'ΜΘΔ' : 'ΘΡ'}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}

                        {activeField.chapters.length === 0 && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                Δεν υπάρχουν κεφάλαια σε αυτό το πεδίο.
                            </div>
                        )}
                    </div>

                    {/* Summary bar */}
                    {totalSelected > 0 && (
                        <div className="px-3 py-2 bg-primary/5 border-t border-border flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1.5 text-primary font-medium">
                                <Check className="w-3.5 h-3.5" />
                                Επιλεγμένα:
                            </div>
                            <div className="flex gap-3 text-muted-foreground">
                                {selectionStats.chapters > 0 && (
                                    <span>{selectionStats.chapters} κεφ.</span>
                                )}
                                {selectionStats.sections > 0 && (
                                    <span>{selectionStats.sections} εν.</span>
                                )}
                                {selectionStats.paragraphs > 0 && (
                                    <span>{selectionStats.paragraphs} παρ.</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TopicSelector;
