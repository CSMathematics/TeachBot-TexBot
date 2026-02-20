import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui';
import { Button, Input, Badge } from './ui';
import { Search, Loader2, BookOpen, AlertCircle, Eye } from 'lucide-react';
import LatexRenderer from './LatexRenderer';
import TopicSelector from './TopicSelector';

interface ExerciseBankModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (exercise: any) => void;
}

export function ExerciseBankModal({ open, onOpenChange, onSelect }: ExerciseBankModalProps) {
    const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
    const [exercises, setExercises] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [topicId, setTopicId] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState<number | null>(null);

    const fetchExercises = async () => {
        setLoading(true);
        setError(null);
        try {
            // Build query
            const params = new URLSearchParams();
            if (activeTab === 'public') {
                params.append('isPublic', 'true');
            } else {
                params.append('ownerId', 'user_1'); // Temporary hardcoded user
            }
            if (topicId) params.append('topicId', topicId);
            if (difficulty) params.append('difficulty', difficulty.toString());

            const res = await fetch(`/api/exercises?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch exercises');
            const data = await res.json();
            setExercises(data);
        } catch (err: any) {
            setError(err.message || 'Error occurred while fetching exercises.');
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when tab or filters change
    useEffect(() => {
        if (open) {
            fetchExercises();
        }
    }, [open, activeTab, topicId, difficulty]);

    const handleSelect = async (ex: any) => {
        try {
            // Record usage
            fetch(`/api/exercises/${ex.id}/record-usage`, { method: 'POST' }).catch(() => { });
        } finally {
            onSelect(ex);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-full h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50">
                <DialogHeader className="px-6 py-4 border-b bg-white flex-none shrink-0">
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Τράπεζα Ασκήσεων
                    </DialogTitle>
                    <DialogDescription>
                        Αναζητήστε και επιλέξτε ασκήσεις από τη συλλογή σας ή το δημόσιο repository.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Filters */}
                    <div className="w-72 bg-white border-r flex flex-col overflow-y-auto">
                        <div className="p-4 border-b">
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('my')}
                                    className={`flex-1 flex justify-center text-sm py-1.5 rounded-md font-medium transition-colors ${activeTab === 'my' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Οι Ασκήσεις μου
                                </button>
                                <button
                                    onClick={() => setActiveTab('public')}
                                    className={`flex-1 flex justify-center text-sm py-1.5 rounded-md font-medium transition-colors ${activeTab === 'public' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Public Pool
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-6 flex-1">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                                    Θεματική Ενότητα
                                </label>
                                <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 h-[300px] overflow-y-auto">
                                    {/* Wrapping in a smaller container to fit */}
                                    <div className="transform scale-90 origin-top-left w-[111%]">
                                        <TopicSelector
                                            onSelectionChange={(areas) => {
                                                const selected = areas.find(a => a.selected);
                                                setTopicId(selected ? selected.id : null);
                                            }}
                                            selectedAreas={topicId ? [{ id: topicId, isFull: true }] : []}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                                    Βαθμός Δυσκολίας
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setDifficulty(difficulty === level ? null : level)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${difficulty === level
                                                ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                                                : 'bg-white border text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                        <div className="p-4 border-b bg-white flex justify-between items-center shrink-0">
                            <div className="relative w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Αναζήτηση..."
                                    className="pl-9 bg-slate-50 border-slate-200"
                                // Local text filtering not yet implemented
                                />
                            </div>
                            <div className="text-sm text-slate-500">
                                Βρέθηκαν: <span className="font-semibold text-slate-900">{exercises.length}</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    <p>Φόρτωση ασκήσεων...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full text-red-500 gap-3">
                                    <AlertCircle className="w-8 h-8" />
                                    <p>{error}</p>
                                </div>
                            ) : exercises.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                                    <Search className="w-12 h-12 text-slate-300" />
                                    <p className="text-lg font-medium text-slate-700">Δε βρέθηκαν αποτελέσματα</p>
                                    <p className="text-sm">Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {exercises.map((ex) => (
                                        <div key={ex.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-300 transition-colors flex flex-col">
                                            <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                                <div>
                                                    <h4 className="font-medium text-slate-900">{ex.title || 'Άσκηση χωρίς τίτλο'}</h4>
                                                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                                                        <span className="flex items-center gap-1 text-amber-500 font-medium">
                                                            Δυσκολία: {ex.difficulty}/5
                                                        </span>
                                                        <span>•</span>
                                                        <span>{ex.topic?.title || 'Άγνωστο Θέμα'}</span>
                                                        <span>•</span>
                                                        <span>Χρήσεις: {ex.usageStatistics}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() => handleSelect(ex)}
                                                    >
                                                        Προσθήκη
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="p-5 text-sm  overflow-x-auto">
                                                <LatexRenderer latex={ex.content} />
                                            </div>
                                            {(ex.tags?.length > 0 || ex.hasSolution) && (
                                                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                                    <div className="flex gap-2">
                                                        {ex.tags?.slice(0, 3).map((tag: string) => (
                                                            <Badge key={tag} variant="secondary" className="text-[10px] px-2">{tag}</Badge>
                                                        ))}
                                                        {ex.tags?.length > 3 && <Badge variant="outline" className="text-[10px]">+{ex.tags.length - 3}</Badge>}
                                                    </div>
                                                    {ex.hasSolution && (
                                                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px]">Με Λύση</Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}
