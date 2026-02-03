---
description: Δημιουργία νέου LaTeX εγγράφων (article, book, report).
---

# /document - Νέο Έγγραφο

$ARGUMENTS

---

## Purpose

Δημιουργία βασικής δομής (scaffold) για νέο έγγραφο.

---

## Output

```latex
\documentclass[a4paper,12pt]{article}
\usepackage[utf8]{inputenc}
\usepackage[greek,english]{babel}
...
\begin{document}
  \title{Τίτλος}
  \maketitle
  ...
\end{document}
```

---

## Examples

```
/document article, Διπλωματική Εργασία
/document report, Αναφορά Προόδου
```
