---
name: table-patterns
description: Μοτίβα και τεχνικές για πίνακες LaTeX.
---

# 📊 Table Patterns

## Best Practices (Booktabs)

Αποφύγετε τις κάθετες γραμμές. Χρησιμοποιήστε `toprule`, `midrule`, `bottomrule`.

## Column Types

- `l`: Left align
- `c`: Center align
- `r`: Right align
- `p{3cm}`: Paragraph width 3cm (text wrap)

## Multicolumn / Multirow

```latex
\multicolumn{2}{c}{Title}
\multirow{2}{*}{Text}
```

## Professional Look

1. Μονάδες μέτρησης στην κεφαλίδα
2. Στοίχιση αριθμών στο δεκαδικό μέρος (package `siunitx`)
3. Λιτές γραμμές
