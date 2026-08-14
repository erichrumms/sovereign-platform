# AGENT_REFERENCE.md — Recovery Content for v3.10
## Lessons 13-23 import · Project Principal decision, August 13, 2026
## Source: PROJECT_SUMMARY.md Part 7 (June 1, 2026), verbatim

**Decision:** import Lessons 13-23 into `AGENT_REFERENCE.md` at their existing
numbers. Those slots are genuinely empty there. Do NOT renumber either lineage —
that breaks every existing citation.

**Insert between:** the end of Lesson 12's section and the `### Lesson 24` heading.

**Character note, to be recorded in the changelog:** Lessons 1-12 and 24-39 in this
document are session-practice lessons. Lessons 13-23 are platform-design lessons.
That difference is likely why the two lineages diverged. It is recorded rather than
smoothed over.

---

### Lesson 13: Role separation is a design constraint, not a checkbox

Who can read, write, and approve must be in the data model from the start.

### Lesson 14: The intelligence layer of every system is its data model

SOVEREIGN's long-term value is its data — human decision events, deployment
feedback, reasoning traces. Design data models for their downstream consumers from
the start.

### Lesson 15: Production-grade means three things beyond "it works"

Failure handling, observability, and maintainability by the next developer without
access to original conversations.

### Lesson 16: Sandbox constraints are architectural — learn them before you code

Artifact `localStorage` exists but doesn't work. Tailwind bracket syntax fails
silently. These are facts, not bugs.

### Lesson 17: Data constants outside the component, always

Data inside `App` causes re-evaluation on every render. All data constants belong at
module level.

### Lesson 18: Identity color vs. semantic color is the most important design system discipline

Corporate purple is for structural framing only. Using it to signal functional states
makes the UI unreadable.

### Lesson 19: Fix known issues before adding features

Known issues compound. Every version's first session must resolve prior known issues.

### Lesson 20: The Domain Translator pattern is bigger than one product

It solves a problem that exists in multiple contexts. When a component solves a
problem that appears in multiple products, it belongs in the shared platform.

### Lesson 21: Structural replacement is stronger than disabled buttons

When a control matters, make it impossible to violate, not hard to violate.

### Lesson 22: Policy-as-data makes systems context-agnostic

Rules in typed data structures evaluated by pure functions are inspectable, testable,
replaceable. Rule logic embedded in code is expensive to adapt.

### Lesson 23: Reasoning chains at point of decision prevent approver errors

Self-documenting systems at the moment of decision are a design requirement, not a
nice-to-have.

*(Lessons 13-23 recovered in Session 112 from `PROJECT_SUMMARY.md` Part 7, June 1,
2026, by Project Principal decision of August 13, 2026. These numbers had been flagged
as a gap five times, most recently in System Prompt v44, on the belief that the content
existed only in older Integration Brief material. The content existed in the repository
the entire time, in a second lessons lineage using a different heading format. See
`docs/40_Defect_Class_Register.md` §7 for the four-location collision record: `PROJECT_SUMMARY.md`
Lessons 1-12 and 24-30 are DIFFERENT lessons sharing the same numbers, and neither
lineage is renumbered.)*
