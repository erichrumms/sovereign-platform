/**
 * ppbe-scenario-analyst tests — Session 32 (D2).
 * LLM-backed Analytical agent (registry, D-P5) under the PENDING
 * scenario_analysis_system prompt. Advisory only: mandatory scenario-modeling
 * label, at least two alternatives, no fabricated programs, static tier is
 * plain arithmetic over supplied plans, and framing for COUNSEL carries the
 * provenance label.
 */

import type { SovereignLLMResponse } from "@sovereign/api-client";
import type { ProgramRecord } from "@sovereign/data";

import {
  PPBE_SCENARIO_ANALYST_AGENT_ID,
  PPBE_SCENARIO_PROMPT_REGISTRATION,
  PPBE_SCENARIO_LABEL,
  scenarioWorkflowStep,
  plannedAllocation,
  validatePPBEScenarioReport,
  buildScenarioMessages,
  parseScenarioReport,
  staticScenarioReport,
  runScenarioAnalysis,
  framingForCounsel,
  type ScenarioAnalysisInput,
  type PPBEScenarioReport,
  type ScenarioDeps,
} from "../src/ppbe-scenario-analyst";

// ---------- fixtures ----------

function program(id: string, q1: number, q2: number): ProgramRecord {
  return {
    program_id: id,
    name: `Program ${id}`,
    sponsor: "PEO Logistics",
    contract_number: `W91-26-C-${id}`,
    classification_level: "UNCLASSIFIED",
    status: "ACTIVE",
    objective_id: "SO-2027-01",
    fiscal_year: "FY 2027",
    lifecycle_cost_estimate: 1000000,
    obligation_plan: [
      { period: "FY 2027 Q1", planned_amount: q1 },
      { period: "FY 2027 Q2", planned_amount: q2 },
    ],
    performance_baseline: [{ metric: "obligation rate", baseline_value: "on plan" }],
  };
}

function input(over: Partial<ScenarioAnalysisInput> = {}): ScenarioAnalysisInput {
  return {
    programs: [program("PRG-001", 100000, 200000), program("PRG-002", 50000, 50000)],
    fiscal_context: "FY 2027 programming decision",
    ...over,
  };
}

function goodReport(over: Partial<PPBEScenarioReport> = {}): PPBEScenarioReport {
  return {
    report_title: "Scenario analysis — FY 2027 programming decision",
    fiscal_context: "FY 2027 programming decision",
    baseline_description: "Two programs with a combined planned allocation of 400000.",
    scenarios: [
      {
        scenario_name: "Continue as planned",
        allocation_changes: [
          { program_id: "PRG-001", current_allocation: 300000, proposed_allocation: 300000 },
        ],
        projected_performance_impact: "Programs proceed against recorded baselines.",
        projected_risk_implications: "Recorded risks remain as recorded.",
        confidence: "MODERATE",
      },
      {
        scenario_name: "Shift toward PRG-002",
        allocation_changes: [
          { program_id: "PRG-001", current_allocation: 300000, proposed_allocation: 250000 },
          { program_id: "PRG-002", current_allocation: 100000, proposed_allocation: 150000 },
        ],
        projected_performance_impact: "PRG-002 accelerates; PRG-001 slows one quarter.",
        projected_risk_implications: "PRG-001 milestone slip risk rises via reduced Q2 obligations.",
        confidence: "LOW",
      },
    ],
    scenario_label: PPBE_SCENARIO_LABEL,
    workflow_step_id: "ppbe-scenario-analysis-PRG-001-PRG-002",
    schema_valid: true,
    ...over,
  };
}

function liveResponse(content: string, fallback_activated = false): SovereignLLMResponse {
  return {
    content,
    fallback_tier: fallback_activated ? "static" : "live",
    fallback_activated,
    sovereign_metadata: {
      sovereign_product: "APEX",
      sovereign_version: "1.0",
      workflow_step_id: "ppbe-scenario-analysis-PRG-001-PRG-002",
      agent_id: PPBE_SCENARIO_ANALYST_AGENT_ID,
      provider: "anthropic",
      provider_model: "claude-sonnet-4",
      tier: "standard",
      responded_at: "2026-07-12T00:00:00.000Z",
    },
  };
}

