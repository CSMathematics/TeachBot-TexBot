import React from 'react';
import { ExerciseType } from '../types';
import { Label } from './ui';
import { BookOpen, Calculator, Sigma, CheckSquare, ArrowLeftRight, Shuffle } from 'lucide-react';
import { cn } from '../lib/utils';

// ── Exercise type definitions ────────────────────────────────────────

interface ExerciseTypeOption {
    value: ExerciseType;
    label: string;
    icon: React.ReactNode;
    color: string;
}

const EXERCISE_TYPES: ExerciseTypeOption[] = [
    { value: 'theory', label: 'Θεωρία', icon: <BookOpen className="w-3.5 h-3.5" />, color: 'text-blue-500' },
    { value: 'application', label: 'Εφαρμογή', icon: <Calculator className="w-3.5 h-3.5" />, color: 'text-emerald-500' },
    { value: 'proof', label: 'Απόδειξη', icon: <Sigma className="w-3.5 h-3.5" />, color: 'text-purple-500' },
    { value: 'true-false', label: 'Σωστό/Λάθος', icon: <CheckSquare className="w-3.5 h-3.5" />, color: 'text-amber-500' },
    { value: 'matching', label: 'Αντιστοίχιση', icon: <ArrowLeftRight className="w-3.5 h-3.5" />, color: 'text-rose-500' },
];

// ── Component ────────────────────────────────────────────────────────

interface ExerciseTypeSelectorProps {
    selected: ExerciseType[];
    onChange: (types: ExerciseType[]) => void;
}

const ExerciseTypeSelector: React.FC<ExerciseTypeSelectorProps> = ({ selected, onChange }) => {
    const isAllOrNone = selected.length === 0 || selected.length === EXERCISE_TYPES.length;

    const toggleType = (type: ExerciseType) => {
        if (selected.includes(type)) {
            onChange(selected.filter(t => t !== type));
        } else {
            onChange([...selected, type]);
        }
    };

    const selectAll = () => onChange([]);
    const isMixed = selected.length === 0;

    return (
        <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                Τύπος Ασκήσεων
            </Label>

            <div className="flex flex-wrap gap-1.5">
                {/* Mixed (all) pill */}
                <button
                    type="button"
                    onClick={selectAll}
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                        isMixed
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    )}
                >
                    <Shuffle className="w-3 h-3" />
                    Μικτό
                </button>

                {/* Individual type pills */}
                {EXERCISE_TYPES.map(type => {
                    const isSelected = selected.includes(type.value);
                    return (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => toggleType(type.value)}
                            className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                                isSelected
                                    ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                            )}
                        >
                            <span className={cn(isSelected ? type.color : 'text-muted-foreground/60')}>
                                {type.icon}
                            </span>
                            {type.label}
                        </button>
                    );
                })}
            </div>

            {/* Summary */}
            {!isMixed && selected.length > 0 && (
                <p className="text-[10px] text-muted-foreground">
                    {selected.length} τύπ{selected.length === 1 ? 'ος' : 'οι'} επιλεγμέν{selected.length === 1 ? 'ος' : 'οι'}
                </p>
            )}
        </div>
    );
};

export default ExerciseTypeSelector;
