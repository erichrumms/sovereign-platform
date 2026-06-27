/**
 * SOVEREIGN Platform — module-flowpath
 * anthropic-key.ts — reads the Anthropic API key from the Vite build env.
 *
 * Isolated into its own module on purpose (same discipline as module-cpmi / module-apex):
 * `import.meta` is ESM-only, resolved by the bundler (Vite) at build time. The jest CommonJS
 * transform cannot parse `import.meta`, so jest maps this module to a node-friendly stub
 * (tests/__mocks__/anthropic-key.ts via moduleNameMapper) — keeping production on import.meta
 * while tests run key-less (which exercises the degraded static tier). NEVER hardcode a key,
 * NEVER use process.env here (FLOWPATH codebase fact, spec §13).
 *
 * Absent in synthetic/air-gapped dev runs — flowpath.interviewer then degrades to the static
 * elicitation tier (the same correct-by-design behaviour CPMI/APEX show).
 *
 * Version: 1.0 · Session 20 · June 26, 2026
 */
export function readAnthropicKey(): string | undefined {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return env?.["VITE_ANTHROPIC_API_KEY"];
}
