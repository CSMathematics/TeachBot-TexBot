import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, Button } from '../components/ui';
import { LayoutTemplate, Download, Eye } from 'lucide-react';

const TemplateCurator: React.FC = () => {
    const templates = [
        { title: 'Academic Paper (IEEE)', desc: 'Standard IEEE conference format', tags: ['Article', 'Two Column'] },
        { title: 'Thesis (University)', desc: 'Book layout for dissertations', tags: ['Book', 'Report'] },
        { title: 'Modern CV', desc: 'Clean, minimalist resume', tags: ['CV', 'Minimal'] },
        { title: 'Exam Paper', desc: 'Standard extensive exam layout', tags: ['Exam', 'Math'] },
        { title: 'Presentation (Clean)', desc: 'Simple Beamer theme', tags: ['Beamer', 'Slides'] },
        { title: 'Lab Report', desc: 'Scientific experiment report', tags: ['Report', 'Science'] },
    ];

    return (
        <div className="p-8 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                    <LayoutTemplate className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Template Curator</h1>
                    <p className="text-muted-foreground">Browse and download high-quality LaTeX templates.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((tpl, i) => (
                    <Card key={i} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg">{tpl.title}</CardTitle>
                            <CardDescription>{tpl.desc}</CardDescription>
                        </CardHeader>
                        <div className="px-6 pb-2">
                            <div className="flex flex-wrap gap-2">
                                {tpl.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-secondary text-xs rounded-full text-secondary-foreground">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1"></div>
                        <CardFooter className="flex justify-between pt-6 border-t mt-4">
                            <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4 mr-2" /> Preview
                            </Button>
                            <Button size="sm">
                                <Download className="w-4 h-4 mr-2" /> Use
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default TemplateCurator;
