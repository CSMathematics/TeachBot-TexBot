# EduTeX Architecture

> Ενιαίο σύστημα AI agents για εκπαιδευτικό υλικό και LaTeX έγγραφα.

---

## 📋 Overview

- **19 Specialist Agents** (12 Education + 7 Documents)
- **7 Skills** (Core LaTeX + Specialized)
- **33 Workflows** (Slash commands)

---

## 🏗️ Directory Structure

```
EduTeX/
├── ARCHITECTURE.md          # This file
├── GEMINI.md                # Entry point
├── agents/
│   ├── orchestrator.md      # Unified orchestrator
│   ├── education/           # Education domain agents
│   └── documents/           # Documents domain agents
├── skills/
│   ├── latex-core/          # Unified LaTeX skill
│   └── ...                  # Specialized skills
└── workflows/
    ├── education/           # Education commands
    └── documents/           # Document commands
```

---

## 🤖 Agents

### Orchestrator

- **Domain Detection**: Αναλύει το αίτημα και το δρομολογεί στο σωστό domain (`education` ή `documents`).
- **Routing**: Επιλέγει τον κατάλληλο agent εντός του domain.

### Education Domain (12 Agents)

| Agent                   | Ρόλος                 | Skills                     |
| ----------------------- | --------------------- | -------------------------- |
| `exercise-generator`    | Δημιουργία ασκήσεων   | latex-core, clean-numbers  |
| `solution-writer`       | Αναλυτικές λύσεις     | latex-core, ped-patterns   |
| `exam-creator`          | Διαγωνίσματα          | latex-core, syllabus       |
| `panhellenic-formatter` | Θέματα Πανελληνίων    | latex-core                 |
| `rubric-designer`       | Κριτήρια βαθμολόγησης | pedagogical-patterns       |
| `difficulty-calibrator` | Βαθμονόμηση δυσκολίας | syllabus-checker           |
| `isomorphic-generator`  | Παραλλαγές ασκήσεων   | clean-numbers              |
| ...                     | ...                   | ...                        |

### Documents Domain (7 Agents)

| Agent                  | Ρόλος                         | Skills             |
| ---------------------- | ----------------------------- | ------------------ |
| `document-builder`     | Έγγραφα (article/report/book) | latex-core         |
| `tikz-expert`          | Σχήματα TikZ/PGFPlots         | tikz-library       |
| `table-formatter`      | Πίνακες                       | table-patterns     |
| `beamer-creator`       | Παρουσιάσεις                  | beamer-themes      |
| `bibliography-manager` | Βιβλιογραφία BibTeX           | latex-core         |
| `template-curator`     | Διαχείριση templates          | latex-core         |
| `fix-agent`            | Διόρθωση σφαλμάτων            | latex-core         |

---

## 🧩 Skills

| Skill                  | Περιγραφή                                    |
| ---------------------- | -------------------------------------------- |
| `latex-core`           | **Unified**: Βασικό LaTeX + Ελληνικά + Styles|
| `tikz-library`         | Βιβλιοθήκη TikZ patterns                     |
| `table-patterns`       | Στυλ πινάκων                                 |
| `beamer-themes`        | Θέματα παρουσιάσεων                          |
| `clean-numbers`        | Φιλικοί αριθμοί σε ασκήσεις                  |
| `syllabus-checker`     | Έλεγχος ύλης                                 |
| `pedagogical-patterns` | Παιδαγωγικοί κανόνες                         |

---

## 🔄 Workflows

### Education
- `/worksheet`, `/exam`, `/solutions`
- `/panhellenic`, `/variant`, `/rubric`
- `/theory`, `/hints`, `/mistakes`

### Documents
- `/document`, `/figure`, `/table`
- `/presentation`, `/cv`, `/letter`
- `/bibliography`, `/template`, `/fix`

---

## 🎯 Quick Reference

| Need                | Command         | Domain    |
| ------------------- | --------------- | --------- |
| Ασκήσεις εξάσκησης  | `/worksheet`    | Education |
| Διαγώνισμα σχολείου | `/exam`         | Education |
| Νέο έγγραφο         | `/document`     | Documents |
| Σχήμα TikZ          | `/figure`       | Documents |
| Παρουσίαση          | `/presentation` | Documents |
