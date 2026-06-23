/**
 * SOVEREIGN Platform — module-vigil
 * vigil-endpoint.ts — reads the VIGIL Alert Dispatcher endpoint from platform config.
 *
 * Isolated into its own module on purpose, identical to anthropic-key.ts: `import.meta`
 * is ESM-only and resolved by the bundler (Vite) at build time. The jest CommonJS
 * transform cannot parse `import.meta`, so jest maps this module to a node-friendly stub
 * (tests/__mocks__/vigil-endpoint.ts via moduleNameMapper) that returns null — so the
 * default test/dev posture is the unconfigured (graceful-degradation) path.
 *
 * This is the platform-config binding for `vigil_alert_endpoint` in
 * sovereign_config.yaml, surfaced to Vite as VITE_VIGIL_ALERT_ENDPOINT. Providing the
 * endpoint here (or via useAlertQueue's `opts.endpoint`) is a CONFIGURATION change that
 * activates the live feed — NOT a VIGIL rewrite (Standing Constraint #3). Governance
 * Clock stays OFF; until a value is supplied this returns null and the Alert Queue shows
 * its configuration notice (it does NOT imply the platform is secure).
 *
 * Version: 1.0 · Session 9 · June 23, 2026
 */
export function readAlertEndpoint(): string | null {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return env?.["VITE_VIGIL_ALERT_ENDPOINT"] ?? null;
}
