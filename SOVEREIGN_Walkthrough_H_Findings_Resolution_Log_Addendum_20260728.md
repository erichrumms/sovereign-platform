# SOVEREIGN Platform — Findings & Resolution Log — Addendum
## July 28, 2026 · Governance Agent
## Companion to the July 26 Log and SOVEREIGN_Findings_Report_20260728.md

---

## Fixed and verified — Session 71

| ID | Finding | Fixed in | Verified how |
|---|---|---|---|
| WH-43 | Reviewer's Workspace NEXUS Travel badge disagreed with NEXUS's own Travel & Time Queue count | `0ab1610` | Root cause confirmed: `nexus-workspace-publisher.ts`'s pending set counted only ROUTED, excluding ESCALATED items NEXUS's own queue treats as pending senior-authority decision — a real Rule 11 violation. Fixed by widening the pending set to ROUTED\|ESCALATED, changing `WorkspaceApp.tsx` to publish an updated read-only payload on ESCALATED transitions rather than removing the item, and seeding NEXUS travel items at startup to match the existing VIGIL/ARIA/SCRIBE pattern. Rule 12 check performed and documented: FLOWPATH's Review and Activity panels examined directly; same root cause not present there — FLOWPATH's session store uses an APPROVED-state check with no ESCALATED equivalent |
| WH-34 | Home Dashboard obligation percentages miscalculated for multi-year programs (ALPHA 171%, DELTA 338%, etc.) | `38071f2` | Root cause confirmed exactly as hypothesized in the Findings Report: WG-6 expanded `SYNTH_PPBE_PROGRAMS` from 5 to 18 entries without deduplication; callers summed obligations across all years in the numerator while dividing by a single year's plan in the denominator. Fixed via `uniqueByProgramId()` and `obligationsForYear()` in `ppbe-dashboard.ts`. Re-verified against real figures: ALPHA FY2026 now reads 97%, DELTA FY2026 now reads 95% — both match the FY2025-2028 PPBE Content Draft's underlying numbers exactly |
| WH-35 | On Track status badge's relationship to the obligation percentage, unclear | `38071f2` (same fix) | Answered and closed for the general case: once WH-34's denominator was corrected, ALPHA's badge reads on-track at the now-correct 97%, confirming the badge does track the real percentage. A narrower, separate case remains — see WH-47 below |
| WH-41 | Home Dashboard Issues/Flagged Programs showed all-clear despite DELTA's miscalculated 338% | `38071f2` (same fix) | Re-verified directly linked to WH-34: DELTA's corrected FY2026 rate (95%) no longer triggers a false flag. The false-positive is confirmed gone, not just theoretically resolved |
| WH-42 | READ_ONLY saw Home Dashboard as completely locked (ten locked module rows) instead of an honest empty state | `0748cca` | Root cause: `ModuleStatusPanel` rendered all eleven registered modules regardless of role access. Fixed by filtering to accessible modules before render and removing the locked-row branch entirely; added an explicit empty-state message for the zero-accessible case. Four existing role snapshots updated (locked rows now absent); one new READ_ONLY snapshot added asserting no "Requires" or lock-icon text renders |

**Platform-wide test count: NOT independently reconciled this addendum.** Session 71
re-derived 1,775 across fourteen JS/TS packages — no Python line, and 148 fewer JS/TS
tests than Session 69's confirmed 1,923. See Integration Brief v1.51 §11 for the full
flag. This addendum does not treat 1,775 as a verified platform total.

---

## Raised, genuinely still open — no decision made yet

| ID | Finding | Status |
|---|---|---|
| **WH-47** | ECHO's `EvaluationFinding` narrative reads "on-track" while its corrected FY2026 obligation rate is 104% (obligated $458k against $440k plan) — the narrative text was authored independently of the number and the two have never been reconciled. Surfaced by Build Agent during WH-34/35's fix, correctly not resolved unilaterally | **Open — real governance decision needed.** Update the narrative text, or add an explicit suppression/exception note explaining why ECHO reads on-track despite exceeding its ceiling. Do not let this get built without that decision |
| WH-44 | LENS Pipeline Navigator shows zero active agents for every product, confirmed by design (source comment: never fabricates agent activity) — creates a visible contradiction with APEX's real, running PPBE Workflow Agents in the same session | **Open — real decision needed.** Wire real registration data in, or change the copy |
| WH-36 | Home Dashboard To Do/Review section mixes two visual treatments (flat row vs. header+card) depending on whether a module has pending items | Open, medium priority, design pass needed |
| WH-37 | Execution Monitoring's BY/BY+1 tabs may misapply execution-shaped metrics to pre-execution years | **Genuinely unconfirmed** — those two tabs were never opened during the July 28 pass. Not yet a real finding, just a flagged question |
| WH-38 | Budget-to-actual variance history recommended as a line chart instead of a table | Open, scoped design recommendation |
| WH-46 | NEXUS Time Record redesign — weekly grid, charge-code dropdown, PTO/Holiday/Admin, conditional overhead justification | Raised, not decided, needs its own scoping pass |

---

## Decided, not yet built — deferred as Session 71's D4

| ID | Decision | What building it requires |
|---|---|---|
| WH-40 | PPBE Workflow Agents panel becomes unresponsive after some interaction; navigating away and back restores it | Isolate the specific failing control (the "Run…" buttons vs. the scenario-analyst's option rows) before attempting a fix |
| WH-45 | Travel Request form shows raw schema-validator text on empty submit instead of friendly per-field messages | Presentation only — validation logic itself is correct |
| WH-39 | Site breakdown table column order (Planned should precede Obligated) | Quick, low-risk reorder |

None of these block the current demo path. Real next-session scope, not urgent.

---

*Findings & Resolution Log Addendum · July 28, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
*Companion to `SOVEREIGN_Walkthrough_H_Findings_Resolution_Log_20260726.md` and `SOVEREIGN_Findings_Report_20260728.md`*
