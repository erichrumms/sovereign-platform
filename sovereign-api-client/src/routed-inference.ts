/**
 * SOVEREIGN Platform — sovereign-api-client
 * routed-inference.ts — classification-routed inference with three-tier fallback (GD-8).
 *
 * Realizes the spec's "data-classification routing" as an ADDITIVE layer over the existing
 * createSovereignClient() (which is preserved unchanged to avoid rewrite debt and keep the
 * 143-test contract — Standing Constraint #3). Provider A (Anthropic) is the existing
 * client; Provider B (Ollama) is the new adapter. The dependencies are injected so this is
 * unit-testable without a live provider.
 *
 * Routing + three-tier fallback (10_LocalLLM_Infrastructure.md §2.2 / §2.4):
 *   1. selectProvider(context.data_classification, ollamaEnabled).
 *   2. Tier 1 — if Ollama selected: live Ollama. On OllamaUnavailableError → fall back.
 *   3. Tier 2 — Anthropic (Provider A). Also the destination for non-CUI and for CUI when
 *      Ollama is disabled (with an INFERENCE_PROVIDER_FALLBACK warning).
 *   4. Tier 3 — static degraded response (both providers unavailable).
 * INFERENCE_CALL is emitted on the served tier; every event carries workflow_step_id.
 *
 * Version: 1.0 · Session 13 · June 24, 2026
 */

import {
  STATIC_FALLBACK_RESPONSE,
  type ClientLogger,
  type SovereignMessage,
  type SovereignRequestContext,
  type SovereignLLMResponse,
} from "./base-client";
import type { ClearanceLevel } from "./types";
import { selectProvider, isClassificationFallback } from "./routing";
import { OllamaUnavailableError } from "./providers/ollama-provider";
import { emitInferenceCall, emitProviderFallback } from "./inference-logger";

export interface RoutedInferenceDeps {
  /** Provider B (Ollama) call — bound OllamaProvider.complete. */
  ollamaComplete: (messages: SovereignMessage[], context: SovereignRequestContext) => Promise<SovereignLLMResponse>;
  /** Provider A (Anthropic) call — bound to the existing createSovereignClient() client. */
  anthropicComplete: (messages: SovereignMessage[], context: SovereignRequestContext) => Promise<SovereignLLMResponse>;
  ollamaEnabled: boolean;
  logger: ClientLogger;
  /** Wall-clock provider (injectable for deterministic tests). Defaults to Date.now. */
  now?: () => number;
  sovereignVersion?: string;
}

/**
 * Route a request by data classification and complete it with three-tier fallback. Never
 * throws — always returns a SovereignLLMResponse; the `provider` in sovereign_metadata and
 * `fallback_tier` indicate which tier served it.
 */
export async function routedComplete(
  messages: SovereignMessage[],
  context: SovereignRequestContext,
  deps: RoutedInferenceDeps
): Promise<SovereignLLMResponse> {
  const now = deps.now ?? (() => Date.now());
  const classification: ClearanceLevel = context.data_classification ?? "UNCLASSIFIED";
  const base = { logger: deps.logger, workflow_step_id: context.workflow_step_id, product: context.product, actor_id: context.agent_id };
  const provider = selectProvider(context.data_classification, deps.ollamaEnabled);

  // CUI requested but Ollama disabled → proceeds on Anthropic, recorded as a fallback.
  if (isClassificationFallback(context.data_classification, deps.ollamaEnabled)) {
    emitProviderFallback({ ...base, intended_provider: "ollama", actual_provider: "anthropic", fallback_reason: "ollama_disabled" });
  }

  // --- Tier 1: live Ollama (only when selected) ---
  if (provider === "ollama") {
    const startedAt = now();
    try {
      const response = await deps.ollamaComplete(messages, context);
      emitInferenceCall({ ...base, provider: "ollama", model_id: response.sovereign_metadata.provider_model, input_classification: classification, output_schema_valid: response.content.trim() !== "", latency_ms: now() - startedAt });
      return response;
    } catch (err) {
      const reason = err instanceof OllamaUnavailableError ? "ollama_unavailable" : `ollama_error: ${err instanceof Error ? err.message : String(err)}`;
      emitProviderFallback({ ...base, intended_provider: "ollama", actual_provider: "anthropic", fallback_reason: reason });
      // fall through to Anthropic (Tier 2)
    }
  }

  // --- Tier 2: Anthropic (Provider A) ---
  const startedAt = now();
  try {
    const response = await deps.anthropicComplete(messages, context);
    emitInferenceCall({ ...base, provider: "anthropic", model_id: response.sovereign_metadata.provider_model, input_classification: classification, output_schema_valid: response.content.trim() !== "", latency_ms: now() - startedAt });
    return response;
  } catch (err) {
    // --- Tier 3: static degraded response (both providers unavailable) ---
    emitProviderFallback({ ...base, intended_provider: "anthropic", actual_provider: "anthropic", fallback_reason: `static_fallback: ${err instanceof Error ? err.message : String(err)}` });
    return STATIC_FALLBACK_RESPONSE(context, "static", "static", deps.sovereignVersion ?? "1.0");
  }
}
