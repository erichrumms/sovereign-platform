# SOVEREIGN Platform — Agent-to-Agent Briefing
## For Any Claude Instance Opening a SOVEREIGN Session
## Updated June 22, 2026 — reflects monorepo path change

---

## Who You Are Talking To

The Project Principal is the sole human decision-maker on this project. Non-technical background, highly engaged, learning fast. He thinks in big pictures first and components second — always orient before you detail. He makes confident decisions when options are clearly framed with what each closes and what it leaves open. He pastes Terminal output directly into chat; read it carefully, it always contains useful information. One question at a time. Never assume he knows where a file is.

---

## What SOVEREIGN Is

SOVEREIGN is a governed, AI-aligned operations platform for enterprise and federal organizations — six integrated core products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite) plus four companion modules (COUNSEL, SCRIBE, LENS, VIGIL) and a future seventh product called the Intelligence Layer that must never be lost. Every current product builds toward it.

Three non-negotiable design outcomes govern every build decision: integration reliability, operational efficiency, and end-to-end security observability.

Three shared infrastructure layers underpin everything: the SOVEREIGN Security Observability Framework (shared nervous system), the CPMI-VRS AI Governance Standard (shared governance), and AgentOS (shared execution environment). No product builds its own version of any of these.

---

## ⚠️ PATH CHANGE — Effective June 22, 2026

The monorepo was moved to a new permanent location. Every `cd`, `cp`, and file-path command must use the new path.

| | Path |
|---|---|
| **Old (invalid)** | `~/sovereign-platform/` |
| **New (permanent)** | `~/Developer/sovereign-platform/` |
| **Absolute path** | `/Users/developmentsystem/Developer/sovereign-platform/` |

Git repository, history, GitHub remote, npm workspace linkages, shell contract, and all 546 tests are intact. Only the local directory path changed.

**Open Claude Code with:**
```
cd ~/Developer/sovereign-platform
claude
```

**Copy files to monorepo with:**
```
cp ~/Downloads/<filename> ~/Developer/sovereign-platform/
cp ~/Downloads/<filename> ~/Developer/sovereign-platform/docs/
```

---

## Current State — As of Session 7 (June 18, 2026)

| Item | State |
|---|---|
| Last completed session | Session 7 |
| HEAD / origin/main | `bd0e20d` |
| shell-contract.ts | v1.3 · SHA `4d78754f…6836acc2` · unchanged Sessions 3–7 |
| Integration Brief | v1.11 (path commands need updating to new monorepo path — will correct in v1.12) |
| SBOM Registry | v1.8 |
| JS tests passing | 419 (+ 127 Python = 546 total) |
| All data | SYNTHETIC — Governance Clock not activated |

**Companion suite build status:**
- COUNSEL — core complete (91 tests)
- SCRIBE — core complete (86 tests)
- VIGIL — core complete (63 tests)
- LENS — scaffold only (9 tests) · core unblocked · `03_LENS_Orientation_Module.md` authored

**Next build session:** Session 8 — LENS core + SCRIBE intermediate modes + Smart Capture

---

## The Two Claude Environments — Never Cross These

**Claude Chat** — governance only. Authors documents, merges SBOMs, approves prompts, produces session opening prompts, authors architecture specs. Never writes code.

**Claude Code** — code only. Writes, tests, and commits code. Produces session handoff and SBOM update at close. Never authors governance documents.

The Project Principal is the bridge. He uploads Claude Code's close artifacts to Claude Chat. He downloads Claude Chat's governance documents and installs them in the repo.

---

## The Invariant Constraints

These apply to every session, every product, every build decision without exception.

1. No independent security, governance, or audit systems — use the platform's
2. No shared entity field-name divergence from the data dictionary
3. No rewrite debt — connections are configuration changes, not rewrites
4. Every human decision event carries `decision_type`
5. No direct Anthropic API calls — `createSovereignClient()` only
6. `workflow_step_id` on every Logger call
7. Shell context frozen at eight exports
8. `shell-contract.ts` is a governance document — changes require a governance decision, version increment, changelog, impact assessment, and SHA-256 verification of both copies
9. All prompts registered before build
10. All agents registered before build
11. Five synced copies of shared artifacts — changes must propagate to all copies

---

## Where Everything Lives

### Mac Local File System

```
/Users/developmentsystem/
├── Developer/
│   ├── sovereign-platform/              ← MONOREPO ROOT (moved June 22, 2026)
│   │   ├── package.json
│   │   ├── SOVEREIGN_Platform_Integration_Brief_v1.11.md
│   │   ├── Agent_Identity_Standard.md   ← all 9 agents recorded
│   │   ├── sovereign-security/          ← 127 Python tests
│   │   ├── sovereign-api-client/        ← 143 JS tests
│   │   ├── sovereign-data/              ← 27 JS tests
│   │   ├── sovereign-shell/
│   │   │   ├── shell-contract.ts        ← v1.3 · SHA 4d78754f…6836acc2
│   │   │   └── src/register-modules.ts ← mounts counsel + scribe + vigil + lens
│   │   ├── module-counsel/              ← COMPLETE · 91 tests
│   │   ├── module-scribe/               ← Core COMPLETE · 86 tests
│   │   ├── module-vigil/                ← Core COMPLETE · 63 tests
│   │   ├── module-lens/                 ← Scaffold · 9 tests
│   │   └── docs/
│   │       ├── 03_LENS_Orientation_Module.md    ← LENS architecture spec
│   │       ├── vigil_alert_response.md          ← LENS source doc
│   │       ├── vigil_agent_approvals.md         ← LENS source doc
│   │       ├── 02_SCRIBE_Drafting_Workspace.md
│   │       ├── 04_VIGIL_Operator_Dashboard.md
│   │       └── sovereign_data_CompanionSuite_Specification.md
│   ├── grip-it-good/
│   ├── RuckItGood/
│   └── SpinWave/
```

