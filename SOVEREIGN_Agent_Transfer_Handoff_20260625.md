# SOVEREIGN Platform — Agent Transfer Handoff
## Claude Chat → Next Claude Chat Instance
## June 25, 2026 — End of Session 16 / Walkthrough A

**Classification:** Pre-Decisional · Internal Working Document

---

## What You Are Taking Over

You are the Governance Agent for the SOVEREIGN Platform — a governed, AI-aligned
operations platform for enterprise and federal government. You are opening in a
Claude Chat project that has the system prompt already configured. Read it now.
It contains the authoritative current state of the platform.

This document fills in what the system prompt does not cover: how we work, the
lessons we learned, and exactly what to do next.

---

## Current State — As of June 25, 2026

| Item | Value |
|---|---|
| Integration Brief | v1.25 |
| Shell contract | v1.11 · SHA: `78709b213ff9976ecadd4066645a897ece55fb9b3ffb049b59dd02d19c0162db` |
| HEAD | `058e630` |
| Total tests | 934 (792 JS + 142 Python) |
| Stage 1–4 | **COMPLETE** |
| Walkthrough A | **COMPLETE** — June 25, 2026 |
| Next action | **Session 17 — Stage 5 (APEX)** |
| CPMI-VRS | Gate 3 attested, Gate 4 complete, certificate active |
| Governance Clock | OFF — all data SYNTHETIC |

---

## The Two Environments — Never Cross These

**You (Claude Chat):** Governance only. Author documents, merge SBOMs, approve
prompts, produce opening prompts, run walkthroughs. Never write code.

**Claude Code (Terminal on Mac mini):** Code only. Writes, tests, commits. Produces
handoff and SBOM update at close. Never authors governance documents.

**The Project Principal** is the physical bridge. They paste things from one
environment to the other.

---

## How the Project Principal Prefers to Work

**Autonomous build sessions are the preferred mode.** The Project Principal sets
everything up, launches Claude Code, and steps away for 1–3 hours. Claude Code
builds through the full session without interruption. This requires:

1. A complete architecture spec committed to `docs/` before the session
2. A gather script that finds all relevant files
3. An opening prompt that explicitly says "Begin now, build D1 → D2 → D3
   without stopping" and includes autonomous operation rules
4. Pre-approved governance decisions recorded in the Integration Brief

**The launch sequence every time:**
```bash
# Terminal window 1 — run gather script
~/Developer/sovereign-platform/gather_sessionNN_context.sh

# Terminal window 2 — open Claude Code
cd ~/Developer/sovereign-platform
caffeinate -i claude --dangerously-skip-permissions
```

Then in Claude Code: **Shift+Tab** for auto mode → paste clipboard from gather
script → paste opening prompt → walk away.

`caffeinate -i` keeps the Mac awake. `--dangerously-skip-permissions` allows
autonomous file operations. Both are required for unattended sessions.

**The Project Principal prefers big picture first, then components.** Orient
before you detail. One question at a time. Never assume he knows where a file is.
He pastes Terminal output directly into chat — read it carefully, it always
contains useful information.

---

## What Happens After Every Build Session (Post-Session Rhythm)

Never skip any step. Claude has no memory between sessions — these documents are
the only continuity.

```
1. Claude Code closes → handoff + SBOM committed + pushed
2. Project Principal copies:
   cp ~/Developer/sovereign-platform/SOVEREIGN_SessionNN_Handoff.md ~/Desktop/
   cp ~/Developer/sovereign-platform/SBOM_SessionNN_Update.md ~/Desktop/
3. Project Principal uploads both files to Claude Chat
4. Claude Chat produces:
   - Merged SBOM (new version)
   - Updated Integration Brief (new version)
   - Updated system prompt (if shell-contract hash changed)
   - New architecture spec (if next session needs one)
   - New gather script
   - New opening prompt
5. Project Principal:
   - Commits new Brief to repo root
   - Places files in iCloud 7 - SOVEREIGN/
   - Updates system prompt in project settings (if new version)
```

---

## What To Do Right Now

Session 17 is the next build session. Before producing the Session 17 opening
prompt, you need to do these things in order:

### 1. Confirm the repo is current

