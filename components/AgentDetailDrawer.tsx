import React from 'react';
import { X, ExternalLink, Zap, ChevronRight, Globe } from 'lucide-react';
import {
    Bot, FileText, Brain, CheckCircle, Copy, Gauge,
    Lightbulb, AlertTriangle, ClipboardCheck, Network, ListChecks,
    GitBranch, GraduationCap, Shapes, Table, BookMarked,
    LayoutTemplate, Wrench, FileCheck, Presentation
} from 'lucide-react';
import { AgentCapability, AgentDomain } from '../types';
import { Button, Badge } from './ui';
import { cn } from '../lib/utils';

interface AgentDetailDrawerProps {
    agent: AgentCapability | null;
    open: boolean;
    onClose: () => void;
    onQuickAction: (agent: AgentCapability) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
    Brain: <Brain className="w-6 h-6" />,
    Bot: <Bot className="w-6 h-6" />,
    CheckCircle: <CheckCircle className="w-6 h-6" />,
    FileText: <FileText className="w-6 h-6" />,
    FileCheck: <FileCheck className="w-6 h-6" />,
    Copy: <Copy className="w-6 h-6" />,
    Gauge: <Gauge className="w-6 h-6" />,
    Lightbulb: <Lightbulb className="w-6 h-6" />,
    AlertTriangle: <AlertTriangle className="w-6 h-6" />,
    ClipboardCheck: <ClipboardCheck className="w-6 h-6" />,
    Network: <Network className="w-6 h-6" />,
    ListChecks: <ListChecks className="w-6 h-6" />,
    GitBranch: <GitBranch className="w-6 h-6" />,
    GraduationCap: <GraduationCap className="w-6 h-6" />,
    Shapes: <Shapes className="w-6 h-6" />,
    Table: <Table className="w-6 h-6" />,
    Presentation: <Presentation className="w-6 h-6" />,
    BookMarked: <BookMarked className="w-6 h-6" />,
    LayoutTemplate: <LayoutTemplate className="w-6 h-6" />,
    Wrench: <Wrench className="w-6 h-6" />,
};

const AgentDetailDrawer: React.FC<AgentDetailDrawerProps> = ({ agent, open, onClose, onQuickAction }) => {
    if (!agent) return null;

    const isEducation = agent.domain === AgentDomain.EDUCATION;
    const icon = ICON_MAP[agent.icon] || <Bot className="w-6 h-6" />;
    const accentClass = isEducation
        ? 'text-cyan-600 dark:text-cyan-400'
        : 'text-orange-600 dark:text-orange-400';
    const accentBg = isEducation
        ? 'bg-cyan-500/10'
        : 'bg-orange-500/10';

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300",
                    open ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed top-0 right-0 z-50 h-full w-full max-w-md",
                    "bg-background/95 backdrop-blur-xl border-l border-border",
                    "shadow-2xl shadow-black/20",
                    "transition-transform duration-300 ease-out",
                    open ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-3 rounded-xl", accentBg, accentClass)}>
                                {icon}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">{agent.nameEl}</h2>
                                <p className="text-xs text-muted-foreground">{agent.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Domain Badge & Status */}
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn(
                                "text-xs",
                                isEducation
                                    ? "border-cyan-500/30 text-cyan-600 dark:text-cyan-400"
                                    : "border-orange-500/30 text-orange-600 dark:text-orange-400"
                            )}>
                                {isEducation ? '🎓 Education' : '📄 Documents'}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-green-500/30 text-green-600 dark:text-green-400">
                                ● Online
                            </Badge>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                                Περιγραφή
                            </h3>
                            <p className="text-sm leading-relaxed">{agent.descriptionEl}</p>
                            <p className="text-xs text-muted-foreground mt-1 italic">{agent.description}</p>
                        </div>

                        {/* Capabilities */}
                        {agent.capabilities && agent.capabilities.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                                    Δυνατότητες
                                </h3>
                                <ul className="space-y-2">
                                    {agent.capabilities.map((cap, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm">
                                            <ChevronRight className={cn("w-4 h-4 mt-0.5 shrink-0", accentClass)} />
                                            <span>{cap}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Technical Info */}
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Τεχνικά
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Endpoint</span>
                                    <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                                        {agent.endpoint}
                                    </code>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Agent ID</span>
                                    <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                                        {agent.id}
                                    </code>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Χρώμα</span>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded-full border border-border"
                                            style={{ backgroundColor: agent.color }}
                                        />
                                        <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                                            {agent.color}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="p-6 border-t border-border/50 bg-background/80">
                        {agent.quickAction && (
                            <Button
                                className="w-full gap-2 text-sm font-semibold"
                                onClick={() => onQuickAction(agent)}
                            >
                                <Zap className="w-4 h-4" />
                                {agent.quickAction.labelEl}
                                <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-60" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AgentDetailDrawer;
