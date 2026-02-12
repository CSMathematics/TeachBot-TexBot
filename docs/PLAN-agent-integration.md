# Ενσωμάτωση EduTeX Agents στο SaaS Website

Ολοκληρωμένη ενσωμάτωση των 19 Python agents (12 Education + 7 Documents) από τον φάκελο `EduTeX_Agents/` στο υπάρχον SaaS website (Vite + React), μαζί με τα features του `future_ideas.md`.

---

## Τρέχουσα Κατάσταση

### SaaS Website (Frontend)
- **Stack**: Vite + React + TypeScript + Tailwind CDN + KaTeX
- **Pages**: `Dashboard` (metrics, charts, coverage), `ExamGenerator` (4 hardcoded agents, sidebar config)
- **Services**: `geminiService.ts` — direct Gemini API call, returns JSON exam
- **Components**: `AgentCard`, `Sidebar`, `PdfPreview`, `LatexRenderer`, `ui.tsx`
- **Routing**: HashRouter with 5 routes (Dashboard, Create, Library, Curriculum, Settings — τελευταίες 3 placeholder)

### EduTeX_Agents (Backend)
- **19 Python Agents**: 12 Education (`ExamCreator`, `ExerciseGenerator`, `SolutionWriter`, `IsomorphicGenerator`, `DifficultyCalibrator`, `HintGenerator`, `PitfallDetector`, `MindmapGenerator`, `PrerequisiteChecker`, `MultiMethodSolver`, `PanhellenicFormatter`, `RubricDesigner`) + 7 Documents (`DocumentBuilder`, `TikZExpert`, `TableFormatter`, `BeamerCreator`, `BibliographyManager`, `TemplateCurator`, `FixAgent`)
- **API**: FastAPI (`main.py`) — μόνο 1 endpoint: `POST /api/generate-exam`
- **Orchestrator**: `orchestrator.md` — keyword-based domain detection, agent routing
- **7 Skills**: `latex-core`, `tikz-library`, `table-patterns`, `beamer-themes`, `clean-numbers`, `syllabus-checker`, `pedagogical-patterns`

### Vision (future_ideas.md)
- 10 agents (A-J), killer features (OCR, difficulty slider, one-exercise→full-exam, coverage heatmap)
- Teacher analytics, SaaS model (10€/μήνα), community marketplace

---

## User Review Required

> [!IMPORTANT]
> **Αρχιτεκτονική Απόφαση — Dual-Mode Frontend Service**
> Το frontend θα υποστηρίζει **δύο modes**: (1) **API Mode** — κλήσεις στο FastAPI backend (production), (2) **Gemini-Direct Mode** — απευθείας Gemini API (demo/fallback). Αυτό σημαίνει ότι θα κρατήσουμε τον υπάρχοντα `geminiService.ts` ως fallback, αλλά θα προσθέσουμε νέο `agentApiService.ts` για κλήσεις στο Python backend.

> [!IMPORTANT]
> **Scope Ερώτηση**: Θέλεις να ενσωματωθούν **ΟΛΟΙ οι 19 agents** ως ξεχωριστά UI flows, ή μόνο οι **core 4 (Exam, Exercise, Solution, Variant)** ως Phase 1, με τους υπόλοιπους σε Phase 2; Η πρότασή μου είναι Phase 1 = Core 4 Education agents + full Agent Hub page.

> [!WARNING]
> **Backend Dependency**: Το FastAPI backend (`EduTeX_Agents/api/main.py`) σήμερα έχει **μόνο 1 endpoint**. Χρειάζεται σημαντική επέκταση (14+ νέα endpoints) για να εξυπηρετεί όλους τους agents. Αυτό αυξάνει τον χρόνο implementation.

---

## Proposed Changes

### Component 1: Agent Registry & Type System

Κεντρικό μητρώο agents που χρησιμοποιείται τόσο από το frontend UI όσο και από τις API κλήσεις.

#### [MODIFY] [types.ts](file:///c:/EduTeX/types.ts)
- Προσθήκη `AgentDomain` enum (`EDUCATION`, `DOCUMENTS`)
- Προσθήκη `AgentCapability` interface (ανά agent: id, name, domain, description, icon, endpoint, inputSchema, outputSchema)
- Επέκταση `Agent` interface με `domain` πεδίο
- Νέα types: `WorksheetParams`, `VariantParams`, `SolutionParams`, `HintParams`, κτλ.

#### [NEW] [agentRegistry.ts](file:///c:/EduTeX/services/agentRegistry.ts)
- Static registry 19 agents με metadata (name, icon, description, domain, API endpoint)
- Mapping `future_ideas.md` agents (A-J) σε existing agents
- Helper functions: `getAgentsByDomain()`, `getAgentById()`, `getAgentEndpoint()`

