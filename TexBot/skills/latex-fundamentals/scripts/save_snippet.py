import sys
import os
import re

def save_snippet(source_file, snippet_name):
    """
    Extracts the first tikzpicture environment from source_file and saves it to my_snippets/snippet_name.tex
    """
    if not os.path.exists(source_file):
        print(f"❌ Error: File '{source_file}' not found.")
        sys.exit(1)

    try:
        with open(source_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        sys.exit(1)

    # Regex to find tikzpicture environment
    # dotall=True to match newlines
    match = re.search(r'(\\begin\{tikzpicture\}.*?\\end\{tikzpicture\})', content, re.DOTALL)

    if not match:
        print(f"⚠️ No 'tikzpicture' environment found in '{source_file}'.")
        sys.exit(1)

    snippet_content = match.group(1)
    
    # Create my_snippets directory if it doesn't exist
    snippets_dir = "my_snippets"
    if not os.path.exists(snippets_dir):
        os.makedirs(snippets_dir)
        print(f"dw Created directory '{snippets_dir}'")

    # Clean snippet name
    if not snippet_name.endswith(".tex"):
        snippet_name += ".tex"
    
    output_path = os.path.join(snippets_dir, snippet_name)
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(snippet_content)
        print(f"✅ Snippet saved successfully to: {output_path}")
        print(f"   (Contains {len(snippet_content.splitlines())} lines)")
    except Exception as e:
        print(f"❌ Error writing snippet: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python save_snippet.py <source_file> <snippet_name>")
        print("Example: python save_snippet.py document.tex my_axis")
        sys.exit(1)
    
    save_snippet(sys.argv[1], sys.argv[2])
