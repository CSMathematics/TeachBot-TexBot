import React, { useState } from 'react';
import { Button, Input, Label } from '../components/ui';
import { Presentation, Wand2, RefreshCw } from 'lucide-react';
import { apiCreatePresentation } from '../services/agentApiService';
import { DocumentEditor } from '../components/DocumentEditor';
import { StudioWorkspace } from '../components/doc-studio/StudioWorkspace';

const PresentationCreator: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [topic, setTopic] = useState('');
    const [slideCount, setSlideCount] = useState(10);
    const [generatedCode, setGeneratedCode] = useState('');

    const handleGenerate = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const res = await apiCreatePresentation({ topic, title: topic, slideCount });
            setGeneratedCode(res.latex);
        } catch (error) {
            console.error(error);
            alert("Failed to generate presentation");
        } finally {
            setLoading(false);
        }
    };

    const configPanel = (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Presentation Settings</h3>
                <p className="text-xs text-muted-foreground">Configure your Beamer slide deck.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Topic / Title</Label>
                    <Input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Introduction to Neural Networks"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Number of Slides</Label>
                    <Input
                        type="number"
                        value={slideCount}
                        onChange={(e) => setSlideCount(Number(e.target.value))}
                        min={3}
                        max={20}
                    />
                    <p className="text-xs text-muted-foreground">Recommended: 8-15 slides</p>
                </div>

                <Button onClick={handleGenerate} disabled={loading || !topic} className="w-full">
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Generate Slides
                </Button>
            </div>
        </div>
    );

    return (
        <StudioWorkspace
            title="Presentation Maker"
            icon={Presentation}
            iconColor="text-blue-500"
            iconBgColor="bg-blue-500/10"
            configPanel={configPanel}
            previewPanel={
                <DocumentEditor
                    initialCode={generatedCode || "% Generated Slides will appear here..."}
                    title={topic || "New Presentation"}
                    isGenerating={loading}
                />
            }
        />
    );
};

export default PresentationCreator;
