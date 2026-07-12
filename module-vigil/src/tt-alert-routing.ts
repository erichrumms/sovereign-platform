/**
 * SOVEREIGN Platform — module-vigil
 * tt-alert-routing.ts — Time & Travel → VIGIL alert/approval routing adapter
 * (Session 28, D3). Closes the Session 27 Hard Stop §6.1.
 *
 * GOVERNANCE — TT-PRODUCT-GD, DECIDED Option 2 (Session 28 opening prompt §3):
 * Time & Travel alerts attribute `sourceProduct` to their HOST product, NOT to a
 * dedicated "TIME_TRAVEL" SovereignProduct value (which does not exist and is not
 * being added). CONFIRMED ATTRIBUTION: the alert-raising code path is
 * tt.escalation-monitor, hosted in module-vigil (docs/17 §2 / AIS D-TT5), so every
 * TT alert carries `sourceProduct: "VIGIL"` — already legal, the exact ARIA adapter
 * precedent (aria-alert-routing.ts, sourceProduct "ARIA"). The TT-specific detail
 * (including the Python-taxonomy TT_* event name) rides in the opaque `rawEvent`
 * the existing AlertDetail surface already renders. No new AlertType, no new field,
 * no VIGIL schema change.
 *
 * Two routing surfaces (docs/17 §7):
 *   - Alert Queue: TT_ESCALATION_ROUTED (P2 THRESHOLD_BREACH — a recurrence
 *     threshold breached), TT_BUDGET_EXHAUSTION (P1 THRESHOLD_BREACH), and
 *     TT_AUDIT_DEADLINE (P2 CASCADE_RISK — the ARIA calendar precedent).
 *   - Agent Approval Queue (Tier B): a formal escalation communication requires
 *     manager authorization BEFORE it is sent — routed as an AgentApprovalRequest
 *     from tt.escalation-monitor. The send gate itself is tt-escalation-gate.ts.
 *
 * Version: 1.0 · Session 28 · July 12, 2026
 */

import { alertWorkflowStep, type AlertLevel, type SecurityAlert } from "./vigil-types";
import { computeExpiresAt, type AgentApprovalRequest } from "./approval-contract";
import { TT_ESCALATION_MONITOR_AGENT_ID, type EscalationDecision } from "./tt-escalation-monitor";

/** A formal escalation routed to the queue (from a TT_ESCALATION_ROUTED event). */
export interface TTEscalationAlertInput {
  kind: "escalation";
  /** Stable id for the escalation case (e.g. the ComplianceFlag id it concerns). */
  referenceId: string;
  decision: EscalationDecision;
  /** ISO 8601 — when the monitor routed the escalation. */
  timestamp: string;
}

/** A charge account at zero remaining budget (from a TT_BUDGET_EXHAUSTION event). P1. */
export interface TTBudgetExhaustionAlertInput {
  kind: "budget_exhaustion";
  /** The exhausted charge account's cost_code. */
  referenceId: string;
  /** Plain-prose detail (account, program). */
  detail: string;
  timestamp: string;
}

/** Period close approaching with unresolved flags (from a TT_AUDIT_DEADLINE event). */
export interface TTAuditDeadlineAlertInput {
  kind: "audit_deadline";
  /** The closing period, e.g. "2026-07-06/2026-07-10". */
  referenceId: string;
  /** ISO 8601 period-close deadline. */
  deadline: string;
  unresolvedFlagCount: number;
  timestamp: string;
}

export type TTAlertInput =
  | TTEscalationAlertInput
  | TTBudgetExhaustionAlertInput
  | TTAuditDeadlineAlertInput;

const ESCALATION_LEVEL: AlertLevel = "P2";

/**
 * Convert one TT alert descriptor into a VIGIL SecurityAlert (existing shape).
 * sourceProduct is "VIGIL" per TT-PRODUCT-GD Option 2 — see the header. The TT
 * detail (including the Python-taxonomy event name) is preserved in rawEvent.
 */
