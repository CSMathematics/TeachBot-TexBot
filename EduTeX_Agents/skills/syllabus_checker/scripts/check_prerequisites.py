import sys
import os
import re

# Add project root to path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

def check_prerequisites(target_class, target_chapter):
    """
    Simulates checking if a chapter has been taught based on syllabus files.
    """
    # Use absolute path to syllabus directory
    syllabus_dir = os.path.join(PROJECT_ROOT, 'syllabus')
    
    print(f"Debug: PROJECT_ROOT = {PROJECT_ROOT}")
    print(f"Debug: expected syllabus dir = {syllabus_dir}")
    if os.path.exists(syllabus_dir):
        print(f"Debug: Contents of syllabus dir: {os.listdir(syllabus_dir)}")
    else:
        print(f"Debug: Syllabus dir does not exist!")

    # Try different extension or naming conventions if needed
    class_file = os.path.join(syllabus_dir, f"{target_class}.md")
    
    if not os.path.exists(class_file):
        print(f"Error: Syllabus file for {target_class} not found at {class_file}")
        return False

    print(f"Checking prerequisites for {target_chapter} in {target_class}...")
    
    try:
        with open(class_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Normalize strings for comparison (lowercase, remove accents maybe?)
        # For now, simple containment
        if target_chapter.lower() in content.lower():
            print(f"Chapter '{target_chapter}' found in syllabus.")
            return True
        else:
            print(f"Warning: Chapter '{target_chapter}' not explicitly found in syllabus.")
            return False
            
    except Exception as e:
        print(f"Error reading syllabus: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python check_prerequisites.py [Class] [Chapter]")
        # Example for testing
        print("\nRunning test check for 'Algebra_B_Lyceum' and 'Πολυώνυμα'...")
        check_prerequisites("Algebra_B_Lyceum", "Πολυώνυμα")
    else:
        check_prerequisites(sys.argv[1], sys.argv[2])
