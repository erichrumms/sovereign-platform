/**
 * SOVEREIGN Platform — module-apex
 * ppbe-data-adapter.ts — the PPBE dashboard's host data adapter (Session 33,
 * goal item 8). This is the wiring Session 32 deliberately deferred: the
 * dashboard component was built correct-but-empty; this adapter feeds it the
 * canonical seeded portfolio so it renders REAL metrics.
 *
 * Follows the createSyntheticApexDataAdapter convention: a synthetic/dev
 * backing assembled from @sovereign/data's canonical seed. A real deployment
 * replaces this adapter with one over live records; the dashboard component
 * does not change (same seam as apex-data-adapter.ts).
 *
 * ACTUALS ARE DERIVED, NEVER RESTATED: per-period actuals are grouped from
 * the seeded ObligationRecords by synthPeriodForTimestamp — one source of
 * truth, no second copy of the numbers to drift (Constraint #2 spirit).
 *
 * EVENT COUNTS mirror the seeded Python-side trail
 * (sovereign-security/logs/ppbe_synthetic_seed.jsonl, written by
 * seed_ppbe_events.py — 5 transitions / 5 decisions / 10 anomalies / 20
 * findings). The browser cannot read that JSONL; the counts are carried here
 * as the synthetic adapter's constants, and the Session 33 e2e V&V pass
 * cross-checks them against the actual trail file in Node so drift between
 * the two is caught in CI rather than trusted.
 *
 * Version: 1.0 · Session 33 · July 13, 2026
 */

import {
  SYNTH_PPBE_DEPENDENCIES,
  SYNTH_PPBE_FINDINGS,
  SYNTH_PPBE_OBLIGATIONS,
  SYNTH_PPBE_PROGRAMS,
  synthPeriodForTimestamp,
} from "@sovereign/data";
import type { ObligationRecord } from "@sovereign/data";

import type { PPBEDashboardInputs, PPBEEventCounts } from "./ppbe-dashboard";

/**
 * The seeded Python-side trail's per-type counts (see the header note on how
 * these are kept honest). Exported so the V&V pass can assert them against
 * the committed JSONL fixture.
 */
export const SYNTH_PPBE_EVENT_COUNTS: PPBEEventCounts = {
  PPBE_PHASE_TRANSITION: 5,
  PPBE_DECISION: 5,
  PPBE_ANOMALY: 10,
  PPBE_EVALUATION_FINDING: 20,
};

/** Group obligation amounts into per-period actuals for one program. */
export function actualsForProgram(
  obligations: readonly ObligationRecord[],
  programId: string
): Record<string, number> {
  const actuals: Record<string, number> = {};
  for (const o of obligations) {
    if (o.program_id !== programId) continue;
    const period = synthPeriodForTimestamp(o.timestamp);
    actuals[period] = (actuals[period] ?? 0) + o.amount;
  }
  return actuals;
}

/**
 * Assemble the dashboard inputs from the canonical seed. Pure and
 * deterministic — same seed, same inputs.
 */
export function createSyntheticPPBEDashboardInputs(): PPBEDashboardInputs {
  const actualsByProgram: Record<string, Record<string, number>> = {};
  for (const program of SYNTH_PPBE_PROGRAMS) {
    actualsByProgram[program.program_id] = actualsForProgram(
      SYNTH_PPBE_OBLIGATIONS,
      program.program_id
    );
  }
  return {
    programs: [...SYNTH_PPBE_PROGRAMS],
    obligations: [...SYNTH_PPBE_OBLIGATIONS],
    actualsByProgram,
    dependencies: [...SYNTH_PPBE_DEPENDENCIES],
    findings: [...SYNTH_PPBE_FINDINGS],
    eventCounts: { ...SYNTH_PPBE_EVENT_COUNTS },
  };
}
