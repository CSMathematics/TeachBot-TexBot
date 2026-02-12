
import sys
import os

# Simulate main.py environment
# main.py is in api/, so project root is ../
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '../'))

print(f"Project Root: {PROJECT_ROOT}")
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

try:
    # Try importing ExamCreator which imports core.template_registry
    print("Attempting to import ExamCreator...")
    from agents.education.exam_creator import ExamCreator
    print("SUCCESS: ExamCreator imported.")
    
    agent = ExamCreator()
    if agent.template_registry:
        print("SUCCESS: TemplateRegistry is ACTIVE in ExamCreator.")
        print("Available commands:", list(agent.template_registry.get_available_commands().keys()))
    else:
        print("FAILURE: TemplateRegistry is NONE in ExamCreator.")

except ImportError as e:
    print(f"CRITICAL FAILURE: Import error. {e}")
except Exception as e:
    print(f"CRITICAL FAILURE: Other error. {e}")
