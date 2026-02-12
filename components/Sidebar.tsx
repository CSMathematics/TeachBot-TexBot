import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wand2, BookOpen, GraduationCap, Settings, Bot, FileText, Network, Layout } from 'lucide-react';
import { cn } from '../lib/utils';
import { AGENT_REGISTRY } from '../services/agentRegistry';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agents', icon: Bot, label: 'Agent Hub' },
  { to: '/studio', icon: Layout, label: 'Doc Studio' },
  { to: '/create', icon: Wand2, label: 'Exam Creator' },
  { to: '/worksheet', icon: FileText, label: 'Worksheet' },
  { to: '/mindmaps', icon: Network, label: 'Mindmaps' },
  { to: '/library', icon: BookOpen, label: 'Library' },
  { to: '/curriculum', icon: GraduationCap, label: 'Curriculum' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">EduTeX</span>
            <span className="text-xs text-muted-foreground ml-1.5">AI</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map(link => {
          const isActive = location.pathname === link.to;
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground px-2">
          <span className="font-medium">EduTeX v2.1</span>
          <span className="text-[10px] ml-1 opacity-60">• {AGENT_REGISTRY.length} Agents</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;