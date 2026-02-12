import React, { useState } from 'react';
import { Button, Textarea, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { RefreshCw, CheckCircle, AlertTriangle, Wand2, Copy } from 'lucide-react';
import { apiFixLatex } from '../services/agentApiService';

interface LatexFixerProps {
    initialCode?: string;
    onFix?: (fixedCode: string) => void;
}

const LatexFixer: React.FC<LatexFixerProps> = ({ initialCode = '', onFix }) => {
    const [code, setCode] = useState(initialCode);
    const [errorLog, setErrorLog] = useState('');
    const [loading, setLoading] = useState(false);
    const [fixedCode, setFixedCode] = useState('');

    const handleFix = async () => {
        if (!code) return;
        setLoading(true);
        try {
            const res = await apiFixLatex({ latexCode: code, errorMessage: errorLog });
            setFixedCode(res.latex);
            if (onFix) onFix(res.latex);
        } catch (error) {
            console.error(error);
            alert("Failed to fix LaTeX");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-primary" />
                    LaTeX Fixer
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase text-muted-foreground">Broken Code</label>
                        <Textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Paste LaTeX code here..."
                            className="h-40 font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase text-muted-foreground">Error Log (Optional)</label>
                        <Textarea
                            value={errorLog}
                            onChange={(e) => setErrorLog(e.target.value)}
                            placeholder="Paste compiler error log here..."
                            className="h-40 font-mono text-xs text-red-500/80"
                        />
                    </div>
                </div>

                <Button onClick={handleFix} disabled={loading || !code} className="w-full">
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Attempt Fix
                </Button>

                {fixedCode && (
                    <div className="space-y-2 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium uppercase text-green-600">Fixed Result</label>
                            <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(fixedCode)}>
                                <Copy className="w-3 h-3 mr-1" /> Copy
                            </Button>
                        </div>
                        <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs font-mono">
                            {fixedCode}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default LatexFixer;
