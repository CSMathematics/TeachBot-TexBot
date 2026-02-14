import os
import sys

# Ensure project root is in path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))

def load_workflow(workflow_name: str, domain: str = "education") -> str:
    """
    Loads the markdown content of a workflow specification.
    
    Args:
        workflow_name (str): The name of the workflow (e.g., 'exam', 'worksheet').
        domain (str): The domain folder (default: 'education').
        
    Returns:
        str: The content of the workflow markdown file.
    """
    file_path = os.path.join(PROJECT_ROOT, "workflows", domain, f"{workflow_name}.md")
    
    if not os.path.exists(file_path):
        print(f"Warning: Workflow file not found at {file_path}")
        return ""
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            return content
    except Exception as e:
        print(f"Error reading workflow file {file_path}: {e}")
        return ""
