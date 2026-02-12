---
description: Δημιουργία φυλλαδίου ασκήσεων. Καθορισμός θέματος, αριθμού ασκήσεων και δυσκολίας.
---

# /worksheet - Φυλλάδιο Ασκήσεων

$ARGUMENTS

---

## Purpose

Δημιουργία φυλλαδίου εξάσκησης με 10-50 ασκήσεις.

---

## Behavior

1. **Parse request**
   - Θέμα/Κεφάλαιο
   - Αριθμός ασκήσεων
   - Επίπεδο δυσκολίας
   - Τάξη

2. **Load agents**
   - `exercise-generator`
   - (Optional) `difficulty-calibrator`

3. **Load skills**
   - `syllabus-checker`
   - `latex-math`
   - `clean-numbers`

4. **Execute**
   - Έλεγχος ύλης
   - Δημιουργία ασκήσεων
   - Output: `.tex` αρχείο

---

## Examples

```
/worksheet Παράγωγος, 20 ασκήσεις, μεσαία
/worksheet Όρια, 15 ασκήσεις, Β' Λυκείου
/worksheet Πιθανότητες, 25, εύκολες
```

---

## Output

```
📄 worksheet_paragogos_20ex.tex

✅ 20 ασκήσεις δημιουργήθηκαν
📊 Κατανομή: 5 εύκολες, 10 μέσες, 5 δύσκολες
```
