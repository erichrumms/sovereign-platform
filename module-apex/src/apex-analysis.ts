/**
 * SOVEREIGN Platform — module-apex
 * apex-analysis.ts — the apex.ai-assistant analysis orchestration (pure, no React).
 *
 * apex.ai-assistant is an Analytical agent: it analyses a program's governed data and
 * produces a schema-valid ApexAnalysisOutput (plain-prose narrative + DC-3 risk findings +
 * human-addressed recommendations). It advises only — it never decides and never writes
 * upstream. All LLM access is through createSovereignClient() (Constraint #5); this module
 * stays pure and takes the call as an injected dependency.
 *
 * Three-tier discipline (same family as CPMI): live (the model returns content that parses
 * AND validates AND asserts schema_valid===true) → static (a deterministic, schema-valid
 * analysis assembled from the program record). Never throws. The static tier invents no
 * data — every finding is derived from the supplied ApexProgramRecord — so it doubles as the
 * deterministic CPMI-VRS benchmark output (spec §8, scenarios A/B/C).
 *
 * Version: 1.0 · Session 17 · June 25, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";

import {
  isSurfaceableAnalysis,
  validateApexAnalysisOutput,
  type ApexAnalysisOutput,
  type ApexProgramRecord,
  type ApexReportType,
  type ProvenanceTrend,
  type RiskFinding,
} from "./apex-contract";

export type AnalysisTier = "live" | "static";

export interface AnalysisOutcome {
  output: ApexAnalysisOutput;
  tier: AnalysisTier;
  /** Why the static tier was used, when applicable (for the Logger payload). */
  detail?: string;
}

export interface AnalysisDeps {
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
}

/** RiskFinding.trend has no UNKNOWN; provenance UNKNOWN maps to STABLE for the finding. */
function findingTrend(t: ProvenanceTrend): RiskFinding["trend"] {
  return t === "UNKNOWN" ? "STABLE" : t;
}

/** Build the two-message conversation: PR-APEX-001 system prompt + the program context. */
export function buildAnalysisMessages(
  program: ApexProgramRecord,
  reportType: ApexReportType,
  workflowStep: string,
  systemPrompt: string
): SovereignMessage[] {
  const context = {
    program_id: program.program_id,
    report_type: reportType,
    world_model_record: program,
    workflow_step_id: workflowStep,
  };
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(context, null, 2) },
  ];
}

/** Parse the model's output into a SURFACEABLE ApexAnalysisOutput, or null. Tolerates a fence. */
export function parseAnalysisOutput(content: string): ApexAnalysisOutput | null {
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
  if (!validateApexAnalysisOutput(parsed).valid) return null;
  const output = parsed as ApexAnalysisOutput;
  return isSurfaceableAnalysis(output) ? output : null;
}

/** Human-addressed recommendations (plain prose, each begins "A reviewer should consider..."). */
function recommendationsFor(program: ApexProgramRecord): string[] {
  const recs: string[] = [];
  if (program.status_label === "ON_TRACK") {
    recs.push(
      "A reviewer should consider recording that the program is on track and that no further action is required at this time."
    );
    return recs;
  }
  if (program.status_label === "OFF_TRACK") {
    recs.push(
      "A reviewer should consider escalating this program for a program review, because it is off track on both schedule and cost."
    );
  }
  for (const flag of program.risk_flags) {
    if (flag.provenance.field_label.toLowerCase().includes("regulatory")) {
      recs.push(
        `A reviewer should consider referring the issue "${flag.summary}" for human legal review before any related action proceeds.`
      );
    } else {
      recs.push(
        `A reviewer should consider reviewing the issue "${flag.summary}" and deciding whether a corrective action is needed.`
      );
    }
  }
  if (recs.length === 0) {
    recs.push("A reviewer should consider confirming the program status with the responsible program manager.");
  }
  return recs;
}

/**
 * The deterministic static analysis — schema-valid and surfaceable, assembled only from the
 * program record. Used when live reasoning is unavailable, and as the benchmark output.
 */
export function staticAnalysis(
  program: ApexProgramRecord,
  reportType: ApexReportType,
  workflowStep: string
): ApexAnalysisOutput {
  return {
    program_id: program.program_id,
    report_type: reportType,
    status_narrative: program.status_narrative,
    risk_findings: program.risk_flags.map((flag) => ({
      flag_id: flag.flag_id,
      description: flag.summary,
      source_data: flag.provenance.source_data,
      baseline: flag.provenance.baseline,
      trend: findingTrend(flag.provenance.trend),
      responsible_party: flag.provenance.responsible_party,
      severity: flag.severity,
    })),
    recommendations: recommendationsFor(program),
    schema_valid: true,
    workflow_step_id: workflowStep,
  };
}

/**
 * Run one analysis with live → static fallback. Never throws. Exactly one live attempt
 * (one createSovereignClient().complete via deps.complete) per analysis (spec §3 agent scope).
 */
export async function runApexAnalysis(
  program: ApexProgramRecord,
  reportType: ApexReportType,
  workflowStep: string,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: AnalysisDeps
): Promise<AnalysisOutcome> {
  let detail: string | undefined;
  try {
    const response = await deps.complete(
      buildAnalysisMessages(program, reportType, workflowStep, systemPrompt),
      requestContext
    );
    if (!response.fallback_activated) {
      const output = parseAnalysisOutput(response.content);
      if (output) return { output, tier: "live" };
      detail = "live_response_not_surfaceable";
    } else {
      detail = `api_client_fallback_${response.fallback_tier}`;
    }
  } catch (err) {
    detail = err instanceof Error ? err.message : String(err);
  }
  return { output: staticAnalysis(program, reportType, workflowStep), tier: "static", detail };
}
