# SOVEREIGN Platform — Strategic Plan to CTO Demo
## Version 3.1 · July 12, 2026
### Governing Document for All Demo-Path Work — Consolidated

**Classification:** Pre-Decisional · Internal Working Document
**Authority:** Project Principal · SOVEREIGN Platform Governance Authority
**Author:** Claude Chat (Governance Agent)
**Status:** ACTIVE — governs all work toward the CTO demonstration until superseded
**Changed this version:** **Session 30 complete — all five Walkthrough E-2
findings resolved.** WE-10's root cause: the travel drafting engine was simply
never invoked on the approval path (a clean wiring gap, not a hidden bug), now
fixed with 9 regression tests. WE-12 definitively answered: decision notes are
audit-only, never feed the draft, by design. WE-7's landing page is live. WE-4's
`docs/19` is now genuinely verified (v1.1). **Test count history corrected**:
Session 29's reported 1559 was a counting-method error — true baseline was 1396;
Session 30 closes at 1414 (+18, real). **One new item surfaced**, left homeless
by the renumbering: a cross-module state gap (VIGIL authorization not flipping
SCRIBE's sendable state live) — tracked, needs resolution before final rehearsal.
**Time & Travel is now considered walkthrough-clean**, pending only that one
tracked item before demo day.
**Relationship to other documents:** This is now the authoritative sequencing
reference — supersedes `SOVEREIGN_Work_Plan_CTO_Demo.md` in practice, though that
document is not deleted or wrong for what it was.
**Companion files, delivered alongside v2.0/2.1:** `gather_session27_context.sh`,
`Session27_Opening_Prompt.txt`.

---

## PART I — STRATEGY

### 1. The Objective

Deliver a live SOVEREIGN Platform demonstration to a CTO audience proving, in order
of importance: (1) the governance model is structurally enforced, not decorative;
(2) the platform is genuinely finished — six products, four companion modules, all
tested and walked through; (3) a new capability generalizes onto existing
infrastructure without rebuilding it — proven **twice**, via Time & Travel and PPBE
both, built the same way, to completion; (4) the platform names its own real gap
(the Intelligence Layer) rather than being caught by it.

**Demo-ready, precisely:** both workflow layers fully built and walked through;
Gate 3/4 attestation complete; one full rehearsal of the entire five-item demo
script. Everything in this plan exists to reach that state on purpose.

### 2. Demo Scope, In Presentation Order

| # | Component | Role |
|---|---|---|
| 1 | Core six-product pipeline + companion suite | Foundation — ready today |
| 2 | Governance/certification story | The actual differentiator — lead with it |
| 3 | Time & Travel, fully built end-to-end | Proof-of-concept #1 |
| 4 | PPBE, fully built end-to-end | Proof-of-concept #2 — proves #3 wasn't a one-off |
| 5 | Intelligence Layer | Named as the target every product feeds, not built |

### 3. Strategic Principles

- **One linear build sequence, not two parallel tracks.** Corrected this version —
  see Part III. Decisions can be made in parallel; code cannot be built in parallel
  by one Claude Code agent working one repo.
- **Decisions precede the build session that needs them,** not the whole sequence.
  A decision needed by Session 30 can be made any time before Session 30 opens,
  including while Session 27–29 are running.
- **One component per exchange inside build sessions,** even in autonomous mode.
- **Walkthroughs are not optional polish — they are load-bearing.** Every stage
  transition in this platform's history has gone through one. Time & Travel and
  PPBE do not get an exception. See Part V.
- **Plan the whole path now; adjust it explicitly, not silently.** Part IX is
  where tweaks get recorded, in place, not by quiet rewrite.
- **Verify before trusting, every session.** HEAD, shell-contract hash, agent
  count, test count — fresh, every time, regardless of what a handoff claims.

### 4. What This Plan Deliberately Does Not Chase

REVIEW-SCOPE, full external-connectivity architecture (`EXT-CONN-EXPLORE`), and any
actual external connector (Deltek, Concur, GFEBS) remain explicitly out of scope —
unchanged from prior versions.

---

## PART II — GOVERNING DECISIONS STATUS

Everything below is settled as of this version. Restated once, here, so it doesn't
need re-verifying against three other documents mid-sequence.

| Decision / Item | Status |
|---|---|
| D-TT7 | **DECIDED — Option A.** D-TT3 reaffirmed unchanged. `TT-EXT-GD` opened, deferred, trigger-conditioned. |
| D-P7 | **DECIDED — Option A.** D-P3 reaffirmed unchanged. `PPBE-EXT-GD` opened, deferred, trigger-conditioned. |
| Time & Travel prompts (`tt.travel-drafter`, `tt.time-drafter`) | **APPROVED and REGISTERED**, confirmed via Session 27 handoff. Platform approved-prompt count: 14 → 16. |
| PPBE Track scope | **DECIDED — full parity with Time & Travel.** Two PPBE build sessions, not one. |
| `docs/18_PPBE_Workflow_Architecture.md` | **DELIVERED.** Build specification complete, both PPBE sessions scoped in detail. |
| `TT-GD` (three `HumanDecisionType` additions) | **OPEN.** Blocks Session 28 specifically. Can be decided any time before then. |
| `TT-PRODUCT-GD` (`SovereignProduct` missing `TIME_TRAVEL`) | **OPEN, surfaced by Session 27.** Blocks Session 28 alongside `TT-GD`. See Part VI. |
| `TT-POLICY-ENTITY` (no `TimePolicy` entity) | **OPEN, surfaced by Session 27, non-blocking.** See Part VI. |
| `PPBE-RECORD` | **OPEN.** Housekeeping only — does not block any build session. |
| Four PPBE agent prompts (`ppbe-ledger-monitor`, `ppbe-dependency-tracker`, `ppbe-evidence-synthesizer`, `ppbe-scenario-analyst`) | **REASSIGNED July 12.** Per `AGENT_REFERENCE.md`, Claude Code authors these (marked `PENDING`) as part of the relevant build session, not pre-drafted by Claude Chat beforehand. No longer a pre-session blocker — see Part III. |
| Gate 3/4 attestation | **OPEN**, Project Principal's own pace, blocks nothing else. |

---

## PART III — MASTER BUILD SEQUENCE (Corrected and Linear)

This replaces the two-track structure from earlier versions. It is one ordered
list because it is, in reality, one Claude Code agent working one repository in
session order — there was never a way to actually run two sessions at once.

| Step | What | Type | Opens When |
|---|---|---|---|
| **Session 27** | ~~Time & Travel Phase I / Core Integration~~ — **COMPLETE**, pushed (`4bec32a`, `8470eb9`, `914c93b`). 1370 tests passing. | Claude Code build | Done |
| **Session 28** | ~~Time & Travel Phase II / Full Cycle~~ — **COMPLETE**, pushed (`00cbf6c` D1, `bff1c8a` D2, `d137367` D3, `26501ab` D4). 1455 tests passing. **Time & Travel is now build-complete — the platform's first end-to-end demonstrable workflow layer.** | Claude Code build | Done |
| **Walkthrough E** | Validate Time & Travel end-to-end in the live platform | Claude Chat, guided | **Ready now — scenario script below** |
| **Session 29** | ~~Time & Travel gap fixes~~ — **COMPLETE**, pushed (`859c796` D1, `87ab5cc` D2, `de65cee` D3, `8d77345` D4). ~~1559~~ **1396 tests passing (corrected retroactively by Session 30 — the 1559 figure was a counting-method error, not a real number)**. D1: TT intake in NEXUS, module-local field, no Hard Stop. D2: Gap 3 root-caused and fixed centrally (shell outlet background), 60 regression tests added. D3: full-state seed data live in NEXUS/VIGIL/SCRIBE. D4: `docs/19_TT_Navigation_Reference.md`, marked UNVERIFIED as required. | Claude Code build | Done |
| **Walkthrough E-2** | ~~Verify `docs/19`, the restored contrast, and the seeded queues live~~ — **COMPLETE.** Confirmed: intake form, contrast fix, synthetic data, time/expense drafting pipeline (unplanned bonus finding), VIGIL escalation routing. **One critical new finding: travel approval drafting pipeline status unknown (WE-10)** — see `Walkthrough_E2_Findings_Record.md`. | Claude Chat, guided | Done |
| **Session 30** | ~~Time & Travel fix session~~ — **COMPLETE**, pushed (`cc9c5c8` D1–D3, `a2f6a9f` D4, `686fd89` D5). 1414 tests passing (+18, corrected baseline). **D1 root cause: explanation (b) — the drafting engine was never invoked on the travel approval path (clean wiring gap), now fixed with 9 regression tests. D3 definitive: the decision note is audit-only, never feeds the draft, by design. D4: `PlatformHome.tsx` landing page live. D5: `docs/19` verified, corrected, UNVERIFIED header removed (v1.0→v1.1).** | Claude Code build | Done |
| **Session 31** | PPBE Build Session 1 — Core Integration (FLOWPATH/Logger/NEXUS/VIGIL). **Includes authoring `ppbe-ledger-monitor` and `ppbe-dependency-tracker` prompts (marked `PENDING`) as part of this session** — no longer a pre-session blocker. | Claude Code build | Session 30 complete |
| **Session 32** | PPBE Build Session 2 — Full Cycle (APEX/SCRIBE/ARIA/COUNSEL). **Includes authoring `ppbe-evidence-synthesizer` and `ppbe-scenario-analyst` prompts (marked `PENDING`).** | Claude Code build | Session 31 complete. All four PPBE prompts should be reviewed and approved (Claude Chat produces the approval record, Project Principal approves) before any of them touch live data — synthetic-data use during the session itself is fine. |
| **Walkthrough F** | Validate PPBE end-to-end; full-platform validation | Claude Chat, guided | Session 32 complete **AND PPBE synthetic data seeded — sufficient variety/quantity across all six PPBE phases (WE-6, new precondition, not an assumption)** |
| **Rehearsal** | Full five-item demo script, both workflow layers, dry-run | Project Principal + Claude Chat | Walkthrough F complete, any resulting fixes closed |
| **Demo Day** | *** DEMO-READY *** | — | Rehearsal clean |

**Running in parallel with the whole sequence above, blocking nothing in it:**
Gate 3/4 attestation, `PPBE-RECORD`, hygiene items (`PROMPT-REGISTRY-DRIFT`,
iCloud-cleanup).

**What actually needs deciding before each session, stated once so it's not
scattered across three parts of this document:**

| Before This Session | This Must Be Done First |
|---|---|
| 27 | ~~Nothing — open now~~ Done |
| 28 | ~~`TT-GD` decided **and** `TT-PRODUCT-GD` decided~~ Both done, July 12 |
| 30 | Nothing — scoped directly by Walkthrough E-2 findings, ready now |
| 31 | Session 30 complete — nothing else; PPBE prompts authored *during* the session (July 12 reassignment, see Part II) |
| 32 | Session 31 complete; all four PPBE prompts reviewed/approved before touching live data |

---

## PART IV — WALKTHROUGH PROTOCOL

Confirmed from this project's own history (Walkthroughs A through D all followed
this pattern) — not a new process invented for this plan.

