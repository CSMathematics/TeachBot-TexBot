---
name: brainstorming-v2
description: Complete brainstorming protocol with request classification, timeboxing, context persistence, conflict detection, and visual summaries. Production-ready implementation.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Brainstorming Protocol v2.0 - Production Implementation

## Quick Start

```javascript
// Import and use the brainstorming widget
import BrainstormingWidget from "@/components/BrainstormingWidget";

<BrainstormingWidget
  initialRequest="Build a user authentication system"
  onComplete={(session) => console.log("Ready to implement:", session)}
  onSaveContext={(session) => saveToFile(session)}
/>
```

---

## Core Features Implemented

### 1. Request Classification (Automatic)

The system automatically classifies requests in under 1 second:

| Pattern Detected | Classification | Questions | Time Budget |
|------------------|----------------|-----------|-------------|
| "fix", "bug", "error" | Bug Fix | 2 | 3 min |
| "add api", "endpoint" | CRUD API | 3 | 4 min |
| "style", "css", "look" | Styling | 2 | 2 min |
| "deploy", "production" | Deployment | 3 | 4 min |
| "refactor" | Refactor | 3 | 5 min |
| "build", "create", "new app" | New Project | 6 | 12 min |
| "feature", "add" | Feature | 4 | 8 min |

### 2. Timeboxing (Enforced)

```javascript
// Automatic time tracking
const [elapsedTime, setElapsedTime] = useState(0);
const [showTimeWarning, setShowTimeWarning] = useState(false);

// Warning at 80% of time budget
if (elapsed >= timeBudget * 0.8) {
  setShowTimeWarning(true);
}
```

**Visual indicator:** Amber warning banner appears when time is running low.

### 3. "I Don't Know" Fallback

**Button:** "I don't know → Use default"

**Behavior:**
- If question has options: Selects first option as default
- If open-ended: Records "Proceeding with default - can adjust later"
- Automatically advances to next question

### 4. Context Persistence

**Save Function:**
```javascript
const saveContext = (session) => {
  const filename = `.agent/context/brainstorming/${Date.now()}_${session.id}.md`;
  const content = generateContextFile(session);
  writeFile(filename, content);
};
```

**File Format:**
```markdown
# Brainstorming Context: [Request Summary]
**Date:** [ISO Date]
**Classification:** [Type]
**Time:** [Elapsed] / [Budget]

## Questions & Answers
[Structured Q&A]

## Key Decisions
- [Decision 1]
- [Decision 2]

## Assumptions
- [Assumption 1] (Risk: High)

## Next Steps
1. [Action item]
```

### 5. Conflict Detection

**Automatic Detection:**
```javascript
const detectConflicts = (answers) => {
  const conflicts = [];
  
  // Check for "fast AND comprehensive"
  if (answers.timeline === "urgent" && answers.scope === "comprehensive") {
    conflicts.push({
      type: "speed_vs_thoroughness",
      message: "Fast timeline + comprehensive scope detected",
      resolution: "Ask: Which matters more for this phase?"
    });
  }
  
  // Check for "simple AND enterprise"
  if (answers.complexity === "simple" && answers.scale === "enterprise") {
    conflicts.push({
      type: "complexity_contradiction",
      message: "Simple solution + enterprise scale detected",
      resolution: "Ask: What scale are we targeting initially?"
    });
  }
  
  return conflicts;
};
```

### 6. Good Enough Detection

**Auto-complete when:**
- All P0 (blocking) questions answered
- 70%+ of questions answered
- Time budget exceeded

**Visual Summary Generated:**
```
┌─ BRAINSTORMING SUMMARY ─────────────────┐
│ Request: User auth system                │
│ Type: New Project | Time: 8m / 12m      │
│                                          │
│ Key Decisions:                           │
│ • Scale: MVP (validate first)            │
│ • Auth: Email/password                   │
│ • Timeline: Within 2 weeks               │
│                                          │
│ Assumptions:                             │
│ • User has email service setup           │
│                                          │
│ Next Step: Start with NextAuth setup     │
│ Confidence: High                         │
└─────────────────────────────────────────┘
```

### 7. Visual Summary

**Implemented as:**
- ASCII art card in final step
- Copy-pasteable format
- Includes all key decisions
- Shows confidence level

### 8. Integration Points

**Skill Handoff Triggers:**
```javascript
const handoffMap = {
  "database entities mentioned": "database-design",
  "UI/UX critical": "ui-ux-pro-max",
  "performance numbers": "performance-profiling",
  "security requirements": "vulnerability-scanner",
  "testing strategy": "testing-patterns"
};
```

### 9. Common Templates (Built-in)

