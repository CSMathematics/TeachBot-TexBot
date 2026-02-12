import sys
import os
import json

# Add project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
sys.path.append(PROJECT_ROOT)

try:
    from agents.education.exam_creator import ExamCreator
    from agents.education.panhellenic_formatter import PanhellenicFormatter
except ImportError as e:
    print(f"Error importing agents: {e}")
    sys.exit(1)

def run_test():
    print("Starting Phase 2 Integration Test...\n")
    
    # 1. Create Exam
    print("--- Step 1: Creating Exam (Quadratic, 3 questions) ---")
    creator = ExamCreator()
    exam = creator.create_exam("Quadratic Equations", num_questions=2, difficulty="medium")
    
    print(f"Exam Metadata: {exam['metadata']}")
    print(f"Calibration: {exam['calibration']}\n")
    
    # 2. Format Exam
    print("--- Step 2: Formatting as Panhellenic ---")
    formatter = PanhellenicFormatter()
    final_latex = formatter.format_exam(exam)
    
    print("Final LaTeX (Preview):")
    print(final_latex[:300] + "...\n")
    
    if "PANHELLENIC EXAMS" in final_latex and "ΘΕΜΑ A" in final_latex:
        print("Phase 2 Test Complete!")
    else:
        print("Phase 2 Test Failed: Formatting mismatch.")

if __name__ == "__main__":
    run_test()
