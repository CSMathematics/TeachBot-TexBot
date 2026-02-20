import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui';
import { Button } from './ui';
import { Save, Globe, Lock, ShieldAlert } from 'lucide-react';

interface ExerciseEditFormProps {
    exerciseData: {
        title: string;
        difficulty: number;
        hasSolution: boolean;
        solution: string;
        description: string;
        bibliography: string;
        tags: string[];
        isPublic: boolean;
        topicId: string;
    };
    onChange: (data: any) => void;
    onSave: () => void;
    isSaving?: boolean;
}

export function ExerciseEditForm({ exerciseData, onChange, onSave, isSaving }: ExerciseEditFormProps) {
    const [tagInput, setTagInput] = useState('');

    const handleAddTag = () => {
        if (tagInput.trim() && !exerciseData.tags.includes(tagInput.trim())) {
            onChange({ ...exerciseData, tags: [...exerciseData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onChange({ ...exerciseData, tags: exerciseData.tags.filter(t => t !== tagToRemove) });
    };

    return (
        <Card className="h-full flex flex-col border-0 shadow-none bg-transparent">
            <CardHeader className="px-4 py-3 border-b flex-none">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <span>Metadata Άσκησης</span>
                </CardTitle>
                <CardDescription>
                    Ορίστε τα χαρακτηριστικά της άσκησης για αποθήκευση στην τράπεζα θεμάτων.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block text-slate-700">Τίτλος (Προαιρετικό)</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="π.χ. Βασικό Όριο με συζυγή παράσταση"
                            value={exerciseData.title || ''}
                            onChange={(e) => onChange({ ...exerciseData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-sm font-medium text-slate-700">Βαθμός Δυσκολίας</label>
                            <span className="text-sm font-bold text-blue-600">{exerciseData.difficulty || 3}/5</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={exerciseData.difficulty || 3}
                            onChange={(e) => onChange({ ...exerciseData, difficulty: parseInt(e.target.value) })}
                            className="w-full accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>Εύκολο (1)</span>
                            <span>Δύσκολο (5)</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block text-slate-700">Περιγραφή / Σημειώσεις</label>
                        <textarea
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                            placeholder="Προσθέστε σημειώσεις για τη χρήση της άσκησης..."
                            value={exerciseData.description || ''}
                            onChange={(e) => onChange({ ...exerciseData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block text-slate-700">Βιβλιογραφία / Πηγή</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="π.χ. Πανελλαδικές 2023, Θέμα Γ"
                            value={exerciseData.bibliography || ''}
                            onChange={(e) => onChange({ ...exerciseData, bibliography: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block text-slate-700">Tags</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="π.χ. SOS, Επαναληπτική"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                            />
                            <Button type="button" variant="secondary" onClick={handleAddTag} className="px-3 py-1.5 h-auto">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm mt-2">
                            {exerciseData.tags?.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                                    {tag}
                                    <button onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-red-500 text-xs font-bold leading-none">&times;</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <label className="text-sm font-medium mb-3 block text-slate-700">Ορατότητα (Privacy)</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => onChange({ ...exerciseData, isPublic: false })}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${!exerciseData.isPublic
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <Lock className="w-5 h-5" />
                                <span className="text-sm font-medium">Ιδιωτική</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onChange({ ...exerciseData, isPublic: true })}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${exerciseData.isPublic
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <Globe className="w-5 h-5" />
                                <span className="text-sm font-medium">Δημόσια</span>
                            </button>
                        </div>
                        {exerciseData.isPublic && (
                            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Η άσκηση θα είναι ορατή στο Public Pool του συστήματος.
                            </p>
                        )}
                    </div>

                </div>
            </CardContent>
            <div className="p-4 border-t bg-slate-50">
                <Button
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={onSave}
                    disabled={isSaving || !exerciseData.topicId}
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Αποθήκευση...' : 'Αποθήκευση στη Βάση'}
                </Button>
                {!exerciseData.topicId && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                        Απαιτείται επιλογή θέματος (Syllabus) πριν την αποθήκευση.
                    </p>
                )}
            </div>
        </Card>
    );
}
