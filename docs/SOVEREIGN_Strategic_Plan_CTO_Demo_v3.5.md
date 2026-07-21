# SOVEREIGN Platform — Strategic Plan to CTO Demo
## Version 3.5 · July 20, 2026
### Governing Document for All Demo-Path Work — Consolidated

**Classification:** Pre-Decisional · Internal Working Document
**Authority:** Project Principal · SOVEREIGN Platform Governance Authority
**Author:** Governance Agent
**Status:** ACTIVE — governs all work toward the CTO demonstration until superseded
**Changed this version:** six more sessions closed (44-49), completing GD-23
(`ProgramStatusSurface`), GD-24 (`WorkQueueSurface`), APEX's chart redesign, and
both phases of the Home Dashboard. **More significant than any single session:
`docs/22`, a new design-philosophy authority for informed decision-making across
the whole platform, developed while scoping the Reviewer's Workspace and
recognized mid-conversation as applying more broadly than that one feature.**
This adds a genuine new strategic thread — Part XI, below — not just more
build-sequence rows. One real gap surfaced and corrected while writing this
version: `Agent_Identity_Standard.md`'s SCRIBE-prompt deferral, decided the
same night as the Strategic Plan's own last refresh, was never actually
placed — caught only by directly checking the repo rather than trusting it was
done. **Changed in v3.4, for reference:** the biggest single jump in this
document's history before this one.
**Walkthrough F actually ran, twice, live, in the browser — the thing v3.3 called
"ready now" is now genuinely done.** The original run found 12 findings (WF-1
through WF-12), addressed by Session 38. A required repeat pass then found 12
more (WF-13 through WF-24) — real gaps unit tests structurally cannot see, exactly
the risk Part VII already warned about. Sessions 39 and 40 fixed the repeat-pass
findings and two design recommendations (persona-switchable dev login; an honest
Outlook "coming soon" affordance instead of silent copy-paste). Session 40 also
correctly Hard-Stopped on a cross-module data-access attempt rather than force a
fragile fix — see Part VI, this is now the plan's clearest sequencing risk.
**A full role-based access matrix was designed and built** (GD-22, Session 41) —
the platform's access model went from "SYSTEM_ADMIN can see everything, no other
role can see anything" (a real, serious gap the old single-role gate silently
had) to all eight roles correctly scoped, including a first-of-its-kind per-tab
gate inside ARIA that's now documented in `AGENT_REFERENCE.md` v3.1 so a second
implementation doesn't diverge. Session 42 shipped module labels and hover
orientation content plus four more live-found findings (WF-25–28). **A genuine
post-milestone technical assessment ran** (per this plan's own Part IV standard,
applied for the first time) — it independently re-verified test suites, ran the
existing-but-never-executed WCAG contrast test, and surfaced a real, precisely
diagnosed accessibility failure (WF-14, `#94a3b8`, ~2.4:1 against a 4.5:1
requirement, invisible to every existing test) plus a live agent-count
self-contradiction inside `Agent_Identity_Standard.md` itself — exactly the kind
of thing Part VII's "green tests aren't the whole story" risk exists to catch,
now with two more real instances on the record. Session 43 fixed WF-14 at all
eight locations **and closed the test gap that let it hide**, adding 8 regression
pairs. **A new, sharper risk was found this cycle, not just fixes:** two
sessions (39, 41) initially closed with a chat recap instead of an actual `git
push` — caught only because Rule 5-style verification is now standing practice,
not a one-off. The Close Protocol is now a non-negotiable first section of every
opening prompt as a direct result. **Two governance documents were corrected**
(`Agent_Identity_Standard.md`'s stale agent-count claim; `AGENT_REFERENCE.md` v3.1
documenting the ARIA per-tab pattern) — both built and verified, placement into
the repo/iCloud/project-knowledge is the immediate next mechanical step, tracked
in Part VIII. **New, real, and not yet resolved:** two registered SCRIBE prompts
(`framing_system.md`, `synthesis_system.md`) have no file on disk and no
documented deferral decision — unlike `lens-orientation`'s, this gap was
previously unknown; see Part VI.
**Relationship to other documents:** unchanged — this remains the authoritative
sequencing reference. Companion document for this cycle's full evidence:
`SOVEREIGN_EndToEnd_Assessment_20260719.md`.

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
script. Everything in this plan exists to reach that state on purpose. **As of
v3.4, the walkthrough half of this bar is genuinely met** — both original and
repeat passes ran live, findings fixed and re-verified. What remains is Gate 3/4
attestation (Project Principal's own pace) and the rehearsal itself.

### 2. Demo Scope, In Presentation Order

| # | Component | Role |
|---|---|---|
| 1 | Core six-product pipeline + companion suite | Foundation — ready today |
| 2 | Governance/certification story | The actual differentiator — lead with it. **New concrete beat, worth walking through live:** the role-based access matrix (GD-22) produces a real three-person workflow — an Analyst drafts a PPBE exhibit in SCRIBE, a Compliance Officer certifies it in ARIA's CLEAR, a Program Manager traces its full authority chain in ARIA's TRACER before sign-off. Three named roles, three distinct screens, one governed workflow — a concrete answer if a CTO asks what "role-based governance" actually looks like on screen, not just in a policy document. |
| 3 | Time & Travel, fully built end-to-end | Proof-of-concept #1 |
| 4 | PPBE, fully built end-to-end | Proof-of-concept #2 — proves #3 wasn't a one-off |
| 5 | Intelligence Layer | Named as the target every product feeds, not built |

### 3. Strategic Principles

- **One linear build sequence, not two parallel tracks.** Decisions can be made in
  parallel; code cannot be built in parallel by one Build Agent working one repo.
- **Decisions precede the build session that needs them,** not the whole sequence.
  A decision needed by a later session can be made any time before that session
  opens, including while an earlier one is still running.
- **One component per exchange inside build sessions,** even in autonomous mode.
- **Walkthroughs are not optional polish — they are load-bearing.** Every stage
  transition in this platform's history has gone through one. Time & Travel and
  PPBE do not get an exception. See Part V.
- **Plan the whole path now; adjust it explicitly, not silently.** Part IX is
  where tweaks get recorded, in place, not by quiet rewrite.
- **Verify before trusting, every session.** HEAD, shell-contract hash, agent
  count, test count — fresh, every time, regardless of what a handoff claims.
  **Extended this cycle to documents themselves, not just build state:** verify a
  transferred file's actual content (checksum or line count) before committing or
  placing it anywhere — a real incident this cycle showed a clean `cp`, a clean
  `git commit`, and a clean `git push` are all consistent with the wrong file
  having been moved.

### 4. What This Plan Deliberately Does Not Chase

`REVIEW-SCOPE`, full external-connectivity architecture (`EXT-CONN-EXPLORE`), and any
actual external connector (Deltek, Concur, GFEBS) remain explicitly out of scope —
unchanged from prior versions. **Local/open-model inference capability is real,
built, and deliberately dormant** — CTO Q&A preparation, not a scheduled demo
component; see Part X.

---

## PART II — GOVERNING DECISIONS STATUS

Everything below is settled as of this version. Restated once, here, so it doesn't
need re-verifying against three other documents mid-sequence.

| Decision / Item | Status |
|---|---|
| D-TT7 | DECIDED — Option A. D-TT3 reaffirmed unchanged. `TT-EXT-GD` opened, deferred, trigger-conditioned. |
| D-P7 | DECIDED — Option A. D-P3 reaffirmed unchanged. `PPBE-EXT-GD` opened, deferred, trigger-conditioned. |
| Time & Travel prompts | APPROVED and REGISTERED, confirmed via Session 27 handoff. |
| PPBE Track scope | DECIDED — full parity with Time & Travel. Both build sessions complete. |
| `docs/18_PPBE_Workflow_Architecture.md` | DELIVERED and corrected (v1.1). |
| All four PPBE prompts | APPROVED, July 13, 2026, commit `33495da`. Approved-prompt count: 20 registered = 19 approved + 1 pending (`PR-SCRIBE-004` only) — **confirmed correct by direct on-disk census, Session 35 Part 3.** The historical "16 approved" figure in Sessions 27-30's own handoffs was a registered-vs-approved mislabel, not evidence of a real gap — root cause found and closed. |
| WE-6 (PPBE synthetic data precondition) | SATISFIED, Session 33, demonstrated not asserted. |
| Post-PPBE wrap-up decisions (four, all closed) | Three differing Integration Brief pairs resolved; operational logs gitignored; cross-module gap fix and live-call smoke test both scheduled — **both now also closed, see below.** |
| **Cross-module state gap fix (VIGIL→SCRIBE)** *(new this version)* | **COMPLETE, Session 35 Part 2.** Publishes through the shell's `taskSurface` (GD-19), no contract change. 21 regression tests, including a real e2e convergence test using the actual VIGIL and SCRIBE components on one shared context — this is the literal script Walkthrough F can run in the browser. |
| **PPBE live-call smoke test** *(new this version)* | **CLOSED, Sessions 35-37.** `ppbe-evidence-synthesizer`, `ppbe-scenario-analyst`, `ppbe-coordination-assistant` completed genuine `tier=live` completions (22-73s response times, confirming real generation). `ppbe-exhibit-drafter` produced a real live response that failed its own validator — fail-closed design working correctly, tracked as a new open item below, not a defect. |
| **Model identifier standardization** *(new this version)* | A retired snapshot identifier (`claude-sonnet-4-20250514`) was hardcoded and found via the smoke test's 404s. Standardized on `claude-sonnet-4-6` via a single exported constant (`SOVEREIGN_DEFAULT_MODEL`), confirmed as the only occurrence in the codebase. A new hermetic allowlist test now fails loudly on any future silent drift to an unvalidated model string, rather than surfacing as a live failure. Splitting agents across model tiers (e.g. Haiku for lighter tasks) was considered and explicitly declined for now, given the fragility this exact identifier just demonstrated — revisit only as a separately-scoped, evidence-based decision. |
| `TT-GD` | DECIDED — GD-21. |
| `TT-PRODUCT-GD` | DECIDED — Option 2. |
| `TT-POLICY-ENTITY` | OPEN, non-blocking, unchanged. |
| `PPBE-RECORD` | OPEN. Housekeeping only. |
| Gate 3/4 attestation | OPEN, Project Principal's own pace, blocks nothing else. |
| `module-lens` orientation prompt missing; VIGIL triage prompt path drift | Both Governance Agent corrections, neither blocking. |
| Root document cleanup | **Repo:** ~35 stale Integration Brief versions, non-blocking, unaddressed this cycle. **iCloud:** addressed this cycle — a checksum-verified, manifest-protected cleanup script moved ~66 stale versioned files into stable, type-organized archive folders; nothing deleted. |
| **Exhibit-drafter validation failure** *(new, low urgency)* | A genuine live model call succeeded and its output failed `ppbe-exhibit-drafter`'s own structural validator — likely a figure-sourcing or system-invisibility check tripping on real (vs. static-template) phrasing. Not yet diagnosed. Non-blocking for Walkthrough F; worth a scoped Build Agent session at some point. |
| **`Agent_Identity_Standard.md` — documentation integrity** | A near-miss (a stale file briefly reintroduced a previously-resolved content-loss error into the live repo) was caught and reverted; the file carries its own Documentation Integrity Note recording it. **Still unresolved:** the six PPBE agents' individual Status fields may not match a separately-observed "Implemented (S31/S32)" lineage — needs a direct `git log -p` check before anyone corrects it either way. |
| **Governance document terminology** | Scrubbed across all governing documents — "Governance Agent" and "Build Agent" only, no model or product names, per Project Principal instruction. |
| **Walkthrough F — original run** *(new this version)* | **COMPLETE.** 12 findings (WF-1–WF-12), addressed by Session 38 (including the WF-10 placeholder-prompt defect, self-reported and fixed same-day). |
| **Walkthrough F — repeat pass** *(new this version)* | **COMPLETE, required, and correctly required.** Confirmed Session 38's fixes held for Priorities 1, 3, and most of 5. Found 12 *new* findings (WF-13–WF-24) invisible to any unit test — selection-state affordance, machine-voiced governance text, timestamp ambiguity, a genuine data/label mismatch in the exhibit drafter. This is the walkthrough process working exactly as Part VII already predicted, not a sign anything was built carelessly. |
| **Exhibit-drafter validation failure** *(RESOLVED — was OPEN in v3.3)* | Root-caused precisely as WF-15: `staticExhibitDraft()`'s figures array was built unconditionally from obligations regardless of document mode, so Evaluation Report mode's own text claimed findings were "the substance of this report" while showing obligation figures instead. Fixed Session 39, confirmed live. |
| **GD-22 — Role-Based Access Matrix** *(new this version, DECIDED and BUILT)* | Pre-approved by the Project Principal after the DEV persona toggle (built to let anyone actually test as a non-admin for the first time) revealed a real, previously invisible gap: the single-role, exact-match access gate meant **no non-admin role — including PROGRAM_MANAGER, the role SCRIBE's own build spec names as its intended user — could reach any module at all.** Widened `minimumRole` to a role list (shell-contract v1.16 → v1.17), applied a Project-Principal-approved matrix across all ten modules, and built the first per-tab gate in the codebase for ARIA's four internally distinct components. Built and live-verified Session 41; documented as a reusable pattern in `AGENT_REFERENCE.md` v3.1. |
| **WF-14 — platform-wide low-contrast text** *(RESOLVED — new this version)* | Precisely diagnosed by the July 19 end-to-end assessment: `#94a3b8` at 8 locations across 3 modules (PlatformHome, APEX, COUNSEL), computed ratios of ~2.2–2.4:1 against a 4.5:1 requirement — invisible to the existing WCAG test because the location wasn't in its inventory. Fixed Session 43, all 8 locations verified against their actual backgrounds, and closed the test gap itself by adding all 8 pairs to the regression inventory. |
| **SCRIBE's two unwritten prompts** *(RESOLVED as a decision — placement still OPEN)* | **DECIDED, July 19: Option A, formally defer**, matching `lens-orientation`'s exact precedent — both modes already produce honest static-fallback output, no live key expected during the demo regardless. The correction was built (`Agent_Identity_Standard.md`, 1600 lines) but **never actually placed** — checked directly while writing this version; the repo still holds only the earlier agent-count fix. Genuinely overdue, not new. See Part VIII. |
| **Cross-module data-access architecture** *(RESOLVED — was OPEN)* | **`ProgramStatusSurface` (GD-23), built and verified Session 44.** Fully resolves the original WF-20 concern — VIGIL's `ppbe_obligation` brief now pulls real program context from APEX via a proper shell-owned surface, mirroring the already-proven `AriaCertificationSurface` pattern rather than a fragile direct import. This is also what made `WorkQueueSurface` (below) possible without re-litigating the underlying architecture question. |
| **`WorkQueueSurface` (GD-24)** *(new this version, DECIDED and BUILT)* | The fourth shell-owned data surface, Session 49 — VIGIL, SCRIBE, ARIA, and NEXUS each publish pending-item counts; the Home Dashboard's "To Do / Review" section (built as an honest placeholder in Session 47) now shows real tiles. Deliberately evaluated whether the existing `TaskSurface` could serve this need before building a new surface — it couldn't (individual task records vs. aggregate summaries are genuinely different shapes) — reasoning recorded in `docs/21`. |
| **`docs/22` — Informed Decision-Making design philosophy** *(new this version)* | Developed while scoping the Reviewer's Workspace, recognized as applying platform-wide rather than to one feature. The curated-context principle (proven by `ProgramStatusSurface`), a three-doors progressive-disclosure model (more data / more understanding / more precedent), and an explicit rule that role and expertise are separate axes, never conflated into per-experience screen variants. See Part XI. |
| **Governance document placement** *(OPEN, mechanical — updated this version)* | `docs/20` and `docs/21` both confirmed placed. **Still outstanding:** `Agent_Identity_Standard.md`'s SCRIBE deferral (above), `AGENT_REFERENCE.md`'s new `docs/22` pointer, and `docs/22` itself. No decision required — just needs doing. See Part VIII. |

---

## PART III — MASTER BUILD SEQUENCE (Corrected and Linear)

This replaces the two-track structure from earlier versions. It is one ordered
list because it is, in reality, one Build Agent working one repository in
session order — there was never a way to actually run two sessions at once.

| Step | What | Type | Opens When |
|---|---|---|---|
| **Session 27** | ~~Time & Travel Phase I / Core Integration~~ — COMPLETE, pushed. 1370 tests passing. | Build Agent build | Done |
| **Session 28** | ~~Time & Travel Phase II / Full Cycle~~ — COMPLETE, pushed. 1455 tests passing. | Build Agent build | Done |
| **Walkthrough E** | ~~Validate Time & Travel end-to-end~~ — COMPLETE | Governance Agent, guided | Done |
| **Session 29** | ~~Time & Travel gap fixes~~ — COMPLETE. 1396 tests passing (corrected). | Build Agent build | Done |
| **Walkthrough E-2** | ~~Verify fixes live~~ — COMPLETE. One critical finding (WE-10). | Governance Agent, guided | Done |
| **Session 30** | ~~Time & Travel fix session~~ — COMPLETE, pushed. 1414 tests passing. Time & Travel walkthrough-clean. | Build Agent build | Done |
| **Session 31** | ~~PPBE Build Session 1 — Core Integration~~ — COMPLETE. 1690 tests passing. | Build Agent build | Done |
| **Session 32** | ~~PPBE Build Session 2 — Full Cycle~~ — COMPLETE. 1826 tests passing. | Build Agent build | Done |
| **Session 33** | ~~PPBE Synthetic Data + Walkthrough Readiness~~ — COMPLETE. 1875 tests passing. **WE-6 SATISFIED.** | Build Agent build | Done |
| **Post-PPBE Wrap-Up** | ~~Loose-end closure + Build Agent strategic assessment~~ — COMPLETE. | Build Agent + Governance Agent | Done |
| **Session 35** | ~~Combined live-call smoke test + cross-module state gap fix + prompt registry count reconciliation~~ — **COMPLETE, three parts.** Part 1: smoke harness built, fail-closed half passing, live half found a credential-handling question later resolved in Sessions 36-37. Part 2: VIGIL→SCRIBE gap fix, complete and demonstrated live. Part 3: prompt count confirmed correct (20/19/1), historical mislabel found and explained. | Build Agent build | Done |
| **Session 36** *(new, unplanned in v3.2)* | ~~Diagnostic investigation of Part 1's live-call failure~~ — COMPLETE. Original field-name diagnosis traced, found incorrect, and formally retracted after confirming the real `SovereignClientConfig` → `AnthropicClientConfig` translation chain with `tsc`. Permanent diagnostic logging (`SOVEREIGN_CLIENT_DEBUG`) added as lasting infrastructure. | Build Agent build | Done |
| **Session 37** *(new, unplanned in v3.2)* | ~~Fix the real defect Session 36's logging surfaced~~ — COMPLETE. A retired model identifier was hardcoded; standardized on `claude-sonnet-4-6` via a single exported constant with a new allowlist regression test. Confirmed via a genuine subsequent live run: 3/4 PPBE agents fully live, the 4th caught cleanly by its own validator. **PPBE live-call smoke test now CLOSED.** | Build Agent build | Done |
| **Session 38** | ~~PPBE agent UI triggers (4 panels) + WF-9/WF-11 responses~~ — COMPLETE. Self-reported and same-day fixed the WF-10 placeholder-prompt defect (`12cb626`). | Build Agent build | Done |
| **Session 38 PromptFix** | ~~Vite `?raw` import fix, eliminating hand-maintained prompt duplicates~~ — COMPLETE. | Build Agent build | Done |
| **Walkthrough F (original run)** | ~~Full-platform validation~~ — COMPLETE. 12 findings (WF-1–WF-12). | Governance Agent, guided | Done |
| **Governance reconciliation pass (July 17-18)** | ~~SBOM lineage closed to v1.40; two divergent AGENT_REFERENCE lineages merged into Unified v3.0; document placement/manifest discipline established~~ — COMPLETE. | Governance Agent | Done |
| **Walkthrough F (repeat pass)** | ~~Confirm Session 38's fixes actually held, live~~ — COMPLETE, and correctly required: found 12 *new* findings (WF-13–WF-24) no unit test could see. | Governance Agent, guided | Done |
| **Session 39** | ~~Walkthrough F repeat-pass remediation~~ — COMPLETE. VIGIL's approval brief rewritten to plain prose (WF-22, partial — field labels remain, the worst part fixed); exhibit-drafter figures/mode mismatch resolved (WF-15, clean); confirmation banner + full card-type coverage (WF-21, WF-11); 4 more findings fixed. | Build Agent build | Done |
| **Session 40** | ~~DR-2 (honest Outlook placeholder) + DR-1 Tier 1 (persona toggle, 2 roles)~~ — COMPLETE. **DR-3 near-term move correctly Hard-Stopped** — no cross-module data path exists; this is now the plan's clearest sequencing risk, see Part VI. | Build Agent build | Done |
| **Role Access Matrix design work** | ~~Full role/responsibility definition for all 10 modules + ARIA's 4 internal components~~ — COMPLETE. Revealed, before any code changed, that the existing single-role gate would leave every non-admin role — including PROGRAM_MANAGER, SCRIBE's own documented user — unable to reach anything. | Governance Agent + Project Principal | Done |
| **Session 41** | ~~GD-22: widen `minimumRole` to a role list; apply the approved matrix; build ARIA's first-ever per-tab gate; expand the DEV toggle to all 8 roles~~ — COMPLETE. Required an explicit second close instruction (recap ≠ push) — the trigger for the Close Protocol now standing in every opening prompt. | Build Agent build | Done |
| **Session 42** | ~~Module labels + hover orientation content (all 10 modules) + WF-25–28~~ — COMPLETE. | Build Agent build | Done |
| **End-to-End Verification + Technical Assessment** | ~~First real application of Part IV's own post-milestone-assessment standard~~ — COMPLETE. Independently re-ran all verification tooling and the never-before-executed WCAG contrast test; found WF-14 (real, precise, previously invisible) and the agent-count self-contradiction; gave an honest sequencing and fragility read. | Build Agent, advisory only | Done |
| **Session 43** | ~~Fix WF-14 at all 8 locations + close the test-inventory gap that hid it + repo cleanup + verify-script refresh~~ — COMPLETE. | Build Agent build | Done |
| **Governance doc corrections (round 1)** | ~~`Agent_Identity_Standard.md` agent-count fix; `AGENT_REFERENCE.md` v3.1 ARIA-pattern documentation~~ — COMPLETE, both placed. | Governance Agent | Done |
| **Session 44 (GD-23)** | ~~`ProgramStatusSurface` — resolves the cross-module data-access architecture question~~ — COMPLETE. Fully resolves WF-20; VIGIL's obligation brief now shows real APEX program context. | Build Agent build | Done |
| **Session 45** | ~~`sovereign-shell` visual regression scaffolding, first snapshot tests, five roles protected~~ — COMPLETE. | Build Agent build | Done |
| **Session 46** | ~~APEX Execution Monitoring: real charts, selection/drill-through, honest six-site placeholder~~ — COMPLETE. | Build Agent build | Done |
| **Session 47** | ~~Home Dashboard Phase 1: Program Health, Flagged Programs, repositioned Module Orientation~~ — COMPLETE. | Build Agent build | Done |
| **Session 48** | ~~Fixed a real test-fixture drift bug found reviewing Session 47 — stale role-list snapshots gave false-passing tests~~ — COMPLETE. Fixture now structurally can't drift again. | Build Agent build | Done |
| **Session 49 (GD-24)** | ~~`WorkQueueSurface` — Home Dashboard Phase 2 complete, real queue tiles replace the honest placeholder~~ — COMPLETE. | Build Agent build | Done |
| **`docs/22` design philosophy** | ~~Informed decision-making authority, developed scoping the Reviewer's Workspace~~ — COMPLETE, see Part XI. | Governance Agent | Done |
| **Governance doc corrections (round 2)** | `Agent_Identity_Standard.md`'s SCRIBE deferral (overdue from before v3.4); `AGENT_REFERENCE.md`'s `docs/22` pointer; `docs/22` itself — all built, none placed | Governance Agent | **Immediate next step — see Part VIII** |
| **Reviewer's Workspace** | Concept and philosophy settled (`docs/22`); actual scope, and specifically the narrow-vs-general infrastructure question (`docs/22` §4), not yet decided | Project Principal + Governance Agent | Not yet scoped |
| **Cross-module navigation primitive** | `docs/22` §5 confirms this doesn't exist (`loader.mount()` has no initial-state parameter) — needed before any "open another module with context preserved" feature | Governance Agent, spec first | Not yet scheduled |
| **Rehearsal** | Full five-item demo script, both workflow layers, dry-run — including the role-based access story (Part I, item 2) | Project Principal + Governance Agent | Governance docs placed (round 2); SCRIBE prompt decision already made |
| **Demo Day** | *** DEMO-READY *** | — | Rehearsal clean |

**Running in parallel with the whole sequence above, blocking nothing in it:**
Gate 3/4 attestation, `PPBE-RECORD`, hygiene items (`PROMPT-REGISTRY-DRIFT`,
remaining repo-root Brief version cleanup), live-testing the three DEV-persona
roles never yet seen on screen (AGENT_OPERATOR, READ_ONLY, PLATFORM_ADMIN —
code-verified only so far; the other five are now live-verified as of Session
49's queue-tile testing), APEX's real site-tracking schema decision (Session
46's placeholder).

**What actually needs deciding before each session, stated once so it's not
scattered across three parts of this document:**

| Before This Session | This Must Be Done First |
|---|---|
| 27–49 | All done |
| Reviewer's Workspace build session | Real scope decision + the narrow-vs-general infrastructure question, both per `docs/22` §4 — not an improvised opening prompt |
| Cross-module navigation primitive build session | A real spec, not yet written |
| Rehearsal | Governance docs (round 2) placed |

---

## PART IV — WALKTHROUGH PROTOCOL

Confirmed from this project's own history (Walkthroughs A through E-2 all followed
this pattern) — not a new process invented for this plan.

**What it is:** a Level 1 walkthrough is a human-in-the-loop validation session
conducted **with the Governance Agent, not the Build Agent.** The Project Principal
operates the live platform in a browser; the Governance Agent provides
step-by-step guidance.

**Purpose:** validate that the most recently built stage works end-to-end as a
system (not just that unit tests pass); surface integration gaps unit tests can't
catch; build Project Principal familiarity with actually operating the platform;
produce a demo rehearsal at each milestone.

**How it runs:**
1. Project Principal opens the dev server: `cd ~/Developer/sovereign-platform/
   sovereign-shell && npm run dev`
2. The Governance Agent provides a scenario script — a synthetic situation walking
   through the feature being validated (for Walkthrough F: a synthetic PPBE
   scenario plus a full-platform pass)
3. Project Principal works through the scenario in the browser
4. Project Principal shares screenshots at each step; the Governance Agent
   confirms correct behavior or identifies a gap
5. **Gaps found become the first deliverables of the next build session** — this
   is exactly the mechanism that produced Walkthrough D's 12 findings and every
   subsequent gap-fix session since

**Validation standard, carried from Walkthrough A and never relaxed since:** no
product passes its walkthrough if Gap 5 (plain-language) or Gap 6 (content-type
distinction) standards are not met. A human reviewer must be able to read all
output as plain prose and orient within five seconds.

**Walkthrough F ran, twice, and did exactly what this Part predicts a walkthrough
should do.** The repeat pass's 12 findings (WF-13–WF-24) were, without exception,
things no unit test could have caught — a missing selection-state highlight, a
governance screen that read like a machine talking to itself, a raw ISO timestamp,
a genuine data/label mismatch. Every one of them was verified live, not just fixed
in code and assumed.

**Open live-verification gap, worth naming plainly:** Session 42's module labels
and hover content, and most of Session 43's changes, were verified by direct code
inspection — real diffs, real values matched to real claims — but **never
actually watched happen on screen.** Code review is strong evidence; it is not
the same claim as a human looking at it, which is this entire Part's founding
principle. The DEV persona toggle itself has the same gap at larger scale: only
SYSTEM_ADMIN and PROGRAM_MANAGER have been exercised live; the other six roles
are code-verified only. Neither gap blocks Rehearsal on its own, but both should
close before Demo Day, not be discovered live in front of a CTO.

---

## PART V — SESSION-OPENING PROCEDURE

The mechanical steps, confirmed from this project's own history, not reinvented.

**Note on where to actually look when opening a session:** the steps below
describe the general procedure. Each session's own opening-prompt file is
self-contained — it includes these same terminal commands at the top, specific to
that session, so you never need this Strategic Plan open at the same time as the
thing you're actually pasting into the Build Agent. This section exists as the
reusable reference the per-session files are generated from, not as a second
place you need to check mid-session.

**Step 1 — Run the gather script (Terminal 2):**
```bash
chmod +x ~/Developer/sovereign-platform/gather_session<N>_context.sh
~/Developer/sovereign-platform/gather_session<N>_context.sh
```
This reads the required context files and copies them to the clipboard. It reports
found/missing counts — if anything is reported missing, stop and resolve it before
proceeding rather than opening the session on an incomplete context package.

**Step 2 — Open the Build Agent (Terminal 1), autonomous mode:**
```bash
cd ~/Developer/sovereign-platform
caffeinate -i claude --dangerously-skip-permissions
```
`caffeinate -i` keeps the Mac awake for the session. `--dangerously-skip-permissions`
is required for autonomous operation — the Build Agent writes files and runs
commands without per-action approval.

**Step 3 — Confirm auto mode:** press `Shift+Tab`, confirm "auto mode on" in the
status bar.

**Step 4 — Paste context:** paste the clipboard from Step 1.

**Step 5 — Paste the opening prompt** for that session.

**Step 6 — The Build Agent confirms every file by name, restates the done
condition, and — because this is an autonomous session — begins building
immediately** rather than waiting for turn-by-turn approval. It still follows
one-component-per-exchange internally; "autonomous" means it doesn't wait for
your approval between components, not that the build discipline is relaxed.

**Step 7 — Walk away. Return when the Build Agent has produced the session
handoff and SBOM update, committed and pushed — AND copied both to the Desktop.**
**New this cycle, non-negotiable:** a chat recap describing finished work is not
the same claim as a completed `git push` — two sessions this cycle (39, 41)
initially stopped at a recap and needed an explicit second instruction before the
actual close happened. Every opening prompt from Session 42 onward now states
this outright as its own first section, before the Done Condition. Verify the
push actually happened — don't take "session complete" in a recap at face value.

**Step 8 — Bring the handoff and SBOM back to the Governance Agent** (this
conversation, or a fresh one with `AGENT_REFERENCE.md`, this plan, and the
current Agent-to-Agent Briefing loaded). The Governance Agent produces a
refreshed System Prompt every session as standard practice, along with the
merged SBOM, updated Strategic Plan, and updated Agent-to-Agent Briefing where
warranted — **and, as of this cycle, verifies every transferred document's
checksum before it gets placed anywhere,** using `place_governance_doc.sh` and
`DOCUMENT_MANIFEST.tsv` at the repo root rather than an unverified manual copy.

---

## PART VI — DECISION GATES (Remaining Open Items Only)

| Decision | Blocks | Leverage |
|---|---|---|
| `TT-POLICY-ENTITY` | Nothing in the build sequence | Low urgency — module-level workaround already functioning |
| `PPBE-RECORD` | Nothing in the build sequence | Housekeeping |
| Gate 3/4 attestation | Nothing in the build sequence | Strengthens the demo narrative |
| `docs/16` Supervision Efficiency | Nothing in the build sequence | Project Principal call on add vs. waive |
| `Agent_Identity_Standard.md` PPBE Status-field lineage discrepancy | Nothing in the build sequence | Needs a direct `git log -p` check, not a guessed correction |
| Local/open-model activation | Nothing in the build sequence — deliberately dormant | See Part X. Activates only when a real client's compliance posture requires it. |
| ~~SCRIBE's two unwritten prompts~~ | *(RESOLVED — DECIDED Option A, formally defer, matching `lens-orientation`. Placement of the correction is now a Part VIII housekeeping item, not an open decision.)* | — |
| ~~Cross-module data-access architecture~~ | *(RESOLVED — `ProgramStatusSurface`, GD-23, built Session 44. Also made `WorkQueueSurface`, GD-24, possible without re-litigating the same question.)* | — |
| **Reviewer's Workspace: narrow vs. general infrastructure** *(new — highest leverage item in this table)* | **Every future curated-context relationship after this one.** Does each new decision-facing feature get its own explicit, typed shell surface (safe, proven four times, doesn't scale past a handful) — or does this graduate into one general "Decision Context Surface" registration mechanism, built once? Recorded, deliberately undecided, in `docs/22` §4. | The plan's actual critical path now. Decide before scoping the Workspace, not after starting to build it. |
| **Cross-module navigation primitive** *(new)* | Any future "open another module with context already loaded" feature — the "go deeper" door `docs/22` §5 names as Door 1. Confirmed not to exist (`loader.mount()` takes no initial-state parameter). | Needed before the Reviewer's Workspace can do more than link out cold to other modules. |
| **`HUMAN_DECISION` "context depth" field** *(new)* | Nothing in the current build sequence — a real, concrete proposal from `docs/22` §6, not yet a governance decision | Would let every future decision honestly record whether it was made from curated context alone or after going deeper — real audit value, low cost, worth a deliberate yes/no rather than silent adoption or silent dismissal |

---

## PART VII — RISK & CONTINGENCY

| Risk | Mitigation |
|---|---|
| Walkthrough F surfaces platform-wide issues, not just PPBE-specific ones | Walkthrough F is explicitly scoped as full-platform validation, not PPBE-only — this is expected, not a surprise |
| A "passing" result masks a path that wasn't actually exercised | Confirmed as a real risk again this cycle — two more concrete instances. The WCAG contrast test suite was genuinely green (60/60) while WF-14's actual failure sat entirely outside its inventory. The PPBE live-smoke test's 4 passes are honest but exercise the fallback path only; the live model path has never actually run in a test. Mitigation unchanged in principle, reinforced in practice: a green suite answers "does the tested thing work," never "is everything that matters tested." |
| A stale document gets committed or placed without anyone noticing | Confirmed as a real risk this cycle (a near-miss briefly reintroduced resolved content loss into the live repo). Mitigation: checksum verification before placement is now tooled (`place_governance_doc.sh`), not just a written rule. |
| Session count grows beyond planned if a walkthrough finds more than expected | Sequence is dependency-based, not calendar-based — it absorbs this without needing a new plan version, just a Part IX log entry |
| **A build session presents a chat recap as if it were a completed close** *(new this version, confirmed real twice)* | Sessions 39 and 41 both initially stopped at a summary rather than an actual `git push`, discovered only because every session's claims get independently re-verified as standing practice. Mitigation: the Close Protocol is now a mandatory first section of every opening prompt, not an assumption. |
| **A single-role access gate can silently leave real users with zero access, invisibly, for months** *(new this version)* | Confirmed real, not hypothetical: SCRIBE was built and walkthrough-tested entirely under SYSTEM_ADMIN, and nothing until the DEV persona toggle existed would have revealed that PROGRAM_MANAGER — the role SCRIBE's own spec names as its user — could not open it at all. Mitigation: the persona toggle now exists and covers all 8 roles in code; only 2 of 8 have actually been exercised live so far (Part IV) — this risk is reduced, not yet closed. |

---

## PART VIII — COMPLETE TASK LIST

**Project Principal:**
- [x] ~~Run Sessions 27-37~~ — ALL COMPLETE
- [x] ~~Decide `TT-GD` / `TT-PRODUCT-GD`~~ — DECIDED
- [x] ~~Approve the four PPBE prompts~~ — DONE
- [x] ~~Place the checksum-verified governance documents across repo and iCloud (prior cycle)~~ — DONE
- [x] ~~Run the iCloud archive cleanup~~ — DONE
- [x] ~~Work through Walkthrough F, both the original run and the required repeat pass~~ — DONE
- [x] ~~Run Sessions 39-43~~ — DONE
- [x] ~~Approve GD-22 (role-based access matrix, shell-contract v1.16 → v1.17)~~ — APPROVED, Session 41
- [x] ~~Decide the ARIA per-component role assignments~~ — DECIDED, all four components
- [x] ~~Decide the SCRIBE prompt question~~ — DECIDED, Option A, formally defer
- [x] ~~Approve GD-23 (`ProgramStatusSurface`)~~ — APPROVED, Session 44
- [x] ~~Approve GD-24 (`WorkQueueSurface`)~~ — APPROVED, Session 49
- [x] ~~Work through the decision-making concept/strategy/infrastructure discussion~~ — DONE, recorded in `docs/22`
- [ ] **Place `Agent_Identity_Standard.md`'s SCRIBE deferral, `AGENT_REFERENCE.md`'s `docs/22` pointer, and `docs/22` itself** — mechanical, immediate next step, no decision required (round 2 — round 1 already placed)
- [ ] **Decide the Reviewer's Workspace's real scope**, and specifically the narrow-vs-general infrastructure question (`docs/22` §4)
- [ ] Live-test the three remaining DEV-persona roles never yet seen on screen (AGENT_OPERATOR, READ_ONLY, PLATFORM_ADMIN)
- [ ] Decide APEX's real site-tracking schema (Session 46's honest placeholder)
- [ ] Rehearse the full five-item demo script, including the role-access story beat
- [ ] Decide `PPBE-RECORD`, attest Gate 3/4, whenever convenient — not on the path
- [ ] Decide `docs/16` Supervision Efficiency — add retroactively or formally waive
- [ ] Decide whether to include Part X (Local LLM) in the live demo narrative or hold it strictly as Q&A backup — this plan defaults to Q&A-only unless told otherwise
- [ ] Non-blocking, optional — remaining repo-root cleanup residue, if the repo itself will be shown

