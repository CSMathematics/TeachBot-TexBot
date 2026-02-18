import React, { useState } from 'react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui';
import { ListChecks, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { fetchNodePrerequisites } from '../services/syllabusService';

interface PrerequisiteCheckerProps {
    selectedNodeIds: string[];
}

interface NodePrerequisite {
    id: string;
    title: string;
    prerequisites: string;
}

const PrerequisiteChecker: React.FC<PrerequisiteCheckerProps> = ({ selectedNodeIds }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<NodePrerequisite[]>([]);
    const [fetched, setFetched] = useState(false);

    const handleCheck = async () => {
        if (selectedNodeIds.length === 0) return;

        setLoading(true);
        try {
            const data = await fetchNodePrerequisites(selectedNodeIds);
            setResults(data);
            setFetched(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        // Reset state on open if nodes changed? 
        // For simplicity, let user click "Run" again or auto-run if open.
        // Let's auto-run if not fetched yet or just reset.
        setFetched(false);
        setResults([]);
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                onClick={handleOpen}
                disabled={selectedNodeIds.length === 0}
            >
                <ListChecks className="w-3 h-3 mr-1" />
                Έλεγχος Προαπαιτούμενων
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Προαπαιτούμενες Γνώσεις</DialogTitle>
                        <DialogDescription>
                            {selectedNodeIds.length === 0
                                ? "Δεν έχουν επιλεγεί ενότητες."
                                : `Ανάλυση για ${selectedNodeIds.length} επιλεγμένες ενότητες.`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4 min-h-[200px]">
                        {!fetched && !loading && (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                                <ListChecks className="w-8 h-8 opacity-20" />
                                <p className="text-sm">Πατήστε "Έλεγχος" για να δείτε τα προαπαιτούμενα.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="flex flex-col items-center justify-center h-40 gap-2 text-primary">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="text-sm">Ανάκτηση δεδομένων...</span>
                            </div>
                        )}

                        {fetched && !loading && results.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 gap-2 text-green-600">
                                <CheckCircle className="w-8 h-8" />
                                <p className="font-medium">Δεν βρέθηκαν καταγεγραμμένα προαπαιτούμενα.</p>
                                <p className="text-xs text-muted-foreground">Οι ενότητες αυτές δεν έχουν ειδικές απαιτήσεις στη βάση.</p>
                            </div>
                        )}

                        {fetched && !loading && results.length > 0 && (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800/50 flex gap-3">
                                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-800 dark:text-amber-200">
                                        Οι παρακάτω γνώσεις θεωρούνται απαραίτητες για την κατανόηση των επιλεγμένων θεμάτων.
                                    </div>
                                </div>

                                {results.map((item) => (
                                    <div key={item.id} className="border rounded-lg p-3 space-y-2">
                                        <h4 className="font-medium text-sm text-primary flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            {item.title}
                                        </h4>
                                        <div className="pl-3.5 border-l-2 border-muted ml-0.5">
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {item.prerequisites}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Κλείσιμο</Button>
                        <Button onClick={handleCheck} disabled={loading || selectedNodeIds.length === 0}>
                            {loading ? "Φόρτωση..." : "Έλεγχος"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PrerequisiteChecker;
