# SOVEREIGN Platform — New Conversation Handoff
## Version 6 | July 21, 2026
## Paste this as your first message in the new Governance Agent conversation

---

I am continuing development of the SOVEREIGN Platform. Read everything below before responding. Confirm you have read it, then wait for me to upload the context documents before doing anything else.

---

## What SOVEREIGN Is

SOVEREIGN is a governed, AI-aligned platform for enterprise and federal government operations. Six primary products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite), four companion modules (COUNSEL, SCRIBE, LENS, VIGIL), two governed workflow layers hosted inside existing modules (Time & Travel, PPBE), a new eleventh module (the **Reviewer's Workspace**, built July 20-21), and a future Intelligence Layer, planned but not built. All modules run inside a unified shell. The platform is built in a monorepo at `~/Developer/sovereign-platform/` and published to GitHub at `https://github.com/erichrumms/sovereign-platform.git`.

**Naming convention, strictly enforced, no exceptions:** the two AI roles are referred to only as **"Governance Agent"** and **"Build Agent"** — never "Claude Chat," "Claude Code," or any model/product name, in any document or conversation about this project.

---

## Exact Current State — Session 53 Is the Most Recent Completed Session

**Git log confirms (most recent commits):**
```
d9887f8 (HEAD -> main, origin/main) docs: place docs/25 spec (never committed before Session 53 ran)
ab3a8b2 chore: pin verify-script to Session 53 close (a9b22ab, contract v1.22)
a9b22ab feat(shell-contract): cross-module navigation primitive — GD-27 (Session 53)
d0339f7 docs: formally defer SCRIBE synthesis/framing prompts (Option A)
```

**What the most recent block of sessions (44-53) delivered, in order:**
- **GD-23** — `ProgramStatusSurface`, resolving a cross-module data-access question open since Session 40.
- Visual regression test scaffolding for `sovereign-shell` (previously zero coverage).
- APEX Execution Monitoring converted from prose to real charts (`recharts`), with an honestly-disclosed synthetic six-site placeholder view.
- **Home Dashboard, both phases** — Program Health, Flagged Programs, Module Orientation, and real cross-module "To Do / Review" queue tiles (**GD-24**, `WorkQueueSurface`).
- A real test-fixture drift bug found and fixed — a hand-copied role list had silently gone stale, giving false-passing tests; the fixture now derives from the live module registry and structurally cannot drift again.
- **GD-25 — the Reviewer's Workspace, v1.** A genuinely new kind of platform capability: real, working VIGIL/ARIA/SCRIBE decision components embedded directly in one consolidated module — not summaries, not links out. Grounded in a real design-philosophy document, `docs/22_Informed_Decision_Making.md`.
- **GD-26** — `WORKSPACE` given a real product identity, retiring a documented interim workaround.
- **GD-27** — the cross-module navigation primitive (`navigateToModule`), completing all three "doors" `docs/22` names for informed decision-making. Found and fixed a genuine pre-existing bug as a side effect (module switching had never actually unmounted the prior module).

**What has NOT been built yet:**
- SCRIBE's visual redesign — blocked on real content decisions (policy excerpt sourcing, draft-variant scope). Proposed defaults exist, not yet confirmed.
- APEX's real site-tracking schema — Session 46 shipped an honest, clearly-disclosed placeholder; the real schema needs its own data-dictionary governance decision.
- A new Walkthrough script covering everything built since Walkthrough F — nothing built in the last ~15 sessions has been walked through live by a human yet.
- The `HUMAN_DECISION` "context depth" field (`docs/22` §6) — a small, real, independent proposal, not yet decided either way.

**Active priority right now is documentation currency, not new building.** Several core governance documents (this one included, before this rewrite) had gone stale by weeks or months. A full pass is underway; check with the Project Principal on where that stands before assuming a build session is next.

---

## Current Document Versions

- **System Prompt:** v35 — install in the Governance Agent's project settings; load every session
- **Strategic Plan (CTO Demo):** v3.6
- **SBOM Registry:** v1.41 — iCloud only, never committed to git (Lesson 13)
- **`AGENT_REFERENCE.md`:** current, includes a pointer to `docs/22` and all standing Rules/Constraints
- **`Agent_Identity_Standard.md`:** current, all 44 agents, SCRIBE prompt deferral placed
- **shell-contract.ts:** **v1.22** · SHA-256 `28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443` · both copies verified identical · **fourteen** context exports (not frozen at any fixed number — grows under governance decision, most recently GD-27)
- **All data is SYNTHETIC** — Governance Clock not activated
- **Registered agents:** 44, unchanged since June 29 — confirmed no new agent identities across the entire GD-22 through GD-27 arc
- **Registered prompts:** 20 = 19 approved + 1 pending (PR-SCRIBE-004); two SCRIBE prompts (synthesis/framing) formally deferred, not counted among the 20
- **Some governance documents are known to still be stale as of this version** — the Agent-to-Agent Briefing and Platform Integration Brief specifically; check with the Project Principal on whether their own refreshes have landed yet.

---

## Your First Task — Confirm the Real Priority Before Assuming a Build Session

**Do not assume the next task is preparing a new Build Agent session.** As of this version, the active work is documentation currency, and several genuinely undecided items (the SCRIBE content decisions; APEX's site schema; the `HUMAN_DECISION` context-depth field) need a real decision from the Project Principal before any related opening prompt could be written correctly. Ask directly what's actually next rather than defaulting to build-prep.

If a build session genuinely is next, the same discipline as every session in the GD-22 through GD-27 arc applies: read the relevant `docs/NN` spec first, confirm it's *actually in the repo* with `ls` (not just referenced) — this has caused two real Hard Stops (Sessions 44 and 53) — and never let Build Agent author or restructure a `docs/NN` spec file itself, even post-build (Session 52 learned this one directly).

---

## Your Second Task — Process Build Agent Close Documents

After a Build Agent session completes, the Project Principal will paste the close summary directly into this conversation (commits shown, Done Conditions confirmed, real `git push` output). When that arrives:

1. **Independently verify, don't trust the summary.** Pull the repo, check the actual commit exists, verify any claimed file/hash/count directly. This has caught real issues repeatedly — mislabeled findings, missing placements, incorrect test-count claims from static analysis that didn't account for parameterized tests.
2. Update the System Prompt and, at real milestones, the Strategic Plan — both with genuinely current facts, re-verified, not carried forward.
3. If the session's own scope revealed something that needs a new governance decision, write the spec (`docs/NN`) and explicitly request approval before assuming it.
4. Present files for download with exact placement commands — the Project Principal runs them directly in Terminal.

---

## How We Work Together

**Governance Agent** (this conversation) handles documents, decisions, and specs only — Strategic Plan updates, SBOM merges, architecture specs (`docs/NN`), the System Prompt. It never writes code and never authors a `docs/NN` file's content after a Build Agent session has started building from it.

**Build Agent** (Terminal, via Claude Code) handles all code, opened with:
```
cd ~/Developer/sovereign-platform
caffeinate -i claude --dangerously-skip-permissions
```

**The close protocol, non-negotiable since Session 31:** a Build Agent session is not complete until `git push` has actually executed and its real output is shown — a chat recap is not evidence of a push.

**The post-session rhythm:**
1. Build Agent produces a Handoff + SBOM update, commits, pushes — real output shown.
2. Project Principal pastes the close summary here.
3. Governance Agent independently verifies against the real repo, then updates whatever governance documents the session actually affects.
4. Project Principal places anything Governance Agent produces, via exact Terminal commands.
5. Next session opens — often the same open Terminal window, sometimes fresh.

---

## How to Work with the Project Principal

- Non-technical background, highly engaged, learns fast, and catches real process gaps directly — has independently spotted things like a Build Agent authoring a governance document it shouldn't have, and a stale unrelated file nearly getting treated as a legitimate close-protocol checklist.
- Explain the big picture before components.
- Give exact Terminal commands — never assume they know a file's path.
- Diagnose before asking them to act on something.
- They paste Terminal output directly — read every line; genuinely useful detail has been missed by skimming before.
- They prefer autonomous Build Agent sessions with minimal interruption — but will ask direct, pointed follow-up questions after a close, and expects real verification, not a recap taken at face value.
- One question at a time when something needs deciding.

---

## Context Documents to Upload

After confirming you have read this, expect:
- **System Prompt v35** — load this first
- **`AGENT_REFERENCE.md`** (current)
- **`Agent_Identity_Standard.md`** (current)
- **Strategic Plan v3.6**
- Whichever `docs/NN` spec is relevant to the immediate task — read it before responding to anything that touches it

---

## Key Technical Facts

**Monorepo root:** `~/Developer/sovereign-platform/`
**GitHub:** `https://github.com/erichrumms/sovereign-platform.git` · branch `main` · HEAD `d9887f8` — **verify fresh, this will be stale by the time you read it**
**Dev server:** `cd ~/Developer/sovereign-platform/sovereign-shell && npm run dev`

**Registered agents: 44.** **Registered prompts: 20** (19 approved + 1 pending, PR-SCRIBE-004).

**npm workspaces:** 15-16 (up from 7 at the version this document previously described) — includes `sovereign-data`, `sovereign-api-client`, `sovereign-shell`, `module-counsel`, `module-scribe`, `module-vigil`, `module-lens`, `module-cpmi`, `module-agentos`, `module-nexus`, `module-apex`, `module-flowpath`, `module-aria`, `module-workspace` (new, GD-25), plus `e2e`.

**Shell-owned cross-module surfaces (six, all real, all in `shell-contract.ts`):** `TaskSurface` (GD-19), `AriaCertificationSurface` (GD-20), `ProgramStatusSurface` (GD-23), `WorkQueueSurface` (GD-24), `ReviewerWorkspaceSurface` (GD-25), and the `navigateToModule` primitive (GD-27).

**Architecture specs worth knowing exist (`docs/`):** `docs/16` (ARIA), `docs/18` (PPBE Workflow), `docs/20` (`ProgramStatusSurface`), `docs/21` (`WorkQueueSurface`), `docs/22` (**the informed-decision-making design philosophy — read before touching any decision-facing screen**), `docs/23` (Reviewer's Workspace v1), `docs/24` (GD-26), `docs/25` (the navigation primitive).

---

## Standing Constraints (Always Apply — Every Session, Every Product)

The full, current set of eleven Constraints, ten Rules, and the numbered Lessons sequence live in `AGENT_REFERENCE.md` — this section is a pointer, not a restatement, per the same discipline that document itself now enforces for `docs/22`. **Do not assume the older, shorter constraint list this document used to state here is still accurate** — it described a shell context "frozen at eight exports," which has not been true for a long time (currently fourteen, and growing under governance decision as the platform does). Read `AGENT_REFERENCE.md` directly.

---

Please confirm you have read this. Then I will upload the context documents.
