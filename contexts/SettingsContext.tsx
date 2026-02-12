import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────────────

export interface AppSettings {
    geminiApiKey: string;
    geminiModel: string;
    openaiApiKey: string;
    backendUrl: string;
    language: 'el' | 'en';
    theme: 'dark' | 'light' | 'system';
    defaultDifficulty: 'easy' | 'medium' | 'hard';
    defaultGradeLevel: string;
    autoSave: boolean;
    showSolutions: boolean;
    enableTimeCal: boolean;
}

interface SettingsContextType {
    settings: AppSettings;
    updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
    updateSettings: (partial: Partial<AppSettings>) => void;
    resetSettings: () => void;
    resolvedTheme: 'dark' | 'light';
}

// ─── Defaults ───────────────────────────────────────────────────────

const STORAGE_KEY = 'edutex-settings';

export const DEFAULT_SETTINGS: AppSettings = {
    geminiApiKey: '',
    geminiModel: 'gemini-1.5-flash-latest',
    openaiApiKey: '',
    backendUrl: 'http://localhost:8000',
    language: 'el',
    theme: 'dark',
    defaultDifficulty: 'medium',
    defaultGradeLevel: "Γ' Λυκείου",
    autoSave: true,
    showSolutions: false,
    enableTimeCal: true,
};

// ─── Context ────────────────────────────────────────────────────────

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings(): SettingsContextType {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
}

// ─── Helper: Resolve theme ──────────────────────────────────────────

function getSystemTheme(): 'dark' | 'light' {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

function resolveTheme(theme: AppSettings['theme']): 'dark' | 'light' {
    return theme === 'system' ? getSystemTheme() : theme;
}

// ─── Provider ───────────────────────────────────────────────────────

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });

    const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => resolveTheme(settings.theme));

    // Apply theme to <html>
    useEffect(() => {
        const resolved = resolveTheme(settings.theme);
        setResolvedTheme(resolved);

        const root = document.documentElement;
        if (resolved === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }
    }, [settings.theme]);

    // Listen for system theme changes when in "system" mode
    useEffect(() => {
        if (settings.theme !== 'system') return;

        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            const next = e.matches ? 'dark' : 'light';
            setResolvedTheme(next);
            document.documentElement.classList.toggle('dark', next === 'dark');
            document.documentElement.classList.toggle('light', next === 'light');
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [settings.theme]);

    // Apply language to <html lang>
    useEffect(() => {
        document.documentElement.lang = settings.language === 'el' ? 'el' : 'en';
    }, [settings.language]);

    // Persist on change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const updateSettings = useCallback((partial: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...partial }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, updateSettings, resetSettings, resolvedTheme }}>
            {children}
        </SettingsContext.Provider>
    );
};
