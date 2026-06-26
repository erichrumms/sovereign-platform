# SOVEREIGN Platform — Agent-to-Agent Briefing
## For Any Claude Instance Opening a SOVEREIGN Session
## Updated June 25, 2026 — reflects Session 17 close, Stage 5a complete, shell-contract v1.12

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
seventh product called the Intelligence Layer that must never be lost. Every current
product builds toward it.

Three non-negotiable design outcomes govern every build decision: integration
reliability, operational efficiency, and end-to-end security observability.

Three shared infrastructure layers underpin everything: the SOVEREIGN Security
Observability Framework (shared nervous system), the CPMI-VRS AI Governance Standard
(shared governance), and AgentOS (shared execution environment). No product builds
its own version of any of these.

---

## Current Build State — As of Session 17 (June 25, 2026)

| Item | State |
|---|---|
| Last completed session | Session 17 (autonomous) |
| HEAD / origin/main | `7358f88` |
| shell-contract.ts | **v1.12 · SHA `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3`** |
| Previous shell-contract hash (retired) | v1.11 · `78709b213ff9976ecadd4066645a897ece55fb9b3ffb049b59dd02d19c0162db` — do not use |
| Integration Brief | v1.26 |
| SBOM Registry | v1.18 |
| JS tests passing | 876 (+ 142 Python = 1018 total) |
| Stage 1–4 | COMPLETE |
| **Stage 5a (APEX)** | **COMPLETE** |
| All data | SYNTHETIC — Governance Clock not activated |

**Session 17 deliverables — ALL COMPLETE (autonomous run, 43 min 39 sec):**
- D1: GD-15 Python logger re-sync (events 21→58, decisions 10→15; exact parity with v1.11)
- D2: Walkthrough A Gap 1 (NEXUS queue), Gap 3 (contrast audit), Gap 4 (investigated — config)
- D3: GD-16 shell-contract v1.11→v1.12 + APEX scaffold + PPBE stubs + ApexDataAdapter
- D4: Portfolio Dashboard (Screen 1) — Gap 5/6 compliant
- D5: Program Detail View + DC-3 ProvenancePanel (Screen 2)
- D6: Report Generation + DC-2 Dossier Export (Screen 3)
- D7: CPMI-VRS benchmark scenarios A/B/C (all schema_valid:true)

**Next session:** Session 18 — APEX CPMI-VRS Gates tab + Walkthrough B readiness.
Then Walkthrough B (Project Principal operates APEX in browser; Gate 3 attestation is
the Project Principal step during Walkthrough B).

---

## ⚠️ Shell Contract — Version Change (Session 17, GD-16)

The shell contract changed in Session 17 (GD-16). The new hash is mandatory for all
sessions from Session 18 onward.

| | Hash |
|---|---|
| **Current (v1.12 — use this)** | `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3` |
| **Retired (v1.11 — do not use)** | `78709b213ff9976ecadd4066645a897ece55fb9b3ffb049b59dd02d19c0162db` |

Every session must verify both copies of `shell-contract.ts` match the v1.12 hash
before any build work begins.

**v1.12 additions (GD-16, Session 17):**
- `SovereignEventType` (7 new): `APEX_ANALYSIS_STARTED`, `APEX_ANALYSIS_COMPLETE`,
  `APEX_REPORT_GENERATED`, `APEX_DOSSIER_EXPORTED`, `APEX_PROVENANCE_VIEWED`,
  `REPORT_GENERATION_HELD`, `APEX_EVENT_RECEIVED`
- `HumanDecisionType` (1 new): `REPORT_ATTESTATION` (16 members total)
- New exported types: `ApexReportType`, `RiskFinding`, `ApexAnalysisOutput`

---

## Monorepo Location

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
```

**Absolute path:** `/Users/developmentsystem/Developer/sovereign-platform/`
**GitHub remote:** `https://github.com/erichrumms/sovereign-platform.git`
**Branch:** `main` · HEAD: `7358f88`

**Open Claude Code with:**
```bash
cd ~/Developer/sovereign-platform
caffeinate -i claude --dangerously-skip-permissions
```

---

## The Two Claude Environments — Never Cross These

**Claude Chat** — governance only. Authors documents, merges SBOMs, approves prompts,
produces session opening prompts, authors architecture specs. Never writes code.

**Claude Code** — code only. Writes, tests, and commits code. Produces session handoff
and SBOM update at close. Never authors governance documents.

The Project Principal is the bridge. He uploads Claude Code's close artifacts to Claude
Chat. He downloads Claude Chat's governance documents and installs them in the repo.

---

## The Invariant Constraints

These apply to every session, every product, every build decision without exception.

1. No independent security, governance, or audit systems — use the platform's
2. No shared entity field-name divergence from the data dictionary
3. No rewrite debt — connections are configuration changes
4. Every human decision event carries `decision_type`
5. No direct Anthropic API calls — `createSovereignClient()` only
6. `workflow_step_id` on every Logger event
7. Shell context frozen at eight exports
8. `shell-contract.ts` is a governance document — v1.12, SHA above. Changes require
   governance decision, version increment, changelog, impact assessment, SHA-256
   verification of both copies, and propagation to all synced shared-type copies
9. All prompts registered before build — 10 APPROVED
10. All agents registered before build — 18 registered (all AgentCards active)
11. Five synced copies of shared artifacts — changes must propagate to all copies

**Critical codebase facts added Session 17:**
- `sovereignHold()` does not exist — call `ctx.governance.isOnHold(product)` instead
- ESM modules (module-cpmi, module-apex) use `import.meta.env` / isolated
  `anthropic-key.ts` with jest stub — do NOT change to `process.env` in those modules
