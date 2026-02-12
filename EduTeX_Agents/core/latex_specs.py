"""
LaTeX Specs - Package and command specifications that document agents
expose for use by education agents (dual-role integration).

Each spec dict tells the LLM what packages, commands, and environments
are available when generating exercises/exams.
"""

# ── TikZ / Figures ────────────────────────────────────────────────────
TIKZ_SPECS = {
    'packages': ['tikz', 'tkz-euclide', 'pgfplots'],
    'libraries': ['calc', 'positioning'],
    'usage_hint': (
        'Use \\begin{tikzpicture}...\\end{tikzpicture} for geometry. '
        'Use \\begin{axis}...\\end{axis} inside tikzpicture for function plots. '
        'Colors: maincolor, darkmaincolor1, darkmaincolor2.'
    ),
}

# ── Tables ────────────────────────────────────────────────────────────
TABLE_SPECS = {
    'packages': ['tabularray', 'tabularx', 'longtable', 'multirow', 'multicol'],
    'environments': {
        'mytblr': {
            'description': 'Styled table with maincolor header row, alternating row colors',
            'example': (
                '\\begin{mytblr}{colspec={X[c]X[c]X[c]}}\n'
                '  Header 1 & Header 2 & Header 3 \\\\\n'
                '  Data 1   & Data 2   & Data 3 \\\\\n'
                '\\end{mytblr}'
            ),
        },
        'tabularx': {
            'description': 'Standard elastic-width table',
        },
    },
}

# ── Math ──────────────────────────────────────────────────────────────
MATH_SPECS = {
    'packages': ['amsmath', 'mtpro2', 'diffcoeff', 'gensymb', 'mathimatika'],
    'usage_hint': (
        'Use \\diffp for partial derivatives, \\diff for ordinary derivatives. '
        'Use \\degree for degree symbol. '
        'Use standard amsmath environments (align, gather, cases).'
    ),
}

# ── Lists ─────────────────────────────────────────────────────────────
LIST_SPECS = {
    'packages': ['enumitem'],
    'environments': {
        'alist': 'a. b. c. labels',
        'balist': 'Bold a. b. c. labels',
        'Alist': 'A. B. C. labels',
        'bAlist': 'Bold A. B. C. labels',
        'rlist': 'Roman numerals in maincolor',
        'enumerate': 'Default bold numbered list in maincolor',
    },
}

# ── Boxes / Theorems ──────────────────────────────────────────────────
BOX_SPECS = {
    'packages': ['tcolorbox', 'mdframed'],
    'libraries': ['skins', 'theorems', 'breakable'],
    'usage_hint': (
        'Use tcolorbox for colored theorem/definition boxes. '
        'Boxes can be breakable across pages.'
    ),
}

# ── Venn Diagrams ─────────────────────────────────────────────────────
VENN_SPECS = {
    'packages': ['venndiagram'],
    'usage_hint': 'Use \\begin{venndiagram2sets} or \\begin{venndiagram3sets}.',
}

# ── Icons ─────────────────────────────────────────────────────────────
ICON_SPECS = {
    'packages': ['fontawesome5'],
    'usage_hint': (
        'Use \\faSquare, \\faCheckCircle, \\faExclamationTriangle etc. '
        'for decorative icons in exercises.'
    ),
}


def get_all_specs() -> dict:
    """Returns all LaTeX specs combined (for LLM system prompts)."""
    return {
        'tikz': TIKZ_SPECS,
        'tables': TABLE_SPECS,
        'math': MATH_SPECS,
        'lists': LIST_SPECS,
        'boxes': BOX_SPECS,
        'venn': VENN_SPECS,
        'icons': ICON_SPECS,
    }


def build_llm_context() -> str:
    """
    Builds a concise text block describing all available LaTeX features
    for inclusion in LLM system prompts.
    """
    specs = get_all_specs()
    lines = ['Available LaTeX packages and environments:']

    for category, spec in specs.items():
        pkgs = ', '.join(spec.get('packages', []))
        lines.append(f'\n[{category.upper()}] Packages: {pkgs}')

        if 'environments' in spec:
            envs = spec['environments']
            if isinstance(envs, dict):
                for name, desc in envs.items():
                    if isinstance(desc, dict):
                        lines.append(f'  - \\begin{{{name}}} : {desc.get("description", "")}')
                    else:
                        lines.append(f'  - \\begin{{{name}}} : {desc}')

        if 'usage_hint' in spec:
            lines.append(f'  Hint: {spec["usage_hint"]}')

    return '\n'.join(lines)
