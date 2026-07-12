/**
 * module-nexus — test stub for module-scribe/src/anthropic-key.ts.
 *
 * Mapped in via jest moduleNameMapper so the CommonJS test transform never parses
 * the ESM-only `import.meta` in the real module. Returns no key, causing runTTDraft
 * to take the degraded (cache → static) tiers — no network, deterministic. The
 * composition-root drafter port (NexusApp.tsx) is never exercised in unit tests;
 * the hook-level TravelDrafterPort is always injected as a mock.
 *
 * Same pattern as module-scribe/tests/__mocks__/anthropic-key.ts.
 */
export function readAnthropicKey(): string | undefined {
  return undefined;
}
