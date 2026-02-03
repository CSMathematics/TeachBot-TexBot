---
description: Δημιουργία πλήρους πακέτου (Φυλλάδιο + Λύσεις + Rubric + Versions).
---

# /full-package - Πλήρες Πακέτο

$ARGUMENTS

---

## Purpose

Εκτέλεση όλων των διαδικασιών μαζί.

---

## Execution Pipeline

1. `/prerequisites` (Warm-up)
2. `/worksheet` ή `/exam`
3. `/theory` (optional)
4. `/mindmap` (Visual Summary)
5. `/solutions`
6. `/hints` (Scaffolding)
7. `/mistakes` (Pitfalls)
8. `/rubric`
9. `/split`
10. `/calibrate` (report)

---

## Dependency Order

```
prerequisite-checker → (exercise-generator | exam-creator) → mindmap-generator → solution-writer → hint-generator → pitfall-detector → rubric-designer → split
```

---

## Output

Φάκελος με όλα τα παραγόμενα αρχεία.

---

## Examples

```
/full-package Διαγώνισμα, Παράγωγος
```
