import React, { useState, useEffect, useMemo } from 'react';
import { Exam } from '../types';
import LatexRenderer from './LatexRenderer';
import { Eye, EyeOff, Palette, ZoomIn, ZoomOut, Settings, Type, Calendar, User, Layout, Edit3, Save, FileText, Split, Code, Copy } from 'lucide-react';
import { cn } from '../lib/utils';
import { PRESET_COLORS, TemplateConfig } from '../services/templateService';
import { generateLatexFromExam } from '../lib/latexGenerator';
import { Button, Input, Label, Textarea } from "./ui";

// ── Helpers ──────────────────────────────────────────────────────────

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
  onExamChange?: (exam: Exam) => void;
  templateConfig?: TemplateConfig;
  onConfigChange?: (config: TemplateConfig) => void;
  className?: string;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({
  exam,
  onExamChange,
  templateConfig,
  onConfigChange,
  className
}) => {
  const [solutionsMode, setSolutionsMode] = useState<'none' | 'inline' | 'separate'>('none');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [zoom, setZoom] = useState(0.65);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [latexCode, setLatexCode] = useState("");
  const [paginatedQuestions, setPaginatedQuestions] = useState<Exam['questions'][]>([]);

  const mainColor = templateConfig?.mainColor || '#1285cc';

  // Pagination Logic
  useEffect(() => {
    // Wait for render
    setTimeout(() => {
      const questions = exam.questions || [];
      if (questions.length === 0) {
        setPaginatedQuestions([]);
        return;
      }

      const container = document.getElementById('measure-container');
      if (!container) return;

      const maxPageHeight = 1123;
      const headerHeight = 350; // Approx logic: header + padding
      const normalPadding = 150; // Top + Bottom padding for sub-pages
      const contentHeightPage1 = maxPageHeight - headerHeight;
      const contentHeightNext = maxPageHeight - normalPadding;

      const pages: Exam['questions'][] = [];
      let currentPage: Exam['questions'] = [];
      let currentHeight = 0;
      let isFirstPage = true;

      const children = Array.from(container.children) as HTMLElement[];

      // If simple mismatch length, fallback to all in one
      if (children.length !== questions.length) {
        setPaginatedQuestions([questions]);
        return;
      }

      questions.forEach((q, i) => {
        const h = children[i].offsetHeight + 24; // + gap
        const limit = isFirstPage ? contentHeightPage1 : contentHeightNext;

        if (currentHeight + h > limit && currentPage.length > 0) {
          pages.push(currentPage);
          currentPage = [];
          currentHeight = 0;
          isFirstPage = false;
        }

        currentPage.push(q);
        currentHeight += h;
      });

      if (currentPage.length > 0) pages.push(currentPage);
      setPaginatedQuestions(pages);

    }, 300); // Small delay to allow Latex to render
  }, [exam.questions, solutionsMode, templateConfig]);

  useEffect(() => {
    setLatexCode(generateLatexFromExam(exam, { ...templateConfig!, mainColor }));
  }, [exam, templateConfig, mainColor]);

  // Handlers
  const handleColorChange = (color: string) => {
    onConfigChange?.({ ...templateConfig!, mainColor: color });
  };

  const updateExam = (updates: Partial<Exam>) => {
    onExamChange?.({ ...exam, ...updates });
  };

  const updateQuestion = (id: string, newContent: string) => {
    const updatedQuestions = (exam.questions || []).map(q =>
      q.id === id ? { ...q, content: newContent } : q
    );
    updateExam({ questions: updatedQuestions });
  };

  // Derived fields
  const title = exam.title;
  const subtitle = exam.subtitle || '';
  const info = exam.headerInfo ?? `${exam.gradeLevel || ''} • ${exam.subject || ''} • ${new Date().toLocaleDateString('el-GR')}`;

  // Fetch SVG
  useEffect(() => {
    fetch(`/templates/exam.svg?t=${Date.now()}`)
      .then(res => res.text())
      .then(text => setSvgContent(text))
      .catch(err => console.error('Failed to load SVG template:', err));
  }, []);

  // Debounced color
  const debouncedColor = useDebounce(mainColor, 100);

  // Derived colors
  const darkColor = useMemo(() => {
    const r = parseInt(debouncedColor.slice(1, 3), 16);
    const g = parseInt(debouncedColor.slice(3, 5), 16);
    const b = parseInt(debouncedColor.slice(5, 7), 16);
    return `rgb(${Math.floor(r * 0.4)}, ${Math.floor(g * 0.4)}, ${Math.floor(b * 0.4)})`;
  }, [debouncedColor]);

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
    return { d20: darken(0.2), d90: darken(0.9), d40: darken(0.4) };
  }, [debouncedColor]);

  const processedSvg = useMemo(() => {
    if (!svgContent) return null;
    return svgContent
      .replace(/#1285cc/gi, debouncedColor)
      .replace(/#1078b8/gi, colors.d20)
      .replace(/#062e47/gi, colors.d90)
      .replace(/#0e6aa3/gi, colors.d40);
  }, [svgContent, debouncedColor, colors]);

  return (
    <div className={cn("flex w-full h-full gap-6 min-h-0", className)}>

      {/* ── Left: Preview Area ────────────────────────────────────── */}
      <div className="flex-1 bg-gray-100/50 rounded-xl border overflow-hidden relative flex flex-col">

        <div className="flex-1 overflow-auto p-8 flex justify-center group relative">

          {/* A4 Paper */}
          {/* A4 Paper Pages */}
          {viewMode === 'preview' ? (
            <div className="flex flex-col gap-8 pb-10 items-center">
              {/* Hidden Measurement Container */}
              <div
                id="measure-container"
                className="absolute top-0 left-0 w-[794px] invisible pointer-events-none"
                style={{ visibility: 'hidden', height: 0, overflow: 'hidden' }}
              >
                {(exam.questions || []).map((q, idx) => (
                  <div key={`measure-${q.id || idx}`} className="p-2 -m-2 question-measure-item">
                    <div className="flex items-baseline gap-3 mb-2">
                      <div className="w-7 h-7" />
                    </div>
                    <div className="text-base leading-relaxed font-serif pl-10 pr-2 relative">
                      <LatexRenderer latex={q.content} />
                    </div>
                    {q.tags && <div className="mt-2" />}
                    {solutionsMode === 'inline' && q.solution && <div className="mt-4"><LatexRenderer latex={q.solution} /></div>}
                  </div>
                ))}
              </div>

              {/* Render Pages */}
              {paginatedQuestions.map((pageQuestions, pageIdx) => (
                <div
                  key={pageIdx}
                  className="bg-white text-black shadow-2xl transition-transform duration-300 relative overflow-hidden shrink-0 flex flex-col"
                  style={{
                    width: '794px',
                    height: '1123px',
                    minHeight: '1123px',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                    marginBottom: `${(1123 * zoom) - 1123}px` // Compensate for scale causing gaps/overlap
                  }}
                >
                  {/* SVG Background (Header part only on page 1, footer relative) */}
                  {processedSvg ? (
                    <div
                      className="absolute top-0 left-0 w-full h-[1123px] pointer-events-none z-0 [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: processedSvg }}
                    />
                  ) : null}

                  {/* Page 1 Header */}
                  {pageIdx === 0 && (
                    <div className="relative z-20 px-14 pt-28 flex justify-between items-start gap-8 shrink-0">
                      {/* Left Column: Title & Info */}
                      <div className="flex-1 max-w-[60%]">
                        <h1 className="text-3xl font-bold font-serif mb-2 leading-tight" style={{ color: darkColor }}>
                          {title || <span className="opacity-30 italic">Τίτλος Διαγωνίσματος</span>}
                        </h1>
                        <div className="text-sm font-serif italic text-gray-600 mb-1">
                          {info || <span className="opacity-30">Πληροφορίες (Τάξη • Μάθημα)</span>}
                        </div>
                        <div className="text-sm font-serif text-gray-500 min-h-[1.25rem]">{subtitle}</div>
                      </div>
                      {/* Right Column: Student Info */}
                      <div className="w-[35%] flex flex-col gap-3 pt-2">
                        <div className="border-b border-dotted border-gray-800 pb-1 text-sm font-serif text-gray-700 flex justify-between items-baseline">
                          <span className="opacity-70 text-xs uppercase tracking-wider font-sans font-bold">Όνομα</span>
                          <span className="font-semibold text-right truncate pl-2">{exam.studentName || '................................'}</span>
                        </div>
                        <div className="border-b border-dotted border-gray-800 pb-1 text-sm font-serif text-gray-700 flex justify-between items-baseline">
                          <span className="opacity-70 text-xs uppercase tracking-wider font-sans font-bold">Τμήμα</span>
                          <span className="font-semibold text-right truncate pl-2">{exam.studentClass || '...........'}</span>
                        </div>
                        <div className="border-b border-dotted border-gray-800 pb-1 text-sm font-serif text-gray-700 flex justify-between items-baseline">
                          <span className="opacity-70 text-xs uppercase tracking-wider font-sans font-bold">Ημερομηνία</span>
                          <span className="font-semibold text-right truncate pl-2">{exam.examDate || '...........'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Spacer for Page 1 Header or Top Margin for others */}
                  <div className={cn("shrink-0", pageIdx === 0 ? "h-16" : "h-24")} />

                  {/* Page Content */}
                  <div className="flex-1 px-14 pb-16 space-y-6">
                    {(pageQuestions).map((q, qIdx) => {
                      const globalIdx = (exam.questions || []).findIndex(eq => eq.id === q.id);
                      return (
                        <div
                          key={q.id || globalIdx}
                          className={cn(
                            "relative break-inside-avoid group/q rounded-lg transition-all",
                            editingQuestionId === q.id ? "ring-2 ring-blue-500 ring-offset-4 bg-blue-50/50 p-2 -m-2 z-20" : "hover:bg-gray-50/50 p-2 -m-2 cursor-pointer"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editingQuestionId !== q.id) setEditingQuestionId(q.id);
                          }}
                        >
                          {/* Question Render (Reuse existing logic) */}
                          {editingQuestionId === q.id ? (
                            <div className="relative" onClick={e => e.stopPropagation()}>
                              {/* Edit Mode Content... same as before */}
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-blue-600 uppercase">Editing Latex</span>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-blue-100 text-blue-600" onClick={(e) => { e.stopPropagation(); setEditingQuestionId(null); }}>
                                  <Save className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                              <Textarea className="font-mono text-xs min-h-[100px] bg-white/80" value={q.content} onChange={(e) => updateQuestion(q.id, e.target.value)} autoFocus />
                              <div className="mt-2"><LatexRenderer latex={q.content} /></div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-baseline gap-3 mb-2">
                                <div className="flex items-center justify-center w-7 h-7 rounded text-white font-bold text-sm shrink-0 shadow-sm" style={{ backgroundColor: debouncedColor }}>
                                  {globalIdx + 1}
                                </div>
                                {q.points != null && <span className="ml-auto text-xs font-serif italic border border-gray-200 bg-white/80 rounded px-2 py-0.5 text-gray-500">{q.points} μονάδες</span>}
                              </div>
                              <div className="text-base leading-relaxed font-serif pl-10 pr-2 relative">
                                <LatexRenderer latex={q.content} />
                                <Edit3 className="absolute -left-6 top-0 w-3.5 h-3.5 text-gray-300 opacity-0 group-hover/q:opacity-100 transition-opacity" />
                              </div>
                              {q.tags && q.tags.length > 0 && (
                                <div className="flex gap-2 flex-wrap mt-2 pl-10 opacity-70">
                                  {q.tags.map(tag => <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-serif italic">{tag}</span>)}
                                </div>
                              )}
                              {solutionsMode === 'inline' && q.solution && (
                                <div className="mt-4 ml-10 p-4 rounded-lg border-l-4 bg-gray-50/80 backdrop-blur-sm" style={{ borderLeftColor: debouncedColor }}>
                                  <p className="text-xs font-bold mb-1 uppercase tracking-wider opacity-70" style={{ color: darkColor }}>ΛΥΣΗ</p>
                                  <div className="text-sm font-serif leading-relaxed text-gray-800"><LatexRenderer latex={q.solution} /></div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}

                    {/* Solutions on Last Page if Separate */}
                    {solutionsMode === 'separate' && pageIdx === paginatedQuestions.length - 1 && (
                      <div className="mt-12 border-t-2 border-dashed border-gray-300 pt-12 px-14 pb-16">
                        <h2 className="text-2xl font-bold font-serif mb-8 text-center" style={{ color: darkColor }}>Απαντήσεις & Λύσεις</h2>
                        <div className="space-y-8">
                          {(exam.questions || []).filter(q => q.solution).map((q, idx) => (
                            <div key={`sol-${idx}`}>
                              <div className="flex items-center gap-2 mb-2 font-bold text-sm text-gray-600">
                                <span>Θέμα {(exam.questions || []).indexOf(q) + 1}</span>
                                <div className="h-px bg-gray-200 flex-1" />
                              </div>
                              <div className="text-sm font-serif leading-relaxed text-gray-800 pl-4 border-l-2 border-gray-100"><LatexRenderer latex={q.solution} /></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Page Footer */}
                  <div className="absolute bottom-0 w-full h-16 bg-white z-10 flex items-center justify-center border-t border-gray-100/50">
                    <span className="text-xs font-serif text-gray-400">Σελίδα {pageIdx + 1} / {paginatedQuestions.length}</span>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {paginatedQuestions.length === 0 && (
                <div
                  className="bg-white text-black shadow-2xl relative overflow-hidden shrink-0 flex flex-col items-center justify-center p-12"
                  style={{ width: '794px', height: '1123px', transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                >
                  <div className="text-center py-12 text-gray-400 italic font-serif">
                    Δεν βρέθηκαν ερωτήσεις.
                  </div>
                </div>
              )}
            </div>

          ) : (
            <div className="w-full h-full p-0 bg-gray-900 text-gray-100 font-mono text-sm overflow-hidden rounded-lg shadow-inner flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
                <span className="text-xs text-gray-400">LaTeX Source (Editable Scratchpad)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-2 text-xs hover:bg-gray-700 text-gray-300"
                  onClick={() => {
                    navigator.clipboard.writeText(generateLatexFromExam(exam, { ...templateConfig!, mainColor }));
                  }}
                >
                  <Copy size={12} /> Copy
                </Button>
              </div>
              <Textarea
                className="flex-1 w-full h-full resize-none bg-gray-900 text-gray-100 border-0 focus-visible:ring-0 p-4 font-mono leading-relaxed custom-scrollbar"
                value={latexCode}
                onChange={(e) => setLatexCode(e.target.value)}
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Sidebar Controls ────────────────────────────────── */}
      <div className="w-80 bg-white border rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0 h-full min-h-0">
        <div className="p-4 border-b bg-gray-50/50">
          <h2 className="font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Ρυθμίσεις Εγγράφου
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {/* Zoom Section (Moved to Sidebar) */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Προβολη & Zoom
            </Label>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs font-mono font-medium">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(2.0, z + 0.1))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* View Mode Section */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Λειτουργία Προβολής
            </Label>
            <div className="flex p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setViewMode('preview')}
                className={cn("flex-1 flex items-center justify-center gap-2 text-[10px] font-medium py-1.5 rounded-md transition-all", viewMode === 'preview' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black")}
              >
                <FileText className="w-3 h-3" /> Preview
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={cn("flex-1 flex items-center justify-center gap-2 text-[10px] font-medium py-1.5 rounded-md transition-all", viewMode === 'code' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black")}
              >
                <Code className="w-3 h-3" /> LaTeX Class
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Solutions Mode Section */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1">
              <BookOpenIcon className="w-3 h-3" />
              Λυσεις
            </Label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setSolutionsMode('none')}
                className={cn("text-[10px] font-medium py-1.5 rounded-md transition-all", solutionsMode === 'none' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black")}
              >
                Καμία
              </button>
              <button
                onClick={() => setSolutionsMode('inline')}
                className={cn("text-[10px] font-medium py-1.5 rounded-md transition-all", solutionsMode === 'inline' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black")}
              >
                Inline
              </button>
              <button
                onClick={() => setSolutionsMode('separate')}
                className={cn("text-[10px] font-medium py-1.5 rounded-md transition-all", solutionsMode === 'separate' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black")}
              >
                Ξεχωριστά
              </button>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight px-1">
              {solutionsMode === 'none' && "Οι λύσεις δεν θα εμφανίζονται στο PDF."}
              {solutionsMode === 'inline' && "Κάθε λύση θα εμφανίζεται ακριβώς κάτω από την άσκηση."}
              {solutionsMode === 'separate' && "Οι λύσεις θα προστεθούν σε νέες σελίδες στο τέλος του εγγράφου."}
            </p>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Appearance Section */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Εμφανιση</Label>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label className="text-xs">Χρώμα Θέματος</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c.hex}
                    onClick={() => handleColorChange(c.hex)}
                    className={cn(
                      "w-6 h-6 rounded-full transition-all border-2",
                      mainColor === c.hex ? "scale-110 border-gray-900 shadow-md" : "border-transparent hover:scale-110"
                    )}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                  <input
                    type="color"
                    value={mainColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 p-0 cursor-pointer opacity-0"
                  />
                  <div className="w-full h-full" style={{ background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Text Content Section */}
          <div className="space-y-4">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1">
              <Type className="w-3 h-3" />
              Κεφαλιδα & Στοιχεια
            </Label>

            <div className="space-y-2">
              <Label className="text-xs">Τίτλος</Label>
              <Input
                value={title}
                onChange={e => updateExam({ title: e.target.value })}
                placeholder="π.χ. Διαγώνισμα Άλγεβρας"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Υπότιτλος</Label>
              <Input
                value={subtitle}
                onChange={e => updateExam({ subtitle: e.target.value })}
                placeholder="π.χ. Κεφάλαιο 1 - Εξισώσεις"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Πληροφορίες (Τάξη • Μάθημα)</Label>
              <Input
                value={info}
                onChange={e => updateExam({ headerInfo: e.target.value })}
                placeholder="π.χ. Β' Λυκείου • Μαθηματικά"
              />
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Student Info Section */}
          <div className="space-y-4">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1">
              <User className="w-3 h-3" />
              Στοιχεία Μαθητή (Προαιρετικά)
            </Label>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2 col-span-2">
                <Label className="text-xs">Ονοματεπώνυμο</Label>
                <Input
                  value={exam.studentName || ''}
                  onChange={e => updateExam({ studentName: e.target.value })}
                  placeholder="Κενό για συμπλήρωση"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Τμήμα</Label>
                <Input
                  value={exam.studentClass || ''}
                  onChange={e => updateExam({ studentClass: e.target.value })}
                  placeholder="Κενό..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Ημερομηνία</Label>
                <Input
                  value={exam.examDate || ''}
                  onChange={e => updateExam({ examDate: e.target.value })}
                  placeholder="Κενό..."
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Layout / Future Section */}
          <div className="space-y-3 opacity-50 pointer-events-none">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1">
              <Layout className="w-3 h-3" />
              Διαταξη (Προσεχως)
            </Label>
            <div className="text-xs text-gray-400">
              Δυνατότητα επιλογής template (Scientific, Modern, Classic)
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

// Helper Icon for solutions
const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

export default PdfPreview;