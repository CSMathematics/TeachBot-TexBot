import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react';
import { cn } from '../lib/utils';

// ── Types ────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType, duration?: number) => void;
}

// ── Context ──────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({
    toast: () => { },
});

export const useToast = () => useContext(ToastContext);

// ── Provider ─────────────────────────────────────────────────────────

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((message: string, type: ToastType = 'info', duration = 3500) => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, message, type, duration }]);
        setTimeout(() => removeToast(id), duration);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

// ── ToastItem ────────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
    error: <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
};

const STYLES: Record<ToastType, string> = {
    success: 'border-emerald-500/30 bg-emerald-500/5',
    error: 'border-red-500/30 bg-red-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    info: 'border-blue-500/30 bg-blue-500/5',
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: () => void }> = ({ toast, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    return (
        <div
            className={cn(
                'pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm max-w-sm transition-all duration-300',
                STYLES[toast.type],
                visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            )}
        >
            {ICONS[toast.type]}
            <span className="text-sm text-foreground flex-1">{toast.message}</span>
            <button
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

export default ToastProvider;
