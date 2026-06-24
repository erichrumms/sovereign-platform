# SOVEREIGN Platform — Agent-to-Agent Briefing
## For Any Claude Instance Opening a SOVEREIGN Session
## Updated June 23, 2026 — reflects Session 10 close, Stage 2 complete, shell-contract v1.4

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

## Current Build State — As of Session 10 (June 23, 2026)

| Item | State |
|---|---|
| Last completed session | Session 10 |
| HEAD / origin/main | `99b2a35` |
| shell-contract.ts | **v1.4 · SHA `1a557e3ba3747ab8b922649a42602df8fa4aec16ace10d9eabd9f48acbb435d9`** |
| Previous shell-contract hash (retired) | v1.3 · `4d78754f…6836acc2` — do not use |
| Integration Brief | v1.16 |
| SBOM Registry | v1.11 |
| JS tests passing | 563 (+ 127 Python = 690 total) |
| Stage 1 | COMPLETE |
| **Stage 2** | **COMPLETE** |
| All data | SYNTHETIC — Governance Clock not activated |

**Companion suite build status — ALL COMPLETE:**
- COUNSEL — core complete (91 tests)
- SCRIBE — core complete including intermediate modes and Smart Capture (122 tests)
- VIGIL — core complete including Agent Approval Flow (113 tests)
- LENS — core complete (58 tests)

**Next build session:** Session 11 — Stage 3 (CPMI-VRS elevation). Scope to be
confirmed by Project Principal in Claude Chat before Session 11 opens.

---

## ⚠️ Shell Contract — Version Change

The shell contract changed in Session 10 (GD-6). The new hash is mandatory for all
sessions from Session 11 onward.

| | Hash |
|---|---|
| **Current (v1.4 — use this)** | `1a557e3ba3747ab8b922649a42602df8fa4aec16ace10d9eabd9f48acbb435d9` |
| **Retired (v1.3 — do not use)** | `4d78754f…6836acc2` |

Every session must verify both copies of `shell-contract.ts` match the v1.4 hash
before any build work begins.

**v1.4 additions (GD-6, Session 10):**
- `SovereignEventType`: `AGENT_ACTION_APPROVED`, `AGENT_ACTION_REJECTED`,
  `AGENT_ACTION_ESCALATED`, `AGENT_ACTION_EXPIRED`
- `HumanDecisionType`: `AGENT_APPROVAL` (11 members total)

---

## Monorepo Location

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
```

**Absolute path:** `/Users/developmentsystem/Developer/sovereign-platform/`
**GitHub remote:** `https://github.com/erichrumms/sovereign-platform.git`
**Branch:** `main` · HEAD: `99b2a35`

**Open Claude Code with:**
```bash
cd ~/Developer/sovereign-platform
caffeinate -i claude --dangerously-skip-permissions
```

