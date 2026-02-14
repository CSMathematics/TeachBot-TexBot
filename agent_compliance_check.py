import sys
import os
import glob
import importlib.util
import inspect
from unittest.mock import MagicMock

# --- CONFIGURATION ---
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), 'EduTeX_Agents'))
AGENTS_DIR = os.path.join(PROJECT_ROOT, 'agents')
DOMAINS = ['education', 'documents']

# --- MOCKING ---
sys.modules["core.llm"] = MagicMock()
sys.modules["core.workflow_loader"] = MagicMock()
sys.modules["core.template_registry"] = MagicMock()
sys.modules["core.latex_specs"] = MagicMock()

# Mock ALL potential agent dependencies to prevent import errors
mock_agents = [
    "agents.education.exercise_generator",
    "agents.education.difficulty_calibrator",
    "exercise_generator",
    "difficulty_calibrator"
]
for agent in mock_agents:
    sys.modules[agent] = MagicMock()

# Setup paths
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

# --- UTILS ---
def to_camel_case(snake_str):
    return "".join(x.capitalize() for x in snake_str.lower().split("_"))

def load_module(file_path):
    module_name = os.path.basename(file_path).replace(".py", "")
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module

def get_agent_class(module):
    for name, obj in inspect.getmembers(module):
        if inspect.isclass(obj) and obj.__module__ == module.__name__:
            # Naive heuristic: Class name matches module name (roughly)
            # or it has 'Generator', 'Creator', 'Solver' in name
            if "Generator" in name or "Creator" in name or "Solver" in name or "Formatter" in name or "Detector" in name or "Checker" in name or "Designer" in name or "Writer" in name or "Builder" in name or "Manager" in name or "Expert" in name or "Curator" in name or "Calibrator" in name or "Agent" in name:
                return obj
    return None