The Project Principal should have committed Integration Brief v1.25 already.
If not, that comes first.

### 2. Write the APEX Architecture Spec (`docs/13_APEX_Architecture.md`)

APEX is the analytics and reporting product. Key requirements from Walkthrough A:

- **DC-2 (Program Dossier Export):** Every program in the World Model must be
  exportable as a complete package — world model data, reasoning chain history,
  governance decisions, risk register, regulatory constraints, and flags —
  formatted for human review and briefing.
- **DC-3 (Data Provenance Drill-Down):** Every calculated figure, status
  assessment, and flag surfaced by CPMI must link to underlying data. Source data,
  baseline, date, trend, responsible party.
- APEX consumes AgentOS task outputs and CPMI reasoning chain outputs
- APEX produces MSRs, QPRs, and portfolio analytics
- Pipeline position: after AgentOS, before ARIA Suite
- CPMI-VRS certification required before Session 18 closes

### 3. Write the Human Reviewer Experience Standard (`docs/14_HumanReviewerStandard.md`)

This is a new requirement from Walkthrough A. It must be a written design document
that defines Gap 5 and Gap 6 as enforceable standards:

**Gap 5 — Human Readability:** All AI-generated output must be plain prose,
readable by a non-technical reviewer. No machine-style formatting.

**Gap 6 — Content Type Distinction:** Every screen must visually distinguish:
(1) temporary system status notices, (2) permanent governance guardrails,
(3) substantive operational content the reviewer must act on.

Every product must pass these standards before its Walkthrough validation.

### 4. Write the Session 17 Opening Prompt

Session 17 has two phases:
- **Phase 1 (pre-APEX fixes):** GD-15 Python logger re-sync + Gap 3 contrast audit
  + Gap 1 NEXUS queue fix + Gap 4 CPMI connection investigation
- **Phase 2 (APEX build):** APEX scaffold + core per the architecture spec

Structure as: D1 (GD-15 re-sync) → D2 (Gap fixes) → D3 (APEX scaffold) →
D4 (APEX core, optional if D3 completes cleanly).

### 5. Write the Session 17 Gather Script

Include the new APEX and Human Reviewer Standard spec docs along with the
standard context package.

---

## The Shell Contract — Critical Facts

Current version: v1.11
Hash: `78709b213ff9976ecadd4066645a897ece55fb9b3ffb049b59dd02d19c0162db`

Version history this project:
- v1.3 → v1.4 (GD-6): AGENT_ACTION_* events, AGENT_APPROVAL
- v1.4 → v1.5 (GD-7): CPMI_VRS_GATE_* events, GATE_3_ATTESTATION, WORLD_MODEL_UPDATE
- v1.5 → v1.6 (GD-8): INFERENCE_CALL, INFERENCE_PROVIDER_FALLBACK, MODEL_HASH_MISMATCH
- v1.6 → v1.7 (GD-9): AGENTOS_TASK_* events, TASK_APPROVAL, TASK_CANCELLATION
- v1.7 → v1.8 (GD-11): NEXUS_REQUEST_* events
- v1.8 → v1.9 (GD-12): Orchestration AgentClass
- v1.9 → v1.10 (GD-13): MODEL_EVALUATION_COMPLETE
- v1.10 → v1.11 (GD-14): AGENT_MESSAGE_SENT, AGENT_MESSAGE_RECEIVED

Next contract change will be GD-15 (Python logger re-sync — no new types, just
catch-up) and then whatever APEX requires.

**GD-15 is pre-approved.** It syncs `sovereign_logger.py` `APPROVED_EVENT_TYPES`
and `APPROVED_DECISION_TYPES` to match shell-contract v1.11. ~30 event types and
5 decision types missing. Catch-up only. No new types. Fold into Session 17 D1.

---

## The Registered Agents (16 total)

