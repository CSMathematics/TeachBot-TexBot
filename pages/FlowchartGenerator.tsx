import React, { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { GitBranch, Wand2, RefreshCw, ListOrdered } from 'lucide-react';
import { apiGenerateFlowchart } from '../services/agentApiService';
import ReactFlowChart from '../components/Flowchart/ReactFlowChart';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

const FlowchartGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [method, setMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [flowchartData, setFlowchartData] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const result = await apiGenerateFlowchart({
                topic,
                depth: 2,
                method: method || undefined,
            });
            setFlowchartData(result);
        } catch (error) {
            console.error("Failed to generate flowchart:", error);
            alert("Αποτυχία δημιουργίας flowchart. Δοκιμάστε ξανά.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyMermaid = () => {
        if (!flowchartData?.mermaid) return;
        navigator.clipboard.writeText(flowchartData.mermaid);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadSVG = () => {
        const svg = document.querySelector('.flowchart-output svg');
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flowchart-${topic.replace(/\s+/g, '-')}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-8 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <GitBranch className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Flowchart Επίλυσης</h1>
                    <p className="text-muted-foreground">Δημιουργήστε διαγράμματα ροής για μεθόδους επίλυσης ασκήσεων.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Νέο Διάγραμμα Ροής</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Input
                            placeholder="Θέμα (π.χ. «Παραγώγιση», «Εύρεση Ορίων»)"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="flex-1"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <Input
                            placeholder="Μέθοδος (προαιρετικό, π.χ. «Κανόνας αλυσίδας»)"
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="flex-1"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <Button onClick={handleGenerate} disabled={loading || !topic} className="min-w-[160px]">
                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Δημιουργία
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {flowchartData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Flowchart Visualization */}
                    <Card className="lg:col-span-2 min-h-[800px] flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between border-b">
                            <CardTitle className="text-lg">{flowchartData.title || `Flowchart: ${topic}`}</CardTitle>
                            <div className="flex gap-2">
                                {/* SVG Download to be re-implemented for React Flow if needed */}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 bg-slate-50 dark:bg-slate-900/50 relative">
                            {flowchartData.nodes && flowchartData.edges ? (
                                <ReactFlowChart
                                    initialNodes={flowchartData.nodes}
                                    initialEdges={flowchartData.edges}
                                />
                            ) : (
                                <div className="text-center p-12 text-muted-foreground flex flex-col items-center justify-center h-full">
                                    <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p className="text-lg font-medium">Δεν βρέθηκε flowchart</p>
                                    <pre className="mt-4 text-xs text-left bg-black/5 dark:bg-white/5 p-4 rounded overflow-auto max-w-lg mx-auto max-h-60">
                                        {JSON.stringify(flowchartData, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Steps Panel */}
                    <Card className="flex flex-col h-[600px]">
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ListOrdered className="w-5 h-5" />
                                Βήματα Επίλυσης
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-4 space-y-3 overflow-y-auto">
                            {flowchartData.steps && flowchartData.steps.length > 0 ? (
                                flowchartData.steps.map((step: any, i: number) => (
                                    <div
                                        key={step.id || i}
                                        className="p-3 rounded-lg border border-border/50 bg-card hover:bg-secondary/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                                {i + 1}
                                            </span>
                                            <span className="font-medium text-sm">{step.label}</span>
                                        </div>
                                        {step.description && (
                                            <p className="text-xs text-muted-foreground ml-8">
                                                <Latex>{step.description}</Latex>
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Δεν βρέθηκαν βήματα.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default FlowchartGenerator;
