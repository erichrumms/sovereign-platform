/** @jest-environment jsdom */
/**
 * module-agentos — AgentDispatchPanel.test.tsx
 * The dispatch surface in isolation (driven by real useTaskRegistry + useAgentDispatcher,
 * seeded with one CREATED task): dispatch enqueues a VIGIL approval request and moves the
 * task to PENDING_APPROVAL; approving it advances the task to the Execution section.
 */
import { useEffect } from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { useTaskRegistry } from "../src/useTaskRegistry";
import { useAgentDispatcher } from "../src/useAgentDispatcher";
import { AgentDispatchPanel } from "../src/AgentDispatchPanel";
import { makeCtx } from "./test-helpers";

function Harness({ ctx }: { ctx: SovereignShellContext }): JSX.Element {
  const registry = useTaskRegistry(ctx);
  const dispatcher = useAgentDispatcher();
  useEffect(() => {
    registry.create({ task_id: "task-1", title: "Refresh model", description: "d", requires_approval: true, data_classification: "UNCLASSIFIED" });
  }, [registry]);
  return <AgentDispatchPanel registry={registry} dispatcher={dispatcher} />;
}

describe("AgentDispatchPanel", () => {
  it("dispatches a task into the VIGIL approval queue, then approves it into Execution", () => {
    render(<Harness ctx={makeCtx()} />);

    // The seeded task is awaiting dispatch.
    const dispatchBtn = screen.getByRole("button", { name: "Dispatch" });
    fireEvent.click(dispatchBtn);

    // It now sits in the approval queue.
    expect(screen.getByText(/agentos-req-task-1/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dispatch" })).toBeNull();

    // Approve → the task moves to Execution (Start available).
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(screen.getByText(/APPROVED/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });

  it("rejecting from the queue removes the request and does not advance to Execution", () => {
    render(<Harness ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("button", { name: "Dispatch" }));
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(screen.queryByText(/agentos-req-task-1/)).toBeNull();
    expect(screen.queryByRole("button", { name: "Start" })).toBeNull();
  });
});
