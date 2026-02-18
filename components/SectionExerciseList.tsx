import React from 'react';
import { Label } from './ui';
import { SectionExerciseCount } from '../types';
import { getSyllabusTreeSync } from '../services/syllabusService';

interface SectionExerciseListProps {
    selectedNodeIds: string[]; // Kept for reference if needed, though items is the source of truth for display
    items: SectionExerciseCount[];
    onChange: React.Dispatch<React.SetStateAction<SectionExerciseCount[]>>;
}

/**
 * Resolves selectedNodeIds against the syllabus tree to produce
 * a flat list of section/paragraph-level entries.
 */
export function resolveSyllabusNodes(selectedNodeIds: string[]): { nodeId: string; nodeName: string; parentName: string }[] {
    const tree = getSyllabusTreeSync();
    const selectedSet = new Set(selectedNodeIds);
    const entries: { nodeId: string; nodeName: string; parentName: string }[] = [];

    for (const field of tree) {
        for (const chapter of field.chapters) {
            for (const section of chapter.sections) {
                // Check paragraphs first
                const selectedParagraphs = (section.paragraphs || []).filter(p => selectedSet.has(p.Id));
                if (selectedParagraphs.length > 0) {
                    for (const p of selectedParagraphs) {
                        entries.push({
                            nodeId: p.Id,
                            nodeName: p.Name,
                            parentName: `${chapter.Name} › ${section.Name}`,
                        });
                    }
                } else if (selectedSet.has(section.Id)) {
                    // Whole section selected
                    entries.push({
                        nodeId: section.Id,
                        nodeName: section.Name,
                        parentName: chapter.Name,
                    });
                }
            }
            // If chapter is selected but has no sections, treat the chapter itself
            if (selectedSet.has(chapter.Id) && chapter.sections.length === 0) {
                entries.push({
                    nodeId: chapter.Id,
                    nodeName: chapter.Name,
                    parentName: field.Name,
                });
            }
        }
    }
    return entries;
}

/**
 * Syncs the existing counts with the new selection.
 * Retains counts for nodes that are still selected.
 * Adds new nodes with default count.
 */
export function syncSectionExerciseCounts(
    currentItems: SectionExerciseCount[],
    resolvedNodes: { nodeId: string; nodeName: string; parentName: string }[]
): SectionExerciseCount[] {
    const existingMap = new Map(currentItems.map(item => [item.nodeId, item]));
    return resolvedNodes.map(node => {
        const existing = existingMap.get(node.nodeId);
        return existing
            ? { ...existing, nodeName: node.nodeName, parentName: node.parentName } // Update names if they changed (unlikely but safe)
            : { nodeId: node.nodeId, nodeName: node.nodeName, parentName: node.parentName, count: 2 };
    });
}

const SectionExerciseList: React.FC<SectionExerciseListProps> = ({ items, onChange }) => {
    const totalExercises = items.reduce((sum, item) => sum + item.count, 0);

    const updateCount = (nodeId: string, count: number) => {
        onChange(prev => prev.map(item => item.nodeId === nodeId ? { ...item, count: Math.max(1, count) } : item));
    };

    if (items.length === 0) {
        return (
            <p className="text-xs text-muted-foreground italic">
                Επιλέξτε ενότητες από την ύλη παραπάνω
            </p>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-xs">Ασκήσεις ανά ενότητα</Label>
                <span className="text-[10px] text-muted-foreground">
                    Σύνολο: <span className="font-semibold text-foreground">{totalExercises}</span>
                </span>
            </div>
            <div className="space-y-1.5">
                {items.map(item => (
                    <div
                        key={item.nodeId}
                        className="flex items-center gap-2 bg-secondary/30 rounded-md px-2.5 py-1.5"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" title={item.nodeName}>
                                {item.nodeName}
                            </p>
                            {item.parentName && (
                                <p className="text-[10px] text-muted-foreground truncate" title={item.parentName}>
                                    {item.parentName}
                                </p>
                            )}
                        </div>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={item.count}
                            onChange={(e) => updateCount(item.nodeId, Number(e.target.value))}
                            className="w-12 h-7 text-center text-xs rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SectionExerciseList;