**Governance Agent:**
- [x] ~~Reconcile Sessions 35 through 49's closes~~ — DONE, each independently re-verified against the actual repo, not taken from any recap
- [x] ~~Correct `Agent_Identity_Standard.md`'s agent-count self-contradiction~~ — DONE, placed
- [x] ~~Document the ARIA per-tab pattern in `AGENT_REFERENCE.md`~~ — DONE, v3.1, placed
- [x] ~~Write the `ProgramStatusSurface` spec (`docs/20`)~~ — DONE, placed
- [x] ~~Write the `WorkQueueSurface` spec (`docs/21`)~~ — DONE, placed
- [x] ~~Write `docs/22`, the informed-decision-making design philosophy~~ — DONE this version, placement pending
- [x] ~~Produce the July 20 System Prompt refresh (v34)~~ — DONE
- [ ] **Place round-2 governance documents** (Project Principal action, above — Governance Agent already built all three)
- [ ] Keep Part IX current as tweaks occur
- [ ] Resolve `module-lens` orientation prompt and VIGIL triage prompt path drift — both still open, both harmless
- [ ] Run the `git log -p` check on `Agent_Identity_Standard.md`'s PPBE Status-field discrepancy before correcting it
- [ ] Write a real spec for the cross-module navigation primitive (`docs/22` §5, Door 1) once the Workspace's scope is decided
- [ ] Draft the SCRIBE visual redesign content decisions — proposed defaults already given (synthetic policy excerpts; two draft variants), not yet confirmed

