# SOVEREIGN Platform — Findings & Resolution Log — Addendum 2
## July 28, 2026 · Governance Agent
## Companion to the July 26 Log, the first Addendum, and SOVEREIGN_Findings_Report_20260728.md

---

## Fixed and verified — Session 72

| ID | Finding | Fixed in | Verified how |
|---|---|---|---|
| WH-40 | APEX PPBE Workflow Agents panel became unresponsive after some interaction; nav-away/back was the only recovery | `54e6113` | Root cause confirmed: `runSynthesis()`/`runScenario()` invoked with `void`, discarding rejected Promises; a rejection after status was set to "running" left the button permanently stuck with no recovery path short of unmount — exactly matching the walkthrough's own "navigating away and back restores it" observation. Fixed via try/catch in `PPBEAgentsPanel.tsx`, resetting status to idle on any exception. 2 regression tests added, both specifically exercising the throw-and-recover path |
| WH-45 | NEXUS Travel Request form showed raw schema-validator text on empty submit | `10858c8` | Root cause confirmed: empty required fields were passed straight to `validateTravelRequest`, which returns technical property:type notation. Fixed via presence checks in `tt-intake.ts` producing plain user-facing messages before the validator runs; the validator itself is now reached only for structurally complete, semantically invalid submissions (e.g. end date before start date), preserving its existing behavior there. 1 regression test added |
| WH-39 | APEX Site breakdown table column order (Obligated before Planned) | `d024506` | Confirmed: columns swapped in `PPBEDashboard.tsx`, header and data rows both. 1 regression test added |

**Test-count discrepancy (flagged in the Brief, not this Log, but closed by the same
session): fully reconciled.** 1,779 JS/TS (14 packages) + 149 e2e passing + 4 e2e skipped
+ 195 Python = 2,127, verified against Session 69's 2,118 baseline with the gap traced to
the missing e2e category and a net +9 accounted for by this session's four named
regression tests. See Integration Brief v1.52 §11 for the full arithmetic.

---

## Noted, not a new finding — worth a fast check later

**DELTA's `CEILING_EXCEEDED` status, surfaced while fixing a stale e2e assertion.**
DELTA's real obligation data (existing since WG-6, Session 70 — not introduced by Session
72) now correctly trips the ledger monitor's ceiling check: 1,015K obligated against a
500K lifecycle estimate, 203%. The e2e test simply hadn't been updated to expect this.
Structurally the same shape as WH-33/WH-47 — a real number against a real ceiling. Not
logged as its own WH item; flagged here so it gets checked alongside WH-47 rather than
surfacing later as a surprise. Question to answer then: does DELTA's own
`EvaluationFinding` narrative already account for this (a wind-down program's expected
cost growth at closeout), or is it a second instance of the ECHO mismatch?

---

## Status as of Session 72's close

**All of Session 71's D4 backlog is closed.** WH-40, WH-45, WH-39 — done, tested,
verified against the real repository, not accepted on the Handoff's summary alone.

**Genuinely still open, unchanged in substance:** WH-47 (ECHO narrative — real governance
decision), WH-26 (sidebar tooltips — real decision), WH-44 (LENS zero-agents framing —
real decision), WH-36/WH-37/WH-38/WH-46 (design/content backlog, WH-37 still needs the
BY/BY+1 tabs actually viewed), and the pre-existing WH-15/WH-16/WH-23/D3-6/D4-5/D4-9/
D4-6/F2 items carried from before this arc's July 28 walkthrough.

**No open Build Agent-actionable defect remains from the July 28 walkthrough pass.**
Everything left is either a decision only the Project Principal can make, or content/
design work needing its own scoping pass — the same shape of gap this arc's prior
versions described as "demo-ready" before WH-34/WH-43 were found. The difference this
time: the live re-confirmation gate (Integration Brief v1.52 §21) hasn't been closed yet,
and this Log continues to hold that distinction deliberately rather than let a
code-verified fix stand in for a live-held one.

---

*Findings & Resolution Log Addendum 2 · July 28, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
*Companion to `SOVEREIGN_Walkthrough_H_Findings_Resolution_Log_20260726.md`, the first Addendum, and `SOVEREIGN_Findings_Report_20260728.md`*
