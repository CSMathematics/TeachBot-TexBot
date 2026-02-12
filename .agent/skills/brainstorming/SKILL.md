---
name: brainstorming
description: Socratic questioning protocol + user communication. MANDATORY for complex requests, new features, or unclear requirements. Includes progress reporting, error handling, request classification, timeboxing, and context persistence.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Brainstorming & Communication Protocol v2.0

> **MANDATORY:** Use for complex/vague requests, new features, updates, or any request requiring clarification.
> 
> **GOAL:** Maximize understanding in minimum time through strategic questioning.

---

## 🎯 QUICK START: Request Classification

**First 30 seconds:** Classify the request to determine question depth.

| Request Pattern | Question Depth | Time Budget | Example |
|----------------|----------------|-------------|---------|
| **"Fix bug in X"** | 1-2 questions | 2-3 min | "What's the error message?" |
| **"Add feature Y"** | 3-5 questions | 5-8 min | Purpose, users, constraints |
| **"Build new app"** | 5-8 questions | 10-15 min | Full architecture needed |
| **"Refactor Z"** | 2-3 questions | 3-5 min | Why refactor? What's broken? |
| **"Update/improve"** | 2-4 questions | 4-6 min | What specifically? Why? |
| **"Help with..."** | 1-3 questions | 2-5 min | Current state, goal state |

**Decision:** If unclear after 30 seconds → Default to "Add feature" level (3-5 questions)

---

## 🛑 SOCRATIC GATE (ENFORCEMENT)

### When to Trigger

| Pattern | Action |
|---------|--------|
| "Build/Create/Make [thing]" without details | 🛑 ASK 3 questions |
| Complex feature or architecture | 🛑 Clarify before implementing |
| Update/change request | 🛑 Confirm scope |
| Vague requirements | 🛑 Ask purpose, users, constraints |
| "All" / "Everything" requests | 🛑 Prioritize with user |

### 🚫 MANDATORY: Questions Before Implementation

1. **STOP** - Do NOT start coding
2. **CLASSIFY** - Determine request type (see Quick Start above)
3. **ASK** - Generate questions based on classification
4. **WAIT** - Get response before proceeding (unless timeboxed)

---

## ⏱️ TIMEBOXING RULES

**Principle:** Questions have diminishing returns. Stop when good enough.

### Question Budget by Complexity

| Complexity | Max Questions | Time Limit | Proceed If Silent |
|------------|---------------|--------------|-------------------|
| Simple fix | 2 questions | 3 minutes | After 1 question |
| Feature | 4 questions | 8 minutes | After 2 questions |
| New project | 6 questions | 12 minutes | After 3 questions |
| Refactor | 3 questions | 5 minutes | After 2 questions |

### Timebox Enforcement

```
IF time_limit_reached AND not_all_questions_answered:
    1. Summarize what we know
    2. List assumptions being made
    3. Proceed with defaults
    4. Note: "We can adjust later based on what you see"
```

---

## 🧠 Dynamic Question Generation

**⛔ NEVER use static templates.** Read `dynamic-questioning.md` for detailed principles.

### Core Principles

| Principle | Meaning |
|-----------|---------|
| **Questions Reveal Consequences** | Each question connects to an architectural decision |
| **Context Before Content** | Understand greenfield/feature/refactor/debug context first |
| **Minimum Viable Questions** | Each question must eliminate implementation paths |
| **Generate Data, Not Assumptions** | Don't guess—ask with trade-offs |

### Question Generation Process

```
1. Parse request → Extract domain, features, scale indicators
2. Identify decision points → Blocking vs. deferable
3. Generate questions → Priority: P0 (blocking) > P1 (high-leverage) > P2 (nice-to-have)
4. Format with trade-offs → What, Why, Options, Default
```

### Question Format (MANDATORY)

```markdown
### [PRIORITY] **[DECISION POINT]**

**Question:** [Clear question]

**Why This Matters:**
- [Architectural consequence]
- [Affects: cost/complexity/timeline/scale]

**Options:**
| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| A | [+] | [-] | [Use case] |

**If Not Specified:** [Default + rationale]
```

