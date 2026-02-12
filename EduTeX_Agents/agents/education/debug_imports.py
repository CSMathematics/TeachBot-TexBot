
import sys
import os

print("--- Debugging Imports ---")
current_dir = os.path.dirname(os.path.abspath(__file__))
print(f"Current Dir: {current_dir}")

# Simulate main script logic
PROJECT_ROOT = os.path.abspath(os.path.join(current_dir, '../../'))
print(f"Project Root: {PROJECT_ROOT}")

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

print("Sys Path:", sys.path)

try:
    from core.template_registry import TemplateRegistry
    print("SUCCESS: TemplateRegistry imported.")
    reg = TemplateRegistry()
    print("Preamble Preview:")
    print(reg.get_preamble()[:50])
except ImportError as e:
    print(f"FAILURE: Could not import TemplateRegistry. Error: {e}")
except Exception as e:
    print(f"FAILURE: Other error. Error: {e}")
