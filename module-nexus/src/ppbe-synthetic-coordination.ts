/**
 * SOVEREIGN Platform — module-nexus
 * ppbe-synthetic-coordination.ts — seeded PPBE coordination state and the
 * realistic meeting-notes corpus (Session 33, goal item 5). ALL DATA
 * SYNTHETIC (SYNTH- ids).
 *
 * CoordinationItem and PPBETask are module-local shapes, so their seeds live
 * here — the module-local half of the canonical seed (tt-synthetic pattern).
 * Program/objective references resolve into @sovereign/data's
 * SYNTH_PPBE_PROGRAMS / SYNTH_PPBE_OBJECTIVES; deadlines are consistent with
 * the seed's clock of record (SYNTH_PPBE_AS_OF, July 13, 2026).
 *
 * COVERAGE BY DESIGN:
 *   - MISSED_DEADLINE in both severities (an overdue action item P3, an
 *     overdue calendar obligation P2)
 *   - LAPSED_COMMITMENT (P2) — the Phase 4 trade-off decision commitment
 *   - OVERDUE_PHASE_TRANSITION (P1) — ECHO's held 4→5 handoff, the same
 *     story the failed SYNTH-DEP-06 tells on the dependency side
 *   - A RESOLVED item and two comfortably-future items (the clean baseline)
 *
 * THE MEETING-NOTES CORPUS is written the way real notes read: partial ids,
 * people referred to by role, one item reported complete (CI-01 — a RESOLVED
 * proposal a digest should make), one discussed-but-not-done (CI-04 — a
 * digest must NOT propose resolving it), one owner gone quiet (CI-02), and a
 * dependency mentioned that is tracked nowhere (risk-flag material).
 *
 * Version: 1.0 · Session 33 · July 13, 2026
 */

import type { CoordinationItem } from "./ppbe-coordination-assistant";
import type { PPBETask } from "./ppbe-tasks";

export const SYNTH_PPBE_COORDINATION_ITEMS: CoordinationItem[] = [
  {
    item_id: "SYNTH-CI-01",
    kind: "ACTION_ITEM",
    description: "Assemble the Phase 2 evidence base for the Supply Chain Telemetry program",
    responsible_role: "PROGRAM_MANAGER",
    due_by: "2026-07-17T17:00:00Z", // future — but the notes say it's already done
    status: "OPEN",
    program_id: "SYNTH-PRG-BRAVO",
    phase: 2,
    workflow_step_id: "ppbe-coordination-SYNTH-CI-01",
  },
  {
    item_id: "SYNTH-CI-02",
    kind: "ACTION_ITEM",
    description: "Reconcile the Cyber Resilience Retrofit unit-cost assumption against Q3 actuals",
    responsible_role: "ANALYST",
    due_by: "2026-07-06T17:00:00Z", // overdue → MISSED_DEADLINE (P3)
    status: "OPEN",
    program_id: "SYNTH-PRG-CHARLIE",
    phase: 3,
    workflow_step_id: "ppbe-coordination-SYNTH-CI-02",
  },
  {
    item_id: "SYNTH-CI-03",
    kind: "CALENDAR_OBLIGATION",
    description: "Submit the FY 2026 Q3 obligation summary to the comptroller",
    responsible_role: "COMPLIANCE_OFFICER",
    due_by: "2026-07-10T17:00:00Z", // overdue → MISSED_DEADLINE (P2)
    status: "OPEN",
    workflow_step_id: "ppbe-coordination-SYNTH-CI-03",
  },
  {
    item_id: "SYNTH-CI-04",
    kind: "DECISION_COMMITMENT",
    description: "Record the Phase 4 programming trade-off decision for the Supply Chain Telemetry program",
    responsible_role: "PROGRAM_MANAGER",
    due_by: "2026-07-08T17:00:00Z", // overdue → LAPSED_COMMITMENT (P2)
    status: "OPEN",
    program_id: "SYNTH-PRG-BRAVO",
    phase: 4,
    workflow_step_id: "ppbe-coordination-SYNTH-CI-04",
  },
  {
    item_id: "SYNTH-CI-05",
    kind: "PHASE_TRANSITION",
    description: "Complete the Depot Scheduling Pilot phase 4 to 5 handoff",
    responsible_role: "PROGRAM_MANAGER",
    due_by: "2026-07-06T17:00:00Z", // overdue → OVERDUE_PHASE_TRANSITION (P1)
    status: "OPEN",
    program_id: "SYNTH-PRG-ECHO",
    phase: 4,
    workflow_step_id: "ppbe-coordination-SYNTH-CI-05",
  },
  {
    item_id: "SYNTH-CI-06",
    kind: "ACTION_ITEM",
    description: "Publish the ranked strategic objectives to the portfolio workspace",
    responsible_role: "COMPLIANCE_OFFICER",
    due_by: "2026-06-20T17:00:00Z",
    status: "RESOLVED", // closed by a human before the clock of record
    workflow_step_id: "ppbe-coordination-SYNTH-CI-06",
  },
  {
    item_id: "SYNTH-CI-07",
    kind: "DECISION_COMMITMENT",
    description: "Decide the Legacy Sustainment Consolidation ceiling-relief request",
    responsible_role: "PROGRAM_MANAGER",
    due_by: "2026-07-24T17:00:00Z", // comfortably future
    status: "OPEN",
    program_id: "SYNTH-PRG-DELTA",
    phase: 5,
    workflow_step_id: "ppbe-coordination-SYNTH-CI-07",
  },
  {
    item_id: "SYNTH-CI-08",
    kind: "CALENDAR_OBLIGATION",
    description: "Convene the FY 2026 Q4 evaluation working group",
    responsible_role: "INDEPENDENT_REVIEWER",
    due_by: "2026-08-14T17:00:00Z", // comfortably future
    status: "OPEN",
    workflow_step_id: "ppbe-coordination-SYNTH-CI-08",
  },
];

