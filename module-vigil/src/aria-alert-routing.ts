/**
 * SOVEREIGN Platform — module-vigil
 * aria-alert-routing.ts — CLEAR → VIGIL alert routing adapter (Stage 6, Session 23 · D5).
 *
 * ARIA Suite's CLEAR component routes two of its Logger events to the VIGIL Alert Queue
 * for human operator response:
 *   - ARIA_VIOLATION_FLAGGED → a compliance deviation (the affected output, the applicable
 *     regulation, and the violation detail).
 *   - ARIA_CALENDAR_ALERT    → a governance-calendar timing violation (the deadline, the
 *     elapsed overdue time, and the affected phase or commitment).
 *
 * GOVERNANCE (Constraint #2 / no VIGIL schema change beyond sourceProduct): this adapter
 * maps each ARIA event onto the EXISTING VIGIL `AlertType` union and the existing
 * `SecurityAlert` shape — it adds NO new alert type and NO new field. The only product-
 * specific marker is `sourceProduct: "ARIA"` (already legal — "ARIA" is in SovereignProduct).
 * A regulatory violation maps to THRESHOLD_BREACH (a rule/threshold breached); a calendar
 * timing violation maps to CASCADE_RISK (a missed governance deadline risks downstream
 * cascade — docs/16 §4/§6). The ARIA detail rides in the opaque `rawEvent` the existing
 * AlertDetail surface already renders.
 *
 * In the live platform the Security Framework's Alert Dispatcher performs this mapping when
 * it receives the ARIA Logger events; this session VIGIL seeds the demo ARIA alerts on its
 * synthetic/dev backing (VIGIL_ALERT_ENDPOINT is null), the same pattern as the approval port.
 *
 * Version: 1.0 · Session 23 (D5) · June 29, 2026
 */

import { alertWorkflowStep, type AlertLevel, type SecurityAlert } from "./vigil-types";

const ARIA_RULES_ENGINE_AGENT_ID = "aria.rules-engine";

/** A CLEAR compliance violation routed to VIGIL (from an ARIA_VIOLATION_FLAGGED event). */
export interface AriaViolationAlertInput {
  kind: "violation";
  /** Stable id for the violation (e.g. the document_id it concerns). */
  referenceId: string;
  alertLevel: AlertLevel;
  /** Plain-prose violation detail. */
  detail: string;
  /** The applicable regulation (e.g. "Anti-Deficiency Act"). */
  applicableRegulation: string;
  /** The affected output or process. */
  affectedOutput: string;
  /** ISO 8601 — when CLEAR surfaced the deviation. */
  timestamp: string;
}

/** A CLEAR governance-calendar timing violation routed to VIGIL (from an ARIA_CALENDAR_ALERT event). */
export interface AriaCalendarAlertInput {
  kind: "calendar";
  /** Stable id for the calendar commitment. */
  referenceId: string;
  alertLevel: AlertLevel;
  /** ISO 8601 deadline that was (or is about to be) missed. */
  deadline: string;
  /** Plain-prose elapsed overdue time, e.g. "4 days overdue". */
  elapsedOverdue: string;
  /** The affected PPBE phase or commitment. */
  affectedCommitment: string;
  /** ISO 8601 — when CLEAR surfaced the timing violation. */
  timestamp: string;
}

export type AriaAlertInput = AriaViolationAlertInput | AriaCalendarAlertInput;

/**
 * Convert one CLEAR alert descriptor into a VIGIL SecurityAlert (existing shape). The ARIA
 * detail is preserved in `rawEvent` so AlertDetail can surface it; `sourceProduct` is "ARIA"
 * so the operator can identify the source. No new AlertType, no new field.
 */
export function ariaAlertToSecurityAlert(input: AriaAlertInput): SecurityAlert {
  if (input.kind === "violation") {
    const alertId = `aria-violation-${input.referenceId}`;
    return {
      alertId,
      alertLevel: input.alertLevel,
      alertType: "THRESHOLD_BREACH",
      sourceProduct: "ARIA",
      agentId: ARIA_RULES_ENGINE_AGENT_ID,
      timestamp: input.timestamp,
      status: "UNACKNOWLEDGED",
      rawEvent: {
        event_type: "ARIA_VIOLATION_FLAGGED",
        workflow_step_id: alertWorkflowStep(alertId),
        detail: input.detail,
        applicable_regulation: input.applicableRegulation,
        affected_output: input.affectedOutput,
        reference_id: input.referenceId,
      },
    };
  }
  const alertId = `aria-calendar-${input.referenceId}`;
  return {
    alertId,
    alertLevel: input.alertLevel,
    alertType: "CASCADE_RISK",
    sourceProduct: "ARIA",
    agentId: ARIA_RULES_ENGINE_AGENT_ID,
    timestamp: input.timestamp,
    status: "UNACKNOWLEDGED",
    rawEvent: {
      event_type: "ARIA_CALENDAR_ALERT",
      workflow_step_id: alertWorkflowStep(alertId),
      deadline: input.deadline,
      elapsed_overdue: input.elapsedOverdue,
      affected_commitment: input.affectedCommitment,
      reference_id: input.referenceId,
    },
  };
}

/** Convenience: map a batch of CLEAR alert descriptors to VIGIL alerts. */
export function ariaAlertsToSecurityAlerts(inputs: AriaAlertInput[]): SecurityAlert[] {
  return inputs.map(ariaAlertToSecurityAlert);
}

// ── Synthetic demo CLEAR alerts (Governance Clock OFF — synthetic/dev backing) ──────────
export const DEMO_ARIA_ALERTS: SecurityAlert[] = ariaAlertsToSecurityAlerts([
  {
    kind: "violation",
    referenceId: "DOC-OBL-Q3",
    alertLevel: "P1",
    detail: "An obligation is not covered by available budget authority (potential over-obligation).",
    applicableRegulation: "Anti-Deficiency Act",
    affectedOutput: "Q3 Obligation Summary",
    timestamp: "2026-06-29T13:05:00.000Z",
  },
  {
    kind: "calendar",
    referenceId: "CAL-PROG-XSN",
    alertLevel: "P2",
    deadline: "2026-06-25",
    elapsedOverdue: "4 days overdue",
    affectedCommitment: "Programming phase transition",
    timestamp: "2026-06-29T13:06:00.000Z",
  },
]);
