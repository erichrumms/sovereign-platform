# SOVEREIGN Platform — Agent-to-Agent Briefing
## For Any Claude Instance Opening a SOVEREIGN Session
## Updated June 29, 2026 — reflects Session 22 close, ARIA Suite scaffold, shell-contract v1.14

---

## Who You Are Talking To

The Project Principal is the sole human decision-maker on this project. Non-technical
background, highly engaged, learning fast. He thinks in big pictures first and
components second — always orient before you detail. One question at a time. Never
assume he knows where a file is. He pastes Terminal output directly into chat —
read it carefully, it always contains useful information.

---

## What SOVEREIGN Is

SOVEREIGN is a governed, AI-aligned operations platform for enterprise and federal
organizations — six integrated core products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS,
ARIA Suite) plus four companion modules (COUNSEL, SCRIBE, LENS, VIGIL) and a future
seventh product called the Intelligence Layer that must never be lost. PPBE is a
governed workflow layer running on existing products — not a new product.

---

## Current Build State — As of Session 22 (June 29, 2026)

| Item | State |
|---|---|
| Last completed session | Session 22 (autonomous, 52m 47s) |
| HEAD / origin/main | `1e9c432` |
| shell-contract.ts | **v1.14 · SHA `2b3d8674c5d350e81324a3eb9b81568fe378dfa1784025bbf898756ef17e9910`** |
| Previous shell-contract hash (retired) | v1.13 · `2a3f0b9d…d18569` — do not use |
| Integration Brief | v1.32 |
| SBOM Registry | v1.23 |
| JS tests passing | 1018 (+ 142 Python = 1160 total) |
| Stages 1–5b | **COMPLETE** |
| Walkthroughs A, B, C | **COMPLETE** |
| Stage 6 (ARIA Suite) | **IN PROGRESS — scaffold live, CLEAR next** |
| Registered agents | **36** (verified Session 22 D0 audit — count file directly) |
| Approved prompts | 14 |
| All data | SYNTHETIC — Governance Clock not activated |

**Session 22 deliverables (all complete):**
- D0: Agent audit — 36 verified, 0 Constraint #10 violations, 0 Logger class mismatches
- D1: GD-19 executed — shell-contract v1.14, taskSurface ninth export
- D2: Item 57 closed — NEXUS→AgentOS convergence live via taskSurface
- D3: Walkthrough C gaps WC-1 through WC-5 fixed (FLOWPATH)
- D4: ARIA Suite scaffold — module-aria live, aria.rules-engine carded, 17 tests

**Next session:** Session 23 — CLEAR core (ARIA Suite component 1 of 3)

---

## ⚠️ Shell Contract — Version Change (Session 22, GD-19)

| | Hash |
|---|---|
| **Current (v1.14 — use this)** | `2b3d8674c5d350e81324a3eb9b81568fe378dfa1784025bbf898756ef17e9910` |
| **Retired (v1.13 — do not use)** | `2a3f0b9d8f390c30e23816e4e928cbcd02ccd59f765294f8ed247d9c75d18569` |

**v1.14 additions (GD-19, Session 22):**
- New exported types: `TaskSurface`, `SharedTask`, `SharedTaskStatus`
- New ninth shell export: `taskSurface`
- Standing Constraint #7 formally relaxed from 8 to 9 exports for this addition

---

## ⚠️ Agent Count — Verified 36

Session 22 D0 audit counted Agent_Identity_Standard.md directly: **36 registered agents**.
The Integration Brief previously claimed 21 — that count was incorrect. The verified
number is 36. **Always count the file directly at session open. Never rely on the
Brief's count. This is Lesson 12.**

Audit findings carried forward:
- F-2 (non-blocking): 8 agents implemented-but-not-carded (2 NEXUS + 6 AgentOS core)
- F-3 (non-blocking): AgentOS dispatcher id/class nuance — representational only

---

## The Invariant Constraints (updated for v1.14)

1. No independent security, governance, or audit systems
2. No shared entity field-name divergence
3. No rewrite debt — connections are configuration changes
4. Every human decision event carries `decision_type`
5. No direct Anthropic API calls — `createSovereignClient()` only
6. `workflow_step_id` on every Logger event
7. Shell context frozen at **nine exports** (GD-19 relaxed 8→9; no further relaxation
   without a new GD)
8. `shell-contract.ts` v1.14 — SHA above. Changes require full governance process.
9. All prompts registered — 14 approved
10. All agents registered — **36 registered** — **verify the file directly at session open**
11. Five synced copies — propagate all changes

**Critical codebase facts — updated through Session 22:**
- ESM modules: module-cpmi, module-apex, module-flowpath, **module-aria** all use
  `import.meta.env` via `anthropic-key.ts` + jest stub. Do NOT use `process.env` there.
- NEXUS→AgentOS convergence is LIVE: `NexusApp` wires `createAgentOSBackedPort`;
  NEXUS-originated tasks are read-only in AgentOS (provenance tag, no Cancel)
- `aria.rules-engine` is deterministic — no `sovereign-api-client` calls, no prompt.
  If any ARIA build requires LLM calls: STOP and surface.
- PPBE reserved field names (never use in any other entity): `fiscal_year`,
  `lifecycle_cost_estimate`, `obligation_plan`, `performance_baseline`
- White card UI pattern: `#ffffff` cards on `#f1f5f9` canvas — apply from first line
- module-aria minimumRole: `PLATFORM_ADMIN`

---

## Open Governance Items — Priority for Session 23

1. **CLEAR core** — Session 23 build scope (see §15 of Integration Brief v1.32)
2. **TRACER core** — Session 24
3. **ARC core + CPMI-VRS certification** — Session 25
4. **Walkthrough D** — after Session 25
5. **PPBE-SPEC** — `docs/17_PPBE_Workflow_Architecture.md` needed before PPBE Phase II
6. **WC-6** — FLOWPATH VRS certificate document (Stage 7 / hardening)
7. **F-2** — 8 agents implemented-but-not-carded (future session)

---

## What Makes a Session Go Badly

| Problem | Prevention |
|---|---|
| Wrong shell-contract hash | Verify v1.14 hash `2b3d8674…e9910` before any build work |
| Agent count wrong | Count Agent_Identity_Standard.md directly — expected 36. Never from the Brief. |
| Gather script has wrong filename | Read prior session's SBOM §4 New Components before writing any gather script. Use exact filenames. Never guess from spec. (Lesson 11) |
| process.env in ESM module | module-aria (and cpmi/apex/flowpath) use import.meta.env via anthropic-key.ts |
| aria.rules-engine calls sovereign-api-client | Hard stop — surface in handoff. ARIA is deterministic by design. |
| PPBE build without spec | docs/17_PPBE_Workflow_Architecture.md not yet authored — no PPBE build work |
| Session closes without handoff | Non-negotiable — always produce the handoff |
| Shell context grows beyond nine | Any addition beyond nine requires a new GD |

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated June 29, 2026*
*Supersedes June 26, 2026 (Session 21) version — Session 22 complete, ARIA scaffold live,
shell-contract v1.14, 36 agents verified*
*Pre-Decisional · Internal Working Document*
