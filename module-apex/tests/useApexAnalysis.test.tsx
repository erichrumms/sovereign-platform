/** @jest-environment jsdom */
/**
 * module-apex — useApexAnalysis.test.tsx
 * apex.ai-assistant hook: emits APEX_ANALYSIS_STARTED then APEX_ANALYSIS_COMPLETE (carrying
 * schema_valid + tier) with one workflow_step_id (Constraint #6); degrades to the static tier
 * key-less; Gate 2 fail-closed on a logger throw; errors on an unknown program.
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLLMResponse } from "@sovereign/api-client";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useApexAnalysis } from "../src/useApexAnalysis";
import { staticAnalysis } from "../src/apex-analysis";
import { createSyntheticApexDataAdapter } from "../src/apex-data-adapter";
import { makeCtx } from "./test-helpers";

const adapter = createSyntheticApexDataAdapter();

describe("useApexAnalysis", () => {
  it("emits APEX_ANALYSIS_STARTED then APEX_ANALYSIS_COMPLETE with one workflow_step_id", async () => {
    const logSink: SovereignLogEvent[] = [];
    const live = staticAnalysis(adapter.getProgram("P-100")!, "MSR", "apex-analysis-msr-P-100");
    const complete = async (): Promise<SovereignLLMResponse> =>
      ({ content: JSON.stringify(live), fallback_activated: false } as SovereignLLMResponse);
    const { result } = renderHook(() => useApexAnalysis(makeCtx({ logSink }), { adapter, complete }));

    await act(async () => {
      await result.current.runAnalysis("P-100", "MSR");
    });

    expect(result.current.status).toBe("complete");
    expect(result.current.outcome?.tier).toBe("live");
    expect(logSink.map((e) => e.event_type)).toEqual(["APEX_ANALYSIS_STARTED", "APEX_ANALYSIS_COMPLETE"]);
    expect(logSink.every((e) => e.workflow_step_id === "apex-analysis-msr-P-100")).toBe(true);
    expect(logSink.every((e) => e.product === "APEX")).toBe(true);
    const done = logSink.find((e) => e.event_type === "APEX_ANALYSIS_COMPLETE")!;
    expect(done.payload).toMatchObject({ schema_valid: true, tier: "live" });
  });

  it("degrades to the static tier when no live response is surfaceable (key-less dev)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const complete = async (): Promise<SovereignLLMResponse> => { throw new Error("no key"); };
    const { result } = renderHook(() => useApexAnalysis(makeCtx({ logSink }), { adapter, complete }));

    await act(async () => { await result.current.runAnalysis("P-100", "MSR"); });

    expect(result.current.outcome?.tier).toBe("static");
    expect(result.current.outcome?.output.schema_valid).toBe(true);
    const done = logSink.find((e) => e.event_type === "APEX_ANALYSIS_COMPLETE")!;
    expect(done.payload).toMatchObject({ tier: "static" });
  });

  it("halts on a Gate-2 logger failure", async () => {
    const { result } = renderHook(() => useApexAnalysis(makeCtx({ throwOnLog: true }), { adapter }));
    await act(async () => { await result.current.runAnalysis("P-100", "MSR"); });
    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/Gate 2/);
  });

  it("errors on an unknown program", async () => {
    const { result } = renderHook(() => useApexAnalysis(makeCtx(), { adapter }));
    await act(async () => { await result.current.runAnalysis("P-999", "MSR"); });
    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/No program record/);
  });
});
