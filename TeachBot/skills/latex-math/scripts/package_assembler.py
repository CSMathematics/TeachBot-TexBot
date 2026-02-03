import sys
import os
import shutil
import subprocess

def create_package(input_file):
    """
    Compiles LaTeX file, creates a package folder, and moves artifacts there.
    """
    if not os.path.exists(input_file):
        print(f"❌ Error: File {input_file} not found.")
        return

    base_name = os.path.splitext(os.path.basename(input_file))[0]
    folder_name = f"{base_name}_Package"

    # Create folder
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
        print(f"📂 Created folder: {folder_name}")

    # Compile PDF (using existing compile script if available, else simple logic)
    # Asking pdflatex twice
    print("⚙️  Compiling PDF...")
    try:
        subprocess.run(['pdflatex', '-interaction=nonstopmode', input_file], check=True, stdout=subprocess.DEVNULL)
        subprocess.run(['pdflatex', '-interaction=nonstopmode', input_file], check=True, stdout=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        print(f"⚠️ Warning: Compilation had errors (or just warnings).")
    except FileNotFoundError:
        print("❌ Error: pdflatex not found.")

    # Move files
    extensions = ['.tex', '.pdf']
    for ext in extensions:
        file = f"{base_name}{ext}"
        if os.path.exists(file):
            shutil.move(file, os.path.join(folder_name, file))
            print(f"➡️  Moved {file}")
            
    # Move related files (Student/Teacher versions if they exist)
    for variant in ['_Student', '_Teacher', '_Sol']:
        for ext in extensions:
            file = f"{base_name}{variant}{ext}"
            if os.path.exists(file):
                shutil.move(file, os.path.join(folder_name, file))
                print(f"➡️  Moved {file}")

    # Cleanup junk in root
    junk_exts = ['.aux', '.log', '.out', '.toc', '.fls', '.fdb_latexmk']
    for ext in junk_exts:
        file = f"{base_name}{ext}"
        if os.path.exists(file):
            os.remove(file)
            
    print(f"✅ Package ready at: {folder_name}/")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python package_assembler.py [main_file.tex]")
    else:
        create_package(sys.argv[1])
