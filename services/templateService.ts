/**
 * Template Service - Provides template metadata and preview info for the frontend.
 * Used by ExamGenerator / WorksheetGenerator for style selection.
 */

export interface TemplateStyle {
    id: string;
    name: string;
    nameEl: string;
    description: string;
    previewColor: string;
}

export interface TemplateConfig {
    style: string;
    mainColor: string;
}

// ── Available Styles ─────────────────────────────────────────────────

export const TEMPLATE_STYLES: TemplateStyle[] = [
    {
        id: 'classic',
        name: 'Classic',
        nameEl: 'Κλασικό',
        description: 'Centred single-column layout with MathWorld branding',
        previewColor: '#aa1212',
    },
    {
        id: 'modern',
        name: 'Modern',
        nameEl: 'Μοντέρνο',
        description: 'Two-column layout with side branding and social links',
        previewColor: '#1285cc',
    },
    {
        id: 'scientific',
        name: 'Scientific',
        nameEl: 'Επιστημονικό',
        description: 'Grid header with math formulas, decorative squares, two-column body',
        previewColor: '#1285cc',
    },
];

// ── Default Config ───────────────────────────────────────────────────

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
    style: 'scientific',
    mainColor: '#1285cc',
};

// ── Preset Colors ────────────────────────────────────────────────────

export const PRESET_COLORS = [
    { name: 'Blue',       hex: '#1285cc' },
    { name: 'Red',        hex: '#aa1212' },
    { name: 'Teal',       hex: '#0094a8' },
    { name: 'Purple',     hex: '#6b21a8' },
    { name: 'Green',      hex: '#15803d' },
    { name: 'Orange',     hex: '#c2410c' },
    { name: 'Dark Blue',  hex: '#1e3a5f' },
    { name: 'Rose',       hex: '#be123c' },
];

// ── Helper ───────────────────────────────────────────────────────────

export function getStyleById(id: string): TemplateStyle | undefined {
    return TEMPLATE_STYLES.find(s => s.id === id);
}

export function getStyleLabel(id: string): string {
    return getStyleById(id)?.nameEl ?? id;
}
