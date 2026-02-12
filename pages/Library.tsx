import React, { useState, useMemo, useEffect } from 'react';
import { Search, Grid3x3, List, BookOpen, FileText, Download, Copy, Trash2, Plus, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button, Input, Select, Badge } from '../components/ui';
import { cn } from '../lib/utils';
import { generateLatexFromExam } from '../lib/latexGenerator';
import { getLibrary, deleteExam, duplicateExam } from '../services/storageService';
import { Exam } from '../types';

const Library: React.FC = () => {
    const [items, setItems] = useState<Exam[]>([]);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'exam' | 'worksheet'>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const loadLibrary = () => {
        const data = getLibrary();
        setItems(data);
    };

    useEffect(() => {
        loadLibrary();
        window.addEventListener('library-updated', loadLibrary);
        return () => window.removeEventListener('library-updated', loadLibrary);
    }, []);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this item?')) {
            deleteExam(id);
        }
    };

    const handleDuplicate = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        duplicateExam(id);
    };

    const handleDownload = (e: React.MouseEvent, item: Exam) => {
        e.stopPropagation();
        const latex = generateLatexFromExam(item);
        const blob = new Blob([latex], { type: 'application/x-latex' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Clean filename
        const filename = item.title.replace(/[^a-zA-Z0-9\u0370-\u03FF\s-_]/g, '').trim() || 'exam';
        a.download = `${filename}.tex`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filtered = useMemo(() => {
        return items.filter(item => {
            const itemType = item.type || 'exam';
            if (typeFilter !== 'all' && itemType !== typeFilter) return false;

            // Map numeric difficulty to string for filter if needed, or update filter logic
            // For now, let's assume difficultyFilter matches string representation if stored as string?
            // Actually stored as number 0-100.
            if (difficultyFilter !== 'all') {
                const diffLabel = item.difficulty < 33 ? 'Εύκολο' : item.difficulty < 66 ? 'Μέτριο' : 'Δύσκολο';
                if (diffLabel !== difficultyFilter) return false;
            }

            if (search.trim()) {
                const q = search.toLowerCase();
                return item.title.toLowerCase().includes(q) ||
                    item.subject.toLowerCase().includes(q) ||
                    (item.tags || []).some(t => t.includes(q));
            }
            return true;
        });
    }, [items, search, typeFilter, difficultyFilter]);

    const examCount = items.filter(i => (i.type || 'exam') === 'exam').length;
    const worksheetCount = items.filter(i => i.type === 'worksheet').length;

    const formatDate = (d: string) => {
        try {
            const date = new Date(d);
            return date.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' });
        } catch { return '-'; }
    };

    const getDifficultyLabel = (val: number) => {
        if (val < 33) return { label: 'Εύκολο', variant: 'secondary' as const };
        if (val < 66) return { label: 'Μέτριο', variant: 'outline' as const };
        return { label: 'Δύσκολο', variant: 'destructive' as const };
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Βιβλιοθήκη</h1>
                    <p className="text-muted-foreground mt-1">Ιστορικό εξετάσεων και φυλλαδίων — {items.length} αρχεία</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/create">
                        <Button className="gap-2"><Plus size={16} /> Νέα Εξέταση</Button>
                    </Link>
                    <Link to="/worksheet">
                        <Button variant="outline" className="gap-2"><FileText size={16} /> Νέο Φυλλάδιο</Button>
                    </Link>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:border-primary/30 transition-all" onClick={() => setTypeFilter('all')}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><BookOpen className="w-5 h-5" /></div>
                        <div>
                            <p className="text-2xl font-bold">{items.length}</p>
                            <p className="text-xs text-muted-foreground">Σύνολο Αρχείων</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className={cn("cursor-pointer hover:border-cyan-500/30 transition-all", typeFilter === 'exam' && "border-cyan-500/40")} onClick={() => setTypeFilter(typeFilter === 'exam' ? 'all' : 'exam')}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"><BookOpen className="w-5 h-5" /></div>
                        <div>
                            <p className="text-2xl font-bold">{examCount}</p>
                            <p className="text-xs text-muted-foreground">Εξετάσεις</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className={cn("cursor-pointer hover:border-orange-500/30 transition-all", typeFilter === 'worksheet' && "border-orange-500/40")} onClick={() => setTypeFilter(typeFilter === 'worksheet' ? 'all' : 'worksheet')}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400"><FileText className="w-5 h-5" /></div>
                        <div>
                            <p className="text-2xl font-bold">{worksheetCount}</p>
                            <p className="text-xs text-muted-foreground">Φυλλάδια</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Αναζήτηση..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                    </div>
                    <Select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="w-36">
                        <option value="all">Όλα τα επίπεδα</option>
                        <option value="Εύκολο">Εύκολο</option>
                        <option value="Μέτριο">Μέτριο</option>
                        <option value="Δύσκολο">Δύσκολο</option>
                    </Select>
                </div>

                <div className="flex bg-muted rounded-md p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn("p-2 rounded-sm transition-all", viewMode === 'grid' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                    >
                        <Grid3x3 size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn("p-2 rounded-sm transition-all", viewMode === 'list' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(item => {
                        const diff = getDifficultyLabel(item.difficulty);
                        const isExam = (item.type || 'exam') === 'exam';

                        return (
                            <Card key={item.id} className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border hover:border-primary/20">
                                <CardContent className="p-5 space-y-4">
                                    {/* Type Badge + Actions */}
                                    <div className="flex items-center justify-between">
                                        <Badge variant={isExam ? 'default' : 'secondary'} className="text-[10px]">
                                            {isExam ? '📝 Εξέταση' : '📄 Φυλλάδιο'}
                                        </Badge>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => handleDownload(e, item)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"><Download size={14} /></button>
                                            <button onClick={(e) => handleDuplicate(e, item.id)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"><Copy size={14} /></button>
                                            <button onClick={(e) => handleDelete(e, item.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive hover:text-destructive"><Trash2 size={14} /></button>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <h3 className="font-semibold text-sm leading-snug line-clamp-2" title={item.title}>{item.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">{item.gradeLevel}</p>
                                    </div>

                                    {/* Meta */}
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                        <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(item.createdAt)}</span>
                                        <span>{item.questions?.length || 0} ερωτ.</span>
                                        <Badge variant={diff.variant} className="text-[9px] px-1.5 py-0">
                                            {diff.label}
                                        </Badge>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1">
                                        {(item.tags || []).slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded-full text-muted-foreground">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Agents used */}
                                    <div className="flex items-center gap-1.5 pt-2 border-t border-border">
                                        <span className="text-[9px] text-muted-foreground mr-1">Agents:</span>
                                        {(item.agents || []).slice(0, 3).map(a => (
                                            <div key={a} title={a} className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">
                                                {a.split('-').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                        ))}
                                        {(item.agents || []).length > 3 && (
                                            <span className="text-[9px] text-muted-foreground">+{item.agents!.length - 3}</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(item => {
                        const diff = getDifficultyLabel(item.difficulty);
                        const isExam = (item.type || 'exam') === 'exam';

                        return (
                            <Card key={item.id} className="group hover:shadow-md transition-all cursor-pointer border hover:border-primary/20">
                                <CardContent className="p-4 flex items-center gap-4">
                                    {/* Icon */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                        isExam ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                    )}>
                                        {isExam ? <BookOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold truncate">{item.title}</h3>
                                            <Badge variant={diff.variant} className="text-[9px] px-1.5 py-0 shrink-0">
                                                {diff.label}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                            <span>{item.gradeLevel}</span>
                                            <span>·</span>
                                            <span>{(item.questions || []).length} ερωτ.</span>
                                            <span>·</span>
                                            <span>{formatDate(item.createdAt)}</span>
                                            <span>·</span>
                                            <span>{(item.agents || []).length} agents</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <Button onClick={(e) => handleDownload(e, item)} variant="ghost" size="icon" className="h-8 w-8"><Download size={14} /></Button>
                                        <Button onClick={(e) => handleDuplicate(e, item.id)} variant="ghost" size="icon" className="h-8 w-8"><Copy size={14} /></Button>
                                        <Button onClick={(e) => handleDelete(e, item.id)} variant="ghost" size="icon" className="h-8 w-8 text-destructive/60 hover:text-destructive"><Trash2 size={14} /></Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {filtered.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Δεν βρέθηκαν αποτελέσματα</p>
                    <p className="text-sm mt-1">Δημιουργήστε νέο υλικό για να εμφανιστεί εδώ.</p>
                </div>
            )}
        </div>
    );
};

export default Library;
