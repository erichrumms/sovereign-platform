/**
 * SOVEREIGN Platform — module-vigil
 * vigil-alert-session.ts — the module-level, session-persistent store of
 * VIGIL's alert queue (D2 / finding D3-1 HIGH, Session 61, docs/30 §2 step 2).
 *
 * Before this file, useAlertQueue held alerts purely in React state seeded
 * from static constants at VigilApp mount, and applyResponse mutated only the
 * React copy — so navigating away and back resurrected every acknowledged /
 * resolved / false-positive'd alert as UNACKNOWLEDGED (the unfixed sibling of
 * WG-13, found by the Session 60 assessment).
 *
 * Deliberately the same shape as vigil-approval-session.ts (Constraint #2 —
 * no divergent duplicate): a lazily-assembled module-level singleton, mutation
 * functions that notify only on ACTUAL change, subscribe/unsubscribe mirroring
 * the shell surfaces (TaskSurface / AriaCertificationSurface), and a test-only
 * reset. The alert CONTENT is unchanged — the same seeded ARIA + TT alerts the
 * component assembled before; only the lifetime moves.
 *
 * SESSION-SCOPED ONLY: in-memory, one browser session. The SOF Logger remains
 * the permanent record (spec §4) — a closed alert leaves this queue; its audit
 * record persists in the Logger, exactly as before.
 *
 * No governance authority (Constraint #1): the store publishes, logs, and
 * approves nothing by itself. ALERT_RECEIVED and the ALERT_* response events
 * are emitted by the paths that act on the queue (useAlertQueue.ingest,
 * useAlertResponse), exactly as before.
 *
 * Version: 1.0 · Session 61 (D2 / D3-1) · July 23, 2026
 */

import type { AlertResponseAction, SecurityAlert } from "./vigil-types";

/** Response actions that close an alert (it leaves the active queue). */
export const CLOSING_ACTIONS: readonly AlertResponseAction[] = [
  "RESOLVED",
  "ESCALATED",
  "FALSE_POSITIVE",
];

/**
 * The single canonical application of an operator response to an alert list —
 * used by both the session store below and useAlertQueue's store-less test
 * path (Constraint #2: one implementation, not two). Closing actions remove
 * the alert; ACKNOWLEDGED / INVESTIGATING transition its status in place.
 * Returns the same array reference when nothing changed (the notify guard).
 */
export function applyResponseToAlerts(
  alerts: SecurityAlert[],
  alertId: string,
  action: AlertResponseAction
): SecurityAlert[] {
  if (!alerts.some((a) => a.alertId === alertId)) return alerts;
  if (CLOSING_ACTIONS.includes(action)) {
    return alerts.filter((a) => a.alertId !== alertId);
  }
  const nextStatus = action === "ACKNOWLEDGED" ? "ACKNOWLEDGED" : "INVESTIGATING";
  return alerts.map((a) => (a.alertId === alertId ? { ...a, status: nextStatus } : a));
}

interface MutableAlertSessionState {
  alerts: SecurityAlert[];
}

let state: MutableAlertSessionState | null = null;

const listeners = new Set<(alerts: readonly SecurityAlert[]) => void>();

function notify(): void {
  if (state === null) return;
  for (const listener of listeners) listener(state.alerts);
}

/**
 * Assemble the session alert queue if it does not exist yet, and return the
 * live list. Idempotent — subsequent calls return the same live state (the
 * point of the fix: a remounting VigilApp gets the queue as the operator left
 * it, not a fresh copy of the seeds).
 */
export function ensureVigilAlertSession(
  initialAlerts: readonly SecurityAlert[]
): readonly SecurityAlert[] {
  if (state === null) {
    state = { alerts: [...initialAlerts] };
    notify();
  }
  return state.alerts;
}

/** The current session alert list, or null if no VIGIL surface has initialized it. */
export function getVigilAlertSession(): readonly SecurityAlert[] | null {
  return state?.alerts ?? null;
}

/**
 * Add an alert to the session queue (the live-feed ingest path). Dedupes by
 * alertId — a duplicate is a no-op and does not notify. The caller
 * (useAlertQueue.ingest) still owns the ALERT_RECEIVED emit.
 */
export function ingestVigilAlertSessionAlert(alert: SecurityAlert): void {
  if (state === null) state = { alerts: [] };
  if (state.alerts.some((a) => a.alertId === alert.alertId)) return;
  state.alerts = [...state.alerts, alert];
  notify();
}

/**
 * Apply an operator response to the session queue — the store-level twin of
 * the React-state path this replaces. No-op (no notify) for an unknown id.
 */
export function applyVigilAlertSessionResponse(
  alertId: string,
  action: AlertResponseAction
): void {
  if (state === null) return;
  const next = applyResponseToAlerts(state.alerts, alertId, action);
  if (next === state.alerts) return;
  state.alerts = next;
  notify();
}

/**
 * Subscribe to alert-queue changes. The listener receives the live snapshot
 * after every real mutation. Returns an unsubscribe function — the same shape
 * as vigil-approval-session's D1 subscription and the shell surfaces.
 */
export function subscribeVigilAlertSession(
  listener: (alerts: readonly SecurityAlert[]) => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Test-only: discard the session so each test assembles a fresh queue. */
export function resetVigilAlertSessionForTests(): void {
  state = null;
  listeners.clear();
}
