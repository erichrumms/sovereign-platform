/**
 * SOVEREIGN Platform — sovereign-api-client
 * routing.ts — data-classification-driven provider selection (GD-8 / Session 13).
 *
 * The routing rules (10_LocalLLM_Infrastructure.md §2.2):
 *   - data_classification === "CUI" AND Ollama enabled → Provider B (Ollama)
 *   - data_classification === "CUI" AND Ollama disabled → Provider A (Anthropic) with an
 *     INFERENCE_PROVIDER_FALLBACK warning (isClassificationFallback === true)
 *   - all other classifications (and absent → treated as UNCLASSIFIED) → Provider A
 *
 * Pure functions over ClearanceLevel — the canonical classification taxonomy (Standing
 * Constraint #2; not a separate DataClassification type).
 *
 * Version: 1.0 · Session 13 · June 24, 2026
 */

import type { ClearanceLevel } from "./types";
import type { InferenceProvider } from "./providers/provider-registry";

/** Select the inference provider for a request's data classification. */
export function selectProvider(
  dataClassification: ClearanceLevel | undefined,
  ollamaEnabled: boolean
): InferenceProvider {
  if (dataClassification === "CUI" && ollamaEnabled) return "ollama";
  return "anthropic";
}

/**
 * True when a CUI request wanted the local provider but Ollama was disabled — the call
 * proceeds on Anthropic, and an INFERENCE_PROVIDER_FALLBACK warning is recorded so the
 * routing decision is auditable (the operator can see CUI ran on the commercial API).
 */
export function isClassificationFallback(
  dataClassification: ClearanceLevel | undefined,
  ollamaEnabled: boolean
): boolean {
  return dataClassification === "CUI" && !ollamaEnabled;
}