function reqCtx() {
  return {
    workflow_step_id: "ppbe-scenario-analysis-PRG-001-PRG-002",
    product: "APEX" as const,
    agent_id: PPBE_SCENARIO_ANALYST_AGENT_ID,
    tier: "standard" as const,
  };
}

function deps(over: Partial<ScenarioDeps> = {}): ScenarioDeps {
  return {
    complete: jest.fn().mockResolvedValue(liveResponse(JSON.stringify(goodReport()))),
    ...over,
  };
}

// ---------- registry bindings ----------

describe("registry bindings", () => {
  it("binds the AIS agent id and the PENDING prompt registration", () => {
    expect(PPBE_SCENARIO_ANALYST_AGENT_ID).toBe("ppbe-scenario-analyst");
    expect(PPBE_SCENARIO_PROMPT_REGISTRATION.file).toBe("ppbe/prompts/scenario_analysis_system.md");
    expect(PPBE_SCENARIO_PROMPT_REGISTRATION.status).toBe("PENDING");
  });
});

// ---------- helpers ----------

describe("scenarioWorkflowStep / plannedAllocation", () => {
  it("uses the supplied step or synthesizes a stable one", () => {
    expect(scenarioWorkflowStep(input({ workflowStepId: "custom" }))).toBe("custom");
    expect(scenarioWorkflowStep(input())).toBe("ppbe-scenario-analysis-PRG-001-PRG-002");
  });

  it("sums the obligation plan", () => {
    expect(plannedAllocation(program("PRG-001", 100000, 200000))).toBe(300000);
  });
});

// ---------- validation ----------

describe("validatePPBEScenarioReport", () => {
  const portfolio = input().programs;

  it("accepts a well-formed two-scenario report", () => {
    expect(validatePPBEScenarioReport(goodReport(), portfolio).valid).toBe(true);
  });

  it("rejects a missing or reworded scenario label", () => {
    const r = validatePPBEScenarioReport(goodReport({ scenario_label: "AI scenarios" }), portfolio);
    expect(r.valid).toBe(false);
    expect((r as { errors: string[] }).errors.join()).toContain("scenario_label");
  });

  it("rejects a single-scenario report — one option is advocacy, not analysis", () => {
    const single = goodReport({ scenarios: [goodReport().scenarios[0]] });
    const r = validatePPBEScenarioReport(single, portfolio);
    expect(r.valid).toBe(false);
    expect((r as { errors: string[] }).errors.join()).toContain("at least two");
  });

  it("rejects a fabricated program in allocation changes", () => {
    const bad = goodReport();
    bad.scenarios[1].allocation_changes[0].program_id = "PRG-404";
    const r = validatePPBEScenarioReport(bad, portfolio);
    expect(r.valid).toBe(false);
    expect((r as { errors: string[] }).errors.join()).toContain("fabricated program");
  });

  it("rejects negative allocations and unknown confidence values", () => {
    const bad = goodReport();
    bad.scenarios[0].allocation_changes[0].proposed_allocation = -1;
    (bad.scenarios[0] as { confidence: string }).confidence = "CERTAIN";
    expect(validatePPBEScenarioReport(bad, portfolio).valid).toBe(false);
  });
});

// ---------- messages + parsing ----------