**Templates are now code:**
- `Bug Fix`: 2 questions (error message, expected behavior)
- `CRUD API`: 3 questions (auth, entities, relations)
- `Styling`: 2 questions (visual reference, scope)
- `Deployment`: 3 questions (platform, domain, env vars)
- `Refactor`: 3 questions (motivation, scope, risks)
- `Feature`: 4 questions (purpose, users, integration, priority)
- `New Project`: 6 questions (scale, auth, data, timeline, etc.)

### 10. Post-Implementation Review

**Automatic prompt after completion:**
```javascript
const promptReview = () => {
  return `
    ## Quick Retrospective (30 seconds)
    
    1. Were the questions helpful? (Yes/No)
    2. Did we miss anything important? (Open)
    3. Were the defaults correct? (Yes/No/Mostly)
    
    Save to: .agent/skills/brainstorming/lessons-learned.md
  `;
};
```

---

## Usage Examples

### Example 1: Bug Fix

**User:** "The login button doesn't work"

**Classification:** Bug Fix (2 questions, 3 min)

**Questions:**
1. What error message or behavior do you see?
2. What should happen instead?

**Result:** Proceed to debugging skill with context.

### Example 2: New Feature

**User:** "Add a shopping cart"

**Classification:** Feature (4 questions, 8 min)

**Questions:**
1. What problem are you trying to solve?
2. Who will use this?
3. Where does this fit in the current flow?
4. Must-have now or simplified for MVP?

**Result:** Handoff to architecture skill with requirements.

### Example 3: New Project

**User:** "Build a social media app"

**Classification:** New Project (6 questions, 12 min)

**Questions:**
1. What problem are you trying to solve?
2. Who will use this?
3. What scale are we planning for?
4. Authentication requirements?
5. What are the main data entities?
6. Target timeline?

**Result:** Comprehensive context saved, multiple skills triggered.

---

## Configuration

### Customizing Templates

```javascript
// Add custom template
const customTemplates = {
  "my-domain": [
    { id: "q1", text: "Custom question", priority: "P0" },
    { id: "q2", text: "Another question", priority: "P1" }
  ]
};

// Merge with existing
const allTemplates = { ...defaultTemplates, ...customTemplates };
```

### Adjusting Time Budgets

```javascript
const timeBudgets = {
  "Bug Fix": 3,
  "Feature": 8,
  "New Project": 12,
  // Override defaults
};
```

---

## File Structure

```
.agent/
├── skills/
│   └── brainstorming/
│       ├── SKILL.md                    # This file
│       ├── dynamic-questioning.md      # Detailed principles
│       ├── lessons-learned.md          # Improvement log
│       └── context-template.md          # Context file template
├── context/
│   └── brainstorming/
│       ├── 2024-01-15_session-1.md    # Saved sessions
│       └── 2024-01-16_session-2.md
└── components/
    └── BrainstormingWidget.tsx         # React component
```

---

## Metrics & Tracking

**Automatic tracking:**
- Time spent per session
- Questions answered vs skipped
- User engagement level
- Default selection rate
- Conflict detection frequency

**View metrics:**
```bash
# Count sessions
ls .agent/context/brainstorming/ | wc -l

# Average time
grep "Time:" .agent/context/brainstorming/*.md

# Common defaults
grep "Default used:" .agent/context/brainstorming/*.md | sort | uniq -c
```

---

## Anti-Patterns Prevented

| Anti-Pattern | Prevention |
|--------------|------------|
| Jumping to solutions | Classification forces pause |
| Too many questions | Timeboxing enforcement |
| Lost context | Automatic file saving |
| Wrong assumptions | Structured Q&A format |
| Perfect understanding trap | Good enough detection |
| No review | Post-implementation prompt |

---

## Success Criteria

**A successful brainstorming session:**
- ✅ Completed within time budget
- ✅ All P0 questions answered (or defaulted)
- ✅ Context saved to file
- ✅ Visual summary generated
- ✅ Next skill identified
- ✅ User confidence: High or Medium

---

## Next Steps

1. **Install the component:**
   ```bash
   # Copy BrainstormingWidget.tsx to your components folder
   cp .agent/skills/brainstorming/BrainstormingWidget.tsx components/
   ```

2. **Use in your app:**
   ```jsx
   import BrainstormingWidget from "@/components/BrainstormingWidget";
   
   export default function Page() {
     return (
       <BrainstormingWidget
         onComplete={(session) => {
           // Start implementation with full context
           console.log(session);
         }}
       />
     );
   }
   ```

3. **Review sessions:**
   ```bash
   # View all brainstorming history
   cat .agent/context/brainstorming/*.md
   ```

---

**Version:** 2.0  
**Last Updated:** 2024  
**Status:** Production Ready ✅
