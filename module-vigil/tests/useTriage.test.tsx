/** @jest-environment jsdom */
/**
 * module-vigil — useTriage.test.tsx
 * The Anomaly Triage Assistant hook: it refuses ineligible alert types without a call,
 * brackets the vigil-triage-analyst step with AGENT_STEP_* + FALLBACK_ACTIVATED and
 * emits TRIAGE_ANALYSIS_PRODUCED, and halts on a failed Logger emit (Gate 2).
 *
 * Tests run key-less (anthropic-key is mocked to undefined), so the engine degrades to
 * the static tier — deterministic, no network.
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useTriage } from "../src/useTriage";
import type { AnomalyContext } from "../src/vigil-types";
import { makeCtx, makeAlert } from "./test-helpers";

function contextFor(alertType: AnomalyContext["alert"]["alertType"]): AnomalyContext {
  const alert = makeAlert({ alertType });
  return { alert, recentEvents: [], productBaseline: { product: alert.sourceProduct }, similarAlerts: [] };
}

describe("useTriage", () => {
  it("produces a brief (static tier, key-less) and emits the full event sequence", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useTriage(makeCtx({ logSink })));

    await act(async () => {
      await result.current.runTriage(contextFor("ANOMALY_DETECTED"));
    });

    expect(result.current.status).toBe("produced");
    expect(result.current.outcome?.tier).toBe("static");

    const types = logSink.map((e) => e.event_type);
    expect(types).toEqual([
      "AGENT_STEP_START",
      "FALLBACK_ACTIVATED",
      "AGENT_STEP_COMPLETE",
      "TRIAGE_ANALYSIS_PRODUCED",
    ]);

    const start = logSink.find((e) => e.event_type === "AGENT_STEP_START")!;
    expect(start.agent_id).toBe("vigil-triage-analyst");
    expect(start.agent_class).toBe("Monitoring");
    expect(start.product).toBe("VIGIL");
    expect(start.workflow_step_id).toBe("vigil-triage-ALERT-1");

    const produced = logSink.find((e) => e.event_type === "TRIAGE_ANALYSIS_PRODUCED")!;
    expect((produced.payload as { registry_id: string }).registry_id).toBe("PR-VIGIL-001");
  });

  it("refuses an ineligible alert type without making a call or emitting", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useTriage(makeCtx({ logSink })));

    await act(async () => {
      await result.current.runTriage(contextFor("HONEYTOKEN_TRIGGERED"));
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/not available for HONEYTOKEN_TRIGGERED/i);
    expect(logSink).toHaveLength(0);
  });

  it("halts on a failed Logger emit (Gate 2)", async () => {
    const { result } = renderHook(() => useTriage(makeCtx({ throwOnLog: true })));

    await act(async () => {
      await result.current.runTriage(contextFor("CPMI_DRIFT_DETECTED"));
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/Gate 2/);
  });

  it("populates token_usage on AGENT_STEP_COMPLETE when live tier serves (GD-31)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const mockComplete = async () =>
      ({
        content: JSON.stringify({
          likely_causes: [{ cause: "Baseline shift", likelihood: "high" }],
          recommended_steps: ["Confirm the event source."],
          false_positive_likelihood: 25,
          false_positive_explanation: "Alert pattern consistent with a genuine shift.",
        }),
        fallback_activated: false,
        fallback_tier: "live",
        usage: { input_tokens: 100, output_tokens: 50 },
      } as unknown as import("@sovereign/api-client").SovereignLLMResponse);
    const { result } = renderHook(() =>
      useTriage(makeCtx({ logSink }), { complete: mockComplete })
    );
    await act(async () => {
      await result.current.runTriage(contextFor("ANOMALY_DETECTED"));
    });
    expect(result.current.outcome?.tier).toBe("live");
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage?.input_tokens).toBe(100);
    expect(complete.token_usage?.output_tokens).toBe(50);
    expect(typeof complete.token_usage?.estimated_cost_usd).toBe("number");
  });

  it("leaves token_usage absent on AGENT_STEP_COMPLETE when fallback served (GD-31)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useTriage(makeCtx({ logSink })));
    await act(async () => {
      await result.current.runTriage(contextFor("ANOMALY_DETECTED"));
    });
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage).toBeUndefined();
  });
});
