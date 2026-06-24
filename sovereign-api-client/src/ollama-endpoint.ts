/**
 * SOVEREIGN Platform — sovereign-api-client
 * ollama-endpoint.ts — reads the Local LLM (Ollama) endpoint config (GD-8 / Session 13).
 *
 * Mirrors the intent of module-vigil's vigil-endpoint.ts (an isolated config reader,
 * default-off, the seam that activates the provider by configuration — Standing
 * Constraint #3). ADAPTED for sovereign-api-client: this package compiles as CommonJS
 * (tsconfig `module: commonjs`), where `import.meta` is invalid and `tsc --noEmit` would
 * error. So the reader uses `process.env` — which works under CommonJS, jest (node), and
 * is populated from the Vite env (VITE_*) at build time. Default: Ollama DISABLED, no
 * endpoint → the synthetic/dev posture (Governance Clock OFF, no live connection).
 *
 * Version: 1.0 · Session 13 · June 24, 2026
 */

/** The configured Ollama endpoint, or null when unset (default). */
export function readOllamaEndpoint(): string | null {
  const env = typeof process !== "undefined" ? process.env : undefined;
  const value = env?.["VITE_OLLAMA_ENDPOINT"];
  return value && value.trim() !== "" ? value : null;
}

/** Whether Provider B (Ollama) is enabled. Default false. Requires an endpoint to take effect. */
export function readOllamaEnabled(): boolean {
  const env = typeof process !== "undefined" ? process.env : undefined;
  return env?.["VITE_OLLAMA_ENABLED"] === "true" && readOllamaEndpoint() !== null;
}
