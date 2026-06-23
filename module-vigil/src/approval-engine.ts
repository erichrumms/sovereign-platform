/**
 * SOVEREIGN Platform — module-vigil
 * approval-engine.ts — the Agent Approval brief orchestration (pure, no React).
 *
 * Platform-standard three-tier fallback for the single brief call: live
 * (sovereign-api-client returns a usable labeled-section brief) → cache (the last good
 * brief for this request) → static (a MEANINGFUL brief assembled directly from the
 * request fields — not an empty stub). Exactly one live attempt per call, always
 * through sovereign-api-client (Standing Constraint #5). Never throws.
 *
 * The static tier is honest and useful: because the request is fully structured, the
 * brief is assembled from it (REQUESTED ACTION / WHAT CHANGES / REVERSIBILITY / RISK
 * CLASSIFICATION / AGENT CONTEXT), prefixed with a notice that the live agent was
 * unavailable. It never invents action detail or a recommendation.
 *
 * Version: 1.0 · Session 10 · June 23, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";

import {
  hasUsableBrief,
  type AgentApprovalRequest,
} from "./approval-contract";

export type BriefTier = "live" | "cache" | "static";

export interface BriefOutcome {
  brief: string;
  tier: BriefTier;
  /** Why a fallback tier was used, when applicable (for the Logger payload). */
  detail?: string;
}

export interface BriefDeps {
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
  cacheGet: (key: string) => string | null;
  cacheSet: (key: string, value: string) => void;
}

/** Per-request cache key (one brief per request). */
export function briefCacheKey(requestId: string): string {
  return `VIGIL:approval-brief:${requestId}`;
}

/** Build the two-message conversation: PR-VIGIL-002 system prompt + the request as JSON. */
export function buildBriefMessages(
  request: AgentApprovalRequest,
  systemPrompt: string
): SovereignMessage[] {
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(request, null, 2) },
  ];
}

/** Strip a ```fence and trim; return the brief text, or null if empty/unusable. */
export function parseBrief(content: string): string | null {
  const stripped = content
    .trim()
    .replace(/^```(?:\w+)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return hasUsableBrief(stripped) ? stripped : null;
}

/** One-sentence rationale for each risk window (spec §4.1). */
const RISK_RATIONALE: Record<AgentApprovalRequest["risk_classification"], string> = {
  P1: "P1 — highest consequence; a 15-minute decision window applies.",
  P2: "P2 — significant; a 60-minute decision window applies.",
  P3: "P3 — routine; a 4-hour decision window applies.",
};

/**
 * The honest static-tier brief — assembled from the request fields (the agent service
 * is unavailable). Same labeled sections as the prompt; no recommendation, no invented
 * detail. The operator still has a complete, accurate brief to decide from.
 */
export function staticBrief(request: AgentApprovalRequest): string {
  const detailLines = Object.entries(request.action_detail)
    .map(([k, v]) => `  - ${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join("\n");
  return [
    "[Brief assembled directly from the request — the vigil-approval-agent service is " +
      "unavailable. The fields below are the request as submitted, not a generated analysis.]",
    "",
    `REQUESTED ACTION: ${request.requesting_agent_id} requests "${request.action_type}".`,
    `WHAT CHANGES: The action carries this detail:\n${detailLines || "  - (no structured detail provided)"}`,
    "REVERSIBILITY: Not stated by the agent service (unavailable) — confirm reversibility before approving.",
    `RISK CLASSIFICATION: ${RISK_RATIONALE[request.risk_classification]}`,
    `AGENT CONTEXT: ${request.context ?? "None provided"}`,
  ].join("\n");
}

/**
 * Run the brief generation with three-tier fallback. Never throws: always returns a
 * usable brief tagged with the serving tier. Exactly one live attempt per call.
 */
export async function runApprovalBrief(
  request: AgentApprovalRequest,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: BriefDeps
): Promise<BriefOutcome> {
  const key = briefCacheKey(request.request_id);
  let detail: string | undefined;

  // ---- Tier 1: live ----
  try {
    const response = await deps.complete(buildBriefMessages(request, systemPrompt), requestContext);
    if (!response.fallback_activated) {
      const brief = parseBrief(response.content);
      if (brief) {
        deps.cacheSet(key, brief);
        return { brief, tier: "live" };
      }
      detail = "live_response_unusable_brief";
    } else {
      detail = `api_client_fallback_${response.fallback_tier}`;
    }
  } catch (err) {
    detail = err instanceof Error ? err.message : String(err);
  }

  // ---- Tier 2: cache ----
  const cached = deps.cacheGet(key);
  if (cached) {
    return { brief: cached, tier: "cache", detail };
  }

  // ---- Tier 3: static (assembled from the request) ----
  return { brief: staticBrief(request), tier: "static", detail };
}
