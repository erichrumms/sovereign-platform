# SOVEREIGN Platform — Walkthrough I Findings Report
## July 30, 2026 · Governance Agent

---

## Headline

**Four of five Parts produced real, usable results. Part 3 — the one built around
re-confirming WH-43, this arc's most-tracked defect pattern — did not close.** The core
comparison it exists to make (NEXUS's own live decision count against the Reviewer's
Workspace badge) was never obtained, and a more serious question surfaced instead: real
uncertainty about whether the Activity & Decisions log reflects actions the Project
Principal actually remembers taking. This report does not treat that as resolved.

**Two new, real findings are ready to build (WH-48, WH-49). Three items are flagged
open, not closed (WH-50, WH-51, WH-52) and need follow-up, not assumption.** Part 4 was
fully clean — the first Part in this walkthrough with zero findings. Part 5 held,
confirmed twice, and generalized better than its own scope required.

---

## Part-by-part results

### Part 1 — Home Dashboard: held, with one new finding

Dependency Health Index (75%) and Learning Velocity (68%) confirmed rendering correctly
and matching their traced source computations (Integration Brief v1.55 §13). The
Budget-to-actual variance chart itself is a clean, direct confirmation of WH-38.

**New — WH-48:** the sentence-per-period narrative below both the per-program variance
chart and the portfolio-level bar chart should be a table (Period | Planned | Actual |
Variance), not four-to-twenty near-identical sentences. Applies to both APEX Execution
Monitoring's per-program view and the Home Dashboard portfolio rollup.

### Part 2 — APEX Execution Monitoring: held, with one new finding

**New — WH-49, real bug:** selecting the PY (FY2025) tab, then clicking into a program
from Obligation Rate, lands on that program's Detail view showing CY (FY2026), not PY.
Root cause is almost certainly that Session 74's BY/BY+1 gating fix (WH-37) gave the
Dashboard and Detail screens independent fiscal-year state with nothing carrying the
selection across navigation — the Detail screen's own default logic falls back to CY
regardless of what was selected on the Dashboard. Worth fixing before a demo; a
confusing, unexplained year-switch mid-navigation is a bad live moment.

### Part 3 — NEXUS / SCRIBE / Reviewer's Workspace: INCOMPLETE, not closed

**The core check this Part exists for was never completed.** NEXUS's own live count of
items with decision controls was not obtained, so it was never compared against the
Reviewer's Workspace "NEXUS Travel [3]" badge. WH-43's live re-confirmation remains
outstanding — Session 71's fix is still code-verified and tested only, not live-held,
exactly as it has been since that session closed.

**New — WH-50, unresolved, treat as open, not dismissed:** the Activity & Decisions log
showed 4 NEXUS travel decisions (1 approved, 2 escalated, 1 denied) and 3 SCRIBE time
corrections sent, more than Part 3's own script called for. The Project Principal could
not confirm making all of these decisions. Two explanations remain equally possible:
ordinary exploration beyond the scripted steps that's simply hard to reconstruct after
the fact, or the log surfacing entries that don't correspond to real, remembered
actions. **This was not resolved and should not be treated as either confirmed-fine or
confirmed-broken.** Given that this log is the platform's real-time audit trail — the
literal evidence behind the "real, live-confirmed audit trail" claim at the center of
the CTO demo pitch — this deserves a clean, isolated re-test before anything else:
sign in fresh, take one specific, remembered action, and confirm the log shows exactly
that one thing and nothing else.

**New — WH-51, open design question, not a bug:** SCRIBE's Time & Travel queue removes
an item once a correspondence draft is sent, rather than leaving it visible with a
"sent" badge. This matches the platform's existing pattern (VIGIL's approval queue
behaves the same way), so it's very likely intentional — NEXUS's card is where the
persistent status is meant to live (WH-16). Not confirmed as the Project Principal's
actual preference; needs a decision, not an assumption.

### Part 4 — ARC: fully clean, zero findings

Every step held exactly as scripted. Program-selector dropdown, ALPHA's context panel
(name, ID, FY2026, POC, CLEAR certified), BRAVO's honest "no exhibit" disclosure,
editable auto-populated description all confirmed. The routing-button recommendations
are better than their own SBOM description — genuinely contextual text (COUNSEL's
mentions "framing an adaptation decision," NEXUS's mentions "creating an action item,"
both citing the real affected-item count), not generic placeholders. Toggle behavior
between the two buttons confirmed correct.

**Walkthrough I script correction (not a platform finding):** the script named
COMPLIANCE_OFFICER as ARC's likely persona gate. Direct evidence from this session
shows ARC is locked for both COMPLIANCE_OFFICER and PROGRAM_MANAGER, and fully
accessible under ANALYST. Walkthrough I's Part 4 persona instruction should read
ANALYST going forward.

### Part 5 — READ_ONLY: held, confirmed twice, generalized further than scoped

Confirmed cleanly on first pass and again on a second, independent check this round —
LENS accessible, everything else absent (not locked-and-visible, genuinely absent) from
To Do/Review, honest explanatory text in Issues. Bonus evidence from earlier
screenshots (AGENT_OPERATOR, INDEPENDENT_REVIEWER) shows WH-42's fix generalized to
every under-privileged role, not just READ_ONLY specifically — a better outcome than
the fix was scoped to guarantee.

---

## Open, unresolved — not yet findings, need direct follow-up

- **WH-52:** a floating grey sidebar badge ("CPMI" near AgentOS in one screenshot,
  "FLOWPATH" near ARIA Suite in another) appeared during Part 4 screenshots.
  Reproducibility unknown — could be a harmless mid-transition tooltip artifact caught
  by screenshot timing, or a real stray-element bug. Not confirmed either way.

---

## Recommended next steps, in order

1. **Re-test WH-50 in isolation before anything else.** This is the one item in this
   report that touches the platform's central credibility claim. A clean, single-action
   test (sign in fresh, take one action, confirm the log shows exactly that action) will
   resolve it in under two minutes and should happen before this gets carried into a
   demo script one way or the other.
2. **Complete Part 3's actual purpose:** get NEXUS's own live decision count and compare
   it directly against the Workspace badge. WH-43 remains code-verified only until this
   happens.
3. **WH-48 and WH-49 are ready for a build session** whenever there's appetite — both
   are well-scoped, neither needs a design decision first.
4. **WH-51 needs a direct decision**, not a build session yet — confirm whether SCRIBE's
   queue-clears-on-send behavior is the Project Principal's actual preference.
5. **WH-52 is low priority** — worth a glance next time Part 4 or similar screens are
   open, not worth its own session.

**On the readiness score:** Integration Brief v1.55 held it open pending live
confirmation of four things, including WH-43. This walkthrough closes two of those four
cleanly (READ_ONLY's empty state, the BY/BY+1 planning notice — Part 2 confirmed the
chart itself, though Part 2's own new finding, WH-49, is a fresh reason for caution
about navigation state generally) and leaves WH-43 exactly where it was — open, code-
verified, not live-held. The score should not be restated yet, and WH-50 is a new,
independent reason to hold it open, not just the original one.

---

*Walkthrough I Findings Report · July 30, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
*Companion to `SOVEREIGN_Walkthrough_I.md` and Integration Brief v1.55*
