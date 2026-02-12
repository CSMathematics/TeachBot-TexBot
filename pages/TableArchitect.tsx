import React, { useState } from 'react';
import { Button, Textarea, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Table as TableIcon, Wand2, RefreshCw, Download, Copy } from 'lucide-react';
import { apiFormatTable } from '../services/agentApiService';

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

    return (
        <div className="p-8 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <TableIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Table Architect</h1>
                    <p className="text-muted-foreground">Format complex LaTeX tables from data.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Data Input (CSV Format)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Raw Data</label>
                            <Textarea
                                value={dataInput}
                                onChange={(e) => setDataInput(e.target.value)}
                                placeholder="Name, Age, Occupation&#10;John Doe, 30, Engineer&#10;Jane Smith, 25, Designer"
                                className="h-60 font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">Enter data in CSV format (comma separated).</p>
                        </div>

                        <Button onClick={handleGenerate} disabled={loading || !dataInput} className="w-full">
                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Format Table
                        </Button>
                    </CardContent>
                </Card>

                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                        <CardTitle>LaTeX Output</CardTitle>
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
                                <p>Generated LATEX will appear here</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TableArchitect;
