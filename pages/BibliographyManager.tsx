import React, { useState } from 'react';
import { Button, Textarea, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { BookOpen, Wand2, RefreshCw, Copy, Download } from 'lucide-react';
// import { apiGenerateBibliography } from '../services/agentApiService'; // Assuming this exists or I need to create it

const BibliographyManager: React.FC = () => {
    // Placeholder logic for now as apiGenerateBibliography might need to be verified
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState('');
    const [result, setResult] = useState<any>(null);

    const handleGenerate = async () => {
        if (!entries) return;
        setLoading(true);
        try {
            // Mocking the call for now or using a generic one if specific API not ready
            // const res = await apiGenerateBibliography({ entries: entries.split('\n'), style: 'apa' });
            // setResult(res);
            setTimeout(() => {
                setResult({ latex: "% Bibliography generated\n\\begin{thebibliography}{9}\n\\bibitem{lamport94}\n  Leslie Lamport,\n  \\emph{\\LaTeX: A Document Preparation System}.\n  Addison Wesley, Massachusetts,\n  2nd Edition,\n  1994.\n\\end{thebibliography}" });
                setLoading(false);
            }, 1500);
        } catch (error) {
            console.error(error);
            alert("Failed to generate bibliography");
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <BookOpen className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bibliography Manager</h1>
                    <p className="text-muted-foreground">Format citations and references (BibTeX/BibLaTeX).</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>References Input</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Raw Citations</label>
                            <Textarea
                                value={entries}
                                onChange={(e) => setEntries(e.target.value)}
                                placeholder="Paste URLs, titles, or raw text citations here..."
                                className="h-60"
                            />
                        </div>

                        <Button onClick={handleGenerate} disabled={loading || !entries} className="w-full">
                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Format Bibliography
                        </Button>
                    </CardContent>
                </Card>

                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                        <CardTitle>BibTeX Output</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(result?.latex || '')}>
                                <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 bg-[#282c34] relative min-h-[400px]">
                        {result ? (
                            <pre className="p-4 text-xs text-[#abb2bf] font-mono overflow-auto absolute inset-0">
                                {result.latex}
                            </pre>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                <p>BibTeX entries will appear here</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BibliographyManager;
