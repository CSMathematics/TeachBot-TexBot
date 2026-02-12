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

## Euclidean Geometry (tkz-euclide)

Για γεωμετρικά σχήματα, χρησιμοποιούμε το πακέτο `tkz-euclide`.

```latex
\begin{tikzpicture}
  % Ορισμός σημείων
  \tkzDefPoints{1/2.5/A, 5/2.5/B, 4/0/C, 0/0/D}
  \tkzDefPointBy[projection=onto B--C](A) \tkzGetPoint{L}

  % Σχεδίαση
  \tkzDrawPolygon[line width=0.4mm](A,B,C,D)
  \tkzDrawSegments[plm, color=maincolor](A,L)
  
  % Γωνίες
  \tkzMarkRightAngle[size=0.3](B,L,A)

  % Labels
  \tkzLabelPoint[left](A){$A$}
  \tkzLabelPoint[right](B){$B$}
  \tkzLabelSegment[below](A,L){$15\si{dm}$}

  % Points
  \tkzDrawPoints[size=3, fill=white](A,B,C,D,L)
\end{tikzpicture}
```

---

## PGFPlots (Advanced Styles)

Για γραφικές παραστάσεις, χρησιμοποιούμε `pgfplots` με τα custom styles:

- `belh ar`: Βέλη στους άξονες
- `aks_on`: Εμφάνιση αξόνων
- `grafikh parastash`: Style για τη συνάρτηση

```latex
\begin{tikzpicture}
\begin{axis}[
  width=6.5cm, height=5.5cm,
  xmin=-4, xmax=16,
  ymin=-0.25, ymax=0.75,
  xtick={-4,0,...,16},
  ytick={-0.25,0,...,1},
  xlabel={\footnotesize $x$},
  ylabel={\footnotesize $y$},
  belh ar, aks_on,               % Custom styles
  grid=both,
  grid style={line width=.1pt, draw=gray!10},
  major grid style={line width=.2pt, draw=gray!50},
  minor tick num=4
]
  \begin{scope}
    \clip (axis cs:-1,-1) rectangle (axis cs:15,1);
    \addplot[grafikh parastash, domain=0:15, secondarycolor]{sqrt(x*exp(-x))};
  \end{scope}
  
  % Labels & Points
  \node at (axis cs:3,3) {$y(x)=-\frac{2}{x}$};
  \node[labelbox={secondarycolor}](A) at (axis cs:1,0.61){Αρχική\\συνθήκη};
  \fill[secondarycolor] (axis cs:1,0.61) circle (0.07);
\end{axis}
\end{tikzpicture}
```

---

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
