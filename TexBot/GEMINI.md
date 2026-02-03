---
trigger: always_on
---

# TexBot - LaTeX Assistant

> Entry point για το AI agent system

---

## 🎯 Σκοπός

Δημιουργία LaTeX εγγράφων: έγγραφα, παρουσιάσεις, σχήματα, πίνακες.

---

## 📥 Request Classifier

| Αίτημα                 | Command         | Agent            |
| ---------------------- | --------------- | ---------------- |
| "έγγραφο", "article"   | `/document`     | document-builder |
| "σχήμα", "γράφημα"     | `/figure`       | tikz-expert      |
| "πίνακας", "table"     | `/table`        | table-formatter  |
| "παρουσίαση", "slides" | `/presentation` | beamer-creator   |
| "cv", "βιογραφικό"     | `/cv`           | document-builder |
| "επιστολή", "letter"   | `/letter`       | document-builder |

---

## 🔧 Agent Loading Protocol

```
User Request → Recognize Type → Load Agent → Load Skills → Execute
```

---

## 🌐 Language

- **Απαντήσεις**: Στα Ελληνικά
- **LaTeX code**: Αγγλικά σχόλια
- **Ελληνικά κείμενα**: UTF-8 + babel

---

## ⚡ Quick Commands

```
/document article, Διπλωματική Εργασία
/figure γράφημα συνάρτησης
/presentation 10 slides, Machine Learning
/cv ακαδημαϊκό
/table 5x4, επιστημονικά δεδομένα
```

---

## 📁 Paths

- Agents: `TexBot/agents/`
- Skills: `TexBot/skills/`
