import React, { useEffect, useState } from 'react';
import { DifficultyDistribution } from '../types';
import { Label } from './ui';
import { cn } from '../lib/utils';
import { Gauge, Zap, BookOpen } from 'lucide-react';

interface DifficultyDistributionSelectorProps {
    value: DifficultyDistribution;
    onChange: (value: DifficultyDistribution) => void;
    className?: string;
}

const DifficultyDistributionSelector: React.FC<DifficultyDistributionSelectorProps> = ({ value, onChange, className }) => {
    // Local state for smooth sliding, commit to parent on change
    const [dist, setDist] = useState(value);

    // Sync from parent if parent updates (e.g. preset loaded)
    useEffect(() => {
        setDist(value);
    }, [value]);

    const handleChange = (key: keyof DifficultyDistribution, newValue: number) => {
        const otherKeys = Object.keys(dist).filter(k => k !== key) as (keyof DifficultyDistribution)[];
        const remaining = 100 - newValue;

        // Simple redistribution logic: scale others proportionally to fit remaining
        const currentTotalOthers = otherKeys.reduce((sum, k) => sum + dist[k], 0);

        const newDist = { ...dist, [key]: newValue };

        if (currentTotalOthers === 0) {
            // Split remaining equally if others were 0
            otherKeys.forEach(k => newDist[k] = remaining / otherKeys.length);
        } else {
            // Scale proportionally
            otherKeys.forEach(k => {
                newDist[k] = Math.round((dist[k] / currentTotalOthers) * remaining);
            });
        }

        // Fix rounding errors to ensure exactly 100%
        const total = Object.values(newDist).reduce((a, b) => a + b, 0);
        if (total !== 100) {
            const diff = 100 - total;
            // Add diff to the largest value (or the one being edited, but let's do largest other to avoid jumpiness)
            const largestKey = otherKeys.reduce((a, b) => newDist[a] > newDist[b] ? a : b);
            newDist[largestKey] += diff;
        }

        setDist(newDist);
        onChange(newDist);
    };

    return (
        <div className={cn("space-y-3", className)}>
            {/* Visualization Bar */}
            <div className="h-2 rounded-full overflow-hidden flex w-full bg-secondary">
                <div style={{ width: `${dist.easy}%` }} className="bg-emerald-500 transition-all duration-300" />
                <div style={{ width: `${dist.medium}%` }} className="bg-sky-500 transition-all duration-300" />
                <div style={{ width: `${dist.hard}%` }} className="bg-amber-500 transition-all duration-300" />
            </div>

            {/* Sliders */}
            <div className="space-y-3">
                {/* Easy */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-600">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span className="font-medium">Εύκολα</span>
                        </div>
                        <span className="font-bold tabular-nums">{dist.easy}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={dist.easy}
                        onChange={(e) => handleChange('easy', Number(e.target.value))}
                        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                </div>

                {/* Medium */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-sky-600">
                            <Gauge className="w-3.5 h-3.5" />
                            <span className="font-medium">Μέτρια</span>
                        </div>
                        <span className="font-bold tabular-nums">{dist.medium}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={dist.medium}
                        onChange={(e) => handleChange('medium', Number(e.target.value))}
                        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                </div>

                {/* Hard */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-amber-600">
                            <Zap className="w-3.5 h-3.5" />
                            <span className="font-medium">Δύσκολα</span>
                        </div>
                        <span className="font-bold tabular-nums">{dist.hard}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={dist.hard}
                        onChange={(e) => handleChange('hard', Number(e.target.value))}
                        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default DifficultyDistributionSelector;
