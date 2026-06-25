/**
 * SOVEREIGN Platform — module-agentos
 * evaluate-endpoint.ts — config reader for the live evaluate.py backing (Session 16, D3).
 *
 * The seam that activates the live sovereign-security/evaluate.py CPMI-VRS pipeline behind
 * the injectable EvaluatePort. Default (unset) → the synthetic/dev backing is served. Setting
 * VITE_EVALUATE_ENDPOINT records where the live evaluate.py harness is reachable so the live
 * adapter activates by configuration (Constraint #3 — no rewrite of the existing seam). No
 * live connection is opened this session.
 *
 * Reads process.env (guarded for non-node hosts) — module-agentos is bundled, but the env is
 * populated at build time and available under jest/node; the guard keeps it safe everywhere.
 *
 * Version: 1.0 · Session 16 · June 24, 2026
 */

/** The configured live evaluate.py endpoint, or null when unset (→ synthetic backing). */
export function readEvaluateEndpoint(): string | null {
  if (typeof process === "undefined" || !process.env) return null;
  const value = process.env["VITE_EVALUATE_ENDPOINT"];
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/** Whether the live evaluate.py backing is explicitly enabled (default false). */
export function readEvaluateEnabled(): boolean {
  if (typeof process === "undefined" || !process.env) return false;
  return process.env["VITE_EVALUATE_ENABLED"] === "true";
}
