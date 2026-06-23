# SOVEREIGN Platform — New Conversation Handoff
## Version 5 | June 22, 2026
## Paste this as your first message in the new Claude Chat conversation

---

I am continuing development of the SOVEREIGN Platform. Read everything below before responding. Confirm you have read it, then wait for me to upload the context documents before doing anything else.

---

## What SOVEREIGN Is

SOVEREIGN is a governed, AI-aligned platform for enterprise and federal government operations. It consists of six primary products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite) plus four companion modules (COUNSEL, SCRIBE, LENS, VIGIL) and a future seventh product called the Intelligence Layer. All modules run inside a unified shell (Option C architecture). The platform is built in a monorepo at `~/Developer/sovereign-platform/` on a Mac Mini and published to GitHub at `https://github.com/erichrumms/sovereign-platform.git`.

**Path note:** The monorepo moved from `~/sovereign-platform/` to `~/Developer/sovereign-platform/` on June 22, 2026. All commands use the new path. Git history, remote, and all tests are intact.

---

## Exact Current State — Session 7 Is the Most Recent Completed Session

Session 8 has not started. The monorepo is confirmed at the Session 7 close state.

**Git log confirms (most recent commits):**
```
e5b7c2a (HEAD -> main, origin/main) docs: Integration Brief v1.12 (path fix) + Agent Briefing
bd0e20d Integration Brief v1.11 + LENS architecture spec
240cf18 Session 7 close: handoff + SBOM updates
6a6b1c9 D2 — LENS Scaffold
239cf82 D1 — VIGIL Core
442fda1 Session 6 close: commit three reference spec docs
```

**What Session 7 delivered:**
- VIGIL core — Anomaly Triage Assistant (PR-VIGIL-001, live), `vigil-triage-analyst` registered, Alert Queue wired (null-graceful), human-gated alert response via GD-4 ALERT_* events (46 new tests)
- LENS scaffold — `module-lens` mounting, `lens-explainer` and `lens-orientation` agent cards, PR-LENS-001 authored and APPROVED (9 new tests)
- Total: 419 JS tests + 127 Python = 546 passing

**What has NOT been built yet (Session 8 scope):**
- LENS core — `lens-explainer` powered by the two source documents (`vigil_alert_response.md`, `vigil_agent_approvals.md`). Architecture spec `03_LENS_Orientation_Module.md` is authored and in repo — LENS core is unblocked.
- SCRIBE intermediate modes (`synthesis`, `framing`) — no product intake schema; deferred from Session 6
- Smart Capture (voice) — `VOICE_CAPTURE_COMPLETED` already an approved event type (GD-2)

---

## Current Document Versions

- **Integration Brief:** v1.12 — this is the governing document; load it every session
- **SBOM Registry:** v1.8
- **shell-contract.ts:** v1.3 · SHA-256: `4d78754f…6836acc2` · unchanged through Sessions 3–7
- **All data is SYNTHETIC** — Governance Clock not activated
- **Six primary product governance records:** all INCOMPLETE
- **Approved prompts:** 7 of ~10 registered (PR-COUNSEL-001/002/003, PR-SCRIBE-001, PR-SCRIBE-004, PR-VIGIL-001, PR-LENS-001)
- **Registered agents:** 9 total (counsel-analyst, scribe-drafter, scribe-style-analyst, vigil-triage-analyst, vigil-approval-agent, lens-explainer, lens-orientation — last two scaffold only)

---

## Your First Task — Prepare Session 8

When I upload the context documents, your job is to produce a Session 8 opening prompt for Claude Code. The Session 8 done condition is:

1. **LENS core** — `lens-explainer` agent built and wired. Source documents are `docs/vigil_alert_response.md` and `docs/vigil_agent_approvals.md`. Three-tier fallback: live → cached → static. `LensExplanation` entity added to `sovereign-data`. Schema validation before output shown. Logger emission with `workflow_step_id`. Approved event types only — do not invent `LENS_*` types. Correct `lens-explainer` agent class from Operational to Analytical. Pipeline Navigator and AI Transparency Panel built per `docs/03_LENS_Orientation_Module.md`.

2. **SCRIBE intermediate modes** — `synthesis` and `framing` modes added. No product intake schema — these produce intermediate prose for human carry-forward, not canonical data objects. Do not attempt schema validation against a product schema.

3. **Smart Capture** — voice input using the already-approved `VOICE_CAPTURE_COMPLETED` event type (GD-2). No new event type needed.

**Governance decisions already made for Session 8:**
- `lens-explainer` class: correct to Analytical in the LENS core build (registered as Operational in scaffold — flag from Session 7)
- `LensExplanation` entity: add to `sovereign-data` package in LENS core build session
- SCRIBE intermediate modes: no schema validation (no product intake schema)
- `VOICE_CAPTURE_COMPLETED`: already approved — no new governance decision needed
- `vigil-approval-agent`: still deferred — do not register this session

