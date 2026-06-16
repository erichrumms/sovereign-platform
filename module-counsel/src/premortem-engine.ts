/**
 * SOVEREIGN Platform — module-counsel
 * premortem-engine.ts — the Pre-Mortem Studio orchestration (pure, no React).
 *
 * Implements the platform-standard three-tier fallback at the PreMortemResult
 * level: live (sovereign-api-client returns a response that parses and validates)
 * → cache (the last good pre-mortem for this chosen course) → static (a
 * meaningful, schema-valid pre-mortem template that prompts the user to run the
 * exercise themselves — NOT an empty stub; spec §5 air-gap rule).
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
import { validatePreMortemResult, type PreMortemResult } from "./premortem-contract";
import type { DecisionFrame } from "./types";

export type PreMortemTier = "live" | "cache" | "static";

export interface PreMortemOutcome {
  /** Always a schema-valid PreMortemResult, with `source` set to the serving tier. */
  result: PreMortemResult;
  tier: PreMortemTier;
  /** Why a fallback tier was used, when applicable (for Logger payload). */
  detail?: string;
}

/** The input the studio needs to run the pre-mortem. */
export interface PreMortemInput {
  frame: DecisionFrame;
  analysis: AnalysisResult;
  /** The alternative being committed to. Absent → pre-mortem the decision as a whole. */
  chosenAlternativeId?: string;
}

/** Injected dependencies — the hook wires these to sovereign-api-client + a session cache. */
export interface PreMortemDeps {
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
  cacheGet: (key: string) => PreMortemResult | null;
  cacheSet: (key: string, value: PreMortemResult) => void;
}

/** Per-course cache key — stable for the same chosen alternative in the same step. */
export function preMortemCacheKey(input: PreMortemInput): string {
  const chosen = input.chosenAlternativeId ?? "WHOLE_DECISION";
  return `COUNSEL:PREMORTEM:${input.frame.sovereignContext.workflowStepId}:${chosen}`;
}

/** Build the conversation: PR-COUNSEL-003 system prompt + the pre-mortem context as JSON. */
export function buildPreMortemMessages(
  input: PreMortemInput,
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
          chosenAlternativeId: input.chosenAlternativeId,
        },
        null,
        2
      ),
    },
  ];
}

/**
 * Parse the model's text output into a validated PreMortemResult, or null if it is
 * not parseable / not schema-valid. Tolerates a ```json code fence.
 */
export function parsePreMortem(content: string): PreMortemResult | null {
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
  const check = validatePreMortemResult(parsed);
  return check.valid ? (parsed as PreMortemResult) : null;
}

/**
 * A meaningful static fallback — NOT an empty stub. Returns two honest,
 * frame-aware failure-mode templates that walk the human through the three
 * pre-mortem steps themselves, with an explicit caution that no live pre-mortem
 * was generated. Always schema-valid.
 */
export function staticPreMortemFallback(input: PreMortemInput): PreMortemResult {
  const chosen = input.analysis.alternatives.find((a) => a.id === input.chosenAlternativeId);
  const label = chosen ? chosen.label : "the chosen course";
  return {
    failureModes: [
      {
        id: "FM-1",
        failureNarrative:
          `It is some months from now and "${label}" has clearly failed. Live pre-mortem analysis was ` +
          "unavailable, so COUNSEL cannot reconstruct the specific failure — write the story yourself: " +
          "what is the headline that says this went wrong?",
        rootCauses: [
          "This is a degraded static response — no frame-specific cause was generated.",
          "Ask: which single assumption in the analysis, if wrong, breaks this choice?",
        ],
        earlyWarnings: [
          "What is the first observable sign you would expect to see if this is going wrong?",
        ],
        preventiveActions: [
          "Define, in advance, the trip-wire that would make you stop and re-decide.",
        ],
        severity: "HIGH",
        likelihood: "MODERATE",
      },
      {
        id: "FM-2",
        failureNarrative:
          "A second, different way this could fail — for example, the choice succeeds on its own terms " +
          "but creates a downstream problem nobody owns.",
        rootCauses: ["Consider second-order effects the analysis did not score."],
        earlyWarnings: ["Who would be the first to feel a downstream cost, and are you listening to them?"],
        preventiveActions: ["Name an owner for the downstream effect before you commit."],
        severity: "MODERATE",
        likelihood: "MODERATE",
      },
    ],
    overallVulnerability: "MODERATE",
    topPreventiveAction:
      "COUNSEL's pre-mortem service is unavailable, so this is a degraded static template. " +
      "Run the three steps yourself — imagine the failure, name its causes, set a trip-wire — and " +
      "re-run the pre-mortem when the service is restored before treating this as complete.",
    source: "static",
  };
}

/**
 * Run the pre-mortem with three-tier fallback. Never throws: it always returns a
 * schema-valid PreMortemResult tagged with the tier that served it.
 */
export async function runPreMortem(
  input: PreMortemInput,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: PreMortemDeps
): Promise<PreMortemOutcome> {
  const key = preMortemCacheKey(input);
  let detail: string | undefined;

  // ---- Tier 1: live ----
  try {
    const response = await deps.complete(buildPreMortemMessages(input, systemPrompt), requestContext);
    if (!response.fallback_activated) {
      const parsed = parsePreMortem(response.content);
      if (parsed) {
        const result: PreMortemResult = { ...parsed, source: "live" };
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
  return { result: staticPreMortemFallback(input), tier: "static", detail };
}
