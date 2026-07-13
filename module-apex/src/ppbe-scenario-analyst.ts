/**
 * SOVEREIGN Platform — module-apex
 * ppbe-scenario-analyst.ts — PPBE workflow layer, Session 32 (Full Cycle).
 *
 * ppbe-scenario-analyst (Analytical, LLM-BACKED — Agent Identity Standard,
 * D-P5; prompt ppbe/prompts/scenario_analysis_system.md, PENDING, authored this
 * session per the July 12 AGENT_REFERENCE.md reassignment). Runs on APEX /
 * AgentOS infrastructure. Models alternative resource allocations and their
 * projected performance and risk implications across program portfolios
 * (docs/18 §7.2); output feeds COUNSEL's decision framing for high-stakes
 * programming decisions.
 *
 * ADVISORY ONLY (docs/18 §6 Tier A): every report carries the mandatory
 * scenario-modeling label — never a decision, never a recommendation to
 * execute. All programming decisions require human approval; the analyst never
 * executes allocations, modifies program data, or authorizes anything, and it
 * never invokes other agents — COUNSEL consumption is wired at host/e2e level
 * (Constraint #11: modules cannot import each other).
 *
 * PORTFOLIO TRACEABILITY ENFORCED STRUCTURALLY: the validator rejects any
 * scenario whose allocation changes name a program not present in the supplied
 * portfolio — a fabricated program can never reach a reviewer or COUNSEL.
 *
 * All LLM access through the injected complete() (createSovereignClient —
 * Constraint #5); live → static tiers, one live attempt per call, same
 * discipline as apex-analysis.ts / ppbe-evidence-synthesizer.ts.
 *
 * Version: 1.0 · Session 32 · July 12, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";
import type { ProgramRecord, ValidationResult } from "@sovereign/data";

// ============================================================
// AGENT ID + PROMPT REGISTRY BINDING (Constraints #9 / #10)
// ============================================================

export const PPBE_SCENARIO_ANALYST_AGENT_ID = "ppbe-scenario-analyst";

/** Registry binding stamped onto Logger events as prompt provenance (AIS D-P5). */
export const PPBE_SCENARIO_PROMPT_REGISTRATION = {
  file: "ppbe/prompts/scenario_analysis_system.md",
  promptVersion: "v1.0",
  /** PENDING — synthetic-data use only until the Project Principal approves. */
  status: "PENDING",
} as const;

/** The mandatory scenario-modeling label (registry: "labeled clearly as AI-generated
 *  scenario modeling, not a decision or recommendation to execute"). */
export const PPBE_SCENARIO_LABEL =
  "AI-generated scenario modeling — not a decision or a recommendation to execute";

export type ScenarioConfidence = "LOW" | "MODERATE" | "HIGH";

const CONFIDENCE_VALUES: readonly ScenarioConfidence[] = ["LOW", "MODERATE", "HIGH"];

// ============================================================
// SCENARIO REPORT SHAPE
// ============================================================

/** One program's allocation under a scenario — whole currency units. */
export interface AllocationChange {
  /** Must exist in the supplied portfolio. */
  program_id: string;
  current_allocation: number;
  proposed_allocation: number;
}

/** One modeled alternative. */
export interface PPBEScenario {
  /** Plain prose (Gap 5), e.g. "Level funding across the portfolio". */
  scenario_name: string;
  allocation_changes: AllocationChange[];
  /** Plain prose, grounded in supplied baselines. */
  projected_performance_impact: string;
  /** Plain prose — the risk and its mechanism. */
  projected_risk_implications: string;
  /** Honestly calibrated — thin data means LOW. */
  confidence: ScenarioConfidence;
}

/** The scenario report — advisory, labeled, consumed by COUNSEL and humans. */
export interface PPBEScenarioReport {
  report_title: string;
  fiscal_context: string;
  /** Plain prose — current planned allocations, from the supplied records only. */
  baseline_description: string;
  /** At least two — modeling one option is advocacy, not analysis. */
  scenarios: PPBEScenario[];
  /** Must equal PPBE_SCENARIO_LABEL exactly. */
  scenario_label: string;
  workflow_step_id: string;
  schema_valid: boolean;
}

/** One modeling pass — governed data only. */
export interface ScenarioAnalysisInput {
  /** The portfolio under review (data-dictionary ProgramRecord, read-only). */
  programs: ProgramRecord[];
  /** Plain prose, spelled-out fiscal years (Gap 5). */
  fiscal_context: string;
  /** A constraint the request states (e.g. "total may not exceed the FY 2027 plan"). */
  constraint?: string;
  /** Supplied by the originating flow, or synthesized (Constraint #6). */
  workflowStepId?: string;
}

export type ScenarioTier = "live" | "static";

