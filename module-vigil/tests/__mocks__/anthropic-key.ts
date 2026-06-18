/**
 * module-vigil — test stub for src/anthropic-key.ts.
 *
 * Mapped in via jest moduleNameMapper so the CommonJS test transform never parses
 * the ESM-only `import.meta` in the real module. Returns no key, so the triage
 * engine takes the degraded (cache/static) tiers under test — no network,
 * deterministic. Same discipline as module-scribe / module-counsel.
 */
export function readAnthropicKey(): string | undefined {
  return undefined;
}
