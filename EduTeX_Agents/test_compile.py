from api.compile import compile_latex_to_pdf
import sys

latex_code = r"""
\documentclass{article}
\begin{document}
Hello, World!
\end{document}
"""

try:
    pdf_bytes = compile_latex_to_pdf(latex_code)
    print(f"Success! PDF compiled, size: {len(pdf_bytes)} bytes")
except Exception as e:
    print(f"Compilation failed: {e}")
    sys.exit(1)
