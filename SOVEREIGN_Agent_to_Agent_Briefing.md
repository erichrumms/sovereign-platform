# SOVEREIGN Platform — Agent-to-Agent Briefing
## For Any Claude Instance Opening a SOVEREIGN Session
## Updated June 30, 2026 — Walkthrough D complete, Gate 3 deferred, gap fixes next

---

## Who You Are Talking To

The Project Principal is the sole human decision-maker on this project. Non-technical
background, highly engaged, learning fast. Big picture first, components second. One
question at a time. Never assume he knows where a file is. He pastes Terminal output
directly into chat — read it carefully.

---

## What SOVEREIGN Is

SOVEREIGN is a governed, AI-aligned operations platform for enterprise and federal
organizations — six integrated core products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS,
ARIA Suite) plus four companion modules (COUNSEL, SCRIBE, LENS, VIGIL) and a future
seventh product called the Intelligence Layer that must never be lost. Two governed
workflow layers (not products): PPBE and Time & Travel.

**All six primary products are feature-complete. Walkthroughs A through D are complete.**

---

## Current State — As of Walkthrough D (June 30, 2026)

| Item | State |
|---|---|
| Last completed action | Walkthrough D — ARIA Suite Level 1 Validation |
| HEAD / origin/main | `cb49c9c` (Integration Brief v1.38 + Briefing committed at `4bd729f`) |
| shell-contract.ts | v1.15 · SHA `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876` — unchanged since Session 23 |
| Integration Brief | v1.39 (produced — needs commit) |
| SBOM Registry | v1.26 (iCloud only) |
| Platform tests | 1267 (1109 JS/TS + 158 Python) · 0 vulnerabilities |
| Stage 6 (ARIA Suite) | FEATURE-COMPLETE — CLEAR + TRACER + ARC all live |
| Walkthroughs | A, B, C, D — all COMPLETE |
| CPMI-VRS Gate 3 | DEFERRED — D-11 and D-12 must be fixed first |
| Registered agents | 44 |
| Approved prompts | 14 |
| All data | SYNTHETIC — Governance Clock not activated |

**Next action:** Post-walkthrough build session — Walkthrough D gap fixes.
D-11 and D-12 are first priority (required before Gate 3 attestation).
After fixes: Gate 3 → Gate 4 → workflow layer builds begin.

---

## ⚠️ Gate 3 Is Deferred — Do Not Attempt Without These Fixes

D-11: Gate 3 attestation has no context for what is being attested. No pre-formed
statement, no explanation of authority or consequence. The Project Principal
correctly deferred rather than attest blind.

D-12: CPMI-VRS Gates tab does not explain what Gates 1–2 are or why determinism
verification is a valid substitution. Assumed knowledge the reviewer does not have.

Both must be fixed and committed before Gate 3 attestation is meaningful.

---

## ⚠️ Cumulative Intentional Logger Divergence

Python `APPROVED_EVENT_TYPES` (84) is permanently 5 members ahead of TypeScript
`SovereignEventType` (79): 3 TRACER + 2 ARC events, all Python-only by design.
Do not treat this as drift. `ARIA_ADAPTATION_DECISION` is an event type, not a
`HumanDecisionType` — reserved, not yet wired to live routing.

---

## Shell Contract — Unchanged Since GD-20 (Session 23)

| | Hash |
|---|---|
| **Current (v1.15)** | `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876` |

No GD in Sessions 24 or 25. Ten shell exports, 79 SovereignEventType members,
19 HumanDecisionType members — all unchanged.

---

## Key Codebase Facts

- `aria.rules-engine` powers CLEAR, TRACER, and ARC — fully deterministic, no LLM
- ARC outputs deliberately NOT routed through `ctx.aria` — projections are not export clearances
- ARC→COUNSEL/NEXUS routing is UI-recommendation-only — real routing deferred
- COUNSEL Decision Records carry no `regulation_basis` field — strong GD candidate,
  reinforced independently by both TRACER and ARC findings
- CPMI-VRS for ARIA Suite: determinism verification replaces Gates 1–2; Gates 3/4
  remain Project Principal steps; `AriaVrsGates.tsx` built and ready
- `ctx.data` is `{ types: unknown }` — no structured read API yet

---

## Walkthrough D Findings — Priority Order for Next Build Session

**First priority (Gate 3 blocking):**
D-11 — Gate 3 attestation context redesign
D-12 — CPMI-VRS gate structure explanation

**Second priority:**
D-3 — CLEAR document preview + export/recipient gap
D-4 — TRACER human-readable language (not internal identifiers)
D-5 — TRACER timestamps on all chain nodes
D-9 — CPMI-VRS scenario selection rationale
D-10 — "Identically" precision (what was compared)

**Third priority:**
D-1 — Data quality severity logic visible at row level
D-2 — "FY26" → "FY 2026" throughout CLEAR
D-6 — ARC scope badge on result panel
D-7 — Duplicate GD-10 banner on CPMI-VRS
D-8 — Engine name redundancy on scenario cards

**Design considerations (future stages, not this session):**
DC-4 — CLEAR data quality two-dimension display
DC-5 — ARC breaking-rule impact on already-certified documents

---

## What Makes a Session Go Badly

| Problem | Prevention |
|---|---|
| Wrong shell-contract hash | Verify v1.15 hash — unchanged since Session 23 |
| Agent count wrong | Count Agent_Identity_Standard.md directly — expected 44 |
| Gather script wrong filenames | Read prior SBOM §4. Exact filenames only. (Lesson 11) |
| "Fixing" the Logger divergence | 84 vs 79 is permanent and intentional |
| Committing iCloud-archival files to git | Lesson 13 — never commit SBOM/SystemPrompt/Briefing snapshots |
| Attempting Gate 3 before D-11/D-12 fixed | Not informed attestation — defer until fixed |
| Beginning PPBE or Time & Travel builds | Sequenced after Gate 3/4 complete |
| Session closes without handoff | Non-negotiable — always produce the handoff |

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated June 30, 2026*
*Supersedes June 29, 2026 (Session 25) version — Walkthrough D complete,
Gate 3 deferred, gap fixes next*
*Pre-Decisional · Internal Working Document*
