/**
 * module-vigil — test stub for src/vigil-endpoint.ts.
 *
 * Mapped in via jest moduleNameMapper so the CommonJS test transform never parses the
 * ESM-only `import.meta` in the real module. Returns null, so config.ts resolves
 * VIGIL_ALERT_ENDPOINT to null under test — the unconfigured graceful-degradation
 * posture. Tests that need a configured endpoint pass useAlertQueue's `opts.endpoint`.
 */
export function readAlertEndpoint(): string | null {
  return null;
}
