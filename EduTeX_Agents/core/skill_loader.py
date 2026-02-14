import os
import sys

# Ensure project root is in path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))

def load_skill(skill_name: str) -> str:
    """
    Loads the markdown content of a skill specification (SKILL.md).
    
    Args:
        skill_name (str): The name of the skill folder (e.g., 'latex-core').
        
    Returns:
        str: The content of the SKILL.md file.
    """
    file_path = os.path.join(PROJECT_ROOT, "skills", skill_name, "SKILL.md")
    
    if not os.path.exists(file_path):
        print(f"Warning: Skill file not found at {file_path}")
        return ""
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            return content
    except Exception as e:
        print(f"Error reading skill file {file_path}: {e}")
        return ""
