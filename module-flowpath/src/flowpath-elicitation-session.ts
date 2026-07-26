/**
 * SOVEREIGN Platform — module-flowpath
 * flowpath-elicitation-session.ts — module-level, session-persistent store for
 * elicitation sessions (WH-25, Session 64).
 *
 * Before this file, FlowpathApp held the sessions list in a bare useState seeded
 * from SYNTHETIC_SESSIONS. Any navigation away from FLOWPATH and back reset the
 * list to the synthetic seed — any live session created during that mount was
 * silently discarded (Session 64, WH-25). The same session-state-resurrection
 * bug class fixed across four modules in Session 61 and SCRIBE in WG-15.
 *
 * Same family as flowpath-approval-session.ts and the other Session 61 stores
 * (Constraint #2 — no divergent duplicate): module-level singleton, seed-once
 * initializer, Set<listener> notify mechanism, mutation functions, test-only reset.
 *
 * Also provides returnFlowpathSessionForRevision (WH-24): called by the
 * Reviewer's Workspace before navigating back to FLOWPATH so the session's status
 * reflects IN_PROGRESS on the next FLOWPATH mount.
 *
 * SESSION-SCOPED ONLY: in-memory, one browser session.
 *
 * Version: 1.0 · Session 64 (WH-25 / WH-24) · July 25, 2026
 */

import type { ElicitationSession } from "./flowpath-contract";

let sessions: ElicitationSession[] | null = null;

const listeners = new Set<(sessions: readonly ElicitationSession[]) => void>();

function notify(): void {
  const snapshot = sessions ? [...sessions] : [];
  for (const listener of listeners) listener(snapshot);
}

/**
 * Initialize the store with the seed list on first call; idempotent thereafter.
 * Returns the current (or just-initialized) sessions snapshot.
 */
export function initFlowpathElicitationSessions(
  seeds: ElicitationSession[]
): readonly ElicitationSession[] {
  if (sessions === null) sessions = [...seeds];
  return sessions;
}

/** Current sessions snapshot. */
export function getFlowpathElicitationSessions(): readonly ElicitationSession[] {
  return sessions ? [...sessions] : [];
}

/** Prepend a new session and notify. */
export function createFlowpathElicitationSession(session: ElicitationSession): void {
  sessions = [{ ...session }, ...(sessions ?? [])];
  notify();
}

/**
 * Patch an existing session by id and notify. Idempotent — a patch producing no
 * net change is a no-op and does not notify.
 */
export function updateFlowpathElicitationSession(
  sessionId: string,
  patch: Partial<ElicitationSession>
): void {
  const current = sessions ?? [];
  const idx = current.findIndex((s) => s.session_id === sessionId);
  if (idx === -1) return;
  const updated = { ...current[idx], ...patch };
  if (JSON.stringify(current[idx]) === JSON.stringify(updated)) return;
  sessions = [...current.slice(0, idx), updated, ...current.slice(idx + 1)];
  notify();
}

/**
 * Reset a session to IN_PROGRESS + gate_passed: false — called by the Reviewer's
 * Workspace when a submitted artifact is returned for revision (WH-24).
 */
export function returnFlowpathSessionForRevision(sessionId: string): void {
  updateFlowpathElicitationSession(sessionId, {
    status: "IN_PROGRESS",
    gate_passed: false,
  });
}

/** Subscribe to session list changes. Returns an unsubscribe function. */
export function subscribeFlowpathElicitationSession(
  listener: (sessions: readonly ElicitationSession[]) => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Test-only: discard the session list so each test starts fresh. */
export function resetFlowpathElicitationSessionForTests(): void {
  sessions = null;
  listeners.clear();
}
