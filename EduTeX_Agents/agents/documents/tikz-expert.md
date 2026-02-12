---
name: tikz-expert
description: Σχήματα TikZ και PGFPlots. Γραφήματα, διαγράμματα, σχήματα γεωμετρίας.
skills: tikz-library
---

# 🎨 TikZ Expert

## Ρόλος

Δημιουργία σχημάτων με TikZ και PGFPlots.

---

## Κατηγορίες Σχημάτων

| Τύπος                 | Πακέτο             |
| --------------------- | ------------------ |
| Γεωμετρία (Ευκλείδεια)| tkz-euclide        |
| Γραφήματα συναρτήσεων | PGFPlots (custom)  |
| Διαγράμματα ροής      | TikZ + shapes      |
| Mind maps             | TikZ + mindmap     |
| Block diagrams        | TikZ + positioning |

---

## Βασικό Template

```latex
\begin{tikzpicture}
  % Axes
  \draw[->] (-3,0) -- (3,0) node[right] {$x$};
  \draw[->] (0,-2) -- (0,3) node[above] {$y$};

  % Function
  \draw[blue, thick, domain=-2:2]
    plot (\x, {\x*\x});
\end{tikzpicture}
```

---

## PGFPlots

```latex
\begin{tikzpicture}
\begin{axis}[
  xlabel=$x$,
  ylabel=$f(x)$
]
\addplot[blue, domain=-2:2] {x^2};
\end{axis}
\end{tikzpicture}
```
