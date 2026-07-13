# `ppbe-dependency-tracker` — BUILT (Session 31, PPBE Build Session 1 — Core Integration)

The reservation conditions this directory guarded are satisfied: D-P1–D-P6 were
decided June 29, 2026 (reaffirmed by D-P7 Option A, July 12, 2026), the agent is
registered in `Agent_Identity_Standard.md` (Constraint #10), and the build
specification is `docs/18_PPBE_Workflow_Architecture.md`.

**Implementation:** `module-flowpath/src/ppbe-dependency-tracker.ts`
**Tests:** `module-flowpath/tests/ppbe-dependency-tracker.test.ts`

The implementation lives in `src/` following the Time & Travel workflow-layer
pattern, not in this directory — this README remains as the registry-anchored
pointer.

- **Class:** Monitoring — DETERMINISTIC (registry determination; no LLM call, no
  prompt, no sovereign-api-client)
- **Rules:** dependency health failures (failed/at-risk), handoff timing
  violations, quality-threshold failures; plus the Tier B phase-readiness
  contribution (`assessPhaseReadiness`)
- **Scope:** reads DependencyMap entities and handoff observations read-only;
  tracks and routes only — findings go to VIGIL; `PPBE_ANOMALY` emission is
  Python-side (Session 31 Project Principal decision)
