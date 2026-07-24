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
 * D1 (Session 61, docs/30 §2 step 1): when opts.subscribeToSession is set, the hook
 * additionally holds a LIVE subscription on the shared session store
 * (subscribeVigilApprovalSession) — the standard external-store React pattern
 * (useEffect subscribing, setState on notify). A decision recorded at any other entry
 * point (the Reviewer's Workspace's embedded copy, another sweep) is then reflected in
 * this ALREADY-MOUNTED queue, with no remount required. Before this, reflection
 * happened only at mount-time seeding — an accident of the one-module-at-a-time
 * navigation model (finding D3-9), which D6's Home-return fix removes.
 *
 * Version: 1.1 · Session 61 (D1) · July 23, 2026
 */

import { useCallback, useEffect, useMemo, useState } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  agentActionExpiredEvent,
  isExpired,
  RISK_ORDER,
  type AgentApprovalRequest,
} from "./approval-contract";
import { createDevApprovalPort, type AgentApprovalPort } from "./approval-port";
import {
  removeVigilSessionRequest,
  subscribeVigilApprovalSession,
} from "./vigil-approval-session";

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
  /**
   * D1 (Session 61) — hold a live subscription on the shared session store, so a
   * decision recorded at any other entry point (Reviewer's Workspace, another
   * sweep) is reflected here without a remount. Read once at mount. Off by
   * default so test-seeded queues (initialRequests with ids not in the session)
   * are not overwritten by the store's unrelated contents.
   */
  subscribeToSession?: boolean;
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

  // D1 (Session 61): the live session-store subscription — the standard
  // external-store pattern. On every real store mutation the local copy is
  // replaced with the store's snapshot, and a selection pointing at a request
  // that just left the queue is cleared (same posture as remove/expire).
  // opts.subscribeToSession is deliberately read once at mount (documented on
  // the option); the store guarantees notify() only fires on actual change, so
  // this cannot loop with the mirror-back calls below.
  const subscribeToSession = opts.subscribeToSession ?? false;
  useEffect(() => {
    if (!subscribeToSession) return;
    return subscribeVigilApprovalSession((session) => {
      setRequests([...session.requests]);
      setSelectedId((cur) =>
        cur !== null && !session.requests.some((r) => r.request_id === cur) ? null : cur
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const expireOverdue = useCallback(
    (nowMs: number): string[] => {
      const overdue = requests.filter((r) => isExpired(r, nowMs));
      if (overdue.length === 0) return [];

      for (const req of overdue) {
        try {
          // WG-5 (Session 54): the event shape lives in approval-contract's shared
          // builder so this sweep and the session store's sweep cannot drift.
          ctx.logger.log(agentActionExpiredEvent(req));
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
      // WG-13 (Session 54): mirror the expiry into the shared session store so the
      // Reviewer's Workspace and any later VIGIL mount see the same queue. No-op
      // for requests never in the session (e.g. test-seeded ones).
      for (const id of expiredIds) removeVigilSessionRequest(id);
      return expiredIds;
    },
    [ctx, requests]
  );

  const select = useCallback((requestId: string | null): void => setSelectedId(requestId), []);

  const remove = useCallback((requestId: string): void => {
    setRequests((prev) => prev.filter((r) => r.request_id !== requestId));
    setSelectedId((cur) => (cur === requestId ? null : cur));
    // WG-13 (Session 54): a decided request also leaves the shared session store,
    // so it does not reappear when another VIGIL surface mounts later.
    removeVigilSessionRequest(requestId);
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
