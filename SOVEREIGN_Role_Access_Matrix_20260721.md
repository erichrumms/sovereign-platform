# SOVEREIGN Platform — Role Access Matrix
## ARIA Suite Definition + Final Cross-Platform Access Decisions
## Updated to include the Reviewer's Workspace (GD-25)

**Original date:** July 18, 2026 · **Updated:** July 21, 2026
**Prepared by:** Governance Agent, with the Project Principal
**Document type:** The finalized access-control specification — GD-22 was built
directly from this document's original content; this update adds the one
module built since (`module-workspace`, GD-25) that needs the same treatment.
**Status:** Pre-Decisional · Internal Working Document

---

## ARIA Suite — Definition

*(Unchanged from the original — see below. No content in this section
changed; reproduced here so this remains a complete, standalone reference.)*

ARIA is SOVEREIGN's deterministic governance layer — the one part of the platform that guarantees no AI ever touches a decision. Every other product uses AI to draft, analyze, or recommend; ARIA only evaluates fixed rules against fixed inputs, so the same input always produces the same output, and every finding traces to a specific regulation, never a model's judgment. Its role is to be the trust anchor other products lean on when something needs to be provably rule-based, not AI-assisted — most concretely, SCRIBE cannot export a PPBE exhibit until ARIA has certified it.

**CLEAR — Continuous Legal and Regulatory Evaluation and Assessment Review.** Certifies documents against compliance rules before they leave the platform. This is the actual gate SCRIBE's export logic reads — no PPBE exhibit exports without a positive CLEAR certification. Within ARIA, CLEAR is the anchor component: ARC pulls its regulatory source list directly from CLEAR's code, and CPMI-VRS exists in part to prove CLEAR's rule evaluation is genuinely deterministic.

**TRACER — Traceability and Accountability Chain for Evidence Records.** Answers *"why did the platform do X"* by assembling the full chain from a decision, document, or obligation back to its governing regulation. Traces three record types that live elsewhere on the platform: COUNSEL Decision Records, SCRIBE documents and exhibits, and PPBE Obligation Records. The most independent of the four — shares ARIA's visual design, but no logic, with CLEAR or ARC.

**ARC — Adaptive Regulatory Change Engine.** Models what breaks *before* a regulation changes — scoring the impact across every workflow, CLEAR rule, and SCRIBE template tied to that regulation. Routes high-severity findings to COUNSEL for a human adaptation decision and to NEXUS as a tracked action item. Directly depends on CLEAR to know what a proposed change might amend.

**CPMI-VRS (ARIA's own certification tab, distinct from the CPMI module).** ARIA's proof mechanism — confirms CLEAR, TRACER, and ARC each produce identical output on identical input, rather than benchmarking AI accuracy the way CPMI's VRS gates do for the platform's AI-backed products. This is the real technical reason the four components resist being split apart: VRS is the shared proof underneath the other three, not a separate feature that happens to sit next to them.

---

## Role assignment, ARIA — unchanged

| ARIA component | Assigned role | Why |
|---|---|---|
| CLEAR | **COMPLIANCE_OFFICER** | It certifies compliance — this is literally the job description |
| TRACER | **PROGRAM_MANAGER** | Spec's own words: "for federal program managers, this is the audit answer" |
| ARC | **ANALYST** | Modeling and impact-scoring is analytical work by nature |
| CPMI-VRS | *(unchanged)* | A proof mechanism, not a role-facing working tool — stays admin-only |

---

## New — the Reviewer's Workspace (GD-25, `module-workspace`), same treatment ARIA got

Built July 20, this module embeds real, working decision components from
three other modules directly — not summaries, not links out. Its
per-section role assignment isn't new policy — **it exactly inherits each
embedded component's own already-decided access rule**, the same way the
Workspace's module-level gate is the union of everything inside it, matching
ARIA's own established pattern precisely.

| Workspace section | Assigned role | Why |
|---|---|---|
| VIGIL Approvals (embeds `ApprovalDetail`) | **PLATFORM_ADMIN, SYSTEM_ADMIN** | Identical to VIGIL's own module-level gate — the Workspace doesn't loosen or tighten it |
| ARIA Certifications (embeds `ClearCertificationQueue`) | **COMPLIANCE_OFFICER** + admin | Identical to CLEAR's own assignment, above |
| SCRIBE T&T Reviews (embeds `TTManagerReview`) | **PROGRAM_MANAGER, ANALYST** + admin | Identical to SCRIBE's own module-level gate |

**This produces the same kind of coherent story ARIA's breakdown did:** a
Compliance Officer opens the Workspace and sees only their real
certification queue, ready to act on, with no VIGIL or SCRIBE content
visible to them at all — not because the Workspace built a new access
decision, but because it faithfully carries forward three decisions that
were already made, each in its own home module, months apart.

---

## Final Role → Module Access Matrix (all eleven top-level modules)

| Module | Roles with access |
|---|---|
| COUNSEL | PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER, ANALYST, COMPLIANCE_OFFICER, INDEPENDENT_REVIEWER |
| SCRIBE | PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER, ANALYST |
| LENS | All eight roles |
| NEXUS | PLATFORM_ADMIN, SYSTEM_ADMIN, AGENT_OPERATOR, PROGRAM_MANAGER, COMPLIANCE_OFFICER |
| APEX | PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER, ANALYST |
| FLOWPATH | PLATFORM_ADMIN, SYSTEM_ADMIN, AGENT_OPERATOR, ANALYST, PROGRAM_MANAGER |
| VIGIL | PLATFORM_ADMIN, SYSTEM_ADMIN *(unchanged — confirmed intentional)* |
| CPMI | PLATFORM_ADMIN, SYSTEM_ADMIN *(unchanged)* |
| AgentOS | PLATFORM_ADMIN, SYSTEM_ADMIN *(unchanged)* |
| ARIA Suite | *(see per-tab breakdown above — no single module-level answer)* |
| **Reviewer's Workspace** *(new)* | PLATFORM_ADMIN, SYSTEM_ADMIN, COMPLIANCE_OFFICER, PROGRAM_MANAGER, ANALYST *(union of the three sections above — see per-section breakdown)* |

---

## Architecture requirement this originally created — status

The two architectural changes this document originally called for (a role
list instead of single-role matching; ARIA's per-tab gating) were both built
in GD-22, Session 41, and have been the platform's standard access-control
pattern ever since — reused, not reinvented, for `module-workspace`'s own
per-section gating above. Nothing new required by this update; the pattern
this document asked for in July has been the working default for over a
month.

---

*SOVEREIGN Platform · Role Access Matrix · Updated July 21, 2026*
*Originally July 18, 2026 — Addendum to the now-retired Design Recommendations*
*Pre-Decisional · Internal Working Document*