### iCloud (`7 - SOVEREIGN/`)

```
7 - SOVEREIGN/
├── SOVEREIGN_Platform_Integration_Brief_v1.11.md
├── SOVEREIGN_New_Conversation_Handoff_v4_20260617.md
└── Companion Suite/Governance/
    ├── 03_LENS_Orientation_Module.md
    ├── SBOM_Registry_v1.8_MERGED.md
    ├── Prompt_Approvals_Session6.md
    ├── Prompt_Approvals_Session7.md
    ├── vigil_alert_response.md
    └── vigil_agent_approvals.md
```

### GitHub

```
origin → https://github.com/erichrumms/sovereign-platform.git
Branch: main · HEAD: bd0e20d · in sync with origin/main
```

---

## The Registered Agents (9 total)

| Agent ID | Module | Class | Status |
|---|---|---|---|
| `counsel-analyst` | COUNSEL | Analytical | Implemented |
| `scribe-drafter` | SCRIBE | Operational | Implemented |
| `scribe-style-analyst` | SCRIBE | Analytical | Implemented |
| `vigil-triage-analyst` | VIGIL | Monitoring | Implemented |
| `vigil-approval-agent` | VIGIL | Monitoring | Registered, not yet implemented |
| `lens-explainer` | LENS | Analytical* | Registered, scaffold only |
| `lens-orientation` | LENS | Analytical | Registered, scaffold only |

*Registered as Operational in scaffold — correct to Analytical in LENS core build session.

---

## The Approved Prompts (7 total)

| ID | Prompt | Approved |
|---|---|---|
| PR-COUNSEL-001/002/003 | Analysis, Counterargument, Pre-Mortem | June 15–16, 2026 |
| PR-SCRIBE-001 | Drafting Engine | June 16, 2026 |
| PR-SCRIBE-004 | Style Analysis | June 17, 2026 |
| PR-VIGIL-001 | Triage System | June 17, 2026 |
| PR-LENS-001 | Explainer System | June 18, 2026 |

Not yet authored: PR-SCRIBE-002, PR-SCRIBE-003, PR-LENS-002.

---

## Open Governance Items — Most Consequential for Session 8

**Alert-response HumanDecisionType deferred to v1.4** — VIGIL alert responses emit `ALERT_*` only. Do not invent `HumanDecisionType` members for alert responses.

**SCRIBE intermediate modes (`synthesis`, `framing`)** — no product intake schema; cannot run schema validation. Build in Session 8; no new governance decisions needed.

**`ctx.data` cross-session store** — StyleProfile injectable port is built; cross-session persistence needs a shell-contract v1.4 governance decision.

**`vigil-approval-agent` still deferred** — do not register until the Agent Approval flow build session.

**`lens-explainer` agent class** — registered as Operational in scaffold; correct to Analytical in LENS core build session.

**Integration Brief v1.11 path commands** — two copy commands in §18 still reference the old `~/sovereign-platform/` path. Correct in v1.12.

---

## The Post-Session Rhythm — Every Session

```
Claude Code closes → handoff + SBOM update committed + pushed
        ↓
Project Principal copies close artifacts → uploads to Claude Chat
        ↓
Claude Chat produces → merged SBOM + updated Integration Brief
                     + prompt approval records + any new spec docs
        ↓
Project Principal downloads → copies Brief + specs to monorepo
                            → commits + pushes → places files in iCloud
        ↓
Next session → gather script → Claude Code → context paste → opening prompt
```

Never skip the handoff. Never skip the post-session document cycle. Claude has no memory between sessions — the documents are the entire institutional memory of this project.

---

## How to Open the Next Session

**Step 1 — Run the gather script**
```
~/Developer/sovereign-platform/gather_session8_context.sh
```
*(The gather script must be updated to use the new monorepo path before running.)*

**Step 2 — Open Claude Code**
```
cd ~/Developer/sovereign-platform
claude
```

**Step 3 — Paste context** (clipboard from gather script)

**Step 4 — Paste the session opening prompt** (produced by Claude Chat)

**Step 5 — Claude Code confirms files, restates done condition, waits for approval**

**Step 6 — Project Principal approves. Build begins.**

---

## Key Decision Points Where the Project Principal Acts

- **Approving the session done condition** — before any code is written
- **Confirming each deliverable** — before Claude Code proceeds to the next
- **Approving prompts** — Claude cannot self-approve; every PR-* requires explicit Project Principal approval in Claude Chat
- **Resolving governance forks** — when Claude Code surfaces an architectural conflict it stops and presents options; the Project Principal decides
- **Downloading and placing files** — Integration Brief to monorepo root, specs to `docs/`, all files to iCloud
- **Committing and pushing governance docs** — after every post-session file placement

---

## What Makes a Session Go Badly — and How to Prevent It

| Problem | Prevention |
|---|---|
| Wrong monorepo path used | All commands use `~/Developer/sovereign-platform/` — not the old path |
| Claude Code opens against stale Integration Brief | Always copy the new Brief to monorepo root and push before next session |
| Gather script has wrong file list or wrong path | Update both the file list (per Integration Brief §15) and the monorepo path before each session |
| Claude Code invents architecture | Every module needs a spec doc before its core build session — author in Claude Chat first |
| Prompt runs before approval | Register as PENDING, approve in Claude Chat, never self-approve |
| Governance decision made in code | Claude Code surfaces forks and stops — Project Principal decides in chat |
| Session closes without handoff | Non-negotiable — always tell Claude Code to produce the handoff before closing |

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated June 22, 2026*
*Supersedes the June 18, 2026 version — path change only, all governance state unchanged*
*Pre-Decisional · Internal Working Document*
