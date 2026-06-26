/**
 * module-apex — event-trigger.test.ts
 * The PPBE event-driven report trigger STUB: it logs APEX_EVENT_RECEIVED (with the source event
 * type, deferred:true, and workflow_step_id) and returns a deferral — no report is generated.
 */
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { receiveInboundEvent } from "../src/event-trigger";

describe("receiveInboundEvent (PPBE stub)", () => {
  it("logs APEX_EVENT_RECEIVED with the source event type and defers", () => {
    const sink: SovereignLogEvent[] = [];
    const result = receiveInboundEvent("PPBE_EVALUATION_FINDING", "apex-event-1", (e) => sink.push(e));

    expect(result).toEqual({ received: true, deferred: true, note: expect.stringMatching(/deferred/i) });
    expect(sink).toHaveLength(1);
    expect(sink[0].event_type).toBe("APEX_EVENT_RECEIVED");
    expect(sink[0].workflow_step_id).toBe("apex-event-1"); // Constraint #6
    expect(sink[0].product).toBe("APEX");
    expect(sink[0].payload).toMatchObject({ source_event_type: "PPBE_EVALUATION_FINDING", deferred: true });
  });
});