/**
 * The realistic notes corpus the coordination digest reads. Three notes, the
 * way people actually write them — partial references, roles not ids, status
 * claims of varying reliability.
 */
export const SYNTH_PPBE_MEETING_NOTES = `
SYNTH PPBE portfolio standup — Monday July 13, 2026 (notes by the SYNTH coordination secretary)

Present: portfolio lead, telemetry PM, retrofit analyst (by phone), comptroller liaison.

Telemetry (BRAVO): the PM reports the Phase 2 evidence base is DONE — assembled and filed
to the program record Friday afternoon. Says the delayed supplier agreement finally signed
on the 9th, which also explains the slow Q3 obligations. The Phase 4 trade-off decision was
discussed again at length; the PM wants one more scenario run from the analyst cell before
recording anything. No decision recorded yet.

Retrofit (CHARLIE): the unit-cost reconciliation is still open. The analyst assigned has not
reported since the July 2 sync — two meetings running. Portfolio lead will follow up
directly.

Comptroller liaison reminded the room the Q3 obligation summary was due Friday the 10th and
has not been submitted. Working on it "this week."

Depot pilot (ECHO): the 4-to-5 handoff remains held — the exhibit failed its certification
check and the over-obligation question is with the sustainment PEO. Separately the depot
scheduler team mentioned they are waiting on a data extract from the legacy maintenance
system before the next milestone — nobody around the table owns that handoff and it does
not appear on any tracker.

Ranked objectives publication (last month's action) was confirmed complete some time ago.

Next standup Monday the 20th.
`;

// ============================================================
// SEEDED PPBE TASKS — the NEXUS work-tracking view of the same
// portfolio, spread across the GD-11 lifecycle states.
// ============================================================

export const SYNTH_PPBE_TASKS: PPBETask[] = [
  {
    task_id: "SYNTH-TASK-01",
    title: "Assemble BRAVO Phase 2 evidence base",
    description: "Collect and validate the evaluation evidence for the telemetry program's planning review.",
    task_type: "EVIDENCE_ASSEMBLY",
    status: "COMPLETE",
    program_id: "SYNTH-PRG-BRAVO",
    objective_id: "SYNTH-SO-02",
    phase: 2,
    data_classification: "UNCLASSIFIED",
    requester_id: "SYNTH-E-201",
    created_at: "2026-06-15T09:00:00Z",
    updated_at: "2026-07-10T16:00:00Z",
    workflow_step_id: "nexus-ppbe-task-SYNTH-TASK-01",
  },
  {
    task_id: "SYNTH-TASK-02",
    title: "Prepare the ALPHA FY 2026 budget exhibit",
    description: "Draft, certify, and route the interchange program's budget exhibit for export.",
    task_type: "EXHIBIT_PREPARATION",
    status: "IN_PROGRESS",
    program_id: "SYNTH-PRG-ALPHA",
    objective_id: "SYNTH-SO-01",
    phase: 4,
    data_classification: "UNCLASSIFIED",
    requester_id: "SYNTH-E-201",
    created_at: "2026-06-28T09:00:00Z",
    updated_at: "2026-07-09T11:00:00Z",
    workflow_step_id: "nexus-ppbe-task-SYNTH-TASK-02",
  },
  {
    task_id: "SYNTH-TASK-03",
    title: "Review ECHO over-obligation finding",
    description: "Route the depot pilot's ceiling exceedance for evaluation review and a finding response decision.",
    task_type: "EVALUATION_REVIEW",
    status: "PENDING_APPROVAL",
    program_id: "SYNTH-PRG-ECHO",
    objective_id: "SYNTH-SO-03",
    phase: 6,
    data_classification: "UNCLASSIFIED",
    requester_id: "SYNTH-E-202",
    created_at: "2026-07-06T09:00:00Z",
    updated_at: "2026-07-12T10:00:00Z",
    workflow_step_id: "nexus-ppbe-task-SYNTH-TASK-03",
  },
  {
    task_id: "SYNTH-TASK-04",
    title: "Coordinate the Q3 obligation summary submission",
    description: "Track the comptroller submission called for by the governance calendar.",
    task_type: "COORDINATION_ITEM",
    status: "SUBMITTED",
    program_id: "SYNTH-PRG-DELTA",
    objective_id: "SYNTH-SO-03",
    phase: 5,
    data_classification: "UNCLASSIFIED",
    requester_id: "SYNTH-E-202",
    created_at: "2026-07-11T09:00:00Z",
    updated_at: "2026-07-11T09:00:00Z",
    workflow_step_id: "nexus-ppbe-task-SYNTH-TASK-04",
  },
];
