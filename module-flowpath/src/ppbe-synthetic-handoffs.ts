/**
 * SOVEREIGN Platform — module-flowpath
 * ppbe-synthetic-handoffs.ts — seeded PPBE handoff observations (Session 33,
 * goal item 3). ALL DATA SYNTHETIC (SYNTH- ids).
 *
 * HandoffObservation is a module-local shape (ppbe-dependency-tracker.ts), so
 * its seed lives here — the module-local half of the canonical seed, exactly
 * the tt-synthetic-config.ts pattern. Every observation references a
 * dependency in @sovereign/data's SYNTH_PPBE_DEPENDENCIES by id, and every
 * timestamp is consistent with the seed's clock of record (SYNTH_PPBE_AS_OF,
 * July 13, 2026).
 *
 * COVERAGE BY DESIGN (what Session 32's V&V could never fire end to end):
 *   - SYNTH-DEP-03: delivered LATE → TIMING_VIOLATION (P2, delivered-late arm)
 *   - SYNTH-DEP-04: overdue and UNDELIVERED → TIMING_VIOLATION (P1 arm)
 *   - SYNTH-DEP-07: delivered on time but FAILED its quality check →
 *     QUALITY_THRESHOLD_FAILURE
 *   - SYNTH-DEP-01/-02: healthy, on-time, quality-passed (the clean baseline)
 * Combined with the seeded health states (DEP-05 at-risk, DEP-06 failed), the
 * phase-4 links make assessPhaseReadiness("phase-4") genuinely NOT ready —
 * the Tier B not-ready example the walkthrough needs.
 *
 * Version: 1.0 · Session 33 · July 13, 2026
 */

import type { HandoffObservation } from "./ppbe-dependency-tracker";

export const SYNTH_PPBE_HANDOFF_OBSERVATIONS: HandoffObservation[] = [
  // Clean baseline — delivered on time, quality passed.
  {
    dependency_id: "SYNTH-DEP-01",
    due_by: "2026-05-08T17:00:00Z",
    delivered: true,
    delivered_at: "2026-05-06T15:00:00Z",
    quality_check_passed: true,
  },
  {
    dependency_id: "SYNTH-DEP-02",
    due_by: "2026-06-26T17:00:00Z",
    delivered: true,
    delivered_at: "2026-06-25T10:00:00Z",
    quality_check_passed: true,
  },
  // TIMING_VIOLATION (delivered-late arm): BRAVO's evidence package arrived
  // six days after its due time.
  {
    dependency_id: "SYNTH-DEP-03",
    due_by: "2026-06-26T17:00:00Z",
    delivered: true,
    delivered_at: "2026-07-02T09:00:00Z",
    quality_check_passed: true,
  },
  // TIMING_VIOLATION (overdue-undelivered arm, P1): BRAVO's trade-off decision
  // handoff was due July 8 and still has not arrived at the clock of record.
  {
    dependency_id: "SYNTH-DEP-04",
    due_by: "2026-07-08T17:00:00Z",
    delivered: false,
  },
  // QUALITY_THRESHOLD_FAILURE: DELTA's exhibit handoff arrived on time but
  // failed its figure-lineage quality check.
  {
    dependency_id: "SYNTH-DEP-07",
    due_by: "2026-07-06T17:00:00Z",
    delivered: true,
    delivered_at: "2026-07-06T12:00:00Z",
    quality_check_passed: false,
  },
];
