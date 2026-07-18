# SOVEREIGN Platform — Walkthrough F: Complete Document Set
## Compiled July 17, 2026

**Contents:**
1. Findings Report (WF-1 through WF-12, Session 38 outcomes, open decisions, design recommendations)
2. Walkthrough Standard Practices (process reference, Gap 5/6)
3. Original Scenario Script
4. Repeat Pass Script (targeted re-verification, current next step)
5. Session 38 Build Agent Prompt (the five-part fix session)
6. Session 38 Gather Script

**Not included below — already committed to the repo and on your Desktop,
not re-compiled here to avoid retyping content from memory rather than a
verified source file:** `SOVEREIGN_Session38_Handoff.md`,
`SBOM_Session38_Update.md`, `SOVEREIGN_Session38_PromptFix_Handoff.md`,
`SBOM_Session38_PromptFix_Update.md`. If you want a single file with
genuinely everything, the most accurate way is concatenating the real
committed files directly in Terminal:
```
cat SOVEREIGN_Walkthrough_F_Findings_Report.md \
    SOVEREIGN_Session38_Handoff.md SBOM_Session38_Update.md \
    SOVEREIGN_Session38_PromptFix_Handoff.md SBOM_Session38_PromptFix_Update.md \
    > Walkthrough_F_Everything.md
```
That pulls from the actual repo copies rather than my memory of them.

---

-e 

# ============================================================
# 1. FINDINGS REPORT
# ============================================================

# Walkthrough F — Findings Report and Path Forward
## July 15, 2026 · Session paused at Part A, Step A1

**Status:** Walkthrough F is not complete. It stopped at Step A1 (portfolio
visibility) pending a data-identity question that surfaced during the
session. Steps A2 through A6 and all of Part B (full-platform pass,
including the live re-check of the Session 35 cross-module fix) have not
been run yet. This report captures everything found before the pause and
recommends how to sequence the rest.

