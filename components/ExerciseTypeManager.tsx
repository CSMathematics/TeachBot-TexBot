import React, { useState, useEffect } from 'react';
import { Card, CardContent, Input, Button, Badge } from './ui';
import { Plus, X, Tag, Loader2 } from 'lucide-react';
import { getExerciseTypes, createExerciseType, deleteExerciseType, ExerciseType } from '../services/syllabusService';
import { cn } from '../lib/utils';

export const ExerciseTypeManager: React.FC = () => {
    const [types, setTypes] = useState<ExerciseType[]>([]);
    const [newType, setNewType] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const data = await getExerciseTypes();
            setTypes(data);
        } catch (err) {
            console.error('Failed to fetch types', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newType.trim()) return;
        setSubmitting(true);
        try {
            await createExerciseType(newType.trim());
            setNewType('');
            fetchTypes();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Διαγραφή;')) return;
        try {
            await deleteExerciseType(id);
            setTypes(types.filter(t => t.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Μορφές Ασκήσεων (Global)</h3>
                    {loading && <Loader2 className="w-3 h-3 animate-spin ml-2" />}
                </div>

                <div className="flex gap-2 mb-4">
                    <Input
                        placeholder="Νέα μορφή (π.χ. Συμπλήρωσης Κενού)"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="max-w-xs"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        disabled={submitting}
                    />
                    <Button onClick={handleAdd} size="sm" disabled={submitting || !newType.trim()}>
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        Προσθήκη
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {types.map(t => (
                        <Badge key={t.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 hover:bg-secondary/80">
                            {t.name}
                            <button onClick={() => handleDelete(t.id)} className="ml-1 p-0.5 hover:text-destructive rounded-full">
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                    * Αυτές οι μορφές είναι διαθέσιμες σε όλα τα κεφάλαια και τις παραγράφους.
                </p>
            </CardContent>
        </Card>
    );
};
