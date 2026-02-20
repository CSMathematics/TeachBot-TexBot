---
trigger: always_on
---

# EduTeX - Educational & Technical LaTeX Assistant

> Entry point για το AI agent system

---

## 🎯 Σκοπός

Ενιαίο σύστημα για:
1. **Education**: Δημιουργία εκπαιδευτικού υλικού μαθηματικών (TeachBot domain)
2. **Documents**: Δημιουργία LaTeX εγγράφων, σχημάτων και παρουσιάσεων (TexBot domain)

---

## 📥 Request Classifier

| Αίτημα                        | Command          | Agent                 | Domain    |
| ----------------------------- | ---------------- | --------------------- | --------- |
| **Education**                 |                  |                       |           |
| "φυλλάδιο", "ασκήσεις"        | `/worksheet`     | exercise-generator    | Education |
| "διαγώνισμα", "τεστ"          | `/exam`          | exam-creator          | Education |
| "λύση", "λύσεις"              | `/solutions`     | solution-writer       | Education |
| "πανελλήνιες"                 | `/panhellenic`   | panhellenic-formatter | Education |
| "παραλλαγή", "variant"        | `/variant`       | isomorphic-generator  | Education |
| "rubric", "βαθμολογία"        | `/rubric`        | rubric-designer       | Education |
| "θεωρία"                      | `/theory`        | exercise-generator    | Education |
| "flowchart", "διάγραμμα ροής"   | `/flowchart`     | flowchart-generator   | Education |
| "υπόδειξη", "hints"           | `/hints`         | hint-generator        | Education |
| "λάθη", "mistakes"            | `/mistakes`      | pitfall-detector      | Education |
| "προαπαιτούμενα"              | `/prerequisites` | prerequisite-checker  | Education |
| "μέθοδοι"                     | `/multi-method`  | multi-method-solver   | Education |
| **Documents**                 |                  |                       |           |
| "έγγραφο", "article"          | `/document`      | document-builder      | Documents |
| "σχήμα", "γράφημα"            | `/figure`        | tikz-expert           | Documents |
| "πίνακας", "table"            | `/table`         | table-formatter       | Documents |
| "παρουσίαση", "slides"        | `/presentation`  | beamer-creator        | Documents |
| "cv", "βιογραφικό"            | `/cv`            | document-builder      | Documents |
| "επιστολή", "letter"          | `/letter`        | document-builder      | Documents |
| "βιβλιογραφία", "citation"    | `/bibliography`  | bibliography-manager  | Documents |
| "template", "πρότυπο"         | `/template`      | template-curator      | Documents |
| "σφάλμα", "fix"               | `/fix`           | fix-agent             | Documents |

---

## 🔧 Agent Loading Protocol

```
User Request → Domain Detection (Edu/Doc) → Load Agent → Load Skills → Execute
```

---

## 🌐 Language

- **Απαντήσεις**: Στα Ελληνικά
- **LaTeX code**: Αγγλικά σχόλια
- **Μαθηματικοί όροι**: Σχολική ορολογία (για Education domain)
- **Ελληνικά κείμενα**: UTF-8 + babel

---

## ⚡ Quick Commands

### Education
```
/worksheet Παράγωγος, 20 ασκήσεις, μεσαία
/exam Όρια, 120/180 λεπτά, Β' Λυκείου
/solutions [αρχείο.tex]
/panhellenic Διαφορικός Λογισμός
/mistakes Παραγώγιση
```

### Documents
```
/document article, Διπλωματική Εργασία
/figure γράφημα συνάρτησης
/presentation 10 slides, Machine Learning
/table 5x4, επιστημονικά δεδομένα
```

---

## 📁 Paths

- Root: `EduTeX/`
- Agents: `EduTeX/agents/{education,documents}/`
- Skills: `EduTeX/skills/`
- Workflows: `EduTeX/workflows/{education,documents}/`
- Syllabus: `EduTeX/syllabus/`
- Templates: `EduTeX/templates/`
