/**
 * SOVEREIGN Platform — module-lens
 * session-events.ts — the LENS session activity capture for the AI Transparency Panel.
 *
 * WHY THIS EXISTS — a frozen-contract reality: the AI Transparency Panel (spec §2.3)
 * is specified to read "Logger events from ctx.logger in the current session." But the
 * shell contract's logger is WRITE-ONLY (`log(event) => void`); it exposes no
 * event-stream read, and a module must not reach outside the contract (Standing
 * Constraint #7 — shell context frozen; #8 — no shell-contract change). So LENS cannot
 * read a platform-wide stream.
 *
 * The honest, constraint-respecting implementation: LENS observes the events IT emits
 * by wrapping the logger it passes to its own hooks (it has those events at emit time).
 * The panel renders this LENS-session capture. A platform-wide session feed is a future
 * injectable port (a configuration wire-up, not a rewrite — Standing Constraint #3),
 * the same "honest stub, stable signature" posture as VIGIL's null alert endpoint.
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */

import type {
  SovereignShellContext,
  SovereignLogEvent,
} from "../../sovereign-shell/shell-contract";

export interface SessionEventLog {
  /** Record an event LENS emitted (called by the capture wrapper). */
  record: (event: SovereignLogEvent) => void;
  /** The events captured this session, in emission order. */
  events: () => readonly SovereignLogEvent[];
}

/** Create an empty in-memory session event log. */
export function createSessionEventLog(): SessionEventLog {
  const captured: SovereignLogEvent[] = [];
  return {
    record: (event) => {
      captured.push(event);
    },
    events: () => captured,
  };
}

/**
 * Return a shell context whose logger.log captures into `log` and then delegates to the
 * real logger. The shape is unchanged (same SovereignShellContext) — this is a
 * transparent wrapper, not a contract extension. Pass the wrapped context to LENS hooks
 * so their emissions are observable by the AI Transparency Panel.
 */
export function withSessionCapture(
  ctx: SovereignShellContext,
  log: SessionEventLog
): SovereignShellContext {
  return {
    ...ctx,
    logger: {
      log: (event: SovereignLogEvent) => {
        // Delegate FIRST: if the real logger throws (Gate 2), we do not record a
        // phantom event the platform never persisted.
        ctx.logger.log(event);
        log.record(event);
      },
    },
  };
}