**Build Agent:**
- [x] ~~Sessions 27 through 49~~ — all complete
- [x] ~~Session 44 — GD-23, `ProgramStatusSurface`~~ — done
- [x] ~~Session 45 — visual regression scaffolding~~ — done
- [x] ~~Session 46 — APEX charts, selection, site placeholder~~ — done
- [x] ~~Session 47 — Home Dashboard Phase 1~~ — done
- [x] ~~Session 48 — test-fixture drift fix~~ — done
- [x] ~~Session 49 — GD-24, `WorkQueueSurface`, Home Dashboard Phase 2~~ — done
- [ ] Resolve `PROMPT-REGISTRY-DRIFT` when convenient — confirmed harmless, still cosmetically open
- [ ] `F-2`, `F-3` — low priority, not demo-path
- [ ] Naming tension (`TRAVEL_APPROVAL` vs. `TRAVEL_APPROVED`/etc.) — candidate consolidation GD, non-urgent
- [ ] Continue building `sovereign-shell` test coverage opportunistically — meaningfully better after Sessions 45/48, not yet comprehensive
- [ ] Manually verify the PPBE live-prompt path against a real model before any live PPBE demo — only the static fallback has ever been tested
- [ ] Reviewer's Workspace build — **blocked on the Governance Agent's spec and the Project Principal's scope decision, above; do not open this as an improvised session**
- [ ] Cross-module navigation primitive build — **blocked on its own spec, not yet written**

