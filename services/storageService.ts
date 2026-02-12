import { Exam } from '../types';

const STORAGE_KEY = 'edutex-library';

// Helper to dispatch event for reactivity
const notifyUpdate = () => {
    window.dispatchEvent(new Event('library-updated'));
};

export const saveExam = (exam: Exam): void => {
    try {
        const existing = getLibrary();
        const index = existing.findIndex(e => e.id === exam.id);

        if (index >= 0) {
            existing[index] = exam; // Update
        } else {
            existing.unshift(exam); // Add new to top
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        notifyUpdate();
    } catch (error) {
        console.error('Failed to save exam:', error);
    }
};

export const getLibrary = (): Exam[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load library:', error);
        return [];
    }
};

export const deleteExam = (id: string): void => {
    try {
        const existing = getLibrary();
        const updated = existing.filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        notifyUpdate();
    } catch (error) {
        console.error('Failed to delete exam:', error);
    }
};

export const getExam = (id: string): Exam | undefined => {
    return getLibrary().find(e => e.id === id);
};

export const duplicateExam = (id: string): void => {
    const exam = getExam(id);
    if (exam) {
        const newExam = {
            ...exam,
            id: `copy-${Date.now()}`,
            title: `${exam.title} (Copy)`,
            createdAt: new Date().toISOString()
        };
        saveExam(newExam);
    }
};
