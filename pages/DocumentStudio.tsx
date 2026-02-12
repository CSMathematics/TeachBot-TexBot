import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Layout, Image, Table as TableIcon, Presentation, BookOpen, LayoutTemplate } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';

const DocumentStudio: React.FC = () => {
    const tools = [
        { title: 'Article Writer', description: 'Create academic papers and reports', icon: FileText, color: 'text-orange-500', href: '/studio/document' },
        { title: 'Presentation Maker', description: 'Generate Beamer slides', icon: Presentation, color: 'text-blue-500', href: '/studio/presentation' },
        { title: 'Figure Wizard', description: 'Create TikZ figures and plots', icon: Image, color: 'text-green-500', href: '/studio/figure' },
        { title: 'Table Architect', description: 'Format complex LaTeX tables', icon: TableIcon, color: 'text-purple-500', href: '/studio/table' },
        { title: 'Bibliography Manager', description: 'Format citations (BibTeX)', icon: BookOpen, color: 'text-yellow-500', href: '/studio/bibliography' },
        { title: 'Template Curator', description: 'Browse LaTeX templates', icon: LayoutTemplate, color: 'text-pink-500', href: '/studio/template' },
    ];

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Layout className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Document Studio</h1>
                    <p className="text-muted-foreground">Professional tools for creating LaTeX documents, figures, and presentations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map((tool) => (
                    <Link key={tool.title} to={tool.href}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-transparent hover:border-l-primary h-full">
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-md bg-secondary ${tool.color}`}>
                                        <tool.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">{tool.title}</CardTitle>
                                        <CardDescription className="mt-1">{tool.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="mt-12 p-6 border rounded-lg bg-muted/30 text-center">
                <p className="text-muted-foreground">Select a tool above to get started.</p>
            </div>
        </div>
    );
};

export default DocumentStudio;
