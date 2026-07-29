# SOVEREIGN Platform — Findings Report
## Live Walkthrough Pass, Walkthrough H Parts 7–8 · July 28, 2026
## Prepared by Governance Agent

---

## Headline

**Thirteen real findings surfaced during a live pass through Walkthrough H Parts 7 and
8, run in a real browser by the Project Principal on July 28, 2026.** Two of them are
not content polish — they are a data-integrity defect visible on Home Dashboard (WH-34)
and a probable recurrence of the "same fact shown twice, disagreeing" pattern family
(WH-43) that this entire Session 62–70 arc was organized around closing. **This report
recommends the platform's stated 9.6/10 CTO-demonstration readiness score, and the
framing that "what remains is bounded content work, not an open architecture question,"
both be treated as stale until WH-34, WH-42, and WH-43 are resolved or re-characterized.**
None of the prior documents in this arc had visibility into these findings — they were
found today, after the Integration Brief v1.50 and Comprehensive Audit Synthesis were
written.

**Walkthrough H Parts 7 and 8 are now substantially run**, not open as previously
recorded. See status table below. New findings from this report continue this arc's
existing WH numbering, starting at WH-34.

---

## Priority quick reference

| ID | Finding | Priority | Status |
|---|---|---|---|
| WH-34 | Home Dashboard obligation % miscalculated for multi-year programs | **Critical** | Strongly evidenced, not yet code-confirmed |
| WH-42 | READ_ONLY: Home Dashboard completely locked, not an honest empty state | **Critical** | Directly observed, fails Walkthrough H Part 8 Step 4 |
| WH-43 | Reviewer's Workspace NEXUS Travel count disagrees with NEXUS's own queue | **Critical** | User-observed; exact accounting needs Build Agent trace |
| WH-35 | "On Track" status label appears unrelated to obligation % | High (tied to WH-34) | Partially pre-flagged; now confirmed across all 5 programs |
| WH-41 | "Issues" (Flagged Programs) shows all-clear despite 338% obligation | High (tied to WH-34/35) | Directly observed |
| WH-40 | PPBE Workflow Agents panel becomes unresponsive; nav-away/back fixes it | Medium-High | Directly observed; exact failing control not isolated |
| WH-44 | LENS Pipeline Navigator always shows zero agents, by design | Medium-High | Confirmed by design; demo-narrative risk |
| WH-36 | To Do/Review section: inconsistent row format hurts scannability | Medium | Directly observed |
| WH-37 | Execution Monitoring's BY/BY+1 tabs may misapply execution-shaped metrics | Medium | **Unconfirmed — BY/BY+1 tabs not yet viewed** |
| WH-45 | Travel Request form shows raw schema-validator text on empty submit | Low-Medium | Directly observed |
| WH-38 | Variance history should be a line chart (planned vs. actual over time) | Low-Medium | Design recommendation, scoped |
| WH-39 | Site breakdown column order (Planned should precede Obligated) | Low | Directly observed; quick fix |
| WH-46 | Time Record redesign: weekly grid, charge-code dropdown, conditional justification | Low (backlog) | Raised, not decided — needs scoping like WH-15/16/23 |

---

## Walkthrough H Parts 7 & 8 — status update

**Superseding the "not run" status in Walkthrough H's own document and the Integration
Brief v1.50 §11/§13.**

**Part 7 — APEX native PPBE Detail View: substantially run.**
- Step 1 (native detail view opens): **Held.** Confirmed via SYNTH-PRG-BRAVO / Supply
  Chain Telemetry.
- Step 2 (updated expectation — PY/CY/BY/BY+1 selector present and functional): **Held
  for PY and CY.** BY and BY+1 tabs were not opened this pass — see WH-37.
