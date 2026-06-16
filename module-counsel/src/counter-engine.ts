/**
 * SOVEREIGN Platform — module-counsel
 * counter-engine.ts — the Counterargument Mode orchestration (pure, no React).
 *
 * Implements the platform-standard three-tier fallback at the
 * CounterargumentChallenge level: live (sovereign-api-client returns a response
 * that parses and validates) → cache (the last good challenge for this turn key)
 * → static (a meaningful, schema-valid adversarial template that prompts the user
 * to stress-test their own position — NOT an empty stub; spec §5 air-gap rule).
 *
 * The LLM call and Logger emission are injected (the hook supplies them) so this
 * module is unit-testable in Node with fakes. The LLM is always reached through
 * sovereign-api-client — never the Anthropic API directly (Standing Constraint #5).
 *
 * Version: 1.0 · Session 5 · June 16, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";

import type { AnalysisResult } from "./analysis-contract";
import {
  validateCounterargumentChallenge,
  type CounterargumentChallenge,
} from "./counter-contract";
import type { DecisionFrame } from "./types";

export type CounterTier = "live" | "cache" | "static";

/** A completed adversarial exchange: the engine's challenge and the human's reply. */
export interface CounterargumentExchange {
  challenge: CounterargumentChallenge;
  humanDefense: string;
}

export interface CounterargumentOutcome {
  /** Always a schema-valid challenge, with `source` set to the serving tier. */
  result: CounterargumentChallenge;
  tier: CounterTier;
  /** Why a fallback tier was used, when applicable (for Logger payload). */
  detail?: string;
}

/** The full input the engine needs to produce the next challenge turn. */
export interface CounterargumentInput {
  frame: DecisionFrame;
  analysis: AnalysisResult;
  targetAlternativeId: string;
  /** Completed exchanges so far, in order (empty on the opening turn). */
  priorTurns: CounterargumentExchange[];
  /** The human's latest defense (empty string on the opening turn). */
  humanDefense: string;
}

/** Injected dependencies — the hook wires these to sovereign-api-client + a session cache. */
export interface CounterargumentDeps {
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
  cacheGet: (key: string) => CounterargumentChallenge | null;
  cacheSet: (key: string, value: CounterargumentChallenge) => void;
}

/**
 * Per-turn cache key — stable for the same alternative at the same turn depth in
 * the same workflow step. Turn depth disambiguates successive challenges so a
 * cached opening turn is not replayed for turn three.
 */
export function counterCacheKey(input: CounterargumentInput): string {
  const depth = input.priorTurns.length;
  return `COUNSEL:COUNTER:${input.frame.sovereignContext.workflowStepId}:${input.targetAlternativeId}:turn${depth}`;
}

/** Build the conversation: PR-COUNSEL-002 system prompt + the turn context as JSON. */
export function buildCounterMessages(
  input: CounterargumentInput,
  systemPrompt: string
): SovereignMessage[] {
  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: JSON.stringify(
        {
          decisionFrame: {
            decisionStatement: input.frame.decisionStatement,
            stakes: input.frame.stakes,
            constraints: input.frame.constraints,
            sovereignContext: input.frame.sovereignContext,
          },
          analysis: input.analysis,
          targetAlternativeId: input.targetAlternativeId,
          priorTurns: input.priorTurns,
          humanDefense: input.humanDefense,
        },
        null,
        2
      ),
    },
  ];
}

/**
 * Parse the model's text output into a validated CounterargumentChallenge, or null
 * if it is not parseable / not schema-valid. Tolerates a ```json code fence.
 */
export function parseChallenge(content: string): CounterargumentChallenge | null {
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
  const check = validateCounterargumentChallenge(parsed);
  return check.valid ? (parsed as CounterargumentChallenge) : null;
}

/**
 * A meaningful static fallback — NOT an empty stub. Returns an honest,
 * frame-aware adversarial prompt that names the target alternative and pushes the
 * human to stress-test their own assumptions, with an explicit caution that no
 * live challenge was generated. Always schema-valid.
 */
export function staticChallengeFallback(input: CounterargumentInput): CounterargumentChallenge {
  const alt = input.analysis.alternatives.find((a) => a.id === input.targetAlternativeId);
  const label = alt ? alt.label : input.targetAlternativeId;
  return {
    challengeToPosition:
      `Live counterargument is unavailable, so COUNSEL cannot challenge "${label}" directly. ` +
      "Treat this as a self-administered stress test, not analysis: argue the opposite of your own position out loud and see what survives.",
    weaknesses: [
      "This is a degraded static response — no specific weakness in your position was generated from your frame.",
      "Any weakness you have not yet written down is, for now, unexamined.",
    ],
    strongestOpposingCase:
      "Take the alternative you are NOT choosing and state the single best reason a careful colleague would pick it instead. If you cannot, that is itself a signal.",
    concession:
      `You have already done the work of framing the decision and producing an analysis, which is more rigor than most decisions get — "${label}" is a considered choice, not a reflex.`,
    openQuestions: [
      "What single fact, if it were false, would most weaken your position?",
      "Who disagrees with this choice, and what do they know that you might not?",
    ],
    pressureLevel: "MODERATE",
    source: "static",
  };
}

/**
 * Run one counterargument turn with three-tier fallback. Never throws: it always
 * returns a schema-valid challenge tagged with the tier that served it.
 */
export async function runCounterargument(
  input: CounterargumentInput,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: CounterargumentDeps
): Promise<CounterargumentOutcome> {
  const key = counterCacheKey(input);
  let detail: string | undefined;

  // ---- Tier 1: live ----
  try {
    const response = await deps.complete(buildCounterMessages(input, systemPrompt), requestContext);
    if (!response.fallback_activated) {
      const parsed = parseChallenge(response.content);
      if (parsed) {
        const result: CounterargumentChallenge = { ...parsed, source: "live" };
        deps.cacheSet(key, result);
        return { result, tier: "live" };
      }
      detail = "live_response_failed_schema_validation";
    } else {
      detail = `api_client_fallback_${response.fallback_tier}`;
    }
  } catch (err) {
    detail = err instanceof Error ? err.message : String(err);
  }

  // ---- Tier 2: cache ----
  const cached = deps.cacheGet(key);
  if (cached) {
    return { result: { ...cached, source: "cache" }, tier: "cache", detail };
  }

  // ---- Tier 3: static ----
  return { result: staticChallengeFallback(input), tier: "static", detail };
}
