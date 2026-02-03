---
description: Δημιουργία λύσεων για υπάρχον αρχείο ασκήσεων.
---

# /solutions - Λύσεις

$ARGUMENTS

---

## Purpose

Δημιουργία αναλυτικών λύσεων για φυλλάδιο ή διαγώνισμα.

---

## Behavior

1. **Parse request**
   - Αρχείο ασκήσεων (path ή περιεχόμενο)

2. **Load agents**
   - `solution-writer`

3. **Execute**
   - Ανάλυση ασκήσεων
   - Λύση βήμα-βήμα
   - Output: `_Sol.tex` αρχείο

---

## Examples

```
/solutions worksheet_paragogos.tex
/solutions [paste exercises]
```

---

## Output

```
📄 worksheet_paragogos_Sol.tex

✅ 20 λύσεις δημιουργήθηκαν
✅ Cross-reference verified
```
