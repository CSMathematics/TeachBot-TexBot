import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui';
import { Layers, Plus, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createSyllabus } from '../services/syllabusService';

const SyllabusNew: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [type, setType] = useState<'PERSONAL' | 'ORGANIZATION'>('PERSONAL');
    const [gradeLevel, setGradeLevel] = useState("Γ' Λυκείου");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Fetch default user ID
            const userRes = await fetch('http://localhost:3001/api/user/default');
            const user = await userRes.json();

            if (!user.id) throw new Error("Could not find default user");

            await createSyllabus(name, type, user.id, gradeLevel);
            navigate('/curriculum'); // Redirect back to list
        } catch (err) {
            console.error(err);
            setError('Failed to create syllabus. Server might think user does not exist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <header>
                <button onClick={() => navigate('/curriculum')} className="text-sm text-muted-foreground hover:text-primary mb-2">
                    ← Πίσω στην Ύλη
                </button>
                <h1 className="text-3xl font-bold tracking-tight">Δημιουργία Νέας Ύλης</h1>
                <p className="text-muted-foreground mt-1">
                    Ξεκινήστε μια νέα δομή μαθημάτων από το μηδέν.
                </p>
            </header>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Όνομα Ύλης</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="π.χ. Μαθηματικά Γ' Λυκείου 2025"
                                className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                required
                            />
                        </div>

                        {/* Grade Level */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Βαθμίδα / Τάξη</label>
                            <select
                                value={gradeLevel}
                                onChange={e => setGradeLevel(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                            >
                                <option>Α' Γυμνασίου</option>
                                <option>Β' Γυμνασίου</option>
                                <option>Γ' Γυμνασίου</option>
                                <option>Α' Λυκείου</option>
                                <option>Β' Λυκείου</option>
                                <option>Γ' Λυκείου</option>
                            </select>
                            <p className="text-xs text-muted-foreground">
                                Καθορίζει τη δυσκολία και το ύφος του παραγόμενου περιεχομένου.
                            </p>
                        </div>

                        {/* Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Τύπος</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setType('PERSONAL')}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${type === 'PERSONAL'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                        : 'border-border hover:border-primary/30'
                                        }`}
                                >
                                    <div className="font-semibold mb-1">Προσωπική</div>
                                    <div className="text-xs text-muted-foreground">Μόνο για εσάς</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('ORGANIZATION')}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${type === 'ORGANIZATION'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                        : 'border-border hover:border-primary/30'
                                        }`}
                                >
                                    <div className="font-semibold mb-1">Οργανισμού</div>
                                    <div className="text-xs text-muted-foreground">Κοινόχρηστη</div>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || !name.trim()}
                                className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? 'Δημιουργία...' : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Δημιουργία Ύλης
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SyllabusNew;
