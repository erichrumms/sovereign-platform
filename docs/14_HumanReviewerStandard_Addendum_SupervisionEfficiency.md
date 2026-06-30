# SOVEREIGN Platform — Human Reviewer Experience Standard
## Addendum: Supervision Efficiency Standard
## docs/14_HumanReviewerStandard_Addendum_SupervisionEfficiency.md

**Version:** 1.0
**Date:** June 29, 2026
**Classification:** Pre-Decisional · Internal Working Document
**Status:** APPROVED — standing design principle, effective immediately
**Append to:** `docs/14_HumanReviewerStandard.md`
**Governing Document:** SOVEREIGN Platform Integration Brief v1.36

---

## 1. Why This Addendum Exists

Walkthrough A established Gap 5 (Human Readability) and Gap 6 (Content Type
Distinction) as platform-wide design standards: every product, every screen, every
walkthrough must produce output a non-technical reviewer can read as plain prose and
orient within five seconds.

Those two standards address whether a reviewer can *understand* what they're looking
at. This addendum addresses a related but distinct question: how much *work* it takes
a reviewer to act on it.

As organizations adopt AI-enabled workflows at scale, a consistent pattern has emerged
across the industry: when an AI system lacks persistent access to the organizational
context a decision requires, the human reviewer absorbs that gap as labor — reconstructing
context every session, re-verifying outputs the system should have gotten right the
first time, and assembling the supporting information that should have already been
present at the point of decision. This labor is real, it is costly, and it is almost
never measured.

SOVEREIGN's architecture already minimizes this by design: the shared data dictionary,
registered agent identities, the Logger's `workflow_step_id` traceability, COUNSEL's
structured Decision Records, and VIGIL's structural human-in-the-loop enforcement all
reduce the reconstruction and verification burden that drives this hidden labor in
less-governed environments. This addendum makes that minimization an explicit,
measurable design standard — not an incidental byproduct.

**The standard established here applies to every product, every screen a human
reviewer acts on, and every future Walkthrough — the same standing scope as Gap 5
and Gap 6.**

---

## 2. The Supervision Efficiency Standard

**Definition.** Supervision Efficiency is the inverse of Review Burden: the total
human time and effort required to understand, verify, and act on a system-presented
decision point. A screen with high Supervision Efficiency requires the reviewer to
reconstruct nothing, re-verify nothing the system already knows, and assemble nothing
the system could have surfaced proactively.

**The standard, in three parts:**

### 2.1 — Context Must Be Surfaced, Not Retrieved

Any information a reviewer needs to make a decision must be present at the point of
decision — not behind a separate tab, a generated export, or a request the reviewer
must initiate. If a reviewer must click away from the decision screen to understand
the decision, that is a Supervision Efficiency failure, regardless of whether the
information is technically "available somewhere in the platform."

**Applies to:** Every approval brief, every reasoning chain output, every certification
queue item, every alert. The relevant program state, the most recent governance
decision on record, and the specific finding that triggered the review must appear
on the same screen as the action the reviewer is asked to take.

### 2.2 — Verification Cost Must Be Visible, Not Assumed

When a system's confidence in its own output is degraded — a static fallback fired,
a reasoning chain ran on partial data, a regulatory source could not be loaded — that
degradation must be disclosed on the same screen, in the same plain prose required by
Gap 5, so the reviewer's verification effort can be calibrated to the actual reliability
of what they're reviewing. A reviewer should never have to discover degraded confidence
by noticing an anomaly themselves.

**Applies to:** CPMI static fallback states, CLEAR certifications based on incomplete
regulatory source loading, any AI-generated draft where the underlying data was partial.

**What this standard explicitly does not require:** Engagement-verification mechanisms
that add friction to the reviewer's own process — minimum time-on-screen requirements,
forced re-reading delays, or any mechanism that treats the reviewer as the source of
risk rather than supporting their judgment. The standard governs what the system
discloses, not how it polices the human. SOVEREIGN's existing decision-note requirement
(minimum 10 characters, VIGIL and CLEAR) remains the platform's mechanism for ensuring
a reviewer has recorded their reasoning — this addendum does not add a second,
heavier-handed mechanism on top of it.

### 2.3 — Repeated Reconstruction Is a Design Defect

If a reviewer must re-supply the same context — the program identifier, the prior
decision history, the applicable policy — more than once across a single workflow,
that repetition is a design defect to be fixed, not a training issue for the reviewer
to absorb. The platform's shared data dictionary and registered agent identities exist
precisely so this never has to happen; any screen that asks a reviewer to re-enter
context the platform already has access to violates this standard.

---

## 3. How This Differs From Gap 5 and Gap 6

| Standard | Question It Answers |
|---|---|
| Gap 5 — Human Readability | Can the reviewer understand what they're reading? |
| Gap 6 — Content Type Distinction | Can the reviewer tell what kind of information this is? |
| **Supervision Efficiency (this addendum)** | **Does the reviewer have to do unnecessary work to act on it?** |