export interface ScenarioOutcome {
  report: PPBEScenarioReport;
  tier: ScenarioTier;
  detail?: string;
}

export interface ScenarioDeps {
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
}

// ============================================================
// WORKFLOW STEP (Constraint #6)
// ============================================================

export function scenarioWorkflowStep(input: ScenarioAnalysisInput): string {
  if (input.workflowStepId) return input.workflowStepId;
  const programs = [...new Set(input.programs.map((p) => p.program_id))].sort();
  return `ppbe-scenario-analysis-${programs.join("-") || "no-programs"}`;
}

/** A program's current planned allocation — the sum of its obligation plan. */
export function plannedAllocation(program: ProgramRecord): number {
  return program.obligation_plan.reduce((sum, entry) => sum + entry.planned_amount, 0);
}

// ============================================================
// VALIDATION — no fabricated programs, at least two alternatives
// ============================================================

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}

export function validatePPBEScenarioReport(
  value: unknown,
  portfolio: readonly ProgramRecord[]
): ValidationResult {
  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["scenario report must be a non-null object"] };
  }
  const r = value as Partial<PPBEScenarioReport>;
  const errors: string[] = [];
  const knownPrograms = new Set(portfolio.map((p) => p.program_id));

  for (const key of [
    "report_title",
    "fiscal_context",
    "baseline_description",
    "workflow_step_id",
  ] as const) {
    if (!isNonEmptyString(r[key])) errors.push(`${key}: required non-empty string`);
  }
  if (r.scenario_label !== PPBE_SCENARIO_LABEL) {
    errors.push(`scenario_label: must be exactly "${PPBE_SCENARIO_LABEL}"`);
  }
  if (typeof r.schema_valid !== "boolean") errors.push("schema_valid: required boolean");

  if (!Array.isArray(r.scenarios)) {
    errors.push("scenarios: required array");
  } else {
    if (r.scenarios.length < 2) {
      errors.push("scenarios: at least two alternatives are required — one option is advocacy, not analysis");
    }
    r.scenarios.forEach((s, i) => {
      if (typeof s !== "object" || s === null) {
        errors.push(`scenarios[${i}]: must be an object`);
        return;
      }
      const sc = s as Partial<PPBEScenario>;
      if (!isNonEmptyString(sc.scenario_name)) errors.push(`scenarios[${i}].scenario_name: required`);
      if (!isNonEmptyString(sc.projected_performance_impact)) {
        errors.push(`scenarios[${i}].projected_performance_impact: required`);
      }
      if (!isNonEmptyString(sc.projected_risk_implications)) {
        errors.push(`scenarios[${i}].projected_risk_implications: required`);
      }
      if (!CONFIDENCE_VALUES.includes(sc.confidence as ScenarioConfidence)) {
        errors.push(`scenarios[${i}].confidence: must be one of ${CONFIDENCE_VALUES.join(", ")}`);
      }
      if (!Array.isArray(sc.allocation_changes) || sc.allocation_changes.length === 0) {
        errors.push(`scenarios[${i}].allocation_changes: at least one entry is required`);
      } else {
        sc.allocation_changes.forEach((a, j) => {
          const change = a as Partial<AllocationChange>;
          if (!isNonEmptyString(change.program_id) || !knownPrograms.has(change.program_id)) {
            errors.push(
              `scenarios[${i}].allocation_changes[${j}].program_id: "${String(change.program_id)}" is not in the supplied portfolio — fabricated program`
            );
          }
          if (typeof change.current_allocation !== "number" || change.current_allocation < 0) {
            errors.push(`scenarios[${i}].allocation_changes[${j}].current_allocation: must be a non-negative number`);
          }
          if (typeof change.proposed_allocation !== "number" || change.proposed_allocation < 0) {
            errors.push(`scenarios[${i}].allocation_changes[${j}].proposed_allocation: must be a non-negative number`);
          }
        });
      }
    });
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

// ============================================================
// MESSAGES + PARSING
// ============================================================

export function buildScenarioMessages(
  input: ScenarioAnalysisInput,
  systemPrompt: string
): SovereignMessage[] {
  const payload = {
    fiscal_context: input.fiscal_context,
    constraint: input.constraint ?? null,
    program_records: input.programs,
    workflow_step_id: scenarioWorkflowStep(input),
  };
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(payload, null, 2) },
  ];
}

export function parseScenarioReport(
  content: string,
  portfolio: readonly ProgramRecord[]
): PPBEScenarioReport | null {
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
  if (!validatePPBEScenarioReport(parsed, portfolio).valid) return null;
  const report = parsed as PPBEScenarioReport;
  return report.schema_valid === true ? report : null;
}

// ============================================================
// STATIC TIER — deterministic arithmetic over the supplied plans
// ============================================================