**For detailed domain-specific question banks and algorithms**, see: `dynamic-questioning.md`

---

## 🤷 WHEN USER DOESN'T KNOW

**Common Scenario:** User says "I don't know" or "Whatever you think is best"

### Response Options

#### Option A: Default + Explain (Recommended)
```
"I'll proceed with [DEFAULT]. Here's why: [REASONING]. 
You can change this later by [HOW TO CHANGE]."
```

#### Option B: Simplify
```
"Let me rephrase: [SIMPLER VERSION]

For example:
• Option 1: [Concrete example]
• Option 2: [Concrete example]

Which feels closer to what you need?"
```

#### Option C: Discovery Mode
```
"I'll build a minimal version first so you can see what decisions need to be made. 
Then we can adjust based on what you see."
```

### Default Selection Criteria

Choose default based on:
1. **Fastest to implement** (for MVPs)
2. **Easiest to change later** (for iterations)
3. **Industry standard** (for production)
4. **Your expertise** (what you know best)

---

## 💾 CONTEXT PERSISTENCE

**Principle:** Don't lose progress. Save brainstorming context for future reference.

### Save Location
```
.agent/context/
  └── brainstorming/
      └── [YYYY-MM-DD]_[session-id].md
```

### Context File Format

```markdown
# Brainstorming Context: [Brief Description]
**Date:** [YYYY-MM-DD]
**Request:** [Original user request]

## Questions Asked

### 1. [Question]
**Answer:** [User response]
**Decision:** [What we decided]

## Key Decisions Made
- [Decision 1]: [Choice] → [Rationale]
- [Decision 2]: [Choice] → [Rationale]

## Assumptions
- [Assumption 1] (Risk: High/Medium/Low)
- [Assumption 2] (Risk: High/Medium/Low)

## Defaults Used
- [Default 1]: [Why]
- [Default 2]: [Why]

## Next Steps
1. [Action item]
2. [Action item]

## Confidence Level
[High/Medium/Low] - [Why]
```

### When to Save
- After every brainstorming session
- Before starting implementation
- When user says "let's continue later"

---

## ⚠️ CONFLICT DETECTION

**Red Flags:** Contradictory requirements that will cause problems later.

### Common Conflicts

| Conflict | Detection | Resolution |
|----------|-----------|------------|
| **"Fast AND comprehensive"** | Speed vs. thoroughness | Ask: "Which matters more for this phase?" |
| **"Simple AND enterprise-grade"** | Complexity contradiction | Ask: "What scale are we targeting initially?" |
| **"Cheap AND high-performance"** | Cost vs. quality | Ask: "What's the budget range?" |
| **"Do everything at once"** | Scope explosion | Ask: "What are the top 3 priorities?" |
| **"Perfect from day one"** | Premature optimization | Ask: "Can we iterate, or does this need to be final?" |

### Resolution Pattern

```
1. FLAG: "I notice a potential tension between [X] and [Y]"
2. EXPLAIN: "Typically these trade off because [REASON]"
3. OFFER: "We could: [Option A] or [Option B]"
4. ASK: "Which direction feels right for your situation?"
```

---

## ✅ GOOD ENOUGH DETECTION

**Principle:** Perfect understanding is impossible. Stop when you can proceed.

### Good Enough Criteria

Stop asking when ALL are true:
- ✅ Can write first line of code
- ✅ Understand problem scope
- ✅ Know success criteria
- ✅ Identified main risks
- ✅ Have fallback plan

### Good Enough Checklist

```markdown
## Pre-Implementation Checklist

**Scope Understanding**
- [ ] What problem are we solving?
- [ ] Who will use this?
- [ ] What does "done" look like?

**Technical Clarity**
- [ ] Where does this fit in the codebase?
- [ ] Any dependencies to consider?
- [ ] What's the simplest version that works?

**Risk Awareness**
- [ ] What could go wrong?
- [ ] Do we have a rollback plan?
- [ ] Are there any irreversible decisions?

**If 5+ checked → PROCEED**
**If <5 checked → Ask 1-2 more questions**
```

