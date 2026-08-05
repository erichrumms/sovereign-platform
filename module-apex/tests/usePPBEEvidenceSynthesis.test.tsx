/** @jest-environment jsdom */
/**
 * module-apex — usePPBEEvidenceSynthesis.test.tsx
 * GD-35 (F5, Session 88): the evidence synthesis hook brackets the
 * ppbe-evidence-synthesizer step with AGENT_STEP_START / AGENT_STEP_COMPLETE;
 * populates token_usage on the live tier (including duration_ms, stop_reason,
 * responded_at per shell-contract v1.27); leaves token_usage absent on fallback;
 * halts on a failed Logger emit (Gate 2).
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLLMResponse } from "@sovereign/api-client";
import type { EvaluationFinding, ProgramRecord } from "@sovereign/data";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { usePPBEEvidenceSynthesis } from "../src/usePPBEEvidenceSynthesis";
import {
  PPBE_EVIDENCE_SYNTHESIZER_AGENT_ID,
  PPBE_ADVISORY_LABEL,
  type EvidenceSynthesisInput,
  type PPBESynthesisReport,
} from "../src/ppbe-evidence-synthesizer";
import type { ApexProgramRecord } from "../src/apex-contract";
import { makeCtx } from "./test-helpers";

// --- fixtures ---

function apexProgram(id: string): ApexProgramRecord {
  return {
    program_id: id,
    name: `Program ${id}`,
    sponsor: "PEO Logistics",
    status: "ACTIVE",
    fiscal_year: "FY 2027",
    objectives: ["SO-2027-01"],
    current_phase: "Execution",
    budget_authority: 1000000,
  };
}

function finding(id: string): EvaluationFinding {
  return {
    finding_id: id,
    program_id: "PRG-001",
    objective_id: "SO-2027-01",
    finding_type: "on-track",
    narrative: `Finding ${id}.`,
    feeds_planning_cycle: true,
    workflow_step_id: `ppbe-finding-${id}`,
  };
}

const INPUT: EvidenceSynthesisInput = {
  findings: [finding("EF-1")],
  programs: [apexProgram("PRG-001")],
  fiscal_context: "FY 2027 programming review",
  workflowStepId: "ppbe-evidence-synthesis-PRG-001",
};

const LIVE_REPORT: PPBESynthesisReport = {
  report_title: "Evidence synthesis — FY 2027 programming review",
  fiscal_context: "FY 2027 programming review",
  programs_covered: ["PRG-001"],
  objectives_covered: ["SO-2027-01"],
  summary: "The evidence base shows one on-track finding.",
  key_findings: [
    {
      statement: "Program PRG-001 is on track.",
      source_finding_ids: ["EF-1"],
      programs_affected: ["PRG-001"],
    },
  ],
  advisory_label: PPBE_ADVISORY_LABEL,
  workflow_step_id: "ppbe-evidence-synthesis-PRG-001",
  schema_valid: true,
};

function mockLiveComplete(): () => Promise<SovereignLLMResponse> {
  return async () =>
    ({
      content: JSON.stringify(LIVE_REPORT),
      fallback_activated: false,
      fallback_tier: "live",
      usage: { input_tokens: 130, output_tokens: 65 },
      duration_ms: 780,
      stop_reason: "end_turn",
      sovereign_metadata: { responded_at: "2026-08-05T10:00:00.000Z" },
    } as unknown as SovereignLLMResponse);
}

// --- tests ---

describe("usePPBEEvidenceSynthesis", () => {
  it("populates token_usage on AGENT_STEP_COMPLETE when live tier serves (GD-35)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() =>
      usePPBEEvidenceSynthesis(makeCtx({ logSink }), { complete: mockLiveComplete() })
    );

    await act(async () => { await result.current.run(INPUT); });

    expect(result.current.status).toBe("done");
    expect(result.current.outcome?.tier).toBe("live");

    const start = logSink.find((e) => e.event_type === "AGENT_STEP_START")!;
    expect(start.agent_id).toBe(PPBE_EVIDENCE_SYNTHESIZER_AGENT_ID);
    expect(start.agent_class).toBe("Analytical");
    expect(start.product).toBe("APEX");

    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage?.input_tokens).toBe(130);
    expect(complete.token_usage?.output_tokens).toBe(65);
    expect(typeof complete.token_usage?.estimated_cost_usd).toBe("number");
    expect(complete.token_usage?.duration_ms).toBe(780);
    expect(complete.token_usage?.stop_reason).toBe("end_turn");
    expect(complete.token_usage?.responded_at).toBe("2026-08-05T10:00:00.000Z");
  });

  it("leaves token_usage absent on AGENT_STEP_COMPLETE when fallback tier serves (GD-35)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() =>
      usePPBEEvidenceSynthesis(makeCtx({ logSink }))
    );

    await act(async () => { await result.current.run(INPUT); });

    expect(result.current.outcome?.tier).toBe("static");
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage).toBeUndefined();
    expect(logSink.some((e) => e.event_type === "FALLBACK_ACTIVATED")).toBe(true);
  });

  it("halts on a failed Logger emit (CPMI-VRS Gate 2)", async () => {
    const { result } = renderHook(() =>
      usePPBEEvidenceSynthesis(makeCtx({ throwOnLog: true }))
    );

    await act(async () => { await result.current.run(INPUT); });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/Logger emission failed/);
    expect(result.current.error).toMatch(/Gate 2/);
  });
});
