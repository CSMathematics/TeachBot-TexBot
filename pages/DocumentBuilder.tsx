import React, { useState } from 'react';
import { Button, Input, Textarea, Select, Label } from '../components/ui';
import { FileText, Wand2, RefreshCw } from 'lucide-react';
import { apiBuildDocument } from '../services/agentApiService';
import { DocumentEditor } from '../components/DocumentEditor';
import { StudioWorkspace } from '../components/doc-studio/StudioWorkspace';

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

    const configPanel = (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Document Settings</h3>
                <p className="text-xs text-muted-foreground">Configure the structure and type of your document.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select value={docType} onChange={(e) => setDocType(e.target.value as any)}>
                        <option value="article">Article</option>
                        <option value="report">Report</option>
                        <option value="cv">CV / Resume</option>
                        <option value="letter">Formal Letter</option>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. The Future of AI"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label>Content Outline / Context</Label>
                        <span className="text-xs text-muted-foreground">{content.length} chars</span>
                    </div>
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe the sections, key points, or paste rough notes here..."
                        className="h-48 resize-none"
                    />
                </div>

                <Button onClick={handleGenerate} disabled={loading || !title} className="w-full">
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Generate Document
                </Button>
            </div>
        </div>
    );

    return (
        <StudioWorkspace
            title="Article Writer"
            icon={FileText}
            iconColor="text-orange-500"
            iconBgColor="bg-orange-500/10"
            configPanel={configPanel}
            previewPanel={
                <DocumentEditor
                    initialCode={generatedCode || "% Generated LaTeX will appear here..."}
                    title={title || "Untitled Document"}
                    isGenerating={loading}
                />
            }
        />
    );
};

export default DocumentBuilder;