describe("buildScenarioMessages / parseScenarioReport", () => {
  it("builds a two-message conversation with the portfolio as JSON", () => {
    const messages = buildScenarioMessages(input({ constraint: "hold the FY 2027 total" }), "SYS");
    expect(messages[0]).toEqual({ role: "system", content: "SYS" });
    const payload = JSON.parse(messages[1].content);
    expect(payload.program_records).toHaveLength(2);
    expect(payload.constraint).toBe("hold the FY 2027 total");
  });

  it("parses a fenced JSON report and rejects fabrications and schema_valid:false", () => {
    expect(
      parseScenarioReport("```json\n" + JSON.stringify(goodReport()) + "\n```", input().programs)
        ?.scenario_label
    ).toBe(PPBE_SCENARIO_LABEL);
    expect(parseScenarioReport("not json", input().programs)).toBeNull();
    const bad = goodReport();
    bad.scenarios[0].allocation_changes[0].program_id = "PRG-404";
    expect(parseScenarioReport(JSON.stringify(bad), input().programs)).toBeNull();
    expect(
      parseScenarioReport(JSON.stringify(goodReport({ schema_valid: false })), input().programs)
    ).toBeNull();
  });
});

// ---------- static tier ----------

describe("staticScenarioReport", () => {
  it("is deterministic, labeled, LOW-confidence, and pure arithmetic", () => {
    const a = staticScenarioReport(input());
    expect(a).toEqual(staticScenarioReport(input()));
    expect(a.scenario_label).toBe(PPBE_SCENARIO_LABEL);
    expect(validatePPBEScenarioReport(a, input().programs).valid).toBe(true);
    expect(a.scenarios).toHaveLength(2);
    expect(a.scenarios.every((s) => s.confidence === "LOW")).toBe(true);
    const level = a.scenarios[0].allocation_changes;
    expect(level.find((c) => c.program_id === "PRG-001")?.proposed_allocation).toBe(300000);
    const reduced = a.scenarios[1].allocation_changes;
    expect(reduced.find((c) => c.program_id === "PRG-001")?.proposed_allocation).toBe(270000);
    expect(reduced.find((c) => c.program_id === "PRG-002")?.proposed_allocation).toBe(90000);
  });
});

// ---------- engine ----------

describe("runScenarioAnalysis", () => {
  it("returns the live report when the model output validates", async () => {
    const outcome = await runScenarioAnalysis(input(), "P", reqCtx(), deps());
    expect(outcome.tier).toBe("live");
    expect(outcome.report.scenarios).toHaveLength(2);
  });

  it("falls to static on api-client fallback, invalid output, or a thrown error", async () => {
    const fallback = await runScenarioAnalysis(
      input(),
      "P",
      reqCtx(),
      deps({ complete: jest.fn().mockResolvedValue(liveResponse("", true)) })
    );
    expect(fallback.tier).toBe("static");

    const invalid = await runScenarioAnalysis(
      input(),
      "P",
      reqCtx(),
      deps({ complete: jest.fn().mockResolvedValue(liveResponse("garbage")) })
    );
    expect(invalid.tier).toBe("static");
    expect(invalid.detail).toBe("live_response_not_surfaceable");

    const threw = await runScenarioAnalysis(
      input(),
      "P",
      reqCtx(),
      deps({ complete: jest.fn().mockRejectedValue(new Error("down")) })
    );
    expect(threw.tier).toBe("static");
    expect(threw.detail).toBe("down");
  });

  it("makes exactly one live attempt per call", async () => {
    const complete = jest.fn().mockRejectedValue(new Error("down"));
    await runScenarioAnalysis(input(), "P", reqCtx(), { complete });
    expect(complete).toHaveBeenCalledTimes(1);
  });
});

// ---------- COUNSEL framing ----------

describe("framingForCounsel", () => {
  it("frames every scenario as an alternative and carries the provenance label", () => {
    const framing = framingForCounsel(goodReport());
    expect(framing.alternatives).toHaveLength(2);
    expect(framing.alternatives[0].name).toBe("Continue as planned");
    expect(framing.alternatives[1].summary).toContain("Modeling confidence: LOW");
    expect(framing.source_label).toBe(PPBE_SCENARIO_LABEL);
    expect(framing.workflow_step_id).toBe("ppbe-scenario-analysis-PRG-001-PRG-002");
  });
});
