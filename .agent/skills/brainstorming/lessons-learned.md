# Brainstorming Lessons Learned

> Continuous improvement log for the brainstorming skill.
> Update after each significant session with insights and adjustments.

---

## Format for New Entries

```markdown
## [YYYY-MM-DD] Session: [Brief description]

**Request Type:** [Classification]
**Time Spent:** [X] minutes
**Questions Asked:** [N]
**User Engagement:** [High/Medium/Low]

**What Worked:**
- [Specific question that revealed key info]
- [Approach that user responded well to]

**What Didn't Work:**
- [Question that confused user]
- [Assumption that was wrong]

**Surprises:**
- [Unexpected requirement]
- [Hidden complexity discovered]

**Adjustments to Make:**
- [ ] Update question bank
- [ ] Adjust default recommendations
- [ ] Update templates
- [ ] Change time budget for this type

**Template Improvements:**
- [Specific changes to templates]
```

---

## Session Log

*[Sessions will be added here as they occur]*

---

## Aggregated Insights

### Question Effectiveness

**Most Valuable Questions (by domain):**

| Domain | Question | Why It Works |
|--------|----------|--------------|
| E-commerce | "Single or multi-vendor?" | Immediately changes architecture |
| Auth | "Social login needed?" | Cuts dev time in half if no |
| Real-time | "Expected concurrent users?" | Determines infrastructure needs |
| CMS | "Draft/publish workflow?" | Reveals complexity early |

**Least Valuable Questions:**

| Question | Problem | Replacement |
|----------|---------|-------------|
| "What color scheme?" | Too detailed early | Defer to UI/UX skill |
| "Exact user count?" | User doesn't know | "Order of magnitude?" |
| "Preferred tech stack?" | Premature | "Any constraints on tech?" |

### Default Accuracy

**Defaults That Work Well:**
- Clerk for auth (fastest for MVP)
- Cloudinary for image storage (balanced)
- Follow-only feeds for social apps (simple)
- Polling for real-time (defer WebSocket until scale)

**Defaults That Need Adjustment:**
- *[To be populated as we learn]*

### Time Budget Accuracy

**Underestimated:**
- *[To be populated]*

**Overestimated:**
- *[To be populated]*

---

## Pattern Library

### Common User Phrases & What They Mean

| User Says | Usually Means | Clarifying Question |
|-----------|---------------|---------------------|
| "Simple" | "I don't know complexity" | "What does simple look like to you?" |
| "Like X but different" | Clone with modifications | "What specifically is different?" |
| "As soon as possible" | No clear deadline | "What happens if it's next week vs next month?" |
| "Professional looking" | Subjective quality | "Can you show me an example of professional?" |
| "User-friendly" | Unclear UX | "Who are the users and what's their tech comfort?" |
| "Scalable" | Future-proofing | "What scale are we planning for?" |
| "Secure" | Compliance needs | "Any specific security requirements or compliance?" |

---

## Updated Templates

*[Templates will be refined here based on experience]*

### Template: "Add Feature" (Refined)

**Original:** 4 questions, 5 minutes
**Refined:** 3 questions, 4 minutes

1. **Purpose:** What problem does this solve?
2. **Integration:** Where does it fit in the current flow?
3. **Priority:** Must-have now or can it be simplified for MVP?

*Rationale:* Users often can't answer "Who will use this" until they see it.

---

## Skill Integration Learnings

**When to Handoff (confirmed patterns):**

| Trigger Condition | Target Skill | Success Rate |
|-------------------|--------------|--------------|
| Database schema mentioned | database-design | High |
| "Make it look good" | ui-ux-pro-max | High |
| Performance numbers given | performance-profiling | Medium |
| Security requirements | vulnerability-scanner | High |
| Testing strategy discussed | testing-patterns | Medium |

**When NOT to Handoff:**
- Simple CRUD operations (stay in brainstorming)
- Bug fixes (use debugging skill directly)
- Documentation (use documentation skill directly)

---

*Last Updated: [Will be updated after each session]*
