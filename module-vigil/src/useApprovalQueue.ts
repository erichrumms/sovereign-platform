/**
 * SOVEREIGN Platform — module-vigil
 * useApprovalQueue.ts — the Agent Approval Queue state (spec §4).
 *
 * Loads pending approval requests through the injectable AgentApprovalPort (synthetic/
 * dev backing this session — Constraint #3), sorts them P1-first then oldest-first
 * (spec §4.3), and handles expiry: a request past its window is automatically rejected
 * with an AGENT_ACTION_EXPIRED system-actor Logger event (spec §4.3 / §6) and removed
 * from the active queue. A decided request is removed via remove() once its decision is
 * recorded (useApprovalDecision).
 *
 * AGENT_ACTION_EXPIRED is a SYSTEM event (actor sof-approval-system, no decision_type) —
 * same posture as ALERT_RECEIVED in useAlertQueue. Like ingestion, a failed expiry emit
 * does not hide the expiry (the request IS expired): it still leaves the queue and the
 * emit failure is surfaced (expireError), never swallowed (Gate 2 — never silently continue).
 *
 * Version: 1.0 · Session 10 · June 23, 2026
 */

import { useCallback, useMemo, useState } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  approvalWorkflowStep,
  isExpired,
  RISK_ORDER,
  type AgentApprovalRequest,
} from "./approval-contract";
import { createDevApprovalPort, type AgentApprovalPort } from "./approval-port";

const SOF_APPROVAL_SYSTEM = "sof-approval-system";

export interface UseApprovalQueueOptions {
  /** Injectable port. Defaults to the synthetic/dev backing anchored at `anchorIso`. */
  port?: AgentApprovalPort;
  /** Anchor for the default dev port's synthetic submissions (ISO). */
  anchorIso?: string;
  /** Pre-seed the active queue directly (tests) — bypasses the port. */
  initialRequests?: AgentApprovalRequest[];
  /**
   * GD-27 (docs/25 §3) — starting value for the queue's existing selection state
   * (a navigation intent from ctx.navigateToModule). An id not in the queue
   * simply selects nothing, exactly as select() with an unknown id would.
   */
  initialSelectedId?: string;
}

export interface UseApprovalQueue {
  /** Active requests, sorted P1-first then oldest-first. */
  requests: AgentApprovalRequest[];
  selected: AgentApprovalRequest | null;
  selectedId: string | null;
  pendingCount: number;
  hasPendingP1: boolean;
  /** A surfaced expiry-emit failure, if any (not swallowed — Gate 2). */
  expireError: string | null;
  /** Auto-reject any overdue requests at `nowMs`, emitting AGENT_ACTION_EXPIRED. */
  expireOverdue: (nowMs: number) => string[];
  select: (requestId: string | null) => void;
  /** Remove a request once its decision is recorded. */
  remove: (requestId: string) => void;
}

function sortRequests(requests: readonly AgentApprovalRequest[]): AgentApprovalRequest[] {
  return [...requests].sort((a, b) => {
    const byRisk = RISK_ORDER[a.risk_classification] - RISK_ORDER[b.risk_classification];
    if (byRisk !== 0) return byRisk;
    return a.submitted_at.localeCompare(b.submitted_at);
  });
}

export function useApprovalQueue(ctx: SovereignShellContext, opts: UseApprovalQueueOptions = {}): UseApprovalQueue {
  const [requests, setRequests] = useState<AgentApprovalRequest[]>(() => {
    if (opts.initialRequests) return opts.initialRequests;
    const port = opts.port ?? createDevApprovalPort(opts.anchorIso ?? new Date().toISOString());
    return port.listPending();
  });
  const [selectedId, setSelectedId] = useState<string | null>(opts.initialSelectedId ?? null);
  const [expireError, setExpireError] = useState<string | null>(null);

  const expireOverdue = useCallback(
    (nowMs: number): string[] => {
      const overdue = requests.filter((r) => isExpired(r, nowMs));
      if (overdue.length === 0) return [];

      for (const req of overdue) {
        try {
          ctx.logger.log({
            event_type: "AGENT_ACTION_EXPIRED",
            workflow_step_id: approvalWorkflowStep(req.request_id),
            sovereign_tier: "standard",
            product: "VIGIL",
            actor_id: SOF_APPROVAL_SYSTEM,
            outcome: "agent_action_expired",
            payload: {
              request_id: req.request_id,
              requesting_agent_id: req.requesting_agent_id,
              action_type: req.action_type,
              risk_classification: req.risk_classification,
              expired_at: req.expires_at,
            },
          });
        } catch (err) {
          setExpireError(
            `AGENT_ACTION_EXPIRED Logger emit failed for ${req.request_id} — the request expired and ` +
              `left the queue, but its expiry was not logged (CPMI-VRS Gate 2): ${
                err instanceof Error ? err.message : String(err)
              }`
          );
        }
      }

      const expiredIds = overdue.map((r) => r.request_id);
      setRequests((prev) => prev.filter((r) => !expiredIds.includes(r.request_id)));
      setSelectedId((cur) => (cur !== null && expiredIds.includes(cur) ? null : cur));
      return expiredIds;
    },
    [ctx, requests]
  );

  const select = useCallback((requestId: string | null): void => setSelectedId(requestId), []);

  const remove = useCallback((requestId: string): void => {
    setRequests((prev) => prev.filter((r) => r.request_id !== requestId));
    setSelectedId((cur) => (cur === requestId ? null : cur));
  }, []);

  const sorted = useMemo(() => sortRequests(requests), [requests]);
  const selected = useMemo(() => sorted.find((r) => r.request_id === selectedId) ?? null, [sorted, selectedId]);
  const hasPendingP1 = useMemo(() => requests.some((r) => r.risk_classification === "P1"), [requests]);

  return {
    requests: sorted,
    selected,
    selectedId,
    pendingCount: requests.length,
    hasPendingP1,
    expireError,
    expireOverdue,
    select,
    remove,
  };
}
