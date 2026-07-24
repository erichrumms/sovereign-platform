/**
 * SOVEREIGN Platform — module-aria
 * aria-vrs-session.ts — the module-level, session-persistent store of ARIA's
 * CPMI-VRS Gate 3/4 state (D3 / finding D3-2, Session 61, docs/30 §2 step 3).
 *
 * Before this file, AriaVrsGates held Gate 3/4 state in plain component
 * useState — so a Gate 3 attestation the UI describes as "recorded
 * permanently … cannot be undone" showed PENDING again after a remount, and a
 * second GATE_3_ATTESTATION HUMAN_DECISION could be emitted for the same gate
 * in the same session (Session 60 assessment, D3-2).
 *
 * Same family as vigil-approval-session.ts / vigil-alert-session.ts /
 * scribe-sent-session.ts (Constraint #2 — no divergent duplicate): a
 * module-level singleton, mutations that notify only on actual change, the
 * D1-shape subscribe/unsubscribe, and a test-only reset. The record functions
 * return false on an already-recorded gate — the component checks the store
 * BEFORE emitting, making a duplicate attestation structurally prevented (the
 * check-emit-record sequence is synchronous, so nothing can interleave).
 *
 * SESSION-SCOPED ONLY: in-memory, one browser session — consistent with the
 * platform's Stage 1 posture (Decision 21: the Logger's audit record is the
 * permanent trail; cross-session UI state is WG-14, a separate governance
 * decision). Within a session, "permanent" is now genuinely true.
 *
 * No governance authority (Constraint #1): the store records UI gate state
 * only. The GATE_3_ATTESTATION / HUMAN_APPROVAL events are emitted by
 * AriaVrsGates' own handlers, exactly as before, fail-closed before recording.
 *
 * Version: 1.0 · Session 61 (D3 / D3-2) · July 23, 2026
 */

/** Gate display state — moved here from AriaVrsGates so both share one type. */
export type AriaGateState = "PASSED" | "PENDING" | "LOCKED";

export interface AriaVrsGateSession {
  readonly gate3: { readonly state: AriaGateState; readonly attestedAt: string | null };
  readonly gate4: { readonly state: AriaGateState; readonly completedAt: string | null };
}

interface MutableGateSessionState {
  gate3: { state: AriaGateState; attestedAt: string | null };
  gate4: { state: AriaGateState; completedAt: string | null };
}

let state: MutableGateSessionState | null = null;

const listeners = new Set<(session: AriaVrsGateSession) => void>();

function ensureState(): MutableGateSessionState {
  if (state === null) {
    state = {
      gate3: { state: "PENDING", attestedAt: null },
      gate4: { state: "LOCKED", completedAt: null },
    };
  }
  return state;
}

function notify(): void {
  if (state === null) return;
  for (const listener of listeners) listener(state);
}

/** The current session gate state (lazily initialized to PENDING / LOCKED). */
export function getAriaVrsGateSession(): AriaVrsGateSession {
  return ensureState();
}

/**
 * Record the Gate 3 attestation. Returns false — and records NOTHING — if
 * Gate 3 has already been attested this session (the duplicate-attestation
 * guard the component checks before emitting). On success, Gate 4 unlocks
 * (LOCKED → PENDING), matching the previous component behavior.
 */
export function recordAriaGate3Attestation(attestedAt: string): boolean {
  const s = ensureState();
  if (s.gate3.state === "PASSED") return false;
  s.gate3 = { state: "PASSED", attestedAt };
  if (s.gate4.state === "LOCKED") {
    s.gate4 = { ...s.gate4, state: "PENDING" };
  }
  notify();
  return true;
}

/**
 * Record the Gate 4 monitoring-baseline completion. Returns false — and
 * records nothing — unless Gate 4 is currently PENDING (i.e. Gate 3 attested,
 * Gate 4 not already completed).
 */
export function recordAriaGate4Completion(completedAt: string): boolean {
  const s = ensureState();
  if (s.gate4.state !== "PENDING") return false;
  s.gate4 = { state: "PASSED", completedAt };
  notify();
  return true;
}

/**
 * Subscribe to gate-state changes — the same shape as the platform's other
 * session stores and shell surfaces. Returns an unsubscribe function.
 */
export function subscribeAriaVrsGateSession(
  listener: (session: AriaVrsGateSession) => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Test-only: discard the session so each test starts at PENDING / LOCKED. */
export function resetAriaVrsGateSessionForTests(): void {
  state = null;
  listeners.clear();
}
