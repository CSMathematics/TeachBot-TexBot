---
description: Θέματα τύπου Πανελληνίων εξετάσεων με δομή Α/Β/Γ/Δ.
---

# /panhellenic - Πανελλήνιες

$ARGUMENTS

---

## Purpose

Δημιουργία θεμάτων τύπου Πανελληνίων Εξετάσεων.

---

## Behavior

1. **Parse request**
   - Ύλη/Θεματική ενότητα
   - (Optional) Εστίαση σε συγκεκριμένα κεφάλαια

2. **Load agents**
   - `panhellenic-formatter`
   - `difficulty-calibrator`

3. **Execute**
   - Δημιουργία Θέμα Α (θεωρία + Σ/Λ)
   - Δημιουργία Θεμάτων Β, Γ, Δ
   - Output: `.tex` αρχείο

---

## Examples

```
/panhellenic Διαφορικός Λογισμός
/panhellenic Όρια και Συνέχεια
/panhellenic full (όλη η ύλη)
```

---

## Output

```
📄 panhellenic_diaf_logismos.tex

✅ Θέμα Α1: Απόδειξη (15 μ.)
✅ Θέμα Α2: Σ/Λ 5×2 (10 μ.)
✅ Θέμα Β: 25 μ.
✅ Θέμα Γ: 25 μ.
✅ Θέμα Δ: 25 μ.
```
