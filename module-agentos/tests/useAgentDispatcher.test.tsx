/** @jest-environment jsdom */
/**
 * module-agentos — useAgentDispatcher.test.tsx
 * Dispatch wiring: an authorized task yields an assignment and (when it requires approval)
 * submits a request to the port VIGIL reads; the GD-10 boundary refuses an unauthorized
 * classification and surfaces the governance-fixed message without submitting anything.
 */
import { renderHook, act } from "@testing-library/react";

import { useAgentDispatcher } from "../src/useAgentDispatcher";
import { createTask } from "../src/task-registry";
import type { CreateTaskInput, Task } from "../src/agentos-contract";

const NOW = "2026-06-24T12:00:00.000Z";

function task(over: Partial<CreateTaskInput> = {}): Task {
  return createTask(
    { task_id: "task-1", title: "t", description: "d", requires_approval: true, data_classification: "UNCLASSIFIED", ...over },
    NOW
  );
}

describe("useAgentDispatcher", () => {
  it("dispatches an authorized task and submits an approval request to the port", () => {
    const { result } = renderHook(() => useAgentDispatcher());
    let res: ReturnType<typeof result.current.dispatch> = null;
    act(() => { res = result.current.dispatch(task()); });

    expect(res).not.toBeNull();
    expect(res!.assignment.task_id).toBe("task-1");
    expect(res!.approvalRequest).toBeDefined();
    expect(result.current.pendingRequests().map((r) => r.request_id)).toEqual(["agentos-req-task-1"]);
    expect(result.current.error).toBeNull();
  });

  it("does not submit a request when the task does not require approval", () => {
    const { result } = renderHook(() => useAgentDispatcher());
    let res: ReturnType<typeof result.current.dispatch> = null;
    act(() => { res = result.current.dispatch(task({ requires_approval: false })); });
    expect(res!.approvalRequest).toBeUndefined();
    expect(result.current.pendingRequests()).toHaveLength(0);
  });

  it("records a decision and reports it back (closing the loop)", () => {
    const { result } = renderHook(() => useAgentDispatcher());
    act(() => { result.current.dispatch(task()); });
    act(() => result.current.recordDecision("agentos-req-task-1", "approved"));
    expect(result.current.decisionFor("agentos-req-task-1")).toBe("approved");
    expect(result.current.pendingRequests()).toHaveLength(0);
  });

  it("refuses an unauthorized classification (GD-10) and surfaces the fixed message", () => {
    const { result } = renderHook(() => useAgentDispatcher());
    let res: ReturnType<typeof result.current.dispatch> = null;
    act(() => { res = result.current.dispatch(task({ data_classification: "CUI" })); });
    expect(res).toBeNull();
    expect(result.current.error).toBe(
      "This classification level is not authorized for processing in SOVEREIGN. Contact your system administrator."
    );
    expect(result.current.pendingRequests()).toHaveLength(0);
  });
});