---

### Component 2: Backend API Expansion

Επέκταση του FastAPI backend με endpoints για κάθε agent.

#### [MODIFY] [main.py](file:///c:/EduTeX/EduTeX_Agents/api/main.py)
- Νέα endpoints:
  - `POST /api/generate-exercises` → `ExerciseGenerator.generate()`
  - `POST /api/generate-solutions` → `SolutionWriter.solve()`
  - `POST /api/generate-variants` → `IsomorphicGenerator.generate_variations()`
  - `POST /api/generate-hints` → `HintGenerator`
  - `POST /api/detect-pitfalls` → `PitfallDetector`
  - `POST /api/generate-rubric` → `RubricDesigner`
  - `POST /api/calibrate-difficulty` → `DifficultyCalibrator`
  - `POST /api/check-prerequisites` → `PrerequisiteChecker`
  - `POST /api/generate-mindmap` → `MindmapGenerator`
  - `POST /api/multi-method-solve` → `MultiMethodSolver`
  - `POST /api/format-panhellenic` → `PanhellenicFormatter`
  - `POST /api/build-document` → `DocumentBuilder`
  - `POST /api/generate-figure` → `TikZExpert.generate_figure()`
  - `POST /api/format-table` → `TableFormatter`
  - `POST /api/create-presentation` → `BeamerCreator`
  - `POST /api/orchestrate` → Orchestrator (auto-detect domain + agent)
- Νέα Pydantic models για κάθε request/response
- `GET /api/agents` → επιστρέφει catalog agents με metadata

---

### Component 3: Frontend Service Layer

#### [NEW] [agentApiService.ts](file:///c:/EduTeX/services/agentApiService.ts)
- Wrapper functions για κάθε API endpoint
- Auto-detection: χρησιμοποιεί `fetch()` στο FastAPI backend (localhost:8000)
- Error handling με retry logic
- Type-safe responses
- Environment variable `VITE_API_URL` για config

#### [MODIFY] [geminiService.ts](file:///c:/EduTeX/services/geminiService.ts)
- Refactor σε fallback/demo mode
- Προστίθεται flag `USE_BACKEND_API` — αν true, redirect στο `agentApiService`

---

### Component 4: Agent Hub Page (Νέα Σελίδα)

Η κεντρική σελίδα που δείχνει **ΟΛΟΥΣ** τους agents οργανωμένους ανά domain.

#### [NEW] [AgentHub.tsx](file:///c:/EduTeX/pages/AgentHub.tsx)
- Δύο tabs: Education | Documents
- Grid με cards ανά agent (icon, name, description, status indicator)
- Click → navigate to agent-specific page ή open modal
- Search/filter functionality
- Animated cards με hover effects
- Domain color-coding (Education = τιρκουάζ, Documents = πορτοκαλί)

#### [MODIFY] [AgentCard.tsx](file:///c:/EduTeX/components/AgentCard.tsx)
- Γενίκευση: αντί hardcoded icons, χρησιμοποιεί dynamic icon mapping
- Νέες variants: `compact` (sidebar), `full` (hub page), `working` (generator)
- Προσθήκη domain badge

---

### Component 5: Worksheet Generator Page (Νέα Σελίδα)

Ανεξάρτητη σελίδα για `ExerciseGenerator` — ξεχωριστό flow από τον ExamGenerator.

#### [NEW] [WorksheetGenerator.tsx](file:///c:/EduTeX/pages/WorksheetGenerator.tsx)
- Sidebar config: topic, count, difficulty, exercise type
- Agent pipeline visualization (Generator → Validator → Typesetter)
- LaTeX preview + PDF export
- Reuse `PdfPreview`, `LatexRenderer` components

---

### Component 6: ExamGenerator Enhancement

#### [MODIFY] [ExamGenerator.tsx](file:///c:/EduTeX/pages/ExamGenerator.tsx)
- Αντικατάσταση 4 hardcoded agents με dynamic list από `agentRegistry`
- **Νέο agent pipeline**: Curriculum Architect → Exercise Generator → Solver/Validator → Isomorphic Generator (παραλλαγές) → Typesetter → Difficulty Calibrator
- Toggle: "Include Variants" (Ομάδα Α/Β) — ενεργοποιεί `IsomorphicGenerator`
- Toggle: "Include Solutions" — ενεργοποιεί `SolutionWriter`
- Toggle: "Include Rubric" — ενεργοποιεί `RubricDesigner`
- **Dual-mode call**: πρώτα API, fallback Gemini

---