/**
 * The deterministic static scenario report: a level-funding baseline scenario
 * and a uniform ten-percent-reduction scenario, both computed by plain
 * arithmetic over the supplied obligation plans. Invents nothing; every prose
 * field says what was computed and that no live reasoning was involved.
 */
export function staticScenarioReport(input: ScenarioAnalysisInput): PPBEScenarioReport {
  const wsid = scenarioWorkflowStep(input);
  const sorted = [...input.programs].sort((a, b) => a.program_id.localeCompare(b.program_id));
  const allocations = sorted.map((p) => ({ program: p, planned: plannedAllocation(p) }));
  const total = allocations.reduce((sum, a) => sum + a.planned, 0);

  const levelChanges: AllocationChange[] = allocations.map((a) => ({
    program_id: a.program.program_id,
    current_allocation: a.planned,
    proposed_allocation: a.planned,
  }));
  const reducedChanges: AllocationChange[] = allocations.map((a) => ({
    program_id: a.program.program_id,
    current_allocation: a.planned,
    proposed_allocation: Math.round(a.planned * 0.9),
  }));

  return {
    report_title: `Scenario analysis — ${input.fiscal_context}`,
    fiscal_context: input.fiscal_context,
    baseline_description:
      sorted.length === 0
        ? "No program records were supplied — there is no baseline to describe."
        : `The portfolio holds ${sorted.length} ${sorted.length === 1 ? "program" : "programs"} with a ` +
          `combined planned allocation of ${total} across their obligation plans. This static report was ` +
          `assembled by arithmetic only, without live reasoning.`,
    scenarios: [
      {
        scenario_name: "Continue as planned (level funding)",
        allocation_changes: levelChanges,
        projected_performance_impact:
          "Each program proceeds against its recorded performance baseline. This static tier cannot " +
          "project beyond the recorded baselines — a reviewer should read them directly.",
        projected_risk_implications:
          "Risks recorded against the current plan remain as recorded. This scenario was not " +
          "risk-analyzed by live reasoning; treat its risk picture as unassessed rather than clean.",
        confidence: "LOW",
      },
      {
        scenario_name: "Uniform ten percent reduction across the portfolio",
        allocation_changes: reducedChanges,
        projected_performance_impact:
          "Every program's planned obligations are reduced by ten percent, computed by arithmetic. " +
          "The performance effect of that reduction is not assessed by this static tier.",
        projected_risk_implications:
          "A uniform reduction ignores programs' differing tolerance for cuts — the mechanism of risk " +
          "is that high-dependency programs absorb the same cut as low-dependency ones. Unassessed " +
          "beyond that structural observation.",
        confidence: "LOW",
      },
    ],
    scenario_label: PPBE_SCENARIO_LABEL,
    workflow_step_id: wsid,
    schema_valid: true,
  };
}

// ============================================================
// ENGINE — live → static, one live attempt, never throws
// ============================================================

export async function runScenarioAnalysis(
  input: ScenarioAnalysisInput,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: ScenarioDeps
): Promise<ScenarioOutcome> {
  let detail: string | undefined;
  try {
    const response = await deps.complete(buildScenarioMessages(input, systemPrompt), requestContext);
    if (!response.fallback_activated) {
      const report = parseScenarioReport(response.content, input.programs);
      if (report) return { report, tier: "live" };
      detail = "live_response_not_surfaceable";
    } else {
      detail = `api_client_fallback_${response.fallback_tier}`;
    }
  } catch (err) {
    detail = err instanceof Error ? err.message : String(err);
  }
  return { report: staticScenarioReport(input), tier: "static", detail };
}

// ============================================================
// COUNSEL FRAMING — the shape a host hands to COUNSEL's Decision
// Framer (host/e2e wiring only; Constraint #11 — no module import)
// ============================================================

/** One alternative as COUNSEL's decision framing consumes it. */
export interface ScenarioFramingAlternative {
  name: string;
  /** Plain prose summary of the modeled scenario. */
  summary: string;
}

/** The framing package a host carries from this analyst into COUNSEL. */
export interface PPBEScenarioFraming {
  decision_question: string;
  alternatives: ScenarioFramingAlternative[];
  /** Provenance — the label travels with the content. */
  source_label: string;
  workflow_step_id: string;
}

/** Frame a scenario report for COUNSEL — provenance label always travels along. */
export function framingForCounsel(report: PPBEScenarioReport): PPBEScenarioFraming {
  return {
    decision_question: `${report.report_title} — which resource allocation should be pursued?`,
    alternatives: report.scenarios.map((s) => ({
      name: s.scenario_name,
      summary:
        `${s.projected_performance_impact} Risk: ${s.projected_risk_implications} ` +
        `(Modeling confidence: ${s.confidence}.)`,
    })),
    source_label: report.scenario_label,
    workflow_step_id: report.workflow_step_id,
  };
}
