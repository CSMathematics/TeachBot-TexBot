import sys
import os

# Ensure current directory is in path
sys.path.append(os.path.dirname(__file__))

# Import agents (assuming running from EduTeX_Agents root)
try:
    from agents.education.mindmap_generator import MindmapGenerator
    from agents.education.exam_creator import ExamCreator
    from agents.documents.document_builder import DocumentBuilder
    from agents.documents.beamer_creator import BeamerCreator
    from agents.documents.tikz_expert import TikZExpert
    from agents.documents.fix_agent import FixAgent
except ImportError as e:
    print(f"Import Error: {e}")
    # Try adding project root explicitly if running from outside
    sys.path.append(os.path.abspath("c:/EduTeX/EduTeX_Agents"))
    from agents.education.mindmap_generator import MindmapGenerator
    from agents.education.exam_creator import ExamCreator
    from agents.documents.document_builder import DocumentBuilder
    from agents.documents.beamer_creator import BeamerCreator
    from agents.documents.tikz_expert import TikZExpert
    from agents.documents.fix_agent import FixAgent

def test_agents():
    print("--- Verifying Agent Instantiation (Phase 4) ---")
    try:
        mm = MindmapGenerator()
        print(f"MindmapGenerator: OK (LLM: {mm.llm.provider if hasattr(mm, 'llm') else 'N/A'})")
        
        ec = ExamCreator()
        print(f"ExamCreator: OK")
        
        db = DocumentBuilder()
        print(f"DocumentBuilder: OK (LLM: {db.llm.provider if db.llm else 'None'})")
        
        bc = BeamerCreator()
        print(f"BeamerCreator: OK (LLM: {bc.llm.provider if bc.llm else 'None'})")
        
        te = TikZExpert()
        print(f"TikZExpert: OK (LLM: {te.llm.provider if te.llm else 'None'})")
        
        fa = FixAgent()
        print(f"FixAgent: OK (LLM: {fa.llm.provider if fa.llm else 'None'})")
        
        print("\nAll agents instantiated successfully.")
        
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    test_agents()
