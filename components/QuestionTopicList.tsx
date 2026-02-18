import React from 'react';
import { Button, Label } from './ui';
import { Plus, Trash2 } from 'lucide-react';
import TopicSelector from './TopicSelector';
import { QuestionTopic } from '../types';
import { cn } from '../lib/utils';

interface QuestionTopicListProps {
    items: QuestionTopic[];
    onChange: React.Dispatch<React.SetStateAction<QuestionTopic[]>>;
    onGradeLevelChange?: (gradeLevel: string) => void;
}

const QuestionTopicList: React.FC<QuestionTopicListProps> = ({ items, onChange, onGradeLevelChange }) => {
    const addQuestion = () => {
        onChange(prev => [...prev, { id: crypto.randomUUID(), topic: '', selectedNodeIds: [] }]);
    };

    const removeQuestion = (id: string) => {
        onChange(prev => prev.length <= 1 ? prev : prev.filter(item => item.id !== id));
    };

    const updateTopic = (id: string, topic: string) => {
        onChange(prev => prev.map(item => item.id === id ? { ...item, topic } : item));
    };

    const updateSelectedIds = (id: string, selectedNodeIds: string[]) => {
        onChange(prev => prev.map(item => item.id === id ? { ...item, selectedNodeIds } : item));
    };

    const updateGradeLevel = (id: string, gradeLevel: string) => {
        onChange(prev => prev.map(item => item.id === id ? { ...item, gradeLevel } : item));
    };

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className="relative border border-border rounded-lg p-3 bg-secondary/20 space-y-2"
                >
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                "bg-primary text-primary-foreground"
                            )}>
                                {index + 1}
                            </span>
                            <Label className="text-xs font-medium">Θέμα {index + 1}</Label>
                        </div>
                        {items.length > 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => removeQuestion(item.id)}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>

                    {/* Compact TopicSelector */}
                    <TopicSelector
                        compact
                        value={item.topic}
                        onChange={(topic) => updateTopic(item.id, topic)}
                        onGradeLevelChange={(gl) => {
                            updateGradeLevel(item.id, gl);
                            // Also propagate to parent for global grade fallback
                            if (onGradeLevelChange) onGradeLevelChange(gl);
                        }}
                        onSelectedIdsChange={(ids) => updateSelectedIds(item.id, ids)}
                    />

                    {/* Status indicators */}
                    <div className="flex items-center gap-2">
                        {item.gradeLevel && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                                {item.gradeLevel}
                            </span>
                        )}
                        {!item.topic && (
                            <span className="text-[10px] text-amber-500 font-medium">
                                ⚠ Δεν έχει επιλεγεί ύλη
                            </span>
                        )}
                        {item.topic && (
                            <p className="text-[10px] text-muted-foreground line-clamp-1 flex-1" title={item.topic}>
                                {item.topic}
                            </p>
                        )}
                    </div>
                </div>
            ))}

            {/* Add Question button */}
            <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-dashed"
                onClick={addQuestion}
            >
                <Plus className="w-3.5 h-3.5" />
                Προσθήκη Θέματος
            </Button>
        </div>
    );
};

export default QuestionTopicList;