---

## 📊 VISUAL SUMMARY GENERATION

**After brainstorming, generate a summary card:**

```
┌─ BRAINSTORMING SUMMARY ─────────────────┐
│ Request: [Brief description]             │
│ Complexity: [Simple/Feature/Project]    │
│                                          │
│ Key Decisions:                           │
│ • [Decision 1] → [Choice]                │
│ • [Decision 2] → [Choice]                │
│                                          │
│ Assumptions:                             │
│ • [Assumption 1]                         │
│                                          │
│ Next Step: [Specific first action]       │
│ Confidence: [High/Medium/Low]            │
│ Time Budget: [X] minutes                 │
└─────────────────────────────────────────┘
```

---

## 🔄 HANDOFF TO OTHER SKILLS

After brainstorming, check if other skills should be triggered:

| If Brainstorming Revealed... | Trigger Skill | Include in Handoff |
|------------------------------|---------------|-------------------|
| Structural decisions | `architecture` | "Based on decisions: [X, Y, Z]" |
| Quality requirements | `testing-patterns` | "Quality needs: [requirements]" |
| UI/UX is critical | `ui-ux-pro-max` | "User experience priority: [details]" |
| Scale discussed | `performance-profiling` | "Scale considerations: [numbers]" |
| Security concerns | `vulnerability-scanner` | "Security requirements: [list]" |
| Database schema | `database-design` | "Data model needs: [entities]" |

### Handoff Format

```markdown
## Handoff from Brainstorming

**Original Request:** [Brief description]
**Brainstorming Session:** [Link to context file]

**Key Decisions Made:**
1. [Decision] → [Impact]
2. [Decision] → [Impact]

**Assumptions to Validate:**
- [Assumption 1]
- [Assumption 2]

**Constraints:**
- [Constraint 1]
- [Constraint 2]

**Recommended Next Skill:** [Skill name]
```

---

## 📋 COMMON REQUEST TEMPLATES

Pre-built question sets for repetitive requests:

### Template: "Add CRUD API"
Questions:
1. **Authentication:** Does this API need auth? (Yes → Which auth method?)
2. **Relationships:** Any related entities to include?
3. **Validation:** What fields are required?

Time budget: 3 minutes

### Template: "Fix Styling Issue"
Questions:
1. **Visual:** Can you share a screenshot or describe what you see?
2. **Expected:** What should it look like?
3. **Scope:** Just this page or global?

Time budget: 2 minutes

### Template: "Deploy to Production"
Questions:
1. **Platform:** Where are we deploying? (Vercel/AWS/Other)
2. **Domain:** Custom domain or default?
3. **Environment variables:** Any secrets to configure?

Time budget: 3 minutes

### Template: "Add New Feature"
Questions:
1. **Purpose:** What problem does this solve?
2. **Users:** Who will use this feature?
3. **Integration:** Where does it fit in the existing flow?
4. **Priority:** Must-have or nice-to-have?

Time budget: 5 minutes

### Template: "Refactor Code"
Questions:
1. **Motivation:** Why refactor? (Performance? Maintainability? Bug?)
2. **Scope:** Specific file or broader pattern?
3. **Risk:** Any parts that must not break?
4. **Tests:** Are there tests we can rely on?

Time budget: 4 minutes

---

## 📈 POST-IMPLEMENTATION REVIEW

**5-Minute Retrospective after completion:**

### Review Questions

```markdown
## Brainstorming Retrospective

**What Worked Well:**
- Which questions were most valuable?
- What did we learn that was unexpected?

**What to Improve:**
- What questions didn't matter?
- What did we miss that we should have asked?

**Default Accuracy:**
- Were the defaults we chose correct?
- Should any defaults be adjusted?

**Time Budget:**
- Did we spend the right amount of time?
- Should classification be adjusted?

**Action Items:**
- [ ] Update question bank
- [ ] Adjust default recommendations
- [ ] Update templates
```

