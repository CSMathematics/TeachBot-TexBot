import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    FileText,
    Layout,
    Image,
    Table as TableIcon,
    Presentation,
    BookOpen,
    LayoutTemplate,
    Home,
    Settings,
    ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui';

const DocumentStudioLayout: React.FC = () => {
    const location = useLocation();

    const tools = [
        {
            title: 'Studio Overview',
            icon: Home,
            href: '/studio',
            end: true,
            description: 'Dashboard'
        },
        {
            type: 'separator',
            title: 'Create'
        },
        {
            title: 'Article Writer',
            icon: FileText,
            href: '/studio/document',
            description: 'Write articles & reports',
            color: 'text-orange-500'
        },
        {
            title: 'Presentation Maker',
            icon: Presentation,
            href: '/studio/presentation',
            description: 'Create slide decks',
            color: 'text-blue-500'
        },
        {
            type: 'separator',
            title: 'Assets'
        },
        {
            title: 'Figure Wizard',
            icon: Image,
            href: '/studio/figure',
            description: 'Generate diagrams',
            color: 'text-green-500'
        },
        {
            title: 'Table Architect',
            icon: TableIcon,
            href: '/studio/table',
            description: 'Format complex tables',
            color: 'text-purple-500'
        },
        {
            title: 'Bibliography Manager',
            icon: BookOpen,
            href: '/studio/bibliography',
            description: 'Manage citations',
            color: 'text-yellow-500'
        },
        {
            type: 'separator',
            title: 'Resources'
        },
        {
            title: 'Template Curator',
            icon: LayoutTemplate,
            href: '/studio/template',
            description: 'Browse templates',
            color: 'text-pink-500'
        },
    ];

    return (
        <div className="flex h-full w-full bg-background overflow-hidden relative">
            {/* Studio Sidebar */}
            <aside className="w-[280px] border-r bg-card/30 backdrop-blur-sm flex flex-col h-full shrink-0 z-20 shadow-sm transition-all duration-300">
                <div className="h-14 px-6 border-b flex items-center justify-between bg-card/50">
                    <div className="flex items-center gap-2 font-semibold">
                        <div className="p-1 bg-primary/10 rounded-md">
                            <Layout className="w-4 h-4 text-primary" />
                        </div>
                        <span className="tracking-tight">DocStudio</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {tools.map((tool, index) => {
                        if (tool.type === 'separator') {
                            return (
                                <div key={index} className="px-2 py-2 mt-4 first:mt-0">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {tool.title}
                                    </h3>
                                </div>
                            );
                        }

                        // @ts-ignore
                        const Icon = tool.icon;

                        return (
                            <NavLink
                                key={tool.href}
                                to={tool.href}
                                end={tool.end}
                                className={({ isActive }) => cn(
                                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon className={cn(
                                            "w-4 h-4 transition-colors",
                                            isActive ? "text-primary" : tool.color || "text-muted-foreground group-hover:text-foreground"
                                        )} />
                                        <div className="flex-1 min-w-0">
                                            <div className="truncate">{tool.title}</div>
                                        </div>
                                        {isActive && (
                                            <ChevronRight className="w-3 h-3 text-primary/50 animate-in fade-in slide-in-from-left-1" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t bg-card/30">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground gap-2">
                        <Settings className="w-4 h-4" />
                        Studio Settings
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden h-full relative bg-background isolate">
                {/* Background Pattern */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                <Outlet />
            </main>
        </div>
    );
};

export default DocumentStudioLayout;
