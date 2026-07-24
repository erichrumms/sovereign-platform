/**
 * SOVEREIGN Platform — module-flowpath
 * flowpath-approval-session.ts — the module-level, session-persistent record
 * of approved elicitation sessions (D5 / finding D3-4, Session 61, docs/30 §2
 * step 5).
 *
 * Before this file, FlowpathApp held approvedSessionIds in a bare useState and
 * WorkflowArtifactReview held its "approved" confirmation in local state — so
 * a remount reverted an approved artifact to pending on Screen 1 AND re-showed
 * the approve button on Screen 3, permitting a duplicate WORKFLOW_APPROVAL
 * emission for an already-committed artifact (Session 60 assessment, D3-4).
 *
 * Same family as the other Session 61 stores and scribe-sent-session.ts
 * (Constraint #2 — no divergent duplicate): a module-level singleton (here a
 * Set of session ids, the scribe-sent shape — the closest fit for a
 * mark-once collection), notify only on actual change, the D1-shape
 * subscribe/unsubscribe, a test-only reset.
 *
 * SESSION-SCOPED ONLY: in-memory, one browser session (Stage 1 posture; the
 * Logger's WORKFLOW_APPROVAL / FLOWPATH_ARTIFACT_APPROVED events remain the
 * permanent record — emitted by WorkflowArtifactReview exactly as before;
 * Constraint #1).
 *
 * Version: 1.0 · Session 61 (D5 / D3-4) · July 23, 2026
 */

let approvedIds: Set<string> | null = null;

const listeners = new Set<(ids: readonly string[]) => void>();

function ensureIds(): Set<string> {
  if (approvedIds === null) approvedIds = new Set();
  return approvedIds;
}

function notify(): void {
  const snapshot = [...ensureIds()];
  for (const listener of listeners) listener(snapshot);
}

/** Mark a session's artifact approved for this browser session. Idempotent —
 * a repeat mark is a no-op and does not notify. */
export function markFlowpathSessionApproved(sessionId: string): void {
  const ids = ensureIds();
  if (ids.has(sessionId)) return;
  ids.add(sessionId);
  notify();
}

/** Whether this session's artifact was approved earlier in this browser session. */
export function isFlowpathSessionApproved(sessionId: string): boolean {
  return approvedIds?.has(sessionId) ?? false;
}

/** All approved session ids (snapshot). */
export function getApprovedFlowpathSessionIds(): readonly string[] {
  return [...ensureIds()];
}

/**
 * Subscribe to approval changes — the same shape as the platform's other
 * session stores and shell surfaces. Returns an unsubscribe function.
 */
export function subscribeFlowpathApprovalSession(
  listener: (ids: readonly string[]) => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Test-only: discard the session so each test starts with no approvals. */
export function resetFlowpathApprovalSessionForTests(): void {
  approvedIds = null;
  listeners.clear();
}
