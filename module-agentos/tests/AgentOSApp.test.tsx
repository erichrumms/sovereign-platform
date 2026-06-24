/** @jest-environment jsdom */
/**
 * module-agentos — AgentOSApp.test.tsx
 * End-to-end through the mounted UI: create a task, switch tabs, dispatch it (which submits
 * to the VIGIL approval queue), approve it, start and complete it — asserting the GD-9
 * Logger trail. Also: tab rendering and the GD-10 rejection surfaced in the dispatch UI.
 */
import { render, screen, fireEvent, within } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { AgentOSApp } from "../src/AgentOSApp";
import { makeCtx } from "./test-helpers";

function createTaskViaUI(title: string, classification = "UNCLASSIFIED"): void {
  fireEvent.change(screen.getByLabelText("task title"), { target: { value: title } });
  fireEvent.change(screen.getByLabelText("data classification"), { target: { value: classification } });
  fireEvent.click(screen.getByRole("button", { name: "Create Task" }));
}

describe("AgentOSApp", () => {
  it("renders the two surfaces and switches tabs", () => {
    render(<AgentOSApp ctx={makeCtx()} />);
    expect(screen.getByRole("heading", { name: "AgentOS" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Task Registry" })).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("tab", { name: "Agent Dispatch" }));
    expect(screen.getByRole("tab", { name: "Agent Dispatch" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Approval Queue (VIGIL)" })).toBeInTheDocument();
  });

  it("drives a task CREATED → COMPLETE through the UI and emits the GD-9 trail", () => {
    const logSink: SovereignLogEvent[] = [];
    render(<AgentOSApp ctx={makeCtx({ logSink })} />);

    createTaskViaUI("Refresh APEX model");
    expect(screen.getByText(/Refresh APEX model/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Agent Dispatch" }));
    fireEvent.click(screen.getByRole("button", { name: "Dispatch" }));

    // The approval request reached the VIGIL queue; approve it.
    expect(screen.getByText(/agentos-req-task-1/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    fireEvent.click(screen.getByRole("button", { name: "Complete" }));

    // Back to the registry — the task is COMPLETE.
    fireEvent.click(screen.getByRole("tab", { name: "Task Registry" }));
    const row = screen.getByText(/Refresh APEX model/).closest("tr")!;
    expect(within(row).getByText("COMPLETE")).toBeInTheDocument();

    expect(logSink.map((e) => e.event_type)).toEqual([
      "AGENTOS_TASK_ASSIGNED",
      "AGENTOS_APPROVAL_REQUESTED",
      "AGENTOS_TASK_APPROVED",
      "AGENTOS_TASK_STARTED",
      "AGENTOS_TASK_COMPLETE",
    ]);
    expect(logSink.every((e) => e.workflow_step_id === "agentos-task-task-1")).toBe(true);
  });

  it("rejects an unauthorized classification at dispatch (GD-10) and shows the message", () => {
    const logSink: SovereignLogEvent[] = [];
    render(<AgentOSApp ctx={makeCtx({ logSink })} />);

    createTaskViaUI("Process CUI data", "CUI");
    fireEvent.click(screen.getByRole("tab", { name: "Agent Dispatch" }));
    fireEvent.click(screen.getByRole("button", { name: "Dispatch" }));

    expect(
      screen.getByText(
        "This classification level is not authorized for processing in SOVEREIGN. Contact your system administrator."
      )
    ).toBeInTheDocument();
    // No lifecycle event emitted — the task never left CREATED.
    expect(logSink).toHaveLength(0);
  });
});
