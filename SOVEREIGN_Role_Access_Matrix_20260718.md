# SOVEREIGN Platform — Role Access Matrix
## ARIA Suite Definition + Final Cross-Platform Access Decisions

**Date:** July 18, 2026
**Prepared by:** Governance Agent, with the Project Principal
**Document type:** Addendum to `SOVEREIGN_Design_Recommendations_20260718.md` (DR-1) — this is the finalized specification, not a proposal
**Status:** Pre-Decisional · Internal Working Document

---

## ARIA Suite — Definition

ARIA is SOVEREIGN's deterministic governance layer — the one part of the platform that guarantees no AI ever touches a decision. Every other product uses AI to draft, analyze, or recommend; ARIA only evaluates fixed rules against fixed inputs, so the same input always produces the same output, and every finding traces to a specific regulation, never a model's judgment. Its role is to be the trust anchor other products lean on when something needs to be provably rule-based, not AI-assisted — most concretely, SCRIBE cannot export a PPBE exhibit until ARIA has certified it.

**CLEAR — Continuous Legal and Regulatory Evaluation and Assessment Review.** Certifies documents against compliance rules before they leave the platform. This is the actual gate SCRIBE's export logic reads — no PPBE exhibit exports without a positive CLEAR certification. Within ARIA, CLEAR is the anchor component: ARC pulls its regulatory source list directly from CLEAR's code, and CPMI-VRS exists in part to prove CLEAR's rule evaluation is genuinely deterministic.

**TRACER — Traceability and Accountability Chain for Evidence Records.** Answers *"why did the platform do X"* by assembling the full chain from a decision, document, or obligation back to its governing regulation. Traces three record types that live elsewhere on the platform: COUNSEL Decision Records, SCRIBE documents and exhibits, and PPBE Obligation Records. The most independent of the four — shares ARIA's visual design, but no logic, with CLEAR or ARC.

**ARC — Adaptive Regulatory Change Engine.** Models what breaks *before* a regulation changes — scoring the impact across every workflow, CLEAR rule, and SCRIBE template tied to that regulation. Routes high-severity findings to COUNSEL for a human adaptation decision and to NEXUS as a tracked action item. Directly depends on CLEAR to know what a proposed change might amend.

**CPMI-VRS (ARIA's own certification tab, distinct from the CPMI module).** ARIA's proof mechanism — confirms CLEAR, TRACER, and ARC each produce identical output on identical input, rather than benchmarking AI accuracy the way CPMI's VRS gates do for the platform's AI-backed products. This is the real technical reason the four components resist being split apart: VRS is the shared proof underneath the other three, not a separate feature that happens to sit next to them.

---

## Role assignment, derived directly from the above

| ARIA component | Assigned role | Why |
|---|---|---|
| CLEAR | **COMPLIANCE_OFFICER** | It certifies compliance — this is literally the job description |
| TRACER | **PROGRAM_MANAGER** | Spec's own words: "for federal program managers, this is the audit answer" |
| ARC | **ANALYST** | Modeling and impact-scoring is analytical work by nature |
| CPMI-VRS | *(unchanged)* | A proof mechanism, not a role-facing working tool — stays admin-only |

**This produces a real, coherent workflow, worth naming explicitly since it's a strong demo story:** an Analyst drafts a PPBE exhibit in SCRIBE → a Compliance Officer certifies it in ARIA's CLEAR → a Program Manager traces its full chain of authority in ARIA's TRACER before signing off on export. Three distinct roles, three distinct tools, one governed workflow — exactly the kind of thing worth walking a CTO through directly.

---

## Final Role → Module Access Matrix (all ten top-level modules)

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
| **ARIA Suite** | *(see per-tab breakdown above — no longer a single module-level answer)* |

---

## Architecture requirement this creates — for Session 41's scope

Two changes to the access-control layer, not just data entry:

1. **`minimumRole` needs to become a role list, not a single exact-match role.** The current check (`auth.hasRole("SYSTEM_ADMIN") || auth.hasRole(minimumRole)`) can only ever admit one specific role plus the superuser clause. Every row above needs a list.
2. **ARIA specifically needs per-tab gating, not one module-level gate.** Every other module's access decision is uniform across the whole module; ARIA's is not — CLEAR, TRACER, and ARC each need a different role, and CPMI-VRS needs to stay more restricted than any of them. This is a real, distinct piece of scope beyond the role-list change.

The DEV persona toggle also needs to expand from two roles (SYSTEM_ADMIN, PROGRAM_MANAGER) to all eight, so every row in this matrix is actually demoable, not just the two tested so far.

---

*SOVEREIGN Platform · Role Access Matrix · July 18, 2026*
*Addendum to SOVEREIGN_Design_Recommendations_20260718.md*
*Pre-Decisional · Internal Working Document*
