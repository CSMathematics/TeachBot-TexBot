# TexBot Architecture

> Σύστημα AI agents για δημιουργία LaTeX εγγράφων

---

## 📋 Overview

- **7 Specialist Agents** - Εξειδικευμένοι βοηθοί
- **4 Skills** - Επαναχρησιμοποιήσιμες γνώσεις
- **14 Workflows** - Slash commands

---

## 🏗️ Directory Structure

```
TexBot/
├── ARCHITECTURE.md          # This file
├── GEMINI.md                # Entry point
├── agents/                  # 7 Agents
├── skills/                  # 4 Skills
└── workflows/               # 14 Commands
```

---

## 🤖 Agents (7)

| Agent                  | Ρόλος                         | Skills             |
| ---------------------- | ----------------------------- | ------------------ |
| `orchestrator`         | Συντονισμός                   | latex-fundamentals |
| `document-builder`     | Έγγραφα (article/report/book) | latex-fundamentals |
| `tikz-expert`          | Σχήματα TikZ/PGFPlots         | tikz-library       |
| `table-formatter`      | Πίνακες                       | table-patterns     |
| `beamer-creator`       | Παρουσιάσεις                  | beamer-themes      |
| `bibliography-manager` | Βιβλιογραφία BibTeX           | latex-fundamentals |
| `template-curator`     | Διαχείριση templates          | latex-fundamentals |

---

## 🧩 Skills (4)

| Skill                | Περιγραφή           |
| -------------------- | ------------------- |
| `latex-fundamentals` | Βασικά LaTeX        |
| `tikz-library`       | TikZ patterns       |
| `table-patterns`     | Στυλ πινάκων        |
| `beamer-themes`      | Θέματα παρουσιάσεων |

---

## 🔄 Workflows (14)

| Command          | Περιγραφή        |
| ---------------- | ---------------- |
| `/document`      | Νέο έγγραφο      |
| `/figure`        | TikZ σχήμα       |
| `/table`         | Πίνακας          |
| `/presentation`  | Beamer slides    |
| `/cv`            | Βιογραφικό       |
| `/letter`        | Επιστολή         |
| `/poster`        | Αφίσα            |
| `/convert`       | Word→LaTeX       |
| `/template`      | Επιλογή template |
| `/fix`           | Διόρθωση errors  |
| `/snippet`       | Code snippet     |
| `/equation`      | Εξίσωση/Array    |
| `/bibliography`  | BibTeX           |
| `/greek-article` | Ελληνικό paper   |

---

## 🎯 Quick Reference

| Need        | Command         |
| ----------- | --------------- |
| Νέο έγγραφο | `/document`     |
| Σχήμα       | `/figure`       |
| Παρουσίαση  | `/presentation` |
| CV          | `/cv`           |
