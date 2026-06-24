/**
 * SOVEREIGN Platform — module-agentos
 * useAgentDispatcher.ts — the agent-dispatcher hook (approval-port wiring).
 *
 * Holds the AgentOS approval port instance (the live implementation of VIGIL's
 * AgentApprovalPort) and drives synthetic dispatch: select an agent, build the assignment,
 * and — when the task requires approval — submit the AgentApprovalRequest to VIGIL through
 * the port. Enforces the GD-10 classification boundary; an unauthorized classification
 * surfaces ClassificationNotAuthorizedError's message and dispatch is refused.
 *
 * This hook does NOT emit Logger events — the GD-9 events are emitted by useTaskRegistry on
 * the corresponding state transitions (single source of each event). The hook is the port
 * plumbing; the registry is the governed state machine.
 *
 * Version: 1.0 · Session 14 · June 24, 2026
 */

import { useCallback, useMemo, useState } from "react";

import { ClassificationNotAuthorizedError } from "@sovereign/api-client";

import type { Task } from "./agentos-contract";
import {
  selectAgentForTask,
  buildAssignment,
  buildApprovalRequest,
  type SyntheticDispatchAgent,
} from "./agent-dispatcher";
import {
  createAgentOSApprovalPort,
  type AgentOSApprovalPort,
  type ApprovalDecisionState,
} from "./approval-port";
import type { AgentApprovalRequest } from "../../module-vigil/src/approval-contract";
import type { AgentAssignment } from "./agentos-contract";

export interface DispatchResult {
  agent: SyntheticDispatchAgent;
  assignment: AgentAssignment;
  /** Present only when the task requires approval — the request submitted to VIGIL. */
  approvalRequest?: AgentApprovalRequest;
}

export interface UseAgentDispatcher {
  /** The AgentOS approval port — VIGIL reads listPending(); AgentOS submits / polls. */
  port: AgentOSApprovalPort;
  error: string | null;
  /**
   * Select an agent and build the assignment; if the task requires approval, submit an
   * AgentApprovalRequest to VIGIL via the port. Enforces GD-10 — returns null and sets the
   * error for an unauthorized classification (no assignment, no request submitted).
   */
  dispatch: (task: Task) => DispatchResult | null;
  pendingRequests: () => AgentApprovalRequest[];
  decisionFor: (requestId: string) => ApprovalDecisionState;
  /** Dev/test seam — simulate VIGIL recording an operator decision back to AgentOS. */
  recordDecision: (requestId: string, decision: "approved" | "rejected") => void;
  clearError: () => void;
}

export function useAgentDispatcher(): UseAgentDispatcher {
  const port = useMemo<AgentOSApprovalPort>(() => createAgentOSApprovalPort(), []);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useCallback(
    (task: Task): DispatchResult | null => {
      setError(null);
      try {
        const agent = selectAgentForTask(task);
        const nowIso = new Date().toISOString();
        const assignment = buildAssignment(task, agent, nowIso); // GD-10 guard inside
        if (task.requires_approval) {
          const approvalRequest = buildApprovalRequest(task, agent, nowIso);
          port.submitRequest(approvalRequest);
          return { agent, assignment, approvalRequest };
        }
        return { agent, assignment };
      } catch (err) {
        setError(
          err instanceof ClassificationNotAuthorizedError
            ? err.message
            : err instanceof Error
              ? err.message
              : String(err)
        );
        return null;
      }
    },
    [port]
  );

  const pendingRequests = useCallback((): AgentApprovalRequest[] => port.listPending(), [port]);
  const decisionFor = useCallback((requestId: string): ApprovalDecisionState => port.getDecision(requestId), [port]);
  const recordDecision = useCallback(
    (requestId: string, decision: "approved" | "rejected"): void => port.recordDecision(requestId, decision),
    [port]
  );
  const clearError = useCallback((): void => setError(null), []);

  return { port, error, dispatch, pendingRequests, decisionFor, recordDecision, clearError };
}
