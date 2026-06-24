/**
 * SOVEREIGN Platform — module-cpmi
 * benchmark.ts — the known-answer benchmark suite (Session 12, D1; spec §2).
 *
 * Runs the CPMI reasoning chain against three synthetic program scenarios with known
 * governance directions and produces a structured BenchmarkReport. It is the evidence
 * base for the Project Principal's Gate 3 attestation: gate3_ready is true ONLY when all
 * three scenarios produce schema_valid:true AND steps_completed:6 (governance decision,
 * Session 12). Claude Code surfaces the report and enables the Gate 3 surface — it does
 * NOT issue the attestation.
 *
 * Pure orchestration (no React): the LLM call is injected (the hook supplies the real
 * client), so the suite runs deterministically in dev/test on the static tier.
 *
 * Version: 1.0 · Session 12 · June 23, 2026
 */

import type { SovereignRequestContext } from "@sovereign/api-client";

import {
  type ReasoningChainInput,
  type ReasoningChainOutput,
  type WorldModelRecord,
} from "./cpmi-contract";
import { runReasoningChain, type ReasoningDeps } from "./reasoning-engine";
import { REASONING_CHAIN_SYSTEM_PROMPT } from "./prompts/reasoning-chain.prompt";

export type ScenarioId = "A" | "B" | "C";

export interface ScenarioResult {
  scenario_id: ScenarioId;
  schema_valid: boolean;
  steps_completed: number; // must be 6
  recommendation_present: boolean;
  output: ReasoningChainOutput;
}

export interface BenchmarkReport {
  run_id: string;
  run_at: string; // ISO timestamp
  scenarios_run: number; // must be 3
  schema_compliance_rate: number; // 1.0 == 100%
  step_completion_rate: number; // 1.0 == 100%
  scenario_results: ScenarioResult[];
  gate3_ready: boolean; // true only when both rates are 1.0 across all three scenarios
  workflow_step_id: string;
}

interface BenchmarkScenario {
  id: ScenarioId;
  label: string;
  worldModel: WorldModelRecord;
  /** Qualitative expected governance direction (for the report; not a pass/fail gate). */
  expected_direction: string;
}

/** Three synthetic scenarios (spec §2.2): on-track, at-risk, compliance gap. */
export const BENCHMARK_SCENARIOS: readonly BenchmarkScenario[] = [
  {
    id: "A",
    label: "On-Track Program",
    expected_direction: "No material risks; routine oversight; recommendation to continue.",
    worldModel: {
      program_id: "BENCH-A",
      program_name: "Sustainment Analytics Platform",
      status: "Execution — 55% complete, on schedule and within cost",
      prior_governance_records: ["GR-A-001 (Gate 3 attested, Q1)"],
      flags: [],
      regulatory_context: ["FAR 15.2 governs any future re-scope"],
      objectives: ["Maintain the schedule baseline", "Hold cost within 5%"],
      synthetic: true,
    },
  },
  {
    id: "B",
    label: "At-Risk Program",
    expected_direction: "P1/P2 cost+schedule risks; reprogramming approval flagged; corrective options with tradeoffs.",
    worldModel: {
      program_id: "BENCH-B",
      program_name: "Integrated Sensor Refresh",
      status: "Execution — 48% complete, cost overrun and schedule slip",
      prior_governance_records: ["GR-B-002 (re-baseline approved, Q2)"],
      flags: ["Cost overrun of 12% against the baseline", "Schedule slip of three weeks on milestone 4"],
      regulatory_context: ["DoD 5000.02 milestone decision authority required for re-baseline", "Reprogramming approval required above 10% variance"],
      objectives: ["Restore the cost baseline", "Recover the milestone-4 schedule"],
      synthetic: true,
    },
  },
  {
    id: "C",
    label: "Compliance Gap",
    expected_direction: "P1 compliance risk; the specific regulatory requirement mapped; recommendation prioritizes gap closure.",
    worldModel: {
      program_id: "BENCH-C",
      program_name: "Public Services Portal",
      status: "Execution — 70% complete, regulatory filing documentation incomplete",
      prior_governance_records: ["GR-C-003 (Gate 3 attested, Q1)"],
      flags: ["Required Section 508 accessibility documentation is missing for the upcoming filing"],
      regulatory_context: ["Section 508 accessibility documentation required before deployment", "Records retention schedule applies to filing artifacts"],
      objectives: ["Close the documentation gap before the filing deadline", "Preserve the deployment date if possible"],
      synthetic: true,
    },
  },
] as const;

/**
 * Steps completed = how many of the six step outputs are present in the output
 * structure (spec §3: each step produces a complete output). Arrays count as completed
 * when present (an on-track program legitimately has an empty risk register).
 */
export function stepsCompleted(o: ReasoningChainOutput): number {
  let n = 0;
  if (typeof o.context_summary === "string" && o.context_summary.trim() !== "") n++; // Step 1
  if (Array.isArray(o.risk_register)) n++; // Step 2
  if (Array.isArray(o.constraint_map)) n++; // Step 3
  if (Array.isArray(o.option_set)) n++; // Step 4
  if (typeof o.recommendation === "string" && o.recommendation.trim() !== "") n++; // Step 5
  if (typeof o.schema_valid === "boolean") n++; // Step 6
  return n;
}

/**
 * Run the benchmark suite. One reasoning chain per scenario (one createSovereignClient
 * per chain — supplied by deps). gate3_ready is true only when every scenario is
 * schema_valid AND steps_completed===6 (governance decision, Session 12).
 */
export async function runBenchmark(
  deps: ReasoningDeps,
  requestContextFor: (scenarioId: ScenarioId) => SovereignRequestContext,
  meta: { runId: string; runAt: string }
): Promise<BenchmarkReport> {
  const results: ScenarioResult[] = [];
  for (const s of BENCHMARK_SCENARIOS) {
    const input: ReasoningChainInput = { program_id: s.worldModel.program_id, worldModel: s.worldModel };
    const outcome = await runReasoningChain(input, REASONING_CHAIN_SYSTEM_PROMPT, requestContextFor(s.id), deps);
    const o = outcome.output;
    results.push({
      scenario_id: s.id,
      schema_valid: o.schema_valid,
      steps_completed: stepsCompleted(o),
      recommendation_present: typeof o.recommendation === "string" && o.recommendation.trim() !== "",
      output: o,
    });
  }

  const schema_compliance_rate = results.filter((r) => r.schema_valid).length / results.length;
  const step_completion_rate = results.filter((r) => r.steps_completed === 6).length / results.length;
  const gate3_ready = results.length === 3 && results.every((r) => r.schema_valid && r.steps_completed === 6);

  return {
    run_id: meta.runId,
    run_at: meta.runAt,
    scenarios_run: results.length,
    schema_compliance_rate,
    step_completion_rate,
    scenario_results: results,
    gate3_ready,
    workflow_step_id: `cpmi-benchmark-${meta.runId}`,
  };
}
