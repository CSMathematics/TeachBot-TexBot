import React, { useState, useEffect, useMemo } from 'react';
import { Exam } from '../types';
import LatexRenderer from './LatexRenderer';
import { Eye, EyeOff, Palette } from 'lucide-react';
import { cn } from '../lib/utils';
import { PRESET_COLORS } from '../services/templateService';

// ── Helpers ──────────────────────────────────────────────────────────

// Simple debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ── Props ────────────────────────────────────────────────────────────

interface PdfPreviewProps {
  exam: Exam;
  className?: string;
}

/**
 * PdfPreview with Interactive Controls:
 * 1. Inline SVG replacement (Change #1285cc -> selected color)
 * 2. Overlaid Inputs for Title/Subtitle
 * 3. Floating Toolbar for Colors/Solutions
 */
const PdfPreview: React.FC<PdfPreviewProps> = ({ exam, className }) => {
  const [showSolutions, setShowSolutions] = useState(false);
  const [mainColor, setMainColor] = useState('#1285cc');
  const [svgContent, setSvgContent] = useState<string | null>(null);

  // Editable fields state
  const [title, setTitle] = useState(exam.title || 'ΔΙΑΓΩΝΙΣΜΑ');
  const [subtitle, setSubtitle] = useState('');
  const [info, setInfo] = useState(`${exam.gradeLevel || ''} • ${exam.subject || ''} • ${new Date().toLocaleDateString('el-GR')}`);

  // Fetch SVG once (with cache buster)
  useEffect(() => {
    fetch(`/templates/exam.svg?t=${Date.now()}`)
      .then(res => res.text())
      .then(text => setSvgContent(text))
      .catch(err => console.error('Failed to load SVG template:', err));
  }, []);

  // Debounced color for expensive SVG operations
  const debouncedColor = useDebounce(mainColor, 100);

  // Derived colors for UI elements (Text)
  const darkColor = useMemo(() => {
    const r = parseInt(debouncedColor.slice(1, 3), 16);
    const g = parseInt(debouncedColor.slice(3, 5), 16);
    const b = parseInt(debouncedColor.slice(5, 7), 16);
    return `rgb(${Math.floor(r * 0.4)}, ${Math.floor(g * 0.4)}, ${Math.floor(b * 0.4)})`;
  }, [debouncedColor]);

  // Calculate darker shades for 3D effect (20% and 40% darker)
  const colors = useMemo(() => {
    const r = parseInt(debouncedColor.slice(1, 3), 16);
    const g = parseInt(debouncedColor.slice(3, 5), 16);
    const b = parseInt(debouncedColor.slice(5, 7), 16);

    const darken = (factor: number) => {
      const r2 = Math.max(0, Math.floor(r * (1 - factor)));
      const g2 = Math.max(0, Math.floor(g * (1 - factor)));
      const b2 = Math.max(0, Math.floor(b * (1 - factor)));
      return `#${r2.toString(16).padStart(2, '0')}${g2.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`;
    };
    return { d20: darken(0.2), d40: darken(0.4) };
  }, [debouncedColor]);


  // Compute modified SVG with replaced color
  const processedSvg = useMemo(() => {
    if (!svgContent) return null;
    return svgContent
      .replace(/#1285cc/gi, debouncedColor) // Main Face
      .replace(/#111111/gi, colors.d20)         // Top Face (20% darker)
      .replace(/#222222/gi, colors.d40);        // Left Face (40% darker)
  }, [svgContent, debouncedColor, colors]);

  return (
    <div className="relative w-full max-w-4xl flex flex-col items-center gap-6">

      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 bg-white/80 backdrop-blur border shadow-sm px-4 py-2 rounded-full sticky top-4 z-50">

        {/* Color Picker */}
        <div className="flex items-center gap-2 pr-4 border-r">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1.5">
            {PRESET_COLORS.map(c => (
              <button
                key={c.hex}
                onClick={() => setMainColor(c.hex)}
                className={cn(
                  "w-5 h-5 rounded-full transition-all border-2",
                  mainColor === c.hex ? "scale-110 border-gray-900 shadow-md" : "border-transparent hover:scale-110"
                )}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
            {/* Custom Color Input */}
            <div className="relative w-5 h-5 ml-1 rounded-full overflow-hidden border border-gray-200 shadow-sm cursor-pointer group">
              <input
                type="color"
                value={mainColor}
                onChange={(e) => setMainColor(e.target.value)}
                className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 p-0 cursor-pointer opacity-0 group-hover:opacity-100"
              />
              <div
                className="w-full h-full"
                style={{ background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)` }}
              />
            </div>
          </div>
        </div>

        {/* Solutions Toggle */}
        <button
          onClick={() => setShowSolutions(!showSolutions)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
            showSolutions
              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {showSolutions ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {showSolutions ? 'Λύσεις' : 'Λύσεις'}
        </button>
      </div>


      {/* ── A4 Paper ──────────────────────────────────────────── */}
      <div
        className={cn(
          "bg-white text-black shadow-2xl origin-top transition-transform duration-300 relative overflow-hidden",
          "min-h-[1123px] w-[794px]", // A4 dimensions in px at 96 DPI
          "scale-[0.55] sm:scale-[0.65] md:scale-[0.75] lg:scale-[0.85] xl:scale-100",
          className
        )}
      >
        {/* ── SVG Background ── */}
        {processedSvg ? (
          <div
            className="absolute inset-0 w-full h-full pointer-events-none z-0 [&>svg]:w-full [&>svg]:h-full"
            dangerouslySetInnerHTML={{ __html: processedSvg }}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-slate-50 animate-pulse z-0" />
        )}

        {/* ── Header Inputs Overlay (Moved to pt-28 to avoid logo) ── */}
        <div className="absolute top-0 left-0 w-full z-20 px-14 pt-28">
          <div className="relative w-[65%]">
            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-transparent text-3xl font-bold font-serif border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors px-1 placeholder:text-gray-300 mb-2"
              style={{ color: darkColor }}
              placeholder="Τίτλος Διαγωνίσματος"
            />
            {/* Info Input (Grade, Subject, etc) */}
            <input
              type="text"
              value={info}
              onChange={e => setInfo(e.target.value)}
              className="w-full bg-transparent text-sm font-serif italic border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors px-1 text-gray-600 mb-1"
              placeholder="Τάξη • Μάθημα • Ημερομηνία"
            />
            {/* Subtitle Input */}
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              className="w-full bg-transparent text-sm font-serif text-gray-500 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors px-1 placeholder:text-transparent hover:placeholder:text-gray-300"
              placeholder="Προσθέστε υπότιτλο ή οδηγίες..."
            />
          </div>
        </div>

        {/* ── Dynamic Content ── */}
        <div className="relative z-10 flex flex-col min-h-[1123px] pointer-events-none">
          {/* Spacer for Header */}
          <div className="shrink-0" style={{ height: 190 }} />

          {/* Questions Area (Pointer events auto to allow text selection if needed) */}
          <div className="flex-1 px-14 pb-16 space-y-8 pointer-events-auto">
            {(exam.questions || []).length === 0 ? (
              <div className="text-center py-12 text-gray-400 italic font-serif">
                Δεν βρέθηκαν ερωτήσεις.
              </div>
            ) : (
              (exam.questions || []).map((q, idx) => (
                <div key={q.id || idx} className="relative break-inside-avoid group/q">
                  {/* Exercise Heading */}
                  <div className="flex items-baseline gap-3 mb-2">
                    {/* Number Badge */}
                    <div
                      className="flex items-center justify-center w-7 h-7 rounded text-white font-bold text-sm shrink-0 shadow-sm"
                      style={{ backgroundColor: debouncedColor }}
                    >
                      {idx + 1}
                    </div>
                    {/* Points Badge */}
                    {q.points != null && (
                      <span className="ml-auto text-xs font-serif italic border border-gray-200 bg-white/80 rounded px-2 py-0.5 text-gray-500">
                        {q.points} μονάδες
                      </span>
                    )}
                  </div>

                  {/* Question Body */}
                  <div className="text-base leading-relaxed font-serif pl-10 pr-2">
                    <LatexRenderer latex={q.content} />
                  </div>

                  {/* Tags */}
                  {q.tags && q.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2 pl-10 opacity-70 group-hover/q:opacity-100 transition-opacity">
                      {q.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-serif italic"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Solution */}
                  {showSolutions && q.solution && (
                    <div className="mt-4 ml-10 p-4 rounded-lg border-l-4 bg-gray-50/80 backdrop-blur-sm"
                      style={{ borderLeftColor: debouncedColor }}
                    >
                      <p className="text-xs font-bold mb-1 uppercase tracking-wider opacity-70" style={{ color: darkColor }}>
                        ΛΥΣΗ
                      </p>
                      <div className="text-sm font-serif leading-relaxed text-gray-800">
                        <LatexRenderer latex={q.solution} />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Spacer for Footer */}
          <div className="shrink-0" style={{ height: 60 }} />
        </div>
      </div>
    </div>
  );
};

export default PdfPreview;