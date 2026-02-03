---
description: Save a TikZ figure from a LaTeX file to the snippet gallery.
---

# Save Snippet Workflow

This workflow saves a `tikzpicture` environment from a source LaTeX file to your personal `my_snippets` gallery.

## Steps

1. **Identify Source File**
   - Ask the user which file contains the figure (if not specified).
   - _Example_: "Which file should I read from?"

2. **Identify Snippet Name**
   - Ask the user what to name the snippet.
   - _Example_: "What should we call this snippet?"

3. **Execute Extraction**
   - Run the extraction script:

   ```bash
   python "/home/spyros/Μαθηματικά/Φροντιστήριο ΦΙΛΟΜΑΘΕΙΑ/Latex agents/TexBot/skills/latex-fundamentals/scripts/save_snippet.py" [SOURCE_FILE] [SNIPPET_NAME]
   ```

4. **Verify**
   - check if the file was created in `my_snippets/`.

---

**Usage Example:**

> User: /save-snippet
> AI: Which file?
> User: geometry.tex
> AI: Name?
> User: triangle_abc
> AI: (Runs script and saves to my_snippets/triangle_abc.tex)
