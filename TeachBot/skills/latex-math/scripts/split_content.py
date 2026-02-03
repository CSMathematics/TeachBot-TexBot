import sys
import os
import re

def split_content(input_file):
    """
    Splits a LaTeX file into Teacher (with solutions) and Student (without solutions) versions.
    Assumes solutions are wrapped in \begin{solution} ... \end{solution}.
    """
    if not os.path.exists(input_file):
        print(f"❌ Error: File {input_file} not found.")
        return

    base_name = os.path.splitext(input_file)[0]
    teacher_file = f"{base_name}_Teacher.tex"
    student_file = f"{base_name}_Student.tex"

    print(f"📄 Processing {input_file}...")

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Write Teacher Version (Same as original, maybe with a stamp)
        with open(teacher_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Created Teacher Version: {teacher_file}")

        # Create Student Version
        # Remove content between \begin{solution} and \end{solution}
        # and replace it with vertical space
        
        # Regex to find solution environment. DOTALL to match newlines.
        # We replace it with \vspace{3cm} or similar scaffolding
        pattern = re.compile(r'\\begin\{solution\}.*?\\end\{solution\}', re.DOTALL)
        
        student_content = re.sub(pattern, r'\\vspace{4cm}', content)
        
        # Also remove \ans command if used (e.g. \ans{5})
        student_content = re.sub(r'\\ans\{.*?\}', r'', student_content)

        # Update title if present
        student_content = student_content.replace('Teacher Edition', 'Student Edition')

        with open(student_file, 'w', encoding='utf-8') as f:
            f.write(student_content)
        print(f"✅ Created Student Version: {student_file}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python split_content.py [file.tex]")
    else:
        split_content(sys.argv[1])
