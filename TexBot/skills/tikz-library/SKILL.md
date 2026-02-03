---
name: tikz-library
description: Βιβλιοθήκη μοτίβων για TikZ και PGFPlots. Custom styles Philomatheia.
---

# 🎨 TikZ Library

## Philomatheia Custom Styles

Χρησιμοποίησε αυτά τα styles που είναι ήδη ορισμένα στα templates:

```latex
\begin{tikzpicture}
  % Άξονες με το style 'aks_on' και βέλη 'belh ar'
  \draw[aks_on] (-3,0) -- (3,0) node[right] {$x$};
  \draw[aks_on] (0,-3) -- (0,3) node[above] {$y$};

  % Γραφική παράσταση
  \draw[grafikh parastash] plot (\x, {\x^2});

  % Σημείο με labelbox
  \node[labelbox] at (1,1) {A};
\end{tikzpicture}
```

## Colors

- Χρήση `maincolor` για κύρια στοιχεία
- Χρήση `gray7` για βοηθητικές γραμμές (grid/dashed)

## PGFPlots Axis

```latex
\begin{axis}[
  axis lines=middle,
  xlabel=$x$, ylabel=$y$,
  cycle list={ {maincolor, thick} } % Χρήση του maincolor
]
...
\end{axis}
```

## Mindmaps (TikZ)

Χρήση της βιβλιοθήκης `mindmap` για οπτική σύνοψη θεωρίας.

```latex
\usetikzlibrary{mindmap}
\begin{tikzpicture}[mindmap, grow cyclic,
    every node/.style=concept, concept color=maincolor!60,
    level 1/.style={level distance=5cm, sibling angle=90},
    level 2/.style={level distance=3cm, sibling angle=45}]

  \node[root concept] {Κεντρική Έννοια}
    child { node {Υποέννοια 1}
      child { node {Λεπτομέρεια 1.1} }
    }
    child { node {Υποέννοια 2} };
\end{tikzpicture}
```

- **Στυλ:** Χρήση `concept color` για κάθε επίπεδο.
- **Διάρθρωση:** Κεντρική έννοια -> Κλάδοι -> Φύλλα.
