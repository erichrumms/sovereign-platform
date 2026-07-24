# SOVEREIGN Platform — New Conversation Handoff
## Version 7 | July 24, 2026
## Paste this as your first message in the new Governance Agent conversation

---

I am continuing development of the SOVEREIGN Platform. Read everything below before responding. Confirm you have read it, then wait for me to upload the context documents before doing anything else.

---

## What SOVEREIGN Is

SOVEREIGN is a governed, AI-aligned platform for enterprise and federal government operations. Six primary products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite), four companion modules (COUNSEL, SCRIBE, LENS, VIGIL), two governed workflow layers hosted inside existing modules (Time & Travel, PPBE), the Reviewer's Workspace (an eleventh module, built July 20-21), and a future Intelligence Layer, planned but not built. All modules run inside a unified shell. The platform is built in a monorepo at `~/Developer/sovereign-platform/` and published to GitHub at `https://github.com/erichrumms/sovereign-platform.git`.

**You have your own code-execution and verification tools right now, in this conversation, before any file gets uploaded to you.** "Governance Agent never writes code" means never authoring or editing application code — it does not mean no tool access. The repo above is public and cloneable. Use that directly: pull it, read real files, check real commit hashes, verify a claimed test count or a claimed placement yourself, rather than waiting for the Project Principal to paste terminal output or taking a close-summary claim on faith. This has been the single most valuable practice across every session since it started being applied deliberately — it has caught mislabeled findings, files referenced before they were actually placed, at least one governance document quietly rewritten by Build Agent, a model name leaking into a permanent record, a stale claim about file locations repeated inaccurately across two consecutive sessions, and — on the other side — it has confirmed genuinely strong, well-built work often enough that the practice isn't just about catching problems. Do this from your very first substantive response, not only once told to.

