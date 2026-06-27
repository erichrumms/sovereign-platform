# SOVEREIGN Platform — Agent-to-Agent Briefing
## For Any Claude Instance Opening a SOVEREIGN Session
## Updated June 26, 2026 — reflects Session 20 close, FLOWPATH Screens 1/2/4 complete

---

## Who You Are Talking To

The Project Principal is the sole human decision-maker on this project. Non-technical
background, highly engaged, learning fast. He thinks in big pictures first and
components second — always orient before you detail. One question at a time. Never
assume he knows where a file is.

---

## What SOVEREIGN Is

SOVEREIGN is a governed, AI-aligned operations platform for enterprise and federal
organizations — six integrated core products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS,
ARIA Suite) plus four companion modules (COUNSEL, SCRIBE, LENS, VIGIL) and a future
seventh product called the Intelligence Layer that must never be lost.

---

## Current Build State — As of Session 21 (June 26, 2026)

| Item | State |
|---|---|
| Last completed session | Session 21 (autonomous, 18 min) |
| HEAD / origin/main | `b4e0f8b` |
| shell-contract.ts | **v1.13 · SHA `2a3f0b9d8f390c30e23816e4e928cbcd02ccd59f765294f8ed247d9c75d18569`** |
| Next shell-contract change | GD-19 · Session 22 D1 · v1.13 → v1.14 |
| Integration Brief | v1.30 |
| SBOM Registry | v1.22 |
| JS tests passing | 993 (+ 142 Python = 1135 total) |
| Stage 1–5b | **COMPLETE** |
| Walkthrough C | **READY — Gate 3 wired for Project Principal attestation** |
| Registered agents | 21 |
| All data | SYNTHETIC — Governance Clock not activated |

**Session 21 deliverables:**
- D1: Screen 3 — Workflow Artifact Review (plain prose, WORKFLOW_APPROVAL gate)
- D2: CPMI-VRS benchmark scenarios A/B/C (schema-valid, gate-passing)
- D3: FLOWPATH CPMI-VRS Gates tab (Gate 3 = GATE_3_ATTESTATION, Walkthrough C ready)
- D4: Item 57 — deferred with committee-grade finding → GD-19 pre-approved
- D5: module-flowpath 52 → 93 tests

**Next actions:**
1. Walkthrough C — Gate 3 attestation in browser (Project Principal step)
2. Post-walkthrough → new conversation
3. Session 22 — GD-19 (Item 57) + PPBE decisions + ARIA Suite scaffold

---

## ⚠️ Shell Contract — Version Change (Session 20, GD-18)

| | Hash |
|---|---|
| **Current (v1.13 — use this)** | `2a3f0b9d8f390c30e23816e4e928cbcd02ccd59f765294f8ed247d9c75d18569` |
| **Retired (v1.12 — do not use)** | `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3` |

**v1.13 additions (GD-18, Session 20):**
- `SovereignEventType` (10 new): all `FLOWPATH_*` event types
- `HumanDecisionType` (2 new): `WORKFLOW_APPROVAL`, `VALIDATION_SIGN_OFF` (16→18 total)
- New exported type: `AnalystWorkstyleProfile` (user-scoped, hashed id)
- Note: `FLOWPATH` was already in `SovereignProduct` — no product change was needed

---

## ⚠️ Agent Count Correction

The Integration Brief previously claimed 18 registered agents. This was incorrect.
The authoritative count after Session 20 is **21**:
- 15 previously registered (AgentOS 6, CPMI 3, companion suite 4, APEX 2)
- 6 FLOWPATH agents registered commit `8f8ebed` June 26, 2026

**ALWAYS verify Agent_Identity_Standard.md directly at session open.** Do not rely
on the Integration Brief's agent count claim alone. This is now Constraint #10's
enforced verification step — Session 20 demonstrated why.

---

## The Invariant Constraints

1. No independent security, governance, or audit systems
2. No shared entity field-name divergence
3. No rewrite debt — connections are configuration changes
4. Every human decision event carries `decision_type`
5. No direct Anthropic API calls — `createSovereignClient()` only
6. `workflow_step_id` on every Logger event
7. Shell context frozen at eight exports
8. `shell-contract.ts` v1.13 — SHA above. Changes require full governance process.
9. All prompts registered — 14 approved
10. All agents registered — **21 registered** — **verify the file directly at session open**
11. Five synced copies — propagate all changes

**Critical codebase facts — updated through Session 20:**
- module-flowpath uses `import.meta.env` / `anthropic-key.ts` (same as module-apex)
- FLOWPATH `minimumRole` is `AGENT_OPERATOR`
- `AnalystWorkstyleProfile` is `data_classification: user` — analyst_id hashed, no admin path
- FLOWPATH was already in `SovereignProduct` — GD-18's "10→11" was a false premise
- White card UI pattern applied in FLOWPATH from day one — matches APEX Session 19 pattern

---

## Open Governance Items — Priority for Session 22

1. **Walkthrough C** — Gate 3 attestation in browser (Project Principal step) — NEXT
2. **GD-19** — execute as Session 22 first deliverable (pre-approved)
3. **Item 57** — NEXUS→AgentOS UI convergence (taskSurface ninth export)
4. **PPBE six decisions** (D-P1 through D-P6) — Claude Chat governance session
5. **ARIA Suite scaffold** — Stage 6 begins Session 22 or 23
6. **Items 58/59** — dossier export, CSV format (deferred)

---

## What Makes a Session Go Badly

| Problem | Prevention |
|---|---|
| Agent count claim in Brief is wrong | Verify Agent_Identity_Standard.md directly — count the entries in the file. Never rely on the Brief's count claim alone. |
| Wrong shell-contract hash | Verify v1.13 hash `2a3f0b9d…d18569` before any build work |
| Gather script has wrong filename | Before writing any gather script, read the prior session's SBOM §New Components and use the exact filenames Claude Code recorded — never guess from the spec. The SBOM is the source of truth for what exists on disk. (Lesson 11) |
| process.env in ESM module | module-flowpath uses import.meta.env via anthropic-key.ts |
| AnalystWorkstyleProfile admin path | data_classification: user enforced at data layer, analyst_id hashed |
| Trust statement skipped | PR-FLOWPATH-002 delivers it verbatim before the first question, every session |
| PPBE artifact built without governance | D-P1 through D-P6 decisions not yet made — no PPBE build work |
| Session closes without handoff | Non-negotiable — always produce the handoff |

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated June 26, 2026*
*Supersedes June 26, 2026 (Session 20) version — Session 21 complete, Walkthrough C ready*
*Pre-Decisional · Internal Working Document*
