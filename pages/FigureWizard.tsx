import React, { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Image, Wand2, RefreshCw } from 'lucide-react';
import { apiGenerateFigure } from '../services/agentApiService';
import { DocumentEditor } from '../components/DocumentEditor';

const FigureWizard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');

    const handleGenerate = async () => {
        if (!description) return;
        setLoading(true);
        try {
            const res = await apiGenerateFigure({ description, type: 'diagram' });
            setGeneratedCode(res.latex);
        } catch (error) {
            console.error(error);
            alert("Failed to generate figure");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 h-screen flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Image className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Figure Wizard</h1>
                    <p className="text-sm text-muted-foreground">Generate TikZ figures from text descriptions.</p>
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
                            <label className="text-sm font-medium">Description</label>
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. A triangle with angles 30, 60, 90" />
                        </div>

                        <Button onClick={handleGenerate} disabled={loading || !description} className="w-full">
                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Generate TikZ
                        </Button>
                    </CardContent>
                </Card>

                {/* Right Panel: Editor */}
                <div className="col-span-12 lg:col-span-9 h-full min-h-0">
                    <DocumentEditor
                        initialCode={generatedCode || "% Generated TikZ will appear here..."}
                        title="New Figure"
                        isGenerating={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default FigureWizard;