---

## PART IX — CHANGE CONTROL (Full History)

| Date | Change | Reason |
|---|---|---|
| July 11, 2026 | Initial version (v1.0) through v3.1 | See prior versions of this document for the full early history |
| July 12–13, 2026 | v3.2 — Both PPBE build sessions complete plus synthetic data (Session 33); post-build wrap-up pass; all four PPBE prompts approved; prompt count reached its final three-number form (20/19/1) after three prior corrections | Build Agent session closes, relayed and reconciled by Project Principal |
| July 15, 2026 | v3.3 — Sessions 35-37 closed; PPBE live-call smoke test CLOSED; prompt registry count confirmed correct; Part X (Local/Open Model Capability) added. Walkthrough F fully unblocked, script not yet drafted. | Multiple Build Agent session closes plus a governance/tooling cycle |
| July 19, 2026 | v3.4 — the largest single update in this document's history at the time. Walkthrough F ran twice, live, closing with 24 total findings, all fixed and re-verified. GD-22 (role-based access matrix) designed, approved, and built. First genuine post-milestone technical assessment ran, finding WF-14 and an agent-count self-contradiction. Cross-module data-access architecture named the plan's clearest sequencing risk. | Sessions 39-43, a governance reconciliation pass, and the first Part-IV-standard technical assessment |
| **July 20, 2026** | **v3.5.** Six more sessions closed (44-49). GD-23 (`ProgramStatusSurface`) resolved the cross-module architecture question v3.4 named as the top risk. GD-24 (`WorkQueueSurface`) completed the Home Dashboard's second phase. APEX's Execution Monitoring converted to real charts. A real test-fixture drift bug was found and fixed (Session 48) — the exact Rule-9 failure mode this platform's own lessons warn about, caught in its own new test infrastructure. **The most significant addition isn't a session at all: `docs/22`**, a durable design-philosophy authority for informed decision-making, developed while scoping the Reviewer's Workspace and recognized as applying platform-wide. New Part XI added. One real gap caught while writing this version: the SCRIBE prompt deferral, decided the same night as v3.4's own refresh, was never actually placed — a live example of exactly the "confirmed vs. built" discipline this document itself has enforced all along, this time applied to the document's own prior work. | Sessions 44-49, a substantial concept-development conversation on AI-enabled decision-making, and direct re-verification of every placement claim before restating it |

