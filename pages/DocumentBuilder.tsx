import React, { useState } from 'react';
import { Button, Input, Textarea, Select, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { FileText, Wand2, RefreshCw } from 'lucide-react';
import { apiBuildDocument } from '../services/agentApiService';
import { DocumentEditor } from '../components/DocumentEditor';

const DocumentBuilder: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [docType, setDocType] = useState<'article' | 'report' | 'cv' | 'letter'>('article');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');

    const handleGenerate = async () => {
        if (!title) return;
        setLoading(true);
        try {
            // @ts-ignore
            const res = await apiBuildDocument({ type: docType, title, content });
            setGeneratedCode(res.latex);
        } catch (error) {
            console.error(error);
            alert("Failed to generate document");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 h-screen flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Article Writer</h1>
                    <p className="text-sm text-muted-foreground">Generate structured LaTeX documents.</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 h-full min-h-0">
                {/* Left Panel: Configuration */}
                <Card className="col-span-12 lg:col-span-3 h-fit overflow-auto max-h-full">
                    <CardHeader>
                        <CardTitle className="text-lg">Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select value={docType} onChange={(e) => setDocType(e.target.value as any)}>
                                <option value="article">Article</option>
                                <option value="report">Report</option>
                                <option value="cv">CV</option>
                                <option value="letter">Letter</option>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title..." />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Context</label>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Outline..."
                                className="h-32"
                            />
                        </div>

                        <Button onClick={handleGenerate} disabled={loading || !title} className="w-full">
                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Generate
                        </Button>
                    </CardContent>
                </Card>

                {/* Right Panel: Editor */}
                <div className="col-span-12 lg:col-span-9 h-full min-h-0">
                    <DocumentEditor
                        initialCode={generatedCode || "% Generated LaTeX will appear here..."}
                        title={title || "Untitled Document"}
                        isGenerating={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default DocumentBuilder;