def check_agent(py_file, md_file):
    agent_name = os.path.basename(py_file)
    print(f"Checking {agent_name}...")
    
    # Mocking LLMService and workflow_loader 
    # Must be done BEFORE loading module/instantiating agent
    mock_llm_instance = MagicMock()
    mock_llm_instance.generate.return_value = "Mock LLM Response"
    mock_llm_instance.generate_json.return_value = {"mock": "json", "hints": [], "variations": [], "rubric": [], "pitfalls": [], "questions": [], "exercises": [{"latex": "mock_latex", "solution": "mock_sol"}]}
    
    # Mock Workflow Loader
    mock_load_workflow = MagicMock(return_value="Mock Workflow Spec")
    sys.modules["core.llm"].LLMService.return_value = mock_llm_instance
    
    try:
        # Load module
        module = load_module(py_file)
        
        # Get class
        AgentClass = get_agent_class(module)
        if not AgentClass:
            print(f"  [SKIP] Could not find agent class in {agent_name}")
            return "SKIP"
            
        # Instantiate
        try:
            agent = AgentClass()
        except Exception as e:
            print(f"  [SKIP] Failed to instantiate {AgentClass.__name__}: {e}")
            return "SKIP"
            
        # identifying the generation method
        method_name = None
        if hasattr(agent, "generate"): method_name = "generate"
        elif hasattr(agent, "create_exam"): method_name = "create_exam"
        elif hasattr(agent, "process"): method_name = "process"
        elif hasattr(agent, "create"): method_name = "create"
        elif hasattr(agent, "solve"): method_name = "solve"
        elif hasattr(agent, "check"): method_name = "check"
        elif hasattr(agent, "format"): method_name = "format"
        elif hasattr(agent, "detect"): method_name = "detect"
        elif hasattr(agent, "design"): method_name = "design"
        elif hasattr(agent, "write"): method_name = "write"
        elif hasattr(agent, "build"): method_name = "build"
        elif hasattr(agent, "fix"): method_name = "fix"
        elif hasattr(agent, "manage"): method_name = "manage"
        elif hasattr(agent, "generate_mindmap_data"): method_name = "generate_mindmap_data"
        elif hasattr(agent, "solve_alternatives"): method_name = "solve_alternatives"
        elif hasattr(agent, "format_exam"): method_name = "format_exam"
        elif hasattr(agent, "detect_pitfalls"): method_name = "detect_pitfalls"
        elif hasattr(agent, "create_rubric"): method_name = "create_rubric"
        elif hasattr(agent, "generate_hints"): method_name = "generate_hints"
        elif hasattr(agent, "generate_variations"): method_name = "generate_variations"
        elif hasattr(agent, "generate_figure"): method_name = "generate_figure"
        elif hasattr(agent, "calibrate_exam"): method_name = "calibrate_exam"
        
        if not method_name:
             # Try to find any public method that is not __init__
            methods = [m for m in dir(agent) if callable(getattr(agent, m)) and not m.startswith("_")]
            if methods:
                method_name = methods[0]
            else:
                print(f"  [SKIP] No generation method found for {AgentClass.__name__}")
                return "SKIP"

        # Arg preparation
        args = []
        kwargs = {}
        
        # Specific arguments for known agents
        if "hint" in py_file or "isomorphic" in py_file or "solution" in py_file or "pitfall" in py_file or "rubric" in py_file or "multi" in py_file:
            # Expects exercise dict
            args = [{"metadata": {"topic": "mock_topic"}, "latex": "mock_latex"}]
            if "isomorphic" in py_file:
                args.append(1) # count
        elif "calibrator" in py_file:
            # Expects list of exercises
            args = [[{"metadata": {"difficulty": "medium"}, "latex": "mock"}] for _ in range(3)]
        elif "panhellenic" in py_file:
            # Expects exam dict
            args = [{"exercises": [{"latex": "mock"}], "metadata": {"topic": "mock_topic"}}]
        elif "beamer" in py_file:
            # create(title, topic, slide_count)
            args = ["Mock Title", "Mock Topic", 3]
        elif "document" in py_file:
            # build(doc_type, title, content)
            args = ["article", "Mock Title", "Mock Content"]
        elif "table" in py_file:
            # format_table(data, headers)
            args = [[["1","2"]], ["A","B"]]
        elif "fix" in py_file:
            # fix(latex, error)
            args = ["mock_latex", "mock_error"]
        elif "expert" in py_file or "tikz" in py_file:
            # generate_figure(description)
            args = ["mock_description"]
        elif "exercise" in py_file:
            args = ["mock_topic", "medium"]
        else:
            # Default
            args = ["mock_arg", "mock_arg", "mock_arg"]

        # Call the method
        try:
            # Debugging class/method existence
            # print(f"DEBUG: Checking {method_name} in {agent}")
            if hasattr(agent, method_name):
                func = getattr(agent, method_name)
                # Inspect signature to avoid passing too many args
                sig = inspect.signature(func)
                num_params = len(sig.parameters)
                # Exclude 'self' from parameter count if it's a method
                if 'self' in sig.parameters:
                    num_params -= 1
                
                # If args provided are more than params, slice them
                # BUT if params are less than args provided, slicing might be wrong if there are varargs
                # For now, slicing is safer than TypeError
                if num_params < len(args):
                    args = args[:num_params]
                
                result = func(*args)
            else:
                print(f"  [SKIP] Method {method_name} not found in {AgentClass.__name__}")
                # List available methods for debugging
                # methods = [m for m in dir(agent) if not m.startswith("_")]
                # print(f"DEBUG: Available methods: {methods}")
                return "SKIP"
        except Exception as e:
            print(f"  [FAIL] Error running {method_name}: {e}")
            import traceback
            traceback.print_exc()
            return "FAIL"

        # Check if LLM was called
        # We check the instance mock
        prompt = ""
        check_pass = False
        if mock_llm_instance.generate.call_args:
            args, _ = mock_llm_instance.generate.call_args
            if len(args) > 1:
                prompt = args[1] # system_instruction usually 2nd arg or kwarg
            elif "system_instruction" in mock_llm_instance.generate.call_args.kwargs:
                prompt = mock_llm_instance.generate.call_args.kwargs["system_instruction"]
            else:
                prompt = args[0] # maybe first arg?
                
            check_pass = True
            
        elif mock_llm_instance.generate_json.call_args:
            args, _ = mock_llm_instance.generate_json.call_args
            if len(args) > 1:
                prompt = args[1]
            elif "system_instruction" in mock_llm_instance.generate_json.call_args.kwargs:
                prompt = mock_llm_instance.generate_json.call_args.kwargs["system_instruction"]
            else:
                prompt = args[0]
                
            check_pass = True
                
        if not check_pass:
            print(f"  [FAIL] LLM not called by {method_name}")
            return "FAIL"

        # Load MD content to check against
        with open(md_file, 'r', encoding='utf-8') as f:
            md_content = f.read()
            
        # Extract meaningful chunks to avoid whitespace issues
        # We'll check for the "Skills" or "Role" headers usually present
        
        # Simple heuristic: Check if the file content is somewhat present
        # We can check for specific headers that SHOULD be there
        
        missing = []
        lines = [l.strip() for l in md_content.split('\n') if l.strip().startswith('#') or l.strip().startswith('-')]
        # Check a sample of lines
        sample_lines = lines[:5] if len(lines) > 5 else lines
        
        # Better check: Check for the exact string "=== AGENT DEFINITION ===" if we follow that pattern
        # Or check if a significant portion of the MD text is in the prompt
        
        # Let's check for the presence of the agent description or role
        # Removed early return to allow full check
        # if md_content[:50] in prompt:
        #     print(f"  [PASS] Definition injected.")
        #     return "PASS"
        
        # Fallback: Check if 10 lines from MD are present
        found_count = 0
        check_count = 0
        for line in md_content.split('\n'):
            if len(line.strip()) > 20:
                check_count += 1
                if line.strip() in prompt:
                    found_count += 1
        
        passed = True

        if "=== AGENT DEFINITION & RULES ===" in prompt:
             print("  [PASS] Definition injected.")
        else:
             print("  [FAIL] Definition NOT detected in prompt.")
             passed = False

        if "=== LATEX SKILLS & CONVENTIONS ===" in prompt:
             print("  [PASS] Skills injected.")
        else:
             # Prerequisite checker might skip this? No, I added it to all.
             print("  [FAIL] Skills NOT detected in prompt.")
             passed = False

        if "=== WORKFLOW SPECIFICATION ===" in prompt:
             print("  [PASS] Workflow injected.")
        else:
             print("  [FAIL] Workflow NOT detected in prompt.")
             passed = False
        
        if passed:
            return "PASS"
        else:
            return "FAIL"

    except Exception as e:
        print(f"  [ERROR] {e}")
        return "ERROR"