| Agent ID | Class | Status |
|---|---|---|
| `agentos.deployer` | Orchestration | Implemented S16 |
| `agentos.exporter` | Orchestration | Implemented S16 |
| `agentos.configurator` | Orchestration | Implemented S16 |
| `cpmi.reasoning-chain` | Governance | Implemented S11 |
| `cpmi.world-model-api` | Operational | Implemented S11 |
| `cpmi.vrs-certification` | Governance | Implemented S11 |
| `counsel-analyst` | Analytical | Implemented |
| `scribe-drafter` | Operational | Implemented |
| `scribe-style-analyst` | Analytical | Implemented |
| `vigil-triage-analyst` | Monitoring | Implemented |
| `vigil-approval-agent` | Monitoring | Implemented |
| `lens-explainer` | Analytical | Implemented |
| `lens-orientation` | Analytical | Registered only |

APEX agents will need to be registered in `Agent_Identity_Standard.md` before
Session 17 begins (Constraint #10). Register them in Claude Chat, have the
Project Principal commit, then Session 17 can activate their AgentCards.

---

## The Approved Prompts (9 total)

PR-COUNSEL-001/002/003 · PR-SCRIBE-001 · PR-SCRIBE-004 · PR-VIGIL-001 ·
PR-VIGIL-002 · PR-LENS-001 · PR-CPMI-001

APEX will need a new prompt (PR-APEX-001) approved before its reasoning chain
can run. Author the prompt in the APEX architecture spec, present it for
Project Principal approval in Claude Chat before Session 17 opens.

---

## Open Governance Items (Priority Order)

1. **GD-15** — Python logger taxonomy re-sync (pre-approved, Session 17 D1)
2. **Gap 1** — NEXUS request queue data binding fix (Session 17)
3. **Gap 3** — Color and contrast audit across all products (Session 17)
4. **Gap 4** — CPMI live reasoning service connection (Session 17 — investigate)
5. **Gap 5** — Human readability standard (write spec, apply in APEX)
6. **Gap 6** — Content type distinction standard (write spec, apply in APEX)
7. **DC-2** — Program dossier export (first-order APEX requirement)
8. **DC-3** — Data provenance drill-down (first-order APEX requirement)
9. **PPBE six decisions** (D-P1 through D-P6) — Claude Chat governance session,
   Session ~19 after FLOWPATH complete
10. **GD-10 lift trigger** — criteria for widening AUTHORIZED_CLASSIFICATIONS
11. **AgentOS §5.2** — add evaluate gates spec section to architecture doc
12. **evaluate.py cross-runtime adapter** — live wiring deferred

---

## The Walkthrough Schedule

| Walkthrough | After Session | Stage | Status |
|---|---|---|---|
| A | 16 | Stage 4 | **COMPLETE — June 25, 2026** |
| B | ~18 | Stage 5a (APEX) | Pending |
| C | ~21 | Stage 5b (FLOWPATH) | Pending |
| D | ~25 | Stage 6 (ARIA Suite) | Pending |
| E | ~27 | Pre-IL | Pending |
| F | ~32 | Full platform | Pending |

---

## What Not To Do

- **Do not write code.** You are Claude Chat — governance only.
- **Do not skip the post-session document cycle.** Every session must close
  completely before the next one opens.
- **Do not approve a GD without recording it in the Integration Brief** with a
  clear pre-approval statement that Claude Code can reference.
- **Do not register agents without updating Agent_Identity_Standard.md** and
  having the Project Principal commit it before the build session.
- **Do not produce a gather script that lists files Claude Code won't need** or
  misses files it will. Read the spec and the prior handoff to build the list.
- **Do not let the conversation run too long.** After ~16 sessions, transition to
  a new conversation. The system prompt and documents carry all context.

---

## File Locations for This Project

### Monorepo (`~/Developer/sovereign-platform/`)

```
~/Developer/sovereign-platform/
├── SOVEREIGN_Platform_Integration_Brief_v1.NN.md  ← current version only
├── Agent_Identity_Standard.md                     ← current version only
├── SOVEREIGN_Agent_to_Agent_Briefing.md            ← current version only
├── AGENT_REFERENCE.md
├── gather_sessionNN_context.sh                    ← current session only
├── Session_NN_Opening_Prompt.txt                  ← current session only
├── sovereign-security/                            ← 142 Python tests
├── sovereign-api-client/                          ← 174 tests
├── sovereign-data/                                ← 43 tests
├── sovereign-shell/shell-contract.ts              ← v1.11 current
├── module-counsel/ · module-scribe/ · module-vigil/ · module-lens/
├── module-cpmi/ · module-agentos/ · module-nexus/
├── e2e/                                           ← 4 E2E scenarios
└── docs/                                          ← all architecture specs
    ├── 08_CPMI_Architecture.md
    ├── 09_CPMI_Stage3_Completion.md
    ├── 10_LocalLLM_Infrastructure.md
    ├── 11_AgentOS_Architecture.md
    └── 12_NEXUS_Architecture.md
```

GitHub: `https://github.com/erichrumms/sovereign-platform.git` · branch `main`

### iCloud (`7 - SOVEREIGN/`)

```
7 - SOVEREIGN/
├── SOVEREIGN_Platform_Integration_Brief_v1.NN.md  ← current version only
├── SOVEREIGN_System_Prompt_v9.md                  ← current version only
├── SOVEREIGN_Agent_to_Agent_Briefing_YYYYMMDD.md  ← most recent only
├── Agent_Identity_Standard.md                     ← current version only
├── SOVEREIGN_Agent_Transfer_Handoff_YYYYMMDD.md   ← most recent only
├── AGENT_REFERENCE.md
│
├── docs/                           ← architecture specs (mirrors monorepo docs/)
│   ├── 08_CPMI_Architecture.md
│   ├── 09_CPMI_Stage3_Completion.md
│   ├── 10_LocalLLM_Infrastructure.md
│   ├── 11_AgentOS_Architecture.md
│   └── 12_NEXUS_Architecture.md
│
├── Session Handoffs/               ← all session handoffs · Sessions 1–16+
│   ├── Session_1_Handoff_...md
│   ├── Session_2A_Handoff_...md
│   └── ... through Session_16+
│
├── Walkthroughs/                   ← walkthrough reports · one per stage
│   └── SOVEREIGN_Walkthrough_A_Report.docx
│
├── Companion Suite/
│   ├── 00_SUITE_OVERVIEW_v2.0.md
│   ├── 01_COUNSEL_...md · 02_SCRIBE_...md · etc.
│   └── Governance/                 ← SBOM + governance records
│       ├── SBOM_Registry_v1.17_MERGED.md  ← current version only
│       ├── Governance_Decision_Record_GD1_GD2_GD3.md
│       ├── Governance_Decision_Record_GD4_VIGIL.md
│       ├── Governance_Decision_Record_GD5_CompanionContract.md
│       ├── Prompt_Approval_PR_COUNSEL_001.md
│       ├── Prompt_Approvals_Session5.md · Session6.md · Session7.md
│       └── [other governance records]
│
├── Product Transition Packages/
│   └── PPBE/                       ← ACTIVE WORK SCOPE · do not archive
│       ├── SOVEREIGN_PPBE_Integration_Architecture_Draft1.md
│       └── PPBE Enterprise System Reference.docx
│
├── Archive/                        ← historical value · not current
│   ├── Early Strategy/             ← original thinking · pre-monorepo docs
│   ├── AgentOS raw materials/      ← pre-monorepo architecture
│   └── files/Put into SOVEREIGN for context/
│
└── For Disposal/                   ← safe to delete · no recovery value
```

### Folder Maintenance Rules

**Root level:** Current working documents only — one version of each.
When a new version is produced, the old version moves to For Disposal/.

**Session Handoffs/:** Keep all — they are the project history.
Never delete a session handoff.

**Walkthroughs/:** One report per walkthrough (A through F).
Keep all — they document what 934 tests cannot catch.

**Companion Suite/Governance/:** Keep all governance decision records
and prompt approval records permanently. They are the paper trail.
Old SBOM versions move to For Disposal/ when superseded.

**Product Transition Packages/PPBE/:** Active work scope through
Session 22. Do not archive or dispose until PPBE Phase I is complete.

**Archive/:** Genuine historical value. Documents that predate the
monorepo or capture original thinking not preserved elsewhere.

**For Disposal/:** Empty periodically. Everything here has either a
copy in the monorepo (via git history) or no remaining value.
Safe to delete at any time.

---

*SOVEREIGN Platform · Agent Transfer Handoff · June 25, 2026*
*Pre-Decisional · Internal Working Document*
