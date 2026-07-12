/**
 * SOVEREIGN Platform — module-vigil
 * tt-synthetic-alerts.ts — seeded Time & Travel alerts + approval item (Session 29, D3).
 *
 * Walkthrough E finding WE-5: VIGIL's queues held only ARIA alerts and generic
 * AgentOS approval items — zero Time & Travel presence, so the escalation
 * authorization path (docs/17 §7 Tier B) could not be inspected. This file
 * seeds all three TT alert kinds through the REAL Session 28 adapter
 * (tt-alert-routing.ts — TT-PRODUCT-GD Option 2: sourceProduct "VIGIL", TT_*
 * names only inside rawEvent) plus one TT formal-escalation approval request.
 *
 * Same sanctioned dev path as DEMO_ARIA_ALERTS (useAlertQueue.initialAlerts):
 * seeds enter WITHOUT Logger emission. ALL SYNTHETIC (SYNTH- ids), matching the
 * canonical @sovereign/data TT seed records (SYNTH-TM-205 / SYNTH-CC-4001).
 *
 * The approval request is built against a RUNTIME anchor timestamp
 * (makeDemoTTApprovalRequest) — a fixed submitted_at would arrive pre-expired
 * and be auto-rejected by VigilApp's expireOverdue pass on mount.
 *
 * Version: 1.0 · Session 29 · July 12, 2026
 */

import type { SecurityAlert } from "./vigil-types";
import type { AgentApprovalRequest } from "./approval-contract";
import type { EscalationDecision } from "./tt-escalation-monitor";
import { ttAlertsToSecurityAlerts, ttEscalationToApprovalRequest } from "./tt-alert-routing";

/** The SYNTH-TM-205 case: missing hours, third occurrence — formal escalation. */
export const DEMO_TT_ESCALATION_DECISION: EscalationDecision = {
  employee_id: "SYNTH-E-205",
  rule_category: "MISSING_HOURS",
  recurrence_count: 3,
  communication_type: "FORMAL_ESCALATION",
  requires_vigil_authorization: true,
};

/** All three TT alert kinds (docs/17 §7), through the real Session 28 adapter. */
export const DEMO_TT_ALERTS: SecurityAlert[] = ttAlertsToSecurityAlerts([
  {
    kind: "escalation",
    referenceId: "SYNTH-TM-205-F1",
    decision: DEMO_TT_ESCALATION_DECISION,
    timestamp: "2026-06-26T17:45:00.000Z",
  },
  {
    kind: "budget_exhaustion",
    referenceId: "SYNTH-CC-4001",
    detail:
      "Charge account SYNTH-CC-4001 (Integration Test — Direct, program P-150) is at zero remaining budget.",
    timestamp: "2026-06-26T12:00:00.000Z",
  },
  {
    kind: "audit_deadline",
    referenceId: "SYNTH-PP-2026-06-26", // the June 22–26 pay period, SYNTH- marked
    deadline: "2026-07-03T00:00:00.000Z",
    unresolvedFlagCount: 4,
    timestamp: "2026-06-29T09:00:00.000Z",
  },
]);

/**
 * The TT formal-escalation approval request for the Agent Approval Queue
 * (Tier B). anchorIso must be the mount-time timestamp so the P2 window is live.
 */
export function makeDemoTTApprovalRequest(anchorIso: string): AgentApprovalRequest {
  return ttEscalationToApprovalRequest(
    DEMO_TT_ESCALATION_DECISION,
    {
      subject: "Formal notice — recurring time record compliance issue",
      body:
        "This is a formal notice regarding the time record for June 22–26: no hours were " +
        "recorded for June 24, the third occurrence of missing hours in the current review " +
        "window (Timekeeping Policy, complete daily recording). Per the recurring-issue " +
        "procedure this notice is copied to the supervisor. Correction is required before " +
        "period close on July 3.",
    },
    "SYNTH-TM-205-F1",
    anchorIso
  );
}
