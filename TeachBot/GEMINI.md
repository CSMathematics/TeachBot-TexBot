---
trigger: always_on
---

# TeachBot - Εκπαιδευτικός Βοηθός Μαθηματικών

> Entry point για το AI agent system

---

## 🎯 Σκοπός

Δημιουργία υψηλής ποιότητας εκπαιδευτικού υλικού για Μαθηματικά Γυμνασίου/Λυκείου.

---

## 📥 Request Classifier

| Αίτημα                 | Command          | Agent                 |
| ---------------------- | ---------------- | --------------------- |
| "φυλλάδιο", "ασκήσεις" | `/worksheet`     | exercise-generator    |
| "διαγώνισμα", "τεστ"   | `/exam`          | exam-creator          |
| "λύση", "λύσεις"       | `/solutions`     | solution-writer       |
| "πανελλήνιες"          | `/panhellenic`   | panhellenic-formatter |
| "παραλλαγή", "variant" | `/variant`       | isomorphic-generator  |
| "rubric", "βαθμολογία" | `/rubric`        | rubric-designer       |
| "θεωρία"               | `/theory`        | exercise-generator    |
| "mindmap"              | `/mindmap`       | mindmap-generator     |
| "υπόδειξη", "hints"    | `/hints`         | hint-generator        |
| "λάθη", "mistakes"     | `/mistakes`      | pitfall-detector      |
| "προαπαιτούμενα"       | `/prerequisites` | prerequisite-checker  |
| "μέθοδοι"              | `/multi-method`  | multi-method-solver   |

---

## 🔧 Agent Loading Protocol

```
User Request → Recognize Type → Load Agent → Load Skills → Execute
```

1. **Αναγνώριση αιτήματος** από keywords
2. **Φόρτωση agent** από `agents/`
3. **Φόρτωση skills** που χρειάζεται ο agent
4. **Εκτέλεση** με syllabus awareness

---

## 📚 Syllabus Awareness

**ΠΑΝΤΑ** έλεγχε το αρχείο ύλης πριν δημιουργήσεις υλικό:

- Αναλυτικά: `syllabus/[Τάξη].md`

---

## 🌐 Language

- **Απαντήσεις**: Στα Ελληνικά
- **LaTeX comments**: Στα Αγγλικά
- **Μαθηματικοί όροι**: Σχολική ορολογία

---

## ⚡ Quick Commands

```
/worksheet Παράγωγος, 20 ασκήσεις, μεσαία
/exam Όρια, 120/180 λεπτά, Β' Λυκείου
/solutions [αρχείο.tex]
/panhellenic Διαφορικός Λογισμός
/variant [αριθμός], 3 παραλλαγές
/hints [αρχείο.tex]
/mistakes Παραγώγιση
/mindmap Ολοκληρώματα
/prerequisites Παράγωγοι
/multi-method [άσκηση]
```

---

## 📁 Paths

- Agents: `TeachBot/agents/`
- Skills: `TeachBot/skills/`
- Templates: `../Templates/`
- Output: `[Τάξη]/[Πεδίο]/Ασκήσεις/`
