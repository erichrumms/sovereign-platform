/**
 * module-cpmi — test stub for src/cpmi-world-model-endpoint.ts.
 *
 * Mapped in via jest moduleNameMapper so the CommonJS test transform never parses the
 * ESM-only `import.meta`. Returns null/undefined — the default synthetic/dev posture, so
 * createWorldModelPort() serves the synthetic backing under test.
 */
export function readWorldModelEndpoint(): string | null {
  return null;
}
export function readNotionApiKey(): string | undefined {
  return undefined;
}
