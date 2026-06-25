/**
 * module-agentos — agentos-message.test.ts
 * The A2A message contract: event mapping, the correlation workflow_step_id (Constraint #6),
 * and message validation.
 */
import {
  AGENT_MESSAGE_TYPES,
  eventTypeForDirection,
  messageWorkflowStep,
  validateMessage,
  type AgentMessage,
} from "../src/agentos-message";

function msg(over: Partial<AgentMessage> = {}): AgentMessage {
  return {
    message_id: "m-1",
    sender_agent_id: "agentos.deployer",
    recipient_agent_id: "agentos.exporter",
    message_type: "REQUEST",
    payload: { hello: "world" },
    workflow_step_id: "agentos-msg-corr-1",
    correlation_id: "corr-1",
    ...over,
  };
}

describe("agentos-message contract", () => {
  it("declares the three message types", () => {
    expect(AGENT_MESSAGE_TYPES).toEqual(["REQUEST", "RESPONSE", "NOTIFICATION"]);
  });

  it("maps direction to the GD-14 event type", () => {
    expect(eventTypeForDirection("sent")).toBe("AGENT_MESSAGE_SENT");
    expect(eventTypeForDirection("received")).toBe("AGENT_MESSAGE_RECEIVED");
  });

  it("derives a per-correlation workflow_step_id", () => {
    expect(messageWorkflowStep("corr-1")).toBe("agentos-msg-corr-1");
  });

  it("validates a well-formed message", () => {
    expect(validateMessage(msg())).toEqual({ valid: true });
  });

  it("collects field errors", () => {
    const r = validateMessage({ message_id: "", sender_agent_id: "", recipient_agent_id: "", message_type: "NOPE", payload: null, workflow_step_id: "", correlation_id: "" });
    expect(r.valid).toBe(false);
    if (!r.valid) {
      expect(r.errors.some((e) => e.includes("message_type"))).toBe(true);
      expect(r.errors.some((e) => e.includes("correlation_id"))).toBe(true);
      expect(r.errors.some((e) => e.includes("payload"))).toBe(true);
    }
  });
});
