import React, { useEffect, useRef } from 'react';

interface LatexRendererProps {
  latex: string;
  block?: boolean;
  className?: string;
}

declare global {
  interface Window {
    katex: any;
    renderMathInElement: any;
  }
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ latex, block = false, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && window.renderMathInElement) {
      // Set content first (text + math delimiters)
      containerRef.current.innerText = latex;

      // Auto-render math
      window.renderMathInElement(containerRef.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });
    } else if (containerRef.current && window.katex) {
      // Fallback for pure math strings if auto-render missing
      try {
        window.katex.render(latex, containerRef.current, {
          throwOnError: false,
          displayMode: block,
          output: 'html',
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        containerRef.current.innerText = latex;
      }
    }
  }, [latex, block]);

  return <div ref={containerRef} className={`${block ? 'my-2' : 'inline'} ${className}`} />;
};

export default LatexRenderer;