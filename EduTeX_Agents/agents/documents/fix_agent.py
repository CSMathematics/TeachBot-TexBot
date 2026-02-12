import sys
import os

# Add project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from typing import TYPE_CHECKING, Optional, Dict, Any

if TYPE_CHECKING:
    from skills.latex_core.scripts.compile import compile_latex # type: ignore

try:
    from skills.latex_core.scripts.compile import compile_latex # type: ignore
except ImportError:
    # Mock
    # type: ignore
    def compile_latex(path): return True

class FixAgent:
    """
    Role: The "LaTeX Fixer"
    Responsibility: Wrapper for the self-healing compilation logic.
    """
    def __init__(self):
        self.role = "LaTeX Fixer"
        try:
             from core.llm import LLMService
             self.llm = LLMService()
        except ImportError:
             self.llm = None

    def fix_document(self, file_path):
        # ... existing logic ...
        return {"status": "skipped", "file": file_path}

    def fix(self, latex_code: str, error_message: str = "") -> dict:
        """
        API Wrapper: Fixes LaTeX code string using LLM.
        """
        print(f"Agent {self.role}: Fixing LaTeX code based on error: {error_message[:50]}...")
        
        if self.llm:
            system_prompt = f"""You are an Expert LaTeX Debugger.
            Task: Fix the LaTeX code based on the compiler error.
            Error Message: {error_message}
            
            Response MUST be ONLY the fixed LaTeX code. No explanations.
            """
            
            try:
                fixed_code = self.llm.generate(latex_code, system_instruction=system_prompt)
                # Cleanup
                if fixed_code.startswith("```latex"): fixed_code = fixed_code[8:]
                if fixed_code.startswith("```"): fixed_code = fixed_code[3:]
                if fixed_code.endswith("```"): fixed_code = fixed_code[:-3]
                
                return {
                    "latex": fixed_code,
                    "type": "fixed_latex",
                    "metadata": {"status": "fixed_by_ai", "error_processed": error_message[:20]}
                }
            except Exception as e:
                print(f"LLM Error in FixAgent: {e}")

        # Fallback
        return {
            "latex": latex_code,
            "type": "fixed_latex",
            "metadata": {"status": "failed_to_fix", "error": "LLM Error"}
        }

if __name__ == "__main__":
    fixer = FixAgent()
    # Mock file for test
    print(fixer.fix_document("test.tex"))
