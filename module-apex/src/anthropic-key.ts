/**
 * SOVEREIGN Platform — module-apex
 * anthropic-key.ts — reads the Anthropic API key from the Vite build env.
 *
 * Isolated into its own module on purpose (same discipline as module-cpmi): `import.meta` is
 * ESM-only, resolved by the bundler (Vite) at build time. The jest CommonJS transform cannot
 * parse `import.meta`, so jest maps this module to a node-friendly stub
 * (tests/__mocks__/anthropic-key.ts via moduleNameMapper) — keeping production on import.meta
 * while tests run key-less (which exercises the degraded static tier). NEVER hardcode a key.
 *
 * Absent in synthetic/air-gapped dev runs — apex.ai-assistant then degrades to the static
 * analysis tier (the same correct-by-design behaviour CPMI shows; see Gap 4).
 *
 * Version: 1.0 · Session 17 · June 25, 2026
 */
export function readAnthropicKey(): string | undefined {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return env?.["VITE_ANTHROPIC_API_KEY"];
}
