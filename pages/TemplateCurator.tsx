import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, Button, Dialog, DialogContent, DialogTrigger } from '../components/ui';
import { LayoutTemplate, Check, Eye } from 'lucide-react';
import { TEMPLATE_STYLES } from '../services/templateService';
import { useNavigate } from 'react-router-dom';
import { StudioWorkspace } from '../components/doc-studio/StudioWorkspace';

const TemplateCurator: React.FC = () => {
    const navigate = useNavigate();

    const handleUseTemplate = (styleId: string) => {
        // Default to Exam generator for now
        navigate(`/create?style=${styleId}`);
    };

    const galleryContent = (
        <div className="p-8 h-full overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                {TEMPLATE_STYLES.map((tpl) => (
                    <Card key={tpl.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200 border-muted/60 data-[state=active]:border-primary">
                        <div className="h-40 bg-muted/30 relative group overflow-hidden">
                            {tpl.image ? (
                                <img src={tpl.image} alt={tpl.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/20 text-muted-foreground/30">
                                    <LayoutTemplate className="w-12 h-12" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="secondary" size="sm" className="h-8">
                                            <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden bg-muted/10 outline-none border-none">
                                        <div className="p-4 bg-background/80 backdrop-blur-md border-b flex justify-between items-center sticky top-0 z-10">
                                            <h3 className="font-semibold tracking-tight">{tpl.name} Preview</h3>
                                            <Button size="sm" onClick={() => handleUseTemplate(tpl.id)}>
                                                Use This Template
                                            </Button>
                                        </div>
                                        <div className="flex-1 overflow-auto p-8 flex justify-center bg-gray-100/50 dark:bg-gray-900/50">
                                            {tpl.image ? (
                                                <img src={tpl.image} alt={tpl.name} className="shadow-2xl rounded-sm max-w-full ring-1 ring-border" />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                                    <LayoutTemplate className="w-16 h-16 mb-4 opacity-20" />
                                                    <p>Top-quality LaTeX template</p>
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start gap-2">
                                <CardTitle className="text-base font-semibold leading-tight">{tpl.name}</CardTitle>
                                {tpl.previewColor && (
                                    <div className="w-3 h-3 rounded-full shrink-0 ring-1 ring-border" style={{ backgroundColor: tpl.previewColor }} title="Accent Color" />
                                )}
                            </div>
                            <CardDescription className="text-xs line-clamp-2 mt-1">{tpl.description}</CardDescription>
                        </CardHeader>
                        <div className="px-4 pb-2 flex-1">
                            <div className="flex flex-wrap gap-1.5">
                                {tpl.tags?.slice(0, 3).map(tag => (
                                    <span key={tag} className="px-1.5 py-0.5 bg-secondary/50 text-[10px] rounded-md text-secondary-foreground font-medium uppercase tracking-wider">{tag}</span>
                                ))}
                                {(tpl.tags?.length || 0) > 3 && (
                                    <span className="px-1.5 py-0.5 bg-muted text-[10px] rounded-md text-muted-foreground">+{(tpl.tags?.length || 0) - 3}</span>
                                )}
                            </div>
                        </div>
                        <CardFooter className="p-4 pt-2 mt-auto border-t bg-muted/10">
                            <Button size="sm" variant="ghost" className="w-full text-xs hover:bg-primary/10 hover:text-primary h-8" onClick={() => handleUseTemplate(tpl.id)}>
                                <Check className="w-3.5 h-3.5 mr-1.5" /> Use Template
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );

    return (
        <StudioWorkspace
            title="Template Curator"
            icon={LayoutTemplate}
            iconColor="text-pink-500"
            iconBgColor="bg-pink-500/10"
            previewPanel={galleryContent}
        />
    );
};

export default TemplateCurator;
