/**
 * SOVEREIGN Platform — module-nexus
 * tt-session.ts — the module-level, session-persistent store of the Travel &
 * Time authority queues (D4 / finding D3-3, Session 61, docs/30 §2 step 4).
 *
 * Before this file, useTTIntake seeded its travel/time item lists via
 * useMemo(..., []) — computed once PER MOUNT from the static SYNTH_TT_* seeds
 * — so a travel request the manager had already decided reappeared, undecided,
 * every time NEXUS remounted (Session 60 assessment, D3-3).
 *
 * Same family as vigil-approval-session.ts / vigil-alert-session.ts /
 * aria-vrs-session.ts (Constraint #2 — no divergent duplicate): a
 * module-level singleton assembled once per browser session, notify only on
 * actual change, the D1-shape subscribe/unsubscribe, a test-only reset. The
 * write operations are wholesale list replacement (the last-write-wins
 * "publish" semantics of the shell surfaces) because useTTIntake already
 * expresses every mutation as a full-list transformation — the store is the
 * persistence authority; the hook remains the single writer.
 *
 * SESSION-SCOPED ONLY: in-memory, one browser session (Stage 1 posture; the
 * Logger keeps the permanent decision records — TRAVEL_APPROVAL et al. emit
 * from the paths that act on the queue, exactly as before; Constraint #1).
 *
 * Version: 1.0 · Session 61 (D4 / D3-3) · July 23, 2026
 */

// Type-only imports — erased at runtime, so the value-level dependency stays
// one-directional (useTTIntake imports this store's functions, not vice versa).
import type { SubmittedTravelItem, SubmittedTimeItem } from "./useTTIntake";

export interface TTSessionSnapshot {
  readonly travel: readonly SubmittedTravelItem[];
  readonly time: readonly SubmittedTimeItem[];
}

interface MutableTTSessionState {
  travel: SubmittedTravelItem[];
  time: SubmittedTimeItem[];
}

let state: MutableTTSessionState | null = null;

const listeners = new Set<(snapshot: TTSessionSnapshot) => void>();

function notify(): void {
  if (state === null) return;
  for (const listener of listeners) listener(state);
}

/**
 * Assemble the session queues from the seeds if they do not exist yet, and
 * return the live snapshot. Idempotent — a remounting NEXUS gets the queues
 * as the manager left them, not a fresh copy of the seeds.
 */
export function ensureTTSession(seed: {
  travel: SubmittedTravelItem[];
  time: SubmittedTimeItem[];
}): TTSessionSnapshot {
  if (state === null) {
    state = { travel: [...seed.travel], time: [...seed.time] };
    notify();
  }
  return state;
}

/** The current session snapshot, or null if no NEXUS surface has initialized it. */
export function getTTSession(): TTSessionSnapshot | null {
  return state;
}

/** Replace the travel list wholesale (the hook's mutations are full-list transforms). */
export function setTTSessionTravel(items: SubmittedTravelItem[]): void {
  if (state === null) state = { travel: [], time: [] };
  if (items === state.travel) return;
  state.travel = items;
  notify();
}

/** Replace the time list wholesale. */
export function setTTSessionTime(items: SubmittedTimeItem[]): void {
  if (state === null) state = { travel: [], time: [] };
  if (items === state.time) return;
  state.time = items;
  notify();
}

/**
 * Subscribe to queue changes — the same shape as the platform's other session
 * stores and shell surfaces. Returns an unsubscribe function.
 */
export function subscribeTTSession(
  listener: (snapshot: TTSessionSnapshot) => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Test-only: discard the session so each test assembles fresh queues. */
export function resetTTSessionForTests(): void {
  state = null;
  listeners.clear();
}