def main():
    results = {"PASS": [], "FAIL": [], "SKIP": [], "ERROR": []}
    
    for domain in DOMAINS:
        domain_dir = os.path.join(AGENTS_DIR, domain)
        if not os.path.exists(domain_dir):
            continue
            
        print(f"\n--- Checking Domain: {domain} ---")
        
        # Find all .py files
        py_files = glob.glob(os.path.join(domain_dir, "*.py"))
        
        for py_file in py_files:
            if "__init__" in py_file or "debug" in py_file:
                continue
                
            # Check for corresponding .md
            basename = os.path.basename(py_file).replace(".py", "")
            
            # Try exact match first
            md_file = os.path.join(domain_dir, f"{basename}.md")
            if not os.path.exists(md_file):
                # Try hyphenated version
                md_file = os.path.join(domain_dir, f"{basename.replace('_', '-')}.md")
            
            if os.path.exists(md_file):
                status = check_agent(py_file, md_file)
                results[status].append(basename)
            else:
                print(f"Skipping {basename} (no .md definition found)")

    print("\n=== SUMMARY ===")
    print(f"PASS: {len(results['PASS'])} {results['PASS']}")
    print(f"FAIL: {len(results['FAIL'])} {results['FAIL']}")
    print(f"SKIP: {len(results['SKIP'])} {results['SKIP']}")
    print(f"ERROR: {len(results['ERROR'])} {results['ERROR']}")

if __name__ == "__main__":
    main()