**How to read this report:** findings are split into two kinds, because
they need two different next steps. **Build findings** are concrete code or
data problems — they go to a Build Agent session. **Governance decisions**
are choices about what the platform *should* do — they need a real answer
from the Project Principal before a Build Agent could implement anything
correctly, because there's no single obviously-right fix. Two design
recommendations (not findings — nobody's claiming these are bugs) are
listed separately, since they're new scope, not corrections to existing
scope.

---

## Part 1 — Build Findings (Build Agent Session Scope)

These have a clear, correct fix. No governance decision is needed first —
they're ready to hand to a Build Agent as-is.

| ID | Area | What's wrong | Fix |
|---|---|---|---|
| **WF-1** | Home page | Subtitle reads "Status as of Invalid Date" — a raw date-formatting failure (almost certainly `new Date(undefined)`) leaking into user-facing text. Gap 5 violation. | Find the date source feeding this string, confirm it's populated correctly, or remove the clause if no real timestamp exists yet. |
| **WF-4** | APEX | Portfolio Dashboard and Program Detail tabs render byte-for-byte identical content — Program Detail isn't actually a different view. Gap 6 violation, and a real routing/component bug, not a data issue. | Confirm what Program Detail is supposed to show (single-program drill-down, presumably) and wire the route/component correctly. |
| **WF-5** | APEX, Execution Monitoring | Budget-to-actual variance section shows 10 data points with no visible program attribution. **Confirmed by direct trace: the underlying data has program attribution all along** (`SYNTH_PPBE_OBLIGATIONS` — every record's second field is an explicit program reference). This is a rendering bug, not a missing-data problem — smaller fix than originally scoped. | Surface the program reference that's already present in the data. **Related, while in this code:** the seed also carries deliberately engineered execution-status classifications (on-plan, under-executing, over-executing, ceiling-proximate) that aren't surfaced anywhere on screen — worth including in the same pass rather than a separate one, since the computation already exists. |
| **WF-7** | APEX | **RESOLVED, confirmed by a six-hop direct trace** (seed → adapter → `ApexApp` → `PPBEDashboard` → screen), not by inference. `ALPHA` through `ECHO` are real PPBE seed program codes (`SYNTH_PPBE_PROGRAMS` in `sovereign-data`), correctly wired into Execution Monitoring — their full names (*"Logistics Data Interchange Modernization"* etc.) are a second field on the same records. `P-100` through `P-300` are a completely separate, legitimate, older APEX feature (`synthetic-world-model.ts`) that predates PPBE and was never meant to show PPBE data. **No data-wiring defect exists.** The real, much smaller finding: nothing on screen tells a user that Portfolio Dashboard and Execution Monitoring are two unrelated systems sharing a tab bar — a labeling/disambiguation gap, not a data problem. | Add a clear on-screen label or subtitle distinguishing "APEX's own portfolio tracking" from "PPBE performance data" — small fix, not an investigation. |

**Lower-confidence, worth a quick verification pass in the same session:**

| ID | Area | What's uncertain |
|---|---|---|
| **WF-3** | Home page | "Registered agents: 44 (Agent Identity Standard v1.0)" — the "v1.0" citation may be hardcoded and stale (the actual document has been revised extensively), or may correctly refer to a stable schema version distinct from the document's own revision history. Needs a two-minute check, not a redesign. |

---

## Part 1.5 — Session 38 Outcomes (Addressed, Pending Project Principal Verification)

Session 38 (commits `6642546`, `6e93ea7`, `beeb9e2`, `d593e7b`, `8b37d5a`,
pushed) addressed the findings below. **None are marked resolved here** —
per explicit instruction, the Project Principal is the sole authority on
whether a finding actually passes, decided at the repeat walkthrough, not
by this report or the Build Agent's own handoff.

| Finding | Build Agent's claim | Status | Specific thing to verify first |
|---|---|---|---|
| WF-1 | Guarded against the Invalid Date failure | Addressed, pending verification | Confirm the Home page subtitle live |
| WF-3 | Confirmed no code change needed | Addressed, pending verification | Low priority — spot-check only |
| WF-4 | Shows an informational hint instead of the old identical-render | Addressed, pending verification | **Confirm this is an honest "not built yet" placeholder, not miscategorized as a working drill-down** — those are very different outcomes described by the same one-line summary |
| WF-5 | Narratives now include program name and execution-status classification | Addressed, pending verification | Confirm program attribution and classification both actually render on screen |
| WF-7 | `h1` now reads "APEX — Execution Monitoring" matching the tab label | Addressed, pending verification | **Confirm a header-label match is actually sufficient** — the finding was about two entirely separate systems sharing a tab bar with zero disambiguation; a matched heading may or may not be enough |
| WF-9 | Obligation case seeded in VIGIL; `ObligationDecisionPanel` requires both a note and a linked COUNSEL Decision Record ID before Approve enables | Addressed, pending verification | Confirm Approve genuinely stays disabled until both fields are filled, live |
| WF-10 | All four PPBE agents wired to real clickable triggers (`PPBEAgentsPanel`, `PPBEExhibitPanel`, `PPBECoordinationPanel`); static tier runs and is disclosed, no live key in dev | Addressed, pending verification | This is the big one — confirm all four actually produce real, validator-passing output when clicked, not just that a button exists |
| WF-11 | `ApprovalQueue` cards for `ppbe_obligation` and `ppbe_phase_transition` show inline context; SCRIBE T&T rows now include `employee_id` | Addressed, pending verification | **Confirm the original failing card types from this finding's own evidence — `model_deployment`, `data_export`, `configuration_change` — got the same treatment, not just the two new PPBE card types.** If only the new ones were fixed, this is partial, not full. |

**Part 1 (SCRIBE click-through) — the one result here that needs the most
scrutiny, not the least.** The Build Agent's finding: *"selection was always
correct, this was a walkthrough misperception,"* backed by a new automated
test confirming all six queue items are individually selectable in test
conditions. **This is not the same claim as confirming the detail panel
visibly re-renders for a human watching the screen** — exactly the
distinction Rule 9 exists to catch, a passing test can exercise less than it
claims to. The original live diagnostic (click `SYNTH-TM-203-F1`, watch
whether the panel actually updates) was never completed before this session
started. **This should be the first thing the repeat walkthrough checks,**
precisely because "misperception" is a claim to verify, not a settled fact.

---

## Part 2 — Governance Decisions (Resolve Before or Alongside the Build Session)

These need a real decision, not a fix. Handing any of these to a Build
Agent without an answer first risks it guessing — and given tonight's
history, guessing at scope has cost real time before.

| ID | Area | The actual question |
|---|---|---|
| **WF-2** | Home page | CPMI-VRS badge reads GREEN while every module row reads "Not started." Is GREEN the correct reading of "no red flags because nothing has run yet" (vacuous pass), or should the aggregate status read something distinct (gray/pending) until real activity exists? |
| **WF-6** | APEX | Next-FY planning has no visible home anywhere in APEX. Now informed by real research: NNSA's actual next-FY planning artifact is the **FYNSP** (Future Years Nuclear Security Program). Decision needed: build a FYNSP-based planning view as new scope, and if so, how large a scope — a full planning workflow, or a status/reference panel to start. |
| **New** | PPBE terminology | NNSA's own PPBE stands for Planning, Programming, Budgeting, and **Evaluation** — not Execution (DoD's term). The platform's data model already reflects Evaluation (the `EvaluationFinding` entity, the learning-velocity metric), but the UI still says "Execution Monitoring." Decision needed: how far does the rename go — just this one tab, or every place "execution" language appears across APEX and PPBE more broadly? |
| **New** | ppbe-exhibit-drafter scope | Congressional Justification drafting is already built. A genuinely separate question: does OMB/Congress *briefing* material (a different format and audience than a justification book) need its own new drafting mode, or does the existing one already cover it? |
| **New** | SSMP-level planning | No agent currently claims ownership of implementation/project-plan-level drafting (the SSMP-equivalent). Open — needs a decision on whether this is in scope at all right now, or explicitly deferred. |
| **WF-8** *(new, logged during A1)* | APEX, Execution Monitoring | Project Principal wants role-based visibility: full portfolio view for platform-level users, scoped to only-their-own-projects for managers. **No evidence exists either way** that any access-scoping concept is implemented anywhere in the platform today — every program record has a "Responsible party" field, but that's display data, not confirmed enforcement. Needs a direct check (likely an auth/permissions model search) before this can be scoped as a build item — could be "wire up an existing but unused concept" or "genuinely new architecture," and those are very different sizes of work. |
| **WF-9** *(new, confirmed by direct trace)* | VIGIL / APEX boundary | `recordObligationAuthorization()` — real, well-built, governance-gated obligation authorization logic — exists in `module-vigil/src/ppbe-authorization.ts` but is called only from test files. No screen anywhere lets a manager trigger this. Same shape as Time & Travel's own WE-10 finding — a clean, well-scoped wiring gap. **Addendum, external-connectivity question investigated and resolved:** a legitimate concern was raised that this might be intentionally-unwired infrastructure awaiting a deferred external-system connection (Deltek/Concur/GFEBS, per the Strategic Plan's `EXT-CONN-EXPLORE` scope note). Checked directly against both the code (`ppbe-authorization.ts` — no external/connector references found; `integration_readiness_check` is an internal Gap-5 prose field for PPBE's own phase-transition gate, not a connector interface) and the authoritative spec (`docs/18` §3, the `ObligationRecord` table) — which explicitly confirms `ObligationRecord` is the entity D-P7 identified as the most likely future candidate for external linkage, **but states plainly that no such field exists yet and `PPBE-EXT-GD` remains deferred and trigger-conditioned.** Conclusion: the entity was deliberately built to be complete and self-sufficient now; it is not waiting on anything. WF-9 stands as a genuine, present-day wiring gap, not a premature fix. **Needed to proceed:** nothing further on this specific question — ready for the Build Agent session as originally scoped. |
| **WF-10** *(new, confirmed by comprehensive trace — platform-level, not per-agent)* | PPBE, all four core agents | **None of PPBE's four LLM-backed agents — `ppbe-evidence-synthesizer`, `ppbe-scenario-analyst`, `ppbe-exhibit-drafter`, `ppbe-coordination-assistant` — have any confirmed UI call site.** A repository-wide search excluding test files returned only each function's own definition file — nothing else references any of them. This is not four isolated gaps; it's one platform-level fact: **the four agents this platform's PPBE story is actually about are currently unreachable from any screen.** They are real and proven to work (Session 37's live smoke test confirms this directly against a real model) — they're just entirely disconnected from anything a user can click. Confirmed further: Report Generation's Program dropdown — the one control that looked like it might be a hidden trigger point — only lists P-100-style programs, never ALPHA-ECHO. It's the same disconnected world-model pathway as Portfolio Dashboard, not a second, undiscovered route into PPBE. |
| **Related, explains a prior misreading** | APEX, Execution Monitoring | The "Learning velocity" stat (13 of 20 findings) is almost certainly a simple deterministic count against the seed data's `feeds_planning` field — **not a call to `ppbe-evidence-synthesizer`.** Execution Monitoring reads as "PPBE's AI dashboard" but is not actually surfacing any of the four agents' work — it's arithmetic over the same underlying data the agents would analyze, computed entirely separately from them. |
| **New** | Home page click-through | For the redesigned Home page's "things to do" rows to actually work, each module needs a route that opens one *specific* record, not just the module's landing screen. Unconfirmed whether this exists anywhere today. Needs a direct check before the Home redesign can be scoped accurately. |
| **WF-11** *(upgraded — confirmed violation of an existing, approved, walkthrough-gating standard, not a new proposal)* | VIGIL Agent Approval Queue, SCRIBE Time & Travel Review queue | **This is not a design idea — it's a direct violation of the Supervision Efficiency Standard (`docs/14` Addendum, v1.0, APPROVED June 29, 2026), standard 2.1: context must be present at the point of decision, not behind a click-away.** VIGIL's queue (`model_deployment / agentos-deployer / [timestamp] / Expires in 15 min`) and SCRIBE's queue (`SYNTH-TM-205-F1 · MISSING_HOURS · WARNING`) both fail this exactly — no indication of who's affected or what's being asked until the reviewer clicks in. **Per the addendum's own Section 5, this standard is walkthrough-gating** — *"no product passes its Walkthrough validation if a decision screen requires the reviewer to navigate away to obtain context needed for the decision in front of them."* As far as this session has found, this standard has never been checked against any walkthrough tonight or, seemingly, since it was approved. **Governance-tracking failure, separate from the UI issue itself:** every governance document tonight (including this one, before this correction) carried forward *"docs/16 Supervision Efficiency — confirmed absent"* — a phrase that's narrowly accurate (one architecture doc's own subsection is genuinely missing, per the addendum's own §5a) but conveyed the wrong overall picture, making a binding, active, walkthrough-gating standard read as a minor, unaddressed footnote. Needs correcting across the Integration Brief and Strategic Plan, not just this report. **Bonus, directly usable:** the addendum's §4 metrics table (decision time per task type, draft revision rate, context re-entry events, all Logger-derivable, no new event types needed) is ready-made input for the PPBE Monitoring redesign already scoped earlier tonight. **A real, existing counter-example worth pointing the fix at:** ARIA Suite's own "Process compliance — governance calendar" table already satisfies standard 2.1 correctly — due date, timing status, and severity all inline, nothing hidden. Use it as the reference pattern rather than designing a new one. |
| **WF-12** *(new — documentation-integrity finding, checked against live behavior before logging, per explicit instruction not to act on stale-looking findings without verifying)* | `docs/16_ARIA_Suite_Architecture.md` | Two confirmed, still-uncorrected gaps, both dated June 29, 2026 — checked against actual current platform behavior before being logged as live, not just inferred from the document's age. (1) §7 states *"No shell-contract changes required for ARIA Suite"* — directly contradicted by GD-20 (approved the same day), which added the tenth shell export `aria` (`AriaCertificationSurface`). **Confirmed still-wrong, not merely stale:** ARIA Suite's real screen (session screenshot) shows a working Output Compliance table with real "Pending certification" items linking to a live Certification Queue — direct evidence the `aria` surface is genuinely running, meaning the document is actively incorrect about current behavior, not just outdated about a moot point. (2) No Supervision Efficiency section exists anywhere in the document, despite the addendum's own §5a requiring one before Walkthrough D. **Also confirmed still-live**, not superseded — WF-11 is a real, current violation of exactly the standard this section would have documented. Both need correcting in `docs/16` itself; low-risk, well-scoped documentation fixes, not build work. |

---

## Part 3 — Design Recommendations (New Scope, Not Findings)

Two substantial redesigns came out of this session. Neither is a bug fix —
both are real proposals worth a deliberate scope decision, not something to
fold silently into the Part 1 build list.

1. **Home page redesign** — small system-status strip, a dominant
   cross-product "things to do" list, and a new agent-activity panel
   showing what agents are doing and recent human oversight decisions.
   Directly serves the demo's Objective #1 (governance is structurally
   enforced, not decorative) — arguably belongs *on* the critical path
   rather than being treated as a tangent from it, given what it's actually
   demonstrating.
2. **APEX "PPBE Monitoring" redesign** (renamed from Execution Monitoring)
   — organized by the three-fiscal-year framework (prior FY evaluation,
   current FY execution against a real AFP baseline, next FY FYNSP
   planning), real charts replacing prose walls, explicit call-outs instead
   of fabricated data for anything not yet backed by clean data (WF-5's gap
   specifically).
3. **Module hover-hint on the left navigation** — a small info affordance next
   to each module name, hover-triggered, showing full name, one-line purpose,
   and real tab list. Addresses genuine navigation complexity across 10
   modules — this session's own repeated confusion about which module owns
   which feature is a live case study for why it would help. **Content now
   confirmed by direct screenshot for 9 of 10 modules** (COUNSEL, SCRIBE,
   VIGIL, LENS, CPMI, AgentOS, NEXUS, APEX, FLOWPATH, ARIA Suite — see table
   in session notes). Only gap: COUNSEL's screenshot showed just its entry
   disclosure gate, not its full tab structure — needs one more screenshot
   past that screen before this module's entry can be written honestly.

---

## Part 3.5 — How WF-7 Was Actually Resolved, and What It Surfaced

WF-7 was closed by tracing the real import chain hop by hop — `grep` at each
link, reading the actual result, not stopping at the first plausible-looking
match — rather than inferring from where a string happened to appear. Two
search-command mistakes were made and corrected in the open along the way
(a non-recursive glob, a same-package import pattern used against a
cross-package import). Worth recording plainly: **the hypothesis that
started this thread (Portfolio Dashboard might be showing fake or
disconnected data) turned out to be wrong** — both datasets are real, both
are legitimately used, they're just two different things. That's a good
outcome, and it's also evidence the "trace before concluding" discipline
did its job — an assumption looked plausible at every intermediate step and
still turned out to be correct only once every link was actually checked.

**This surfaced three further checks worth running before or during the
Build Agent session — not yet confirmed findings, since none of them have
been traced the way WF-7 just was:**

| Check | Result |
|---|---|
| Is `SYNTH-TM-205` actually wired to `TTManagerReview`? | **CONFIRMED, strong evidence.** Appears directly in real source files (`module-vigil/src/tt-synthetic-alerts.ts`, `module-scribe/src/tt-synthetic-review.ts`), not just tests, with self-documenting comments confirming provenance from the canonical seed. Part B's live re-check should work as scripted. |
| Do APEX and CPMI's "world model" references share one source? | **Still open — the check surfaced a different question than expected.** CPMI does not import APEX's `synthetic-world-model.ts` directly; it goes through its own `cpmi-world-model-endpoint.ts` abstraction. Whether that abstraction ultimately reads the same underlying source or maintains independent data is not yet known. One more hop needed: `grep -n "import\|P-100\|from" module-cpmi/src/cpmi-world-model-endpoint.ts`. |
| Does `SYNTH_PPBE_OBLIGATIONS` contain program attribution? | **CONFIRMED YES — WF-5's scope is now smaller than originally stated (see updated WF-5 row above).** Every obligation record's second field is an explicit program reference (`SYNTH-PRG-ALPHA`, `SYNTH-PRG-BRAVO`, etc.). This is a rendering bug, not a data-model gap. **Bonus finding, not yet logged as its own WF item:** the seed data includes deliberately engineered execution-status classifications (on-plan, under-executing, over-executing, ceiling-proximate) that don't appear anywhere in the current Execution Monitoring prose — real, already-computed richness the screen isn't using. |

---

## Recommended Path Forward

**Session status, as of this pause — for whoever picks this up next:** Part 0
(Home page confirmation) and Part A Step A1 (portfolio visibility, corrected
to Execution Monitoring) are complete. **A2 through A6 are blocked by WF-10**
— none of PPBE's four agents have a UI trigger point, so these steps cannot
be attempted, not merely untried. **B1 is blocked by an unresolved SCRIBE
click-through diagnostic** — does selecting a different queue item actually
update the detail panel, or is the list non-interactive. B2 and B3 were never
started. The walkthrough is deliberately paused here for a Build Agent
session, then a shorter, targeted repeat pass — not abandoned mid-step.

**Step 1 — Resolve the governance decisions (Part 2) now, in chat.** These
are quick — most are a single clear answer, not a debate. Doing this first
means the Build Agent session gets scoped once, correctly, instead of
guessing and needing a second pass.

**Step 2 — One Build Agent session covering Part 1's findings plus
whatever Part 2 decisions unblock.** WF-1, WF-4, WF-5, and WF-7's
investigation are ready now regardless of Part 2. WF-2's fix, WF-6's FYNSP
work, the terminology rename's actual scope, and either design
recommendation only become buildable once Part 2 has real answers.

**Step 3 — Resume Walkthrough F from Step A1 now — WF-7 is resolved.**
One correction to the script itself: A1 originally assumed the "Portfolio
Dashboard" tab was where the seeded PPBE portfolio would appear. It isn't —
that tab is APEX's own, unrelated, older feature. **A1 should verify
against Execution Monitoring instead**, where ALPHA through ECHO are
confirmed correctly displayed under their full descriptive names. WF-4
(Program Detail rendering identically to Portfolio Dashboard) is still open
and doesn't block this — it affects APEX's own portfolio feature, not the
PPBE data A1 actually needs to confirm. A2 through A6 and all of Part B
still need to run — this session did not complete the walkthrough, only
surfaced findings from its first step and a related design conversation.

**One thing worth deciding explicitly, not defaulting on:** should the two
design recommendations (Part 3) go in the *same* Build Agent session as
the Part 1 bug fixes, or get their own separately-scoped session(s)? They're
meaningfully larger than the bug-fix list, and bundling everything into one
session risks the same "too much in one exchange" problem this project's
own standing constraints exist to prevent (one component per exchange,
even in autonomous mode).

---

## Appendix — Worth Considering as a Standing Criterion

WF-5 and the broader "Execution Monitoring is a wall of prose" problem
share a root cause: numeric, structured data getting rendered as sentences
instead of tables or charts. This passes Gap 5's literal test (it *is*
grammatically plain language) while still failing to let a reviewer orient
in five seconds — the walkthrough guidance's own standard. Worth deciding
whether to formalize this as a new standing criterion (a "Gap 7") the way
Gap 5 and Gap 6 were promoted from one-off findings to permanent checks —
consistent with the walkthrough process's own stated practice of promoting
systemic findings rather than just fixing the one instance.

