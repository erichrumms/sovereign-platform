# SOVEREIGN Platform — Agent-to-Agent Briefing
## For Any Claude Instance Opening a SOVEREIGN Session
## Updated June 29, 2026 — reflects Session 24 complete, TRACER live, repo cleanup

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

## Current Build State — As of Session 24 (June 29, 2026)

| Item | State |
|---|---|
| Last completed session | Session 24 — TRACER core |
| HEAD / origin/main | `1888e48` (includes post-session repo cleanup) |
| shell-contract.ts | v1.15 · SHA `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876` — **unchanged since Session 23** |
| Integration Brief | v1.37 |
| SBOM Registry | v1.25 |
| JS/TS tests passing | 1062 (+ 153 Python = 1215 total) |
| Stages 1–5b | COMPLETE |
| Walkthroughs A, B, C | COMPLETE |
| Stage 6 (ARIA Suite) | IN PROGRESS — CLEAR + TRACER live, ARC next |
| Registered agents | 44 |
| Approved prompts | 14 |
| All data | SYNTHETIC — Governance Clock not activated |

**Session 24 deliverables (no shell-contract change — TRACER needed none):**
- D1: TRACER domain types + deterministic chain assembly engine
- D4: COUNSEL + SCRIBE integration (built against real data, not idealized spec)
- D2: Traceability Explorer panel — live, replacing scaffold
- D3: Three TRACER Logger event types — Python-only by design
- D5: 28 new tests — 1215 total

**Post-session: repo housekeeping pass** (June 29–30) — removed 24 untracked stray
files from the git working tree; one genuine improvement to `docs/15` recovered and
merged before its duplicate was discarded. See Lesson 13 below.

**Next session:** Session 25 — ARC core + CPMI-VRS certification (final ARIA Suite
deliverable before Walkthrough D)

---

## ⚠️ Important: Intentional Logger Taxonomy Divergence

As of Session 24, Python `APPROVED_EVENT_TYPES` (82) is **permanently** 3 members
ahead of TypeScript `SovereignEventType` (79). This is by design — TRACER's three
event types (`ARIA_TRACE_REQUESTED`, `ARIA_TRACE_PRODUCED`, `ARIA_ORPHAN_FLAGGED`)
are Python-only; TRACER emits nothing from the TypeScript layer. **Do not treat this
as drift to reconcile.** The prior assumption that the Python set mirrors the
shell-contract exactly is retired. Any future TS-side TRACER emission requires a new
GD.

---

## Shell Contract — Unchanged Since GD-20 (Session 23)

| | Hash |
|---|---|
| **Current (v1.15)** | `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876` |

No GD in Session 24. Ten shell exports, 79 `SovereignEventType` members, 19
`HumanDecisionType` members — all unchanged from Session 23 close.

---

## Key Codebase Facts (updated through Session 24)

- `ctx.aria.isCertified(documentId)` / `ctx.aria.record()` — LIVE (CLEAR)
- TRACER's three chain types (Decision, Document, Obligation) are deterministic —
  no LLM, no `sovereign-api-client` call anywhere in the TRACER path
- `ctx.data` is `{ types: unknown }` — no structured read API yet. `ctx.logger` is
  write-only. TRACER and CLEAR both use synthetic demo records / explicit input as
  a workaround pending a real read API.
- COUNSEL Decision Records carry no `regulation_basis` field — DecisionChain's
  regulation/source nodes orphan until a future COUNSEL extension adds it
- SCRIBE has no `SCRIBE_DRAFT_CREATED` event — DocumentChain uses the real
  `AGENT_STEP_COMPLETE` event instead
- `aria.rules-engine` powers both CLEAR and TRACER — deterministic, no prompt
- module-aria uses `import.meta.env` via anthropic-key.ts + jest stub (ESM pattern)

---

## ⚠️ Lesson 13 — Repo Hygiene (New, June 30, 2026)

The monorepo root and `docs/` hold only **current-version** governing documents.
The following document types are **iCloud-archival only — never commit to git**:
- `SBOM_Registry_vNN_MERGED.md` snapshots (per-session `SBOM_SessionNN_Update.md`
  files ARE committed — only the cumulative merged registry is iCloud-only)
- `SOVEREIGN_System_Prompt_vNN.md` dated snapshots
- `SOVEREIGN_Agent_to_Agent_Briefing_YYYYMMDD.md` dated snapshots
- Already-merged governance decision records once their content is in
  `Agent_Identity_Standard.md` or the Integration Brief

If any of these appear as untracked files in `git status`, they are stray copies
from the download-and-place workflow — verify against the canonical committed file
before deleting (check for genuine content divergence, not just assume duplication).

---

## Open Governance Items — Priority for Session 25

1. **ARC core + CPMI-VRS certification** — Session 25 build scope
2. **Walkthrough D** — after Session 25 (live, with Project Principal)
3. **docs/16 retroactive update** — reflect Session 24's G.1–G.4 reconciliations
4. **COUNSEL-GD candidate** — `regulation_basis` field, not yet actioned
5. **PPBE-SPEC** — `docs/18_PPBE_Workflow_Architecture.md` (renumbered, since 17 is Time & Travel)
6. **TT-PROMPTS / TT-GD** — before Time & Travel Phase II

---

## What Makes a Session Go Badly

| Problem | Prevention |
|---|---|
| Wrong shell-contract hash | Verify v1.15 hash `939c2441…bfa5876` — unchanged since Session 23 |
| Agent count wrong | Count Agent_Identity_Standard.md directly — expected 44 |
| Gather script wrong filename | Read prior SBOM §4. Use exact filenames. (Lesson 11) |
| "Fixing" the Logger divergence | 82 vs 79 is permanent and intentional — do not reconcile |
| Committing iCloud-archival files to git | Check document type against Lesson 13 list before committing |
| Re-running a session that already closed | Verify HEAD and recent commit log before building — check for stale opening prompts |
| Session closes without handoff | Non-negotiable — always produce the handoff |

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated June 29, 2026*
*Supersedes June 29, 2026 (Session 23) version — Session 24 complete, TRACER live,
repo cleanup complete*
*Pre-Decisional · Internal Working Document*
