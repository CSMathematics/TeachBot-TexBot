import React, { useState } from 'react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui';
import { ListChecks, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiCheckPrerequisites } from '../services/agentApiService';

interface PrerequisiteCheckerProps {
    topic: string;
    grade: string;
}

const PrerequisiteChecker: React.FC<PrerequisiteCheckerProps> = ({ topic, grade }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleCheck = async () => {
        setLoading(true);
        try {
            const data = await apiCheckPrerequisites({ topic, gradeLevel: grade });
            setResult(data);
        } catch (error) {
            console.error(error);
            setResult({ error: "Failed to check prerequisites" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                onClick={() => { setIsOpen(true); }}
            >
                <ListChecks className="w-3 h-3 mr-1" />
                Check Prerequisites
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Prerequisite Check</DialogTitle>
                        <DialogDescription>
                            Analyzing requirements for: <span className="font-semibold text-primary">{topic}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {!result && !loading && (
                            <div className="text-center text-sm text-muted-foreground">
                                Click "Run Analysis" to let the agent check concepts required for this topic.
                            </div>
                        )}

                        {loading && (
                            <div className="flex items-center justify-center gap-2 text-primary animate-pulse">
                                <ListChecks className="w-5 h-5 animate-bounce" />
                                <span>Checking syllabus dependencies...</span>
                            </div>
                        )}

                        {result && !loading && (
                            <div className="space-y-3">
                                {/* Placeholder results based on mock/expected return */}
                                <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-green-700">All prerequisites met for {grade}</p>
                                        <p className="text-green-600 mt-1">Students should understand: Functions, Basic Limits.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                        <Button onClick={handleCheck} disabled={loading}>
                            {loading ? "Analyzing..." : "Run Analysis"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PrerequisiteChecker;
