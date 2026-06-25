/** @jest-environment jsdom */
/**
 * module-agentos — useMessageBus.test.tsx
 * The A2A hook: send emits AGENT_MESSAGE_SENT (actor sender) then publishes; receive emits
 * AGENT_MESSAGE_RECEIVED (actor recipient); both carry workflow_step_id + correlation_id;
 * Gate 2 fail-closed blocks the publish when the SENT emit throws; an invalid message is
 * rejected without publishing.
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useMessageBus } from "../src/useMessageBus";
import { createSyntheticMessageBus } from "../src/message-bus";
import type { AgentMessage } from "../src/agentos-message";
import { makeCtx } from "./test-helpers";

function msg(over: Partial<AgentMessage> = {}): AgentMessage {
  return {
    message_id: "m-1",
    sender_agent_id: "agentos.deployer",
    recipient_agent_id: "agentos.exporter",
    message_type: "REQUEST",
    payload: { task: "deploy" },
    workflow_step_id: "agentos-msg-corr-1",
    correlation_id: "corr-1",
    ...over,
  };
}

describe("useMessageBus", () => {
  it("send emits AGENT_MESSAGE_SENT (actor sender) and publishes to the bus", () => {
    const logSink: SovereignLogEvent[] = [];
    const bus = createSyntheticMessageBus();
    const { result } = renderHook(() => useMessageBus(makeCtx({ logSink }), bus));

    let ok = false;
    act(() => { ok = result.current.send(msg()); });
    expect(ok).toBe(true);
    expect(bus.getMessages("agentos.exporter")).toHaveLength(1);

    const sent = logSink.find((e) => e.event_type === "AGENT_MESSAGE_SENT")!;
    expect(sent.actor).toBe("agent");
    expect(sent.agent_id).toBe("agentos.deployer");
    expect(sent.workflow_step_id).toBe("agentos-msg-corr-1"); // Constraint #6
    expect(sent.product).toBe("AGENTOS");
    expect(sent.decision_type).toBeUndefined();
    expect((sent.payload as { correlation_id: string }).correlation_id).toBe("corr-1");
  });

  it("receive emits AGENT_MESSAGE_RECEIVED (actor recipient) sharing the correlation/workflow id", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useMessageBus(makeCtx({ logSink }), createSyntheticMessageBus()));
    act(() => { result.current.receive(msg()); });
    const recv = logSink.find((e) => e.event_type === "AGENT_MESSAGE_RECEIVED")!;
    expect(recv.agent_id).toBe("agentos.exporter");
    expect(recv.workflow_step_id).toBe("agentos-msg-corr-1");
  });

  it("links a REQUEST and its RESPONSE via correlation_id", () => {
    const logSink: SovereignLogEvent[] = [];
    const bus = createSyntheticMessageBus();
    const { result } = renderHook(() => useMessageBus(makeCtx({ logSink }), bus));
    act(() => { result.current.send(msg({ message_id: "req", message_type: "REQUEST" })); });
    act(() => {
      result.current.send(msg({
        message_id: "res", message_type: "RESPONSE",
        sender_agent_id: "agentos.exporter", recipient_agent_id: "agentos.deployer",
      }));
    });
    expect(logSink.filter((e) => e.event_type === "AGENT_MESSAGE_SENT")).toHaveLength(2);
    expect(logSink.every((e) => (e.payload as { correlation_id: string }).correlation_id === "corr-1")).toBe(true);
  });

  it("fails closed when the SENT emit throws — message is NOT published (Gate 2)", () => {
    const bus = createSyntheticMessageBus();
    const { result } = renderHook(() => useMessageBus(makeCtx({ throwOnLog: true }), bus));
    let ok = true;
    act(() => { ok = result.current.send(msg()); });
    expect(ok).toBe(false);
    expect(result.current.error).toMatch(/Logger emit failed/);
    expect(bus.getMessages("agentos.exporter")).toHaveLength(0); // not published
  });

  it("rejects an invalid message without publishing", () => {
    const bus = createSyntheticMessageBus();
    const { result } = renderHook(() => useMessageBus(makeCtx(), bus));
    let ok = true;
    act(() => { ok = result.current.send(msg({ correlation_id: "" })); });
    expect(ok).toBe(false);
    expect(result.current.error).toMatch(/Invalid message/);
    expect(bus.getMessages("agentos.exporter")).toHaveLength(0);
  });
});
