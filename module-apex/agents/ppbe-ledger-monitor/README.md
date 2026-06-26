# Reserved — `ppbe-ledger-monitor` (PPBE Phase II)

**Reserved for PPBE Phase II integration.** This agent will be registered and activated at
the PPBE governance session (~Session 19) and built no earlier than PPBE Phase II
(~Session 22).

**No build work in this directory** until the PPBE governance decisions D-P1 through D-P6 are
recorded in the Integration Brief and the agent is added to `Agent_Identity_Standard.md`
(Standing Constraint #10 — no agent in code before it is in the registry).

## Planned role (from SOVEREIGN_PPBE_Integration_Architecture_Draft1.md, Table 6)

- **Class:** Monitoring
- **Home module:** `module-apex` (Phase 5 — Budget Execution)
- **Function:** Continuously analyze obligation records and performance data for anomalies,
  deviation patterns, and early-warning signals. Routes `PPBE_ANOMALY` events to VIGIL when
  obligation rates or budget-to-actual variance exceed configured thresholds.

This directory and its sibling exist now so a future session creates these agents in the right
location without naming conflicts (spec §17.2 Commitment 3). They cost one directory and one
README each and prevent rewrite debt later.
