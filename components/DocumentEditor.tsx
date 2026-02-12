import React, { useState, useEffect } from 'react';
import { Card } from './ui';
import { Button } from './ui';
import { Layout, Save, RefreshCw, Download, FileText, Code, CheckCircle, AlertTriangle } from 'lucide-react';
import LatexFixer from './LatexFixer';
import LatexRenderer from './LatexRenderer';

interface DocumentEditorProps {
    initialCode: string;
    title?: string;
    onSave?: (code: string) => void;
    isGenerating?: boolean;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
    initialCode,
    title = "Document Editor",
    onSave,
    isGenerating = false
}) => {
    const [code, setCode] = useState(initialCode);
    const [showPreview, setShowPreview] = useState(true);
    const [autoCompile, setAutoCompile] = useState(true);

    // Update code if initialCode changes (e.g. after generation)
    useEffect(() => {
        setCode(initialCode);
    }, [initialCode]);

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.tex';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-md">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-sm">{title}</span>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-600 mx-2" />
                    <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                        {showPreview ? <Code className="w-4 h-4 mr-2" /> : <Layout className="w-4 h-4 mr-2" />}
                        {showPreview ? "Show Code" : "Show Preview"}
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <LatexFixer
                        currentLatex={code}
                        onFix={setCode}
                        context={title}
                    />
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Export .tex
                    </Button>
                    {onSave && (
                        <Button size="sm" onClick={() => onSave(code)}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                    )}
                </div>
            </div>

            {/* Editor Main Area */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Code Editor */}
                <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${showPreview ? 'hidden md:flex' : 'flex'}`}>
                    <div className="bg-slate-900 text-slate-200 rounded-t-md p-2 text-xs flex justify-between items-center">
                        <span className="font-mono">source.tex</span>
                        <span className="text-slate-500">LaTeX</span>
                    </div>
                    <textarea
                        className="flex-1 bg-slate-950 text-slate-300 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-b-md overflow-auto"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        spellCheck={false}
                    />
                </div>

                {/* Live Preview */}
                <div className={`flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-300 ${!showPreview ? 'hidden' : 'flex'}`}>
                    <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-2">Preview</span>
                        {isGenerating && <span className="text-xs text-blue-500 animate-pulse flex items-center"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Generating...</span>}
                    </div>

                    <div className="flex-1 overflow-auto p-8 bg-white">
                        <LatexRenderer latex={code} />
                    </div>
                </div>
            </div>
        </div>
    );
};
