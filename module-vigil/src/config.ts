/**
 * SOVEREIGN Platform — module-vigil
 * config.ts — VIGIL platform-config bindings.
 *
 * VIGIL_ALERT_ENDPOINT mirrors `vigil_alert_endpoint` in sovereign_config.yaml. It is
 * now SOURCED FROM PLATFORM CONFIG (Session 9): `readAlertEndpoint()` reads the value
 * Vite injects from the platform config (VITE_VIGIL_ALERT_ENDPOINT). When no value is
 * provided it is NULL, and the Alert Queue renders an empty queue with a configuration
 * notice — it does NOT fail (spec §1 / §3.2 stub-with-stable-signature pattern).
 *
 * Supplying the endpoint (here via config, or per-call via useAlertQueue's
 * `opts.endpoint`) is a CONFIGURATION change that activates the live feed — NOT a VIGIL
 * rewrite (Standing Constraint #3). Governance Clock stays OFF; all data SYNTHETIC.
 *
 * Version: 1.1 (configurable endpoint) · Session 9 · June 23, 2026
 */

import { readAlertEndpoint } from "./vigil-endpoint";

/**
 * The configured Alert Dispatcher endpoint, from platform config. Null when no value is
 * provided (the default test/dev posture) — the queue then shows its configuration
 * notice. useAlertQueue reads this as its default and also accepts a per-call override.
 */
export const VIGIL_ALERT_ENDPOINT: string | null = readAlertEndpoint();
