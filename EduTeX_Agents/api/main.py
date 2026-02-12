import sys
import os
import uuid
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException  # type: ignore
from pydantic import BaseModel  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore

# Add project root to sys.path to allow imports from agents/skills
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

# ─── Import All Agents ───────────────────────────────────────────────

def safe_import(module_path, class_name):
    """Import with fallback for missing modules."""
    try:
        module = __import__(module_path, fromlist=[class_name])
        return getattr(module, class_name)
    except (ImportError, AttributeError) as e:
        print(f"Warning: Could not import {class_name} from {module_path}: {e}")
        return None

# Education Agents
ExamCreator = safe_import("agents.education.exam_creator", "ExamCreator")
ExerciseGenerator = safe_import("agents.education.exercise_generator", "ExerciseGenerator")
SolutionWriter = safe_import("agents.education.solution_writer", "SolutionWriter")
IsomorphicGenerator = safe_import("agents.education.isomorphic_generator", "IsomorphicGenerator")
DifficultyCalibrator = safe_import("agents.education.difficulty_calibrator", "DifficultyCalibrator")
HintGenerator = safe_import("agents.education.hint_generator", "HintGenerator")
PitfallDetector = safe_import("agents.education.pitfall_detector", "PitfallDetector")
RubricDesigner = safe_import("agents.education.rubric_designer", "RubricDesigner")
MindmapGenerator = safe_import("agents.education.mindmap_generator", "MindmapGenerator")
PrerequisiteChecker = safe_import("agents.education.prerequisite_checker", "PrerequisiteChecker")
MultiMethodSolver = safe_import("agents.education.multi_method_solver", "MultiMethodSolver")
PanhellenicFormatter = safe_import("agents.education.panhellenic_formatter", "PanhellenicFormatter")

# Document Agents
DocumentBuilder = safe_import("agents.documents.document_builder", "DocumentBuilder")
TikZExpert = safe_import("agents.documents.tikz_expert", "TikZExpert")
TableFormatter = safe_import("agents.documents.table_formatter", "TableFormatter")
BeamerCreator = safe_import("agents.documents.beamer_creator", "BeamerCreator")
BibliographyManager = safe_import("agents.documents.bibliography_manager", "BibliographyManager")
TemplateCurator = safe_import("agents.documents.template_curator", "TemplateCurator")
FixAgent = safe_import("agents.documents.fix_agent", "FixAgent")

# ─── FastAPI App ─────────────────────────────────────────────────────

