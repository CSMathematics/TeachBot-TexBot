---
description: Workflow for generating educational flowcharts for math problem solving.
---

# Flowchart Generation Workflow

1.  **Analyze Request**:
    - Identify the core mathematical topic (e.g., Derivatives, Integrals, Geometry).
    - Detect any specific method requested (e.g., "by parts", "substitution").
  
2.  **Determine Steps**:
    - Break down the solution process into logical, sequential steps.
    - Identify decision points (conditions) where the method branches.
    - Ensure steps are actionable (verbs).

3.  **Draft Mermaid Graph**:
    - Start with a clear entry point (Node A).
    - Use `graph TD` (Top-Down).
    - Nodes should be concise.
    - Edges should represent flow or decisions.
  
4.  **Refine Labels**:
    - Use LaTeX math mode ($...$) for formulas.
    - Keep text short and clear.
  
5.  **Construct JSON**:
    - Format output according to required schema.
    - Verify valid JSON structure.
