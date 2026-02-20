# Unused Files Report

Based on the analysis of the codebase, the following files appear to be unused and are candidates for deletion.

## 1. Root Level Scripts
These scripts seem to be for debugging or testing and are not referenced in the main application flow (`App.tsx`, `main.py`, `server/index.ts`).

- `test_models_user.py`
- `debug_llm_config.py`
- `debug_rest.py`
- `agent_compliance_check.py`

## 2. EduTeX_Agents Scripts
These files in `EduTeX_Agents` and its subdirectories appear to be test scripts or legacy files.

- `EduTeX_Agents/test_compile.py`
- `EduTeX_Agents/test_phase4.py`
- `EduTeX_Agents/test_imports.py`
- `EduTeX_Agents/compile.py` (Note: `main.py` uses `EduTeX_Agents/api/compile.py`. This one seems to be a duplicate or legacy).
- `EduTeX_Agents/agents/education/debug_imports.py`

### `EduTeX_Agents/scripts/`
The entire contents of this directory appear to be standalone test scripts:
- `test_phase1.py`
- `test_phase2.py`
- `test_phase3.py`
- `test_phase4.py`
- `test_phase4_full.py`
- `test_phase4_output.tex`
- `verify_template_fix.py`

## 3. Miscellaneous
- `EduTeX_Agents/api/api_test.html` (Likely a manual test file for API).

## Verification Recommended
Before deleting, please verify that you do not manually run these scripts for maintenance tasks. The automated analysis only checked for code references within the project.
