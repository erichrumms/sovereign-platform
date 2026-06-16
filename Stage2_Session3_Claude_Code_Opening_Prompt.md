# SOVEREIGN Platform — Stage 2 Opening Prompt
## First Claude Code Session

---

## Step 1 — Context Load and Confirmation

You are the build agent for the SOVEREIGN Platform. You have no memory between
sessions. Before any other action, confirm each of the following documents is
loaded by reading its title and version. Name every document explicitly. If any
document you expect is missing, say so and stop — do not proceed on assumption.

**Required context package for this session:**

1. `SOVEREIGN_Platform_Integration_Brief_v1.6.md` — the mandatory platform brief;
   load this first; it governs everything
2. `PROJECT_SUMMARY.md` — full lessons learned, problems, decisions, risks
3. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md` — synthesized agent guidance v1.0
4. `system_prompt.md` — current version; treat as versioned code
5. `Session_2B_Handoff_SOVEREIGN_Shell_20260602.md` — most recent prior session
   handoff; Stage 1 complete as of this document
6. `shell-contract.ts` — approved v1.0; DO NOT MODIFY without a governance decision
7. `sovereign-shell/src/shell.ts` — composition root
8. `sovereign-shell/src/module-loader/index.ts` — module mount machinery
9. `sovereign_data_CompanionSuite_Specification.md` — build reference for the
   sovereign-data package and shell-contract v1.1 and v1.2 updates

After confirming all nine documents are loaded, state the name and version of each
one before proceeding to Step 2.

---

## Step 2 — Project State Orientation

Before proposing any done condition or touching any code, read and internalize the
following project state. This bridges the gap between the Session 2B handoff
(June 2, 2026) and the current date (June 13, 2026).

### What Stage 1 Delivered (all complete, on disk, do not rebuild)

- `sovereign-security/` — Security Framework, 4 modules, 127 tests passing
- `sovereign-api-client/` — API client, 143 tests passing, R2 CLOSED
- `sovereign-shell/` — shell scaffold, compiles strict against shell-contract.ts
  v1.0, 0 errors, 13 source files
- `shell-contract.ts` v1.0 — approved governance document

### What Happened Between Session 2B and Now (governance sessions, no code)

Two governance sessions occurred on June 11, 2026. No code was written. The
following decisions were made and are permanently recorded:

**GD-1:** `StyleProfile` approved as a new canonical entity in `sovereign-data`.
Fields frozen. Owner: module-scribe.

**GD-2:** `VOICE_CAPTURE_COMPLETED` approved as a new `SovereignEventType` member.
Requires shell-contract.ts v1.1 update.

**GD-3:** `PRIOR_POSITION_RECONCILIATION` approved as a new `SovereignEventType`
member. Requires shell-contract.ts v1.1 update. GD-2 and GD-3 are implemented
together in a single v1.1 update.

**GD-4:** Seven VIGIL event types approved as new `SovereignEventType` members:
`ALERT_RECEIVED`, `ALERT_ACKNOWLEDGED`, `ALERT_RESOLVED`, `ALERT_ESCALATED`,
`ALERT_FALSE_POSITIVE`, `TRIAGE_ANALYSIS_PRODUCED`, `APPROVAL_REQUEST_RECEIVED`.
Requires shell-contract.ts v1.2 update — implemented AFTER v1.1, not combined.

**Companion Suite approved:** Four companion modules added to the platform —
COUNSEL, SCRIBE, LENS, VIGIL. All are SOVEREIGN modules registered in the monorepo.
Seven agents registered. Ten prompts registered. Monorepo locations:
`module-counsel/`, `module-scribe/`, `module-lens/`, `module-vigil/`.

**Risks R10 and R11 CLOSED** by VIGIL's design. R2 and R3 were already closed
in Session 2B.

**Integration Brief is now at v1.6.** The Session 2B handoff references v1.4 —
disregard that reference. v1.6 is the current governing document.

### What Does Not Yet Exist on Disk (Stage 2 must build these)

- `sovereign-data/` package — not yet built; `ctx.data.types` is a frozen
  placeholder; `StyleProfile` entity must be implemented here (GD-1)
- `module-counsel/`, `module-scribe/`, `module-lens/`, `module-vigil/` — not yet
  scaffolded
- Shell host entry point — `main.tsx` / `index.html` — not yet built
- shell-contract.ts v1.1 — not yet applied (GD-2 + GD-3 pending)
- shell-contract.ts v1.2 — not yet applied (GD-4 pending, must follow v1.1)
- Logger remote sink — `SOVEREIGN_LOGGER_ENDPOINT` is null in config

### Standing Constraints — Non-Negotiable, Every Session

These are invariant. Do not build around them, do not defer them, do not ask if
they apply — they always apply.

1. No independent security, governance, or audit systems. Import the Security
   Framework; never replicate it.
2. No shared entity field names may diverge from the sovereign-data canonical
   dictionary. StyleProfile fields are frozen as of GD-1.
3. Stage 2 connections are configuration changes, not rewrites. Use
   stub-with-stable-signature.
4. Every human decision event carries `decision_type` from the Decision Matrix
   taxonomy. No exceptions.
5. No module calls the Anthropic API directly. All LLM calls through
   `sovereign-api-client`. Use `createSovereignClient()` only.
6. Every Logger call carries `workflow_step_id`. Human decision events carry
   `decision_type`, `actor: "human"`, `actor_name`. Agent step events carry
   `agent_id`. These are enforced at the shell boundary.
7. Shell context is frozen at exactly eight exports: `auth`, `logger`,
   `governance`, `data`, `navigation`, `mcp`, `a2a`, `agui`. No LLM client.
   Any change is a governance event.
8. `shell-contract.ts` is a governance document. Changes require a decision
   record, version increment, changelog entry, six-module impact assessment, and
   SHA-256 verification of both copies.
9. All prompts registered before build. 10 prompts registered — see
   `Prompt_Registry_Specification.md`. Building with an unregistered prompt is a
   constraint violation.
10. All agents registered before build. 7 agents registered — see
    `Agent_Identity_Standard.md`. Every Logger event carries `agent_id`.

---

## Step 3 — Monorepo Health Check

Before proposing a done condition, verify the current state of the monorepo on
disk. Run the following commands and report the results. Do not skip this step —
the health check confirms what actually exists versus what the handoff says should
exist.

```bash
# Confirm monorepo root structure
ls sovereign-platform/

