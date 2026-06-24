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
});
