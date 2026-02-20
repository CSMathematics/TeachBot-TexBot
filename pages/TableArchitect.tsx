import React, { useState } from 'react';
import { Button, Textarea, Label } from '../components/ui';
import { Table as TableIcon, Wand2, RefreshCw, Download } from 'lucide-react';
import { apiFormatTable } from '../services/agentApiService';
import { StudioWorkspace } from '../components/doc-studio/StudioWorkspace';
import { DocumentEditor } from '../components/DocumentEditor';

const TableArchitect: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dataInput, setDataInput] = useState('');
    const [result, setResult] = useState<any>(null);

    const handleGenerate = async () => {
        if (!dataInput) return;
        setLoading(true);
        try {
            // Simple parsing of CSV-like input for demo
            const rows = dataInput.trim().split('\n').map(row => row.split(','));
            if (rows.length < 2) {
                alert("Please provide at least a header row and one data row.");
                setLoading(false);
                return;
            }
            const headers = rows[0];
            const data = rows.slice(1);

            const res = await apiFormatTable({ headers, data, style: 'booktabs' });
            setResult(res);
        } catch (error) {
            console.error(error);
            alert("Failed to generate table");
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
        a.download = 'table.tex';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const configPanel = (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Table Data</h3>
                <p className="text-xs text-muted-foreground">Input your data in CSV format to generate a LaTeX table.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Raw Data (CSV)</Label>
                    <Textarea
                        value={dataInput}
                        onChange={(e) => setDataInput(e.target.value)}
                        placeholder="Name, Age, Occupation&#10;John Doe, 30, Engineer&#10;Jane Smith, 25, Designer"
                        className="h-80 font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">Format: Header row followed by data rows.</p>
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
            <Button size="sm" onClick={handleGenerate} disabled={loading || !dataInput}>
                {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Format Table
            </Button>
        </div>
    );

    return (
        <StudioWorkspace
            title="Table Architect"
            icon={TableIcon}
            iconColor="text-purple-500"
            iconBgColor="bg-purple-500/10"
            configPanel={configPanel}
            actions={actions}
            previewPanel={
                <DocumentEditor
                    initialCode={result?.latex || "% Generated Table LaTeX will appear here..."}
                    title="Table Output"
                    isGenerating={loading}
                    hideToolbar={true}
                />
            }
        />
    );
};

export default TableArchitect;