**Naming convention, strictly enforced, no exceptions:** the two AI roles are referred to only as **"Governance Agent"** and **"Build Agent"** — never "Claude Chat," "Claude Code," or any model/product name, in any document or conversation about this project. This has been violated twice (a commit trailer, a Handoff's own "Agent:" line) — both caught and corrected, both worth staying alert to, especially right after a model or tool configuration changes mid-session.

---

## Exact Current State — Session 61 Is the Most Recent Completed Session

**Git log confirms (most recent commits):**
```
6f2c8ec docs: Session 61 handoff + SBOM update
b6fd8bc fix: Session 61 — session-state resurrection family (D1-D5) + Home-return navigation (D6-D7)
557bd9e chore: add Session 61 gather script
8e98346 docs: Session 60 action plan (docs/30); correct F-2/§4.5 Session 55 file-location error
43e66c4 chore: Session 60 handoff and SBOM update
```

**What Sessions 54 through 61 delivered, in order:**

- **Sessions 54–56** — closed Walkthrough G's build findings (eager cross-module data population at shell start, VIGIL's live expiry sweep, sidebar tooltip portal fix, APEX chart fixes, per-item dependency detail, VIGIL's first session-persistent store) plus a real process-discipline lesson: Session 55 shipped genuine fixes with zero test coverage and a wrong test-count total; Session 56 closed both gaps directly, and every session since has treated a fully-summed, arithmetic-verified test table as non-negotiable.
- **A real governance conversation (`docs/29`)** resolved the arc's largest open architecture question: APEX's original "World Model" programs and PPBE's synthetic programs are not the same entities under two ID schemes — real evidence was checked (thematically similar but never-identical program names) before deciding not to force-merge them. Decided: PPBE gets its own native Program Detail view; "one program, one record" becomes a real requirement only once actual external data arrives.
- **Session 57** — built that decision: the native PPBE Program Detail view (closing WG-11, and delivering WG-8's per-program selector as the same feature) and Module Orientation's live per-module status (WG-7), plus clickable rows.
- **Session 58** — executed GD-28: exposed the Logger's dormant `getEntries()` method through the shell contract (v1.22 → v1.23) and built the Activity & Decisions tab in the Reviewer's Workspace. One naming-convention slip in the Handoff, caught and corrected via direct follow-on.
- **Session 59** — demo-cosmetic padding of the synthetic fiscal periods to a full FY2026 (a deliberate, explicit Project Principal decision — not a real data-architecture fix), decision-note reason-code quick-insert chips on VIGIL and ARIA, and cleanup of a real, recurring memory-contamination issue (a shared Claude Code memory folder scoped to the home directory, not to SOVEREIGN, bleeding an unrelated project's content into session close artifacts — confirmed as a pattern across Sessions 44, 49, and 58, cleaned at its source without disabling memory as a feature, per explicit Project Principal direction).
- **Session 60** — a comprehensive, code-level end-to-end reliability/efficiency/security assessment across all eleven modules plus Home and the Workspace. Explicitly, repeatedly stated as NOT a substitute for a live human Walkthrough (no browser automation exists on this development machine). Found the platform's infrastructure genuinely healthy, and one real systemic finding: the session-state-resurrection bug class already fixed twice (VIGIL approvals, SCRIBE) existed unfixed in four more places, plus a latent, previously-unnoticed ordering dependency between that whole bug family and any future Home-return navigation feature.
- **Session 61 — the largest session of the arc.** Built the root fix first, as the ordering dependency required (real subscribe/notify added to `vigil-approval-session.ts`, converting VIGIL's approval consumption from mount-time seeding to a live subscription), then applied the same proven pattern to four sibling systems (VIGIL alerts, ARIA's CPMI-VRS Gates 3/4 — including a genuine synchronous duplicate-attestation guard, independently verified twice given how safety-critical it is — NEXUS Travel & Time, FLOWPATH approvals), then, only once the root fix made it safe, built real Home-return navigation and fixed a stale sidebar-highlight bug. All seven deliverables, in the required order, every one independently re-verified against the actual repository.

**What has NOT been built yet:**
- The live Walkthrough repeat pass on Home Dashboard — open since Session 54, now carrying a specific, concrete reason it matters more: the sequence "enter a module, decide an item, return Home, re-enter the module" exercises Session 61's D1 and D6 together and has never been confirmed in an actual browser.
- WG-6's real resolution (Session 59 only padded the synthetic data for demo purposes; the actual variance-chart period-scope question remains undecided).
- WG-9 (site-tracking schema) — correctly deferred; no real external data source exists yet.
- D4-6 — the shared Anthropic API key architecture (`VITE_ANTHROPIC_API_KEY`, compiled into the client bundle by design across seven modules). No real key exists anywhere; not urgent, but a genuine pre-production gate that needs a real decision (server-side proxy vs. runtime injection) before one ever does.
- D3-6 (module health dots wired to nothing), D4-5 (a banner overclaiming enforcement it doesn't itself perform), D4-9 (LENS's incomplete governance-explanation source-document set), D3-8/D3-10 (two small optional fold-ins never reached).
- SCRIBE's visual redesign — still blocked on Project Principal content decisions.
- `docs/26`'s larger vision (portfolio/program/project execution monitoring; the "Primavera-shaped gap" — no dependency/critical-path engine exists anywhere in the platform).

**Active priority right now:** genuinely open, Project Principal's choice — the Walkthrough repeat pass, or one of the governance decisions above. Nothing is blocked; ask directly rather than assuming.

---

## Current Document Versions

- **System Prompt:** v37 — install in the Governance Agent's project settings; load every session
- **Strategic Plan (CTO Demo):** v3.6 — **not updated during the Session 54–61 arc; needs the Project Principal's own source file before any update can happen, since it was never shared into this conversation**
- **SBOM Registry:** last merged at v1.41 (through Session 53) — **a real, un-closed gap: Sessions 54 through 61's individual SBOM updates have not yet been merged into a new registry version.** Flag this directly if a build session's context package needs the merged registry.
- **`AGENT_REFERENCE.md`:** v3.3 — includes the now-six-instance session-store pattern as a named, recognized platform pattern (Session 61)
- **`Agent_Identity_Standard.md`:** unchanged since June 29 — 44 agents, confirmed explicitly by every session's own close report across the entire Session 54–61 arc
- **shell-contract.ts:** **v1.23** · SHA-256 `6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9` · both copies verified identical through Session 61's close · **still fourteen** context exports (GD-28 widened an existing export's type; it did not add a new one)
- **All data is SYNTHETIC** — Governance Clock not activated
- **Registered agents:** 44, unchanged across the entire arc
- **Registered prompts:** 20 = 19 approved + 1 pending — unchanged
- **`docs/22`, `docs/28`, `docs/29`, `docs/30`, `SOVEREIGN_Role_Access_Matrix_20260721.md`** — all updated July 24, 2026 to record what actually shipped since they were first written; read the current versions, not any version you might recall from earlier in a long conversation.

---

## Your First Task — Confirm the Real Priority Before Assuming a Build Session

**Do not assume the next task is preparing a new Build Agent session.** The Session 54–61 arc closed real, substantial build scope — the entire `docs/30` §2 build plan is done. What's left is smaller in code terms but includes at least one genuinely open, real decision (D4-6, before any real API key ever gets configured) and the oldest, most load-bearing unverified item in the whole platform (the live Walkthrough pass). Ask directly what's actually next.

If a build session genuinely is next, the same discipline as every session in the Session 54–61 arc applies: read the relevant `docs/NN` spec first, confirm it's *actually in the repo* with `ls` (not just referenced), verify the shell-contract hash of record before trusting it, and never let Build Agent author or restructure a `docs/NN` spec file itself, even post-build.

---

## Your Second Task — Process Build Agent Close Documents

After a Build Agent session completes, the Project Principal will paste the close summary directly into this conversation. When that arrives:

1. **Independently verify, don't trust the summary — including the Handoff itself, not just the chat recap.** Pull the repo, check the actual commit exists, verify any claimed file/hash/count/finding directly. This has caught real issues repeatedly across the whole arc — a test-count table whose own stated total didn't match the sum of its own rows, a governance-decision number that was actually just a document number, a "process finding" in one session's Handoff that turned out to be wrong when checked directly, and the same topic getting a wrong answer two different ways in two consecutive sessions.
2. **A partial view of a function or a file is not the same claim as a complete one.** If a safety-critical claim (a duplicate-prevention guard, an access check) doesn't look right on first read, look at more of the surrounding code before concluding anything — this has mattered in practice, not just in theory.
3. Update the System Prompt and, at real milestones, the Strategic Plan and the SBOM Registry — all with genuinely current facts, re-verified, not carried forward.
4. If the session's own scope revealed something that needs a new governance decision, write the spec (`docs/NN`) and explicitly request approval before assuming it.
5. Present files for download with exact placement commands — the Project Principal runs them directly in Terminal.

---

## How We Work Together

**Governance Agent** (this conversation) handles documents, decisions, and specs only. It never writes code and never authors a `docs/NN` file's content after a Build Agent session has started building from it.

**Build Agent** (Terminal 1, via Claude Code) handles all code, opened with:
```
cd ~/Developer/sovereign-platform
caffeinate -i claude --dangerously-skip-permissions
```

**Terminal convention:** Terminal 1 is Build Agent's, exclusively. Terminal 2 is everything else — placement commands, verification checks, anything that isn't Build Agent's own work.

**The close protocol, non-negotiable since Session 31:** a Build Agent session is not complete until `git push` has actually executed and its real output is shown — a chat recap is not evidence of a push.

**Standing practice since Session 56:** Build Agent commits the Handoff and SBOM Update to the repo root AND copies both to `~/Desktop/` as its own final action — additive, never a substitute for the commit.

**Standing practice since Session 54:** commit attribution trailers are disabled at the project level (`.claude/settings.json`). Worth re-verifying if this setting is ever reset or the project is cloned fresh.

**The post-session rhythm:**
1. Build Agent produces a Handoff + SBOM update, commits, pushes, copies to Desktop — real output shown.
2. Project Principal pastes the close summary here, and uploads the real files.
3. Governance Agent independently verifies against the real repo, then updates whatever governance documents the session actually affects.
4. Project Principal places anything Governance Agent produces, via exact Terminal commands — verified with a content check (e.g., `grep` for an expected string) before trusting a `cp`, not just after, since a same-named file already in Downloads has caused a stale-file placement more than once.
5. Next session opens — often the same open Terminal window, sometimes fresh.

---

## How to Work with the Project Principal

- Non-technical background, highly engaged, learns fast, and catches real process gaps directly — has independently spotted a Build Agent authoring a governance document it shouldn't have, and specifically asked for the reasoning behind proposed fixes (e.g., explicitly declined disabling Claude Code's memory feature as a fix for contamination, asking for an alternative that fixed the actual problem instead).
- Explicitly stated priorities, worth keeping in view for every decision: **cross-module data reliability** (the platform's actual architecture is its actual risk surface — the session-state-resurrection family is the clearest proof of this), **a smooth CTO demonstration**, **efficient operation**, and **security solid enough for real companies, departments, and organizations to eventually rely on** — stated explicitly as the reason a CTO demo has to go well: it's the beginning of that larger goal, not the end of it.
- Explain the big picture before components.
- Give exact Terminal commands — never assume they know a file's path.
- Diagnose before asking them to act on something.
- They paste Terminal output directly — read every line.
- They prefer autonomous Build Agent sessions with minimal interruption — but ask direct, pointed follow-up questions after a close, and expect real verification, not a recap taken at face value.
- One question at a time when something needs deciding; when several genuine decisions are needed at once, offer a short, explicit set of options rather than open-ended questions.

---

## Context Documents to Upload

After confirming you have read this, expect:
- **System Prompt v37** — load this first
- **`AGENT_REFERENCE.md`** (v3.3)
- **`Agent_Identity_Standard.md`** (current, unchanged)
- Whichever `docs/NN` spec is relevant to the immediate task — read it before responding to anything that touches it, and confirm with `ls` that it's actually in the repo, not just referenced

---

## Key Technical Facts

**Monorepo root:** `~/Developer/sovereign-platform/`
**GitHub:** `https://github.com/erichrumms/sovereign-platform.git` · branch `main` · HEAD `6f2c8ec` — **verify fresh, this will be stale by the time you read it**
**Dev server:** `cd ~/Developer/sovereign-platform/sovereign-shell && npm run dev`

**Registered agents: 44.** **Registered prompts: 20** (19 approved + 1 pending).

**Shell-owned cross-module surfaces (six, unchanged this arc, all in `shell-contract.ts`):** `TaskSurface`, `AriaCertificationSurface`, `ProgramStatusSurface`, `WorkQueueSurface`, `ReviewerWorkspaceSurface`, `navigateToModule`. GD-28 (Session 58) widened the *logger's* export type — it did not add a seventh surface.

**Module-local session-store pattern (six instances, named and recognized as of Session 61):** `vigil-approval-session.ts` (now with live subscribe/notify), `vigil-alert-session.ts`, `aria-vrs-session.ts`, `tt-session.ts`, `flowpath-approval-session.ts`, `scribe-sent-session.ts`. A seventh instance is worth a real governance conversation about extracting a shared helper, per `AGENT_REFERENCE.md` v3.3.

**Architecture specs worth knowing exist (`docs/`):** `docs/16` (ARIA), `docs/18` (PPBE Workflow), `docs/20` (`ProgramStatusSurface`), `docs/21` (`WorkQueueSurface`), `docs/22` (informed-decision-making design philosophy — updated July 24), `docs/23` (Reviewer's Workspace v1), `docs/24` (GD-26), `docs/25` (the navigation primitive), `docs/26` (Execution Monitoring vision / Analyst-PM workday principle), `docs/27` (external execution-governance critique, response), `docs/28` (Logger read path — resolved, GD-28 executed), `docs/29` (the WG-11/WG-7/WG-14 governance decisions — all built), `docs/30` (Session 60 assessment action plan — §2 build scope closed, §3 governance items open).

---

## Standing Constraints (Always Apply — Every Session, Every Product)

The full, current set of eleven Constraints, ten Rules, and the numbered Lessons sequence live in `AGENT_REFERENCE.md` — this section is a pointer, not a restatement. Read `AGENT_REFERENCE.md` directly.

---

Please confirm you have read this. Then I will upload the context documents.
