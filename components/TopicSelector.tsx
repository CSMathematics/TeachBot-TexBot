import React, { useState, useMemo, useEffect } from 'react';
import { getSyllabusTree } from '../services/syllabusService';
import { Select, Label } from './ui';

interface TopicSelectorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ value, onChange, className }) => {
    const tree = useMemo(() => getSyllabusTree(), []);

    const [selectedFieldId, setSelectedFieldId] = useState<string>('');
    const [selectedChapterId, setSelectedChapterId] = useState<string>('');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');

    // Update parent when selections change
    useEffect(() => {
        if (!selectedFieldId || !selectedChapterId || !selectedSectionId) return;

        const activeField = tree.find(f => f.Id === selectedFieldId);
        const activeChapter = activeField?.chapters.find(c => c.Id === selectedChapterId);
        const section = activeChapter?.sections.find(s => s.Id === selectedSectionId);

        if (section && activeField && activeChapter) {
            // Construct a rich topic string for the AI
            const richTopic = `${activeField.Name}: ${activeChapter.Name} - ${section.Name}`;
            // Only fire onChange if it's different to avoid loops, 
            // though the parent simple state setter handles that.
            if (value !== richTopic) {
                onChange(richTopic);
            }
        }
    }, [selectedFieldId, selectedChapterId, selectedSectionId, tree, value, onChange]);

    const activeField = useMemo(() =>
        tree.find(f => f.Id === selectedFieldId),
        [tree, selectedFieldId]);

    const activeChapter = useMemo(() =>
        activeField?.chapters.find(c => c.Id === selectedChapterId),
        [activeField, selectedChapterId]);

    return (
        <div className={`space-y-3 ${className}`}>

            <div className="grid gap-3">
                {/* Field Select */}
                <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Πεδίο</Label>
                    <Select
                        value={selectedFieldId}
                        onChange={(e) => {
                            setSelectedFieldId(e.target.value);
                            setSelectedChapterId('');
                            setSelectedSectionId('');
                        }}
                    >
                        <option value="" disabled>Επιλέξτε Πεδίο</option>
                        {tree.map(field => (
                            <option key={field.Id} value={field.Id}>
                                {field.Name}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Chapter Select */}
                <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Κεφάλαιο</Label>
                    <Select
                        value={selectedChapterId}
                        onChange={(e) => {
                            setSelectedChapterId(e.target.value);
                            setSelectedSectionId('');
                        }}
                        disabled={!selectedFieldId}
                    >
                        <option value="" disabled>Επιλέξτε Κεφάλαιο</option>
                        {activeField?.chapters.map(chapter => (
                            <option key={chapter.Id} value={chapter.Id}>
                                {chapter.Name}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Section Select */}
                <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Ενότητα</Label>
                    <Select
                        value={selectedSectionId}
                        onChange={(e) => {
                            setSelectedSectionId(e.target.value);
                        }}
                        disabled={!selectedChapterId}
                    >
                        <option value="" disabled>Επιλέξτε Ενότητα</option>
                        {activeChapter?.sections.map(section => (
                            <option key={section.Id} value={section.Id}>
                                {section.Name}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>
        </div>
    );
};

export default TopicSelector;
