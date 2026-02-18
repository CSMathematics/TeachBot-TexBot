import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label } from './ui';
import { updateNode } from '../services/syllabusService';
import { getPrerequisiteSuggestion } from '../services/geminiService';
import { Loader2, Sparkles } from 'lucide-react';

interface EditNodeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    nodeId: string;
    currentTitle: string;
    currentContentType?: 'THEORY' | 'METHODOLOGY';
    currentPrerequisites?: string;
    type: 'FIELD' | 'CHAPTER' | 'SECTION' | 'PARAGRAPH';
    onSuccess: () => void;
}

const EditNodeDialog: React.FC<EditNodeDialogProps> = ({ isOpen, onClose, nodeId, currentTitle, currentContentType, currentPrerequisites, type, onSuccess }) => {
    const [title, setTitle] = useState(currentTitle);
    const [contentType, setContentType] = useState<'THEORY' | 'METHODOLOGY'>(currentContentType || 'THEORY');
    const [prerequisites, setPrerequisites] = useState(currentPrerequisites || '');
    const [loading, setLoading] = useState(false);
    const [suggesting, setSuggesting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update state if props change
    useEffect(() => {
        setTitle(currentTitle);
        if (currentContentType) setContentType(currentContentType);
        setPrerequisites(currentPrerequisites || '');
    }, [currentTitle, currentContentType, currentPrerequisites, isOpen]);

    const typeLabels = {
        'FIELD': 'Πεδίου',
        'CHAPTER': 'Κεφαλαίου',
        'SECTION': 'Ενότητας',
        'PARAGRAPH': 'Παραγράφου'
    };

    const handleSave = async () => {
        if (!title.trim()) return;

        setLoading(true);
        setError(null);
        try {
            await updateNode(nodeId, title, type === 'PARAGRAPH' ? contentType : undefined, prerequisites);
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to update node. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAiSuggest = async () => {
        if (!title.trim()) {
            setError('Συμπληρώστε πρώτα τον τίτλο για να προταθούν προαπαιτούμενα.');
            return;
        }

        setError(null);
        setSuggesting(true);
        try {
            const suggestion = await getPrerequisiteSuggestion(title, typeLabels[type], prerequisites || undefined);
            if (suggestion && suggestion.trim()) {
                setPrerequisites(prev => prev ? `${prev}, ${suggestion}` : suggestion);
            } else {
                setError('Το AI δεν μπόρεσε να προτείνει προαπαιτούμενα. Ελέγξτε το API key στις Ρυθμίσεις.');
            }
        } catch (err) {
            console.error("AI suggest failed", err);
            const message = err instanceof Error ? err.message : String(err);
            setError(`Σφάλμα κατά την κλήση του AI: ${message}`);
        } finally {
            setSuggesting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Επεξεργασία {typeLabels[type]}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Τίτλος
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                            autoFocus
                        />
                    </div>

                    {type === 'PARAGRAPH' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contentType" className="text-right">
                                Είδος
                            </Label>
                            <div className="col-span-3 flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="edit-theory"
                                        name="editContentType"
                                        checked={contentType === 'THEORY'}
                                        onChange={() => setContentType('THEORY')}
                                        className="accent-primary"
                                    />
                                    <Label htmlFor="edit-theory">Θεωρία</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="edit-methodology"
                                        name="editContentType"
                                        checked={contentType === 'METHODOLOGY'}
                                        onChange={() => setContentType('METHODOLOGY')}
                                        className="accent-primary"
                                    />
                                    <Label htmlFor="edit-methodology">Μεθοδολογία</Label>
                                </div>
                            </div>
                        </div>
                    )}

                    {(type === 'CHAPTER' || type === 'SECTION') && (
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="prerequisites" className="text-right pt-2">
                                Προαπαιτούμενα
                            </Label>
                            <div className="col-span-3 space-y-2">
                                <textarea
                                    id="prerequisites"
                                    value={prerequisites}
                                    onChange={(e) => setPrerequisites(e.target.value)}
                                    className="w-full min-h-[80px] px-3 py-2 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="π.χ. Βασικές ταυτότητες, Παραγώγιση, ..."
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7 gap-1"
                                    onClick={handleAiSuggest}
                                    disabled={suggesting}
                                >
                                    {suggesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-purple-500" />}
                                    {suggesting ? 'Σκέφτεται...' : 'AI Suggest'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-destructive text-center">{error}</p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Ακύρωση
                    </Button>
                    <Button onClick={handleSave} disabled={loading || !title.trim()}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Αποθήκευση
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditNodeDialog;
