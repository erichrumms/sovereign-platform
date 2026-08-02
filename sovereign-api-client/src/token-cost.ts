/**
 * SOVEREIGN Platform — sovereign-api-client
 * token-cost.ts — versioned static rate table for estimated LLM cost computation.
 *
 * GD-31 (v1.25): provides estimated_cost_usd for AGENT_STEP_COMPLETE token_usage.
 * No live pricing API — preserves zero-new-production-dependencies record.
 *
 * PRICING DATE: August 2026 — sourced from anthropic.com/pricing.
 * MANUAL UPDATE: verify against Anthropic published rates before any cost reporting.
 * Rates are dollars per 1 000 input/output tokens (per-mille, not per-million).
 */

// Keyed by the exact model ID string returned in SovereignLLMResponse.model.
// "input" and "output" are USD per 1 000 tokens.
const RATE_TABLE: Record<string, { input: number; output: number }> = {
  // Sonnet 4.6 — primary platform model (SOVEREIGN_DEFAULT_MODEL)
  "claude-sonnet-4-6": { input: 0.003, output: 0.015 },
  // Haiku 4.5 — lightweight model variant
  "claude-haiku-4-5": { input: 0.0008, output: 0.004 },
  // Opus 4.8 — premium model variant
  "claude-opus-4-8": { input: 0.015, output: 0.075 },
  // Fable 5 — experimental model variant
  "claude-fable-5": { input: 0.003, output: 0.015 },
};

/**
 * Compute estimated cost in USD from token counts and model ID.
 * Returns undefined when the model is not in the rate table (e.g. GovCloud model
 * whose ID is still unresolved) so token_usage.estimated_cost_usd is simply absent
 * rather than zero for unknown models.
 */
export function computeEstimatedCostUSD(
  model: string,
  inputTokens: number,
  outputTokens: number
): number | undefined {
  const rate = RATE_TABLE[model];
  if (!rate) return undefined;
  return (inputTokens / 1000) * rate.input + (outputTokens / 1000) * rate.output;
}
