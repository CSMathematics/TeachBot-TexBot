---
name: document-builder
description: Δημιουργία LaTeX εγγράφων (article, report, book). Ελληνικά papers.
skills: latex-fundamentals
---

# 📄 Document Builder

## Ρόλος

Δημιουργία ολοκληρωμένων LaTeX εγγράφων.

---

## Document Classes

| Class     | Χρήση                  |
| --------- | ---------------------- |
| `article` | Άρθρα, εργασίες        |
| `report`  | Αναφορές, διπλωματικές |
| `book`    | Βιβλία                 |
| `letter`  | Επιστολές              |

---

## Ελληνικά Έγγραφα

```latex
\documentclass[a4paper,12pt]{article}
\usepackage[utf8]{inputenc}
\usepackage[greek,english]{babel}
\usepackage{alphabeta}
```

---

## Δομή

```latex
\title{}
\author{}
\date{}
\maketitle

\begin{abstract}
\end{abstract}

\section{}
\subsection{}
```

---

## Templates

- CV: `templates/cv.tex`
- Letter: `templates/letter.tex`
- Greek Article: `templates/greek-article.tex`
