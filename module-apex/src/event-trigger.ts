/**
 * SOVEREIGN Platform — module-apex
 * event-trigger.ts — the PPBE event-driven report trigger STUB (spec §17.2 Commitment 4).
 *
 * APEX today is user-initiated: a human requests a report and APEX generates it. The PPBE
 * Integration Architecture specifies that a PPBE_EVALUATION_FINDING event must one day trigger
 * an APEX exception report (an event-driven path). That path does not exist yet — PPBE
 * governance decisions D-P1..D-P6 are not made and no PPBE entities/agents are registered.
 *
 * This stub provides the subscription seam now so PPBE Phase II is a fill-in, not a rewrite:
 * it receives an inbound event, logs APEX_EVENT_RECEIVED (with the source event type and the
 * workflow_step_id, Constraint #6), and returns WITHOUT action, recording a deferral note.
 * NO PPBE logic is implemented here.
 *
 * Version: 1.0 · Session 17 · June 25, 2026
 */

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";

export interface ApexEventTriggerResult {
  received: true;
  deferred: true;
  note: string;
}

const DEFERRAL_NOTE =
  "PPBE_EVALUATION_FINDING handling deferred — PPBE Phase II integration required";

/**
 * Receive an inbound event (e.g. PPBE_EVALUATION_FINDING, once that event type exists in the
 * Logger). Logs receipt and defers — no report is generated. The event subscription
 * infrastructure is in place; only the handler body is deferred to PPBE Phase II.
 */
export function receiveInboundEvent(
  sourceEventType: string,
  workflowStepId: string,
  log: (event: SovereignLogEvent) => void,
  actorId = "apex.report-generator"
): ApexEventTriggerResult {
  log({
    event_type: "APEX_EVENT_RECEIVED",
    workflow_step_id: workflowStepId, // Constraint #6
    sovereign_tier: "standard",
    product: "APEX",
    actor_id: actorId,
    outcome: "apex_event_received_deferred",
    payload: {
      source_event_type: sourceEventType,
      deferred: true,
      note: DEFERRAL_NOTE,
    },
  });
  return { received: true, deferred: true, note: DEFERRAL_NOTE };
}
