import sys
import os

class TableFormatter:
    """
    Role: The "Table Wizard"
    Responsibility: Create complex LaTeX tables.
    """
    def __init__(self):
        self.role = "Table Wizard"

    def generate_table(self, data, caption="My Table"):
        """
        Generates a LaTeX table from a list of lists.
        """
        print(f"Agent {self.role}: generating table '{caption}'...")
        
        if not data: return "% No data for table"
        
        num_cols = len(data[0])
        col_def = "|" + "c|" * num_cols
        
        latex = "\\begin{table}[h]\n\\centering\n"
        latex += f"\\begin{{tabular}}{{{col_def}}}\n\\hline\n"
        
        for row in data:
            latex += " & ".join(str(x) for x in row) + " \\\\\n\\hline\n"
            
        latex += f"\\end{{tabular}}\n\\caption{{{caption}}}\n\\end{{table}}"
        
        return latex

    def format_table(self, data: list, headers: list, style: str = "booktabs") -> dict:
        """
        API Wrapper: Formats a table.
        """
        # Combine headers and data for the internal generator
        combined_data = []
        if headers:
            combined_data.append(headers)
        combined_data.extend(data)
        
        latex_code = self.generate_table(combined_data, caption="Generated Table")
        
        return {
            "latex": latex_code,
            "type": "table",
            "metadata": {"style": style, "rows": len(data)}
        }

if __name__ == "__main__":
    formatter = TableFormatter()
    data = [["Header 1", "Header 2"], ["Row 1", "Val 1"], ["Row 2", "Val 2"]]
    print(formatter.generate_table(data))
