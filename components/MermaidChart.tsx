import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';

// Dynamically load mermaid from CDN to avoid npm dependency
let mermaidPromise: Promise<any> | null = null;
function loadMermaid() {
    if (!mermaidPromise) {
        mermaidPromise = new Promise((resolve, reject) => {
            if ((window as any).mermaid) {
                resolve((window as any).mermaid);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
            script.onload = () => {
                const m = (window as any).mermaid;
                m.initialize({
                    startOnLoad: false,
                    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
                    flowchart: { curve: 'basis', padding: 20 },
                    securityLevel: 'loose',
                });
                resolve(m);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    return mermaidPromise;
}

interface MermaidChartProps {
    chart: string;
    className?: string;
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chart, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!chart || !containerRef.current) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const mermaid = await loadMermaid();
                if (cancelled) return;

                const id = `mermaid-${Date.now()}`;
                const { svg } = await mermaid.render(id, chart);
                if (cancelled || !containerRef.current) return;

                containerRef.current.innerHTML = svg;
                setLoading(false);
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message || 'Failed to render flowchart');
                    setLoading(false);
                }
            }
        })();

        return () => { cancelled = true; };
    }, [chart]);

    if (error) {
        return (
            <div className={cn("p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive", className)}>
                <p className="font-medium mb-1">Render Error</p>
                <pre className="text-xs whitespace-pre-wrap">{error}</pre>
                <details className="mt-2">
                    <summary className="text-xs cursor-pointer opacity-70">Raw Mermaid</summary>
                    <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto max-h-40">{chart}</pre>
                </details>
            </div>
        );
    }

    return (
        <div className={cn("relative", className)}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            <div
                ref={containerRef}
                className="flex items-center justify-center [&_svg]:max-w-full [&_svg]:h-auto"
            />
        </div>
    );
};

export default MermaidChart;
