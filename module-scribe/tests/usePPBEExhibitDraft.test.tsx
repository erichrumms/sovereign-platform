/** @jest-environment jsdom */
/**
 * module-scribe — usePPBEExhibitDraft.test.tsx
 * GD-35 (F5, Session 88): the exhibit drafting hook brackets the ppbe-exhibit-drafter
 * step with AGENT_STEP_START / AGENT_STEP_COMPLETE; populates token_usage on the live
 * tier (including duration_ms, stop_reason, responded_at per shell-contract v1.27);
 * leaves token_usage absent on fallback; halts on a failed Logger emit (Gate 2).
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLLMResponse } from "@sovereign/api-client";
import type { ObligationRecord, ProgramRecord } from "@sovereign/data";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { usePPBEExhibitDraft } from "../src/usePPBEExhibitDraft";
import type { ExhibitDraftInput } from "../src/ppbe-exhibit-engine";
import type { PPBEExhibitDraft } from "../src/ppbe-exhibit-contract";
import { makeCtx } from "./test-helpers";

// --- fixtures ---

const PROGRAM: ProgramRecord = {
  program_id: "PRG-001",
  name: "Logistics Data Interchange",
  sponsor: "PEO Logistics",
  contract_number: "W91-26-C-0001",
  classification_level: "UNCLASSIFIED",
  status: "ACTIVE",
  objective_id: "SO-2027-01",
  fiscal_year: "FY 2027",
  lifecycle_cost_estimate: 1000000,
  obligation_plan: [{ period: "FY 2027 Q1", planned_amount: 100000 }],
  performance_baseline: [{ metric: "obligation rate", baseline_value: "on plan" }],
};

const OBLIGATION: ObligationRecord = {
  obligation_id: "OB-1",
  program_id: "PRG-001",
  cost_code: "CC-1",
  amount: 90000,
  timestamp: "2026-07-12T15:30:00Z",
  authorizing_official: "Jane Smith",
  workflow_step_id: "ppbe-obligation-OB-1",
};

const INPUT: ExhibitDraftInput = {
  mode: "BUDGET_EXHIBIT",
  program: PROGRAM,
  obligations: [OBLIGATION],
};

const LIVE_DRAFT: PPBEExhibitDraft = {
  document_mode: "BUDGET_EXHIBIT",
  title: "Budget Exhibit — Logistics Data Interchange (FY 2027)",
  narrative: "The program has obligated 90000 against the fiscal year plan.",
  figures: [{ label: "Obligation OB-1", value: 90000, source_workflow_step_id: "ppbe-obligation-OB-1" }],
  workflow_step_id: "ppbe-exhibit-budget_exhibit-PRG-001",
};

function mockLiveComplete(): () => Promise<SovereignLLMResponse> {
  return async () =>
    ({
      content: JSON.stringify(LIVE_DRAFT),
      fallback_activated: false,
      fallback_tier: "live",
      usage: { input_tokens: 120, output_tokens: 60 },
      duration_ms: 850,
      stop_reason: "end_turn",
      sovereign_metadata: { responded_at: "2026-08-05T10:00:00.000Z" },
    } as unknown as SovereignLLMResponse);
}

// --- tests ---

describe("usePPBEExhibitDraft", () => {
  it("populates token_usage on AGENT_STEP_COMPLETE when live tier serves (GD-35)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() =>
      usePPBEExhibitDraft(makeCtx({ log: (e) => logSink.push(e) }), { complete: mockLiveComplete() })
    );

    await act(async () => { await result.current.run(INPUT); });

    expect(result.current.status).toBe("done");
    expect(result.current.outcome?.tier).toBe("live");

    const start = logSink.find((e) => e.event_type === "AGENT_STEP_START")!;
    expect(start.agent_id).toBe("ppbe-exhibit-drafter");
    expect(start.agent_class).toBe("Operational");
    expect(start.product).toBe("SCRIBE");

    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage?.input_tokens).toBe(120);
    expect(complete.token_usage?.output_tokens).toBe(60);
    expect(typeof complete.token_usage?.estimated_cost_usd).toBe("number");
    expect(complete.token_usage?.duration_ms).toBe(850);
    expect(complete.token_usage?.stop_reason).toBe("end_turn");
    expect(complete.token_usage?.responded_at).toBe("2026-08-05T10:00:00.000Z");
  });

  it("leaves token_usage absent on AGENT_STEP_COMPLETE when fallback tier serves (GD-35)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() =>
      usePPBEExhibitDraft(makeCtx({ log: (e) => logSink.push(e) }))
    );

    await act(async () => { await result.current.run(INPUT); });

    expect(result.current.outcome?.tier).not.toBe("live");
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage).toBeUndefined();
    expect(logSink.some((e) => e.event_type === "FALLBACK_ACTIVATED")).toBe(true);
  });

  it("halts on a failed Logger emit (CPMI-VRS Gate 2)", async () => {
    const { result } = renderHook(() =>
      usePPBEExhibitDraft(makeCtx({ log: () => { throw new Error("simulated logger failure"); } }))
    );

    await act(async () => { await result.current.run(INPUT); });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/Logger emission failed/);
    expect(result.current.error).toMatch(/Gate 2/);
  });
});