**Copy files to monorepo with:**
```bash
cp ~/Downloads/<filename> ~/Developer/sovereign-platform/
cp ~/Downloads/<filename> ~/Developer/sovereign-platform/docs/
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
8. `shell-contract.ts` is a governance document — v1.4, SHA above. Changes require
   governance decision, version increment, changelog, impact assessment, SHA-256
   verification of both copies, and propagation to all synced shared-type copies
9. All prompts registered before build
10. All agents registered before build
11. Five synced copies of shared artifacts — changes must propagate to all copies

---

## Where Everything Lives

### Mac Local File System

```
/Users/developmentsystem/
├── Developer/
│   ├── sovereign-platform/              ← MONOREPO ROOT
│   │   ├── package.json
│   │   ├── SOVEREIGN_Platform_Integration_Brief_v1.16.md
│   │   ├── Agent_Identity_Standard.md   ← v1.1 · 8 companion agents
│   │   ├── SOVEREIGN_Agent_to_Agent_Briefing.md
│   │   ├── sovereign-security/          ← 127 Python tests
│   │   ├── sovereign-api-client/        ← 143 tests
│   │   ├── sovereign-data/              ← 36 tests · HumanDecisionType 11 members
│   │   ├── sovereign-shell/
│   │   │   └── shell-contract.ts        ← v1.4 · SHA 1a557e3b…b435d9
│   │   ├── module-counsel/              ← COMPLETE · 91 tests
│   │   ├── module-scribe/               ← COMPLETE · 122 tests
│   │   ├── module-vigil/                ← COMPLETE · 113 tests
│   │   ├── module-lens/                 ← COMPLETE · 58 tests
│   │   └── docs/
│   │       ├── 02_SCRIBE_Drafting_Workspace.md
│   │       ├── 03_LENS_Orientation_Module.md
│   │       ├── 04_VIGIL_Operator_Dashboard.md
│   │       ├── 05_VIGIL_Agent_Approval.md
│   │       ├── 06_LocalLLM_Architecture.md
│   │       ├── 07_LocalLLM_Decision_Framework.md
│   │       ├── vigil_alert_response.md
│   │       └── vigil_agent_approvals.md
│   ├── grip-it-good/
│   ├── RuckItGood/
│   └── SpinWave/
```

### iCloud (`7 - SOVEREIGN/`)

```
7 - SOVEREIGN/
├── SOVEREIGN_Platform_Integration_Brief_v1.16.md   ← current governing document
├── SOVEREIGN_Agent_to_Agent_Briefing.md            ← this document
├── SOVEREIGN_New_Conversation_Handoff_v5_20260622.md
├── Agent_Identity_Standard.md
├── SOVEREIGN_System_Prompt_v4.md
├── system_prompt.md
├── PROJECT_SUMMARY.md
├── AGENT_BACKGROUND_AND_LESSONS_LEARNED.md
├── Agent_Operator_Scope_SOVEREIGN.md
├── Decision_Matrix.md
├── Session Handoffs/
├── Companion Suite/Governance/
│   └── SBOM_Registry_v1.11_MERGED.md
├── Product Transition Packages/
│   └── PPBE/
│       └── SOVEREIGN_PPBE_Integration_Architecture_Draft1.md
└── Archive/
```

### GitHub

```
origin → https://github.com/erichrumms/sovereign-platform.git
Branch: main · HEAD: 99b2a35 · in sync with origin/main
```

---

## The Registered Agents (8 companion-suite agents)

| Agent ID | Module | Class | Status |
|---|---|---|---|
| `counsel-analyst` | COUNSEL | Analytical | Implemented |
| `scribe-drafter` | SCRIBE | Operational | Implemented |
| `scribe-style-analyst` | SCRIBE | Analytical | Implemented |
| `vigil-triage-analyst` | VIGIL | Monitoring | Implemented |
| `vigil-approval-agent` | VIGIL | Monitoring | Implemented |
| `lens-explainer` | LENS | Analytical | Implemented |
| `lens-orientation` | LENS | Analytical | Registered — scaffold only |

---

## The Approved Prompts (8 total)

| ID | Prompt | Approved |
|---|---|---|
| PR-COUNSEL-001/002/003 | Analysis, Counterargument, Pre-Mortem | June 15–16, 2026 |
| PR-SCRIBE-001 | Drafting Engine (+ synthesis/framing) | June 16, 2026 |
| PR-SCRIBE-004 | Style Analysis | June 17, 2026 |
| PR-VIGIL-001 | Triage System | June 17, 2026 |
| PR-VIGIL-002 | Approval System | June 23, 2026 |
| PR-LENS-001 | Explainer System | June 18, 2026 |

---

## Open Governance Items — Most Consequential for Session 11

**Five Local LLM decisions (R7)** — must be resolved before Stage 4. See
`docs/06_LocalLLM_Architecture.md §8.1`. Architecture and decision framework authored.

**PPBE integration (R12)** — six governance decisions required before Phase I opens.
Architecture in `Product Transition Packages/PPBE/`. Deferred Stage 5+.

**Alert-response `HumanDecisionType` members** — still deferred; consider batching
into next shell-contract change.

**Live backings** — both VIGIL feeds (alert endpoint, approval port) run on
synthetic/dev backings. Injectable to live by configuration when AgentOS is built.
No VIGIL rewrite required.

---

## The Post-Session Rhythm — Every Session

```
Claude Code closes → handoff + SBOM update committed + pushed
        ↓
Project Principal copies close artifacts → uploads to Claude Chat
        ↓
Claude Chat produces → merged SBOM + updated Integration Brief
                     + any new governance documents
        ↓
Project Principal downloads → copies Brief to monorepo root
                            → commits + pushes → places files in iCloud
        ↓
Next session → gather script → Claude Code → context paste → opening prompt
```

Never skip the handoff. Never skip the post-session document cycle. Claude has no
memory between sessions — the documents are the entire institutional memory of this
project.

---

## How to Open the Next Session

**Step 1 — Run the gather script**
```bash
~/Developer/sovereign-platform/gather_session10_context.sh
```
*(Update the gather script file list for Session 11 scope before running.)*

**Step 2 — Open Claude Code**
```bash
cd ~/Developer/sovereign-platform
caffeinate -i claude --dangerously-skip-permissions
```

**Step 3 — Shift+Tab** for auto mode

**Step 4 — Paste context** (clipboard from gather script)

**Step 5 — Paste the session opening prompt** (produced by Claude Chat)

**Step 6 — Claude Code confirms files, restates done condition, waits for approval**

**Step 7 — Project Principal approves. Build begins.**

---

## What Makes a Session Go Badly — and How to Prevent It

| Problem | Prevention |
|---|---|
| Wrong shell-contract hash used | Verify v1.4 hash `1a557e3b…b435d9` before any build work begins |
| Claude Code opens against stale Integration Brief | Always copy the new Brief to monorepo root and push before next session |
| Gather script has wrong file list or wrong path | Update file list per Integration Brief §15 before each session |
| Claude Code invents architecture | Every module needs a spec doc before its core build session |
| Prompt runs before approval | Register as PENDING, approve in Claude Chat, never self-approve |
| Governance decision made in code | Claude Code surfaces forks and stops — Project Principal decides |
| Session closes without handoff | Non-negotiable — always tell Claude Code to produce the handoff |
| Shell-contract change without full governance process | Version increment + changelog + impact assessment + dual-copy SHA verification + Constraint #11 propagation |

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated June 23, 2026*
*Supersedes the June 22, 2026 version — Session 10 complete, Stage 2 complete,
shell-contract v1.4, PPBE recorded*
*Pre-Decisional · Internal Working Document*