export function ttAlertToSecurityAlert(input: TTAlertInput): SecurityAlert {
  if (input.kind === "escalation") {
    const alertId = `tt-escalation-${input.referenceId}`;
    return {
      alertId,
      alertLevel: ESCALATION_LEVEL,
      alertType: "THRESHOLD_BREACH",
      sourceProduct: "VIGIL",
      agentId: TT_ESCALATION_MONITOR_AGENT_ID,
      timestamp: input.timestamp,
      status: "UNACKNOWLEDGED",
      rawEvent: {
        event_type: "TT_ESCALATION_ROUTED",
        workflow_step_id: alertWorkflowStep(alertId),
        employee_id: input.decision.employee_id,
        rule_category: input.decision.rule_category,
        recurrence_count: input.decision.recurrence_count,
        communication_type: input.decision.communication_type,
        reference_id: input.referenceId,
      },
    };
  }
  if (input.kind === "budget_exhaustion") {
    const alertId = `tt-budget-${input.referenceId}`;
    return {
      alertId,
      alertLevel: "P1", // docs/17 §7 — budget exhaustion is a P1 alert
      alertType: "THRESHOLD_BREACH",
      sourceProduct: "VIGIL",
      agentId: TT_ESCALATION_MONITOR_AGENT_ID,
      timestamp: input.timestamp,
      status: "UNACKNOWLEDGED",
      rawEvent: {
        event_type: "TT_BUDGET_EXHAUSTION",
        workflow_step_id: alertWorkflowStep(alertId),
        detail: input.detail,
        reference_id: input.referenceId,
      },
    };
  }
  const alertId = `tt-audit-deadline-${input.referenceId}`;
  return {
    alertId,
    alertLevel: "P2",
    alertType: "CASCADE_RISK", // the ARIA calendar precedent — a missed deadline cascades
    sourceProduct: "VIGIL",
    agentId: TT_ESCALATION_MONITOR_AGENT_ID,
    timestamp: input.timestamp,
    status: "UNACKNOWLEDGED",
    rawEvent: {
      event_type: "TT_AUDIT_DEADLINE",
      workflow_step_id: alertWorkflowStep(alertId),
      deadline: input.deadline,
      unresolved_flag_count: input.unresolvedFlagCount,
      reference_id: input.referenceId,
    },
  };
}

/** Convenience: map a batch of TT alert descriptors to VIGIL alerts. */
export function ttAlertsToSecurityAlerts(inputs: TTAlertInput[]): SecurityAlert[] {
  return inputs.map(ttAlertToSecurityAlert);
}

/**
 * Route a formal escalation into the VIGIL Agent Approval Queue (Tier B — docs/17
 * §7): the manager must authorize the escalation communication BEFORE it is sent.
 * The request rides the EXISTING AgentApprovalRequest shape via the injectable
 * approval port — no schema change. Risk P2 (60-minute window, spec §4.1). The
 * drafted communication is carried in action_detail so the approval brief and the
 * operator both see exactly what would be sent.
 */
export function ttEscalationToApprovalRequest(
  decision: EscalationDecision,
  draft: { subject?: string; body: string },
  referenceId: string,
  submittedAtIso: string
): AgentApprovalRequest {
  const requestId = `tt-escalation-${referenceId}`;
  return {
    request_id: requestId,
    requesting_agent_id: TT_ESCALATION_MONITOR_AGENT_ID,
    requesting_agent_class: "Monitoring",
    action_type: "send_formal_escalation_notice",
    action_detail: {
      employee_id: decision.employee_id,
      rule_category: decision.rule_category,
      recurrence_count: decision.recurrence_count,
      communication_type: decision.communication_type,
      draft_subject: draft.subject ?? null,
      draft_body: draft.body,
    },
    risk_classification: "P2",
    submitted_at: submittedAtIso,
    expires_at: computeExpiresAt(submittedAtIso, "P2"),
    workflow_step_id: `vigil-approval-${requestId}`,
    context:
      `Formal escalation for ${decision.employee_id}: ${decision.rule_category} recurred ` +
      `${decision.recurrence_count} time(s) in the rolling window. The drafted notice is in ` +
      `action_detail. Authorization is required before the communication is sent (docs/17 §7 Tier B).`,
  };
}