app = FastAPI(title="EduTeX Agent API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Models ─────────────────────────────────────────────────

# Common
class AgentInfo(BaseModel):
    id: str
    name: str
    nameEl: str
    domain: str
    description: str
    endpoint: str
    status: str = "online"

# Exam
class GenerationRequest(BaseModel):
    topic: str
    gradeLevel: str
    difficulty: int  # 1-5
    questionCount: int
    includeSolutions: bool
    includeVariants: Optional[bool] = False
    includeRubric: Optional[bool] = False
    includeMultiMethod: Optional[bool] = False
    style: Optional[str] = "standard"
    templateStyle: Optional[str] = "scientific"
    mainColor: Optional[str] = "#1285cc"

class QuestionResponse(BaseModel):
    id: str
    content: str
    solution: str
    difficulty: str
    points: int
    type: str
    tags: List[str]

class ExamResponse(BaseModel):
    id: str
    title: str
    subject: str
    gradeLevel: str
    durationMinutes: int
    difficulty: int
    questions: List[QuestionResponse]
    createdAt: str
    calibration: Optional[Dict[str, Any]] = None
    rubric: Optional[List[Dict[str, Any]]] = None

# Exercise
class ExerciseRequest(BaseModel):
    topic: str
    difficulty: str = "medium"
    count: int = 3

class ExerciseResponse(BaseModel):
    exercises: List[Dict[str, Any]]
    count: int

# Solution
class SolutionRequest(BaseModel):
    exercise: Dict[str, Any]

class SolutionResponse(BaseModel):
    solution_latex: str

# Variants
class VariantRequest(BaseModel):
    exercise: Dict[str, Any]
    count: int = 2

class VariantResponse(BaseModel):
    variations: List[Dict[str, Any]]
    count: int

# Hints
class HintRequest(BaseModel):
    exercise: Dict[str, Any]

class HintResponse(BaseModel):
    hints: List[str]
    count: int

# Pitfalls
class PitfallRequest(BaseModel):
    exercise: Dict[str, Any]

class PitfallResponse(BaseModel):
    pitfalls: List[Dict[str, Any]]
    count: int

# Rubric
class RubricRequest(BaseModel):
    exercise: Dict[str, Any]

class RubricResponse(BaseModel):
    rubric: List[Dict[str, Any]]
    total_points: int

# Difficulty Calibration
class CalibrationRequest(BaseModel):
    exercises: List[Dict[str, Any]]
    target_difficulty: str = "medium"

class CalibrationResponse(BaseModel):
    total: int
    distribution: Dict[str, int]
    analysis: str

# Prerequisites
class PrerequisiteRequest(BaseModel):
    topic: str
    gradeLevel: Optional[str] = None

# Mindmap
class MindmapRequest(BaseModel):
    topic: str

# Multi-Method
class MultiMethodRequest(BaseModel):
    exercise: Dict[str, Any]

# Panhellenic
class PanhellenicRequest(BaseModel):
    topic: str
    year: Optional[int] = None

# Document
class DocumentRequest(BaseModel):
    type: str = "article"
    title: str
    content: Optional[str] = None
    language: Optional[str] = "el"

# Figure
class FigureRequest(BaseModel):
    description: str

# Table
class TableRequest(BaseModel):
    data: List[List[str]]
    headers: List[str]
    style: Optional[str] = "booktabs"

# Presentation
class PresentationRequest(BaseModel):
    title: str
    slideCount: int = 5
    topic: str
    theme: Optional[str] = None

# Fix
class FixRequest(BaseModel):
    latexCode: str
    errorMessage: Optional[str] = None

# Generic LaTeX response
class LaTeXResponse(BaseModel):
    latex: str
    type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


# ─── Helper ──────────────────────────────────────────────────────────

def require_agent(agent_class, name: str):
    """Raises 503 if agent is not available."""
    if agent_class is None:
        raise HTTPException(status_code=503, detail=f"{name} agent not available (Import Error)")


# ─── API Endpoints ───────────────────────────────────────────────────

@app.get("/")
def read_root():
    """Health check."""
    return {"status": "online", "system": "EduTeX Agents", "version": "2.0.0"}


@app.get("/api/agents", response_model=List[AgentInfo])
def list_agents():
    """Returns catalog of all available agents with status."""
    agents = [
        # Education
        AgentInfo(id="exercise-generator", name="Exercise Generator", nameEl="Γεννήτρια Ασκήσεων", domain="EDUCATION", description="Creates math exercises", endpoint="/api/generate-exercises", status="online" if ExerciseGenerator else "offline"),
        AgentInfo(id="exam-creator", name="Exam Creator", nameEl="Δημιουργός Διαγωνισμάτων", domain="EDUCATION", description="Assembles full exams", endpoint="/api/generate-exam", status="online" if ExamCreator else "offline"),
        AgentInfo(id="solution-writer", name="Solution Writer", nameEl="Συγγραφέας Λύσεων", domain="EDUCATION", description="Step-by-step solutions", endpoint="/api/generate-solutions", status="online" if SolutionWriter else "offline"),
        AgentInfo(id="isomorphic-generator", name="Variant Generator", nameEl="Γεννήτρια Παραλλαγών", domain="EDUCATION", description="Exercise variations", endpoint="/api/generate-variants", status="online" if IsomorphicGenerator else "offline"),
        AgentInfo(id="difficulty-calibrator", name="Difficulty Calibrator", nameEl="Βαθμονομητής Δυσκολίας", domain="EDUCATION", description="Calibrates difficulty", endpoint="/api/calibrate-difficulty", status="online" if DifficultyCalibrator else "offline"),
        AgentInfo(id="hint-generator", name="Hint Designer", nameEl="Σχεδιαστής Υποδείξεων", domain="EDUCATION", description="Progressive hints", endpoint="/api/generate-hints", status="online" if HintGenerator else "offline"),
        AgentInfo(id="pitfall-detector", name="Pitfall Detector", nameEl="Ανιχνευτής Παγίδων", domain="EDUCATION", description="Common student errors", endpoint="/api/detect-pitfalls", status="online" if PitfallDetector else "offline"),
        AgentInfo(id="rubric-designer", name="Rubric Designer", nameEl="Σχεδιαστής Κριτηρίων", domain="EDUCATION", description="Grading rubrics", endpoint="/api/generate-rubric", status="online" if RubricDesigner else "offline"),
        AgentInfo(id="mindmap-generator", name="Mindmap Generator", nameEl="Γεννήτρια Εννοιολογικών Χαρτών", domain="EDUCATION", description="Concept maps", endpoint="/api/generate-mindmap", status="online" if MindmapGenerator else "offline"),
        AgentInfo(id="prerequisite-checker", name="Prerequisite Checker", nameEl="Ελεγκτής Προαπαιτουμένων", domain="EDUCATION", description="Prerequisite validation", endpoint="/api/check-prerequisites", status="online" if PrerequisiteChecker else "offline"),
        AgentInfo(id="multi-method-solver", name="Multi-Method Solver", nameEl="Πολυμεθοδικός Λύτης", domain="EDUCATION", description="Multiple solving methods", endpoint="/api/multi-method-solve", status="online" if MultiMethodSolver else "offline"),
        AgentInfo(id="panhellenic-formatter", name="Panhellenic Formatter", nameEl="Μορφοποιητής Πανελληνίων", domain="EDUCATION", description="Panhellenic exam style", endpoint="/api/format-panhellenic", status="online" if PanhellenicFormatter else "offline"),
        # Documents
        AgentInfo(id="document-builder", name="Document Builder", nameEl="Δημιουργός Εγγράφων", domain="DOCUMENTS", description="Articles, reports, CVs", endpoint="/api/build-document", status="online" if DocumentBuilder else "offline"),
        AgentInfo(id="tikz-expert", name="TikZ Expert", nameEl="Ειδικός TikZ", domain="DOCUMENTS", description="TikZ/PGFPlots figures", endpoint="/api/generate-figure", status="online" if TikZExpert else "offline"),
        AgentInfo(id="table-formatter", name="Table Formatter", nameEl="Μορφοποιητής Πινάκων", domain="DOCUMENTS", description="LaTeX tables", endpoint="/api/format-table", status="online" if TableFormatter else "offline"),
        AgentInfo(id="beamer-creator", name="Beamer Creator", nameEl="Δημιουργός Παρουσιάσεων", domain="DOCUMENTS", description="Beamer slides", endpoint="/api/create-presentation", status="online" if BeamerCreator else "offline"),
        AgentInfo(id="bibliography-manager", name="Bibliography Manager", nameEl="Διαχειριστής Βιβλιογραφίας", domain="DOCUMENTS", description="BibTeX management", endpoint="/api/manage-bibliography", status="online" if BibliographyManager else "offline"),
        AgentInfo(id="template-curator", name="Template Curator", nameEl="Επιμελητής Προτύπων", domain="DOCUMENTS", description="LaTeX templates", endpoint="/api/manage-templates", status="online" if TemplateCurator else "offline"),
        AgentInfo(id="fix-agent", name="LaTeX Fix Agent", nameEl="Διορθωτής LaTeX", domain="DOCUMENTS", description="Fix LaTeX errors", endpoint="/api/fix-latex", status="online" if FixAgent else "offline"),
    ] # type: ignore
    return agents


# ── Education Endpoints ──────────────────────────────────────────────

@app.post("/api/generate-exam", response_model=ExamResponse)
async def generate_exam(request: GenerationRequest):
    """Multi-agent exam generation pipeline."""
    require_agent(ExamCreator, "ExamCreator")
    print(f"API: Exam request for '{request.topic}' ({request.questionCount} Qs)")

    creator = ExamCreator()
    diff_map = {1: "easy", 2: "easy", 3: "medium", 4: "hard", 5: "hard"}
    agent_difficulty = diff_map.get(request.difficulty, "medium")

    try:
        result = creator.create_exam(
            topic=request.topic,
            num_questions=request.questionCount,
            difficulty=agent_difficulty,
            template_style=request.templateStyle,
            maincolor=request.mainColor
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

    # Transform exercises to questions
    questions_out = []
    for ex in result.get("exercises", []):
        meta = ex.get("metadata", {})
        questions_out.append(QuestionResponse(
            id=str(uuid.uuid4()),
            content=ex.get("latex", ""),
            solution=ex.get("solution", ""),
            difficulty=meta.get("difficulty", "Medium").title(),
            points=meta.get("points", 10),
            type=meta.get("type", "Algebra").title(),
            tags=meta.get("tags", [request.topic])
        ))  # type: ignore

    # Optional: add rubric
    rubric_data = None
    if request.includeRubric and RubricDesigner:
        designer = RubricDesigner()
        for ex in result.get("exercises", []):
            r = designer.create_rubric(ex)
            rubric_data = r.get("rubric", [])

    return ExamResponse(
        id=str(uuid.uuid4()),
        title=f"Exam: {request.topic}",
        subject="Mathematics",
        gradeLevel=request.gradeLevel,
        durationMinutes=request.questionCount * 15,
        difficulty=request.difficulty * 20,
        questions=questions_out,
        createdAt=datetime.now().isoformat(),
        calibration=result.get("calibration"),
        rubric=rubric_data,
    )  # type: ignore


@app.post("/api/generate-exercises", response_model=ExerciseResponse)
async def generate_exercises(request: ExerciseRequest):
    """Generate standalone exercises."""
    require_agent(ExerciseGenerator, "ExerciseGenerator")
    generator = ExerciseGenerator()

    exercises = []
    for _ in range(request.count):
        ex = generator.generate(request.topic, request.difficulty)
        exercises.append(ex)

    return ExerciseResponse(exercises=exercises, count=len(exercises))  # type: ignore


@app.post("/api/generate-solutions", response_model=SolutionResponse)
async def generate_solutions(request: SolutionRequest):
    """Generate step-by-step solution."""
    require_agent(SolutionWriter, "SolutionWriter")
    writer = SolutionWriter()
    result = writer.solve(request.exercise)
    return SolutionResponse(solution_latex=result.get("solution_latex", ""))  # type: ignore


@app.post("/api/generate-variants", response_model=VariantResponse)
async def generate_variants(request: VariantRequest):
    """Generate isomorphic variations of an exercise."""
    require_agent(IsomorphicGenerator, "IsomorphicGenerator")
    iso = IsomorphicGenerator()
    variations = iso.generate_variations(request.exercise, request.count)
    return VariantResponse(variations=variations, count=len(variations))  # type: ignore


@app.post("/api/calibrate-difficulty", response_model=CalibrationResponse)
async def calibrate_difficulty(request: CalibrationRequest):
    """Calibrate exam difficulty distribution."""
    require_agent(DifficultyCalibrator, "DifficultyCalibrator")
    calibrator = DifficultyCalibrator()
    report = calibrator.calibrate_exam(request.exercises, request.target_difficulty)
    return CalibrationResponse(**report)  # type: ignore


@app.post("/api/generate-hints", response_model=HintResponse)
async def generate_hints(request: HintRequest):
    """Generate progressive hints."""
    require_agent(HintGenerator, "HintGenerator")
    gen = HintGenerator()
    result = gen.generate_hints(request.exercise)
    return HintResponse(**result)  # type: ignore


@app.post("/api/detect-pitfalls", response_model=PitfallResponse)
async def detect_pitfalls(request: PitfallRequest):
    """Detect common student mistakes."""
    require_agent(PitfallDetector, "PitfallDetector")
    detector = PitfallDetector()
    result = detector.detect_pitfalls(request.exercise)
    return PitfallResponse(**result)  # type: ignore


@app.post("/api/generate-rubric", response_model=RubricResponse)
async def generate_rubric(request: RubricRequest):
    """Generate grading rubric."""
    require_agent(RubricDesigner, "RubricDesigner")
    designer = RubricDesigner()
    result = designer.create_rubric(request.exercise)
    return RubricResponse(**result)  # type: ignore


@app.post("/api/generate-mindmap")
async def generate_mindmap(request: MindmapRequest):
    """Generate concept mindmap structure."""
    require_agent(MindmapGenerator, "MindmapGenerator")
    gen = MindmapGenerator()
    return gen.generate_mindmap_data(request.topic)


@app.post("/api/check-prerequisites")
async def check_prerequisites(request: PrerequisiteRequest):
    """Check topic prerequisites."""
    require_agent(PrerequisiteChecker, "PrerequisiteChecker")
    checker = PrerequisiteChecker()
    return checker.check(request.topic)


@app.post("/api/multi-method-solve")
async def multi_method_solve(request: MultiMethodRequest):
    """Solve exercise using multiple methods."""
    require_agent(MultiMethodSolver, "MultiMethodSolver")
    solver = MultiMethodSolver()
    return solver.solve(request.exercise)


@app.post("/api/format-panhellenic")
async def format_panhellenic(request: PanhellenicRequest):
    """Format in Panhellenic exam style."""
    require_agent(PanhellenicFormatter, "PanhellenicFormatter")
    formatter = PanhellenicFormatter()
    return formatter.format(request.topic)


# ── Document Endpoints ───────────────────────────────────────────────

@app.post("/api/build-document", response_model=LaTeXResponse)
async def build_document(request: DocumentRequest):
    """Build a LaTeX document."""
    require_agent(DocumentBuilder, "DocumentBuilder")
    builder = DocumentBuilder()
    result = builder.build(request.type, request.title, request.content or "")
    return LaTeXResponse(**result)  # type: ignore


@app.post("/api/generate-figure", response_model=LaTeXResponse)
async def generate_figure(request: FigureRequest):
    """Generate TikZ figure."""
    require_agent(TikZExpert, "TikZExpert")
    expert = TikZExpert()
    result = expert.generate_figure(request.description)
    return LaTeXResponse(**result)  # type: ignore


@app.post("/api/format-table", response_model=LaTeXResponse)
async def format_table(request: TableRequest):
    """Format a LaTeX table."""
    require_agent(TableFormatter, "TableFormatter")
    formatter = TableFormatter()
    result = formatter.format_table(request.data, request.headers, request.style or "booktabs")
    return LaTeXResponse(latex=result.get("latex", ""), metadata=result.get("metadata"))  # type: ignore


@app.post("/api/create-presentation", response_model=LaTeXResponse)
async def create_presentation(request: PresentationRequest):
    """Create Beamer presentation."""
    require_agent(BeamerCreator, "BeamerCreator")
    creator = BeamerCreator()
    result = creator.create(request.title, request.topic, request.slideCount)
    return LaTeXResponse(**result)  # type: ignore


@app.post("/api/fix-latex", response_model=LaTeXResponse)
async def fix_latex(request: FixRequest):
    """Fix LaTeX compilation errors."""
    require_agent(FixAgent, "FixAgent")
    fixer = FixAgent()
    result = fixer.fix(request.latexCode, request.errorMessage or "")
    return LaTeXResponse(**result)  # type: ignore


# ── Orchestrator (Auto-detect) ───────────────────────────────────────

class OrchestrateRequest(BaseModel):
    prompt: str
    options: Optional[Dict[str, Any]] = None

@app.post("/api/orchestrate")
async def orchestrate(request: OrchestrateRequest):
    """Auto-detect domain and route to appropriate agent."""
    prompt = request.prompt.lower()

    EDUCATION_KW = ["άσκηση", "φυλλάδιο", "διαγώνισμα", "τεστ", "λύση",
                     "πανελλήνιες", "παραλλαγή", "rubric", "βαθμολογία",
                     "θεωρία", "mindmap", "υπόδειξη", "hints", "λάθη",
                     "προαπαιτούμενα", "μέθοδοι", "exercise", "exam"]

    DOCUMENT_KW = ["έγγραφο", "article", "report", "σχήμα", "γράφημα",
                    "TikZ", "πίνακας", "table", "παρουσίαση", "slides",
                    "cv", "βιογραφικό", "επιστολή", "bibliography",
                    "template", "fix", "document"]

    domain = "unknown"
    if any(kw in prompt for kw in EDUCATION_KW):
        domain = "EDUCATION"
    elif any(kw in prompt for kw in DOCUMENT_KW):
        domain = "DOCUMENTS"

    return {
        "detected_domain": domain,
        "prompt": request.prompt,
        "available_agents": [a.id for a in list_agents() if a.domain == domain and a.status == "online"]
    }


if __name__ == "__main__":
    import uvicorn  # type: ignore
    uvicorn.run(app, host="0.0.0.0", port=8000)