---

## PART X — LOCAL / OPEN MODEL CAPABILITY (Reference — Not Demo-Path)

**Purpose of this section:** CTO Q&A preparation, not a scheduled demo
component. This capability is real, built, and deliberately dormant through
Demo Day — it does not appear in Part I's presentation order unless the
Project Principal decides otherwise (see Part VIII). Everything below is
drawn from `SOVEREIGN-LLM-001` (the Local LLM Integration Decision
Framework, built June 2026) via a verified internal talking-points summary.
Where a detail could not be confirmed against that source, it is marked
explicitly rather than stated as fact — treat any such note as a flag to
verify before it goes in front of a CTO, not as settled.

### The bottom line

A local LLM isn't a hypothetical add-on — it answers a specific, named
blocker: Anthropic's commercial API isn't FedRAMP-authorized for CUI, so it
can't be the only inference path for federal deployments. The real question
is *when* to activate local inference and under what configuration, not
*whether* to support it at all.

### Where it actually stands

- **Built, not running.** Session 13 (June 2026) wired Ollama in as a
  second registered inference provider, with routing logic, a model
  registry entry, and dedicated audit-log events for inference calls,
  fallbacks, and model integrity checks.
- **Anthropic remains the sole live provider through the demo** — a
  deliberate governance decision, not a gap. The architecture is
  demonstrable without Ollama needing to be running.
