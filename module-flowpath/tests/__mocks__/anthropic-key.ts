/**
 * module-flowpath — test stub for src/anthropic-key.ts.
 *
 * Mapped in via jest moduleNameMapper so the CommonJS test transform never parses the
 * ESM-only `import.meta`. Returns no key, so flowpath.interviewer takes the degraded static
 * tier under test — no network, deterministic.
 */
export function readAnthropicKey(): string | undefined {
  return undefined;
}