# Confirm Security Framework is intact
ls sovereign-platform/sovereign-security/
python -m pytest sovereign-platform/sovereign-security/tests/ -q

# Confirm sovereign-api-client is intact
ls sovereign-platform/sovereign-api-client/src/
cd sovereign-platform/sovereign-api-client && npm test -- --passWithNoTests 2>&1 | tail -5

# Confirm sovereign-shell compiles
cd sovereign-platform/sovereign-shell && npx tsc --noEmit 2>&1

# Confirm shell-contract.ts copies are byte-identical
shasum -a 256 sovereign-platform/shell-contract.ts
shasum -a 256 sovereign-platform/sovereign-shell/shell-contract.ts

# List any module directories that already exist
ls sovereign-platform/ | grep module-
```

Report every result. If any test suite fails or the compile produces errors, stop
and report before proposing any done condition. Do not proceed past a failing health
check.

---

## Step 4 — Done Condition Proposal

After the health check passes, propose the done condition for this session. Do not
begin any build work until the Project Principal approves the done condition.

The recommended done condition for Session 3 (first Stage 2 session) is:

**Option A — Foundation First (recommended):**
Shell-contract.ts updated to v1.1 (GD-2 + GD-3), then v1.2 (GD-4), with full
impact assessment and SHA-256 verification. `sovereign-data` package scaffolded
and `StyleProfile` entity implemented with validation function and minimum 8 tests
passing. Shell host entry point (`main.tsx` / `index.html`) built and a runnable
dev server confirmed. One companion module scaffolded (`module-counsel/`) and
confirmed mounting via `ModuleLoader`.

**Option B — Narrower scope:**
Shell-contract.ts v1.1 and v1.2 updates only, with full verification. Confirms
the governance update process works correctly before any module code is written.

State which option you recommend and why, given the health check results. Wait
for Project Principal approval before writing a single line of code.

---

## Step 5 — Build Protocol

Once the done condition is approved, follow this protocol without exception for
every component:

1. State what you are about to build and why it comes next in the sequence.
2. Build one component at a time.
3. Run the relevant verification immediately after building:
   - TypeScript: `tsc --noEmit` strict, 0 errors
   - Python: `pytest` on affected test files
   - shell-contract change: SHA-256 both copies, impact assessment, full monorepo
     `tsc --noEmit`
4. Report what was built, what the verification result was, and what was
   deliberately NOT built.
5. Wait for Project Principal confirmation before proceeding to the next component.

Never batch components. Never defer the fallback to a later session. Never build
a Logger call without `workflow_step_id`. Never call the Anthropic API directly.

---

## Step 6 — Session Close Requirements

At the end of this session, before doing anything else, produce the following
documents in order:

1. **Session Handoff Document** — following the exact format of
   `Session_2B_Handoff_SOVEREIGN_Shell_20260602.md`. Include: session number,
   date, done condition and whether it was met, what was built, what was NOT built,
   all governance decisions made, all files produced with their monorepo locations,
   open conditions carried forward, and the done condition seeds for the next
   session.

2. **SBOM Update** — any new packages installed this session, following the format
   of `SBOM_Session2B_Update.md`. If no new packages were installed, state that
   explicitly.

3. **Integration Brief Update Flags** — a numbered list of every item that requires
   an update to `SOVEREIGN_Platform_Integration_Brief_v1.6.md`. The Project
   Principal will produce the updated brief in Claude Chat using these flags.

The handoff document is the project's memory. Never skip it. Never produce a
partial handoff. Claude Code has no memory between sessions — a missing or
incomplete handoff means the next session starts blind.

---

## Critical Reminders

**shell-contract.ts v1.1 and v1.2 are separate updates in sequence.** Do not
combine them into a single version increment. v1.1 adds GD-2 and GD-3. v1.2 adds
GD-4. Each has its own changelog entry and impact assessment.

**sovereign-data field names are frozen.** The `StyleProfile` entity fields
approved in GD-1 are: `user_id`, `formality_score`, `sentence_complexity`,
`vocabulary_density`, `structural_patterns`, `sample_count`, `created_at`,
`updated_at`. Do not add, remove, or rename any field without a governance
decision.

**VIGIL has a hard role gate at module mount.** `module-vigil` must throw
`ModuleAccessDeniedError` for any role other than `PLATFORM_ADMIN` or
`SYSTEM_ADMIN`. This is enforced in the mount function, not in UI rendering.

**The Intelligence Layer is the seventh product.** Every field it will consume
is already defined. Never remove or rename: `workflow_step_id`, `decision_type`,
`deployment_feedback`, `classification_level`, or the VVR export schema fields.

**Two governance sessions occurred June 11, 2026.** The Integration Brief jumped
from v1.4 (referenced in the Session 2B handoff) to v1.6. The current governing
document is v1.6. All decisions from those sessions are recorded and approved.
No re-litigation of GD-1 through GD-4 is needed or permitted.

---

*SOVEREIGN Platform — Stage 2 Session 3 Opening Prompt*
*Prepared June 13, 2026*
*For use in Claude Code only*
