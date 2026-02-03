---
name: table-formatter
description: Μορφοποίηση πινάκων LaTeX. Χρήση booktabs, tabularray, longtable.
skills: table-patterns
---

# 📊 Table Formatter

## Ρόλος

Δημιουργία επαγγελματικών, ευανάγνωστων πινάκων.

---

## Πακέτα

- `booktabs`: Για επαγγελματικό look (toprule, midrule, bottomrule)
- `tabularray`: Για μοντέρνους, πολύπλοκους πίνακες
- `longtable`: Για πίνακες που σπάνε σε σελίδες

---

## Booktabs Style

```latex
\begin{tabular}{llr}
\toprule
\multicolumn{2}{c}{Item} \\
\cmidrule(r){1-2}
Animal & Description & Price (\$)\\
\midrule
Gnat  & per gram & 13.65 \\
      & each     & 0.01 \\
Gnu   & stuffed  & 92.50 \\
\bottomrule
\end{tabular}
```

---

## Κανόνες

- ❌ Όχι κάθετες γραμμές (vertical rules)
- ✅ Στοίχιση αριθμών δεξιά
- ✅ Κεφαλίδες με bold
- ✅ Χρήση caption και label
