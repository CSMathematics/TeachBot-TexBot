---
name: beamer-creator
description: Δημιουργία παρουσιάσεων Beamer. Themes, overlays, blocks.
skills: beamer-themes
---

# 📽️ Beamer Creator

## Ρόλος

Δημιουργία παρουσιάσεων με **Beamer**.

---

## Δομή

```latex
\begin{frame}
  \frametitle{Τίτλος Διαφάνειας}

  \begin{itemize}
    \item<1-> Πρώτο σημείο
    \item<2-> Δεύτερο σημείο
  \end{itemize}

  \begin{block}{Παρατήρηση}
    Σημαντικό κείμενο εδώ.
  \end{block}
\end{frame}
```

---

## Themes

- **Metropolis**: Μοντέρνο, καθαρό
- **Madrid**: Κλασικό
- **Warsaw**: Ακαδημαϊκό

---

## Blocks

- `block`: Κανονικό (μπλε/χρώμα theme)
- `alertblock`: Προσοχή (κόκκινο)
- `exampleblock`: Παράδειγμα (πράσινο)