---

*Walkthrough F Findings Report · July 15, 2026*
*Pre-Decisional · Internal Working Document*
-e 

# ============================================================
# 2. WALKTHROUGH STANDARD PRACTICES
# ============================================================

# SOVEREIGN Platform — Walkthrough Standard Practices & Lessons Learned
## Consolidated Reference · July 15, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Author:** Governance Agent
**Purpose:** A single place to check before and during any walkthrough,
instead of reconstructing process and history from scattered changelog
entries each time. This document consolidates what the Strategic Plan's
Part IV and Part IX already establish — it does not introduce new process.
**Provenance note:** Individual walkthrough findings below are stated at
the level of detail actually available in the Strategic Plan's own
changelog. The full per-walkthrough report files
(`SOVEREIGN_Walkthrough_D_Report.md`, `Walkthrough_E2_Findings_Record.md`,
and equivalents for A, B, C, E) exist on this project but their content has
not been reviewed to produce this document — if a finding below needs more
detail than is given, go to the source file, don't assume this summary is
complete.

---

## 1. What a Walkthrough Is, and Why It's Not Optional

A Level 1 walkthrough is a human-in-the-loop validation session conducted
**with the Governance Agent, not the Build Agent.** The Project Principal
operates the live platform in a browser; the Governance Agent provides
step-by-step guidance and confirms or flags behavior against a scenario
script.

