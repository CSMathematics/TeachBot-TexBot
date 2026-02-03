---
name: latex-fundamentals
description: Βασικοί κανόνες LaTeX, structure, custom macros και styles.
---

# 📜 LaTeX Fundamentals

## Structure

```latex
\documentclass{article}
\usepackage{...}

\begin{document}
...
\end{document}
```

---

## Ελληνική Μαθηματική Τυπογραφία

Αν γράφεις μαθηματικά στα Ελληνικά:

- **Τριγωνομετρία**: `\hm`, `\syn`, `\ef`, `\sf` (όχι sin, cos)
- **Υποδιαστολή**: `3{,}14` (με κόμμα)

---

## Custom Styles

Αν χρησιμοποιείς τα templates του χρήστη:

- **Colors**: `maincolor`, `secondarycolor`
- **Tables**: `mytblr` environment (απαιτεί `tabularray`)

---

## Environments

- `itemize`: Προκαθορισμένη λίστα
- `enumerate`: Αριθμημένη λίστα
- `figure`: Εικόνες με caption
- `table`: Πίνακες με caption