**What it is:** a Level 1 walkthrough is a human-in-the-loop validation session
conducted **in Claude Chat, not Claude Code.** The Project Principal operates the
live platform in a browser; Claude Chat provides step-by-step guidance.

**Purpose:** validate that the most recently built stage works end-to-end as a
system (not just that unit tests pass); surface integration gaps unit tests can't
catch; build Project Principal familiarity with actually operating the platform;
produce a demo rehearsal at each milestone.

**How it runs:**
1. Project Principal opens the dev server: `cd ~/Developer/sovereign-platform/
   sovereign-shell && npm run dev`
2. Claude Chat provides a scenario script — a synthetic situation walking through
   the feature being validated (for Walkthrough E: a synthetic Time & Travel
   scenario; for Walkthrough F: a synthetic PPBE scenario plus a full-platform
   pass)
3. Project Principal works through the scenario in the browser
4. Project Principal shares screenshots at each step; Claude Chat confirms correct
   behavior or identifies a gap
5. **Gaps found become the first deliverables of the next build session** — this
   is exactly the mechanism that produced Walkthrough D's 12 findings and Session
   26's close-out, and it's the same mechanism behind "Session 29, probable" in
   Part III above

**Validation standard, carried from Walkthrough A and never relaxed since:** no
product passes its walkthrough if Gap 5 (plain-language) or Gap 6 (content-type
distinction) standards are not met. A human reviewer must be able to read all
output as plain prose and orient within five seconds.

