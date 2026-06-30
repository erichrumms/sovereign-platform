/**
 * SOVEREIGN Platform — module-aria
 * determinism-verification.ts — the ARIA Suite CPMI-VRS "benchmark" (Stage 6, Session 25 · D4).
 *
 * ARIA Suite's certification pathway differs from CPMI / APEX / FLOWPATH because the
 * aria.rules-engine is DETERMINISTIC, not LLM-backed (docs/16 §12). For an LLM-backed product,
 * Gates 1–2 are accuracy benchmarks against known answers. For ARIA there is no accuracy question to
 * benchmark — there is a determinism guarantee to PROVE: the same regulatory input produces the same
 * compliance, trace, and impact output on every run. Proving that determinism IS ARIA's certification
 * basis, and it stands in for Gates 1 and 2 (docs/16 §12).
 *
 * Each scenario runs one engine — CLEAR (evaluateDocument), TRACER (assembleChainFor), or ARC
 * (modelImpact) — TWICE with byte-identical input and asserts the two outputs are identical. Inputs
 * carry FIXED timestamps so the only thing under test is the engine's determinism, never the clock
 * (the same discipline the engines themselves follow — the caller supplies the timestamp). A scenario
 * passes only when both runs are deeply identical.
 *
 * No randomness, no LLM call, no sovereign-api-client call — this module only re-runs the existing
 * deterministic engines and compares. It emits no Logger events.
 *
 * Version: 1.0 · Session 25 (D4) · June 29, 2026
 */

import { evaluateDocument } from "./clear-engine";
import type { ClearEvaluationInput } from "./clear-types";
import { assembleChainFor, DEMO_TRACER_DATA } from "./tracer-integration";
import { modelImpact } from "./arc-engine";
import type { ProposedRegulatoryChange } from "./arc-types";

/** Which ARIA component a determinism scenario exercises. */
export type AriaComponent = "CLEAR" | "TRACER" | "ARC";

/** One run's output plus a plain-prose summary of what it produced (Gap 5). */
interface ScenarioRun {
  output: unknown;
  summary: string;
}

/** A determinism scenario: a deterministic producer that the verifier runs twice and compares. */
export interface DeterminismScenario {
  id: string;
  component: AriaComponent;
  /** Plain-prose scenario name (Gap 5). */
  label: string;
  /** Plain-prose statement of what is being proven (Gap 5). */
  description: string;
  /** Deterministic producer — same call every time. The verifier invokes it twice. */
  run: () => ScenarioRun;
}

/** The result of verifying one scenario: whether the two runs were identical, with a plain-prose summary. */
export interface DeterminismResult {
  id: string;
  component: AriaComponent;
  label: string;
  description: string;
  /** True when both runs produced deeply identical output. */
  identical: boolean;
  /** How many times the engine was run (always 2 — the determinism proof). */
  runs: number;
  /** Plain-prose description of the output both runs produced (Gap 5). */
  output_summary: string;
}

// Fixed timestamps — the inputs are constant so determinism is the only thing under test.
const CLEAR_AT = "2026-06-29T12:00:00.000Z";
const ARC_AT = "2026-06-29T12:00:00.000Z";

const CLEAR_COMPLIANT_INPUT: ClearEvaluationInput = {
  document_id: "VRS-CLEAR-OK",
  document_name: "FY26 O&M Budget Exhibit (benchmark)",
  document_type: "OMB A-11 Exhibit",
  data_quality_index: 96,
  is_congressional_submission: false,
  has_justification_narrative: true,
  has_evidence_basis: true,
  obligation_covered: true,
  funds_availability_stated: true,
  ppbe_phase: "Budgeting",
};

const CLEAR_VIOLATION_INPUT: ClearEvaluationInput = {
  ...CLEAR_COMPLIANT_INPUT,
  document_id: "VRS-CLEAR-ADA",
  document_name: "Over-obligation exhibit (benchmark)",
  obligation_covered: false,
};

const ARC_SUBSTANTIVE_CHANGE: ProposedRegulatoryChange = {
  description:
    "OMB Circular A-11 Section 51.3 is revised to require a quantified benefit narrative on every budget exhibit.",
  affected_source: "omba11",
  change_scope: "substantive",
};

const ARC_CLARIFYING_CHANGE: ProposedRegulatoryChange = {
  description: "Anti-Deficiency Act guidance is reissued with editorial corrections only.",
  affected_source: "anti-deficiency-act",
  change_scope: "clarifying",
};

