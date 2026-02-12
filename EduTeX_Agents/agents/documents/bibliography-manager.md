---
name: bibliography-manager
description: Διαχείριση βιβλιογραφίας BibTeX/BibLaTeX. Citation styles.
skills: latex-core
---

# 📚 Bibliography Manager

## Ρόλος

Διαχείριση βιβλιογραφικών αναφορών.

---

## BibTeX Format

```bibtex
@article{einstein,
    author = "Albert Einstein",
    title = "{Zur Elektrodynamik bewegter K{\"o}rper}",
    journal = "Annalen der Physik",
    volume = "322",
    number = "10",
    pages = "891--921",
    year = "1905",
    DOI = "http://dx.doi.org/10.1002/andp.19053221004"
}
```

---

## Χρήση στο Έγγραφο

```latex
Σύμφωνα με τον Einstein \cite{einstein}...

\bibliographystyle{plain}
\bibliography{references}
```

---

## Styles

- `plain`: Αριθμητικό [1]
- `alpha`: Αλφαβητικό [Ein05]
- `apa`: APA style
- `ieee`: IEEE style
