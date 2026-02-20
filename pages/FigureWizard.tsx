import React, { useState } from 'react';
import { Button, Input, Label } from '../components/ui';
import { Image, Wand2, RefreshCw } from 'lucide-react';
import { apiGenerateFigure } from '../services/agentApiService';
import { DocumentEditor } from '../components/DocumentEditor';
import { StudioWorkspace } from '../components/doc-studio/StudioWorkspace';

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

    const configPanel = (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Figure Settings</h3>
                <p className="text-xs text-muted-foreground">Describe the diagram you want to generate.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. A triangle with angles 30, 60, 90"
                    />
                </div>

                <Button onClick={handleGenerate} disabled={loading || !description} className="w-full">
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Generate TikZ
                </Button>
            </div>
        </div>
    );

    return (
        <StudioWorkspace
            title="Figure Wizard"
            icon={Image}
            iconColor="text-green-500"
            iconBgColor="bg-green-500/10"
            configPanel={configPanel}
            previewPanel={
                <DocumentEditor
                    initialCode={generatedCode || "% Generated TikZ will appear here..."}
                    title="New Figure"
                    isGenerating={loading}
                />
            }
        />
    );
};

export default FigureWizard;