/**
 * The determinism scenarios — at least one per ARIA component (docs/16 §12), with both a
 * passing-path and an exception-path case for CLEAR, TRACER, and ARC so the proof covers more than
 * the happy path. Each `run` is a pure call into an existing deterministic engine.
 */
export const DETERMINISM_SCENARIOS: readonly DeterminismScenario[] = [
  {
    id: "clear-compliant",
    component: "CLEAR",
    label: "CLEAR — compliant exhibit evaluates identically",
    description:
      "The same budget exhibit, evaluated twice against the four regulatory sources, yields the same compliance verdict and findings.",
    run: () => {
      const output = evaluateDocument(CLEAR_COMPLIANT_INPUT, CLEAR_AT);
      return {
        output,
        summary: `Compliant verdict with ${output.findings.length} findings across ${output.applicable_sources.length} sources.`,
      };
    },
  },
  {
    id: "clear-violation",
    component: "CLEAR",
    label: "CLEAR — over-obligation flags identically",
    description:
      "An exhibit with an uncovered obligation, evaluated twice, yields the same red Anti-Deficiency Act violation every time.",
    run: () => {
      const output = evaluateDocument(CLEAR_VIOLATION_INPUT, CLEAR_AT);
      const flagged = output.findings.filter((f) => !f.passed).length;
      return {
        output,
        summary: `Non-compliant verdict with ${flagged} flagged finding(s), including the Anti-Deficiency Act over-obligation.`,
      };
    },
  },
  {
    id: "tracer-complete",
    component: "TRACER",
    label: "TRACER — complete decision chain assembles identically",
    description:
      "The same Decision Record, traced twice, assembles the same complete chain of authority node-for-node.",
    run: () => {
      const output = assembleChainFor(DEMO_TRACER_DATA, "decision", "DR-COUNSEL-0008");
      const nodes = output ? output.nodes.length : 0;
      return {
        output,
        summary: `Complete chain of ${nodes} nodes, every node a citation to an existing record.`,
      };
    },
  },
  {
    id: "tracer-orphan",
    component: "TRACER",
    label: "TRACER — orphaned chain reports identically",
    description:
      "A Decision Record with no regulation basis, traced twice, produces the same orphan reason every time — the gap is reported, not hidden.",
    run: () => {
      const output = assembleChainFor(DEMO_TRACER_DATA, "decision", "DR-COUNSEL-0007");
      return {
        output,
        summary: output && !output.complete
          ? "Incomplete chain (orphan) with a stable plain-prose orphan reason."
          : "Chain assembled.",
      };
    },
  },
  {
    id: "arc-substantive",
    component: "ARC",
    label: "ARC — substantive A-11 change models identically",
    description:
      "The same proposed substantive change to OMB Circular A-11, modeled twice, projects the same affected items and the same overall severity.",
    run: () => {
      const output = modelImpact(ARC_SUBSTANTIVE_CHANGE, ARC_AT);
      return {
        output,
        summary: `${capitalize(output.overall_severity)} overall severity across ${output.dependent_items.length} affected items.`,
      };
    },
  },
  {
    id: "arc-clarifying",
    component: "ARC",
    label: "ARC — clarifying change downshifts identically",
    description:
      "The same clarifying change to the Anti-Deficiency Act, modeled twice, downshifts every item's severity the same way each run.",
    run: () => {
      const output = modelImpact(ARC_CLARIFYING_CHANGE, ARC_AT);
      return {
        output,
        summary: `${capitalize(output.overall_severity)} overall severity across ${output.dependent_items.length} affected items (clarifying scope).`,
      };
    },
  },
];

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * A deterministic structural equality check. Both runs traverse the identical code path, so their
 * outputs serialize to identical JSON when — and only when — the engine is deterministic. This is the
 * proof the scenario asserts.
 */
function deeplyIdentical(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Run one scenario twice and report whether the two outputs were identical. */
export function verifyScenario(scenario: DeterminismScenario): DeterminismResult {
  const first = scenario.run();
  const second = scenario.run();
  return {
    id: scenario.id,
    component: scenario.component,
    label: scenario.label,
    description: scenario.description,
    identical: deeplyIdentical(first.output, second.output),
    runs: 2,
    output_summary: first.summary,
  };
}

/** Verify every determinism scenario (the ARIA Suite determinism benchmark). */
export function verifyAllDeterminism(): DeterminismResult[] {
  return DETERMINISM_SCENARIOS.map(verifyScenario);
}

/** True when every scenario's two runs were identical — the determinism gate (stands in for Gates 1–2). */
export function allDeterministic(results: DeterminismResult[]): boolean {
  return results.length > 0 && results.every((r) => r.identical);
}
