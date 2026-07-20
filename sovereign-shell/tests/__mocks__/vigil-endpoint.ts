// Jest stub for */vigil-endpoint.ts — see moduleNameMapper in package.json.
// Returns null so VIGIL stays in the unconfigured/graceful-degradation posture.
export function readAlertEndpoint(): string | null {
  return null;
}