A screen can pass Gap 5 and Gap 6 — clear plain prose, properly color-coded — and still
fail Supervision Efficiency if the reviewer must leave the screen to find the context
that should have been there from the start. All three standards apply together. None
substitutes for another.

---

## 4. Measurement — What Makes This Standard Verifiable

A standard that cannot be measured cannot be enforced. The following metrics are
derivable from existing Logger events — no new event types, no shell-contract change —
and should be treated as first-order analytics deliverables wherever APEX's analytics
scope is next extended:

| Metric | Derived From | What It Reveals |
|---|---|---|
| Decision time per task type | VIGIL approval queue entry timestamp → decision timestamp | Whether review time is proportional to decision complexity or inflated by missing context |
| Draft revision rate | SCRIBE export events vs. subsequent edit events | Whether AI-generated drafts require substantial rework before use |
| Reasoning re-run rate | CPMI Logger events for repeated runs on the same program/query | Whether reviewers are re-running analysis because the first output lacked needed context |
| Context re-entry events | Repeated identical context fields supplied across a single reviewer session | Direct measurement of standard 2.3 violations |
| Degraded-confidence disclosure rate | CPMI/CLEAR static fallback or partial-source events vs. whether the disclosure appeared on the decision screen | Direct measurement of standard 2.2 compliance |

These metrics support the platform's broader positioning: SOVEREIGN's governance
architecture and its operational efficiency are not competing priorities. The same
shared-context layer that produces the audit trail is the layer that eliminates
unnecessary reconstruction labor. Measuring Supervision Efficiency makes that claim
demonstrable rather than asserted.

---

## 5. Walkthrough Validation — Standing Requirement

Effective immediately, no product passes its Walkthrough validation if:

- A decision screen requires the reviewer to navigate away to obtain context needed
  for the decision in front of them (standard 2.1)
- A degraded-confidence output is presented without disclosure of that degradation
  on the same screen (standard 2.2)
- A reviewer is asked to re-supply context the platform already holds, more than
  once in a single workflow (standard 2.3)

This is the same enforcement posture as Gap 5 and Gap 6: a platform-wide standard,
checked at every Walkthrough, not a one-time fix.

**Walkthrough D (Stage 6 — ARIA Suite) is the first Walkthrough this standard applies
to formally.** CLEAR, TRACER, and ARC should each be evaluated against all three
standards in §2 alongside Gap 5 and Gap 6.

---

## 5a. Extension of the Per-Architecture-Spec Requirement (§8 of the base document)

The base standard (§8) requires every architecture specification document
(`docs/NN_ProductName_Architecture.md`) to include a Gap 5 / Gap 6 compliance
section translating the platform-wide standards into product-specific
implementation requirements.

This addendum extends that requirement: every architecture specification document
authored from this point forward must also include a Supervision Efficiency
compliance section, addressing the same three standards in §2 above in
product-specific terms — what context must be surfaced inline for this product's
decision screens, what degraded-confidence states this product can produce and how
they are disclosed, and what context this product's reviewers would otherwise have
to re-supply across a session.

**Retroactive note:** `docs/16_ARIA_Suite_Architecture.md` was authored before this
addendum existed and does not contain a Supervision Efficiency section for CLEAR,
TRACER, or ARC. This is not a build-blocking gap — CLEAR is already live as of
Session 23. The Supervision Efficiency section for ARIA Suite should be added to
`docs/16` as a documentation update before Walkthrough D, consistent with how Gap
5/6 retroactive application was handled for the companion suite in §4 of the base
document. This is a documentation task, not a code change, and does not require a
build session of its own — it can be folded into the documentation pass ahead of
Walkthrough D.

---

## 6. What This Addendum Does Not Authorize

This addendum is a design standard, not a build specification. It does not:

- Pre-approve any shell-contract change
- Register any new agent
- Approve any new prompt
- Commit to a specific build session or timeline

Where applying this standard requires a build action — for example, adding the
metrics in §4 to APEX's analytics scope, or redesigning a VIGIL approval brief to
surface context inline per standard 2.1 — that action is scoped and authorized
through the normal session protocol, like any other build work.

---

## 7. Relationship to Future Work

Two items considered alongside this addendum were deliberately **not** incorporated
here, and are logged separately for future governance sessions rather than folded
into a standing standard:

**Active context surfacing as a first-order APEX deliverable** (extending DC-2/DC-3
beyond export into proactive in-context display) is a specific build scope decision
for whenever APEX's analytics spec is next revisited — not a standing principle.
This addendum's standard 2.1 establishes *why* that scoping direction is correct;
the actual APEX build scoping remains a separate governance decision.

**LENS as an active context layer** — surfacing relevant program and reviewer history
before an agent runs or a human acts — remains a Stage 8 / Intelligence Layer planning
consideration. It is the long-term architectural answer to standard 2.3 at platform
scale, but is not actionable in current build sequencing.

---

*Human Reviewer Experience Standard — Addendum: Supervision Efficiency Standard*
*Version 1.0 · June 29, 2026 · Project Principal approved*
*Pre-Decisional · Internal Working Document*
*Append to docs/14_HumanReviewerStandard.md*
