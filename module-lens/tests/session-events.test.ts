/** @jest-environment jsdom */
/**
 * module-lens — session-events.test.ts
 * The LENS session activity capture: records events emitted through the wrapped
 * context, delegates to the real logger FIRST (so a Gate 2 failure records no phantom
 * event), and leaves the context shape unchanged.
 */
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { createSessionEventLog, withSessionCapture } from "../src/session-events";
import { makeCtx } from "./test-helpers";

function event(over: Partial<SovereignLogEvent> = {}): SovereignLogEvent {
  return {
    event_type: "AGENT_STEP_COMPLETE",
    workflow_step_id: "lens-explain-1",
    sovereign_tier: "standard",
    product: "LENS",
    actor_id: "E-700",
    outcome: "explanation_live",
    payload: {},
    ...over,
  } as SovereignLogEvent;
}

describe("session event capture", () => {
  it("records events emitted through the wrapped context, in order", () => {
    const sink: SovereignLogEvent[] = [];
    const log = createSessionEventLog();
    const ctx = withSessionCapture(makeCtx({ logSink: sink }), log);

    ctx.logger.log(event({ workflow_step_id: "a" }));
    ctx.logger.log(event({ workflow_step_id: "b" }));

    expect(log.events().map((e) => e.workflow_step_id)).toEqual(["a", "b"]);
    // It also delegated to the real logger.
    expect(sink.map((e) => e.workflow_step_id)).toEqual(["a", "b"]);
  });

  it("delegates first: a Gate 2 logger failure records no phantom event", () => {
    const log = createSessionEventLog();
    const ctx = withSessionCapture(makeCtx({ throwOnLog: true }), log);

    expect(() => ctx.logger.log(event())).toThrow(/simulated logger failure/);
    expect(log.events()).toHaveLength(0);
  });

  it("starts empty", () => {
    expect(createSessionEventLog().events()).toHaveLength(0);
  });
});
