/**
 * SOVEREIGN Platform — module-vigil
 * vigil-approval-session.ts — the module-level, session-persistent store of
 * VIGIL's synthetic approval queue (WG-1 / WG-13, Session 54).
 *
 * Before this file, createDevApprovalPort() regenerated its entire synthetic
 * request list fresh on every call, so the Reviewer's Workspace's embedded
 * copy and VIGIL's own screen could never share live state for the same item
 * (WG-13), and nothing could publish VIGIL's real queue before VigilApp
 * mounted (WG-1).
 *
 * The store assembles the queue ONCE per browser session, lazily, from the
 * exact pieces VigilApp assembled at mount before this session — the
 * synthetic/dev port (createDevApprovalPort().listPending()), the TT formal
 * escalation (makeDemoTTApprovalRequest()), and the demo PPBE obligation case
 * (openObligationGate(), which still emits its own governed Logger events at
 * open). Nothing about the queue's content is new; only its lifetime is.
 *
 *   - VigilApp seeds useApprovalQueue from here (and the hook's remove()
 *     mirrors decisions back — see useApprovalQueue.ts).
 *   - The shell's startup publisher (WG-1) publishes work-queue counts and
 *     Workspace items from here at shell start.
 *   - The Reviewer's Workspace removes decided items here (WG-13) and runs
 *     the live expiry sweep against it (WG-5) while its embedded copy is open.
 *
 * SESSION-SCOPED ONLY: in-memory, one browser session. This is deliberately
 * NOT permanent cross-session decision history — that is WG-14, separate
 * larger work requiring its own governance decision (Session 54 opening
 * prompt, D6 scope note).
 *
 * No governance authority (Constraint #1): the store publishes, logs, and
 * approves nothing by itself. Decision and expiry events are emitted by the
 * paths that act on the queue, exactly as before.
 *
 * Version: 1.0 · Session 54 (WG-1 / WG-5 / WG-13) · July 22, 2026
 */

import {
  agentActionExpiredEvent,
  isExpired,
  type AgentApprovalRequest,
} from "./approval-contract";
import { createDevApprovalPort } from "./approval-port";
import { makeDemoTTApprovalRequest } from "./tt-synthetic-alerts";
import {
  openObligationGate,
  type PPBEGateLogger,
  type PPBEObligationCase,
} from "./ppbe-authorization";

/** A read-only view of the session's live approval queue. */
export interface VigilApprovalSession {
  /** The instant the queue was assembled (shell start, or first VIGIL-surface access). */
  readonly anchorIso: string;
  /** The live pending requests — decisions and expiries remove from this list. */
  readonly requests: readonly AgentApprovalRequest[];
  /** The demo Tier C obligation case (docs/18 §6), while its request is pending. */
  readonly obligationCase: PPBEObligationCase | null;
}

interface MutableSessionState {
  anchorIso: string;
  requests: AgentApprovalRequest[];
  obligationCase: PPBEObligationCase | null;
}

let state: MutableSessionState | null = null;

/**
 * Assemble the session queue if it does not exist yet, and return it.
 * Idempotent — subsequent calls return the same live state, which is the
 * entire point (WG-13): one queue, every screen.
 */
export function ensureVigilApprovalSession(logger: PPBEGateLogger): VigilApprovalSession {
  if (state === null) {
    const anchorIso = new Date().toISOString();

    // Tier C seed — one pending obligation awaiting VIGIL authorization + COUNSEL
    // Decision Record. Moved verbatim from VigilApp (Session 54); openObligationGate
    // still emits its own governed events. The null guard is belt-and-suspenders
    // (it only returns null for malformed drafts).
    const obligationCase = openObligationGate(
      {
        obligation_id: "PPBE-OB-DEMO-001",
        program_id: "SYNTH-PRG-ALPHA",
        cost_code: "SYNTH-CC-110",
        amount: 75000,
        timestamp: anchorIso,
        workflow_step_id: "ppbe-obligation-PPBE-OB-DEMO-001",
      },
      "ppbe-coordination-assistant",
      anchorIso,
      logger
    );

    const requests = [
      ...createDevApprovalPort(anchorIso).listPending(),
      makeDemoTTApprovalRequest(anchorIso),
      ...(obligationCase ? [obligationCase.approval_request] : []),
    ];

    state = { anchorIso, requests, obligationCase };
  }
  return state;
}

/** The current session queue, or null if no VIGIL surface has initialized it yet. */
export function getVigilApprovalSession(): VigilApprovalSession | null {
  return state;
}

/**
 * Remove one request from the session queue — called when a decision is
 * recorded (from either VIGIL's own screen via useApprovalQueue.remove, or
 * the Reviewer's Workspace's embedded copy) or when an expiry sweep removes
 * it. No-op for an id not in the queue (e.g. test-only requests that were
 * never in the session).
 */
export function removeVigilSessionRequest(requestId: string): void {
  if (state === null) return;
  state.requests = state.requests.filter((r) => r.request_id !== requestId);
  if (state.obligationCase?.approval_request.request_id === requestId) {
    state.obligationCase = null;
  }
}

/**
 * The live expiry sweep over the session queue (WG-5) — used by the Reviewer's
 * Workspace while its embedded copy is open (VigilApp's own screen sweeps via
 * useApprovalQueue.expireOverdue, which mirrors removals here). Each overdue
 * request is auto-rejected with an AGENT_ACTION_EXPIRED system event (the
 * shared builder — Constraint #2) and removed from the queue. A failed emit
 * does not hide the expiry (the request IS expired — Gate 2): it still leaves
 * the queue and the failure is returned for the caller to surface.
 */
export function expireVigilSessionRequests(
  nowMs: number,
  logger: PPBEGateLogger
): { expired: AgentApprovalRequest[]; emitErrors: string[] } {
  if (state === null) return { expired: [], emitErrors: [] };

  const expired = state.requests.filter((r) => isExpired(r, nowMs));
  const emitErrors: string[] = [];
  for (const req of expired) {
    try {
      logger.log(agentActionExpiredEvent(req));
    } catch (err) {
      emitErrors.push(
        `AGENT_ACTION_EXPIRED Logger emit failed for ${req.request_id} — the request expired and ` +
          `left the queue, but its expiry was not logged (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
      );
    }
    removeVigilSessionRequest(req.request_id);
  }
  return { expired, emitErrors };
}

/** Test-only: discard the session so each test assembles a fresh queue. */
export function resetVigilApprovalSessionForTests(): void {
  state = null;
}
