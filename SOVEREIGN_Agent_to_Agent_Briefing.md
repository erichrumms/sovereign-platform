# SOVEREIGN Platform — Agent-to-Agent Briefing
## For Any Claude Instance Opening a SOVEREIGN Session
## Updated June 29, 2026 — reflects Session 23 (retry) complete, CLEAR live, shell-contract v1.15

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

---

## Current Build State — As of Session 23 (retry) (June 29, 2026)

| Item | State |
|---|---|
| Last completed session | Session 23 (retry) — autonomous, 31m 56s |
| HEAD / origin/main | `065c058` (includes post-session TT agent commit) |
| shell-contract.ts | **v1.15 · SHA `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876`** |
| Previous hash (retired) | v1.14 · `2b3d8674…e9910` — do not use |
| Integration Brief | v1.35 |
| SBOM Registry | v1.24 |
| JS/TS tests passing | 1039 (+ 148 Python = 1187 total) |
| Stages 1–5b | COMPLETE |
| Walkthroughs A, B, C | COMPLETE |
| Stage 6 (ARIA Suite) | IN PROGRESS — CLEAR live, TRACER next |
| Registered agents | **44** (36 pre-TT + 8 Time & Travel, appended post-session) |
| Approved prompts | 14 |
| All data | SYNTHETIC — Governance Clock not activated |

**Session 23 (retry) deliverables:**
- D1: GD-20 executed — shell-contract v1.15 (+4 event types, COMPLIANCE_CERTIFICATION, ctx.aria)
- D4: CLEAR rule evaluation engine (deterministic, four regulatory sources)
- D2: CLEAR Compliance Dashboard (three monitoring surfaces)
- D3: CLEAR Certification Queue + SCRIBE export gate (ctx.aria.isCertified)
- D5: VIGIL integration (ARIA alerts in Alert Queue, sourceProduct: "ARIA")
- D6: 33 new tests — 1187 total

**Next session:** Session 24 — TRACER core

---

## ⚠️ Shell Contract — Version Change (Session 23, GD-20)

| | Hash |
|---|---|
| **Current (v1.15 — use this)** | `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876` |
| **Retired (v1.14 — do not use)** | `2b3d8674c5d350e81324a3eb9b81568fe378dfa1784025bbf898756ef17e9910` |

**v1.15 additions (GD-20, Session 23):**
- `SovereignEventType` +4: ARIA_COMPLIANCE_CHECK, ARIA_CERTIFICATION_ISSUED,
  ARIA_VIOLATION_FLAGGED, ARIA_CALENDAR_ALERT (75 → 79)
- `HumanDecisionType` +1: COMPLIANCE_CERTIFICATION (18 → 19)
- Tenth shell export: `aria: AriaCertificationSurface`
- Constraint #7: ten exports (no further without a new GD)

---

## ⚠️ Agent Count — 44

Post-Session 23 governance addition: eight Time & Travel agents appended to
`Agent_Identity_Standard.md` at commit `065c058`. Session 24 expected count: **44**.
**Always count the file directly. Never rely on the Brief's count. (Lesson 12)**

---

## Key Codebase Facts (updated through Session 23)

- Shell context exports (10): auth · logger · governance · data · navigation · mcp ·
  a2a · agui · taskSurface · aria
- `ctx.aria.isCertified(documentId)` — SCRIBE export gate (LIVE)
- `ctx.aria.record(certification)` — Certification Queue writes (LIVE)
- CLEAR source loading is registry-bound (not runtime fs) — browser ESM, no Node types
- ARIA→VIGIL maps to existing AlertType + `sourceProduct: "ARIA"` — no VIGIL schema change
- `aria.rules-engine` is deterministic — no `sovereign-api-client` calls
- module-aria uses `import.meta.env` via anthropic-key.ts + jest stub (ESM pattern)
- `SovereignEventType`: 79 members · `HumanDecisionType`: 19 members
- Python `APPROVED_EVENT_TYPES`: 79 · `APPROVED_DECISION_TYPES`: 19
- PPBE and Time & Travel: governed workflow layers — no build until after Walkthrough D

---

## Open Governance Items — Priority for Session 24

1. **TRACER core** — Session 24 build scope
2. **ARC core + CPMI-VRS certification** — Session 25
3. **Walkthrough D** — after Session 25
4. **PPBE-SPEC** — before PPBE Phase I
5. **TT-PROMPTS** — before Time & Travel Phase II
6. **TT-GD** — HumanDecisionType additions for Time & Travel before Phase II

---

## What Makes a Session Go Badly

| Problem | Prevention |
|---|---|
| Wrong shell-contract hash | Verify v1.15 hash `939c2441…bfa5876` before any build work |
| Agent count wrong | Count Agent_Identity_Standard.md directly — expected 44. Never from the Brief. |
| Gather script wrong filename | Read prior SBOM §4 New Components. Use exact filenames. (Lesson 11) |
| process.env in ESM module | module-aria uses import.meta.env via anthropic-key.ts |
| Attempting to add eleventh shell export | Ten exports is the frozen count — new GD required |
| PPBE or TT build without spec/GD | Both layers are future scope — no build until after Walkthrough D |
| Session closes without handoff | Non-negotiable — always produce the handoff |

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated June 29, 2026*
*Supersedes June 29, 2026 (Session 22) version — Session 23 complete, CLEAR live,
shell-contract v1.15, 44 agents*
*Pre-Decisional · Internal Working Document*
