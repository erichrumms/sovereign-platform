/** @jest-environment jsdom */
/**
 * module-cpmi — useReasoningChain.test.tsx
 * The chain brackets cpmi.reasoning-chain with AGENT_STEP_* + FALLBACK_ACTIVATED and
 * emits CPMI_REASONING_CHAIN_COMPLETE (GD-7) carrying output_schema_valid and the 0.7×
 * threshold factor. workflow_step_id on every event; unknown program errors without a
 * call; Gate 2 fail-closed. Key-less → static tier.
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useReasoningChain } from "../src/useReasoningChain";
import { makeCtx } from "./test-helpers";

describe("useReasoningChain", () => {
  it("runs the chain (static tier, key-less) and emits the approved event sequence", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useReasoningChain(makeCtx({ logSink })));

    await act(async () => {
      await result.current.runChain("P-100");
    });

    expect(result.current.status).toBe("complete");
    expect(result.current.outcome?.tier).toBe("static");

    const types = logSink.map((e) => e.event_type);
    expect(types).toEqual(["AGENT_STEP_START", "FALLBACK_ACTIVATED", "AGENT_STEP_COMPLETE", "CPMI_REASONING_CHAIN_COMPLETE"]);
    expect(logSink.every((e) => e.workflow_step_id === "cpmi-reasoning-P-100")).toBe(true);

    const start = logSink.find((e) => e.event_type === "AGENT_STEP_START")!;
    expect(start.agent_id).toBe("cpmi.reasoning-chain");
    expect(start.agent_class).toBe("Governance");
    expect(start.product).toBe("CPMI");

    const complete = logSink.find((e) => e.event_type === "CPMI_REASONING_CHAIN_COMPLETE")!;
    expect((complete.payload as { output_schema_valid: boolean }).output_schema_valid).toBe(true);
    expect((complete.payload as { anomaly_threshold_factor: number }).anomaly_threshold_factor).toBe(0.7);
  });

  it("errors on an unknown program without making a call", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useReasoningChain(makeCtx({ logSink })));
    await act(async () => {
      await result.current.runChain("P-999");
    });
    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/No world-model record/);
    expect(logSink).toHaveLength(0);
  });

  it("halts on a failed Logger emit (Gate 2)", async () => {
    const { result } = renderHook(() => useReasoningChain(makeCtx({ throwOnLog: true })));
    await act(async () => {
      await result.current.runChain("P-100");
    });
    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/Logger emission failed/);
  });

  it("populates token_usage on AGENT_STEP_COMPLETE when live tier serves (GD-31)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const mockComplete = async () =>
      ({
        content: JSON.stringify({
          context_summary: "Program P-100 mid-execution.",
          context_confidence: "high",
          risk_register: [{ risk: "Schedule slip", severity: "P2", type: "schedule" }],
          constraint_map: [{ constraint: "FAR 15.2", permitted: "re-scope", prohibited: "sole-source", requires_approval: "ceiling" }],
          option_set: [{ option: "Re-baseline", cost: "2wk", defers: "M4", closes: "schedule risk" }],
          recommendation: "Re-baseline.",
          alternatives_considered: ["Accept slip"],
          schema_valid: true,
        }),
        fallback_activated: false,
        fallback_tier: "live",
        usage: { input_tokens: 100, output_tokens: 50 },
      } as unknown as import("@sovereign/api-client").SovereignLLMResponse);
    const { result } = renderHook(() =>
      useReasoningChain(makeCtx({ logSink }), { complete: mockComplete })
    );
    await act(async () => {
      await result.current.runChain("P-100");
    });
    expect(result.current.outcome?.tier).toBe("live");
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage?.input_tokens).toBe(100);
    expect(complete.token_usage?.output_tokens).toBe(50);
    expect(typeof complete.token_usage?.estimated_cost_usd).toBe("number");
  });

  it("leaves token_usage absent on AGENT_STEP_COMPLETE when fallback served (GD-31)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useReasoningChain(makeCtx({ logSink })));
    await act(async () => {
      await result.current.runChain("P-100");
    });
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage).toBeUndefined();
  });
});
