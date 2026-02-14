import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Clock, BookOpen, Users, TrendingUp, Plus, ArrowUpRight, Bot, Zap, FileText, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Badge } from '../components/ui';
import { AGENT_REGISTRY, getEducationAgents, getDocumentAgents } from '../services/agentRegistry';
import { checkBackendHealth, fetchAgentCatalog } from '../services/agentApiService';
import { getLibrary } from '../services/storageService';
import { Exam } from '../types';
import { cn } from '../lib/utils';

// ─── Metrics Calculation ────────────────────────────────────────────

const calculateActivity = (items: Exam[]) => {
  const days = ['Ky', 'De', 'Tr', 'Te', 'Pe', 'Pa', 'Sa']; // Short Greek days (approx) or English
  // Actually better to use last 7 days relative to today
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return last7Days.map(date => {
    const dayStr = date.toLocaleDateString('el-GR', { weekday: 'short' }); // Greek days
    const dateStr = date.toISOString().split('T')[0];

    const dayItems = items.filter(i => i.createdAt.startsWith(dateStr));
    return {
      name: dayStr,
      exams: dayItems.filter(i => (i.type || 'exam') === 'exam').length,
      worksheets: dayItems.filter(i => i.type === 'worksheet').length
    };
  });
};

// Heatmap: topics × last 6 months
const calculateHeatmap = (items: Exam[]) => {
  const months = 6;
  const today = new Date();
  const monthBuckets = Array.from({ length: months }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (months - 1 - i), 1);
    return {
      label: d.toLocaleDateString('el-GR', { month: 'short' }),
      key: `${d.getFullYear()}-${d.getMonth()}` // unique key for grouping
    };
  });

  // 1. Group items by Topic
  const topicMap: Record<string, number[]> = {};

  items.forEach(item => {
    // Determine topic (fallback to Subject if tag is missing)
    let topic = item.subject || 'General';
    // Try to get a more specific topic from tags if available
    // (Assuming tags[0] is often the main topic)
    if (item.tags && item.tags.length > 0) {
      topic = item.tags[0];
    }
    // Clean up topic string
    topic = topic.trim();
    if (!topic) topic = 'Uncategorized';

    if (!topicMap[topic]) {
      topicMap[topic] = new Array(months).fill(0);
    }

    // Determine month index
    const date = new Date(item.createdAt);
    const itemKey = `${date.getFullYear()}-${date.getMonth()}`;

    const monthIndex = monthBuckets.findIndex(m => m.key === itemKey);
    if (monthIndex !== -1) {
      topicMap[topic][monthIndex]++;
    }
  });

  // 2. Convert to array and sort by total activity
  const heatmap = Object.entries(topicMap)
    .map(([topic, counts]) => ({
      topic,
      months: counts,
      total: counts.reduce((a, b) => a + b, 0)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8); // Top 8 topics

  return {
    data: heatmap.length > 0 ? heatmap : [{ topic: 'No Data', months: [0, 0, 0, 0, 0, 0], total: 0 }],
    labels: monthBuckets.map(m => m.label)
  };
};

// const monthLabels = ['Σεπ', 'Οκτ', 'Νοε', 'Δεκ', 'Ιαν', 'Φεβ']; // Now dynamic

// ─── Heatmap Cell Color ─────────────────────────────────────────────

function heatColor(value: number, max: number): string {
  if (value === 0) return 'bg-secondary/50';
  const intensity = value / max;
  if (intensity < 0.25) return 'bg-emerald-200 dark:bg-emerald-900/40';
  if (intensity < 0.5) return 'bg-emerald-300 dark:bg-emerald-800/60';
  if (intensity < 0.75) return 'bg-emerald-400 dark:bg-emerald-700/80';
  return 'bg-emerald-500 dark:bg-emerald-600';
}

// ─── Dashboard Component ────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, string>>({});
  const [items, setItems] = useState<Exam[]>([]);

  useEffect(() => {
    // Check Backend
    checkBackendHealth().then(online => {
      setBackendOnline(online);
      if (online) {
        fetchAgentCatalog()
          .then(agents => {
            const statuses: Record<string, string> = {};
            agents.forEach(a => { statuses[a.id] = a.status; });
            setAgentStatuses(statuses);
          })
          .catch(() => { });
      }
    });

    // Load Library
    const loadItems = () => setItems(getLibrary());
    loadItems();
    window.addEventListener('library-updated', loadItems);
    return () => window.removeEventListener('library-updated', loadItems);
  }, []);

  // Derived Stats
  const onlineCount = Object.values(agentStatuses).filter(s => s === 'online').length;
  const totalAgents = AGENT_REGISTRY.length;

  const examCount = items.filter(i => (i.type || 'exam') === 'exam').length;
  const worksheetCount = items.filter(i => i.type === 'worksheet').length;

  // Recent 3 items
  const recentExams = useMemo(() => {
    return [...items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map(item => ({
        id: item.id,
        title: item.title,
        date: new Date(item.createdAt).toLocaleDateString('el-GR', { day: 'numeric', month: 'short', year: 'numeric' }),
        questions: item.questions?.length || 0,
        difficulty: item.difficulty < 33 ? 'Εύκολο' : item.difficulty < 66 ? 'Μέτριο' : 'Δύσκολο'
      }));
  }, [items]);

  const activityData = useMemo(() => calculateActivity(items), [items]);

  const { data: heatmapData, labels: monthLabels } = useMemo(() => calculateHeatmap(items), [items]);
  const maxHeat = Math.max(...heatmapData.flatMap(r => r.months), 1); // Avoid div by zero

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Επισκόπηση δημιουργημένου υλικού και μετρικών.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/worksheet">
            <Button variant="outline" className="gap-2">
              <FileText size={16} />
              Worksheet
            </Button>
          </Link>
          <Link to="/create">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
              <Plus size={18} />
              Create Exam
            </Button>
          </Link>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <BookOpen className="w-4 h-4 text-muted-foreground" />, label: 'Σύνολο Εξετάσεων', value: examCount.toString(), trend: '+12%*', sub: 'τελευταίο μήνα' },
          { icon: <FileText className="w-4 h-4 text-muted-foreground" />, label: 'Φυλλάδια', value: worksheetCount.toString(), trend: '+24%*', sub: 'τελευταίο μήνα' },
          { icon: <Clock className="w-4 h-4 text-muted-foreground" />, label: 'Χρόνος που Κερδήθηκε', value: `${(items.length * 0.5).toFixed(1)}h`, trend: 'auto', sub: 'automation est.' },
          { icon: <Bot className="w-4 h-4 text-muted-foreground" />, label: 'Agents Online', value: backendOnline ? `${onlineCount}/${totalAgents}` : 'Fallback', trend: backendOnline ? '✓' : '~', sub: backendOnline ? 'backend active' : 'Gemini mode' },
        ].map((stat, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 font-medium inline-flex items-center">
                  {stat.trend} <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span> {stat.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Activity Chart + Agent Status Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Δραστηριότητα Δημιουργίας</CardTitle>
            <CardDescription>Εξετάσεις & φυλλάδια τελευταίων 7 ημερών</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWorksheets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="exams" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorExams)" />
                  <Area type="monotone" dataKey="worksheets" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorWorksheets)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 px-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-0.5 rounded-full bg-sky-500" /> Εξετάσεις
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-0.5 rounded-full bg-orange-500" /> Φυλλάδια
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Status Panel */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Agent Status</CardTitle>
              <CardDescription>Κατάσταση 19 agents σε πραγματικό χρόνο</CardDescription>
            </div>
            <Link to="/agents">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View All <ArrowUpRight size={12} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {/* Status summary */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-secondary/50">
              <div className={cn(
                "w-3 h-3 rounded-full shrink-0",
                backendOnline ? "bg-green-500 animate-pulse" : "bg-yellow-500"
              )} />
              <div className="flex-1">
                <p className="text-xs font-semibold">
                  {backendOnline ? 'Python Backend Active' : 'Gemini Fallback Mode'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {backendOnline ? `${onlineCount} agents online` : 'Backend offline — using direct Gemini API'}
                </p>
              </div>
            </div>

            {/* Agent grid */}
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Education ({getEducationAgents().length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {getEducationAgents().map(a => {
                    const isOnline = agentStatuses[a.id] === 'online' || !backendOnline;
                    return (
                      <div
                        key={a.id}
                        title={`${a.name} — ${isOnline ? 'Online' : 'Offline'}`}
                        className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-medium border transition-all cursor-default",
                          isOnline
                            ? "bg-cyan-500/10 text-cyan-700 border-cyan-500/20 dark:text-cyan-400"
                            : "bg-red-500/10 text-red-600 border-red-500/20 opacity-50"
                        )}
                      >
                        {a.name.split(' ').map(w => w[0]).join('')}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Documents ({getDocumentAgents().length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {getDocumentAgents().map(a => {
                    const isOnline = agentStatuses[a.id] === 'online' || !backendOnline;
                    return (
                      <div
                        key={a.id}
                        title={`${a.name} — ${isOnline ? 'Online' : 'Offline'}`}
                        className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-medium border transition-all cursor-default",
                          isOnline
                            ? "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400"
                            : "bg-red-500/10 text-red-600 border-red-500/20 opacity-50"
                        )}
                      >
                        {a.name.split(' ').map(w => w[0]).join('')}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Coverage Heatmap + Recent Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Coverage Heatmap */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Κάλυψη Ύλης</CardTitle>
            <CardDescription>Heatmap ασκήσεων ανά θέμα × μήνα (Demo Data)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 min-w-[140px]">Θέμα</th>
                    {monthLabels.map(m => (
                      <th key={m} className="text-center text-[10px] font-medium text-muted-foreground pb-3 w-12">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((row, ri) => (
                    <tr key={ri}>
                      <td className="text-xs font-medium py-1 pr-4 truncate max-w-[140px]">{row.topic}</td>
                      {row.months.map((val, ci) => (
                        <td key={ci} className="p-1">
                          <div
                            className={cn(
                              "w-10 h-8 rounded-md flex items-center justify-center text-[10px] font-semibold transition-all",
                              heatColor(val, maxHeat),
                              val > 0 ? "text-emerald-900 dark:text-emerald-100" : "text-muted-foreground/40"
                            )}
                            title={`${row.topic}: ${val} ασκήσεις (${monthLabels[ci]})`}
                          >
                            {val || '·'}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
              <span className="text-[10px] text-muted-foreground">Λιγότερες</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-secondary/50" />
                <div className="w-4 h-4 rounded bg-emerald-200 dark:bg-emerald-900/40" />
                <div className="w-4 h-4 rounded bg-emerald-300 dark:bg-emerald-800/60" />
                <div className="w-4 h-4 rounded bg-emerald-400 dark:bg-emerald-700/80" />
                <div className="w-4 h-4 rounded bg-emerald-500 dark:bg-emerald-600" />
              </div>
              <span className="text-[10px] text-muted-foreground">Περισσότερες</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Exams */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Πρόσφατα</CardTitle>
              <CardDescription>Τελευταίες δημιουργίες</CardDescription>
            </div>
            <Link to="/library">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View All <ArrowUpRight size={12} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExams.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  Δεν βρέθηκαν πρόσφατες εξετάσεις.
                </div>
              ) : recentExams.map(exam => (
                <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{exam.title}</p>
                      <p className="text-[10px] text-muted-foreground">{exam.date} · {exam.questions} ερωτήσεις</p>
                    </div>
                  </div>
                  <Badge variant={exam.difficulty === 'Δύσκολο' ? 'destructive' : exam.difficulty === 'Εύκολο' ? 'secondary' : 'outline'} className="shrink-0 text-[10px]">
                    {exam.difficulty}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{examCount + worksheetCount}</p>
                <p className="text-[10px] text-muted-foreground">Συνολικά Αρχεία</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{items.reduce((acc, i) => acc + (i.questions?.length || 0), 0)}</p>
                <p className="text-[10px] text-muted-foreground">Συνολικές Ερωτήσεις</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;