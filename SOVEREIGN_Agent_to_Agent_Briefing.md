# SOVEREIGN Platform — Agent-to-Agent Briefing
## For Any Claude Instance Opening a SOVEREIGN Session
## Updated June 26, 2026 — reflects Session 19 close, APEX fully complete, Session 20 unblocked

---

## Who You Are Talking To

The Project Principal is the sole human decision-maker on this project. Non-technical
background, highly engaged, learning fast. He thinks in big pictures first and
components second — always orient before you detail. He makes confident decisions when
options are clearly framed with what each closes and what it leaves open. He pastes
Terminal output directly into chat; read it carefully, it always contains useful
information. One question at a time. Never assume he knows where a file is.

---

## What SOVEREIGN Is

SOVEREIGN is a governed, AI-aligned operations platform for enterprise and federal
organizations — six integrated core products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS,
ARIA Suite) plus four companion modules (COUNSEL, SCRIBE, LENS, VIGIL) and a future
seventh product called the Intelligence Layer that must never be lost.

Three non-negotiable design outcomes: integration reliability, operational efficiency,
and end-to-end security observability.

---

## Current Build State — As of Session 19 (June 26, 2026)

| Item | State |
|---|---|
| Last completed session | Session 19 (autonomous, 13 min) |
| HEAD / origin/main | `b4d0a65` |
| shell-contract.ts | **v1.12 · SHA `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3`** |
| Next shell-contract change | GD-18 · Session 20 D1 · v1.12 → v1.13 |
| Integration Brief | v1.28 |
| SBOM Registry | v1.20 |
| JS tests passing | 899 (+ 142 Python = 1041 total) |
| Stage 1–4 | COMPLETE |
| Stage 5a (APEX) | **COMPLETE — all Walkthrough B follow-ups closed** |
| Walkthrough B | **COMPLETE — June 26, 2026** |
| Stage 5b (FLOWPATH) | **Session 20 — NEXT — fully unblocked** |
| All data | SYNTHETIC — Governance Clock not activated |

**Session 19 deliverables:**
- D1: Item 56 — Gate 3 `GATE_3_ATTESTATION` (pre-session, verified closed)
- D2: APEX contrast audit — white card pattern across all screens
- D3: DC-3 provenance — actual value + variance added
- D4: DC-4 report charts — completion bar, cost variance badge, milestone summary (CSS)

**Session 20 prerequisites — ALL COMPLETE:**
- FLOWPATH Architecture Spec: `docs/15_FLOWPATH_Architecture.md` — committed `cd10267`
- GD-18: pre-approved June 26, 2026
- PR-FLOWPATH-001/002/003/004: all approved June 26, 2026
- Six FLOWPATH agents: already registered in Agent_Identity_Standard.md

---

## Shell Contract — v1.12 (Session 20 advances to v1.13 via GD-18)

| | Hash |
|---|---|
| **Current (v1.12)** | `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3` |
| Next (v1.13 — Session 20 D1) | TBD — record after GD-18 execution |

GD-18 adds: 10 FLOWPATH SovereignEventType members, WORKFLOW_APPROVAL +
VALIDATION_SIGN_OFF to HumanDecisionType (16→18), AnalystWorkstyleProfile exported
type, FLOWPATH to SovereignProduct.

---

## The Invariant Constraints

1. No independent security, governance, or audit systems
2. No shared entity field-name divergence
3. No rewrite debt — connections are configuration changes
4. Every human decision event carries `decision_type`
5. No direct Anthropic API calls — `createSovereignClient()` only
6. `workflow_step_id` on every Logger event
7. Shell context frozen at eight exports
8. `shell-contract.ts` v1.12 — GD-18 pre-approved for Session 20 D1
9. All prompts registered — **14 approved**
10. All agents registered — **18 registered**
11. Five synced copies — propagate all changes

**Critical codebase facts updated through Session 19:**
- module-flowpath uses `import.meta.env` / `anthropic-key.ts` pattern (same as module-apex)
- FLOWPATH `minimumRole` is `AGENT_OPERATOR`
- `AnalystWorkstyleProfile` is `data_classification: user` — analyst_id hashed, no admin path
- **Approved contrast pattern:** white cards (`#ffffff`, `1px solid #e2e8f0`) on `#f1f5f9` canvas
  — apply to every FLOWPATH screen from day one, not as a retrofit
- Gate 3 attestation logs `GATE_3_ATTESTATION` (corrected in Session 19)

---

## UI Standard — Non-Negotiable (Project Principal directive)

Every FLOWPATH screen is built to Gap 5 and Gap 6 standards from the first line of code.
The white content card pattern is the approved pattern. Walkthrough C must find zero
contrast gaps and zero Gap 5/6 failures. Any gap found at Walkthrough C is a build
failure in the session that created it.

Gap 5: all text readable in plain prose by a non-technical reviewer.
Gap 6: three content categories visually distinct within five seconds.
Approved pattern: white cards on light canvas — match the APEX Session 19 implementation.

---

## Open Governance Items — Priority for Session 20

1. **GD-18** — execute as Session 20 first deliverable (pre-approved)
2. **FLOWPATH build** — Screens 1, 2, 4 (Session 20); Screen 3 + CPMI-VRS (Session 21)
3. **Item 57** — NEXUS→AgentOS shared task surface shell-contract decision
4. **PPBE six decisions** (D-P1 through D-P6) — Claude Chat governance session
5. **Items 58/59** — dossier file export, CSV format (deferred, future session)

---

## Approved Prompts (14 total)

PR-COUNSEL-001/002/003 · PR-SCRIBE-001 · PR-SCRIBE-004 · PR-VIGIL-001 · PR-VIGIL-002 ·
PR-LENS-001 · PR-CPMI-001 · PR-APEX-001 ·
**PR-FLOWPATH-001 · PR-FLOWPATH-002 · PR-FLOWPATH-003 · PR-FLOWPATH-004**
(all FLOWPATH prompts approved June 26, 2026)

---

## What Makes a Session Go Badly

| Problem | Prevention |
|---|---|
| Wrong shell-contract hash | Verify v1.12 before Session 20 D1; v1.13 after GD-18 |
| FLOWPATH screens with contrast issues | Apply white card pattern from line one — not a retrofit |
| `process.env` in ESM module | module-flowpath uses `import.meta.env` via `anthropic-key.ts` |
| AnalystWorkstyleProfile privacy breach | `data_classification: user`, analyst_id hashed, no admin path |
| PPBE reserved field names | Never: `fiscal_year`, `lifecycle_cost_estimate`, `obligation_plan`, `performance_baseline` |
| Session closes without handoff | Non-negotiable — always produce the handoff |

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated June 26, 2026*
*Supersedes June 26, 2026 (Session 18) version*
*Pre-Decisional · Internal Working Document*