**When this plan will need a Walkthrough E scenario script:** once Session 28
closes. Not before — the script should be written against what Session 28 actually
built, not against the spec in advance of it. Same logic for Walkthrough F once
Session 32 closes.

---

## PART V — SESSION-OPENING PROCEDURE

The mechanical steps, confirmed from this project's own history, not reinvented.
Companion files for Session 27 specifically are delivered alongside this document.

**Note on where to actually look when opening a session:** the steps below
describe the general procedure. Each session's own opening-prompt file (e.g.
`Session27_Opening_Prompt.txt`) is self-contained — it includes these same
terminal commands at the top, specific to that session, so you never need this
Strategic Plan open at the same time as the thing you're actually pasting into
Claude Code. This section exists as the reusable reference the per-session files
are generated from, not as a second place you need to check mid-session.

**Step 1 — Run the gather script (Terminal 2):**
```bash
chmod +x ~/Developer/sovereign-platform/gather_session27_context.sh
~/Developer/sovereign-platform/gather_session27_context.sh
```
This reads the required context files and copies them to the clipboard. It reports
found/missing counts — if anything is reported missing, stop and resolve it before
proceeding rather than opening the session on an incomplete context package.

**Step 2 — Open Claude Code (Terminal 1), autonomous mode:**
```bash
cd ~/Developer/sovereign-platform
caffeinate -i claude --dangerously-skip-permissions
```
`caffeinate -i` keeps the Mac awake for the session. `--dangerously-skip-permissions`
is required for autonomous operation — Claude Code writes files and runs commands
without per-action approval.

