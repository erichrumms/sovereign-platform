/** @jest-environment jsdom */
/**
 * module-apex — usePPBEScenarioAnalysis.test.tsx
 * GD-35 (F5, Session 88): the scenario analysis hook brackets the
 * ppbe-scenario-analyst step with AGENT_STEP_START / AGENT_STEP_COMPLETE;
 * populates token_usage on the live tier (including duration_ms, stop_reason,
 * responded_at per shell-contract v1.27); leaves token_usage absent on fallback;
 * halts on a failed Logger emit (Gate 2).
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLLMResponse } from "@sovereign/api-client";
import type { ProgramRecord } from "@sovereign/data";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { usePPBEScenarioAnalysis } from "../src/usePPBEScenarioAnalysis";
import {
  PPBE_SCENARIO_ANALYST_AGENT_ID,
  PPBE_SCENARIO_LABEL,
  type ScenarioAnalysisInput,
  type PPBEScenarioReport,
} from "../src/ppbe-scenario-analyst";
import { makeCtx } from "./test-helpers";

// --- fixtures ---

function program(id: string): ProgramRecord {
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
    obligation_plan: [{ period: "FY 2027 Q1", planned_amount: 100000 }],
    performance_baseline: [{ metric: "obligation rate", baseline_value: "on plan" }],
  };
}

const INPUT: ScenarioAnalysisInput = {
  programs: [program("PRG-001"), program("PRG-002")],
  fiscal_context: "FY 2027 programming decision",
  workflowStepId: "ppbe-scenario-analysis-PRG-001-PRG-002",
};

const LIVE_REPORT: PPBEScenarioReport = {
  report_title: "Scenario analysis — FY 2027 programming decision",
  fiscal_context: "FY 2027 programming decision",
  baseline_description: "Two programs with a combined planned allocation of 200000.",
  scenarios: [
    {
      scenario_name: "Continue as planned",
      allocation_changes: [
        { program_id: "PRG-001", current_allocation: 100000, proposed_allocation: 100000 },
      ],
      projected_performance_impact: "Programs proceed against recorded baselines.",
      projected_risk_implications: "Recorded risks remain as recorded.",
      confidence: "MODERATE",
    },
    {
      scenario_name: "Shift toward PRG-002",
      allocation_changes: [
        { program_id: "PRG-001", current_allocation: 100000, proposed_allocation: 80000 },
        { program_id: "PRG-002", current_allocation: 100000, proposed_allocation: 120000 },
      ],
      projected_performance_impact: "PRG-002 accelerates; PRG-001 slows one quarter.",
      projected_risk_implications: "PRG-001 milestone slip risk rises.",
      confidence: "LOW",
    },
  ],
  scenario_label: PPBE_SCENARIO_LABEL,
  workflow_step_id: "ppbe-scenario-analysis-PRG-001-PRG-002",
  schema_valid: true,
};

function mockLiveComplete(): () => Promise<SovereignLLMResponse> {
  return async () =>
    ({
      content: JSON.stringify(LIVE_REPORT),
      fallback_activated: false,
      fallback_tier: "live",
      usage: { input_tokens: 140, output_tokens: 70 },
      duration_ms: 1050,
      stop_reason: "end_turn",
      sovereign_metadata: { responded_at: "2026-08-05T10:00:00.000Z" },
    } as unknown as SovereignLLMResponse);
}

// --- tests ---

describe("usePPBEScenarioAnalysis", () => {
  it("populates token_usage on AGENT_STEP_COMPLETE when live tier serves (GD-35)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() =>
      usePPBEScenarioAnalysis(makeCtx({ logSink }), { complete: mockLiveComplete() })
    );

    await act(async () => { await result.current.run(INPUT); });

    expect(result.current.status).toBe("done");
    expect(result.current.outcome?.tier).toBe("live");

    const start = logSink.find((e) => e.event_type === "AGENT_STEP_START")!;
    expect(start.agent_id).toBe(PPBE_SCENARIO_ANALYST_AGENT_ID);
    expect(start.agent_class).toBe("Analytical");
    expect(start.product).toBe("APEX");

    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage?.input_tokens).toBe(140);
    expect(complete.token_usage?.output_tokens).toBe(70);
    expect(typeof complete.token_usage?.estimated_cost_usd).toBe("number");
    expect(complete.token_usage?.duration_ms).toBe(1050);
    expect(complete.token_usage?.stop_reason).toBe("end_turn");
    expect(complete.token_usage?.responded_at).toBe("2026-08-05T10:00:00.000Z");
  });

  it("leaves token_usage absent on AGENT_STEP_COMPLETE when fallback tier serves (GD-35)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() =>
      usePPBEScenarioAnalysis(makeCtx({ logSink }))
    );

    await act(async () => { await result.current.run(INPUT); });

    expect(result.current.outcome?.tier).toBe("static");
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage).toBeUndefined();
    expect(logSink.some((e) => e.event_type === "FALLBACK_ACTIVATED")).toBe(true);
  });

  it("halts on a failed Logger emit (CPMI-VRS Gate 2)", async () => {
    const { result } = renderHook(() =>
      usePPBEScenarioAnalysis(makeCtx({ throwOnLog: true }))
    );

    await act(async () => { await result.current.run(INPUT); });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/Logger emission failed/);
    expect(result.current.error).toMatch(/Gate 2/);
  });
});
