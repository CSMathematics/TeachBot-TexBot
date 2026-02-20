import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface StudioWorkspaceProps {
    /** The content for the left configuration panel */
    configPanel?: ReactNode;
    /** The content for the right preview/editor panel */
    previewPanel: ReactNode;
    /** Optional toolbar or header actions */
    actions?: ReactNode;
    /** Title of the current workspace/tool */
    title: string;
    /** Icon for the current workspace/tool */
    icon?: React.ElementType;
    iconColor?: string;
    iconBgColor?: string;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
    configPanel,
    previewPanel,
    actions,
    title,
    icon: Icon,
    iconColor = "text-primary",
    iconBgColor = "bg-primary/10"
}) => {
    return (
        <div className="flex flex-col h-full overflow-hidden bg-background/50 backdrop-blur-sm">
            {/* Workspace Header - Minimal & Clean */}
            <div className="h-14 border-b flex items-center justify-between px-6 bg-background/95 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className={cn("p-1.5 rounded-md", iconBgColor)}>
                            <Icon className={cn("w-5 h-5", iconColor)} />
                        </div>
                    )}
                    <h1 className="font-semibold text-lg tracking-tight">{title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            </div>

            {/* Split View Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Configuration */}
                {configPanel && (
                    <div className="w-96 flex-shrink-0 border-r bg-card/50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
                            <div className="space-y-6">
                                {configPanel}
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Panel: Preview/Editor */}
                <div className="flex-1 overflow-hidden bg-muted/20 flex flex-col relative h-full">
                    {previewPanel}
                </div>
            </div>
        </div>
    );
};
