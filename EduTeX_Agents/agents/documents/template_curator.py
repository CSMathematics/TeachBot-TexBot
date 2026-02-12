import sys
import os

class TemplateCurator:
    """
    Role: The "Template Library"
    Responsibility: Provide LaTeX templates.
    """
    def __init__(self):
        self.role = "Template Library"

    def get_template(self, name="exam"):
        """
        Returns a LaTeX template string.
        """
        print(f"Agent {self.role}: retrieving template '{name}'...")
        if name == "exam":
            return "\\documentclass{article}\n..."
        return ""

if __name__ == "__main__":
    curator = TemplateCurator()
    print(curator.get_template("exam"))
