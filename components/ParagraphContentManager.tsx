import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Badge } from './ui';
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { createNode, deleteNode } from '../services/syllabusService';
import { SyllabusNode } from '../types';

interface ParagraphContentManagerProps {
    isOpen: boolean;
    onClose: () => void;
    paragraphId: string;
    paragraphTitle: string;
    paragraphType?: 'THEORY' | 'METHODOLOGY';
    syllabusId: string;
    existingContent: SyllabusNode[]; // We'll pass the children nodes here
    onUpdate: () => void; // To refresh the tree
}

const ParagraphContentManager: React.FC<ParagraphContentManagerProps> = ({
    isOpen, onClose, paragraphId, paragraphTitle, paragraphType, syllabusId, existingContent, onUpdate
}) => {
    const [newItemTitle, setNewItemTitle] = useState('');
    const [loading, setLoading] = useState(false);

    // Optimistic UI updates could be nice, but simple fetch for now
    const [items, setItems] = useState<SyllabusNode[]>(existingContent || []);

    // Sync props to state
    useEffect(() => {
        setItems(existingContent || []);
    }, [existingContent, isOpen]);

    const handleAdd = async () => {
        if (!newItemTitle.trim()) return;
        setLoading(true);
        try {
            await createNode(syllabusId, paragraphId, newItemTitle, 'CONTENT_ITEM');
            setNewItemTitle('');
            onUpdate(); // Trigger refresh from parent
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Διαγραφή αντικειμένου;')) return;
        try {
            await deleteNode(id);
            // Optimistic update
            setItems(items.filter(i => i.id !== id));
            onUpdate();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {paragraphTitle}
                        <Badge variant="outline" className={paragraphType === 'METHODOLOGY' ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}>
                            {paragraphType === 'METHODOLOGY' ? 'ΜΕΘΟΔΟΛΟΓΙΑ' : 'ΘΕΩΡΙΑ'}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 pr-2">
                    {items.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            Δεν υπάρχει περιεχόμενο ακόμα.
                            <br />
                            Προσθέστε {paragraphType === 'METHODOLOGY' ? 'βήματα ή περιπτώσεις' : 'σημεία θεωρίας'}.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg border group">
                                    <span className="text-muted-foreground text-xs font-mono w-6 text-center">
                                        {index + 1}.
                                    </span>
                                    <span className="flex-1 text-sm">{item.title}</span>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t pt-4 mt-auto">
                    <Label className="mb-2 block">Προσθήκη {paragraphType === 'METHODOLOGY' ? 'Βήματος / Περίπτωσης' : 'Σημείου'}</Label>
                    <div className="flex gap-2">
                        <Input
                            value={newItemTitle}
                            onChange={(e) => setNewItemTitle(e.target.value)}
                            placeholder={paragraphType === 'METHODOLOGY' ? "π.χ. Βήμα 1: Βρίσκουμε το πεδίο ορισμού" : "π.χ. Ορισμός της συνάρτησης"}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            disabled={loading}
                        />
                        <Button onClick={handleAdd} disabled={loading || !newItemTitle.trim()}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ParagraphContentManager;
