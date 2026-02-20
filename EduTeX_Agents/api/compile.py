import os
import subprocess
import tempfile
import shutil
from pathlib import Path

def compile_latex_to_pdf(latex_code: str) -> bytes:
    """
    Compiles LaTeX code to PDF using xelatex.
    Returns the PDF bytes or raises an exception with the log if compilation fails.
    """
    # Create a temporary directory for compilation
    with tempfile.TemporaryDirectory() as temp_dir:
        working_dir = Path(temp_dir)
        tex_file = working_dir / "document.tex"
        
        # Write LaTeX code to file
        with open(tex_file, "w", encoding="utf-8") as f:
            f.write(latex_code)
            
        # Command to run xelatex
        # -interaction=nonstopmode: Don't stop on errors
        # -output-directory: Output PDF/log to temp dir
        cmd = [
            "xelatex",
            "-interaction=nonstopmode",
            "-output-directory", str(working_dir),
            str(tex_file)
        ]
        
        try:
            # Run compilation twice to resolve references (standard LaTeX practice)
            # First run
            subprocess.run(cmd, check=False, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=30)
            
            # Second run (for references/pagination)
            result = subprocess.run(cmd, check=False, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=30)
            
            pdf_file = working_dir / "document.pdf"
            log_file = working_dir / "document.log"
            
            if pdf_file.exists():
                with open(pdf_file, "rb") as f:
                    return f.read()
            else:
                # If PDF wasn't created, read the log file to understand why
                error_log = "PDF not created.\n"
                if log_file.exists():
                    with open(log_file, "r", encoding="utf-8", errors="replace") as f:
                        error_log += f.read()
                raise RuntimeError(f"LaTeX Compilation Failed:\n{error_log}")
                
        except subprocess.TimeoutExpired:
            raise RuntimeError("LaTeX Compilation Timed Out")
        except Exception as e:
            raise RuntimeError(f"An error occurred during compilation: {str(e)}")
