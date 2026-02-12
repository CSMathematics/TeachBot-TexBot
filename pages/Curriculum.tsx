import React, { useState, useMemo } from 'react';
import {
    BookOpen, ChevronRight, ChevronDown, Search, Layers, Hash,
    Library, BarChart3, FileText, Grid3X3
} from 'lucide-react';
import { Card, CardContent, Badge } from '../components/ui';
import { cn } from '../lib/utils';
import { getSyllabusTree, getSyllabusStats, searchSections } from '../services/syllabusService';
import type { SyllabusFieldNode, SyllabusChapterNode, SyllabusSectionNode } from '../types';

// ─── Field Colors ───────────────────────────────────────────────────

const FIELD_COLORS: Record<string, { bg: string; text: string; accent: string; icon: string; border: string }> = {
    Algebra: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', accent: 'bg-blue-500', icon: '📐', border: 'border-blue-500/20' },
    Geometria: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', accent: 'bg-emerald-500', icon: '📏', border: 'border-emerald-500/20' },
    Analysh: { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', accent: 'bg-violet-500', icon: '📈', border: 'border-violet-500/20' },
    Pithanothtes: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', accent: 'bg-amber-500', icon: '🎲', border: 'border-amber-500/20' },
    Statistikh: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', accent: 'bg-rose-500', icon: '📊', border: 'border-rose-500/20' },
};

const getFieldColor = (fieldId: string) => FIELD_COLORS[fieldId] ?? FIELD_COLORS.Algebra;

// ─── Component ──────────────────────────────────────────────────────

const Curriculum: React.FC = () => {
    const tree = useMemo(() => getSyllabusTree(), []);
    const stats = useMemo(() => getSyllabusStats(), []);

    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    // Search results
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

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Ύλη Μαθηματικών</h1>
                <p className="text-muted-foreground mt-1">
                    Πλήρης δομή: {stats.fields} πεδία · {stats.chapters} κεφάλαια · {stats.sections} ενότητες · {stats.exerciseTypes} τύποι ασκήσεων
                </p>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Πεδία', value: stats.fields, icon: <Grid3X3 className="w-4 h-4" />, color: 'text-blue-500 bg-blue-500/10' },
                    { label: 'Κεφάλαια', value: stats.chapters, icon: <BookOpen className="w-4 h-4" />, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Ενότητες', value: stats.sections, icon: <Layers className="w-4 h-4" />, color: 'text-violet-500 bg-violet-500/10' },
                    { label: 'Τύποι Ασκήσεων', value: stats.exerciseTypes, icon: <FileText className="w-4 h-4" />, color: 'text-amber-500 bg-amber-500/10' },
                ].map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", s.color)}>{s.icon}</div>
                            <div>
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-[10px] text-muted-foreground">{s.label}</p>
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
                    {tree.map(field => {
                        const colors = getFieldColor(field.Id);
                        const isSelected = selectedField === field.Id;

                        return (
                            <button
                                key={field.Id}
                                onClick={() => setSelectedField(isSelected ? null : field.Id)}
                                className={cn(
                                    "text-left rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-md",
                                    isSelected
                                        ? `${colors.border} ${colors.bg} shadow-md ring-2 ring-offset-2 ring-offset-background`
                                        : "border-border hover:border-primary/30"
                                )}
                                style={isSelected ? { '--tw-ring-color': `hsl(var(--primary) / 0.3)` } as React.CSSProperties : undefined}
                            >
                                <div className="text-3xl mb-3">{colors.icon}</div>
                                <h3 className="font-bold text-sm">{field.Name}</h3>
                                <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                                    <p>{field.totalChapters} κεφάλαια</p>
                                    <p>{field.totalSections} ενότητες</p>
                                    <p>{field.totalExercises} τύποι ασκ.</p>
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
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{getFieldColor(activeField.Id).icon}</span>
                        <div>
                            <h2 className="text-xl font-bold">{activeField.Name}</h2>
                            <p className="text-xs text-muted-foreground">
                                {activeField.totalChapters} κεφάλαια · {activeField.totalSections} ενότητες · {activeField.totalExercises} τύποι ασκήσεων
                            </p>
                        </div>
                    </div>

                    {activeField.chapters.map(chapter => (
                        <ChapterAccordion
                            key={chapter.Id}
                            chapter={chapter}
                            fieldId={activeField.Id}
                            isExpanded={expandedChapters.has(chapter.Id)}
                            expandedSections={expandedSections}
                            onToggle={() => toggleChapter(chapter.Id)}
                            onToggleSection={toggleSection}
                        />
                    ))}
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
        </div>
    );
};

// ─── Chapter Accordion ──────────────────────────────────────────────

interface ChapterAccordionProps {
    chapter: SyllabusChapterNode;
    fieldId: string;
    isExpanded: boolean;
    expandedSections: Set<string>;
    onToggle: () => void;
    onToggleSection: (id: string) => void;
}

const ChapterAccordion: React.FC<ChapterAccordionProps> = ({
    chapter, fieldId, isExpanded, expandedSections, onToggle, onToggleSection,
}) => {
    const colors = getFieldColor(fieldId);

    return (
        <Card className="overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors text-left"
            >
                <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", colors.bg, colors.text)}>
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">{chapter.Name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {chapter.sections.length} ενότητες · {chapter.totalExercises} τύποι ασκήσεων
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                        {chapter.sections.length}
                    </Badge>
                    {isExpanded
                        ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    }
                </div>
            </button>

            {isExpanded && (
                <div className="border-t border-border">
                    {chapter.sections.map(section => (
                        <SectionRow
                            key={section.Id}
                            section={section}
                            fieldId={fieldId}
                            isExpanded={expandedSections.has(section.Id)}
                            onToggle={() => onToggleSection(section.Id)}
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
    isExpanded: boolean;
    onToggle: () => void;
}

const SectionRow: React.FC<SectionRowProps> = ({ section, fieldId, isExpanded, onToggle }) => {
    const colors = getFieldColor(fieldId);

    return (
        <div className="border-b border-border last:border-0">
            <button
                onClick={onToggle}
                className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-secondary/20 transition-colors text-left"
            >
                <div className={cn("w-2 h-2 rounded-full shrink-0", colors.accent)} />
                <span className="text-sm flex-1">{section.Name}</span>
                <Badge variant="outline" className="text-[9px] shrink-0">
                    {section.exerciseCount} τύποι
                </Badge>
                {section.exerciseCount > 0 && (
                    isExpanded
                        ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                )}
            </button>

            {isExpanded && section.exerciseTypes.length > 0 && (
                <div className="px-8 pb-4">
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
                </div>
            )}
        </div>
    );
};

export default Curriculum;