**Purpose:** validate that the most recently built stage works end-to-end
as a *system* — not just that unit tests pass. Unit tests validate
components in isolation; a walkthrough is the only check that catches
integration gaps between them. It also builds the Project Principal's own
familiarity with operating the platform, and produces a rehearsed run of
whatever will eventually be shown to the CTO.

**Why it's load-bearing, not polish:** every real stage transition in this
project's history has gone through one. Time & Travel and PPBE do not get
an exception, and neither will anything built after them.

---

## 2. Standard Process

1. Project Principal opens the dev server:
   `cd ~/Developer/sovereign-platform/sovereign-shell && npm run dev`
2. The Governance Agent provides a scenario script — a synthetic situation
   walking through the feature being validated. **The script is written
   AFTER the relevant build session closes, against what was actually
   built — never in advance of it, against what the spec merely intended.**
3. Project Principal works through the scenario in the browser.
4. Project Principal shares screenshots at each step; the Governance Agent
   confirms correct behavior or identifies a gap.
5. **Gaps found become the first deliverables of the next build session.**
   This is the mechanism, not an exception to it — it produced Walkthrough
   D's 12 findings, Walkthrough E's findings, and every gap-fix session
   since.

---

## 3. Standing Validation Criteria — Apply to Every Walkthrough, No Exceptions

- **Gap 5 — plain language.** A human reviewer must be able to read all
  output as plain prose. No product passes its walkthrough if this isn't
  met.
- **Gap 6 — content-type distinction.** A human reviewer must be able to
  orient within five seconds of seeing any given output — understand what
  kind of content they're looking at without needing to study it. No
  product passes its walkthrough if this isn't met either.
- **Provenance note on these two:** both originated as findings in an
  earlier walkthrough (before Walkthrough D) and were promoted to standing,
  permanent criteria rather than one-off fixes — this is itself worth
  reusing as a pattern: if a finding reveals a systemic gap rather than a
  one-off bug, consider promoting it to a standing check the same way,
  instead of just fixing the one instance.

---

## 4. Accumulated Findings, By Walkthrough (Summary Level)

**Walkthrough D:** 12 findings recorded; fed directly into Session 26's
close-out. (Full detail: `SOVEREIGN_Walkthrough_D_Report.md`, not reviewed
for this summary.)

**Walkthrough E:** 6 findings recorded. (Full detail:
per-walkthrough report file, not reviewed for this summary.)

