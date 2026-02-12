import React, { useState, useCallback } from 'react';
import { Gauge, Zap, BookOpen, GraduationCap } from 'lucide-react';
import { cn } from '../lib/utils';

interface DifficultySliderProps {
    value: number;        // 0–100
    onChange: (value: number) => void;
    showDistribution?: boolean;
    className?: string;
}

// Difficulty zones with labels and colors
const ZONES = [
    { min: 0, max: 25, label: 'Εύκολο', labelEn: 'Easy', color: 'emerald', icon: BookOpen },
    { min: 25, max: 50, label: 'Μέτριο', labelEn: 'Medium', color: 'sky', icon: Gauge },
    { min: 50, max: 75, label: 'Δύσκολο', labelEn: 'Hard', color: 'amber', icon: Zap },
    { min: 75, max: 100, label: 'Πανελλήνιες', labelEn: 'National', color: 'red', icon: GraduationCap },
];

function getZone(value: number) {
    return ZONES.find(z => value >= z.min && value < z.max) || ZONES[ZONES.length - 1];
}

// Simulated exercise distribution based on difficulty level
function getDistribution(value: number) {
    const norm = value / 100;
    return {
        easy: Math.round(Math.max(0, (1 - norm * 1.5)) * 100),
        medium: Math.round(Math.max(0, 1 - Math.abs(norm - 0.4) * 2.5) * 100),
        hard: Math.round(Math.max(0, 1 - Math.abs(norm - 0.7) * 3) * 100),
        advanced: Math.round(Math.max(0, (norm - 0.5) * 2) * 100),
    };
}

const DifficultySlider: React.FC<DifficultySliderProps> = ({ value, onChange, showDistribution = true, className }) => {
    const [isDragging, setIsDragging] = useState(false);
    const zone = getZone(value);
    const dist = getDistribution(value);

    const colorMap: Record<string, { track: string; thumb: string; text: string; bg: string }> = {
        emerald: { track: 'bg-emerald-500', thumb: 'border-emerald-500 shadow-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
        sky: { track: 'bg-sky-500', thumb: 'border-sky-500 shadow-sky-500/30', text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
        amber: { track: 'bg-amber-500', thumb: 'border-amber-500 shadow-amber-500/30', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
        red: { track: 'bg-red-500', thumb: 'border-red-500 shadow-red-500/30', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
    };

    const colors = colorMap[zone.color];
    const Icon = zone.icon;

    const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(Number(e.target.value));
    }, [onChange]);

    return (
        <div className={cn("space-y-4", className)}>
            {/* Current Level Display */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg", colors.bg)}>
                        <Icon className={cn("w-4 h-4", colors.text)} />
                    </div>
                    <div>
                        <span className={cn("text-sm font-semibold", colors.text)}>{zone.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">({zone.labelEn})</span>
                    </div>
                </div>
                <span className={cn("text-lg font-bold tabular-nums", colors.text)}>{value}%</span>
            </div>

            {/* Slider Track */}
            <div className="relative">
                {/* Zone backgrounds */}
                <div className="absolute inset-0 h-2 top-[14px] rounded-full overflow-hidden flex">
                    <div className="flex-1 bg-emerald-500/20" />
                    <div className="flex-1 bg-sky-500/20" />
                    <div className="flex-1 bg-amber-500/20" />
                    <div className="flex-1 bg-red-500/20" />
                </div>

                {/* Active fill */}
                <div
                    className={cn("absolute h-2 top-[14px] rounded-l-full", colors.track, "transition-all duration-100")}
                    style={{ width: `${value}%` }}
                />

                {/* Native range input */}
                <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={value}
                    onChange={handleSliderChange}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    className="relative w-full h-8 appearance-none bg-transparent cursor-pointer z-10
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:cursor-grab
            [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent"
                    style={{
                        // Thumb border color via CSS variable
                        ['--tw-slider-border' as any]: 'currentColor',
                    }}
                />

                {/* Zone labels */}
                <div className="flex justify-between mt-1 px-1">
                    {ZONES.map(z => (
                        <span key={z.label} className={cn("text-[9px]", value >= z.min && value < z.max ? colors.text + ' font-semibold' : 'text-muted-foreground/50')}>
                            {z.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Distribution Preview */}
            {showDistribution && (
                <div className="grid grid-cols-4 gap-2 pt-2">
                    {[
                        { label: 'Εύκολες', pct: dist.easy, color: 'bg-emerald-500' },
                        { label: 'Μέτριες', pct: dist.medium, color: 'bg-sky-500' },
                        { label: 'Δύσκολες', pct: dist.hard, color: 'bg-amber-500' },
                        { label: 'Πανελλήνιες', pct: dist.advanced, color: 'bg-red-500' },
                    ].map(d => (
                        <div key={d.label} className="space-y-1">
                            <div className="flex items-end gap-1 h-8">
                                <div className={cn("w-full rounded-t", d.color, "transition-all duration-300")} style={{ height: `${Math.max(d.pct, 4)}%` }} />
                            </div>
                            <p className="text-[9px] text-muted-foreground text-center truncate">{d.label}</p>
                            <p className="text-[10px] font-semibold text-center">{d.pct}%</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DifficultySlider;
