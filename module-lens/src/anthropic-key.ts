/**
 * SOVEREIGN Platform — module-lens
 * anthropic-key.ts — reads the Anthropic API key from the Vite build env.
 *
 * Isolated into its own module on purpose: `import.meta` is ESM-only, resolved by
 * the bundler (Vite) at build time. The jest CommonJS transform cannot parse
 * `import.meta`, so jest maps this module to a node-friendly stub
 * (tests/__mocks__/anthropic-key.ts via moduleNameMapper) — keeping production on
 * import.meta while tests run key-less (which exercises the degraded fallback
 * tiers, exactly what the engine/component tests want). NEVER hardcode a key.
 *
 * Absent in synthetic/air-gapped runs — the explanation engine then degrades to
 * cache/static. Same discipline as module-vigil / module-scribe / module-counsel.
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */
export function readAnthropicKey(): string | undefined {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return env?.["VITE_ANTHROPIC_API_KEY"];
}
