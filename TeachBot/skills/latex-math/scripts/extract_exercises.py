import sys
import os
import re

def extract_exercises(file_path):
    """
    Extracts individual exercises from a LaTeX file using FFExercises templates.
    Looks for \begin{exercise} ... \end{exercise} or \item in \begin{enumerate}.
    """
    if not os.path.exists(file_path):
        print(f"❌ Error: File {file_path} not found.")
        return []

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Regex for exercise environments
        exercises = re.findall(r'\\begin\{exercise\}(.*?)\\end\{exercise\}', content, re.DOTALL)
        
        # If no exercise environments found, try looking for items in an enumerate tagged for exercises
        if not exercises:
            # Simple heuristic: find chunks starting with \item
            exercises = re.findall(r'\\item\s+(.*?)(?=\\item|\\end\{enumerate\}|\\end\{document\}|$)', content, re.DOTALL)

        print(f"✅ Extracted {len(exercises)} exercises from {os.path.basename(file_path)}.")
        return [ex.strip() for ex in exercises]

    except Exception as e:
        print(f"❌ Error extracting exercises: {e}")
        return []

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_exercises.py [path_to_latex_file]")
    else:
        results = extract_exercises(sys.argv[1])
        for i, ex in enumerate(results, 1):
            print(f"--- Exercise {i} ---")
            print(ex[:100] + "..." if len(ex) > 100 else ex)
