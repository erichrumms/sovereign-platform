/**
 * SOVEREIGN Platform — sovereign-api-client
 * providers/provider-registry.ts — the inference provider registry (GD-8 / Session 13).
 *
 * Registers the two inference providers: Provider A (Anthropic — the existing commercial
 * API, always present) and Provider B (Ollama — the Local LLM, enabled by configuration).
 * The registry is injectable (a config object, not a hardcoded value): default is
 * Anthropic-only; Provider B activates when VITE_OLLAMA_ENDPOINT is set and
 * VITE_OLLAMA_ENABLED=true (Governance Clock OFF → disabled by default this session).
 *
 * Version: 1.0 · Session 13 · June 24, 2026
 */

import { readOllamaEndpoint, readOllamaEnabled } from "../ollama-endpoint";

export type InferenceProvider = "anthropic" | "ollama";

export interface ProviderConfig {
  provider: InferenceProvider;
  /** Endpoint URL (Anthropic API base, or the Ollama OpenAI-compatible base). */
  endpoint: string;
  modelId: string;
  enabled: boolean;
}

export interface ProviderRegistry {
  anthropic: ProviderConfig;
  ollama: ProviderConfig;
}

/** Default Ollama model id for the dev/demo runtime (13B Q4 — D2 governance decision). */
export const DEFAULT_OLLAMA_MODEL_ID = "mistral:13b-q4";
const DEFAULT_OLLAMA_ENDPOINT = "http://localhost:11434";

/**
 * Build the provider registry from platform config. Anthropic (Provider A) is always
 * present and enabled. Ollama (Provider B) is enabled only when configured + enabled.
 * Overrides are accepted for tests / explicit wiring.
 */
export function createProviderRegistry(over: Partial<ProviderRegistry> = {}): ProviderRegistry {
  const ollamaEndpoint = readOllamaEndpoint();
  return {
    anthropic: {
      provider: "anthropic",
      endpoint: "https://api.anthropic.com",
      modelId: "claude-sonnet-4",
      enabled: true,
      ...over.anthropic,
    },
    ollama: {
      provider: "ollama",
      endpoint: ollamaEndpoint ?? DEFAULT_OLLAMA_ENDPOINT,
      modelId: DEFAULT_OLLAMA_MODEL_ID,
      enabled: readOllamaEnabled(),
      ...over.ollama,
    },
  };
}

/** Whether Provider B (Ollama) is enabled in the registry. */
export function isOllamaEnabled(registry: ProviderRegistry): boolean {
  return registry.ollama.enabled;
}
