import React, { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Network, Wand2, Download, Save, RefreshCw } from 'lucide-react';
import { apiGenerateMindmap } from '../services/agentApiService';
import { AgentStatus } from '../types';

const MindmapGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [mindmapData, setMindmapData] = useState<any>(null);

    const handleGenerate = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const result = await apiGenerateMindmap({ topic, depth: 2 });
            setMindmapData(result);
        } catch (error) {
            console.error("Failed to generate mindmap:", error);
            alert("Failed to generate mindmap. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Network className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mindmap Generator</h1>
                    <p className="text-muted-foreground">Visualize concepts and their relationships using AI.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Mindmap</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Input
                            placeholder="Enter a topic (e.g., 'Derivatives in Calculus')"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="flex-1"
                        />
                        <Button onClick={handleGenerate} disabled={loading || !topic} className="min-w-[150px]">
                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Generate
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {mindmapData && (
                <Card className="min-h-[500px] flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between border-b">
                        <CardTitle>Result: {topic}</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Save className="w-4 h-4 mr-2" /> Save
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" /> Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
                        <div className="text-center p-12 text-muted-foreground">
                            <Network className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">Visualization Placeholder</p>
                            <p className="text-sm">React Flow integration coming in next update.</p>
                            <pre className="mt-8 text-xs text-left bg-black/5 p-4 rounded overflow-auto max-w-lg mx-auto max-h-60">
                                {JSON.stringify(mindmapData, null, 2)}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default MindmapGenerator;
