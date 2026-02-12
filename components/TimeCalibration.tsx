import React, { useMemo } from 'react';
import { Clock, Timer, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface Question {
    id: string;
    content: string;
    difficulty: string;
    points: number;
    tags?: string[];
}

interface TimeCalibrationProps {
    questions: Question[];
    totalMinutes: number;
    className?: string;
}

// ─── Time estimation by difficulty and content type ───────────────

function estimateMinutes(question: Question): number {
    const base = {
        easy: 4,
        medium: 7,
        hard: 12,
    };

    const diff = question.difficulty?.toLowerCase() || 'medium';
    let minutes = base[diff as keyof typeof base] || 7;

    // Adjust by content length (proxy for complexity)
    const contentLength = question.content.length;
    if (contentLength > 200) minutes += 2;
    if (contentLength > 400) minutes += 3;

    // Tags adjustments
    const tags = question.tags || [];
    if (tags.some(t => ['proof', 'απόδειξη'].includes(t.toLowerCase()))) minutes += 5;
    if (tags.some(t => ['graph', 'γράφημα', 'σχεδίαση'].includes(t.toLowerCase()))) minutes += 3;
    if (tags.some(t => ['multiple-choice', 'πολλαπλής'].includes(t.toLowerCase()))) minutes = Math.max(2, minutes - 4);

    // Points scaling
    if (question.points >= 25) minutes += 3;
    else if (question.points <= 5) minutes = Math.max(2, minutes - 2);

    return minutes;
}

// ─── Component ──────────────────────────────────────────────────────

const TimeCalibration: React.FC<TimeCalibrationProps> = ({ questions, totalMinutes, className }) => {
    const perQuestion = useMemo(() => {
        return questions.map(q => ({
            ...q,
            estimatedMinutes: estimateMinutes(q),
        }));
    }, [questions]);

    const totalEstimated = perQuestion.reduce((acc, q) => acc + q.estimatedMinutes, 0);
    const ratio = totalMinutes > 0 ? totalEstimated / totalMinutes : 1;
    const status: 'ok' | 'tight' | 'over' = ratio <= 0.85 ? 'ok' : ratio <= 1.0 ? 'tight' : 'over';
    const remaining = totalMinutes - totalEstimated;

    const statusConfig = {
        ok: { label: 'Επαρκής χρόνος', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
        tight: { label: 'Οριακός χρόνος', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle },
        over: { label: 'Υπέρβαση χρόνου!', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle },
    };

    const cfg = statusConfig[status];
    const StatusIcon = cfg.icon;

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header Summary */}
            <div className={cn("flex items-center justify-between p-3 rounded-lg", cfg.bg)}>
                <div className="flex items-center gap-2">
                    <StatusIcon className={cn("w-4 h-4", cfg.color)} />
                    <span className={cn("text-sm font-semibold", cfg.color)}>{cfg.label}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">
                        Εκτίμηση: <strong className={cfg.color}>{totalEstimated}'</strong> / {totalMinutes}'
                    </span>
                    {remaining > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">+{remaining}' buffer</span>
                    ) : remaining < 0 ? (
                        <span className="text-red-600 dark:text-red-400">{remaining}' πάνω</span>
                    ) : null}
                </div>
            </div>

            {/* Timeline Bar */}
            <div className="space-y-2">
                <div className="h-3 rounded-full bg-secondary overflow-hidden flex">
                    {perQuestion.map((q, i) => {
                        const widthPct = (q.estimatedMinutes / Math.max(totalMinutes, totalEstimated)) * 100;
                        const diffColors: Record<string, string> = {
                            easy: 'bg-emerald-500',
                            medium: 'bg-sky-500',
                            hard: 'bg-amber-500',
                        };
                        const color = diffColors[q.difficulty?.toLowerCase()] || 'bg-primary';

                        return (
                            <div
                                key={q.id}
                                title={`Ερώτηση ${i + 1}: ~${q.estimatedMinutes} λεπτά (${q.difficulty})`}
                                className={cn("h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full border-r border-background/20 last:border-0", color)}
                                style={{ width: `${widthPct}%` }}
                            />
                        );
                    })}
                    {remaining > 0 && (
                        <div
                            className="h-full bg-secondary/60 rounded-r-full"
                            style={{ width: `${(remaining / totalMinutes) * 100}%` }}
                            title={`Buffer: ${remaining} λεπτά`}
                        />
                    )}
                </div>

                {/* Time markers */}
                <div className="flex justify-between text-[9px] text-muted-foreground px-1">
                    <span>0'</span>
                    <span>{Math.round(totalMinutes / 4)}'</span>
                    <span>{Math.round(totalMinutes / 2)}'</span>
                    <span>{Math.round(totalMinutes * 3 / 4)}'</span>
                    <span>{totalMinutes}'</span>
                </div>
            </div>

            {/* Per-Question Breakdown */}
            <div className="space-y-1.5">
                {perQuestion.map((q, idx) => {
                    const pct = (q.estimatedMinutes / totalMinutes) * 100;
                    return (
                        <div key={q.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/30 transition-colors text-xs">
                            <span className="w-5 text-muted-foreground font-medium text-right">{idx + 1}.</span>
                            <div className="flex-1 min-w-0">
                                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            q.difficulty === 'easy' ? 'bg-emerald-500' : q.difficulty === 'hard' ? 'bg-amber-500' : 'bg-sky-500'
                                        )}
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                </div>
                            </div>
                            <span className="tabular-nums font-medium w-10 text-right">{q.estimatedMinutes}'</span>
                            <span className="text-muted-foreground w-14 text-right">{q.points} μον.</span>
                        </div>
                    );
                })}
            </div>

            {/* Tips */}
            {status === 'over' && (
                <div className="text-[10px] text-muted-foreground p-3 rounded-lg bg-secondary/30 space-y-1">
                    <p className="font-semibold text-foreground">💡 Προτάσεις:</p>
                    <p>• Μειώστε τον αριθμό ερωτήσεων ή αντικαταστήστε δύσκολες με μέτριες</p>
                    <p>• Αυξήστε τη διάρκεια εξέτασης κατά {Math.abs(remaining)} λεπτά</p>
                    <p>• Χρησιμοποιήστε ερωτήσεις πολλαπλής επιλογής (λιγότερος χρόνος)</p>
                </div>
            )}
        </div>
    );
};

export default TimeCalibration;
