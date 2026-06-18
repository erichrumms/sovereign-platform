/**
 * SOVEREIGN Platform — module-vigil
 * config.ts — VIGIL platform-config bindings.
 *
 * VIGIL_ALERT_ENDPOINT mirrors `vigil_alert_endpoint` in sovereign_config.yaml. It
 * is NULL until Stage 2 wires the Alert Dispatcher webhook (spec §3.2 /
 * stub-with-stable-signature platform pattern). When null, the Alert Queue renders
 * an empty queue with a configuration notice — it does NOT fail (spec §1: "When the
 * endpoint is null, VIGIL renders an empty alert queue with a configuration notice
 * — it does not throw"). Wiring this endpoint is a configuration change, not a
 * VIGIL rewrite (Standing Constraint #3).
 *
 * Version: 1.0 (scaffold) · Session 6 · June 17, 2026
 */

/** Null until the Stage 2 Alert Dispatcher webhook is configured. */
export const VIGIL_ALERT_ENDPOINT: string | null = null;