### Component 7: Sidebar & Routing

#### [MODIFY] [Sidebar.tsx](file:///c:/EduTeX/components/Sidebar.tsx)
- Νέα nav items: **Agent Hub**, **Worksheet**, **Documents**
- Grouped sections: "Create" (Exam, Worksheet), "Browse" (Agent Hub, Library, Curriculum)
- Collapsible groups

#### [MODIFY] [App.tsx](file:///c:/EduTeX/App.tsx)
- Νέα routes:
  - `/agents` → `AgentHub`
  - `/worksheet` → `WorksheetGenerator`
  - `/documents` → Documents landing (future)

---

### Component 8: Dashboard — Vision Features

#### [MODIFY] [Dashboard.tsx](file:///c:/EduTeX/pages/Dashboard.tsx)
- **Agent Status Panel**: Real-time status όλων των agents (online/offline)
- **Coverage Heatmap**: Αντικατάσταση progress bars με interactive heatmap (from `future_ideas.md`)
- **Recent Activity**: Timeline τελευταίων generations
- **Quick Actions**: "One Exercise → Full Sheet" button
- Localization: Ελληνικά labels (αν ο user θέλει)

---

## Verification Plan

### Manual Browser Verification

1. **Start backend**: `cd c:\EduTeX\EduTeX_Agents && python api/main.py` — verify `http://localhost:8000/` returns `{"status": "online"}`
2. **Start frontend**: `cd c:\EduTeX && npm run dev` — verify site loads at `http://localhost:5173/`
3. **Agent Hub Page**: Navigate to `/#/agents` — verify 19 agent cards rendered, split by domain tabs
4. **Exam Generation (API mode)**: Go to `/#/create`, configure exam, click Generate — verify agents activate sequentially, result displays in Preview and LaTeX tabs
5. **Exam Generation (fallback mode)**: Stop backend, repeat step 4 — verify Gemini fallback works
6. **Worksheet Generator**: Navigate to `/#/worksheet`, generate exercises — verify output
7. **Sidebar**: Verify all new menu items navigate correctly
8. **Agent Cards**: Verify status indicators (IDLE → WORKING → COMPLETED) animate correctly

### Backend API Tests (curl)

```bash
# Health check
curl http://localhost:8000/

# Agent catalog
curl http://localhost:8000/api/agents

# Generate exam
curl -X POST http://localhost:8000/api/generate-exam \
  -H "Content-Type: application/json" \
  -d '{"topic":"quadratic","gradeLevel":"Β Λυκείου","difficulty":3,"questionCount":3,"includeSolutions":true}'

# Generate exercises
curl -X POST http://localhost:8000/api/generate-exercises \
  -H "Content-Type: application/json" \
  -d '{"topic":"quadratic","difficulty":"medium","count":5}'

# Generate variants
curl -X POST http://localhost:8000/api/generate-variants \
  -H "Content-Type: application/json" \
  -d '{"exercise":{"metadata":{"topic":"Quadratic Equations","difficulty":"medium","roots":[2,3]}},"count":2}'
```

---

## Phase Breakdown

| Phase | Scope | Est. Effort |
|-------|-------|-------------|
| **1** | Agent Registry, Types, Backend expansion (all endpoints) | High |
| **2** | Frontend service layer (`agentApiService.ts`) | Medium |
| **3** | Agent Hub page + AgentCard enhancement | Medium |
| **4** | ExamGenerator enhancement (multi-agent pipeline, toggles) | High |
| **5** | WorksheetGenerator page | Medium |
| **6** | Sidebar, routing, Dashboard enhancements | Medium |

---

## Agent Mapping: future_ideas.md → EduTeX_Agents

| Vision Agent | Code Agent | Status |
|---|---|---|
| A: Curriculum Architect | `orchestrator` + `prerequisite-checker` + `syllabus-checker` skill | ✅ Exists |
| B: Math Generator | `exercise-generator` | ✅ Exists |
| B: Twin Generator | `isomorphic-generator` | ✅ Exists |
| C: Solver & Validator | `solution-writer` + `difficulty-calibrator` | ✅ Exists |
| D: LaTeX Typesetter | `latex-core` skill + `document-builder` | ✅ Exists |
| E: Contextizer | ❌ | 🔮 Future |
| F: Exam Balancer | `difficulty-calibrator` + `rubric-designer` | ✅ Partial |
| G: Style Mimic | `panhellenic-formatter` | ✅ Partial |
| H: Student Simulator | `pitfall-detector` | ✅ Partial |
| I: Hint Designer | `hint-generator` | ✅ Exists |
| J: Grader | `rubric-designer` | ✅ Exists |
