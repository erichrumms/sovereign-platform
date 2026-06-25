/**
 * module-agentos — message-bus.test.ts
 * The synthetic A2A message bus: publish delivers to the recipient's inbox and notifies its
 * subscribers; getMessages reads an inbox; unsubscribe stops delivery; senders/other agents
 * do not receive another agent's messages.
 */
import { createSyntheticMessageBus } from "../src/message-bus";
import type { AgentMessage } from "../src/agentos-message";

function msg(over: Partial<AgentMessage> = {}): AgentMessage {
  return {
    message_id: "m-1",
    sender_agent_id: "agentos.deployer",
    recipient_agent_id: "agentos.exporter",
    message_type: "REQUEST",
    payload: {},
    workflow_step_id: "agentos-msg-corr-1",
    correlation_id: "corr-1",
    ...over,
  };
}

describe("createSyntheticMessageBus", () => {
  it("delivers a published message to the recipient inbox only", () => {
    const bus = createSyntheticMessageBus();
    bus.publish(msg());
    expect(bus.getMessages("agentos.exporter").map((m) => m.message_id)).toEqual(["m-1"]);
    expect(bus.getMessages("agentos.deployer")).toHaveLength(0); // sender does not receive
  });

  it("notifies a subscriber of the recipient on publish", () => {
    const bus = createSyntheticMessageBus();
    const received: string[] = [];
    bus.subscribe("agentos.exporter", (m) => received.push(m.message_id));
    bus.publish(msg({ message_id: "m-2" }));
    expect(received).toEqual(["m-2"]);
  });

  it("stops delivery after unsubscribe", () => {
    const bus = createSyntheticMessageBus();
    const received: string[] = [];
    const unsub = bus.subscribe("agentos.exporter", (m) => received.push(m.message_id));
    bus.publish(msg({ message_id: "m-a" }));
    unsub();
    bus.publish(msg({ message_id: "m-b" }));
    expect(received).toEqual(["m-a"]); // m-b not delivered to the unsubscribed handler
    expect(bus.getMessages("agentos.exporter").map((m) => m.message_id)).toEqual(["m-a", "m-b"]); // inbox still records both
  });

  it("preserves arrival order across multiple messages", () => {
    const bus = createSyntheticMessageBus();
    bus.publish(msg({ message_id: "m-1" }));
    bus.publish(msg({ message_id: "m-2", message_type: "RESPONSE" }));
    expect(bus.getMessages("agentos.exporter").map((m) => m.message_id)).toEqual(["m-1", "m-2"]);
  });
});