- APEX `minimumRole` is `PLATFORM_ADMIN`
- PPBE reserved field names (never use in ProgramRecord extensions):
  `fiscal_year`, `lifecycle_cost_estimate`, `obligation_plan`, `performance_baseline`

---

## The Registered Agents (18 total)

| Agent ID | Module | Class | Status |
|---|---|---|---|
| `cpmi.reasoning-chain` | module-cpmi | Governance | Implemented |
| `cpmi.world-model-api` | module-cpmi | Operational | Implemented |
| `cpmi.vrs-certification` | module-cpmi | Governance | Implemented |
| `agentos.orchestrator` | module-agentos | Orchestration | Implemented |
| `agentos.data-agent` | module-agentos | Operational | Implemented |
| `agentos.training-agent` | module-agentos | Operational | Implemented |
| `agentos.evaluation-agent` | module-agentos | Analytical/Gov | Implemented |
| `agentos.monitoring-agent` | module-agentos | Monitoring | Implemented |
| `agentos.compliance-agent` | module-agentos | Governance | Implemented |
| `nexus.classification-agent` | module-nexus | Analytical | Implemented |
| `nexus.routing-agent` | module-nexus | Operational | Implemented |
| `counsel-analyst` | module-counsel | Analytical | Implemented |
| `scribe-drafter` | module-scribe | Operational | Implemented |
| `scribe-style-analyst` | module-scribe | Analytical | Implemented |
| `vigil-triage-analyst` | module-vigil | Monitoring | Implemented |
| `vigil-approval-agent` | module-vigil | Monitoring | Implemented |
| `lens-explainer` | module-lens | Analytical | Implemented |
| `lens-orientation` | module-lens | Analytical | Implemented |
| **`apex.ai-assistant`** | **module-apex** | **Analytical** | **Implemented Session 17** |
| **`apex.report-generator`** | **module-apex** | **Operational** | **Implemented Session 17** |

*Note: 20 rows shown — flowpath agents (6) are registered in Agent_Identity_Standard.md
but not yet implemented (Stage 5b). Active AgentCards: 18.*

---

## The Approved Prompts (10 total)

| ID | Prompt | Approved |
|---|---|---|
| PR-COUNSEL-001/002/003 | Analysis, Counterargument, Pre-Mortem | June 15–16, 2026 |
| PR-SCRIBE-001 | Drafting Engine (+ synthesis/framing) | June 16, 2026 |
| PR-SCRIBE-004 | Style Analysis | June 17, 2026 |
| PR-VIGIL-001 | Triage System | June 17, 2026 |
| PR-VIGIL-002 | Approval System | June 23, 2026 |
| PR-LENS-001 | Explainer System | June 18, 2026 |
| PR-CPMI-001 | CPMI Reasoning Chain | Prior session |
| **PR-APEX-001** | **APEX AI Assistant** | **June 25, 2026** |

---

## Open Governance Items — Priority Order for Session 18

1. **APEX CPMI-VRS Gates tab** — visible gate runner for Walkthrough B; Gate 3 attestation
   is the Project Principal's step during the walkthrough
2. **Item 55** — `APPROVED_PRODUCTS` companion-product re-sync (small GD; COUNSEL/SCRIBE/
   LENS/VIGIL missing from `sovereign_logger.py` `APPROVED_PRODUCTS`; fold in Session 18 or
   dedicate a small follow-up GD)
3. **Walkthrough B readiness** — end-to-end APEX browser run confirming Gap 5/6 compliance
4. **PPBE six decisions** (D-P1 through D-P6) — Claude Chat governance session, Session ~19
5. **GD-10 lift trigger** (item 42) — criteria for widening AUTHORIZED_CLASSIFICATIONS
6. **AgentOS §5.2 missing** (item 53) — evaluate gates spec section
7. **evaluate.py cross-runtime adapter** (item 54) — live wiring deferred

---

## The Post-Session Rhythm — Every Session

```
Claude Code closes → handoff + SBOM committed + pushed
        ↓
Project Principal copies close artifacts → uploads to Claude Chat
        ↓
Claude Chat produces → merged SBOM + updated Integration Brief
                     + updated Agent-to-Agent Briefing (if hash changed)
                     + any new governance documents
        ↓
Project Principal downloads → copies Brief to monorepo root
                            → commits + pushes → places files in iCloud
        ↓
Next session → gather script → Claude Code → context paste → opening prompt
```

---

## What Makes a Session Go Badly — and How to Prevent It

| Problem | Prevention |
|---|---|
| Wrong shell-contract hash | Verify v1.12 hash `61594a69…46dfe3` before any build work |
| Claude Code opens against stale Integration Brief | Always copy the new Brief to monorepo root and push before next session |
| Gather script has wrong file list | Update file list per Integration Brief §15 before each session |
| Claude Code invents architecture | Every module needs a spec doc before its core build session |
| `sovereignHold()` called as a global | It doesn't exist — use `ctx.governance.isOnHold(product)` |
| `process.env` used in ESM module | module-cpmi / module-apex use `import.meta.env` via isolated `anthropic-key.ts` |
| PPBE reserved field names used | Never use `fiscal_year`, `lifecycle_cost_estimate`, `obligation_plan`, `performance_baseline` in ProgramRecord extensions |
| Prompt runs before approval | Register as PENDING, approve in Claude Chat, never self-approve |
| Session closes without handoff | Non-negotiable — always tell Claude Code to produce the handoff |
| Shell-contract change without full governance | Version increment + changelog + impact assessment + dual-copy SHA verification + Constraint #11 propagation |

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated June 25, 2026*
*Supersedes the June 23, 2026 version — Session 17 complete, Stage 5a complete,
shell-contract v1.12, APEX module delivered*
*Pre-Decisional · Internal Working Document*
