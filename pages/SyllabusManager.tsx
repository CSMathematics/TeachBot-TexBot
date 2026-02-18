import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../components/ui';
import { Plus, Edit2, Trash2, BookOpen, MoreVertical, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchAllSyllabuses, deleteSyllabus, Syllabus } from '../services/syllabusService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label, Select } from '../components/ui';
import { updateSyllabus, importSyllabus, fetchSyllabusTree } from '../services/syllabusService';
import { Upload, Download } from 'lucide-react';

const SyllabusManager: React.FC = () => {
    const navigate = useNavigate();
    const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState<'PERSONAL' | 'ORGANIZATION'>('PERSONAL');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadSyllabuses();
    }, []);

    const loadSyllabuses = async () => {
        setLoading(true);
        try {
            const data = await fetchAllSyllabuses(); // API call handles user context
            setSyllabuses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (syllabus: Syllabus) => {
        try {
            const tree = await fetchSyllabusTree(syllabus.id);
            const exportData = {
                name: syllabus.name,
                type: syllabus.type,
                description: syllabus.description,
                tree: tree
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `syllabus-${syllabus.name.replace(/\s+/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert('Failed to export syllabus');
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (!json.tree || !Array.isArray(json.tree)) {
                    throw new Error("Invalid format: 'tree' array missing");
                }

                await importSyllabus(
                    json.name + ' (Imported)',
                    json.type || 'PERSONAL',
                    json.tree,
                    'default-user-id' // would come from context
                );

                alert('Syllabus imported successfully!');
                loadSyllabuses();
            } catch (err) {
                console.error(err);
                alert('Failed to import: ' + (err as Error).message);
            }
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = '';
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε την ύλη "${name}";\nΘα διαγραφούν ΟΛΑ τα περιεχόμενα της.`)) return;

        try {
            await deleteSyllabus(id);
            setSyllabuses(syllabuses.filter(s => s.id !== id));
        } catch (err) {
            alert('Failed to delete syllabus');
        }
    };

    const startEdit = (syllabus: Syllabus) => {
        setEditingId(syllabus.id);
        setEditName(syllabus.name);
        setEditType(syllabus.type as 'PERSONAL' | 'ORGANIZATION');
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editName.trim()) return;
        setIsSubmitting(true);
        try {
            await updateSyllabus(editingId, editName, editType);

            setSyllabuses(syllabuses.map(s =>
                s.id === editingId
                    ? { ...s, name: editName, type: editType }
                    : s
            ));
            setEditingId(null);
        } catch (err) {
            alert('Failed to update syllabus');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Διαχείριση Ύλης</h1>
                    <p className="text-muted-foreground mt-1">
                        Δημιουργήστε και επεξεργαστείτε τα προγράμματα σπουδών.
                    </p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".json"
                    />
                    <Button variant="outline" onClick={handleImportClick} className="gap-2">
                        <Upload className="w-4 h-4" /> Import JSON
                    </Button>
                    <Button onClick={() => navigate('/curriculum/new')} className="gap-2">
                        <Plus className="w-4 h-4" /> Νέα Ύλη
                    </Button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {syllabuses.map(syllabus => (
                        <Card key={syllabus.id} className="group relative hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant={syllabus.type === 'ORGANIZATION' ? 'secondary' : 'outline'}>
                                        {syllabus.type === 'ORGANIZATION' ? 'Οργανισμός' : 'Προσωπικό'}
                                    </Badge>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleExport(syllabus)} title="Export JSON">
                                            <Download className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(syllabus)}>
                                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(syllabus.id, syllabus.name)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="mt-2 line-clamp-2" title={syllabus.name}>
                                    {syllabus.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground mb-4">
                                    {/* Placeholder stats */}
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{new Date(syllabus.createdAt).toLocaleDateString('el-GR')}</span>
                                    </div>
                                </div>
                                <Button className="w-full" variant="secondary" onClick={() => navigate(`/curriculum/editor?id=${syllabus.id}`)}>
                                    Επεξεργασία Περιεχομένου
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add New Card equivalent */}
                    <button
                        onClick={() => navigate('/curriculum/new')}
                        className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border rounded-xl p-6 hover:bg-secondary/20 transition-colors h-full min-h-[200px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                            <Plus className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-muted-foreground">Δημιουργία Νέας Ύλης</span>
                    </button>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Επεξεργασία Ύλης</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Όνομα</Label>
                            <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Τύπος</Label>
                            <select
                                id="type"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={editType}
                                onChange={(e) => setEditType(e.target.value as any)}
                            >
                                <option value="PERSONAL">Προσωπική</option>
                                <option value="ORGANIZATION">Οργανισμού</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingId(null)}>Ακύρωση</Button>
                        <Button onClick={handleSaveEdit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Αποθήκευση
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SyllabusManager;
