/** @jest-environment jsdom */
/**
 * module-agentos — useTaskRegistry.test.tsx
 * The governed state machine: every transition emits its GD-9 AGENTOS_* event carrying the
 * task's workflow_step_id (Constraint #6); human transitions (APPROVED/REJECTED/CANCELLED)
 * carry actor "human" + decision_type (Constraint #4); agent transitions carry actor
 * "agent" + agent_id and no decision_type; Gate 2 fail-closed blocks a transition whose
 * Logger emit throws; illegal transitions are refused with an error.
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useTaskRegistry } from "../src/useTaskRegistry";
import { makeCtx } from "./test-helpers";

const INPUT = {
  task_id: "task-1",
  title: "Refresh APEX model",
  description: "synthetic",
  requires_approval: true,
  data_classification: "UNCLASSIFIED" as const,
};

describe("useTaskRegistry — full lifecycle emission", () => {
  it("emits each AGENTOS_* event with workflow_step_id; human/agent attribution correct", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useTaskRegistry(makeCtx({ logSink })));

    act(() => result.current.create(INPUT)); // no event — CREATED is the initial state
    act(() => result.current.assign("task-1", "agentos-deployer"));
    act(() => result.current.requestApproval("task-1", "agentos-req-task-1"));
    act(() => result.current.approve("task-1"));
    act(() => result.current.start("task-1"));
    act(() => result.current.complete("task-1"));

    expect(result.current.tasks[0].status).toBe("COMPLETE");
    expect(logSink.map((e) => e.event_type)).toEqual([
      "AGENTOS_TASK_ASSIGNED",
      "AGENTOS_APPROVAL_REQUESTED",
      "AGENTOS_TASK_APPROVED",
      "AGENTOS_TASK_STARTED",
      "AGENTOS_TASK_COMPLETE",
    ]);
    // Constraint #6 — every event shares the task workflow_step_id.
    expect(logSink.every((e) => e.workflow_step_id === "agentos-task-task-1")).toBe(true);
    expect(logSink.every((e) => e.product === "AGENTOS")).toBe(true);

    const assigned = logSink.find((e) => e.event_type === "AGENTOS_TASK_ASSIGNED")!;
    expect(assigned.actor).toBe("agent");
    expect(assigned.agent_id).toBe("agentos-deployer");
    expect(assigned.decision_type).toBeUndefined();

    const approved = logSink.find((e) => e.event_type === "AGENTOS_TASK_APPROVED")!;
    expect(approved.actor).toBe("human");
    expect(approved.actor_name).toBe("Pat Orchestrator");
    expect(approved.decision_type).toBe("TASK_APPROVAL"); // Constraint #4

    const requested = logSink.find((e) => e.event_type === "AGENTOS_APPROVAL_REQUESTED")!;
    expect((requested.payload as { request_id?: string }).request_id).toBe("agentos-req-task-1");
  });

  it("rejection carries TASK_APPROVAL; cancellation carries TASK_CANCELLATION (human)", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useTaskRegistry(makeCtx({ logSink })));

    act(() => result.current.create(INPUT));
    act(() => result.current.assign("task-1", "agentos-deployer"));
    act(() => result.current.requestApproval("task-1"));
    act(() => result.current.reject("task-1"));
    act(() => result.current.cancel("task-1"));

    expect(result.current.tasks[0].status).toBe("CANCELLED");
    const rejected = logSink.find((e) => e.event_type === "AGENTOS_TASK_REJECTED")!;
    expect(rejected.actor).toBe("human");
    expect(rejected.decision_type).toBe("TASK_APPROVAL");
    const cancelled = logSink.find((e) => e.event_type === "AGENTOS_TASK_CANCELLED")!;
    expect(cancelled.actor).toBe("human");
    expect(cancelled.decision_type).toBe("TASK_CANCELLATION");
  });

  it("chains assign → requestApproval within one handler (synchronous ref state)", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useTaskRegistry(makeCtx({ logSink })));
    act(() => result.current.create(INPUT));
    act(() => {
      result.current.assign("task-1", "agentos-deployer");
      result.current.requestApproval("task-1", "agentos-req-task-1");
    });
    expect(result.current.tasks[0].status).toBe("PENDING_APPROVAL");
    expect(logSink.map((e) => e.event_type)).toEqual(["AGENTOS_TASK_ASSIGNED", "AGENTOS_APPROVAL_REQUESTED"]);
  });
});

describe("useTaskRegistry — guards", () => {
  it("fails closed when a transition Logger emit throws (Gate 2)", () => {
    // First create + assign with a working logger, then flip to throwOnLog for the next emit.
    const logSink: SovereignLogEvent[] = [];
    const ctx = makeCtx({ logSink });
    let shouldThrow = false;
    const throwingCtx = {
      ...ctx,
      logger: { log: (e: SovereignLogEvent) => { if (shouldThrow) throw new Error("boom"); logSink.push(e); } },
    };
    const { result } = renderHook(() => useTaskRegistry(throwingCtx as typeof ctx));

    act(() => result.current.create(INPUT));
    act(() => result.current.assign("task-1", "agentos-deployer"));
    shouldThrow = true;
    act(() => result.current.requestApproval("task-1"));

    expect(result.current.error).toMatch(/Logger emit failed/);
    // Transition refused — still ASSIGNED, no PENDING_APPROVAL event recorded.
    expect(result.current.tasks[0].status).toBe("ASSIGNED");
    expect(logSink.some((e) => e.event_type === "AGENTOS_APPROVAL_REQUESTED")).toBe(false);
  });

  it("refuses an illegal transition with an error and no state change", () => {
    const { result } = renderHook(() => useTaskRegistry(makeCtx()));
    act(() => result.current.create(INPUT));
    act(() => result.current.start("task-1")); // CREATED → IN_PROGRESS is illegal
    expect(result.current.error).toMatch(/Illegal AgentOS task transition/);
    expect(result.current.tasks[0].status).toBe("CREATED");
  });
});
