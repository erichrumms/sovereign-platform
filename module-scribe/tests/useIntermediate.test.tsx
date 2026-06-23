/** @jest-environment jsdom */
/**
 * module-scribe — useIntermediate.test.tsx
 * The intermediate-mode hook: brackets the scribe-drafter step with AGENT_STEP_* +
 * FALLBACK_ACTIVATED (approved event types only — no SCRIBE_*), carries workflow_step_id
 * on every event under the approved PR-SCRIBE-001, and halts on a failed Logger emit
 * (Gate 2). Key-less, so the engine serves the static tier — deterministic, no network.
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useIntermediate } from "../src/useIntermediate";
import { makeCtx } from "./test-helpers";

describe("useIntermediate", () => {
  it("produces prose (static tier, key-less) and emits the approved event sequence", async () => {
    const events: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useIntermediate(makeCtx({ log: (e) => events.push(e) })));

    await act(async () => {
      await result.current.run({ mode: "synthesis", capturedMaterial: "some notes" });
    });

    expect(result.current.status).toBe("done");
    expect(result.current.outcome?.tier).toBe("static");
    expect(result.current.outcome?.result.prose).toMatch(/Key themes/i);

    const types = events.map((e) => e.event_type);
    expect(types).toEqual(["AGENT_STEP_START", "FALLBACK_ACTIVATED", "AGENT_STEP_COMPLETE"]);
    expect(types.some((t) => t.startsWith("SCRIBE_"))).toBe(false);
    expect(events.every((e) => e.workflow_step_id === "scribe-synthesis-step-1")).toBe(true);

    const start = events.find((e) => e.event_type === "AGENT_STEP_START")!;
    expect(start.agent_id).toBe("scribe-drafter");
    expect(start.agent_class).toBe("Operational");
    expect(start.product).toBe("SCRIBE");
    expect((start.payload as { registry_id: string }).registry_id).toBe("PR-SCRIBE-001");

    const complete = events.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect((complete.payload as { produces_product_intake: boolean }).produces_product_intake).toBe(false);
  });

  it("halts on a failed Logger emit (CPMI-VRS Gate 2)", async () => {
    const { result } = renderHook(() =>
      useIntermediate(
        makeCtx({
          log: () => {
            throw new Error("logger down");
          },
        })
      )
    );

    await act(async () => {
      await result.current.run({ mode: "framing", capturedMaterial: "notes" });
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/Logger emission failed/);
    expect(result.current.outcome).toBeNull();
  });
});
