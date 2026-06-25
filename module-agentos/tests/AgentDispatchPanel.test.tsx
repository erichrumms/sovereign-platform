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

function Harness({ ctx, requiresApproval = true }: { ctx: SovereignShellContext; requiresApproval?: boolean }): JSX.Element {
  const registry = useTaskRegistry(ctx);
  const dispatcher = useAgentDispatcher();
  useEffect(() => {
    registry.create({ task_id: "task-1", title: "Refresh model", description: "d", requires_approval: requiresApproval, data_classification: "UNCLASSIFIED" });
  }, [registry, requiresApproval]);
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

  it("dispatches a requires_approval=false task straight to Execution (D3b — no approval queue)", () => {
    const logSink: import("../../sovereign-shell/shell-contract").SovereignLogEvent[] = [];
    render(<Harness ctx={makeCtx({ logSink })} requiresApproval={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Dispatch" }));

    // No VIGIL approval request; the task went ASSIGNED → IN_PROGRESS directly.
    expect(screen.queryByText(/agentos-req-task-1/)).toBeNull();
    expect(screen.getByRole("button", { name: "Complete" })).toBeInTheDocument();
    expect(logSink.map((e) => e.event_type)).toEqual(["AGENTOS_TASK_ASSIGNED", "AGENTOS_TASK_STARTED"]);
  });
});
