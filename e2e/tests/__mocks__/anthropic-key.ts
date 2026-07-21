/**
 * e2e — test stub for module-vigil/src/anthropic-key.ts.
 *
 * Mapped in via jest moduleNameMapper so the CommonJS test transform never parses
 * the ESM-only `import.meta` in the real module (the Reviewer's Workspace
 * convergence tests render VIGIL's ApprovalDetail, whose brief hook imports it).
 * Returns no key, so the brief engine takes the degraded (static) tier under
 * test — no network, deterministic. Same discipline as module-vigil.
 */
export function readAnthropicKey(): string | undefined {
  return undefined;
}
