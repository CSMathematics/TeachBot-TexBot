import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wand2, BookOpen, GraduationCap, Settings, Bot, FileText, GitBranch, Layout, LayoutTemplate } from 'lucide-react';
import { cn } from '../lib/utils';
import { AGENT_REGISTRY } from '../services/agentRegistry';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agents', icon: Bot, label: 'Agent Hub' },
  { to: '/studio', icon: Layout, label: 'Doc Studio' },
  { to: '/create', icon: Wand2, label: 'Exam Creator' },
  { to: '/worksheet', icon: FileText, label: 'Worksheet' },
  { to: '/flowchart', icon: GitBranch, label: 'Flowchart' },
  { to: '/studio/template', icon: LayoutTemplate, label: 'Templates' },
  { to: '/library', icon: BookOpen, label: 'Library' },
  { to: '/curriculum', icon: GraduationCap, label: 'Curriculum' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen glass border-r border-white/20 dark:border-white/5 flex flex-col z-50 relative">
      {/* Logo */}
      <div className="p-6 border-b border-white/10 dark:border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight leading-none text-foreground">EduTeX</span>
            <span className="text-[10px] font-medium text-muted-foreground ml-0.5 tracking-wider uppercase">AI Assistant</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {links.map(link => {
          const isActive = location.pathname === link.to;
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground hover:shadow-sm"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform duration-200 group-hover:scale-110", isActive && "bg-transparent")} />
              <span className="relative z-10">{link.label}</span>
              {isActive && <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 opacity-100 -z-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 dark:border-white/5 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
        <div className="text-xs text-muted-foreground px-2 flex justify-between items-center">
          <span className="font-medium opacity-80">EduTeX v2.1</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/10">
            {AGENT_REGISTRY.length} Agents
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;