**Step 3 — Confirm auto mode:** press `Shift+Tab`, confirm "auto mode on" in the
status bar.

**Step 4 — Paste context:** paste the clipboard from Step 1.

**Step 5 — Paste the opening prompt:** paste the full contents of
`Session27_Opening_Prompt.txt`.

**Step 6 — Claude Code confirms every file by name, restates the done condition,
and — because this is an autonomous session — begins building immediately** rather
than waiting for turn-by-turn approval. It still follows one-component-per-exchange
internally; "autonomous" means it doesn't wait for your approval between
components, not that the build discipline is relaxed.

**Step 7 — Walk away. Return when Claude Code has produced the session handoff and
SBOM update, committed and pushed — AND copied both to the Desktop.** This last
part is now a standard close requirement (added July 12, see the Agent-to-Agent
Briefing's "Standard End-of-Session Process") — no more digging through the repo
to find them.

**Step 8 — Bring the handoff and SBOM back to Claude Chat** (this conversation, or
a fresh one with this document and the current Agent-to-Agent Briefing loaded).
Claude Chat now produces a refreshed System Prompt every session as standard
practice, not only "if needed" — along with the merged SBOM, updated Strategic
Plan, and updated Agent-to-Agent Briefing where warranted.

**This same eight-step procedure runs for every future session** (28 through 31) —
only the gather script's file list and the opening prompt's done condition change
each time, produced fresh after the prior session's handoff is in hand. Drafting
Session 28–31's opening prompts now, before Session 27 has actually run, would mean
guessing at a HEAD hash and file state that doesn't exist yet — deliberately not
done here, consistent with "verify before trusting."

---

## PART VI — DECISION GATES (Remaining Open Items Only)

| Decision | Blocks | Leverage |
|---|---|---|
| ~~`TT-GD`~~ | ~~Session 28~~ | **DECIDED July 12 — GD-21.** Shell contract v1.15 → v1.16 authorized. |
| ~~`TT-PRODUCT-GD`~~ | ~~Session 28~~ | **DECIDED July 12 — Option 2.** No shell-contract change; host-product attribution. |
| **`TT-POLICY-ENTITY`** *(new, surfaced by Session 27, non-blocking)* | Nothing in the build sequence | Low urgency — module-level workaround already functioning |
| ~~Two Core Integration PPBE prompts~~ | ~~Session 31~~ | **No longer a gate — Claude Code authors these during Session 31 itself (July 12 reassignment)** |
| ~~Two Full Cycle PPBE prompts~~ | ~~Session 32~~ | **Same — authored during Session 32 itself** |
| `PPBE-RECORD` | Nothing in the build sequence | Housekeeping |
| Gate 3/4 attestation | Nothing in the build sequence | Strengthens the demo narrative |
| `docs/16` Supervision Efficiency | Nothing in the build sequence | Resolved from "unverified" to "confirmed absent" — Project Principal call on add vs. waive |

### `TT-PRODUCT-GD` — What Session 27 Surfaced

Session 27 correctly stopped rather than guessing: `SovereignProduct` (the shell
type VIGIL's alert schema uses for `sourceProduct`) has no `TIME_TRAVEL` value.
Routing TT escalations into the VIGIL Alert Queue in Session 28 needs one of two
resolutions:

- **Option 1 — Add `TIME_TRAVEL` to `SovereignProduct`.** A genuine
  shell-contract change: version bump (v1.15 → v1.16), changelog, SHA-256
  re-verification of both copies, full governance process per Standing Constraint
  8. Semantically the cleanest option — a TT alert would actually say
  "Time & Travel" as its source. Sits in tension with D-TT6's own principle that
  Time & Travel is a workflow layer, not a product with its own identity —
  adding it a dedicated enum value is a small step toward treating it like one.
- **Option 2 — Route under a host product, following the existing ARIA-adapter
  precedent.** No shell-contract change. Matches the already-established pattern
  where ARC's outputs aren't routed through `ctx.aria` directly. TT alerts would
  attribute to whichever host module actually owns the pipe (VIGIL, most likely,
  given `docs/17`'s escalation-monitor lives there). Consistent with — arguably
  reinforces — D-TT6. Minor cost: the Alert Queue UI would need separate metadata
  to make clear an alert is TT-originated, rather than getting that for free from
  `sourceProduct`.

**DECIDED, July 12 — Option 2.** Session 27 already had no choice but to card all
six TT agent scaffolds under their host products (NEXUS/APEX/VIGIL), since
`AgentCard.product` is typed `SovereignProduct` and `TIME_TRAVEL` isn't a member.
Option 2 extends that pattern to VIGIL alerts too, keeping attribution consistent.
Formal record: `TT-PRODUCT-GD_Alert_Attribution.md` (iCloud).

**On the handoff's suggestion to file a D-TT7 decision record:** already handled
— that record exists, status DECIDED, correctly kept out of git per Lesson 13.
Claude Code can only see the repo, so it flagged an absence that isn't actually
a gap. No action needed here.

### `TT-POLICY-ENTITY` — New Candidate Item, Non-Blocking

Session 27 found that `docs/17` §4 calls for a validated time/expense policy
configuration "committed to the data dictionary," but no `TimePolicy` entity is
among the six D-TT3 entities — `TravelPolicy` covers the travel side, nothing
covers the time side. Implemented as `TimeCompliancePolicyConfig`, a module-level
config type in `module-apex`, deliberately **not** a canonical entity. This
works for now and blocks nothing. Worth a real decision at some point — promote
it to a seventh entity (a genuine D-TT3 amendment, which reopens the same kind
of question D-TT7 just closed for the other six) or confirm the module-level
config is the permanent answer. Suggest deciding this alongside `TT-GD`, not
before Session 28 specifically, since it isn't blocking anything.

---

## PART VII — RISK & CONTINGENCY

| Risk | Mitigation |
|---|---|
| `TT-GD` not decided in time to open Session 28 right after 27 closes | It's a small, well-scoped decision (three enum additions) — flag it now so it's decided during Session 27's runtime, not discovered after |
| Walkthrough E finds significant gaps, Session 29 is larger than "probable" implies | This is exactly what walkthroughs are for — a bigger Session 29 is the system working correctly, not a failure of planning |
| PPBE prompts (four total) aren't drafted in time to keep Sessions 30/31 moving right after 29 closes | Nothing stops drafting them now, in parallel with Sessions 27–29 — recommend starting as soon as this plan is confirmed |
| Walkthrough F surfaces platform-wide issues, not just PPBE-specific ones | Walkthrough F is explicitly scoped as full-platform validation, not PPBE-only — this is expected, not a surprise |
| Session count grows beyond 31 if either walkthrough finds more than expected | Sequence is dependency-based, not calendar-based — it absorbs this without needing a new plan version, just a Part IX log entry |

---

## PART VIII — COMPLETE TASK LIST

**Project Principal:**
- [x] ~~Run Session 27~~ — **COMPLETE**, 1370 tests passing, pushed
- [x] ~~Decide `TT-GD`~~ — **APPROVED July 12 (GD-21)**
- [x] ~~Decide `TT-PRODUCT-GD`~~ — **DECIDED July 12, Option 2**
- [ ] **New — decide `docs/16` Supervision Efficiency**: add the retroactive section now, or formally waive it
- [ ] **New, non-blocking — decide `TT-POLICY-ENTITY`**: promote to a seventh D-TT3 entity, or confirm the module-level config is permanent
- [ ] Work through Walkthrough E in Claude Chat once Session 28 closes
- [ ] Work through Walkthrough F in Claude Chat once Session 32 closes
- [ ] Rehearse the full five-item demo script
- [ ] Decide `PPBE-RECORD`, attest Gate 3/4, whenever convenient — not on the path

**Claude Chat (this agent):**
- [x] ~~Draft the four PPBE agent prompts~~ — **REASSIGNED July 12, per
      `AGENT_REFERENCE.md`: Claude Code authors prompts (marked `PENDING`) as
      part of the relevant build session; Claude Chat's role is producing the
      approval record afterward, not the prompt content itself**
- [ ] Produce the approval record for each PPBE prompt once Claude Code authors
      it and the Project Principal reviews it
- [x] ~~Write the Walkthrough E scenario script once Session 28 closes~~ — delivered
- [ ] Write the Walkthrough F scenario script once Session 32 closes
- [ ] Produce each session's opening prompt + gather script fresh, after the prior
      session's handoff is in hand
- [ ] Keep Part IX current as tweaks occur
- [ ] Run/review `gather_repo_integrity_check.sh` — after Walkthrough E findings
      are resolved and the next session is prepped, per Project Principal sequencing

**Claude Code:**
- [ ] Session 27 → 28 → 30 → 31 → 32, per Part III
- [ ] **New, July 12 reassignment — author `ppbe-ledger-monitor` and
      `ppbe-dependency-tracker` prompts as part of Session 31, marked `PENDING`**
- [ ] **New, July 12 reassignment — author `ppbe-evidence-synthesizer` and
      `ppbe-scenario-analyst` prompts as part of Session 32, marked `PENDING`**
- [ ] Resolve `PROMPT-REGISTRY-DRIFT` when convenient, ideally piggybacked on a
      FLOWPATH-adjacent moment
- [ ] `F-2` (pre-existing, non-blocking, confirmed unaffected by Session 27) — 8
      agents implemented-but-not-carded, 2 NEXUS + 6 AgentOS core. Low priority,
      not demo-path, resolve whenever convenient
- [ ] **New, surfaced by Session 30 — cross-module state gap, real demo risk:**
      when VIGIL authorizes a time/expense escalation, SCRIBE's corresponding
      item doesn't flip to "sendable" within the same session (noted in `docs/19`
      §4). Written expecting a "Session 31" that would still be Time & Travel —
      renumbering left it homeless. No session currently scoped to fix it;
      resolve before final demo rehearsal at the latest, sooner if convenient.
- [ ] **New, surfaced by Session 28 — naming tension, non-blocking:**
      `HumanDecisionType.TRAVEL_APPROVAL` (GD-21, the decision event type) now
      coexists with existing `TRAVEL_APPROVED`/`DENIED`/`ESCALATED` (v1.0 outcome
      status members) — implemented exactly as GD-21 authorized, but the near-
      identical naming is a real readability tension. Candidate for a future
      consolidation GD; not urgent, not demo-blocking.
- [ ] **New, surfaced by Session 28 — documentation drift, non-blocking:** the
      Agent Identity Standard lists `SCRIBE_DRAFT_CREATED`-style Logger event
      names that were never actually approved in any taxonomy. Code correctly
      uses real approved events instead — the AIS document itself needs a
      cleanup pass, not the code. Same category as `PROMPT-REGISTRY-DRIFT`.
- [ ] Verify `docs/16` Supervision Efficiency section status when convenient

---

## PART IX — CHANGE CONTROL (Full History)

| Date | Change | Reason |
|---|---|---|
| July 11, 2026 | Initial version (v1.0) | First integrated strategic plan |
| July 11, 2026 | PPBE elevated to critical path; demo-ready redefined | Project Principal decision — delay demo until PPBE incorporated |
| July 11, 2026 | Part VIII (v1.1) scope decision opened: full parity vs. Core Integration only | Discrepancy surfaced sizing PPBE against its own architecture document |
| July 11, 2026 | Full parity decided | Project Principal decision |
| July 11, 2026 | D-TT7 and D-P7 both decided — Option A for both | Project Principal decision; `TT-EXT-GD`/`PPBE-EXT-GD` opened, deferred |
| July 11, 2026 | Both TT prompts approved; `docs/18` delivered; four PPBE prompts identified as a new requirement | Project Principal request |
| July 11, 2026 | Self-correction: `TT-GD` had been missing from this plan as a Session 28 dependency | Found answering a direct question about what blocks Sessions 27/28 |
| July 11, 2026 | **v2.0 — consolidation.** Corrected session numbering per Project Principal's proposed sequence (27→28→Walkthrough E→29→30→31→Walkthrough F), with the missing PPBE Core Integration session restored. Track 1/1B merged into one linear Build Sequence. Walkthrough Protocol and Session-Opening Procedure sections added, confirmed from project history. | Project Principal request — full strategy revision, walkthrough guidance, and Claude Code onboarding materials |
| July 11, 2026 | **v2.1 — `Session27_Opening_Prompt.txt` made self-contained.** The Claude Code launch commands (`caffeinate` + `--dangerously-skip-permissions`) now live at the top of that file itself, not only in this document's Part V. No need to hold two documents open to run a session. | Project Principal feedback — the split was creating unnecessary cross-referencing |
| July 11–12, 2026 | **v2.2 — Session 27 complete.** 1370 tests passing, pushed. Two Hard Stops correctly surfaced rather than acted on: `TT-PRODUCT-GD` (new — `SovereignProduct` has no `TIME_TRAVEL` value) and confirmation that `docs/16` Supervision Efficiency was never done. Platform facts updated: test count, Python event-type count (84→95, Python-only). Reported via chat summary — reconcile against actual handoff/SBOM files when available. | Claude Code session close, relayed by Project Principal |
| July 12, 2026 | **v2.3 — Reconciled against actual `SOVEREIGN_Session27_Handoff.md` / `SBOM_Session27_Update.md`.** No corrections to v2.2's numbers — clean match. Added `TT-POLICY-ENTITY` (new, non-blocking candidate item — no `TimePolicy` entity exists). Strengthened the `TT-PRODUCT-GD` recommendation using the AgentCard host-product precedent Session 27 already established. Confirmed approved-prompt count at 16. | Project Principal uploaded the actual session artifacts |
| July 12, 2026 | **v2.4 — Standard end-of-session process established.** Claude Code now copies the handoff + SBOM update to the Desktop at every close, in addition to the git commit. Claude Chat now produces a refreshed System Prompt every session as standard practice, not conditionally. Fully documented in the refreshed Agent-to-Agent Briefing, referenced here. | Project Principal request — formalize the handoff loop across Claude Chat, Claude Code, and the Project Principal |
| July 12, 2026 | **v2.5 — Both Session 28 gates decided.** `TT-GD` approved as GD-21 (shell contract v1.16). `TT-PRODUCT-GD` decided, Option 2. Session 28 fully unblocked. End-to-end integration test added as Session 28's D4, designed by Claude Chat per delegation. | Project Principal decision, via quick-confirm on Claude Chat's recommendation |
| July 12, 2026 | **v2.6 — Session 28 complete.** Time & Travel build-complete through Phase II. 1455 tests passing. Two non-blocking items tracked (decision-type naming tension, AIS event-name drift). Walkthrough E scenario script delivered — reported via chat summary, reconcile against actual handoff/SBOM when uploaded. | Claude Code session close, relayed by Project Principal |
| July 12, 2026 | Reconciled against actual Session 28 handoff/SBOM (no corrections to v2.6's numbers) and **System Prompt v20 delivered** — full refresh reflecting Sessions 27–28, GD-21, TT-PRODUCT-GD, the new standard end-of-session process, and all open items current. | Project Principal request, alongside uploading the actual Session 28 artifacts |
| July 12, 2026 | **v2.7 — `AGENT_REFERENCE.md` reconciled. Prompt authorship reassigned to Claude Code** (authors during the session, marked `PENDING`; Claude Chat produces the approval record afterward). Sessions 30/31 no longer gated on pre-drafted PPBE prompts. Repo integrity check queued for after Walkthrough E + next-session prep. | Project Principal decision |
| July 12, 2026 | **v2.8 — Walkthrough E findings recorded (6 findings).** Session 29 concretely scoped: TT intake form, Gap 3 platform-wide audit, TT data seeding, verified architecture reference. Walkthrough E-2 added post-Session 29. PPBE synthetic data (WE-6) added as a new Walkthrough F precondition. | Project Principal, working through the walkthrough live |
| July 12, 2026 | **v2.9 — Session 29 complete.** All four deliverables built; Gap 3 root-caused and durably fixed (60 regression tests); `docs/19` delivered, correctly marked UNVERIFIED. Tests 1455 → 1559. Corrected a stale note in Claude Code's own recommendation (PPBE gating — Session 29's context didn't include today's earlier docs/18/D-P7 resolution). | Claude Code session close, relayed by Project Principal |
| July 12, 2026 | **v3.0 — Walkthrough E-2 complete.** WE-1/2/5 confirmed fixed live. WE-8/WE-9 unplanned positive findings (time/expense drafting and VIGIL escalation routing both confirmed working end-to-end). WE-10 critical new finding: travel approval drafting pipeline status unknown. WE-11/WE-12 decision-note UX findings. WE-7 (no landing page) formally logged. Sessions renumbered: new Session 30 (TT fix, scoped by these findings) inserted; PPBE moves to Sessions 31/32. | Project Principal, working through Walkthrough E-2 live |
| July 12, 2026 | **v3.1 — Session 30 complete.** All five findings resolved; WE-10 root-caused (wiring gap) and fixed with regression tests; WE-12 definitively answered (audit-only). Test count history corrected (1559 was a counting bug; real baseline 1396, now 1414). New cross-module state gap surfaced and tracked. Time & Travel now considered walkthrough-clean pending that one item. | Claude Code session close, actual handoff/SBOM reconciled |

---

*SOVEREIGN Platform — Strategic Plan to CTO Demo · v3.1 · July 12, 2026*
*Pre-Decisional · Internal Working Document*
*File to: git `docs/`*
