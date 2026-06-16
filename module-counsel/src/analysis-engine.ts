/**
 * SOVEREIGN Platform — module-counsel
 * analysis-engine.ts — the Analysis Engine orchestration (pure, no React).
 *
 * Implements the platform-standard three-tier fallback at the AnalysisResult
 * level: live (sovereign-api-client returns a live response whose content parses
 * and validates as an AnalysisResult) -> cache (the last good AnalysisResult for
 * this frame) -> static (a meaningful, schema-valid template; spec §5 air-gap:
 * "a structured placeholder instructing the user to proceed with caution — not an
 * empty stub").
 *
 * The LLM call and Logger emission are injected (the hook supplies them) so this
 * module is unit-testable in a Node environment with fakes. The LLM itself is
 * always reached through sovereign-api-client — never the Anthropic API directly.
 *
 * Version: 1.0 · Session 4 · June 15, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";

import { validateAnalysisResult, type AnalysisResult } from "./analysis-contract";
import type { DecisionFrame } from "./types";

export type AnalysisTier = "live" | "cache" | "static";

export interface AnalysisOutcome {
  /** Always a schema-valid AnalysisResult, with `source` set to the serving tier. */
  result: AnalysisResult;
  tier: AnalysisTier;
  /** Why a fallback tier was used, when applicable (for Logger payload). */
  detail?: string;
}

/** Injected dependencies — the hook wires these to sovereign-api-client + a session cache. */
export interface AnalysisDeps {
  /** Live tier. May reject (e.g. no API key) — the engine routes that to fallback. */
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
  cacheGet: (key: string) => AnalysisResult | null;
  cacheSet: (key: string, value: AnalysisResult) => void;
}

/** Per-frame cache key — stable for the same decision in the same workflow step. */
export function frameCacheKey(frame: DecisionFrame): string {
  return `COUNSEL:${frame.sovereignContext.workflowStepId}:${frame.decisionStatement.trim()}`;
}

/** Build the two-message conversation: PR-COUNSEL-001 system prompt + the frame as JSON. */
export function buildAnalysisMessages(
  frame: DecisionFrame,
  systemPrompt: string
): SovereignMessage[] {
  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: JSON.stringify(
        {
          decisionStatement: frame.decisionStatement,
          stakes: frame.stakes,
          constraints: frame.constraints,
          sovereignContext: frame.sovereignContext,
        },
        null,
        2
      ),
    },
  ];
}

/**
 * Parse the model's text output into a validated AnalysisResult, or null if it is
 * not parseable / not schema-valid. Tolerates a ```json code fence.
 */
export function parseAnalysis(content: string): AnalysisResult | null {
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
  const check = validateAnalysisResult(parsed);
  return check.valid ? (parsed as AnalysisResult) : null;
}

/**
 * A meaningful static fallback — NOT an empty stub. Returns three honest,
 * frame-agnostic options with explicit caution, a low confidence score, and an
 * assumption flag stating that live analysis was unavailable. Always schema-valid.
 */
export function staticAnalysisFallback(frame: DecisionFrame): AnalysisResult {
  return {
    alternatives: [
      {
        id: "ALT-1",
        label: "Proceed with independent verification",
        summary:
          "Act on the decision only after independently verifying the facts the live analysis could not check.",
        pros: ["Keeps work moving", "Forces a human verification step"],
        cons: ["No AI-generated risk analysis was available", "Verification burden falls entirely on the human"],
      },
      {
        id: "ALT-2",
        label: "Defer until decision support is restored",
        summary: "Hold the decision until COUNSEL's analysis service is available and re-run the analysis.",
        pros: ["Avoids acting without structured analysis", "Lowest risk of an unexamined error"],
        cons: ["Introduces delay", "May miss a time-sensitive window"],
      },
      {
        id: "ALT-3",
        label: "Escalate to a human reviewer",
        summary: "Route the decision to a colleague or supervisor for a second human judgment in lieu of AI analysis.",
        pros: ["Adds human oversight", "Distributes accountability"],
        cons: ["Consumes reviewer time", "Reviewer may also lack full context"],
      },
    ],
    riskScenarios: [
      { alternativeId: "ALT-1", scenario: "Verification is incomplete and a flawed decision proceeds.", severity: "HIGH" },
      { alternativeId: "ALT-2", scenario: "The delay causes a missed deadline or downstream impact.", severity: "MODERATE" },
      { alternativeId: "ALT-3", scenario: "Escalation stalls in a reviewer backlog.", severity: "LOW" },
    ],
    assumptionFlags: [
      {
        assumption: "Live AI decision support was available.",
        concern:
          "It was NOT — this is a static fallback. No alternatives were generated from your specific frame. Treat this as a caution checklist, not analysis.",
      },
    ],
    confidenceScore: 5,
    recommendedNextAction:
      `COUNSEL's analysis service is unavailable, so this is a degraded static response for "${frame.decisionStatement}". ` +
      "Do not treat it as analysis of your specific decision. Verify independently, defer, or escalate to a human reviewer, and re-run the analysis when the service is restored.",
    source: "static",
  };
}

/**
 * Run the analysis with three-tier fallback. Never throws: it always returns a
 * schema-valid AnalysisResult tagged with the tier that served it.
 */
export async function runAnalysis(
  frame: DecisionFrame,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: AnalysisDeps
): Promise<AnalysisOutcome> {
  const key = frameCacheKey(frame);
  let detail: string | undefined;

  // ---- Tier 1: live ----
  try {
    const response = await deps.complete(buildAnalysisMessages(frame, systemPrompt), requestContext);
    if (!response.fallback_activated) {
      const parsed = parseAnalysis(response.content);
      if (parsed) {
        const result: AnalysisResult = { ...parsed, source: "live" };
        deps.cacheSet(key, result);
        return { result, tier: "live" };
      }
      detail = "live_response_failed_schema_validation";
    } else {
      // The api-client itself fell back (its own cache/static) — its content is
      // not a COUNSEL AnalysisResult, so treat live as unavailable.
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
  return { result: staticAnalysisFallback(frame), tier: "static", detail };
}
