import React, { useState } from 'react';
import { Button, Textarea, Label } from '../components/ui';
import { BookOpen, Wand2, RefreshCw, Download } from 'lucide-react';
import { apiGenerateBibliography } from '../services/agentApiService';
import { StudioWorkspace } from '../components/doc-studio/StudioWorkspace';
import { DocumentEditor } from '../components/DocumentEditor';

const BibliographyManager: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState('');
    const [result, setResult] = useState<any>(null);

    const handleGenerate = async () => {
        if (!entries) return;
        setLoading(true);
        try {
            const res = await apiGenerateBibliography({ entries, style: 'apa' });
            setResult(res);
        } catch (error) {
            console.error(error);
            alert("Failed to generate bibliography");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const textToSave = result?.latex || "";
        const blob = new Blob([textToSave], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bibliography.tex';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const configPanel = (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Bibliography Data</h3>
                <p className="text-xs text-muted-foreground">Input your raw citations to format them.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Raw Citations</Label>
                    <Textarea
                        value={entries}
                        onChange={(e) => setEntries(e.target.value)}
                        placeholder="Paste URLs, titles, or raw text citations here..."
                        className="h-80 resize-none"
                    />
                </div>
            </div>
        </div>
    );

    const actions = (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={!result}>
                <Download className="w-4 h-4 mr-2" />
                Export .tex
            </Button>
            <Button size="sm" onClick={handleGenerate} disabled={loading || !entries}>
                {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Format Bibliography
            </Button>
        </div>
    );

    return (
        <StudioWorkspace
            title="Bibliography Manager"
            icon={BookOpen}
            iconColor="text-yellow-500"
            iconBgColor="bg-yellow-500/10"
            configPanel={configPanel}
            actions={actions}
            previewPanel={
                <DocumentEditor
                    initialCode={result?.latex || "% BibTeX/BibLaTeX entries will appear here..."}
                    title="BibTeX Output"
                    isGenerating={loading}
                    hideToolbar={true}
                />
            }
        />
    );
};

export default BibliographyManager;
