import sys
import os

# Add project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
sys.path.append(PROJECT_ROOT)

try:
    from agents.documents.document_builder import DocumentBuilder
    from agents.documents.tikz_expert import TikZExpert
    from agents.documents.table_formatter import TableFormatter
    from agents.documents.beamer_creator import BeamerCreator
    from agents.documents.bibliography_manager import BibliographyManager
    from agents.documents.template_curator import TemplateCurator
    from agents.documents.fix_agent import FixAgent
except ImportError as e:
    print(f"Error importing agents: {e}")
    sys.exit(1)

def run_test():
    print("Starting Phase 4 Full Integration Test...\n")
    
    # 1. Table
    print("--- 1. Table Formatter ---")
    data = [["Col 1", "Col 2"], ["A", "B"], ["C", "D"]]
    print(TableFormatter().generate_table(data, "Test Table")[:50] + "...")
    
    # 2. Beamer
    print("\n--- 2. Beamer Creator ---")
    slides = [{"title": "Intro", "content": "\\item Hi"}]
    print(BeamerCreator().create_presentation(slides, "My Slides")[:50] + "...")

    # 3. Bib
    print("\n--- 3. Bibliography ---")
    print(BibliographyManager().format_citation("euclid"))

    # 4. Template
    print("\n--- 4. Template Curator ---")
    print(TemplateCurator().get_template("exam")[:20] + "...")

    # 5. Fix Agent
    print("\n--- 5. Fix Agent ---")
    print(FixAgent().fix_document("missing_file.tex"))
    
    print("\nPhase 4 Full Test Complete!")

if __name__ == "__main__":
    run_test()
