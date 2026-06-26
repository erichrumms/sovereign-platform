/**
 * SOVEREIGN Platform — module-nexus
 * useRequestRegistry.ts — the work-request registry hook (state + Logger + AgentOS port).
 *
 * Owns the WorkRequest[] state and drives every lifecycle transition through the pure
 * request-registry, emitting the GD-11 NEXUS_* event for each. Every event carries the
 * request's workflow_step_id (Standing Constraint #6). NEXUS records the OUTCOMES of VIGIL
 * decisions (routed via AgentOS) as lifecycle status events — none carry decision_type
 * (the human approval is logged by VIGIL/AgentOS with TASK_APPROVAL); GD-11 adds no
 * HumanDecisionType.
 *
 * GD-10: the classification boundary is enforced at INTAKE — a request above UNCLASSIFIED
 * is refused (ClassificationNotAuthorizedError), reusing the api-client rule (no divergent
 * copy, Constraints #1 / #2). Gate 2 (fail-closed): the Logger event is emitted before the
 * state changes; a failed emit blocks the transition. Ref-backed for synchronous chaining
 * (Strict-Mode safe), mirroring module-agentos's useTaskRegistry.
 *
 * Version: 1.0 · Session 15 · June 24, 2026
 */

import { useCallback, useRef, useState } from "react";

import { assertClassificationAuthorized, ClassificationNotAuthorizedError } from "@sovereign/api-client";

