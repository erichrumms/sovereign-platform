/**
 * SOVEREIGN Platform — module-vigil
 * triage-engine.ts — the Anomaly Triage orchestration (pure, no React).
 *
 * Platform-standard three-tier fallback for the single triage call: live
 * (sovereign-api-client returns content that parses + validates as a TriageBrief) →
 * cache (the last good brief for this alert) → static (a MEANINGFUL, alert-type-
 * specific investigation checklist — spec §3.4: "Static Tier 3 templates must be
 * meaningful ... not an empty stub"). Exactly one live attempt per call, always
 * through sovereign-api-client (Standing Constraint #5). Never throws.
 *
 * The static tier is conservative by construction: it does not claim a low
 * false-positive likelihood it cannot justify — it returns a neutral score and an
 * explanation that says triage ran degraded, so the operator does not mistake a
 * fallback for a confident assessment.
 *
 * Version: 1.0 · Session 7 · June 18, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";

import type { AnomalyContext, AlertType } from "./vigil-types";
import { validateTriageBrief, type TriageBrief } from "./triage-contract";

export type TriageTier = "live" | "cache" | "static";

export interface TriageOutcome {
  /** The schema-valid triage brief (advisory — the operator decides). */
  brief: TriageBrief;
  tier: TriageTier;
  /** Why a fallback tier was used, when applicable (for the Logger payload). */
  detail?: string;
}

export interface TriageDeps {
  /** Live tier. May reject (e.g. no API key) — the engine routes that to fallback. */
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
  cacheGet: (key: string) => TriageBrief | null;
  cacheSet: (key: string, value: TriageBrief) => void;
}

/** Per-alert cache key (one triage brief per alert). */
export function triageCacheKey(alertId: string): string {
  return `VIGIL:triage:${alertId}`;
}

/** Build the two-message conversation: PR-VIGIL-001 system prompt + the AnomalyContext as JSON. */
export function buildTriageMessages(
  context: AnomalyContext,
  systemPrompt: string
): SovereignMessage[] {
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(context, null, 2) },
  ];
}

/**
 * Parse the model's text output into a validated TriageBrief, or null if it is not
 * parseable / not the expected shape. Tolerates a ```json fence.
 */
export function parseTriageBrief(content: string): TriageBrief | null {
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
  return validateTriageBrief(parsed).valid ? (parsed as TriageBrief) : null;
}

/**
 * The meaningful static-tier checklist for an alert type (spec §3.4). Each is a real
 * investigation checklist, not an empty stub. The false-positive score is neutral
 * (50) with an explanation that triage ran degraded — the operator must judge.
 */
export function staticTriageChecklist(alertType: AlertType): TriageBrief {
  const common = {
    false_positive_likelihood: 50,
    false_positive_explanation:
      "Static fallback (live triage analysis unavailable). This is a neutral placeholder, " +
      "not an assessment — the operator must judge the false-positive likelihood from the " +
      "investigation steps below.",
  };

  switch (alertType) {
    case "ANOMALY_DETECTED":
      return {
        likely_causes: [
          { cause: "Event scored outside the product's IsolationForest baseline", likelihood: "unranked (static fallback)" },
          { cause: "Legitimate behavioural shift in the underlying data", likelihood: "unranked (static fallback)" },
          { cause: "Configuration or prompt change altering baseline behaviour", likelihood: "unranked (static fallback)" },
        ],
        recommended_steps: [
          "Confirm the triggering Logger event and its anomaly score against the product baseline.",
          "Review the ±30-minute Logger events around the trigger for a precipitating change.",
          "Check whether a prompt or configuration change shipped to this product recently.",
          "Compare against prior alerts of the same type for this product to spot a pattern.",
        ],
        ...common,
      };
    case "CPMI_DRIFT_DETECTED":
      return {
        likely_causes: [
          { cause: "Configuration drift in CPMI's governance parameters", likelihood: "unranked (static fallback)" },
          { cause: "Prompt injection in content CPMI processed", likelihood: "unranked (static fallback)" },
          { cause: "Genuine reasoning instability in the CPMI reasoning chain", likelihood: "unranked (static fallback)" },
        ],
        recommended_steps: [
          "Treat as platform-wide: CPMI governance outputs flow to all six products (Integration Brief §7).",
          "Assess only whether the anomaly PATTERN matches drift / injection / instability — NOT whether CPMI's reasoning is correct (only CPMI-VRS Gate 3 judges that).",
          "Review CPMI reasoning-chain Logger events around the trigger for an input or parameter change.",
          "Escalate to CPMI-VRS Gate 3 human oversight if reasoning quality is in question.",
        ],
        ...common,
      };
    case "CASCADE_RISK":
      return {
        likely_causes: [
          { cause: "Multiple correlated anomalies across products within the rolling window", likelihood: "unranked (static fallback)" },
          { cause: "A shared upstream dependency degrading several products at once", likelihood: "unranked (static fallback)" },
          { cause: "Coincidental independent anomalies inflating the cascade signal", likelihood: "unranked (static fallback)" },
        ],
        recommended_steps: [
          "Enumerate the contributing alerts and the products they originate from.",
          "Identify any shared dependency (CPMI world model, a common data source) across the contributors.",
          "Check timing: do the contributors cluster around a single triggering event?",
          "If CPMI is among the contributors, treat the cascade at elevated (platform-wide) priority.",
        ],
        ...common,
      };
    default:
      // Triage is only offered for the eligible types above (spec §2.3); this branch
      // is defensive so the engine never throws on an unexpected type.
      return {
        likely_causes: [
          { cause: "Unclassified anomaly — alert type not eligible for AI triage", likelihood: "unranked (static fallback)" },
        ],
        recommended_steps: [
          "Confirm the alert type. The Anomaly Triage Assistant is available only for ANOMALY_DETECTED, CPMI_DRIFT_DETECTED, and CASCADE_RISK (spec §2.3).",
          "Investigate this alert directly through its Logger event and source product.",
        ],
        ...common,
      };
  }
}

/**
 * Run the triage analysis with three-tier fallback. Never throws: always returns a
 * schema-valid TriageBrief tagged with the serving tier. Exactly one live attempt
 * (one createSovereignClient().complete via deps.complete) per call.
 */
export async function runTriageAnalysis(
  context: AnomalyContext,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: TriageDeps
): Promise<TriageOutcome> {
  const key = triageCacheKey(context.alert.alertId);
  let detail: string | undefined;

  // ---- Tier 1: live ----
  try {
    const response = await deps.complete(buildTriageMessages(context, systemPrompt), requestContext);
    if (!response.fallback_activated) {
      const brief = parseTriageBrief(response.content);
      if (brief) {
        deps.cacheSet(key, brief);
        return { brief, tier: "live" };
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
    return { brief: cached, tier: "cache", detail };
  }

  // ---- Tier 3: static (alert-type-specific checklist) ----
  return { brief: staticTriageChecklist(context.alert.alertType), tier: "static", detail };
}
