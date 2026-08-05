/** @jest-environment jsdom */
/**
 * module-nexus — usePPBECoordinationTracking.test.tsx
 * GD-35 (F5, Session 88): the coordination tracking hook brackets the
 * ppbe-coordination-assistant step with AGENT_STEP_START / AGENT_STEP_COMPLETE;
 * populates token_usage on the live tier (including duration_ms, stop_reason,
 * responded_at per shell-contract v1.27); leaves token_usage absent on fallback;
 * halts on a failed Logger emit (Gate 2).
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLLMResponse } from "@sovereign/api-client";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { usePPBECoordinationTracking } from "../src/usePPBECoordinationTracking";
import {
  PPBE_COORDINATION_ASSISTANT_AGENT_ID,
  PPBE_COORDINATION_ADVISORY_LABEL,
  type CoordinationTrackingInput,
  type CoordinationDigest,
} from "../src/ppbe-coordination-assistant";
import { makeCtx } from "./test-helpers";

// --- fixtures ---

const INPUT: CoordinationTrackingInput = {
  items: [
    {
      item_id: "CI-1",
      kind: "ACTION_ITEM",
      description: "Submit evidence base",
      responsible_role: "Program Manager",
      due_by: "2026-07-15T00:00:00Z",
      status: "OPEN",
      workflow_step_id: "ppbe-coord-CI-1",
    },
  ],
  notes: "The evidence base was submitted Friday.",
  workflowStepId: "ppbe-coordination-digest-1-items",
};

const AS_OF = "2026-08-05T10:00:00Z";

const LIVE_DIGEST: CoordinationDigest = {
  summary: "The notes report the evidence base was submitted Friday.",
  update_proposals: [
    { item_id: "CI-1", proposed_status: "RESOLVED", rationale: "Notes state submission complete." },
  ],
  risks_flagged: [],
  advisory_label: PPBE_COORDINATION_ADVISORY_LABEL,
  workflow_step_id: "ppbe-coordination-digest-1-items",
  schema_valid: true,
};

function mockLiveComplete(): () => Promise<SovereignLLMResponse> {
  return async () =>
    ({
      content: JSON.stringify(LIVE_DIGEST),
      fallback_activated: false,
      fallback_tier: "live",
      usage: { input_tokens: 110, output_tokens: 55 },
      duration_ms: 920,
      stop_reason: "end_turn",
      sovereign_metadata: { responded_at: "2026-08-05T10:00:00.000Z" },
    } as unknown as SovereignLLMResponse);
}

// --- tests ---

describe("usePPBECoordinationTracking", () => {
  it("populates token_usage on AGENT_STEP_COMPLETE when live tier serves (GD-35)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() =>
      usePPBECoordinationTracking(makeCtx({ logSink }), { complete: mockLiveComplete() })
    );

    await act(async () => { await result.current.run(INPUT, AS_OF); });

    expect(result.current.status).toBe("done");
    expect(result.current.outcome?.tier).toBe("live");

    const start = logSink.find((e) => e.event_type === "AGENT_STEP_START")!;
    expect(start.agent_id).toBe(PPBE_COORDINATION_ASSISTANT_AGENT_ID);
    expect(start.agent_class).toBe("Operational");
    expect(start.product).toBe("NEXUS");

    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage?.input_tokens).toBe(110);
    expect(complete.token_usage?.output_tokens).toBe(55);
    expect(typeof complete.token_usage?.estimated_cost_usd).toBe("number");
    expect(complete.token_usage?.duration_ms).toBe(920);
    expect(complete.token_usage?.stop_reason).toBe("end_turn");
    expect(complete.token_usage?.responded_at).toBe("2026-08-05T10:00:00.000Z");
  });

  it("leaves token_usage absent on AGENT_STEP_COMPLETE when fallback tier serves (GD-35)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() =>
      usePPBECoordinationTracking(makeCtx({ logSink }))
    );

    await act(async () => { await result.current.run(INPUT, AS_OF); });

    expect(result.current.outcome?.tier).toBe("static");
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage).toBeUndefined();
    expect(logSink.some((e) => e.event_type === "FALLBACK_ACTIVATED")).toBe(true);
  });

  it("halts on a failed Logger emit (CPMI-VRS Gate 2)", async () => {
    const { result } = renderHook(() =>
      usePPBECoordinationTracking(makeCtx({ throwOnLog: true }))
    );

    await act(async () => { await result.current.run(INPUT, AS_OF); });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/Logger emission failed/);
    expect(result.current.error).toMatch(/Gate 2/);
  });
});
