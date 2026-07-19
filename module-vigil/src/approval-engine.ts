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

/** Plain-prose "what changes" sentence per action type — no field-dump. */
function describeWhatChanges(
  actionType: string,
  agentId: string,
  detail: Record<string, unknown>
): string {
  switch (actionType) {
    case "model_deployment": {
      const model = typeof detail.model === "string" ? `"${detail.model}"` : "a model";
      const target = typeof detail.target_product === "string" ? ` to ${detail.target_product}` : "";
      const replaces = typeof detail.replaces_version === "string"
        ? `, replacing version ${detail.replaces_version}` : "";
      return `${agentId} will deploy model ${model}${target}${replaces}. Once deployed, the model begins serving requests in its assigned surface.`;
    }
    case "data_export": {
      const dataset = typeof detail.dataset === "string" ? `"${detail.dataset}"` : "a dataset";
      const count = typeof detail.record_count === "number" ? ` (${detail.record_count} records)` : "";
      const dest = typeof detail.destination === "string" ? ` to "${detail.destination}"` : "";
      return `${agentId} will export ${dataset}${count}${dest}. This moves data outside the current platform boundary.`;
    }
    case "configuration_change": {
      const param = typeof detail.parameter === "string" ? `"${detail.parameter}"` : "a platform parameter";
      const from = detail.from !== undefined ? `from ${JSON.stringify(detail.from)} ` : "";
      const to = detail.to !== undefined ? `to ${JSON.stringify(detail.to)}` : "a new value";
      return `${agentId} will change ${param} ${from}${to}. Review the before/after values before approving.`;
    }
    case "send_formal_escalation_notice": {
      const employee = typeof detail.employee_id === "string" ? detail.employee_id : "an employee";
      const category = typeof detail.rule_category === "string"
        ? detail.rule_category.toLowerCase().replace(/_/g, " ") : "a compliance issue";
      const count = typeof detail.recurrence_count === "number"
        ? `${detail.recurrence_count} time(s)` : "multiple times";
      return `${agentId} will send a formal escalation notice to the supervisor of ${employee} regarding ${category}, which has recurred ${count} in the current review window. This creates an official record and notifies the supervisor directly.`;
    }
    case "ppbe_obligation": {
      const program = typeof detail.program_id === "string" ? `program ${detail.program_id}` : "a program";
      const amount = typeof detail.amount === "number"
        ? `$${detail.amount.toLocaleString()}` : "an unspecified amount";
      const costCode = typeof detail.cost_code === "string" ? ` against cost code ${detail.cost_code}` : "";
      const obligationId = typeof detail.obligation_id === "string" ? ` (${detail.obligation_id})` : "";
      return `${agentId} will record a financial obligation of ${amount}${obligationId} against ${program}${costCode}. Once approved, this becomes part of the program's execution record.`;
    }
    case "ppbe_phase_transition": {
      const from = detail.from_phase !== undefined ? `Phase ${String(detail.from_phase)}` : "the current phase";
      const to = detail.to_phase !== undefined ? `Phase ${String(detail.to_phase)}` : "the next phase";
      return `${agentId} will transition the PPBE workflow from ${from} to ${to}. This closes the current phase and authorizes the next phase to begin.`;
    }
    default: {
      const entries = Object.entries(detail);
      if (entries.length === 0) {
        return `${agentId} will perform "${actionType}". No additional detail was provided with this request.`;
      }
      const fields = entries
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
        .join("; ");
      return `${agentId} will perform "${actionType}". Request detail: ${fields}.`;
    }
  }
}

/**
 * The honest static-tier brief — assembled from the request fields (the agent service
 * is unavailable). Same labeled sections as the prompt; plain prose per action type
 * rather than a field-dump. No recommendation, no invented detail.
 */
export function staticBrief(request: AgentApprovalRequest): string {
  const whatChanges = describeWhatChanges(
    request.action_type,
    request.requesting_agent_id,
    request.action_detail
  );
  return [
    "The vigil-approval-agent service is unavailable — this brief was assembled directly " +
      "from the request fields and may not include the agent's own analysis.",
    "",
    `REQUESTED ACTION: ${request.requesting_agent_id} is requesting to perform "${request.action_type}".`,
    `WHAT CHANGES: ${whatChanges}`,
    "REVERSIBILITY: Confirm whether this action can be reversed before approving — " +
      "the agent service is unavailable and could not assess reversibility for this request.",
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