import type { SovereignShellContext, SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import {
  type WorkRequest,
  type WorkRequestStatus,
  type SubmitRequestInput,
  eventTypeForStatus,
} from "./nexus-contract";
import {
  createRequest,
  getRequest,
  transition,
  RequestTransitionError,
} from "./request-registry";
import { routeRequest } from "./request-router";
import { nexusAgentOSTaskId, type AgentOSPort } from "./agentos-port";

export interface UseRequestRegistry {
  requests: WorkRequest[];
  error: string | null;
  /** Intake — create a SUBMITTED request (GD-10 enforced here). */
  submit: (input: SubmitRequestInput) => void;
  /** SUBMITTED → ROUTED (router assigns agent class + approval requirement). */
  route: (requestId: string) => void;
  /** ROUTED → PENDING_APPROVAL (routed type requires approval). */
  sendForApproval: (requestId: string) => void;
  /** ROUTED → IN_PROGRESS (no-approval path) — hands execution to AgentOS. */
  startWork: (requestId: string) => void;
  /** PENDING_APPROVAL → IN_PROGRESS (approved outcome) — hands execution to AgentOS. */
  approveAndStart: (requestId: string) => void;
  /** PENDING_APPROVAL → REJECTED (rejected outcome). */
  reject: (requestId: string) => void;
  /** IN_PROGRESS → COMPLETE (AgentOS reports completion). */
  complete: (requestId: string) => void;
  /**
   * Allocate the next unique request id for the intake surface. Ref-backed and monotonic:
   * it advances synchronously on each call, so it never depends on the (lagging) `requests`
   * state. See the Gap 1 note on the counter in the hook body.
   */
  nextRequestId: () => string;
  clearError: () => void;
}

export function useRequestRegistry(ctx: SovereignShellContext, port: AgentOSPort): UseRequestRegistry {
  const requestsRef = useRef<WorkRequest[]>([]);
  const [requests, setRequestsState] = useState<WorkRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ── Gap 1 fix (Walkthrough A) — ref-backed monotonic request-id source. ──────────────
  // The intake panel previously derived the next id from `registry.requests.length + 1`,
  // i.e. from React STATE, which lags a render behind the hook's synchronously-updated
  // `requestsRef`. A fast double-submit (the operator clicks Submit twice before the Intake
  // panel re-renders — easy to do because the freshly submitted row only shows on the Queue
  // tab) computed the SAME id twice; the idempotency guard in `submit()` then silently
  // dropped the second one. To the operator the form "submitted and cleared" but nothing
  // appeared in the queue. Owning id allocation in the hook via a ref counter removes the
  // stale-state dependency: each call advances immediately, so ids never collide.
  const idCounterRef = useRef(0);
  const nextRequestId = useCallback((): string => `req-${(idCounterRef.current += 1)}`, []);

  const operatorId = ctx.auth.user.employee_id;

  const commit = useCallback((next: WorkRequest[]): void => {
    requestsRef.current = next;
    setRequestsState(next);
  }, []);

  /** Intake — GD-10 boundary first, then create SUBMITTED with a Gate-2 fail-closed emit. */
  const submit = useCallback(
    (input: SubmitRequestInput): void => {
      setError(null);
      // GD-10 — refuse an unauthorized classification at intake (reuses the api-client rule).
      try {
        assertClassificationAuthorized(input.data_classification);
      } catch (err) {
        if (err instanceof ClassificationNotAuthorizedError) {
          setError(err.message);
          return;
        }
        throw err;
      }
      if (getRequest(requestsRef.current, input.request_id)) return; // idempotent by id

      const nowIso = new Date().toISOString();
      const request = createRequest(input, nowIso);
      const event: SovereignLogEvent = {
        event_type: eventTypeForStatus("SUBMITTED"),
        workflow_step_id: request.workflow_step_id, // Constraint #6
        sovereign_tier: "standard",
        product: "NEXUS",
        actor_id: operatorId,
        outcome: "nexus_request_submitted",
        payload: { request_id: request.request_id, request_type: request.request_type, status: "SUBMITTED", data_classification: request.data_classification },
      };
      try {
        ctx.logger.log(event);
      } catch (err) {
        setError(intakeEmitError(err));
        return; // unlogged intake refused (Gate 2)
      }
      commit([...requestsRef.current, request]);
    },
    [commit, ctx, operatorId]
  );

  /**
   * Run one transition with the Gate-2 fail-closed rule: validate, emit the GD-11 event
   * first; if it throws, set the error and leave state untouched; else commit.
   */
  const runTransition = useCallback(
    (
      requestId: string,
      to: WorkRequestStatus,
      patch: Partial<WorkRequest> = {},
      extraPayload: Record<string, unknown> = {}
    ): void => {
      setError(null);
      const request = getRequest(requestsRef.current, requestId);
      if (!request) {
        setError(`NEXUS request not found: ${requestId}`);
        return;
      }
      // canTransition is enforced inside transition(); pre-check keeps the emit honest.
      const nowIso = new Date().toISOString();
      const event: SovereignLogEvent = {
        event_type: eventTypeForStatus(to),
        workflow_step_id: request.workflow_step_id, // Constraint #6
        sovereign_tier: "standard",
        product: "NEXUS",
        actor_id: operatorId,
        outcome: `nexus_request_${to.toLowerCase()}`,
        payload: {
          request_id: requestId,
          request_type: request.request_type,
          from: request.status,
          to,
          data_classification: request.data_classification,
          ...extraPayload,
        },
      };

      // --- Gate 2 fail-closed: emit first; a failed emit blocks the transition. ---
      try {
        ctx.logger.log(event);
      } catch (err) {
        setError(transitionEmitError(to, err));
        return;
      }

      try {
        commit(transition(requestsRef.current, requestId, to, nowIso, patch));
      } catch (err) {
        setError(err instanceof RequestTransitionError ? err.message : String(err));
      }
    },
    [commit, ctx, operatorId]
  );

  const route = useCallback(
    (requestId: string): void => {
      const request = getRequest(requestsRef.current, requestId);
      if (!request) {
        setError(`NEXUS request not found: ${requestId}`);
        return;
      }
      const decision = routeRequest(request.request_type);
      runTransition(requestId, "ROUTED", { assigned_agent_class: decision.agent_class, requires_approval: decision.requires_approval }, { agent_class: decision.agent_class, requires_approval: decision.requires_approval });
    },
    [runTransition]
  );

  const sendForApproval = useCallback((requestId: string) => runTransition(requestId, "PENDING_APPROVAL"), [runTransition]);

  /** Hand execution to AgentOS (port.submitTask) on the way into IN_PROGRESS. */
  const enterInProgress = useCallback(
    (requestId: string): void => {
      const request = getRequest(requestsRef.current, requestId);
      if (!request) {
        setError(`NEXUS request not found: ${requestId}`);
        return;
      }
      const taskId = nexusAgentOSTaskId(requestId);
      runTransition(requestId, "IN_PROGRESS", { agentos_task_id: taskId }, { agentos_task_id: taskId });
      // Only hand to AgentOS if the transition actually committed (status now IN_PROGRESS).
      if (getRequest(requestsRef.current, requestId)?.status === "IN_PROGRESS") {
        port.submitTask({
          request_id: requestId,
          request_type: request.request_type,
          agent_class: request.assigned_agent_class ?? "Operational",
          requires_approval: request.requires_approval ?? false,
          data_classification: request.data_classification,
          workflow_step_id: request.workflow_step_id,
        });
      }
    },
    [runTransition, port]
  );

  const startWork = useCallback((requestId: string) => enterInProgress(requestId), [enterInProgress]);
  const approveAndStart = useCallback((requestId: string) => enterInProgress(requestId), [enterInProgress]);
  const reject = useCallback((requestId: string) => runTransition(requestId, "REJECTED"), [runTransition]);
  const complete = useCallback((requestId: string) => runTransition(requestId, "COMPLETE"), [runTransition]);
  const clearError = useCallback((): void => setError(null), []);

  return { requests, error, submit, route, sendForApproval, startWork, approveAndStart, reject, complete, nextRequestId, clearError };
}

function intakeEmitError(err: unknown): string {
  return `Intake Logger emit failed — request not submitted (NEXUS Gate 2): ${err instanceof Error ? err.message : String(err)}`;
}
function transitionEmitError(to: WorkRequestStatus, err: unknown): string {
  return `Transition to ${to} Logger emit failed — request not advanced (NEXUS Gate 2): ${err instanceof Error ? err.message : String(err)}`;
}
