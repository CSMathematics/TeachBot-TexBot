import sys
import os
import subprocess
import time

# Attempt to import AI libraries gracefully
try:
    from google import genai  # type: ignore
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

try:
    import openai # type: ignore
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

from typing import Optional, Literal

class Fixer:
    """
    Handles AI-powered LaTeX error fixing.
    Provider-agnostic: Supports Google Gemini and OpenAI.
    """
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.enabled = False
        self.provider: Optional[Literal["gemini", "openai"]] = None

        if self.gemini_key and HAS_GEMINI:
            self.gemini_client = genai.Client(api_key=self.gemini_key)  # type: ignore
            self.provider = "gemini"
            self.enabled = True
        elif self.openai_key and HAS_OPENAI:
            self.client = openai.OpenAI(api_key=self.openai_key) # type: ignore
            self.provider = "openai"
            self.enabled = True
    
    def try_fix(self, code, error_log):
        """
        Sends the code and error to the LLM and returns the fixed code.
        """
        if not self.enabled:
            return None

        prompt = f"""
You are an expert LaTeX debugger. 
Fix the following LaTeX code based on the error log.
Return ONLY the corrected LaTeX code. No markdown, no explanations.

ERROR LOG:
{error_log}

CODE:
{code}
"""
        print(f"Asking {self.provider.upper()} to fix the error...")
        try:
            if self.provider == "gemini":
                response = self.gemini_client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=prompt,
                )
                return response.text.strip().replace("```latex", "").replace("```", "")
            
            elif self.provider == "openai":
                response = self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": "You are an expert LaTeX debugger. Return only raw LaTeX code."},
                        {"role": "user", "content": prompt}
                    ]
                )
                return response.choices[0].message.content.strip().replace("```latex", "").replace("```", "")
                
        except Exception as e:
            print(f"AI Fix failed: {e}")
            return None

def compile_latex(file_path):
    """
    Compiles a LaTeX file with self-healing capabilities.
    """
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return False

    fixer = Fixer()
    max_retries = 3
    current_try = 0

    while current_try <= max_retries:
        print(f"Compiling {file_path} (Attempt {current_try + 1}/{max_retries + 1})...")
        
        try:
            # Run pdflatex
            # We use capture_output=True to get stdout/stderr for the log
            result = subprocess.run(
                ['pdflatex', '-interaction=nonstopmode', file_path], 
                check=True, 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE,
                text=True # Ensure output is string
            )
            
            # If successful, run again for references (standard practice) but only if first time
            if current_try == 0:
                subprocess.run(['pdflatex', '-interaction=nonstopmode', file_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            print(f"Compilation successful! Created {file_path.replace('.tex', '.pdf')}")
            return True

        except subprocess.CalledProcessError as e:
            print("Compilation failed.")
            error_log = e.stdout[-2000:] # Capture last 2000 chars of output which usually has the error
            
            if not fixer.enabled:
                print("Tip: Set GEMINI_API_KEY or OPENAI_API_KEY to enable auto-fixing!")
                print("Error output snippet:")
                print(error_log[-500:])
                return False
            
            if current_try < max_retries:
                print("Attempting self-healing...")
                with open(file_path, 'r', encoding='utf-8') as f:
                    code = f.read()
                
                fixed_code = fixer.try_fix(code, error_log)
                
                if fixed_code:
                    # Backup original
                    backup_path = file_path + f".bak{current_try}"
                    with open(backup_path, 'w', encoding='utf-8') as f:
                        f.write(code)
                    print(f"   Backup saved to {backup_path}")
                    
                    # Write fix
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(fixed_code)
                    print("   Applied AI fix. Retrying...")
                    current_try += 1
                    time.sleep(1) # Brief pause
                else:
                    print("   AI could not generate a fix. Stopping.")
                    return False
            else:
                print("Max retries reached.")
                return False
                
        except FileNotFoundError:
            print("Error: 'pdflatex' command not found. Please install a TeX distribution.")
            return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python compile.py [file.tex]")
    else:
        compile_latex(sys.argv[1])
