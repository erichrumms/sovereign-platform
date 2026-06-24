/**
 * SOVEREIGN Platform — module-agentos
 * approval-port.ts — the AgentOS implementation of VIGIL's Agent Approval port.
 *
 * Session 10 built VIGIL's Agent Approval Queue against an INJECTABLE AgentApprovalPort
 * (`module-vigil/src/approval-port.ts` — interface `{ listPending() }`) with a synthetic
 * dev backing. Session 14 provides the AgentOS-side implementation of that port, closing
 * the A2A loop: VIGIL reads pending requests through `listPending()`; AgentOS produces them
 * via `submitRequest()` and reads the operator's decision back via `getDecision()`. This is
 * configuration, not a rewrite — VIGIL is unchanged (Standing Constraint #3).
 *
 * RECONCILIATION (surfaced, like Session 13 §6): the architecture sketch (11_AgentOS §3.5)
 * shows the port as `{ submitRequest, getDecision }`. VIGIL's ACTUAL injectable interface
 * is `AgentApprovalPort = { listPending }`. AgentOSApprovalPort implements VIGIL's real
 * interface AND adds the AgentOS-side submit/poll methods, so both shapes are honored.
 * The port is PURE data plumbing — it emits no Logger event; AGENTOS_APPROVAL_REQUESTED is
 * emitted by the task registry on the ASSIGNED → PENDING_APPROVAL transition (single source).
 *
 * Version: 1.0 · Session 14 · June 24, 2026
 */

import type { AgentApprovalRequest } from "../../module-vigil/src/approval-contract";
import type { AgentApprovalPort } from "../../module-vigil/src/approval-port";

/** The state of a submitted approval request from AgentOS's perspective. */
export type ApprovalDecisionState = "pending" | "approved" | "rejected";

/**
 * AgentOS side of the VIGIL approval loop. Extends VIGIL's injectable AgentApprovalPort
 * (listPending — what VIGIL's queue reads) with the AgentOS production / consumption
 * methods. VIGIL injects an instance of this where it previously used createDevApprovalPort.
 */
export interface AgentOSApprovalPort extends AgentApprovalPort {
  /** AgentOS submits an approval request for a task requiring human authorization. */
  submitRequest: (request: AgentApprovalRequest) => void;
  /** AgentOS polls VIGIL's decision for a request (pending until the operator decides). */
  getDecision: (requestId: string) => ApprovalDecisionState;
  /**
   * Dev/test seam: simulate VIGIL recording an operator decision back to AgentOS. In
   * production this is driven by VIGIL's operator action; here it is the injectable hook
   * the dispatcher panel / tests use to advance the loop (Governance Clock OFF — synthetic).
   */
  recordDecision: (requestId: string, decision: "approved" | "rejected") => void;
}

/**
 * The default AgentOS approval port — in-memory, synthetic/dev (Governance Clock OFF).
 * VIGIL reads listPending(); AgentOS submits and polls. A decided request drops out of
 * listPending(). Replace by injecting a live transport when AgentOS↔VIGIL A2A is wired
 * (configuration change, Constraint #3).
 */
export function createAgentOSApprovalPort(): AgentOSApprovalPort {
  const pending = new Map<string, AgentApprovalRequest>();
  const decisions = new Map<string, ApprovalDecisionState>();

  return {
    submitRequest: (request: AgentApprovalRequest): void => {
      pending.set(request.request_id, request);
      decisions.set(request.request_id, "pending");
    },
    listPending: (): AgentApprovalRequest[] =>
      [...pending.values()].filter((r) => decisions.get(r.request_id) === "pending"),
    getDecision: (requestId: string): ApprovalDecisionState => decisions.get(requestId) ?? "pending",
    recordDecision: (requestId: string, decision: "approved" | "rejected"): void => {
      if (pending.has(requestId)) decisions.set(requestId, decision);
    },
  };
}