---

## Your Second Task — Process Session 8 Close Documents

After Session 8 completes in Claude Code, the Project Principal will upload:
- `Session_8_Handoff_[name]_[date].md`
- `[module]/SBOM_Session8_Update.md`

When those arrive, produce:
1. Merged SBOM — append Session 8 update into current registry, produce `SBOM_Registry_v1.9_MERGED.md`
2. Integration Brief v1.13 — incorporate all update flags from the Session 8 handoff
3. Prompt approval records for any new prompts authored this session
4. Present all files for download with exact placement instructions

---

## How We Work Together

**Claude Chat** (this conversation) handles governance documents only — Integration Brief updates, SBOM merges, prompt approval records, decision records, specification documents. It never writes code.

**Claude Code** (Terminal on Mac Mini) handles all code. The Project Principal opens it with:
```
cd ~/Developer/sovereign-platform
claude
```

**The post-session rhythm:**
1. Claude Code produces session handoff + SBOM update, commits and pushes to GitHub
2. Project Principal copies those files and uploads them here
3. Claude Chat produces merged SBOM + updated Integration Brief + approval records
4. Project Principal downloads those files, places them in `7 - SOVEREIGN/` iCloud folder, and copies the Integration Brief to `~/Developer/sovereign-platform/`
5. Next Claude Code session opens

---

## How to Work with the Project Principal

- Non-technical background but highly engaged and learning quickly
- Explain the big picture before components
- Give step-by-step Terminal instructions with exact commands — never assume they know where a file is
- When something goes wrong, diagnose before asking them to act
- They paste Terminal output directly into chat — read it carefully, it always contains useful information
- They prefer autonomous Claude Code operation — minimize interruptions during build sessions
- They make decisions confidently when options are clearly framed with what each closes and what it leaves open
- Do not ask multiple questions at once — one question, wait for the answer

---

## Context Documents to Upload

After confirming you have read this, I will upload:
- `SOVEREIGN_Platform_Integration_Brief_v1.12.md` — load this first; it governs everything
- `PROJECT_SUMMARY.md`
- `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
- `Session_7_Handoff_SOVEREIGN_VIGILCore_LENSScaffold_20260618.md`

---

## Key Technical Facts

**Monorepo root:** `~/Developer/sovereign-platform/`
**GitHub:** `https://github.com/erichrumms/sovereign-platform.git` · branch `main` · HEAD `e5b7c2a`
**Dev server:** `cd ~/Developer/sovereign-platform/sovereign-shell && npm run dev` → `http://localhost:3000`

**Registered agents (9):** `counsel-analyst`, `scribe-drafter`, `scribe-style-analyst`, `lens-explainer` (scaffold — Analytical), `lens-orientation` (scaffold — Analytical), `vigil-triage-analyst` (implemented), `vigil-approval-agent` (registered, not yet implemented)

**Approved prompts (7):** PR-COUNSEL-001/002/003, PR-SCRIBE-001, PR-SCRIBE-004, PR-VIGIL-001, PR-LENS-001

**npm workspaces:** `@sovereign/data`, `@sovereign/api-client`, `@sovereign/shell`, `@sovereign/module-counsel`, `@sovereign/module-scribe`, `@sovereign/module-vigil`, `@sovereign/module-lens`

**LENS source documents:** `docs/vigil_alert_response.md`, `docs/vigil_agent_approvals.md`
**LENS architecture spec:** `docs/03_LENS_Orientation_Module.md` ✅ in repo

**Remaining build sessions after Session 8:**
- Session 9: Security Framework live wiring — configures `VIGIL_ALERT_ENDPOINT`; VIGIL queue and triage activate with zero rewrites
- Session 10: VIGIL Agent Approval flow + `vigil-approval-agent` registration
- Session 11: Demo hardening and runbook

---

## Standing Constraints (Always Apply — Every Session, Every Product)

1. No independent security, governance, or audit systems
2. No shared entity field-name divergence from the data dictionary
3. No rewrite debt — connections are configuration changes
4. Every human decision event carries `decision_type`
5. No direct Anthropic API calls — `createSovereignClient()` only
6. `workflow_step_id` on every Logger call
7. Shell context frozen at eight exports
8. `shell-contract.ts` changes require governance decision + version increment + changelog + impact assessment + SHA-256 verification of both copies
9. All prompts registered before build
10. All agents registered before build
11. Five synced copies of shared artifacts — changes must propagate to all copies

---

Please confirm you have read this. Then I will upload the context documents.
