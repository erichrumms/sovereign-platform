/** @jest-environment jsdom */
/**
 * module-cpmi — useBenchmark.test.ts
 * Runs the suite (static tier, key-less), reaches gate3_ready, brackets the run with
 * AGENT_STEP_* carrying workflow_step_id cpmi-benchmark-<n>, and fails closed on a Logger
 * emit error (Gate 2).
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useBenchmark } from "../src/useBenchmark";
import { makeCtx } from "./test-helpers";

describe("useBenchmark", () => {
  it("runs the benchmark to gate3_ready and emits the AGENT_STEP_* pair", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useBenchmark(makeCtx({ logSink })));

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.status).toBe("complete");
    expect(result.current.report?.gate3_ready).toBe(true);
    expect(result.current.report?.scenarios_run).toBe(3);

    const types = logSink.map((e) => e.event_type);
    expect(types).toEqual(["AGENT_STEP_START", "AGENT_STEP_COMPLETE"]);
    expect(logSink.every((e) => e.workflow_step_id === "cpmi-benchmark-1")).toBe(true);
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect((complete.payload as { gate3_ready: boolean }).gate3_ready).toBe(true);
  });

  it("fails closed when the Logger emit throws (Gate 2)", async () => {
    const { result } = renderHook(() => useBenchmark(makeCtx({ throwOnLog: true })));
    await act(async () => {
      await result.current.run();
    });
    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/Logger emission failed/);
  });

  it("populates token_usage on AGENT_STEP_COMPLETE when all scenarios run live (GD-31)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const mockComplete = async () =>
      ({
        content: JSON.stringify({
          context_summary: "ctx",
          context_confidence: "high",
          risk_register: [],
          constraint_map: [],
          option_set: [{ option: "o", cost: "c", defers: "d", closes: "x" }],
          recommendation: "rec",
          alternatives_considered: [],
          schema_valid: true,
        }),
        fallback_activated: false,
        fallback_tier: "live",
        usage: { input_tokens: 100, output_tokens: 50 },
      } as unknown as import("@sovereign/api-client").SovereignLLMResponse);
    const { result } = renderHook(() =>
      useBenchmark(makeCtx({ logSink }), { complete: mockComplete })
    );
    await act(async () => {
      await result.current.run();
    });
    expect(result.current.status).toBe("complete");
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    // Three scenarios × {100, 50} each = {300, 150} total_usage.
    expect(complete.token_usage?.input_tokens).toBe(300);
    expect(complete.token_usage?.output_tokens).toBe(150);
    expect(typeof complete.token_usage?.estimated_cost_usd).toBe("number");
  });

  it("leaves token_usage absent on AGENT_STEP_COMPLETE when all scenarios fell back (GD-31)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useBenchmark(makeCtx({ logSink })));
    await act(async () => {
      await result.current.run();
    });
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage).toBeUndefined();
  });
});
