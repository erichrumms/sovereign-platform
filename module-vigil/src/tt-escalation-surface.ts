/**
 * SOVEREIGN Platform — module-vigil
 * tt-escalation-surface.ts — publish a TT formal-escalation authorization decision
 * to the shell's shared task surface (Session 35, cross-module state gap fix).
 *
 * THE GAP THIS CLOSES (open since Session 30's close): when a manager authorizes a
 * formal escalation in the VIGIL Agent Approval Queue, SCRIBE's manager-review queue
 * item for the same ComplianceFlag stays "Awaiting VIGIL authorization" until a
 * manual refresh — nothing tells SCRIBE the authorization happened.
 *
 * THE MECHANISM (GD-19, shell-contract v1.14): ctx.taskSurface exists precisely to
 * make one product's state change visible to another. This module mirrors the
 * established NEXUS → AgentOS pattern (nexus-agentos-port.ts): publish AFTER the
 * Logger emit succeeds, optional-chained so a partial test ctx without the ninth
 * export degrades gracefully. NO shell-contract change, NO new GD, NO new export —
 * the surface carries no governance authority (Constraint #1): the decision of
 * record is the AGENT_ACTION_* Logger event useApprovalDecision already emits;
 * publication only makes that decided state visible to SCRIBE.
 *
 * JOIN KEY: tt-alert-routing.ts builds the approval request with
 * request_id `tt-escalation-<referenceId>` where referenceId is the ComplianceFlag
 * id (e.g. SYNTH-TM-205-F1). SCRIBE review items key on flag.flag_id — the
 * published SharedTask carries the referenceId in origin_request_id so SCRIBE's
 * subscriber joins without parsing ids.
 *
 * ESCALATE is deliberately NOT published: escalating the request to the Project
 * Principal leaves the case undecided — SCRIBE's item must stay gated.
 *
 * Version: 1.0 · Session 35 · July 13, 2026
 */

import type { SharedTask, TaskSurface } from "../../sovereign-shell/shell-contract";
import type { AgentApprovalRequest } from "./approval-contract";
import { TT_ESCALATION_MONITOR_AGENT_ID } from "./tt-escalation-monitor";

/** The request_id prefix tt-alert-routing.ts stamps on TT escalation approval requests. */
export const TT_ESCALATION_REQUEST_PREFIX = "tt-escalation-";

/** The action_type tt-alert-routing.ts stamps on TT escalation approval requests. */
export const TT_ESCALATION_ACTION_TYPE = "send_formal_escalation_notice";

/** Whether an approval-queue request is a TT formal-escalation authorization (Tier B). */
export function isTTEscalationRequest(request: AgentApprovalRequest): boolean {
  return (
    request.action_type === TT_ESCALATION_ACTION_TYPE &&
    request.request_id.startsWith(TT_ESCALATION_REQUEST_PREFIX)
  );
}

/** The ComplianceFlag reference id the escalation request was routed for. */
export function escalationReferenceId(request: AgentApprovalRequest): string {
  return request.request_id.slice(TT_ESCALATION_REQUEST_PREFIX.length);
}

/**
 * Publish a decided TT escalation authorization to the shared task surface so
 * SCRIBE's manager-review queue can flip the matching item without a manual
 * refresh. No-op for non-TT requests and when the surface is absent (partial
 * test ctx — same degradation as the NEXUS port). Call ONLY after the decision's
 * Logger emit has succeeded (Gate 2: an unrecorded decision is not a decision,
 * so it must not become visible cross-module either).
 */
export function publishEscalationAuthorization(
  surface: TaskSurface | undefined,
  request: AgentApprovalRequest,
  action: "APPROVE" | "REJECT",
  decidedAtIso: string
): void {
  if (!surface || !isTTEscalationRequest(request)) return;
  const referenceId = escalationReferenceId(request);
  const task: SharedTask = {
    task_id: request.request_id,
    title: `Formal escalation authorization — ${referenceId}`,
    description:
      request.context ??
      `TT formal escalation ${referenceId}: manager authorization decision recorded in VIGIL.`,
    status: action === "APPROVE" ? "APPROVED" : "REJECTED",
    origin_product: "VIGIL",
    assigned_agent_id: TT_ESCALATION_MONITOR_AGENT_ID,
    requires_approval: true,
    data_classification: "UNCLASSIFIED",
    workflow_step_id: request.workflow_step_id,
    origin_request_id: referenceId,
    created_at: decidedAtIso,
    updated_at: decidedAtIso,
  };
  surface.publish(task);
}