**Walkthrough E-2** (the most recent Time & Travel walkthrough, and the
most fully documented in the Strategic Plan's own changelog):
- **WE-1, WE-2, WE-5** — confirmed fixed live.
- **WE-7** — no landing page existed; formally logged, later built as part
  of a subsequent session's D4 deliverable.
- **WE-8, WE-9** — unplanned *positive* findings: time/expense drafting and
  VIGIL escalation routing both confirmed working end-to-end without
  needing further fixes. Worth noting explicitly — not every walkthrough
  finding is a problem; confirming something already works is real
  information too, and prevents wasted future investigation into a
  non-issue.
- **WE-10** — a critical finding: the travel approval drafting pipeline's
  status was unknown. Root-caused in the next session as a clean wiring
  gap (the drafting engine was never actually invoked, despite being
  correctly built) and fixed with regression tests.
- **WE-11, WE-12** — decision-note UX findings. WE-12 was later
  definitively answered: the manager's decision note is audit-only and
  deliberately does not feed into any drafted communication, by design.

**Sessions 35-37** (not a walkthrough, but the same discipline applied and
produced findings worth carrying into walkthrough practice — see §5).

---

## 5. Process Lessons Worth Applying During Any Walkthrough

These generalize beyond any one walkthrough and are worth having in mind
while actually running one, not just as abstract rules:

- **A confirmed-working screenshot is evidence of that specific state at
  that specific moment — not evidence the underlying path was fully
  exercised.** Session 35's smoke test taught this the hard way: a
  fallback path's "PASS" looked identical to a genuine pass from the
  outside. During a walkthrough, if something behaves correctly, consider
  briefly whether an easier, degraded path could have produced the same
  visible result — especially for anything with a fallback or cache layer.
- **A claim that something "should work" is not the same claim as "I
  watched it work."** Confirm behavior from the actual screenshot in front
  of you, not from what the spec or a prior handoff says should happen.
- **When a finding reveals a systemic gap, not just a one-off bug, consider
  promoting it to a standing validation criterion** the way Gap 5 and Gap 6
  were — see §3.
- **Positive findings are worth recording as explicitly as negative ones**
  (see WE-8/WE-9 above) — confirming something works prevents redundant
  future investigation, and gives an accurate picture of what's actually
  been validated versus merely assumed.

---

## 6. What Happens After a Walkthrough Closes

1. Findings get logged — historically as a dedicated per-walkthrough
   findings/report file, referenced by name in the Strategic Plan's
   changelog.
2. The Strategic Plan's Part IX (Change Control) gets a new entry
   summarizing what was found.
3. Findings become the first deliverables of the next build session — not
   a backlog to get to eventually.
4. If a finding is systemic rather than one-off, consider whether it
   should become a new standing validation criterion (§3).

---

*SOVEREIGN Platform Walkthrough Standard Practices & Lessons Learned*
*Consolidated July 15, 2026 · Pre-Decisional · Internal Working Document*
-e 

# ============================================================
# 3. ORIGINAL SCENARIO SCRIPT
# ============================================================

# Walkthrough F — Scenario Script (Rewrite)
## PPBE End-to-End + Full-Platform Pass
Rewritten July 16, 2026, incorporating direct code-level tracing of the
actual data model — not just the original script's assumptions. Supersedes
the July 15 version. No build session has run against these findings yet,
so this script is deliberately structured to confirm known issues quickly
rather than rediscover them, and spend real attention on what's genuinely
still unknown.

**How this works, unchanged from before:** work through each step, share a
screenshot after each one. I'll confirm correct behavior or flag a gap
against the standing criteria (Gap 5 — plain language; Gap 6 — orient
within 5 seconds). Where a step is checking a **known issue**, that's
labeled explicitly — the point is confirming current state, not surprise.
Where a step is genuinely open, that's labeled too.

**Before starting:**
```
cd ~/Developer/sovereign-platform/sovereign-shell
npm run dev
```

---

## PART 0 — Home Page, Quick Confirmation Pass

Not new investigation — just establishing starting state for three already-
logged findings before moving on, so we're not re-discovering them mid-walkthrough.

- **WF-1 (known):** does the subtitle still read "Invalid Date"?
- **WF-2 (known, pending a decision, not a fix):** does the CPMI-VRS badge
  still read GREEN against all-"Not started" module rows?
- **WF-3 (known, low priority):** still shows "Agent Identity Standard v1.0"?

One screenshot, confirm all three, move on — this isn't meant to be a slow
step.

---

## PART A — PPBE End-to-End

**The story, unchanged:** you're a program manager reviewing the ALPHA–ECHO
portfolio partway through a budget cycle.

### A1 — Portfolio visibility — corrected navigation
**Go to Execution Monitoring, not Portfolio Dashboard.** This is a real
correction from the original script, confirmed by direct trace: Portfolio
Dashboard and its `P-100`-style programs are a separate, legitimate, older
APEX feature unrelated to PPBE. Execution Monitoring is where the real
seeded PPBE portfolio actually lives.

Confirm:
- All five programs (ALPHA through ECHO) are visible under their full
  descriptive names (e.g., ALPHA as "Logistics Data Interchange
  Modernization").
- **Genuinely open, worth noting if you see it:** the obligation data we
  traced only showed ALPHA, BRAVO, CHARLIE, and DELTA with explicit
  entries — ECHO's obligation status wasn't confirmed in that trace. If
  ECHO is missing or shows differently from the other four, that's new
  information, not a known issue.
- **WF-7 (known, small fix pending):** is there currently any on-screen
  label distinguishing this screen's data from Portfolio Dashboard's? If
  not, that's expected — it's the logged, un-fixed finding.

### A2 — Evidence synthesis — enhanced checks
Trigger `ppbe-evidence-synthesizer` against the seeded EvaluationFindings.
We now know the real structure of this data: each finding carries a
`status` (`on-track` / `variance`) and a `feeds_planning` boolean. Check:
- Advisory label present.
- Citations correspond to real seeded findings — you can sanity-check this
  against what we traced: ALPHA has 5 findings, 4 of which feed planning;
  BRAVO has multiple variance findings tied to supplier delays.
- **Worth watching for specifically:** does the synthesis output actually
  reflect the `status`/`feeds_planning` distinction in any way, or does it
  flatten everything into generic prose? We already know this
  classification exists in the data and isn't surfaced on the Execution
  Monitoring screen (part of WF-5's broader finding) — worth checking
  whether the agent's own output has the same gap, which would make it a
  platform-wide pattern rather than one screen's issue.
- Gap 5/6.

### A3 — Scenario analysis
Trigger `ppbe-scenario-analyst` for a resource-allocation question.
Unchanged from the original script: confirm at least two distinct
alternatives, advisory label, Gap 5/6.

### A4 — Exhibit drafting — still the one to watch closely
Trigger `ppbe-exhibit-drafter` in Budget Exhibit mode for **ALPHA**. This
is still the agent with Session 37's open, undiagnosed validation finding —
if it reproduces here, screenshot exactly what you see, including any
fallback or error state. If it works cleanly, confirm every dollar figure
traces to a real source record and the tool name never appears in the text.

### A5 — Coordination tracking
Trigger `ppbe-coordination-assistant` against the seeded meeting-notes
corpus. Unchanged from the original script — we haven't traced this data
the way we traced obligations and findings, so there's nothing new to add
here yet. If something looks off, that's genuinely new information.

### A6 — Anomaly routing — now with real infrastructure confirmed
We now know real Python-side infrastructure exists for this
(`seed_ppbe_events.py`, `ppbe_emitter.py`, and matching tests) — this isn't
speculative plumbing. If either deterministic monitor
(`ppbe-ledger-monitor`, `ppbe-dependency-tracker`) has a live threshold
breach in the seeded data, confirm the resulting `PPBE_ANOMALY` event
appears in VIGIL's alert queue with context a human operator could actually
act on.

---

## PART B — Full-Platform Pass

### B1 — Live re-check of the Session 35 cross-module fix — higher confidence than before
This is the one part of the whole script we now have strong direct
evidence for, not just a prior handoff's assertion. `SYNTH-TM-205` and its
associated flag `SYNTH-TM-205-F1` are directly wired into real source files
in both `module-vigil` and `module-scribe`, confirmed by trace, not
inference. Steps unchanged from the original script:
1. Find the pending escalation (`SYNTH-TM-205-F1`) in VIGIL's approval
   queue.
2. Screenshot `TTManagerReview` **before** approving — send disabled,
   "Awaiting VIGIL authorization."
3. Approve in VIGIL.
4. **Without refreshing**, screenshot `TTManagerReview` again — send
   enabled, notice gone.

### B2 — Spot-check the rest of the platform
Brief pass, unchanged in method. **One thing worth a slightly closer look
than a generic glance this time:** CPMI's world model doesn't work the way
APEX's does — it reads from a live, configurable endpoint
(`cpmi-world-model-endpoint.ts`), not a static seed file. Whatever CPMI
shows for portfolio/program data is coming from a different mechanism
entirely than what Execution Monitoring shows. Worth a screenshot
specifically of whatever CPMI displays here — if it shows the same P-100
or ALPHA-ECHO programs, that's useful evidence toward the still-open
question of whether it shares APEX's data or has its own; if it shows
something else entirely, that's its own finding.

### B3 — Gate status
Unchanged: confirm the landing page's CPMI-VRS status rollup honestly
reflects that Gate 3/4 attestation is still open.

---

## After This Closes

Findings get logged the same way as every prior walkthrough — see
`SOVEREIGN_Walkthrough_Standard_Practices.md` §6, and fold into
`SOVEREIGN_Walkthrough_F_Findings_Report.md` rather than starting a new
document. Genuinely new findings (anything not already numbered WF-1
through WF-7 above) become the next entries in that same report.
-e 

# ============================================================
# 4. REPEAT PASS SCRIPT (CURRENT NEXT STEP)
# ============================================================

# Walkthrough F — Repeat Pass
## Targeted Re-Verification of Session 38, Then Resume Where We Left Off
July 17, 2026

**How this is different from the original script:** this isn't a fresh run.
Every step below exists because Session 38 claimed to fix something specific
— the point is confirming the claim, not rediscovering the problem. Ordered
by risk: the items most likely to reveal a real gap between "claimed fixed"
and "actually fixed" come first.

---

## PRIORITY 1 — SCRIBE Click-Through (Part 1's Claim)

**The claim:** "selection was always correct, this was a walkthrough
misperception," backed by an automated test.

**Why this is first:** a passing test confirms selection state changes
internally — it does not confirm the detail panel visibly re-renders for a
human watching the screen. Those are different claims. This was never
actually watched live before Session 38 started.

**Do this:** go to SCRIBE's Time & Travel Review queue. Click
`SYNTH-TM-201-F1`, screenshot the detail panel. Click `SYNTH-TM-203-F1`,
screenshot again. **The two screenshots must show different content** —
different compliance analysis, different draft. If they're identical, the
original finding was real and Session 38's fix didn't address it.

---

## PRIORITY 2 — PPBE Agent Triggers (WF-10's Claim)

**The claim:** all four agents (`PPBEAgentsPanel`, `PPBEExhibitPanel`,
`PPBECoordinationPanel`) now have real, clickable triggers; static tier runs
honestly in dev with no live key.

**This is the biggest fix in the session — worth the most scrutiny.** For
each of the four:
1. Find and click the trigger.
2. Screenshot the output.
3. Confirm: advisory label present, static-tier disclosure honest and
   visible (not hidden), and — for evidence synthesis and exhibit drafting
   specifically — confirm the output actually references real seeded data
   (ALPHA-ECHO program names, real finding IDs), not placeholder text.

If any of the four don't produce real output, or the button doesn't exist
where claimed, that's a partial fix, not a complete one.

---

## PRIORITY 3 — Obligation Authorization Panel (WF-9's Claim)

**The claim:** a seeded obligation case appears in VIGIL's queue;
`ObligationDecisionPanel` requires both a decision note and a linked COUNSEL
Decision Record ID before Approve enables.

**Do this:** find the obligation case in VIGIL's Agent Approval Queue.
Screenshot it with the note field empty — Approve should be disabled.
Fill in a note only (no COUNSEL ID) — screenshot, Approve should still be
disabled. Add a COUNSEL Decision Record ID — screenshot, Approve should now
be enabled. Three screenshots, three states — if Approve enables at any
point before both fields are filled, that's a governance-gating failure,
not a cosmetic issue.

---

## PRIORITY 4 — Supervision Efficiency, Full Coverage Check (WF-11's Claim)

**The claim:** `ApprovalQueue` cards for `ppbe_obligation` and
`ppbe_phase_transition` show inline context; SCRIBE's queue rows now
include `employee_id`.

**The specific risk:** only the two *new* PPBE card types got fixed, while
the *original* card types this finding was actually about —
`model_deployment`, `data_export`, `configuration_change` — still show only
raw agent/system taxonomy.

**Do this:** screenshot VIGIL's Agent Approval Queue with all card types
visible. Confirm `model_deployment`, `data_export`, and
`configuration_change` cards now show human-relevant inline context, not
just the two new PPBE types. If they don't, this finding is partially
addressed — real progress, not full compliance with the standard as
written.

---

## PRIORITY 5 — Quick Checks (WF-1, WF-4, WF-5, WF-7)

- **WF-1:** screenshot the Home page subtitle — confirm "Invalid Date" is
  gone.
- **WF-4:** screenshot Program Detail. Confirm it's an honest placeholder
  ("not yet built" messaging) rather than either the old identical-render
  bug or a claim of working functionality that isn't there.
- **WF-5:** screenshot Execution Monitoring's variance section — confirm
  program names and execution-status classifications (on-plan,
  under-executing, over-executing, ceiling-proximate) are now visible.
- **WF-7:** screenshot Portfolio Dashboard and Execution Monitoring side by
  side — confirm the header change actually makes the distinction clear to
  someone seeing both for the first time, not just technically accurate.

---

## THEN — Resume the Original Script

If Priorities 1-2 hold up (the two highest-risk items), continue from where
Walkthrough F actually stopped:

**A3 — Scenario analysis:** trigger `ppbe-scenario-analyst`, confirm at
least two distinct alternatives, advisory label, Gap 5/6.

**A5 — Coordination tracking:** trigger `ppbe-coordination-assistant`
against the seeded meeting-notes corpus, confirm no invented action items.

**A6 — Anomaly routing:** if either deterministic monitor has a live
threshold breach in the seeded data, confirm it reaches VIGIL's alert queue
with usable context.

**Part B — Full-platform pass:**
- **B1** — live re-check of the Session 35 cross-module fix: approve
  `SYNTH-TM-205-F1` in VIGIL, confirm `TTManagerReview` flips to sendable
  without a refresh.
- **B2** — spot-check the rest of the platform, one screen per
  product/module; specifically screenshot whatever CPMI's live world-model
  endpoint shows, since that's still an open question from earlier tonight.
- **B3** — confirm the Home page's Gate 3/4 status still reads honestly.

---

*Every screenshot in this pass is evidence for the Project Principal's own
pass/fail determination — nothing here self-certifies as resolved.*
-e 

# ============================================================
# 5. SESSION 38 BUILD AGENT PROMPT
# ============================================================

SOVEREIGN Platform — Session 38
Walkthrough F Findings: Unblock, Fix, and Bring VIGIL/SCRIBE to Standard
July 16, 2026

You are the Build Agent. This session addresses findings from Walkthrough F
(paused mid-session, findings fully documented in
SOVEREIGN_Walkthrough_F_Findings_Report.md — read it in full before starting,
it is the authoritative source for every finding referenced below). Five
parts, sequenced deliberately — Part 3 adds a new VIGIL queue card type,
Part 4 fixes the display of that queue (including the card Part 3 just
added), so display work doesn't happen twice.

**Important framing, not just for you but for how this session's output gets
used:** Walkthrough F will resume after this session closes, as a shorter,
targeted re-verification pass — not a full re-run. Whether each finding is
actually considered resolved is the Project Principal's call, made during
that re-verification, not something this session or its own tests determine
unilaterally. Build to the standard described below; don't declare victory
in the handoff — describe what was built and let the walkthrough confirm it.

=== STATE CHECK ===

Confirm HEAD via git log -1. Confirm shell-contract.ts still hashes correctly
per the current DOCUMENT_MANIFEST.tsv / most recent Integration Brief.

=== PART 1 — SCRIBE Click-Through Diagnosis and Fix ===

**Finding:** SCRIBE's Time & Travel Review queue may not be responding to
selection — clicking different queue items (`SYNTH-TM-201-F1` through
`SYNTH-TM-206-F1`) appeared to leave the detail panel showing the same
content regardless of which item was clicked. This was observed but never
conclusively diagnosed — the specific test (click `SYNTH-TM-203-F1`, confirm
whether the panel updates) was never completed.

**Your task:** confirm this first, directly — don't assume the finding is
real without checking. If selection genuinely doesn't update the panel,
find and fix the real cause (likely a state/key binding issue in the list
component). If it turns out selection does work and this was a
misunderstanding of a specific interaction, say so plainly in the handoff
rather than "fixing" something that wasn't broken.

=== PART 2 — PPBE Agent UI Wiring (WF-10) ===

**Finding, already confirmed by extensive direct trace, not a hypothesis to
re-verify:** none of PPBE's four core agents — `ppbe-evidence-synthesizer`,
`ppbe-scenario-analyst`, `ppbe-exhibit-drafter`, `ppbe-coordination-assistant`
— have any UI call site anywhere in the platform. A repository-wide search
excluding test files found only each function's own definition file. This
was independently confirmed twice tonight; you do not need to re-run that
search, you need to fix what it found.

**Requirement, not a prescribed design:** give each of the four agents a
real, clickable trigger somewhere sensible in the existing UI — most likely
within or near Execution Monitoring, but use your own judgment given actual
access to the codebase. **This is explicitly NOT the full PPBE Monitoring
redesign** (three-fiscal-year reorganization, real charts replacing the
prose walls) — that is separate, deliberately deferred design work, out of
scope for this session. The bar here is: a human can click something real
and see that agent's real output, with the same validator/advisory-label
treatment already proven correct in Sessions 35-37's smoke tests — reuse
that existing validation logic, do not rewrite it.

**Expected, not a bug:** no live Anthropic API key exists in this
environment (confirmed repeatedly, Sessions 35-37). Triggering these agents
in dev will correctly return the static fallback tier, honestly labeled.
Do not attempt to source a credential yourself — that's a Project Principal
action, not a build task.

=== PART 3 — Obligation Authorization VIGIL Card (WF-9) ===

**Finding:** `recordObligationAuthorization()` in
`module-vigil/src/ppbe-authorization.ts` is real, well-built, and
governance-gated (requires a linked COUNSEL Decision Record, a
minimum-length note, correct case state) — but is called only from test
files. No screen lets a manager actually trigger it.

**Hypothesis, not yet confirmed — check before building:** this platform
consistently hosts gated human decisions inside VIGIL's approval queue (Time
& Travel escalations, NEXUS routing, AgentOS deployments all follow this
pattern). The likely correct fix is a new card type for
`PENDING_AUTHORIZATION` obligation cases in that same queue, not a new
screen. Confirm this holds for this specific case before building — if the
existing approval queue's card model doesn't cleanly extend to obligation
cases, that's a real Hard Stop, not a reason to force a fit.

=== PART 4 — Supervision Efficiency Standard Compliance (WF-11) ===

**This finding is held to full rigor — build to the actual standard below,
not a partial or cosmetic pass.** Source: `docs/14_HumanReviewerStandard.md`
Addendum, v1.0, APPROVED June 29, 2026 — a binding, walkthrough-gating
design standard, not a suggestion. Apply all three parts of Standard §2 to
VIGIL's Agent Approval Queue and SCRIBE's Time & Travel Review queue
(including the new card type Part 3 just added):

**2.1 — Context must be surfaced, not retrieved.** The relevant program
state, the most recent governance decision on record, and the specific
finding that triggered the review must appear on the same screen as the
action the reviewer is asked to take — not behind a click-away. Currently,
both queues show only agent/system taxonomy in list view (`model_deployment
/ agentos-deployer / [timestamp]`, `SYNTH-TM-205-F1 · MISSING_HOURS ·
WARNING`) — no indication of who's affected or what's being asked until the
reviewer opens the item.

**2.2 — Verification cost must be visible, not assumed.** When a system's
confidence is degraded — a static fallback fired, partial data — that must
be disclosed on the same screen, in plain prose, so the reviewer can
calibrate their own verification effort. Apply this to anything Part 2's
new agent triggers produce that falls back to static.

**2.3 — Repeated reconstruction is a design defect.** If a reviewer would
need to re-supply the same context (program identifier, prior decision
history) more than once across a single workflow touching these queues,
that's a defect to fix, not something to note and leave.

**Reference pattern, already live and correct — use it, don't invent a new
one:** ARIA Suite's "Process compliance — governance calendar" table already
satisfies 2.1 correctly — due date, timing status, and severity all inline,
nothing hidden. Match that shape for VIGIL and SCRIBE's queue rows.

**What §2.2 explicitly does NOT require, per the standard's own text:** no
new engagement-verification friction, no minimum time-on-screen, no forced
re-reading delays. The standard governs what the system discloses, not how
it polices the reviewer. Don't add mechanisms the standard itself rules out.

=== PART 5 — Confirmed Bug Fixes (Tier 2) ===

Five smaller, independent, well-scoped fixes:

- **WF-1:** Home page subtitle reads "Status as of Invalid Date" — find the
  date source, fix the formatting failure, or remove the clause if no real
  timestamp exists yet.
- **WF-3:** verify whether "Agent Identity Standard v1.0" on the Home page
  is a hardcoded stale citation or a legitimate stable schema-version
  reference distinct from the document's own revision history. Two-minute
  check, not a redesign.
- **WF-4:** APEX's Portfolio Dashboard and Program Detail tabs render
  identical content — confirm what Program Detail is actually supposed to
  show (a single-program drill-down, presumably) and wire the route
  correctly.
- **WF-5:** budget-to-actual variance data already has program attribution
  in the raw seed (`SYNTH_PPBE_OBLIGATIONS` — second field of every record)
  and unused execution-status classifications (on-plan, under-executing,
  over-executing, ceiling-proximate). Surface both — this is a rendering
  fix, not a data-model change.
- **WF-7:** Portfolio Dashboard and Execution Monitoring are two genuinely
  separate, unrelated systems sharing a tab bar with no on-screen signal
  distinguishing them. Add a clear label or subtitle to each.

=== STANDING RULES (unchanged) ===

All 11 standing constraints apply. Commit each Part separately — five
commits, not one — for clean, independent revertibility given how
distinct this work is.

=== SESSION CLOSE ===

1. Commit and push each part separately.
2. Handoff structure: one section per part, stating plainly what was found,
   what was built, and — critically for Part 4 — a factual description of
   what the queues now show, not a claim that the standard is "satisfied."
   That determination happens at the repeat walkthrough.
3. Fresh test count, JS/Python split.
4. State explicitly which parts are ready for the repeat walkthrough to
   verify, and flag anything that turned out differently than its finding
   described (e.g., if Part 1's diagnosis found selection actually works).

State your done-condition for all five parts before beginning.
-e 

# ============================================================
# 6. SESSION 38 GATHER SCRIPT
# ============================================================

#!/usr/bin/env bash
set -uo pipefail

OUT="/tmp/session38_context.md"
> "$OUT"

echo "SOVEREIGN Session 38 Context Gather (Walkthrough F findings — 5 parts)" >> "$OUT"
echo "" >> "$OUT"

MISSING=0

add_file() {
  local path="$1"
  local label="$2"
  if [ -f "$path" ]; then
    echo "  OK $path"
    {
      echo "----------------------------------------------------------------"
      echo "FILE: $path"
      echo "PURPOSE: $label"
      echo "----------------------------------------------------------------"
      cat "$path"
      echo ""
    } >> "$OUT"
  else
    echo "  MISSING: $path  ($label)"
    MISSING=$((MISSING+1))
  fi
}

find_and_add() {
  local pattern="$1"
  local label="$2"
  local hit
  hit=$(find . -iname "$pattern" -not -path "./node_modules/*" 2>/dev/null | head -1)
  if [ -n "${hit:-}" ]; then
    add_file "$hit" "$label"
  else
    echo "  NOT FOUND by pattern: $pattern  ($label)"
    MISSING=$((MISSING+1))
  fi
}

echo "Gathering Session 38 context files"
echo ""

echo "-- Standing platform docs --"
add_file "AGENT_REFERENCE.md" "Cross-project methodology, Rules 1-11"
add_file "Agent_Identity_Standard.md" "Canonical agent registry"
add_file "shell-contract.ts" "Frozen shell contract, verify hash"
find_and_add "SOVEREIGN_Platform_Integration_Brief*.md" "Current platform state"

echo ""
echo "-- Required reading: the findings themselves --"
add_file "SOVEREIGN_Walkthrough_F_Findings_Report.md" "Authoritative source for every finding this session addresses"

echo ""
echo "-- Part 1: SCRIBE click-through --"
add_file "module-scribe/src/PPBEDashboard.tsx" "May be unrelated — verify path; the actual TT Review queue component needed"
find_and_add "*TTReview*" "SCRIBE Time & Travel Review queue component"
find_and_add "*tt-synthetic-review*" "Seed data behind the queue"

echo ""
echo "-- Part 2: PPBE agent source files (WF-10) --"
add_file "module-apex/src/ppbe-evidence-synthesizer.ts" "Agent 1 of 4, currently unwired"
add_file "module-apex/src/ppbe-scenario-analyst.ts" "Agent 2 of 4, currently unwired"
add_file "module-scribe/src/ppbe-exhibit-engine.ts" "Agent 3 of 4, currently unwired"
add_file "module-nexus/src/ppbe-coordination-assistant.ts" "Agent 4 of 4, currently unwired"
add_file "module-apex/src/PPBEDashboard.tsx" "Likely mounting point for new triggers"
add_file "module-apex/src/ApexApp.tsx" "Composition root, likely where triggers get wired"

echo ""
echo "-- Part 3: Obligation authorization (WF-9) --"
add_file "module-vigil/src/ppbe-authorization.ts" "recordObligationAuthorization(), currently unwired"
find_and_add "*ApprovalQueue*" "VIGIL's existing approval queue component, the pattern to extend"

echo ""
echo "-- Part 4: Supervision Efficiency (WF-11) --"
find_and_add "14_HumanReviewerStandard.md" "Base standard — Gap 5/6 definitions"
find_and_add "*Addendum_SupervisionEfficiency*" "The binding standard itself, all three sub-parts"
find_and_add "*ClearDashboard*" "ARIA's governance-calendar table — the reference pattern to match"

echo ""
echo "-- Part 5: Confirmed bug fixes --"
find_and_add "*PlatformHome*" "WF-1, Invalid Date bug"
add_file "sovereign-data/src/synthetic/ppbe-seed.ts" "WF-5 — confirms program attribution already exists"
add_file "module-apex/src/apex-data-adapter.ts" "WF-4 — Portfolio Dashboard / Program Detail routing"

echo "" >> "$OUT"

if [ "$MISSING" -gt 0 ]; then
  echo ""
  echo "$MISSING file(s) not found by exact path or pattern."
  echo "Several are find-pattern guesses, not confirmed repo paths -- a miss"
  echo "here may just mean the real path differs. Check manually before"
  echo "assuming something is actually absent."
else
  echo "All target files found."
fi

if command -v pbcopy >/dev/null 2>&1; then
  cat "$OUT" | pbcopy
  echo "Context copied to clipboard, $(wc -l < "$OUT") lines."
else
  echo "pbcopy not found, context written to $OUT, copy manually."
fi

echo ""
echo "Next: open the Build Agent in Terminal 1"
