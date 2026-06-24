/**
 * SOVEREIGN Platform — module-cpmi
 * reasoning-engine.ts — the CPMI six-step reasoning chain orchestration (pure, no React).
 *
 * The chain is a SINGLE governed inference session (spec §4.1): one
 * createSovereignClient().complete per chain execution — not six calls — so the whole
 * chain is traceable to a single workflow_step_id (Standing Constraint #5 / #6).
 *
 * Platform-standard three-tier fallback: live (sovereign-api-client returns content that
 * parses + validates as a surfaceable ReasoningChainOutput, i.e. schema-valid AND
 * schema_valid===true) → cache (last good output for this program) → static (a
 * MEANINGFUL governance output assembled from the world-model record — not an empty
 * stub). Never throws. A schema_valid:false or schema-invalid live response is treated
 * as unavailable and never surfaced (spec §3).
 *
 * Version: 1.0 · Session 11 · June 23, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";

import {
  hasSurfaceableOutput,
  validateReasoningChainOutput,
  type ReasoningChainInput,
  type ReasoningChainOutput,
  type WorldModelRecord,
} from "./cpmi-contract";

export type ReasoningTier = "live" | "cache" | "static";

export interface ReasoningOutcome {
  output: ReasoningChainOutput;
  tier: ReasoningTier;
  /** Why a fallback tier was used, when applicable (for the Logger payload). */
  detail?: string;
}

export interface ReasoningDeps {
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
  cacheGet: (key: string) => ReasoningChainOutput | null;
  cacheSet: (key: string, value: ReasoningChainOutput) => void;
}

/** Per-program cache key (one good chain output per program). */
export function reasoningCacheKey(programId: string): string {
  return `CPMI:reasoning:${programId}`;
}

/** Build the two-message conversation: PR-CPMI-001 system prompt + the input as JSON. */
export function buildReasoningMessages(
  input: ReasoningChainInput,
  systemPrompt: string
): SovereignMessage[] {
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(input, null, 2) },
  ];
}

/**
 * Parse the model's output into a SURFACEABLE ReasoningChainOutput, or null. Tolerates a
 * ```json fence. Requires both schema validity and schema_valid===true (spec §3).
 */
export function parseReasoningOutput(content: string): ReasoningChainOutput | null {
  const stripped = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    return null;
  }
  if (!validateReasoningChainOutput(parsed).valid) return null;
  const output = parsed as ReasoningChainOutput;
  return hasSurfaceableOutput(output) ? output : null;
}

/**
 * The honest static-tier output — a MEANINGFUL governance output assembled from the
 * world-model record (live reasoning unavailable). Schema-valid and surfaceable, with
 * low confidence and a recommendation that flags the degraded state. It invents no
 * program data: every field is derived from the supplied world model.
 */
export function staticReasoningOutput(input: ReasoningChainInput): ReasoningChainOutput {
  const wm: WorldModelRecord = input.worldModel;
  return {
    context_summary:
      `${wm.program_name} (${wm.program_id}) — ${wm.status}. Assembled from the world model; ` +
      "the live reasoning chain is unavailable, so this is a degraded output for human review.",
    context_confidence: "low",
    risk_register: wm.flags.map((flag) => ({ risk: flag, severity: "P2" as const, type: "governance" as const })),
    constraint_map: wm.regulatory_context.map((reg) => ({
      constraint: reg,
      permitted: "Actions consistent with the stated regulatory context",
      prohibited: "Actions outside the stated regulatory context",
      requires_approval: "Any change to program scope, ceiling, or schedule baseline",
    })),
    option_set: [
      {
        option: "Convene human governance review before relying on this output",
        cost: "Review cycle time",
        defers: "Automated recommendation until the reasoning service is restored",
        closes: "The risk of acting on a degraded, un-reasoned output",
      },
    ],
    recommendation:
      "Live reasoning is unavailable. Do not treat this as a CPMI recommendation. Convene human " +
      "governance review of the world-model facts above, and re-run the reasoning chain when the " +
      "service is restored.",
    alternatives_considered: ["Re-run the reasoning chain when the service is restored"],
    schema_valid: true,
  };
}

/**
 * Run the six-step reasoning chain with three-tier fallback. Never throws: always
 * returns a surfaceable ReasoningChainOutput tagged with the serving tier. Exactly one
 * live attempt (one createSovereignClient().complete via deps.complete) per chain.
 */
export async function runReasoningChain(
  input: ReasoningChainInput,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: ReasoningDeps
): Promise<ReasoningOutcome> {
  const key = reasoningCacheKey(input.program_id);
  let detail: string | undefined;

  // ---- Tier 1: live ----
  try {
    const response = await deps.complete(buildReasoningMessages(input, systemPrompt), requestContext);
    if (!response.fallback_activated) {
      const output = parseReasoningOutput(response.content);
      if (output) {
        deps.cacheSet(key, output);
        return { output, tier: "live" };
      }
      detail = "live_response_not_surfaceable";
    } else {
      detail = `api_client_fallback_${response.fallback_tier}`;
    }
  } catch (err) {
    detail = err instanceof Error ? err.message : String(err);
  }

  // ---- Tier 2: cache ----
  const cached = deps.cacheGet(key);
  if (cached) {
    return { output: cached, tier: "cache", detail };
  }

  // ---- Tier 3: static (assembled from the world model) ----
  return { output: staticReasoningOutput(input), tier: "static", detail };
}
