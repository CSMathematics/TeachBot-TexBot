import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Trash2, Pencil, ChevronRight, ChevronDown, LayoutGrid, BookOpen, Layers, Menu, Loader2, List,
    Search, Hash, Library, BarChart3, FileText, Grid3X3, AlertTriangle, Info,
    Ruler, Compass, TrendingUp, Dice5, PieChart
} from 'lucide-react';
import { Card, CardContent, Badge } from '../components/ui';
import { cn } from '../lib/utils';
import { getSyllabusStats, searchSections } from '../services/syllabusService';
import type { SyllabusFieldNode, SyllabusChapterNode, SyllabusSectionNode, SyllabusParagraphNode } from '../types';
import AddNodeDialog from '../components/AddNodeDialog';
import EditNodeDialog from '../components/EditNodeDialog';
import { ExerciseTypeManager } from '../components/ExerciseTypeManager';
import ParagraphContentManager from '../components/ParagraphContentManager';

// ─── Field Colors ───────────────────────────────────────────────────

const FIELD_COLORS: Record<string, { bg: string; text: string; accent: string; icon: React.ReactNode; border: string }> = {
    Algebra: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', accent: 'bg-blue-500', icon: <Ruler className="w-7 h-7" />, border: 'border-blue-500/20' },
    Geometria: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', accent: 'bg-emerald-500', icon: <Compass className="w-7 h-7" />, border: 'border-emerald-500/20' },
    Analysh: { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', accent: 'bg-violet-500', icon: <TrendingUp className="w-7 h-7" />, border: 'border-violet-500/20' },
    Pithanothtes: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', accent: 'bg-amber-500', icon: <Dice5 className="w-7 h-7" />, border: 'border-amber-500/20' },
    Statistikh: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', accent: 'bg-rose-500', icon: <PieChart className="w-7 h-7" />, border: 'border-rose-500/20' },
};

const getFieldColor = (fieldId: string) => FIELD_COLORS[fieldId] ?? FIELD_COLORS.Algebra;

// ─── Component ──────────────────────────────────────────────────────

const Curriculum: React.FC = () => {
    const navigate = useNavigate();
    const [syllabuses, setSyllabuses] = useState<{ id: string, name: string }[]>([]);
    const [selectedSyllabusId, setSelectedSyllabusId] = useState<string | null>(null);
    const [tree, setTree] = useState<SyllabusFieldNode[]>([]);
    const [stats, setStats] = useState({ fields: 0, chapters: 0, sections: 0, paragraphs: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog State
    const [addingNode, setAddingNode] = useState<{ type: 'FIELD' | 'CHAPTER' | 'SECTION' | 'PARAGRAPH', parentId: string | null } | null>(null);
    const [editingNode, setEditingNode] = useState<{ id: string, title: string, type: 'FIELD' | 'CHAPTER' | 'SECTION' | 'PARAGRAPH', contentType?: 'THEORY' | 'METHODOLOGY', prerequisites?: string } | null>(null);
    const [managingParagraph, setManagingParagraph] = useState<SyllabusParagraphNode | null>(null);

    const refreshTree = async () => {
        if (!selectedSyllabusId) return;
        try {
            const { fetchSyllabusTree, getSyllabusStats } = await import('../services/syllabusService');
            const data = await fetchSyllabusTree(selectedSyllabusId);
            setTree(data);
            setStats(getSyllabusStats());
        } catch (err) {
            console.error("Failed to refresh tree:", err);
        }
    };

    const handleDelete = async (id: string, type: string) => {
        if (!window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το ${type}; Θα διαγραφούν και όλα τα περιεχόμενά του.`)) {
            return;
        }

        try {
            const { deleteNode } = await import('../services/syllabusService');
            await deleteNode(id);
            refreshTree();
            // If we deleted the selected field, deselect it
            if (id === selectedField) setSelectedField(null);
        } catch (err) {
            console.error("Failed to delete node:", err);
            alert("Σφάλμα κατά τη διαγραφή.");
        }
    };

    // Initial Load: Fetch Syllabuses
    useEffect(() => {
        const loadSyllabuses = async () => {
            try {
                const { fetchAllSyllabuses } = await import('../services/syllabusService');
                const list = await fetchAllSyllabuses();
                setSyllabuses(list);

                if (list.length > 0) {
                    // Default to the last created/modified or first one
                    // For now, first one.
                    setSelectedSyllabusId(list[0].id);
                } else {
                    setLoading(false); // Stop loading if empty
                }
            } catch (err) {
                console.error("Failed to load syllabuses:", err);
                setError("Failed to load syllabuses.");
                setLoading(false);
            }
        };
        loadSyllabuses();
    }, []);

    // Load Tree when Syllabus changes
    useEffect(() => {
        if (!selectedSyllabusId) return;

        const loadTree = async () => {
            setLoading(true);
            try {
                const { fetchSyllabusTree, getSyllabusStats } = await import('../services/syllabusService');
                const data = await fetchSyllabusTree(selectedSyllabusId);
                setTree(data);
                setStats(getSyllabusStats());
            } catch (err) {
                console.error("Failed to load tree:", err);
                setError("Failed to load syllabus content.");
            } finally {
                setLoading(false);
            }
        };
        loadTree();
    }, [selectedSyllabusId]);

    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    // ... (Search results & Toggles remain same) ...
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return null;
        return searchSections(searchQuery);
    }, [searchQuery]);

    const toggleChapter = (id: string) => {
        setExpandedChapters(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSection = (id: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const activeField = tree.find(f => f.Id === selectedField);

    if (loading && !tree.length && !syllabuses.length) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Φόρτωση...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4 text-destructive">
                <AlertTriangle className="w-8 h-8" />
                <p className="font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Ύλη Μαθηματικών</h1>

                    {/* Syllabus Selector */}
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedSyllabusId || ''}
                            onChange={(e) => setSelectedSyllabusId(e.target.value)}
                            className="bg-transparent border border-border rounded-md px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                            disabled={loading || syllabuses.length === 0}
                        >
                            {syllabuses.length === 0 && <option>Δημιουργήστε Ύλη...</option>}
                            {syllabuses.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <span className="text-muted-foreground text-xs hidden sm:inline-block">
                            · {stats.fields} πεδία · {stats.chapters} κεφάλαια
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/curriculum/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                    <BookOpen className="w-4 h-4" />
                    Νέα Ύλη
                </button>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Πεδία', value: stats.fields, icon: <Grid3X3 className="w-5 h-5" />, color: 'text-blue-500 bg-blue-500/10' },
                    { label: 'Κεφάλαια', value: stats.chapters, icon: <BookOpen className="w-5 h-5" />, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Ενότητες', value: stats.sections, icon: <Layers className="w-5 h-5" />, color: 'text-violet-500 bg-violet-500/10' },
                    { label: 'Παράγραφοι', value: stats.paragraphs, icon: <FileText className="w-5 h-5" />, color: 'text-amber-500 bg-amber-500/10' },
                ].map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={cn("p-2.5 rounded-xl", s.color)}>{s.icon}</div>
                            <div>
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Αναζήτηση ενότητας... (π.χ. Παράγωγος, Τρίγωνα)"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
            </div>

            {/* Search Results */}
            {searchResults && (
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm font-semibold mb-3">
                            <Search className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                            {searchResults.length} αποτελέσματα για "{searchQuery}"
                        </p>
                        {searchResults.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Δεν βρέθηκαν ενότητες.</p>
                        ) : (
                            <div className="space-y-1">
                                {searchResults.slice(0, 20).map(section => (
                                    <div key={section.Id} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary/50 transition-colors">
                                        <Hash className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                        <span className="text-sm">{section.Name}</span>
                                        <Badge variant="outline" className="text-[9px] ml-auto">
                                            {section.exerciseCount} τύποι
                                        </Badge>
                                    </div>
                                ))}
                                {searchResults.length > 20 && (
                                    <p className="text-xs text-muted-foreground px-3 pt-2">
                                        ...και {searchResults.length - 20} ακόμα
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Field Cards */}
            {!searchResults && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {/* Add Field Button */}
                    <button
                        onClick={() => setAddingNode({ type: 'FIELD', parentId: null })}
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-5 hover:border-primary/50 hover:bg-secondary/50 transition-all min-h-[140px]"
                    >
                        <div className="p-3 rounded-full bg-secondary text-primary">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-sm text-muted-foreground">Προσθήκη Πεδίου</span>
                    </button>

                    {tree.map(field => {
                        const colors = getFieldColor(field.Id);
                        const isSelected = selectedField === field.Id;

                        return (
                            <button
                                key={field.Id}
                                onClick={() => setSelectedField(isSelected ? null : field.Id)}
                                className={cn(
                                    "text-left rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-md group relative",
                                    isSelected
                                        ? `${colors.border} ${colors.bg} shadow - md ring - 2 ring - offset - 2 ring - offset - background`
                                        : "border-border hover:border-primary/30"
                                )}
                                style={isSelected ? { '--tw-ring-color': `hsl(var(--primary) / 0.3)` } as React.CSSProperties : undefined}
                            >
                                <div className={cn("p-2.5 rounded-xl mb-3", colors.bg, colors.text)}>{colors.icon}</div>
                                <h3 className="font-bold text-sm mt-1">{field.Name}</h3>
                                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                    <p>{field.totalChapters} κεφάλαια</p>
                                    <p>{field.totalSections} ενότητες</p>
                                    <p>{field.totalParagraphs} παράγραφοι</p>
                                </div>

                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingNode({ id: field.Id, title: field.Name, type: 'FIELD' }); }}
                                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary"
                                        title="Επεξεργασία"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(field.Id, 'πεδίο'); }}
                                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                        title="Διαγραφή"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {isSelected && (
                                    <div className={cn("mt-3 h-1 rounded-full", colors.accent)} />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Chapters & Sections for selected field */}
            {activeField && !searchResults && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2.5 rounded-xl", getFieldColor(activeField.Id).bg, getFieldColor(activeField.Id).text)}>{getFieldColor(activeField.Id).icon}</div>
                            <div>
                                <h2 className="text-xl font-bold">{activeField.Name}</h2>
                                <p className="text-xs text-muted-foreground">
                                    {activeField.totalChapters} κεφάλαια · {activeField.totalSections} ενότητες · {activeField.totalParagraphs} παράγραφοι
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAddingNode({ type: 'CHAPTER', parentId: activeField.Id })}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Νέο Κεφάλαιο
                        </button>
                    </div>

                    {activeField.chapters.map(chapter => (
                        <ChapterAccordion
                            key={chapter.Id}
                            chapter={chapter}
                            fieldId={activeField.Id}
                            isExpanded={expandedChapters.has(chapter.Id)}
                            onToggle={() => toggleChapter(chapter.Id)}
                            onAddSection={() => setAddingNode({ type: 'SECTION', parentId: chapter.Id })}
                            onEdit={() => setEditingNode({ id: chapter.Id, title: chapter.Name, type: 'CHAPTER', prerequisites: chapter.prerequisites })}
                            onDelete={() => handleDelete(chapter.Id, 'κεφάλαιο')}
                            onEditSection={(id, title, prerequisites) => setEditingNode({ id, title, type: 'SECTION', prerequisites })}
                            onDeleteSection={(id) => handleDelete(id, 'ενότητα')}
                            onAddParagraph={(sectionId) => setAddingNode({ type: 'PARAGRAPH', parentId: sectionId })}
                            onEditParagraph={(id, title, contentType) => setEditingNode({ id, title, contentType, type: 'PARAGRAPH' })}
                            onDeleteParagraph={(id) => handleDelete(id, 'παράγραφο')}
                            onManageParagraph={(paragraph) => setManagingParagraph(paragraph)}
                        />
                    ))}

                    {activeField.chapters.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <p>Δεν υπάρχουν κεφάλαια ακόμα.</p>
                            <button
                                onClick={() => setAddingNode({ type: 'CHAPTER', parentId: activeField.Id })}
                                className="text-primary hover:underline mt-1 text-sm"
                            >
                                Προσθέστε το πρώτο
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Prompt to select field */}
            {!selectedField && !searchResults && (
                <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <Library className="w-8 h-8 mx-auto mb-3 opacity-40" />
                        <p className="text-sm">Επιλέξτε ένα πεδίο για να δείτε τα κεφάλαια και τις ενότητες</p>
                    </CardContent>
                </Card>
            )}
            {/* Exercise Types Manager (Global) */}
            {selectedSyllabusId && (
                <div className="mt-8 border-t pt-8">
                    <ExerciseTypeManager />
                </div>
            )}

            {/* Dialogs */}
            {selectedSyllabusId && managingParagraph && (
                <ParagraphContentManager
                    isOpen={!!managingParagraph}
                    onClose={() => setManagingParagraph(null)}
                    paragraphId={managingParagraph.Id}
                    paragraphTitle={managingParagraph.Name}
                    paragraphType={managingParagraph.contentType}
                    syllabusId={selectedSyllabusId}
                    existingContent={managingParagraph.contentItems || []}
                    onUpdate={refreshTree}
                />
            )}

            {selectedSyllabusId && addingNode && (
                <AddNodeDialog
                    isOpen={!!addingNode}
                    onClose={() => setAddingNode(null)}
                    type={addingNode.type}
                    parentId={addingNode.parentId}
                    syllabusId={selectedSyllabusId}
                    onSuccess={refreshTree}
                />
            )}
            {editingNode && (
                <EditNodeDialog
                    isOpen={!!editingNode}
                    onClose={() => setEditingNode(null)}
                    nodeId={editingNode.id}
                    currentTitle={editingNode.title}
                    currentContentType={editingNode.contentType}
                    currentPrerequisites={editingNode.prerequisites}
                    type={editingNode.type}
                    onSuccess={refreshTree}
                />
            )}
        </div>
    );
};

// ─── Chapter Accordion ──────────────────────────────────────────────

interface ChapterAccordionProps {
    chapter: SyllabusChapterNode;
    fieldId: string;
    isExpanded: boolean;
    onToggle: () => void;
    onAddSection: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onEditSection: (id: string, title: string, prerequisites?: string) => void;
    onDeleteSection: (id: string) => void;
    onAddParagraph: (sectionId: string) => void;
    onEditParagraph: (id: string, title: string, contentType?: 'THEORY' | 'METHODOLOGY') => void;
    onDeleteParagraph: (id: string) => void;
    onManageParagraph: (paragraph: SyllabusParagraphNode) => void;
}

const ChapterAccordion: React.FC<ChapterAccordionProps> = ({
    chapter, fieldId, isExpanded, onToggle, onAddSection,
    onEdit, onDelete, onEditSection, onDeleteSection,
    onAddParagraph, onEditParagraph, onDeleteParagraph, onManageParagraph
}) => {
    const colors = getFieldColor(fieldId);

    return (
        <Card className="overflow-hidden">
            <div className="flex items-center justify-between p-2 pr-5 group">
                <button
                    onClick={onToggle}
                    className="flex-1 p-3 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left rounded-md"
                >
                    <div className={cn("p-2 rounded-lg", colors.bg, colors.text)}>
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            <span>{chapter.Name}</span>
                            {chapter.prerequisites && (
                                <span
                                    className="group/prereq relative inline-flex"
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    title="Προαπαιτούμενα"
                                    aria-label="Προαπαιτούμενα"
                                >
                                    <Info className="w-3.5 h-3.5 text-muted-foreground/70 hover:text-muted-foreground transition-colors" />
                                    <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-[360px] -translate-x-1/2 rounded-md border border-border bg-background p-2 shadow-lg group-hover/prereq:block">
                                        <div className="text-[10px] font-semibold text-muted-foreground mb-1">
                                            Προαπαιτούμενα
                                        </div>
                                        <div className="text-[11px] leading-relaxed text-foreground/90">
                                            {chapter.prerequisites}
                                        </div>
                                    </span>
                                </span>
                            )}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {chapter.sections.length} ενότητες · {chapter.totalParagraphs} παράγραφοι
                        </p>
                    </div>
                </button>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); onAddSection(); }}
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                        title="Προσθήκη Ενότητας"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                        {chapter.sections.length}
                    </Badge>
                    <button onClick={onToggle}>
                        {isExpanded
                            ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        }
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-border">
                    {chapter.sections.map(section => (
                        <SectionRow
                            key={section.Id}
                            section={section}
                            fieldId={fieldId}
                            onEdit={() => onEditSection(section.Id, section.Name, section.prerequisites)}
                            onDelete={() => onDeleteSection(section.Id)}
                            onAddParagraph={() => onAddParagraph(section.Id)}
                            onEditParagraph={onEditParagraph}
                            onDeleteParagraph={onDeleteParagraph}
                            onManageParagraph={onManageParagraph}
                        />
                    ))}
                </div>
            )}
        </Card>
    );
};

// ─── Section Row ────────────────────────────────────────────────────

interface SectionRowProps {
    section: SyllabusSectionNode;
    fieldId: string;
    onEdit: () => void;
    onDelete: () => void;
    onAddParagraph: () => void;
    onEditParagraph: (id: string, title: string, contentType?: 'THEORY' | 'METHODOLOGY') => void;
    onDeleteParagraph: (id: string) => void;
    onManageParagraph: (paragraph: SyllabusParagraphNode) => void;
}

const SectionRow: React.FC<SectionRowProps> = ({
    section, fieldId, onEdit, onDelete,
    onAddParagraph, onEditParagraph, onDeleteParagraph, onManageParagraph
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const colors = getFieldColor(fieldId);

    // Count paragraphs in section
    const totalParagraphs = section.paragraphs?.length || 0;

    return (
        <div className="border-b border-border last:border-0 group">
            <div
                role="button"
                tabIndex={0}
                onClick={() => setIsExpanded(!isExpanded)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        setIsExpanded(!isExpanded);
                    }
                }}
                className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-secondary/20 transition-colors text-left cursor-pointer"
            >
                <div className={cn("w-2 h-2 rounded-full shrink-0", colors.accent)} />
                <div className="flex-1 min-w-0">
                    <span className="text-sm flex items-center gap-2">
                        <span className="block">{section.Name}</span>
                        {section.prerequisites && (
                            <span
                                className="group/prereq relative inline-flex"
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                title="Προαπαιτούμενα"
                                aria-label="Προαπαιτούμενα"
                            >
                                <Info className="w-3 h-3 text-muted-foreground/70 hover:text-muted-foreground transition-colors" />
                                <span className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-[360px] rounded-md border border-border bg-background p-2 shadow-lg group-hover/prereq:block">
                                    <div className="text-[10px] font-semibold text-muted-foreground mb-1">
                                        Προαπαιτούμενα
                                    </div>
                                    <div className="text-[11px] leading-relaxed text-foreground/90">
                                        {section.prerequisites}
                                    </div>
                                </span>
                            </span>
                        )}
                    </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                    <div
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="p-1.5 rounded-md hover:bg-background text-muted-foreground hover:text-primary cursor-pointer"
                        title="Επεξεργασία"
                    >
                        <Pencil className="w-3 h-3" />
                    </div>
                    <div
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Διαγραφή"
                    >
                        <Trash2 className="w-3 h-3" />
                    </div>
                </div>

                <div
                    onClick={(e) => { e.stopPropagation(); onAddParagraph(); }}
                    className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors cursor-pointer mr-2 opacity-0 group-hover:opacity-100"
                    title="Προσθήκη Παραγράφου"
                >
                    <Plus className="w-3.5 h-3.5" />
                </div>

                <Badge variant="outline" className="text-[9px] shrink-0">
                    {totalParagraphs} παρ.
                </Badge>
                {totalParagraphs > 0 && (
                    isExpanded
                        ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                )}
            </div>

            {isExpanded && (
                <div className="px-8 pb-4 space-y-2">
                    {/* Paragraphs */}
                    {section.paragraphs?.map(paragraph => (
                        <ParagraphRow
                            key={paragraph.Id}
                            paragraph={paragraph}
                            fieldId={fieldId}
                            onEdit={() => onEditParagraph(paragraph.Id, paragraph.Name, paragraph.contentType)}
                            onDelete={() => onDeleteParagraph(paragraph.Id)}
                            onManageContent={() => onManageParagraph(paragraph)}
                        />
                    ))}

                    {/* Legacy Exercise Types (Direct Children) */}
                    {section.exerciseTypes?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {section.exerciseTypes.map(et => (
                                <span
                                    key={et.Id}
                                    className={cn(
                                        "inline-flex items-center px-2.5 py-1 rounded-md text-[11px]",
                                        colors.bg, colors.text
                                    )}
                                >
                                    {et.Name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


interface ParagraphRowProps {
    paragraph: import('../types').SyllabusParagraphNode;
    fieldId: string;
    onEdit: () => void;
    onDelete: () => void;
    onManageContent: () => void;
}

const ParagraphRow: React.FC<ParagraphRowProps> = ({ paragraph, fieldId, onEdit, onDelete, onManageContent }) => {
    const colors = getFieldColor(fieldId);
    const isMethodology = paragraph.contentType === 'METHODOLOGY';

    return (
        <div className="group/paragraph flex items-start gap-3 p-2 rounded-md hover:bg-secondary/30 transition-colors">
            <div className={cn(
                "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0",
                isMethodology ? "bg-amber-500" : "bg-blue-500" // Different colors for types
            )} />
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium opacity-90">{paragraph.Name}</span>
                        {/* Type Badge */}
                        <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider",
                            isMethodology
                                ? "border-amber-200 text-amber-700 bg-amber-50"
                                : "border-blue-200 text-blue-700 bg-blue-50"
                        )}>
                            {isMethodology ? 'ΜΕΘΟΔΟΛΟΓΙΑ' : 'ΘΕΩΡΙΑ'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/paragraph:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onManageContent(); }}
                            className="p-1 px-2 h-6 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded mr-1 flex items-center gap-1"
                            title="Διαχείριση Περιεχομένου"
                        >
                            <List className="w-3 h-3" /> Περιεχόμενο
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-1 rounded hover:bg-background text-muted-foreground hover:text-primary transition-colors"
                            title="Επεξεργασία"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Διαγραφή"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Paragraph is now a leaf node. Specific methods will be managed in a detail view later. */}
                {paragraph.exerciseTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 opacity-60">
                        {/* Displaying existing specific methods if any */}
                        {paragraph.exerciseTypes.map(et => (
                            <span
                                key={et.Id}
                                className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] border border-border",
                                    // Make them subtle as they are inside content
                                    "bg-background text-muted-foreground"
                                )}
                            >
                                {et.Name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Curriculum;
