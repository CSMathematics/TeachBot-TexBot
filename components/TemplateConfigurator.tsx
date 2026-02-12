import React, { useState } from 'react';
import { TEMPLATE_STYLES, PRESET_COLORS, DEFAULT_TEMPLATE_CONFIG, TemplateConfig } from '../services/templateService';
import { Palette, Layout, ChevronDown } from 'lucide-react';

interface TemplateConfiguratorProps {
    config: TemplateConfig;
    onChange: (config: TemplateConfig) => void;
}

/**
 * TemplateConfigurator — Style selector + color picker + live mini-preview
 * that mimics the exam.cls visual appearance.
 */
const TemplateConfigurator: React.FC<TemplateConfiguratorProps> = ({ config, onChange }) => {
    const [expanded, setExpanded] = useState(false);

    const update = (partial: Partial<TemplateConfig>) =>
        onChange({ ...config, ...partial });

    return (
        <div className="space-y-3 pt-3 border-t border-border">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full group"
            >
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <Layout size={12} />
                    Template
                </span>
                <ChevronDown
                    size={14}
                    className={`text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
            </button>

            {expanded && (
                <div className="space-y-4 animate-in slide-in-from-top-1 duration-200">
                    {/* Live mini-preview */}
                    <LivePreview style={config.style} color={config.mainColor} />

                    {/* Style selector */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground font-medium">Στυλ</label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {TEMPLATE_STYLES.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => update({ style: s.id })}
                                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all border ${config.style === s.id
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {s.nameEl}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color picker */}
                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <Palette size={11} />
                            Χρώμα
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c.hex}
                                    onClick={() => update({ mainColor: c.hex })}
                                    title={c.name}
                                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${config.mainColor === c.hex
                                            ? 'border-foreground ring-2 ring-primary/30 scale-110'
                                            : 'border-transparent'
                                        }`}
                                    style={{ backgroundColor: c.hex }}
                                />
                            ))}
                            {/* Custom color input */}
                            <label className="w-6 h-6 rounded-full border-2 border-dashed border-border cursor-pointer overflow-hidden hover:border-primary/50 transition-colors"
                                title="Custom color"
                            >
                                <input
                                    type="color"
                                    value={config.mainColor}
                                    onChange={(e) => update({ mainColor: e.target.value })}
                                    className="opacity-0 w-full h-full cursor-pointer"
                                />
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Live Mini-Preview ────────────────────────────────────────────────

interface LivePreviewProps {
    style: string;
    color: string;
}

const LivePreview: React.FC<LivePreviewProps> = ({ style, color }) => {
    const darken = (hex: string, factor: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
    };

    const dark1 = darken(color, 0.7);
    const dark2 = darken(color, 0.55);

    return (
        <div
            className="rounded-lg overflow-hidden border border-border shadow-sm bg-white"
            style={{ aspectRatio: '210/80' }}
        >
            {style === 'classic' && (
                <div className="h-full flex flex-col items-center justify-center p-2 gap-0.5" style={{ fontFamily: 'serif' }}>
                    <div className="text-[8px] font-bold tracking-wide" style={{ color }}>
                        MATHWORLD.GR
                    </div>
                    <div className="w-12 h-[1px]" style={{ backgroundColor: color }} />
                    <div className="text-[6px] text-gray-600 mt-0.5">Διαγώνισμα</div>
                    <div className="text-[5px] text-gray-400">Κεφάλαιο • Ημερομηνία</div>
                </div>
            )}

            {style === 'modern' && (
                <div className="h-full flex">
                    <div className="w-[18%] h-full flex flex-col items-center justify-center gap-0.5 py-1"
                        style={{ background: `linear-gradient(135deg, ${color}, ${dark1})` }}
                    >
                        <div className="w-3 h-3 rounded-full bg-white/20" />
                        <div className="text-[4px] text-white/70 font-bold rotate-[-90deg] mt-1">MW</div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center p-2 gap-0.5">
                        <div className="text-[7px] font-bold" style={{ color: dark2 }}>Διαγώνισμα</div>
                        <div className="text-[5px] text-gray-400">Κεφάλαιο • Ημερομηνία</div>
                        <div className="flex gap-1 mt-0.5">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-1.5 h-1.5 rounded-sm opacity-60" style={{ backgroundColor: color }} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {style === 'scientific' && (
                <div className="h-full flex flex-col">
                    <div className="flex" style={{ height: '55%' }}>
                        <div className="flex-1 flex flex-col justify-center p-1.5 gap-0.5">
                            <div className="text-[7px] font-bold" style={{ color: dark2 }}>Διαγώνισμα</div>
                            <div className="text-[5px] text-gray-400">Κεφάλαιο</div>
                            <div className="text-[4px] text-gray-300 mt-0.5 font-mono">f'(x) = lim Δx→0</div>
                        </div>
                        <div className="w-[35%] h-full flex flex-col items-end justify-between p-1">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="flex gap-[2px]">
                                    {[0, 1, 2].map(j => (
                                        <div
                                            key={j}
                                            className="w-2 h-2 rounded-[1px]"
                                            style={{ backgroundColor: color, opacity: 0.15 + (i + j) * 0.1 }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-[1px] mx-1" style={{ backgroundColor: color, opacity: 0.3 }} />
                    <div className="flex-1 flex items-center px-1.5 gap-1">
                        {['✉', '☎', '🌐'].map((icon, i) => (
                            <span key={i} className="text-[4px]" style={{ color }}>{icon}</span>
                        ))}
                        <span className="text-[4px] text-gray-400 ml-auto">mathworld.gr</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateConfigurator;
export { DEFAULT_TEMPLATE_CONFIG };
export type { TemplateConfig };
