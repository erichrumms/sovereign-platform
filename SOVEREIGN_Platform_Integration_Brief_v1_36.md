# SOVEREIGN Platform Integration Brief
## Version 1.36 | June 29, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.35
**Changed this version:** Supervision Efficiency Standard established as platform-wide
standing design principle (addendum to Human Reviewer Experience Standard) ·
no build scope changes · §6, §13, §16, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
Verify shell-contract.ts SHA-256 matches the v1.15 hash of record.
Verify agent count in Agent_Identity_Standard.md by counting the file directly.
Expected: 44.

**This version makes no change to build scope, shell contract, or agent registry.**
It establishes a governance standard only — see §6.

---

## §2 — Platform Definition

*(unchanged from v1.35)*

---

## §3 — Three Shared Infrastructure Layers

*(unchanged from v1.35)*

---

## §4 — The SOVEREIGN Portfolio Pipeline

*(unchanged from v1.35)*

---

## §5 — Governance Role Assignments (Permanent)

*(unchanged from v1.35)*

---

## §6 — Standing Development Constraints (Invariant)

*(Constraints 1–11 unchanged from v1.35 — see prior version for full text and
codebase facts. Adding one new standing principle below, alongside Gap 5/Gap 6.)*

**Supervision Efficiency Standard — established June 29, 2026, effective immediately:**

A platform-wide design standard, equal in standing to Gap 5 (Human Readability) and
Gap 6 (Content Type Distinction). Full specification in
`docs/14_HumanReviewerStandard_Addendum_SupervisionEfficiency.md`. Summary:

1. **Context must be surfaced, not retrieved** — information needed for a decision
   must appear on the decision screen itself, not behind a separate tab or export.
2. **Verification cost must be visible, not assumed** — degraded confidence (static
   fallbacks, partial data) must be disclosed on the same screen as the output.
3. **Repeated reconstruction is a design defect** — a reviewer should never have to
   re-supply context the platform already holds, more than once per workflow.

This standard does **not** authorize engagement-verification mechanisms that add
friction to reviewer process (e.g., minimum time-on-screen gates). It governs system
disclosure, not reviewer policing. The existing decision-note requirement (VIGIL,
CLEAR — minimum 10 characters) remains the platform's sole mechanism for recording
reviewer reasoning.

**No shell-contract change. No new agents. No new prompts.** This is a design
standard for future and existing screen design — applied the same way Gap 5/6 are
applied: checked at every Walkthrough, starting formally with Walkthrough D.

**Measurement (future APEX scope, not current build):** Five metrics — decision time
per task type, draft revision rate, reasoning re-run rate, context re-entry events,
degraded-confidence disclosure rate — all derivable from existing Logger events.
No new event types required. To be added to APEX's analytics scope whenever that
spec is next revisited; not a Session 24 or Stage 6 deliverable.

---

## §7 — CPMI Enhanced Monitoring

*(unchanged from v1.35)*

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── ...                                ← unchanged from v1.35
└── docs/
    ├── 13_APEX_Architecture.md
    ├── 14_HumanReviewerStandard.md
    ├── 14_HumanReviewerStandard_Addendum_SupervisionEfficiency.md  ← NEW
    ├── 15_FLOWPATH_Architecture.md
    ├── 16_ARIA_Suite_Architecture.md
    └── 17_TimeAndTravel_Architecture.md
```

---

## §9 — Intelligence Layer Exposure Requirements

*(unchanged from v1.35)*

---

## §10 — Shared Data Dictionary

*(unchanged from v1.35)*

---

## §11 — Current Build Status

*(unchanged from v1.35 — Session 23 retry complete, Session 24 next: TRACER core.
This Brief version makes no change to build status.)*

---

## §12 — Risk Register

*(unchanged from v1.35)*

---

## §13 — Open Governance Items

**CLOSED this version:**
- Supervision Efficiency Standard — ESTABLISHED June 29, 2026 (standing principle,
  no build action required)

**Open items (unchanged from v1.35, plus):**

| ID | Item | Target |
|---|---|---|
| SES-APEX | Add Supervision Efficiency metrics (§6) to APEX analytics scope | Future APEX spec revision — not current |
| SES-CONTEXT | Active context surfacing for DC-2/DC-3 (reframe from export-only to proactive display) | Future APEX spec revision — not current |
| SES-LENS | LENS as active context layer | Stage 8 / Intelligence Layer planning |
| SES-WALKTHROUGH-D | Apply Supervision Efficiency Standard formally at Walkthrough D alongside Gap 5/6 | Walkthrough D (after Session 25) |

**All other open items unchanged from v1.35** — see that version for WC-6, F-2, F-3,
PPBE-SPEC, PPBE-PROMPTS, TT-PROMPTS, TT-GD.

---

## §14 — SBOM Status

*(unchanged from v1.35 — no code changes this version)*

---

## §15 — Session Protocol (Every Session Without Exception)

*(unchanged from v1.35 — Session 24 opening priorities remain TRACER core as
already scoped. This version adds no new session-open requirement.)*

---

## §16 — Level 1 Walkthrough Protocol (Standing Requirement)

| Walkthrough | After Session | Stage | Status |
|---|---|---|---|
| A | 16 | Stage 4 | COMPLETE — June 25, 2026 |
| B | 18 | Stage 5a (APEX) | COMPLETE — June 26, 2026 |
| C | 21 | Stage 5b (FLOWPATH) | COMPLETE — June 29, 2026 |
| **D** | **~25** | **Stage 6 (ARIA Suite)** | **Pending — first Walkthrough where Supervision Efficiency Standard applies formally, alongside Gap 5/6** |
| E | ~27 | Pre-IL | Pending |
| F | ~32 | Full platform | Pending |

---

## §17 — Primary Product Inserts

*(unchanged from v1.35)*

---

## §18 — Agent and Prompt Registry

*(unchanged from v1.35 — 44 agents, 14 prompts)*

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.34 | June 29, 2026 | Time & Travel D-TT1–D-TT6 · 8 agents (44 total) · docs/17 |
| v1.35 | June 29, 2026 | Session 23 retry COMPLETE · GD-20 executed · CLEAR live · 1187 tests |
| **v1.36** | **June 29, 2026** | **Supervision Efficiency Standard established (addendum to docs/14) · no build scope change** |

---

## §20 — Full Build Roadmap

*(unchanged from v1.35 — Session 24 (TRACER core) remains next. This Brief version
makes no change to the roadmap. Walkthrough D will be the first validation point for
the Supervision Efficiency Standard, alongside Gap 5/6.)*

---

*SOVEREIGN Platform Integration Brief v1.36 · June 29, 2026*
*Pre-Decisional · Internal Working Document*