- **Activation is a configuration change, not a rebuild** — it flips on
  when a specific client's compliance posture requires it.

### The five-perspective case, if the CTO wants depth

- **Architectural** — Local inference slots in as a second provider behind
  the same abstraction layer every product already calls. Zero
  product-level rewrites.
- **Compliance** — Satisfies the CUI/FedRAMP boundary commercial APIs
  can't. Three deployment options on the table: FedRAMP GovCloud hosting,
  on-premises hardware, or hybrid (dev local / production cloud).
- **Operational** — The honest cost center. Model selection, hardware,
  lifecycle management, and drift monitoring are ongoing work, not a
  one-time setup.
- **Security** — Trades network/third-party exposure for new
  responsibilities: model weight integrity (SHA-256 verification),
  inference-layer prompt injection, and owning monitoring Anthropic
  currently handles. All designable with controls already in the
  platform's security framework — nothing net-new architecturally.
- **Strategic** — This is what makes the "sovereign AI" name credible.
  Without local inference capability, that positioning is conditional.

### Trade-offs to be upfront about

- A local model is meaningfully less capable than Claude on complex
  reasoning — acceptable for routine tasks, requires more careful handling
  for anything high-stakes.
- Every model update triggers re-certification (accuracy/drift gates)
  before it can go live again — not automatic. **Unconfirmed against the
  source document: whether this re-certification specifically routes
  through the platform's existing CPMI-VRS gate mechanism, or a separate
  gate. Verify before stating this specifically to a CTO.**
