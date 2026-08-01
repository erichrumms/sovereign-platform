# SOVEREIGN Platform — PPBE Multi-Year Data Model and Year-Scoping Discipline
## July 30, 2026 · Governance Agent
## New architecture reference — companion to docs/18_PPBE_Workflow_Architecture.md

**Why this document exists:** the platform's single most serious data-integrity defect
this arc (WH-34) came from exactly this part of the model, and the fix introduced two
helper functions that every future consumer of program obligation data needs to use
correctly or risk reproducing the same bug in a new location. This document exists so
that doesn't happen.

---

## The model, as it actually is

Since WG-6 (Session 70), each SYNTH-PRG program is represented by up to four
`ProgramRecord` entries — one per fiscal year (PY/FY2025, CY/FY2026, BY/FY2027,
BY+1/FY2028) — sharing the same `program_id`. This is a deliberate, correct design: a
program's plan, obligation posture, and phase genuinely differ year to year, and PPBE
itself treats these as distinct planning artifacts, not one mutable record.

**The failure mode this creates if not handled carefully:** any code that iterates
`programs.filter(p => p.program_id === X)` or sums obligations across `X`'s records
without being explicit about which fiscal year it means will silently mix years. This
is exactly what happened in WH-34 — a percentage was computed by summing obligated
dollars across every year a program had data for, while dividing by only one year's
planned figure (specifically, whichever record happened to be chronologically latest).
DELTA's real obligation rate was near 95%; the miscalculated version read 338%.

## The two functions that exist specifically to prevent this

**`uniqueByProgramId(programs)`** — deduplicates a `ProgramRecord[]` down to one entry
per `program_id`, preserving first occurrence in array order. Any code that needs "the"
record for a program (not year-specific) should call this first, not write its own
filter/reduce.

**`obligationsForYear(obligations, fiscalYear)`** — filters an `ObligationRecord[]` to
only those whose `fiscalYearOfTimestamp(o.timestamp)` matches the given year. Any
obligation-rate or variance calculation must year-scope its numerator through this
function, not assume the caller already pre-filtered.

**The rule going forward:** if you are writing a new consumer of program obligation
data, ask explicitly which of these two problems you're solving — "which record
represents this program" (use `uniqueByProgramId`) or "which obligations count for this
period" (use `obligationsForYear`) — and use the matching helper. Do not write a new
filter or reduce over `SYNTH_PPBE_PROGRAMS` or `SYNTH_PPBE_OBLIGATIONS` directly.

## A second lesson from the same family: the `initialFiscalYear` carry (WH-49)

A related but distinct bug: `PPBEDashboard` and `PPBEProgramDetail` each independently
defaulted their own `selectedFiscalYear` state to `"FY 2026"`. Selecting a different
year on the Dashboard and navigating into a program's Detail view silently reset the
selection. The fix (Session 76) threads the selected year through the navigation
callback (`onSelectProgram(programId, fiscalYear)`) rather than letting the Detail
screen re-derive its own default. **The general principle:** any piece of UI state that
a user would reasonably expect to persist across a navigation between two related
screens needs to actually be carried, not independently re-initialized on both ends. A
platform-wide search for this pattern (Session 76, Rule 12 discipline) found no other
instance — but it's worth checking for again whenever a new multi-screen flow is added.

## The Budget Year gate (WH-37)

`docs/18` establishes that FY2027 (Budgeting) is a formal request with no
`percent_obligated`, and FY2028 (Programming) has no obligation concept at all. Both
`PPBEDashboard.tsx` and `PPBEProgramDetail.tsx` implement this with an `isBudgetYear`
flag (`selectedFiscalYear === 'FY 2027' || selectedFiscalYear === 'FY 2028'`) that gates
every execution-shaped section — obligation rate, status badge, the variance chart and
its table — behind a planning notice instead. Confirmed (Session 76 supplemental) that
the WH-48 variance table sits inside the same gated branch as the chart it replaced, so
this suppression applies uniformly rather than needing to be re-implemented per display
format.

---

*PPBE Multi-Year Data Model and Year-Scoping Discipline · July 30, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
