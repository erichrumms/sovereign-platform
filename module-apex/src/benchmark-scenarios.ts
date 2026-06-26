/**
 * SOVEREIGN Platform — module-apex
 * benchmark-scenarios.ts — the three CPMI-VRS known-answer benchmarks (spec §8, D-APEX-5).
 *
 * Gate 2 (Reasoning Transparency) for APEX requires three benchmark scenarios with known
 * expected characteristics. Each runs the deterministic static analysis over a synthetic
 * program (no network, schema-valid by construction) so the result is reproducible and
 * available for Project Principal review during Walkthrough B:
 *   - Scenario A — on-track program (P-200): positive narrative, no escalation.
 *   - Scenario B — at-risk program (P-150): risk narrative, DC-3 provenance for cost variance.
 *   - Scenario C — off-track program (P-300): escalation recommendation, all flags with DC-3
 *     provenance, regulatory constraint flagged for human legal review.
 *
 * Version: 1.0 · Session 17 · June 25, 2026
 */

import { analysisWorkflowStep, type ApexAnalysisOutput, type ApexReportType } from "./apex-contract";
import { staticAnalysis } from "./apex-analysis";
import { createSyntheticApexDataAdapter, type ApexDataAdapter } from "./apex-data-adapter";

export type BenchmarkId = "A" | "B" | "C";

export interface BenchmarkScenario {
  id: BenchmarkId;
  label: string;
  program_id: string;
  report_type: ApexReportType;
  /** Plain-prose statement of what a correct output should contain (Gap 5). */
  expectation: string;
}

export const BENCHMARK_SCENARIOS: readonly BenchmarkScenario[] = [
  {
    id: "A",
    label: "On-track program",
    program_id: "P-200",
    report_type: "MSR",
    expectation:
      "A positive status narrative with no escalation recommendation, and a complete dossier package on export.",
  },
  {
    id: "B",
    label: "At-risk program",
    program_id: "P-150",
    report_type: "MSR",
    expectation:
      "A risk narrative that identifies the affected milestone, with DC-3 provenance populated for the cost " +
      "variance flag and at least one recommendation for human review.",
  },
  {
    id: "C",
    label: "Off-track program",
    program_id: "P-300",
    report_type: "QPR",
    expectation:
      "An escalation recommendation, every risk flag with DC-3 provenance, and the regulatory compliance " +
      "question flagged for human legal review.",
  },
];

export interface BenchmarkResult {
  scenario: BenchmarkScenario;
  output: ApexAnalysisOutput;
  schema_valid: boolean;
}

/** Run one benchmark scenario, returning its schema-valid analysis output. */
export function runBenchmarkScenario(scenario: BenchmarkScenario, adapter: ApexDataAdapter = createSyntheticApexDataAdapter()): BenchmarkResult {
  const program = adapter.getProgram(scenario.program_id);
  if (!program) {
    throw new Error(`Benchmark scenario ${scenario.id} references unknown program ${scenario.program_id}`);
  }
  const output = staticAnalysis(program, scenario.report_type, analysisWorkflowStep(scenario.program_id, scenario.report_type));
  return { scenario, output, schema_valid: output.schema_valid };
}

/** Run all three benchmark scenarios (A, B, C). */
export function runAllBenchmarks(adapter: ApexDataAdapter = createSyntheticApexDataAdapter()): BenchmarkResult[] {
  return BENCHMARK_SCENARIOS.map((s) => runBenchmarkScenario(s, adapter));
}