### Update `.agent/skills/brainstorming/lessons-learned.md`

```markdown
## [YYYY-MM-DD] Session: [Brief description]

**Request Type:** [Classification]
**Time Spent:** [X] minutes
**Questions Asked:** [N]

**Insights:**
- [Insight 1]
- [Insight 2]

**Adjustments Made:**
- [Change 1]
- [Change 2]
```

---

## 📊 Progress Reporting (PRINCIPLE-BASED)

**PRINCIPLE:** Transparency builds trust. Status must be visible and actionable.

### Status Board Format

| Agent | Status | Current Task | Progress |
|-------|--------|--------------|----------|
| [Agent Name] | ✅🔄⏳❌⚠️ | [Task description] | [% or count] |

### Status Icons

| Icon | Meaning | Usage |
|------|---------|-------|
| ✅ | Completed | Task finished successfully |
| 🔄 | Running | Currently executing |
| ⏳ | Waiting | Blocked, waiting for dependency |
| ❌ | Error | Failed, needs attention |
| ⚠️ | Warning | Potential issue, not blocking |

---

## 🛠️ Error Handling (PRINCIPLE-BASED)

**PRINCIPLE:** Errors are opportunities for clear communication.

### Error Response Pattern

```
1. Acknowledge the error
2. Explain what happened (user-friendly)
3. Offer specific solutions with trade-offs
4. Ask user to choose or provide alternative
```

### Error Categories

| Category | Response Strategy |
|----------|-------------------|
| **Port Conflict** | Offer alternative port or close existing |
| **Dependency Missing** | Auto-install or ask permission |
| **Build Failure** | Show specific error + suggested fix |
| **Unclear Error** | Ask for specifics: screenshot, console output |
| **User Unavailable** | Proceed with defaults, note assumptions |
| **Contradictory Requirements** | Flag conflict, ask for priority |

---

## 🎉 Completion Message (PRINCIPLE-BASED)

**PRINCIPLE:** Celebrate success, guide next steps.

### Completion Structure

```
1. Success confirmation (celebrate briefly)
2. Summary of what was done (concrete)
3. How to verify/test (actionable)
4. Next steps suggestion (proactive)
5. Context saved to: [location]
```

---

## 🗣️ Communication Principles

| Principle | Implementation |
|-----------|----------------|
| **Concise** | No unnecessary details, get to point |
| **Visual** | Use emojis (✅🔄⏳❌) for quick scanning |
| **Specific** | "~2 minutes" not "wait a bit" |
| **Alternatives** | Offer multiple paths when stuck |
| **Proactive** | Suggest next step after completion |
| **Time-Aware** | Show time budget and progress |
| **Context-Saving** | Always save brainstorming context |

---

## 🚫 Anti-Patterns (AVOID)

| Anti-Pattern | Why | What To Do Instead |
|--------------|-----|-------------------|
| Jumping to solutions before understanding | Wastes time on wrong problem | Classify first, ask questions |
| Assuming requirements without asking | Creates wrong output | Generate questions with trade-offs |
| Over-engineering first version | Delays value delivery | Timebox, use defaults |
| Ignoring constraints | Creates unusable solutions | Ask about constraints explicitly |
| "I think" phrases | Uncertainty → Ask instead | "Based on [evidence], I recommend [X]" |
| Asking too many questions | User fatigue, diminishing returns | Timebox, proceed with defaults |
| Not saving context | Lose progress, re-ask same questions | Save to `.agent/context/` |
| Perfect understanding trap | Never start coding | Use Good Enough criteria |

---

## 📚 Version History

- **v2.0** (Current): Added request classification, timeboxing, context persistence, conflict detection, good enough criteria, visual summaries, skill integration, templates, and post-implementation review
- **v1.0**: Original Socratic questioning protocol with dynamic question generation

---

**Quick Reference Card:**
```
1. CLASSIFY request (30 sec)
2. CHECK time budget
3. ASK priority questions
4. SAVE context
5. PROCEED when good enough
```
