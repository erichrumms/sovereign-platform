/** @jest-environment jsdom */
/**
 * module-lens — useExplanation.test.tsx
 * The Governance Explainer hook: brackets the lens-explainer step with AGENT_STEP_* +
 * FALLBACK_ACTIVATED (approved event types only — no LENS_*), carries workflow_step_id
 * on every event, refuses an empty question without a call, and halts on a failed
 * Logger emit (Gate 2).
 *
 * Tests run key-less (anthropic-key is mocked to undefined), so the engine degrades to
 * the static tier — deterministic, no network.
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useExplanation } from "../src/useExplanation";
import { makeCtx } from "./test-helpers";

describe("useExplanation", () => {
  it("produces an explanation (static tier, key-less) and emits the approved event sequence", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useExplanation(makeCtx({ logSink })));

    await act(async () => {
      await result.current.ask("Who can see security alerts in VIGIL?");
    });

    expect(result.current.status).toBe("produced");
    expect(result.current.outcome?.tier).toBe("static");

    const types = logSink.map((e) => e.event_type);
    expect(types).toEqual(["AGENT_STEP_START", "FALLBACK_ACTIVATED", "AGENT_STEP_COMPLETE"]);
    // No invented LENS_* event types.
    expect(types.some((t) => t.startsWith("LENS_"))).toBe(false);

    // Every event carries the workflow_step_id (Standing Constraint #6).
    expect(logSink.every((e) => e.workflow_step_id === "lens-explain-1")).toBe(true);

    const start = logSink.find((e) => e.event_type === "AGENT_STEP_START")!;
    expect(start.agent_id).toBe("lens-explainer");
    expect(start.agent_class).toBe("Analytical");
    expect(start.product).toBe("LENS");
    expect((start.payload as { registry_id: string }).registry_id).toBe("PR-LENS-001");

    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect((complete.payload as { tier: string }).tier).toBe("static");
    expect((complete.payload as { fallback_activated: boolean }).fallback_activated).toBe(true);
  });

  it("refuses an empty question without a call or emission", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useExplanation(makeCtx({ logSink })));

    await act(async () => {
      await result.current.ask("   ");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/Enter a question/);
    expect(logSink).toHaveLength(0);
  });

  it("halts on a failed Logger emit (CPMI-VRS Gate 2)", async () => {
    const { result } = renderHook(() => useExplanation(makeCtx({ throwOnLog: true })));

    await act(async () => {
      await result.current.ask("Who can see security alerts?");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/Logger emission failed/);
    expect(result.current.outcome).toBeNull();
  });

  it("gives successive questions distinct workflow_step_ids", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useExplanation(makeCtx({ logSink })));

    await act(async () => {
      await result.current.ask("First question?");
    });
    await act(async () => {
      await result.current.ask("Second question?");
    });

    const steps = [...new Set(logSink.map((e) => e.workflow_step_id))];
    expect(steps).toEqual(["lens-explain-1", "lens-explain-2"]);
  });

  it("populates token_usage on AGENT_STEP_COMPLETE when live tier serves (GD-31)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const mockComplete = async () =>
      ({
        content: JSON.stringify({
          explanation: "Only users with PLATFORM_ADMIN role can see all security alerts in VIGIL.",
          sources: ["vigil_alert_response"],
          confidence: "grounded",
          gaps: [],
        }),
        fallback_activated: false,
        fallback_tier: "live",
        usage: { input_tokens: 100, output_tokens: 50 },
      } as unknown as import("@sovereign/api-client").SovereignLLMResponse);
    const { result } = renderHook(() =>
      useExplanation(makeCtx({ logSink }), { complete: mockComplete })
    );
    await act(async () => {
      await result.current.ask("Who can see security alerts in VIGIL?");
    });
    expect(result.current.outcome?.tier).toBe("live");
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage?.input_tokens).toBe(100);
    expect(complete.token_usage?.output_tokens).toBe(50);
    expect(typeof complete.token_usage?.estimated_cost_usd).toBe("number");
  });

  it("leaves token_usage absent on AGENT_STEP_COMPLETE when fallback served (GD-31)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useExplanation(makeCtx({ logSink })));
    await act(async () => {
      await result.current.ask("Who can see security alerts in VIGIL?");
    });
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage).toBeUndefined();
  });
});