- Step 3 (dependency health scoped to the program): **Held.**
- Step 4 (World Model's separate Program Detail path still works): **Held.** Confirmed
  via P-100 Joint Logistics Modernization — this is a real, deliberately separate
  dataset from Execution Monitoring's native view, by design (see Notes below).

**Part 8 — Remaining original Walkthrough G checks: substantially run, two real
failures found.**
- Step 1 (Program Health tile varies by program mix): **Technically holds** — five
  programs, five different values — **but the values themselves are wrong.** See WH-34.
- Step 2 (Flagged Programs shows only what should be flagged): **Fails.** See WH-41.
- Step 3 (To Do/Review tiles match what's actually pending for the role): **Not yet
  confirmed** — genuinely still open.
- Step 4 (READ_ONLY sees an honest, correctly-empty Home): **Fails.** See WH-42.

---

## Critical findings

### WH-34 — Home Dashboard obligation percentage miscalculated for multi-year programs

Home Dashboard's Program Health tiles show all five SYNTH-PRG programs at obligation
percentages that don't match reality: ALPHA 171%, BRAVO 149%, CHARLIE 163%, DELTA 338%,
ECHO 92%. Cross-checked against the real per-year figures in the FY2025–2028 PPBE
Content Draft, a consistent pattern emerges:

| Program | Home shows | Numerator (matches sum of real obligated $ across years with obligation data) | Denominator used |
|---|---|---|---|
| ALPHA | 1,542,000 / 900,000 = 171% | 740,000 (FY25) + 802,000 (FY26) = 1,542,000 ✓ | 900,000 = FY2028's *estimate* |
| BRAVO | 777,000 / 520,000 = 149% | 510,000 + 267,000 = 777,000 ✓ | 520,000 = FY2025's planned (≈ FY28 estimate, coincidental) |
| CHARLIE | 571,000 / 350,000 = 163% | 275,000 + 296,000 = 571,000 ✓ | 350,000 = FY2028's *estimate* |
| DELTA | 1,015,000 / 300,000 = 338% | 530,000 + 485,000 = 1,015,000 ✓ | 300,000 = FY2027's final-year wind-down *request* |
| ECHO | 458,000 / 500,000 = 92% | 458,000 (only FY26 has obligation data) ✓ | 500,000 = FY2028's *estimate* |

**Hypothesis (data-evidenced, not yet code-confirmed):** the numerator correctly sums
real obligated dollars across every year that has obligation data for a program. The
denominator incorrectly pulls the "planned" field from whichever `ProgramRecord` is
chronologically **latest** for that program — which, since WG-6 (Session 70) added
FY2027/FY2028 records, is now a Budget Year request or Programming Year estimate, not
an execution-year plan. Before WG-6, every program had exactly one record, so "latest
record's planned" and "sum of obligated" were trivially the same year — this is very
likely a Session 70 regression that was never caught because Home Dashboard wasn't
re-walked after WG-6 shipped.

**Why this is Critical:** it's on the first screen of the platform, it's a number a
numerically literate evaluator can check by hand in seconds, and it directly undercuts
a platform whose central demo claim is deterministic, trustworthy compliance math.

**Recommended next step:** Build Agent traces the actual Program Health computation
(likely in the Home Dashboard's data-aggregation layer) against this hypothesis, fixes
the denominator to sum planned across the same years the numerator sums obligated
across, and re-verifies all five programs' displayed percentages against the Content
Draft's real figures.

### WH-42 — READ_ONLY: Home Dashboard is completely locked

Directly observed: Home Dashboard is inaccessible under the READ_ONLY persona, rather
than showing the honest, correctly-empty state Walkthrough H Part 8 Step 4 specifies
("no phantom pending items, no access errors"). This is a role-access defect, not a
content gap — a lower-privilege role hitting a hard lock on the platform's own landing
screen is exactly the kind of thing a security-minded evaluator would try, and exactly
the kind of thing that should not happen on a platform leading with GD-10's
classification-boundary discipline as a selling point.

**Recommended next step:** Build Agent traces the READ_ONLY role gate on Home Dashboard
and either removes the incorrect lock or confirms Home's own empty-state rendering path
handles READ_ONLY correctly.

### WH-43 — Reviewer's Workspace "NEXUS Travel" count disagrees with NEXUS's own queue

The Reviewer's Workspace's NEXUS Travel panel shows a badge count of **1**. The
Project Principal, working directly in NEXUS's own Travel & Time Queue, reports **two**
items still requiring a decision. From the screenshots captured this session, only
SYNTH-TR-107 shows live decision controls (Approve/Deny/Escalate); TR-101/102/108 are
already APPROVED, TR-106 is DENIED, and TR-103/104/105 already show status ESCALATED —
but whether an ESCALATED item still counts as "pending a decision" from a different
authority tier, and whether NEXUS's queue and the Workspace panel compute that the same
way, was not confirmed from the available screenshots.

**Why this is Critical:** this is very likely a live recurrence of the "same fact shown
twice, disagreeing" pattern family (WH-7, WH-17, WH-18, WH-22) — the exact defect shape
this arc named as a defining problem and organized five build sessions (62–65) around
closing. It's recurring in the one Workspace panel (NEXUS Travel, added Session 63 /
WH-19) that postdates the original fix set, which is consistent with Rule 12's own
warning: a root-cause fix isn't closed until the codebase is searched for the same root
cause elsewhere, and this panel was evidently never checked against it.

**Recommended next step:** Build Agent gets an exact, itemized count of what NEXUS's
own Travel & Time Queue currently considers "requires a decision" vs. what the
Reviewer's Workspace panel is deriving, using the real running app — not a description
— and identifies whether these two counts share one computation (per Rule 11) or are
separately (and now divergently) derived.

---

## High-priority findings (tied to the critical cluster)

### WH-35 — "On Track" status label appears unrelated to obligation percentage

Already partially flagged in the FY2025–2028 PPBE Content Draft, which noted ECHO's
real 104%-obligated figure was still shown "on-track" and left the status-derivation
logic as an open question. This pass confirms the pattern across all five programs —
even DELTA at a miscalculated 338% still reads "On Track." Once WH-34's denominator is
fixed, this becomes independently checkable: does the status badge move with a
corrected percentage at all, or is it a separately stored/hardcoded field? Needs a
Build Agent trace, then a real decision on what should drive the label.

### WH-41 — "Issues" (Flagged Programs) shows all-clear despite 338% obligation

Home Dashboard's Issues section — the platform's actual name for what governance docs
call "Flagged Programs" — reads "No flagged programs — all programs are on track"
while DELTA computes (on Home's own, currently-miscalculated math) to 338% obligated.
Directly linked to WH-34/WH-35: once the denominator bug is fixed, re-check whether
Issues starts flagging correctly. If it still says all-clear afterward, the flagging
logic has its own, separate defect.

---

## Medium-priority findings

### WH-40 — PPBE Workflow Agents panel becomes unresponsive

The panel (APEX Execution Monitoring, `ppbe-evidence-synthesizer` and
`ppbe-scenario-analyst`, both STATIC tier per the D4-6 deferral) stops responding after
some interaction; navigating to another screen and back restores it. The exact failing
control wasn't isolated this pass — could be the "Run …" buttons, or the
scenario-analyst's greyed-out option rows. Recommend Build Agent reproduce directly and
narrow down which control specifically stops responding before attempting a fix.

### WH-44 — LENS Pipeline Navigator always shows zero active agents, confirmed by design

Confirmed via direct source comment in `orientation-data.ts`: *"`active_agents` is
honestly empty for primary products by design — no fabricated agent activity."* Not a
bug — the Pipeline Navigator is a static, non-LLM feature that deliberately never
claims agent activity it can't verify live. But it creates a visible self-contradiction:
APEX's own screen shows real registered agents (`ppbe-evidence-synthesizer`,
`ppbe-scenario-analyst`, plus `apex.ai-assistant` and `apex.report-generator` in the
Agent Identity Standard) actively producing output, while LENS — the product
specifically positioned as "AI Transparency" — reports zero agents for APEX in the same
session. Needs a real decision: wire the navigator to real registration data, or adjust
the copy so "not shown here" doesn't read as "doesn't exist."

### WH-36 — To Do/Review section: inconsistent visual grammar

Since WH-31's Session 70 merge, modules with zero items render as a flat inline row
("Module — Clear"); modules with pending items render as a header plus a card below.
Two different visual treatments in one list, consistent with the reported difficulty
scanning and differentiating entries. Worth a design pass, not a rebuild.

### WH-37 — Execution Monitoring's BY/BY+1 tabs may misapply execution-shaped metrics

**Genuinely unconfirmed — flagging the question, not a finding.** `docs/18`'s own phase
table already treats FY2027 (Budgeting) as "a formal request, not an obligation — no
`percent_obligated`" and FY2028 (Programming) as having "no obligation concept at all,"
so the data model may already handle this correctly. What wasn't checked this pass is
whether the Execution Monitoring UI's "Obligation status" widget and "Budget-to-actual
variance history" table gate appropriately for those two tabs, or still render
execution-shaped fields (an "Actual" column, an on-track/off-track badge) against years
that structurally can't have them. **Needs the BY and BY+1 tabs actually opened and
reported before this becomes a real, numbered finding.**

---

## Lower-priority findings and raised (not decided) items

### WH-45 — Travel Request form shows raw validator text on empty submit

Submitting NEXUS's Travel Request form with no fields filled produces the schema
validator's own output verbatim — `destination: required string · mission_purpose:
required string · justification: required string · travel_start_date: required ISO
8601 date string · travel_end_date: required ISO 8601 date string` — instead of
friendly per-field inline messages. The validation logic itself is correct; only the
presentation is raw.

### WH-38 — Variance history should be a line chart

Real, scoped design recommendation: replace the "Budget-to-actual variance history"
table with a line chart, X-axis time, Y-axis $K, two series (planned, actual). Distinct
from WH-15 (SCRIBE's PPBE exhibit table/chart) — this is Execution Monitoring, a
different screen.

### WH-39 — Site breakdown column order

Currently Site / Region / Obligated / Planned / Status. Planned should precede
Obligated to match the real order of the funds lifecycle. Quick fix. Separately, flag
as backlog: the fuller Planned → Available → Committed → Obligated → Costed lifecycle
isn't in the schema at all today — a larger addition, not part of this fix.

### WH-46 — Time Record redesign (raised, not decided)

A detailed, real proposal: replace the current per-date-row entry form with a weekly
grid — charge code (dropdown) in the first column, a column per day of the week for
hours, an auto-populated charge-code-title column driven by the dropdown selection,
Paid Time Off / Holiday / Admin available as charge codes, and a justification field
that only appears/required when the charge code is overhead. Needs Project Principal
confirmation and a scoping pass before it's buildable — same treatment as WH-15/16/23.

---

## Notes — not findings, but worth carrying forward

**Terminology drift:** governance documents and the walkthrough script refer to APEX's
"PPBE Dashboard"; the actual UI tab and header read "Portfolio Dashboard." Documentation
fix only, not a code issue.

**Two separate program datasets — confirmed by design, not a defect.** Portfolio
Dashboard → Program Detail (P-100 series — Dana Jones, Robin Vasquez, the "World
Model," rich risk register and reasoning-chain history, deliberately untouched this
whole arc) is a different, unlinked dataset from Execution Monitoring's native PPBE
view (SYNTH-PRG series, WG-6's multi-year expansion). Walkthrough H Part 7's own script
tests both paths separately for exactly this reason. Real architecture, confirmed
working as intended — but worth a deliberate decision on how to narrate this to a CTO
audience, since two unlinked "portfolios" in the same product is the kind of thing that
invites a question if it isn't framed first.

**Program Health tiles need more information — supports existing, already-decided
backlog.** The Findings & Resolution Log already carries a decided-but-not-built Program
Health redesign (obligation, budget-to-actual variance, dependency health index,
learning velocity, bundled with WH-5's point-of-contact data). Today's feedback is
supporting evidence for prioritizing that bundle, not a new item.

---

## Recommended priority order for Build Agent

1. **WH-43** — trace the NEXUS Travel / Workspace count discrepancy first. Given what
   this pattern has cost the platform's credibility narrative before, confirming
   whether this is real and how deep it goes should come before anything else.
2. **WH-34, WH-35, WH-41** — one connected cluster: fix the obligation-percentage
   denominator, then re-check what actually drives the On Track / At Risk / Off Track
   badge and whether Issues starts flagging correctly once the underlying number is
   right.
3. **WH-42** — READ_ONLY's Home lockout. Small in scope, high in optics.
4. **WH-40, WH-44** — the unresponsive agents panel and LENS's zero-agents framing.
5. Everything else (WH-36, WH-37 pending verification, WH-38, WH-39, WH-45, WH-46) —
   real, bounded, and safe to schedule normally alongside the existing WH-26 /
   WH-15/16/23 backlog.

**On the readiness score:** until WH-34, WH-42, and WH-43 are resolved or
re-characterized, this report recommends treating the Integration Brief v1.50's 9.6/10
figure, and its framing that remaining work is "bounded content work, not an open
architecture question," as not current. That framing was accurate against what was
known when it was written — today's pass changed what's known.

---

*Findings Report · July 28, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
*Companion to `SOVEREIGN_Walkthrough_H.md`, `SOVEREIGN_Walkthrough_H_Findings_Resolution_Log_20260726.md`, and `SOVEREIGN_Platform_Integration_Brief_v1.50.md`*
