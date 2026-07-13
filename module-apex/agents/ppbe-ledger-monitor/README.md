# `ppbe-ledger-monitor` — BUILT (Session 31, PPBE Build Session 1 — Core Integration)

The reservation conditions this directory guarded are satisfied: D-P1–D-P6 were
decided June 29, 2026 (reaffirmed by D-P7 Option A, July 12, 2026), the agent is
registered in `Agent_Identity_Standard.md` (Constraint #10), and the build
specification is `docs/18_PPBE_Workflow_Architecture.md`.

**Implementation:** `module-apex/src/ppbe-ledger-monitor.ts`
**Tests:** `module-apex/tests/ppbe-ledger-monitor.test.ts`

The implementation lives in `src/` following the Time & Travel workflow-layer
pattern (`tt-pattern-analyst.ts` et al.), not in this directory — this README
remains as the registry-anchored pointer.

- **Class:** Monitoring — DETERMINISTIC (registry determination; no LLM call, no
  prompt, no sovereign-api-client)
- **Rules:** obligation rate deviation vs. plan, lifecycle ceiling
  proximity/exceedance, feedback-loop stall (R-P7)
- **Scope:** observes and alerts only — findings route to the VIGIL Alert Queue;
  `PPBE_ANOMALY` emission is Python-side (Session 31 Project Principal decision)
