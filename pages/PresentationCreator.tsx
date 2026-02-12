import React, { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Presentation, Wand2, RefreshCw } from 'lucide-react';
import { apiCreatePresentation } from '../services/agentApiService';
import { DocumentEditor } from '../components/DocumentEditor';

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

    return (
        <div className="p-6 h-screen flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Presentation className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Presentation Maker</h1>
                    <p className="text-sm text-muted-foreground">Create Beamer slides from a topic.</p>
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
                            <label className="text-sm font-medium">Topic / Title</label>
                            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Introduction to Neural Networks" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Number of Slides</label>
                            <Input type="number" value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))} min={3} max={20} />
                        </div>

                        <Button onClick={handleGenerate} disabled={loading || !topic} className="w-full">
                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Generate Slides
                        </Button>
                    </CardContent>
                </Card>

                {/* Right Panel: Editor */}
                <div className="col-span-12 lg:col-span-9 h-full min-h-0">
                    <DocumentEditor
                        initialCode={generatedCode || "% Generated Slides will appear here..."}
                        title={topic || "New Presentation"}
                        isGenerating={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default PresentationCreator;
