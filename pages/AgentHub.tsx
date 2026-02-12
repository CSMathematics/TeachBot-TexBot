import React, { useState, useEffect, useMemo } from 'react';
import { Search, Bot, FileText, Zap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '../components/ui';
import AgentCard from '../components/AgentCard';
import { AgentDomain, AgentStatus, Agent } from '../types';
import { AGENT_REGISTRY, getEducationAgents, getDocumentAgents } from '../services/agentRegistry';
import { checkBackendHealth, fetchAgentCatalog, AgentInfo } from '../services/agentApiService';
import { cn } from '../lib/utils';

type TabKey = 'education' | 'documents';

const AgentHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabKey>('education');
    const [searchQuery, setSearchQuery] = useState('');
    const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
    const [liveStatuses, setLiveStatuses] = useState<Record<string, string>>({});

    // Check backend health on mount
    useEffect(() => {
        checkBackendHealth().then(online => {
            setBackendOnline(online);
            if (online) {
                fetchAgentCatalog()
                    .then(agents => {
                        const statuses: Record<string, string> = {};
                        agents.forEach(a => { statuses[a.id] = a.status; });
                        setLiveStatuses(statuses);
                    })
                    .catch(() => { });
            }
        });
    }, []);

    const educationAgents = useMemo(() => getEducationAgents(), []);
    const documentAgents = useMemo(() => getDocumentAgents(), []);

    const currentAgents = activeTab === 'education' ? educationAgents : documentAgents;

    const filteredAgents = useMemo(() => {
        if (!searchQuery.trim()) return currentAgents;
        const q = searchQuery.toLowerCase();
        return currentAgents.filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.nameEl.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.descriptionEl.toLowerCase().includes(q)
        );
    }, [currentAgents, searchQuery]);

    const toDisplayAgent = (cap: typeof AGENT_REGISTRY[number]): Agent => ({
        id: cap.id,
        name: cap.name,
        role: cap.descriptionEl,
        description: cap.descriptionEl,
        status: liveStatuses[cap.id] === 'offline' ? AgentStatus.ERROR : AgentStatus.IDLE,
        icon: cap.icon,
        domain: cap.domain,
    });

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agent Hub</h1>
                    <p className="text-muted-foreground mt-1">
                        19 εξειδικευμένοι AI agents για εκπαίδευση &amp; έγγραφα LaTeX.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Backend Status */}
                    <div className={cn(
                        "flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border",
                        backendOnline === true && "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
                        backendOnline === false && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                        backendOnline === null && "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400"
                    )}>
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            backendOnline === true && "bg-green-500 animate-pulse",
                            backendOnline === false && "bg-yellow-500",
                            backendOnline === null && "bg-gray-400"
                        )} />
                        {backendOnline === true ? 'Backend Online' : backendOnline === false ? 'Gemini Fallback' : 'Checking...'}
                    </div>

                    <Link to="/create">
                        <Button className="gap-2">
                            <Zap size={16} />
                            Create Exam
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Search + Tabs */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex bg-muted rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('education')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === 'education'
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Bot size={16} />
                        Education
                        <span className="ml-1 text-xs bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded-full font-semibold">
                            {educationAgents.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === 'documents'
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <FileText size={16} />
                        Documents
                        <span className="ml-1 text-xs bg-orange-500/15 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-semibold">
                            {documentAgents.length}
                        </span>
                    </button>
                </div>

                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAgents.map(cap => (
                    <AgentCard
                        key={cap.id}
                        agent={toDisplayAgent(cap)}
                        variant="full"
                    />
                ))}
            </div>

            {filteredAgents.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No agents match your search.</p>
                </div>
            )}

            {/* Info Card */}
            <Card className="bg-gradient-to-r from-cyan-500/5 via-transparent to-orange-500/5 border-dashed">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Multi-Agent Pipeline</h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                                Οι agents συνεργάζονται αυτόματα — ο Orchestrator εντοπίζει το domain, δρομολογεί στον
                                κατάλληλο agent, και τρέχει quality checks πριν παραδοθεί το αποτέλεσμα.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AgentHub;