- Fine-tuning is explicitly **out of scope for now** — inference-only on
  frozen weights, deferred to a future phase once enough production data
  has accumulated to make it worthwhile.

### If the CTO asks "when does this go live?"

Not before a real client's data-handling requirements demand it. The
infrastructure is ready and tested; flipping it on for a specific
classification of data is a deliberate governance decision, made the same
way every other consequential platform change is — not something that
happens by default.

---

## PART XI — INFORMED DECISION-MAKING PHILOSOPHY (New, July 20, 2026)

**This part is a pointer, not a restatement.** The substance lives in
`docs/22_Informed_Decision_Making.md` — read it directly before building or
redesigning any decision-facing feature. Restating it here would create
exactly the kind of divergent duplicate this project's own Constraint #2
already warns against; this section exists only to make the strategic
plan aware the philosophy exists and cite where it governs from.

**Why it's in this plan at all, not just a technical reference:** it
directly reframes what "demo-ready" should mean for every future
decision-facing screen — not just "the button works," but "the reviewer had
what they needed, without hunting for it, regardless of whether they're new
to the role or the most senior person in it." That's a real claim worth being
able to make to a CTO, and it now has a real, citable design authority behind
it rather than being an unstated assumption.

**The one-sentence version:** curated, materiality-tested context travels to
the decision; full reference material stays where it's authoritative; role
governs what a person may decide, never how much help they get deciding it —
proven once already, by `ProgramStatusSurface` (GD-23), before this document
existed to name the principle.

**What this means for the demo path specifically:** the role-based access
matrix story (Part I, item 2) and this philosophy are complementary, not
competing — GD-22 established *who* can reach which decisions; `docs/22`
governs *how well-supported* they are once there. Both are worth naming if a
CTO asks what "governed AI-human collaboration" actually means in practice,
beyond the phrase itself.

**Two real, still-open questions this part inherits from `docs/22`, tracked
in Part VI, not resolved here:** the narrow-vs-general infrastructure
question for future curated-context surfaces, and whether the Reviewer's
Workspace concept this philosophy grew out of gets scoped and built before
or after Demo Day. Neither blocks Rehearsal.

---

*SOVEREIGN Platform — Strategic Plan to CTO Demo · v3.5 · July 20, 2026*
*Pre-Decisional · Internal Working Document*
*File to: git `docs/`*
*Companion documents: `SOVEREIGN_EndToEnd_Assessment_20260719.md`;
`docs/22_Informed_Decision_Making.md`*
