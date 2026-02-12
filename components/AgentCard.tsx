import React from 'react';
import { Agent, AgentStatus, AgentDomain } from '../types';
import {
  Bot, FileText, Brain, CheckCircle, Loader2, Copy, Gauge,
  Lightbulb, AlertTriangle, ClipboardCheck, Network, ListChecks,
  GitBranch, GraduationCap, Shapes, Table, BookMarked,
  LayoutTemplate, Wrench, FileCheck, Presentation
} from 'lucide-react';
import { Card, CardContent } from './ui';
import { cn } from '../lib/utils';

interface AgentCardProps {
  agent: Agent;
  variant?: 'compact' | 'full' | 'working';
  onClick?: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Brain: <Brain className="w-5 h-5" />,
  Bot: <Bot className="w-5 h-5" />,
  CheckCircle: <CheckCircle className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  FileCheck: <FileCheck className="w-5 h-5" />,
  Copy: <Copy className="w-5 h-5" />,
  Gauge: <Gauge className="w-5 h-5" />,
  Lightbulb: <Lightbulb className="w-5 h-5" />,
  AlertTriangle: <AlertTriangle className="w-5 h-5" />,
  ClipboardCheck: <ClipboardCheck className="w-5 h-5" />,
  Network: <Network className="w-5 h-5" />,
  ListChecks: <ListChecks className="w-5 h-5" />,
  GitBranch: <GitBranch className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Shapes: <Shapes className="w-5 h-5" />,
  Table: <Table className="w-5 h-5" />,
  Presentation: <Presentation className="w-5 h-5" />,
  BookMarked: <BookMarked className="w-5 h-5" />,
  LayoutTemplate: <LayoutTemplate className="w-5 h-5" />,
  Wrench: <Wrench className="w-5 h-5" />,
};

const AgentCard: React.FC<AgentCardProps> = ({ agent, variant = 'working', onClick }) => {
  const icon = ICON_MAP[agent.icon] || <Bot className="w-5 h-5" />;
  const isWorking = agent.status === AgentStatus.WORKING;
  const isCompleted = agent.status === AgentStatus.COMPLETED;
  const isError = agent.status === AgentStatus.ERROR;
  const isEducation = agent.domain === AgentDomain.EDUCATION;

  if (variant === 'full') {
    return (
      <Card
        className={cn(
          "transition-all duration-300 cursor-pointer group hover:shadow-lg hover:-translate-y-1",
          /* Removed border-border */
        )}
        onClick={onClick}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-xl shrink-0 transition-colors",
              isEducation
                ? "bg-cyan-500/10 text-cyan-600 group-hover:bg-cyan-500/20 dark:text-cyan-400"
                : "bg-orange-500/10 text-orange-600 group-hover:bg-orange-500/20 dark:text-orange-400"
            )}>
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold leading-none truncate">{agent.name}</h3>
                <span className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0",
                  isEducation
                    ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                    : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                )}>
                  {isEducation ? 'EDU' : 'DOC'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{agent.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default: working/compact variant (used in ExamGenerator sidebar)
  return (
    <Card className={cn(
      "transition-all duration-300",
      isWorking && "border-primary shadow-md ring-1 ring-primary/20",
      isCompleted && "bg-muted/50 opacity-80",
      isError && "border-destructive/50 bg-destructive/10"
    )}>
      <CardContent className="p-4 flex items-center space-x-4">
        <div className={cn(
          "p-2 rounded-full border",
          isWorking ? "bg-primary/10 border-primary/20 text-primary" : "bg-background border-border text-muted-foreground",
          isCompleted && "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
        )}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold leading-none">{agent.name}</h3>
            {isWorking && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
            {isCompleted && <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />}
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {isWorking ? "Processing..." : agent.role}
          </p>
        </div>
      </CardContent>

      {isWorking && (
        <div className="h-0.5 w-full bg-primary/10 overflow-hidden rounded-b-lg">
          <div className="h-full bg-primary w-full animate-pulse rounded-full" />
        </div>
      )}
    </Card>
  );
};

export default AgentCard;