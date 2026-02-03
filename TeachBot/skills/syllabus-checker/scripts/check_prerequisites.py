import sys
import os
import re

def check_prerequisites(target_class, target_chapter):
    """
    Simulates checking if a chapter has been taught based on syllabus files.
    In a real implementation, this would parse markdown files in the syllabus directory.
    """
    syllabus_dir = os.path.join(os.path.dirname(__file__), '../../syllabus')
    class_file = os.path.join(syllabus_dir, f"{target_class}.md")
    
    if not os.path.exists(class_file):
        print(f"❌ Error: Syllabus file for {target_class} not found at {class_file}")
        return False

    print(f"🔍 Checking prerequisites for {target_chapter} in {target_class}...")
    
    # Simple logic: Read file and check if chapter exists
    try:
        with open(class_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if target_chapter in content:
            print(f"✅ Chapter '{target_chapter}' found in syllabus.")
            # Here we could add logic to see what comes *before* this chapter
            return True
        else:
            print(f"⚠️ Warning: Chapter '{target_chapter}' not explicitly found in syllabus.")
            return False
            
    except Exception as e:
        print(f"❌ Error reading syllabus: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python check_prerequisites.py [Class] [Chapter]")
        # Example for testing
        print("\nRunning test check for 'Γεωμετρία_Α_Λυκείου' and 'Εμβαδά'...")
        check_prerequisites("Γεωμετρία_Α_Λυκείου", "Εμβαδά")
    else:
        check_prerequisites(sys.argv[1], sys.argv[2])
