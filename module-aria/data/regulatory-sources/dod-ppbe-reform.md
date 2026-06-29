# DoD PPBE Reform (Planning, Programming, Budgeting & Execution)

**Source ID:** `dod-ppbe-reform`
**Authority:** Commission on PPBE Reform — implementing guidance
**Scope (CLEAR):** PPBE phase alignment and governance-calendar timeliness.

> SYNTHETIC SUMMARY — not a legally complete restatement of DoD PPBE Reform guidance.
> These are the specific, deterministic rules the CLEAR engine evaluates an output
> against. A working subset for demonstration on synthetic data only.

## Rules CLEAR evaluates

1. **R-PPBE-1 — Phase alignment.** Every PPBE output must align to a declared PPBE
   phase (Planning, Programming, Budgeting, or Execution). An output not aligned to a
   phase is non-compliant.

2. **R-PPBE-2 — Governance-calendar timeliness.** Phase transitions, attestation
   deadlines, and decision-forum commitments must be met on the governance calendar.
   An overdue phase transition or lapsed commitment is a timing violation (red); a
   transition approaching its deadline is at risk (amber). Timing violations route to
   the VIGIL Alert Queue as `ARIA_CALENDAR_ALERT`.

## Notes

The PPBE Reform rule is the source of CLEAR's process-compliance (governance-calendar)
monitoring surface, alongside its output-compliance checks. CLEAR observes and flags;
named humans decide.
