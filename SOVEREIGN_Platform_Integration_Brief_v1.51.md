# SOVEREIGN Platform Integration Brief
## Version 1.51 | July 28, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.50
**Changed this version:** A live walkthrough pass through Walkthrough H Parts 7 and 8,
run by the Project Principal on July 28, 2026, substantially completed both Parts and
surfaced thirteen real findings (WH-34 through WH-46) — two of them (WH-34, WH-43) not
content polish, but a data-integrity defect on Home Dashboard's first screen and a
recurrence of the "same fact shown twice, disagreeing" pattern family this arc spent five
sessions closing. **Session 71 (same day) fixed the five critical/high findings (WH-43,
WH-34, WH-35, WH-41, WH-42) same-day, code-verified and tested.** A sixth item (WH-47)
surfaced during that fix and needs a real governance decision. Three low-severity items
(WH-40, WH-45, WH-39) were deferred as optional. **This version does not restate the
9.6/10 readiness score** — see §21. **This version also does not adopt Session 71's
re-derived test count as the current platform total** — see §11.

---

## §1-§10 — unchanged, see v1.45

---

## §11 — Current Build Status

**HEAD as of this Brief:** `4a6c282` (Session 71's close), verified against `origin/main`
via the real `git push` output, not a Handoff summary. Session 71's commit chain:
- **71** (`0ab1610`→`38071f2`→`0748cca`): WH-43 (Workspace NEXUS Travel badge miscount —
  root cause was `nexus-workspace-publisher.ts` counting only ROUTED as pending, when
  NEXUS's own Travel & Time Queue also treats ESCALATED as pending senior-authority
  decision; a genuine Rule 11 violation, in the one Workspace panel that postdated the
  original WH-7/WH-17/WH-18/WH-22 fix set); WH-34/WH-35/WH-41 (obligation-rate cluster —
  root cause was WG-6's expansion from 5 to 18 `ProgramRecord`s per program without
  deduplication, so obligation-rate callers summed obligations across all four years
  while dividing by a single year's plan, producing DELTA's 338%; fixed via
  `uniqueByProgramId()` and `obligationsForYear()`); WH-42 (READ_ONLY's completely locked
  Home Dashboard — `ModuleStatusPanel` was rendering all eleven modules including ten
  locked rows for a role with access to only one; fixed by filtering to accessible
  modules before render, with an honest empty-state guard for the zero-accessible case).

**Prior period, Sessions 62–70: see v1.50, unchanged and not repeated here.**

**Walkthrough H Parts 7 and 8 — substantially run, not open.** v1.50 recorded both Parts
as "genuinely still unconfirmed, lower stakes than Parts 4/6 ever were." That framing no
longer holds. The live pass surfaced findings at least as consequential as anything Parts
4/6 tested — a numerically checkable Home Dashboard defect (WH-34) and a direct
recurrence of the platform's most-tracked defect pattern (WH-43), both in screens the
Session 66–68 comprehensive audit had rated clean two days earlier. Full findings and
evidence are in `SOVEREIGN_Findings_Report_20260728.md`; resolution status is in the
Findings & Resolution Log Addendum, 2026-07-28.

**A genuine repository hygiene gap was also found and corrected this period, independent
of any WH finding:** Integration Brief v1.50 and Strategic Plan v3.9 had each been
produced and reviewed but never actually placed in the repo — root held v1.47–v1.49 and
v3.3/v3.7 respectively, a live Rule 1 violation that predated this Brief's own writing.
Corrected via commit `c4784d9`, verified via `git log` showing HEAD/origin/main/origin
HEAD all converged, not merely a commit message. Nine stale prior-session gather scripts
(`gather_session62` through `gather_session70`) were also found accumulated in root,
against `AGENT_REFERENCE.md`'s own "current session only" convention, and removed as part
of Session 71's gather-script commit.

**Shell contract: v1.23, unchanged.** Hash
`6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`, both copies
(`shell-contract.ts` at repo root and `sovereign-shell/shell-contract.ts`) re-verified
identical at Session 71's close.

**Test count: NOT independently confirmed this version — a real discrepancy is flagged,
not resolved.** Session 71's Handoff reports 1,775 tests, re-derived across fourteen
JS/TS packages. This number does not reconcile against the last fully independent total
(2,118, Session 69: 1,923 JS/TS across fifteen workspaces + 195 Python + 4 deliberately-
skipped opt-in live tests) on two counts: it omits Python entirely, and it is 148 *lower*
than the previously-confirmed JS/TS-only figure (1,923), with no explanation offered for
the decrease. This may be an entirely benign explanation — a workspace consolidated, a
test file relocated — but the Handoff does not state one, and adopting 1,775 as "the
platform total" without that reconciliation is exactly the failure shape
`AGENT_REFERENCE.md`'s Rule 10 and Lesson 26 exist to prevent. **Before this figure is
treated as current: (1) confirm whether Python tests were run and simply omitted from the
table or genuinely not run this session, and (2) account for the 148-test JS/TS
difference against Session 69's real total, workspace by workspace if needed.**

**The session-store pattern remains at seven instances; F2 remains deferred.** Nothing
changed this period. Same for the 44-agent count and the 20-prompt registry (19 approved
+ 1 pending) — Session 71 registered no new agents or prompts.

**`AGENT_REFERENCE.md` remains v3.4.** No new rules this period — though Session 71's
test-count gap is itself a live instance of Rule 10/Lesson 26, and its own gather-script
context-window overflow on first attempt (caught and corrected via `/clear` and a trimmed
context package before real work began) is worth naming as a new lesson; see below.

---

## §12 — unchanged, see v1.50

---

## §13 — Open Governance Items

**CLOSED this version:**
- **WH-43** — Workspace NEXUS Travel badge miscount. Root cause: pending set excluded
  ESCALATED. Fixed `nexus-workspace-publisher.ts`, `WorkspaceApp.tsx`,
  `startup-publish.ts`. Rule 12 check performed: FLOWPATH's panels examined, same root
  cause not present there.
- **WH-34 / WH-35 / WH-41** — obligation-rate miscalculation for multi-year programs.
  Root cause: WG-6's per-program record expansion without deduplication. Fixed via
  `uniqueByProgramId()` / `obligationsForYear()` in `ppbe-dashboard.ts`. WH-35 (does the
  On Track badge track the real percentage) is answered and closed for the general case —
  ALPHA's corrected 97% badges correctly. WH-41 (Issues/Flagged Programs false-clear) is
  confirmed resolved — DELTA's false 338% flag is gone.
- **WH-42** — READ_ONLY's locked Home Dashboard. Fixed via accessible-module filtering in
  `PlatformHome.tsx`, honest empty-state guard added.
- **Repo hygiene gap** — Integration Brief v1.50 and Strategic Plan v3.9 placed in repo
  (were review-complete but never committed); nine stale gather scripts removed.

**NEW this version:**

| Item | Detail | Target |
|---|---|---|
| **WH-47** | ECHO's `EvaluationFinding` narrative reads "on-track" while its real, now-correctly-computed FY2026 obligation rate is 104% — the narrative text was authored independently of the number and the two have never been reconciled | Real governance decision needed: update the narrative, or add an explicit suppression/exception note. Not a code fix — do not let Build Agent pick a resolution unilaterally |
| WH-40, WH-45, WH-39 | Deferred as D4 in Session 71 (PPBE Workflow Agents panel unresponsive; raw validator text on Travel Request; Site breakdown column order) | Optional, low severity, none block current demo path — real next-session scope |
| WH-44 | LENS Pipeline Navigator shows zero active agents for every product, confirmed by design (`orientation-data.ts`: deliberately never fabricates agent activity) — but creates a visible self-contradiction with APEX's own PPBE Workflow Agents panel in the same session | Real decision needed: wire real registration data in, or change the copy so "not shown" doesn't read as "doesn't exist" |
| WH-36 | Home Dashboard's To Do/Review section (WH-31, Session 70) mixes two visual treatments — flat row for zero-item modules, header+card for pending ones | Design pass, not urgent |
| WH-37 | Execution Monitoring's BY/BY+1 tabs may apply execution-shaped metrics (an "Actual" column, an on-track badge) to years that structurally can't have them — **genuinely unconfirmed**, those two tabs were never opened during the July 28 pass | Needs the tabs actually viewed before this becomes a real, numbered finding rather than a flagged question |
| WH-38 | Budget-to-actual variance history recommended as a line chart (planned vs. actual over time) rather than a table | Scoped design recommendation, same bucket as WH-15 |
| WH-46 | NEXUS Time Record redesign — weekly grid, charge-code dropdown, PTO/Holiday/Admin codes, conditional overhead-only justification | Raised, not decided — needs scoping like WH-15/16/23 |

**UNCHANGED from v1.50, still open:** WH-26 (sidebar tooltip content, five issues incl.
one factual error), WH-15/WH-16/WH-23 (decided in principle, not scoped), D4-5, D4-9,
D3-6 (module health dots, still wired to nothing), D4-6 and F2 (deliberately deferred).

---

## §14 — SBOM Status

**Gap now covers Sessions 54 through 71 — grown, not shrunk, again.** SBOM Registry
v1.43 covers through Session 62 per the last confirmed merge; ten real session updates
(63 through 71, including this session's) exist and remain unmerged. Same standing
discipline: this Brief flags the gap rather than asserting a merged number. **Do not
treat v1.43 as current for anything in the Session 63–71 arc.**

---

## §15-§17 — unchanged, see v1.50

---

## §18 — Agent and Prompt Registry

**44 agents, 20 prompts (19 approved + 1 pending) — unchanged.** Session 71 registered
nothing new.

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.49 | July 24 | Sessions 54–61 absorbed; see v1.50 for detail |
| v1.50 | July 27 | Sessions 62–70 absorbed; Walkthrough H Parts 4/6 run live and held |
| **v1.51** | **July 28** | **Live walkthrough pass through Walkthrough H Parts 7/8 surfaces WH-34 through WH-46 (thirteen findings, two critical); Session 71 same-day fixes WH-43/34/35/41/42; WH-47 (ECHO narrative) raised as a new governance decision; repo hygiene gap (v1.50/v3.9 never committed) found and corrected; test-count discrepancy flagged, not resolved; readiness score not restated pending live re-confirmation of today's fixes** |

---

## §20 — Full Build Roadmap

| Item | Depends on |
|---|---|
| **Live re-confirm WH-43, WH-34/41, WH-42** | Nothing — a five-minute browser check (NEXUS Travel counts, DELTA/ALPHA obligation %, READ_ONLY Home) before treating today's code-verified fixes at the same evidentiary standard as Parts 4/6 |
| Decide WH-47 (ECHO narrative) | Nothing — real, small, ready for a decision |
| Reconcile the test-count discrepancy | Nothing — needs Build Agent to state Python status and account for the 148-test JS/TS gap |
| Decide WH-26 | Nothing — unchanged from v1.50 |
| WH-40, WH-45, WH-39 (D4) | Nothing — real, scoped, deferred one session |
| WH-15, WH-16, WH-23, WH-46 build sessions | Each needs its own scoping/design pass |
| WH-44 (LENS zero-agents framing) | A real product decision on wiring vs. language |
| WH-37 | Someone actually opening the BY/BY+1 tabs |
| SBOM Registry merge (v1.43 → v1.44+) | Mechanical, real, growing, still not done |
| D4-6, F2 | Deliberately deferred until continued investment past the demonstrations is confirmed |

---

## §21 — CTO Demo Readiness Track

**9.6/10 is not restated this version.** That score, and the framing that accompanied it
— "what remains is bounded content work, not an open architecture question" — was
accurate against what was known on July 26. It is not accurate against what's known now:
a numerically checkable defect on the platform's first screen (WH-34) and a direct
recurrence of the exact defect family this arc named as its defining problem (WH-43) both
existed, undetected, at the moment that score was written. They are now fixed and
code-verified, which is itself a real, positive fact — but neither has been re-confirmed
in a live browser the way Parts 4 and 6 were, and this Brief holds itself to the same
standard it has applied to everything else this arc: a code fix and a live-held claim are
different kinds of evidence. **Recommended before any new score is stated: the same
live-rerun discipline Parts 4/6 got — open NEXUS's Travel queue and the Workspace panel
side by side, open Home Dashboard and check ALPHA/DELTA's percentages, sign in as
READ_ONLY once.** If those hold, a new score with real basis can be written next version.
If they don't, that's exactly the kind of finding this Brief exists to surface honestly
rather than assume away.

---

## Key Lessons — Current

Lessons 1-29: see prior Brief versions.

**Lesson 30 — a comprehensive audit's "zero MAJOR/BROKEN" result describes what was
checked, not a permanent property of the code.** The Session 66–68 audit rated Home
Dashboard and the Reviewer's Workspace clean. Two days later, ordinary use — a live
walkthrough, not a targeted search for bugs — found a numerically checkable defect on
Home Dashboard's first screen and a live recurrence of the platform's most-tracked defect
pattern in the Workspace, both introduced by work (WG-6, WH-19) the audit had itself
already reviewed. The lesson isn't that the audit was wrong; it's that "audited clean" has
a timestamp, and the right response to a new finding in already-audited territory is what
happened here — trace it to its real root cause, don't assume the newer code is correct
by default because it's newer.

**Lesson 31 — a re-derived test count needs to state its own scope, or it isn't a
re-derivation.** Session 71 was explicitly asked to close Session 70's outstanding
test-count gap. What came back was a real, honest table — but scoped to JS/TS only, with
no Python line and no explanation for a 148-test drop against the last confirmed JS/TS
figure. A number presented as "the platform total" that silently narrows its own scope
without saying so is a harder failure to catch than an obviously wrong number, because it
looks like exactly the verification it was supposed to be. Worth a standing habit: any
re-derived total gets checked against the last confirmed total's own stated scope before
it's adopted, not just checked for internal arithmetic.

---

*SOVEREIGN Platform Integration Brief v1.51 · July 28, 2026*
*Pre-Decisional · Internal Working Document*
