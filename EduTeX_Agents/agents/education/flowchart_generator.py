import sys
import os

# Add project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from core.llm import LLMService


class FlowchartGenerator:
    """
    Role: The "Solution Flow Mapper"
    Responsibility: Create step-by-step solution flowcharts for exercise methods.
    """
    def __init__(self):
        self.role = "Solution Flow Mapper"
        try:
             self.llm = LLMService()
        except ImportError:
             self.llm = None

    def _load_agent_definition(self) -> str:
        """
        Loads the agent definition from flowchart-generator.md in the same directory.
        """
        try:
            current_dir = os.path.dirname(__file__)
            file_path = os.path.join(current_dir, "flowchart-generator.md")
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                print(f"Warning: Agent definition not found at {file_path}")
                return ""
        except Exception as e:
            print(f"Error loading agent definition: {e}")
            return ""

    def generate_flowchart(self, topic, method=None):
        """
        Returns a Mermaid flowchart definition for a solution method.
        """
        method_str = f" using the method: {method}" if method else ""
        print(f"Agent {self.role}: creating flowchart for '{topic}'{method_str}...")

        if self.llm:
            try:
                from core.workflow_loader import load_workflow
                from core.skill_loader import load_skill
                workflow_spec = load_workflow("flowchart")
                latex_skill = load_skill("latex_core")
            except ImportError:
                workflow_spec = "Generate a Mermaid flowchart for solving exercises."
                latex_skill = "Use standard LaTeX constraints."
            
            agent_definition = self._load_agent_definition()
            
            system_prompt = f"""You are an expert educator creating a step-by-step solution flowchart.
            
            === AGENT DEFINITION & RULES ===
            {agent_definition}
            === END AGENT DEFINITION ===

            === LATEX SKILLS & CONVENTIONS ===
            {latex_skill}
            === END SKILLS ===

            Use the following workflow specification:
            
            === WORKFLOW SPECIFICATION ===
            {workflow_spec}
            === END SPECIFICATION ===

            Output MUST be a JSON object with the following structure:
            {{
                "title": "Solution Method: <topic>",
                "nodes": [
                    {{"id": "A", "type": "start", "label": "Start: Read Problem"}},
                    {{"id": "B", "type": "decision", "label": "Identify Type"}},
                    {{"id": "C", "type": "process", "label": "Apply Method 1"}},
                    {{"id": "D", "type": "end", "label": "Verify Solution"}}
                ],
                "edges": [
                    {{"id": "e1", "source": "A", "target": "B"}},
                    {{"id": "e2", "source": "B", "target": "C", "label": "Type 1"}},
                    {{"id": "e3", "source": "C", "target": "D"}}
                ],
                "steps": [
                    {{"id": "A", "label": "Read Problem", "description": "Identify key information from $f(x)$"}},
                    {{"id": "B", "label": "Identify Type", "description": "Determine which method to use"}}
                ]
            }}
            
            CRITICAL RULES FOR JSON STRUCTURE:
            - "nodes": Array of objects with "id", "type" (start, process, decision, end), and "label".
            - "edges": Array of objects with "id", "source", "target", and optional "label".
            - "steps": Array to describe the process in detail (same as before).
            - NO Mermaid string.
            - Keep node labels concise and PLAIN TEXT (no LaTeX).
            - Use LaTeX ($...$) ONLY in "steps" descriptions.
            """
            
            user_prompt = f"Create a solution flowchart for the topic: {topic}{method_str}"
            
            try:
                import json as _json
                import re
                response = self.llm.generate_json(user_prompt, system_instruction=system_prompt)

                # Handle case where response is a string OR a failed JSON dict with raw_text
                raw_content = None
                if isinstance(response, str):
                    raw_content = response
                elif isinstance(response, dict) and "raw_text" in response:
                    raw_content = response["raw_text"]

                if raw_content:
                    # Strip markdown code blocks
                    clean = re.sub(r'```json\s*', '', raw_content, flags=re.IGNORECASE)
                    clean = re.sub(r'```\s*', '', clean).strip()
                    # Find JSON object boundaries
                    s, e = clean.find("{"), clean.rfind("}") + 1
                    if s != -1 and e > 0:
                        clean = clean[s:e]
                    # Sanitize LaTeX backslashes (inline, no external dependency)
                    valid_esc = set('"\\\/bfnrtu')
                    buf = []
                    idx = 0
                    while idx < len(clean):
                        c = clean[idx]
                        if c == '\\' and idx + 1 < len(clean):
                            nc = clean[idx + 1]
                            if nc in valid_esc:
                                buf.append(c)
                                buf.append(nc)
                            else:
                                buf.append('\\')
                                buf.append('\\')
                                buf.append(nc)
                            idx += 2
                        else:
                            buf.append(c)
                            idx += 1
                    sanitized = ''.join(buf)
                    try:
                        response = _json.loads(sanitized)
                        print("DEBUG [FlowchartGenerator] Manual parse with sanitization successful!")
                    except _json.JSONDecodeError as parse_err:
                        print(f"DEBUG [FlowchartGenerator] Parse failed even after sanitization: {parse_err}")

                # Validate response structure
                is_valid = isinstance(response, dict) and "nodes" in response and "edges" in response and "mock_response" not in response
                
                if not is_valid:
                    print(f"Agent {self.role}: Invalid/Mock LLM response detected. Using robust fallback.")
                    # Pass through to fallback code below
                else:
                    return response
            except Exception as e:
                print(f"Error generating flowchart: {e}")

        # Fallback (Mock structure)
        if "παράγωγ" in topic.lower() or "derivative" in topic.lower():
             return {
                "title": "Μέθοδος Παραγώγισης (Mock)",
                "nodes": [
                    {"id": "A", "type": "start", "label": "Διάβασε τη συνάρτηση f(x)"},
                    {"id": "B", "type": "decision", "label": "Τύπος συνάρτησης;"},
                    {"id": "C", "type": "process", "label": "Πολυωνυμική: (xⁿ)' = nxⁿ⁻¹"},
                    {"id": "D", "type": "process", "label": "Κανόνας Αλυσίδας"},
                    {"id": "E", "type": "process", "label": "Κανόνας Γινομένου"},
                    {"id": "F", "type": "process", "label": "Κανόνας Πηλίκου"},
                    {"id": "G", "type": "end", "label": "Απλοποίηση & Έλεγχος"}
                ],
                "edges": [
                    {"id": "e1", "source": "A", "target": "B"},
                    {"id": "e2", "source": "B", "target": "C", "label": "Πολυωνυμική"},
                    {"id": "e3", "source": "B", "target": "D", "label": "Σύνθεση"},
                    {"id": "e4", "source": "B", "target": "E", "label": "Γινόμενο"},
                    {"id": "e5", "source": "B", "target": "F", "label": "Πηλίκο"},
                    {"id": "e6", "source": "C", "target": "G"},
                    {"id": "e7", "source": "D", "target": "G"},
                    {"id": "e8", "source": "E", "target": "G"},
                    {"id": "e9", "source": "F", "target": "G"}
                ],
                "steps": [
                    {"id": "A", "label": "Διάβασε τη συνάρτηση", "description": "Αναγνώρισε τη $f(x)$"},
                    {"id": "B", "label": "Αναγνώρισε τύπο", "description": "Πολυωνυμική, σύνθεση, γινόμενο ή πηλίκο;"}
                ]
            }
        
        # Fallback 2: Tangent Line
        if "εφαπτομέν" in topic.lower() or "tangent" in topic.lower():
            return {
                "title": "Εξίσωση Εφαπτομένης",
                "nodes": [
                    {"id": "A", "type": "start", "label": "Δεδομένα: f(x), x₀"},
                    {"id": "B", "type": "process", "label": "y₀ = f(x₀)"},
                    {"id": "C", "type": "process", "label": "f'(x)"},
                    {"id": "D", "type": "process", "label": "λ = f'(x₀)"},
                    {"id": "E", "type": "process", "label": "Τύπος: y - y₀ = λ(x - x₀)"},
                    {"id": "F", "type": "end", "label": "Τελική Μορφή: y = λx + β"}
                ],
                "edges": [
                    {"id": "e1", "source": "A", "target": "B"},
                    {"id": "e2", "source": "B", "target": "C"},
                    {"id": "e3", "source": "C", "target": "D"},
                    {"id": "e4", "source": "D", "target": "E"},
                    {"id": "e5", "source": "E", "target": "F"}
                ],
                "steps": []
            }

        # Fallback 3: Quadratic
        if "εξίσωση" in topic.lower() or "equation" in topic.lower():
            return {
                "title": "Επίλυση Εξίσωσης 2ου Βαθμού",
                "nodes": [
                    {"id": "A", "type": "start", "label": "αx² + βx + γ = 0"},
                    {"id": "B", "type": "decision", "label": "α ≠ 0?"},
                    {"id": "C", "type": "process", "label": "1ου βαθμού: βx + γ = 0"},
                    {"id": "D", "type": "process", "label": "Δ = β² - 4αγ"},
                    {"id": "E", "type": "decision", "label": "Έλεγχος Δ"},
                    {"id": "F", "type": "process", "label": "2 ρίζες"},
                    {"id": "G", "type": "process", "label": "1 διπλή"},
                    {"id": "H", "type": "process", "label": "Αδύνατη"},
                    {"id": "I", "type": "end", "label": "Τέλος"}
                ],
                "edges": [
                    {"id": "e1", "source": "A", "target": "B"},
                    {"id": "e2", "source": "B", "target": "C", "label": "Όχι"},
                    {"id": "e3", "source": "B", "target": "D", "label": "Ναι"},
                    {"id": "e4", "source": "D", "target": "E"},
                    {"id": "e5", "source": "E", "target": "F", "label": "Δ > 0"},
                    {"id": "e6", "source": "E", "target": "G", "label": "Δ = 0"},
                    {"id": "e7", "source": "E", "target": "H", "label": "Δ < 0"},
                    {"id": "e8", "source": "F", "target": "I"},
                    {"id": "e9", "source": "G", "target": "I"},
                    {"id": "e10", "source": "H", "target": "I"},
                    {"id": "e11", "source": "C", "target": "I"}
                ],
                "steps": []
            }
            
        return {
            "title": f"Flowchart: {topic}",
            "nodes": [
                {"id": "A", "type": "start", "label": "Start"},
                {"id": "B", "type": "end", "label": "End"}
            ],
            "edges": [
                {"id": "e1", "source": "A", "target": "B"}
            ],
            "steps": []
        }


if __name__ == "__main__":
    gen = FlowchartGenerator()
    print(gen.generate_flowchart("Derivatives"))
