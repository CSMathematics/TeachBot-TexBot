import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Palette, Globe, Server, Shield, Eye, EyeOff, CheckCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label, Select } from '../components/ui';
import { checkBackendHealth } from '../services/agentApiService';
import { useSettings, DEFAULT_SETTINGS } from '../contexts/SettingsContext';
import { cn } from '../lib/utils';

const Settings: React.FC = () => {
    const { settings, updateSetting, resetSettings } = useSettings();

    const [showGeminiKey, setShowGeminiKey] = useState(false);
    const [showOpenaiKey, setShowOpenaiKey] = useState(false);
    const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    // Model selection state
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);

    useEffect(() => {
        if (!settings.geminiApiKey) return;
        setLoadingModels(true);
        import('../services/geminiService').then(mod => {
            mod.listAvailableModels().then(models => {
                // Filter out duplicates if any overlap with hardcoded options
                const unique = models.filter(m => !['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'].includes(m));
                setAvailableModels(unique);
                setLoadingModels(false);
            });
        });
    }, [settings.geminiApiKey]);

    useEffect(() => {
        checkBackendHealth().then(online => setBackendStatus(online ? 'online' : 'offline'));
    }, []);

    const checkBackend = () => {
        setBackendStatus('checking');
        checkBackendHealth().then(online => setBackendStatus(online ? 'online' : 'offline'));
    };

    return (
        <div className="p-8 max-w-[900px] mx-auto space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ρυθμίσεις</h1>
                    <p className="text-muted-foreground mt-1">Αλλαγές αποθηκεύονται αυτόματα.</p>
                </div>
                <Button variant="outline" onClick={resetSettings} className="gap-2 text-xs">
                    <RotateCcw size={14} /> Επαναφορά
                </Button>
            </header>

            {/* API Keys */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary"><Key className="w-5 h-5" /></div>
                        <div>
                            <CardTitle>API Keys</CardTitle>
                            <CardDescription>Κλειδιά πρόσβασης για τα AI μοντέλα</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label>Gemini API Key</Label>
                        <div className="relative">
                            <Input
                                type={showGeminiKey ? 'text' : 'password'}
                                placeholder="..."
                                value={settings.geminiApiKey}
                                onChange={(e) => updateSetting('geminiApiKey', e.target.value)}
                            />
                            <button onClick={() => setShowGeminiKey(!showGeminiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showGeminiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>

                        <div className="pt-2">
                            <Label>Μοντέλο (Model)</Label>
                            <Select
                                value={settings.geminiModel}
                                onChange={(e) => updateSetting('geminiModel', e.target.value)}
                                disabled={!settings.geminiApiKey}
                            >
                                <option value="gemini-1.5-flash-latest">gemini-1.5-flash-latest (Default)</option>
                                <option value="gemini-1.5-pro-latest">gemini-1.5-pro-latest (Better Reasoning)</option>
                                {availableModels.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </Select>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                {loadingModels ? 'Fetching models...' : 'Επιλέξτε το μοντέλο που θέλετε να χρησιμοποιήσετε.'}
                            </p>
                        </div>

                        <p className="text-[10px] text-muted-foreground">
                            Λήψη από <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google AI Studio</a>
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>OpenAI API Key <span className="text-muted-foreground text-[10px]">(προαιρετικό)</span></Label>
                        <div className="relative">
                            <Input
                                type={showOpenaiKey ? 'text' : 'password'}
                                placeholder="sk-..."
                                value={settings.openaiApiKey}
                                onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                            />
                            <button onClick={() => setShowOpenaiKey(!showOpenaiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showOpenaiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Backend */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"><Server className="w-5 h-5" /></div>
                        <div>
                            <CardTitle>Backend Server</CardTitle>
                            <CardDescription>Python FastAPI — 19 agent endpoints</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Backend URL</Label>
                        <Input
                            placeholder="http://localhost:8000"
                            value={settings.backendUrl}
                            onChange={(e) => updateSetting('backendUrl', e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                            backendStatus === 'online' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                            backendStatus === 'offline' && "bg-red-500/10 text-red-600",
                            backendStatus === 'checking' && "bg-yellow-500/10 text-yellow-600"
                        )}>
                            <div className={cn("w-2 h-2 rounded-full", backendStatus === 'online' && "bg-emerald-500", backendStatus === 'offline' && "bg-red-500", backendStatus === 'checking' && "bg-yellow-500 animate-pulse")} />
                            {backendStatus === 'online' ? 'Online' : backendStatus === 'offline' ? 'Offline — Gemini fallback' : 'Checking...'}
                        </div>
                        <Button variant="ghost" size="sm" onClick={checkBackend} className="gap-1 text-xs h-7">
                            <RefreshCw size={12} /> Test
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400"><Palette className="w-5 h-5" /></div>
                        <div>
                            <CardTitle>Εμφάνιση</CardTitle>
                            <CardDescription>Θέμα και γλώσσα — εφαρμόζονται αμέσως</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label>Θέμα</Label>
                        <div className="flex gap-2">
                            {(['dark', 'light', 'system'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => updateSetting('theme', t)}
                                    className={cn(
                                        "flex-1 p-3 rounded-lg border text-sm font-medium transition-all text-center",
                                        settings.theme === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {t === 'dark' ? '🌙 Dark' : t === 'light' ? '☀️ Light' : '💻 System'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Γλώσσα</Label>
                        <div className="flex gap-2">
                            {([{ value: 'el' as const, label: '🇬🇷 Ελληνικά' }, { value: 'en' as const, label: '🇬🇧 English' }]).map(lang => (
                                <button
                                    key={lang.value}
                                    onClick={() => updateSetting('language', lang.value)}
                                    className={cn(
                                        "flex-1 p-3 rounded-lg border text-sm font-medium transition-all text-center",
                                        settings.language === lang.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Defaults */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400"><SettingsIcon className="w-5 h-5" /></div>
                        <div>
                            <CardTitle>Προεπιλογές</CardTitle>
                            <CardDescription>Βαθμίδα, δυσκολία και λειτουργίες</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Βαθμίδα</Label>
                            <Select value={settings.defaultGradeLevel} onChange={(e) => updateSetting('defaultGradeLevel', e.target.value)}>
                                <option value="Α' Λυκείου">Α' Λυκείου</option>
                                <option value="Β' Λυκείου">Β' Λυκείου</option>
                                <option value="Γ' Λυκείου">Γ' Λυκείου</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Δυσκολία</Label>
                            <Select value={settings.defaultDifficulty} onChange={(e) => updateSetting('defaultDifficulty', e.target.value as any)}>
                                <option value="easy">Εύκολο</option>
                                <option value="medium">Μέτριο</option>
                                <option value="hard">Δύσκολο</option>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        {[
                            { key: 'autoSave' as const, label: 'Αυτόματη αποθήκευση', desc: 'Αποθήκευση στη βιβλιοθήκη μετά τη δημιουργία' },
                            { key: 'showSolutions' as const, label: 'Εμφάνιση λύσεων', desc: 'Λύσεις ορατές στην προεπισκόπηση' },
                            { key: 'enableTimeCal' as const, label: 'Εκτίμηση χρόνου', desc: 'Αυτόματος υπολογισμός χρόνου ανά άσκηση' },
                        ].map(toggle => (
                            <div key={toggle.key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                <div>
                                    <p className="text-sm font-medium">{toggle.label}</p>
                                    <p className="text-[10px] text-muted-foreground">{toggle.desc}</p>
                                </div>
                                <button
                                    onClick={() => updateSetting(toggle.key, !settings[toggle.key])}
                                    className={cn(
                                        "relative w-11 h-6 rounded-full transition-colors duration-200",
                                        settings[toggle.key] ? "bg-primary" : "bg-secondary border border-border"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                                        settings[toggle.key] ? "translate-x-[22px]" : "translate-x-0.5"
                                    )} />
                                </button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;
