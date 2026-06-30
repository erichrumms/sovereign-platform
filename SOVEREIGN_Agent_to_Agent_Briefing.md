# SOVEREIGN Platform — Agent-to-Agent Briefing
## For Any Claude Instance Opening a SOVEREIGN Session
## Updated June 29, 2026 — Stage 6 feature-complete, Walkthrough D ready to schedule

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

**All six primary products are now feature-complete.**

---

## Current Build State — As of Session 25 (June 29, 2026)

| Item | State |
|---|---|
| Last completed session | Session 25 — ARC core + CPMI-VRS certification |
| HEAD / origin/main | `cb49c9c` |
| shell-contract.ts | v1.15 · SHA `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876` — unchanged since Session 23 |
| Integration Brief | v1.38 |
| SBOM Registry | v1.26 |
| JS/TS tests passing | 1109 (+ 158 Python = 1267 total) |
| **Stage 6 (ARIA Suite)** | **FEATURE-COMPLETE — CLEAR + TRACER + ARC all live** |
| Walkthroughs A, B, C | COMPLETE |
| **Walkthrough D** | **READY TO SCHEDULE** |
| Registered agents | 44 |
| Approved prompts | 14 |
| All data | SYNTHETIC — Governance Clock not activated |

**Session 25 deliverables (no shell-contract change):**
- D1: ARC domain types + deterministic dependency-model engine (14-item registry)
- D2: Regulatory Impact Modeler panel — live, replacing last ARIA scaffold
- D3: Two ARC Logger event types — Python-only, following TRACER precedent
- D4: CPMI-VRS determinism verification (6 scenarios) + Gates tab — Gate 3/4 left
  pending for Project Principal
- D5: 46 new tests — 1267 total

**Two STOP-discipline checks resolved correctly, no GD needed:**
- docs/16 §6/§7 confirmed NOT ambiguous — ARC events correctly Python-only
- ARC outputs deliberately NOT routed through `ctx.aria` — a projection is not a
  document awaiting export clearance

**Next action: Walkthrough D — NOT a Claude Code build session.** Live validation,
Project Principal in browser, Governance Agent guiding. First Walkthrough where the
Supervision Efficiency Standard applies formally alongside Gap 5/6.

---

## ⚠️ Cumulative Intentional Logger Divergence

Python `APPROVED_EVENT_TYPES` (84) is **permanently 5 members ahead** of TypeScript
`SovereignEventType` (79): 3 TRACER events + 2 ARC events, all Python-only by design.
**Do not treat this as drift.** `ARIA_ADAPTATION_DECISION` is an event type, not a
`HumanDecisionType` — reserved, not yet wired to live routing.

---

## Shell Contract — Unchanged Since GD-20 (Session 23)

| | Hash |
|---|---|
| **Current (v1.15)** | `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876` |

No GD in Sessions 24 or 25. Ten shell exports, 79 `SovereignEventType` members, 19
`HumanDecisionType` members.

---

## Key Codebase Facts (updated through Session 25)

- `aria.rules-engine` now powers all three ARIA components — CLEAR, TRACER, ARC —
  fully deterministic, no LLM call, no prompt
- ARC's dependency model: a committed in-code registry of 14 platform items (7
  CLEAR rules, 3 workflows, 2 TRACER chains, 2 SCRIBE templates) bound to the same
  four regulatory sources CLEAR loads
- ARC→COUNSEL/NEXUS routing is UI-recommendation-only — real cross-module routing
  deferred, would benefit from a COUNSEL `regulation_basis` GD (now reinforced by
  both TRACER and ARC findings — strong candidate for the next GD)
- CPMI-VRS for ARIA Suite uses a modified gate structure: determinism verification
  replaces Gates 1–2 accuracy benchmarks; Gates 3/4 remain Project Principal steps
- `AriaVrsGates.tsx` is built and ready — Gate 3 attestation and Gate 4 monitoring
  baseline are pending, intentionally left for the Project Principal

---

## Open Governance Items — Priority

1. **Walkthrough D** — schedule and run (next action, not a build session)
2. **Gate 3/4 attestation** — Project Principal step, can happen any time
3. **COUNSEL `regulation_basis` GD** — strong candidate, reinforced by two sessions' findings
4. **docs/16 retroactive update** — reflect Session 24/25 reconciliations
5. **PPBE-SPEC / TT-PROMPTS** — workflow layer prep, sequenced after Walkthrough D

---

## What Makes a Session Go Badly

| Problem | Prevention |
|---|---|
| Wrong shell-contract hash | Verify v1.15 hash `939c2441…bfa5876` — unchanged since Session 23 |
| Agent count wrong | Count Agent_Identity_Standard.md directly — expected 44 |
| Gather script wrong filename | Read prior SBOM §4. Use exact filenames. (Lesson 11) |
| "Fixing" the Logger divergence | 84 vs 79 is permanent and intentional — do not reconcile |
| Committing iCloud-archival files to git | Check document type against Lesson 13 list |
| Treating Walkthrough D as a Claude Code session | It is live, human-in-the-loop, Governance Agent guided — not autonomous build |
| Session closes without handoff | Non-negotiable — always produce the handoff |

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated June 29, 2026*
*Supersedes June 29, 2026 (Session 24) version — Stage 6 feature-complete,
Walkthrough D ready to schedule*
*Pre-Decisional · Internal Working Document*
