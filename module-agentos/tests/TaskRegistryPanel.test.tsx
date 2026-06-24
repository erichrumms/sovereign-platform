/** @jest-environment jsdom */
/**
 * module-agentos — TaskRegistryPanel.test.tsx
 * The registry surface in isolation (driven by a real useTaskRegistry): empty state,
 * task creation, and cancellation (a non-terminal task → CANCELLED).
 */
import { render, screen, fireEvent, within } from "@testing-library/react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { useTaskRegistry } from "../src/useTaskRegistry";
import { TaskRegistryPanel } from "../src/TaskRegistryPanel";
import { makeCtx } from "./test-helpers";

function Harness({ ctx }: { ctx: SovereignShellContext }): JSX.Element {
  const registry = useTaskRegistry(ctx);
  return <TaskRegistryPanel registry={registry} />;
}

describe("TaskRegistryPanel", () => {
  it("shows an empty state before any task exists", () => {
    render(<Harness ctx={makeCtx()} />);
    expect(screen.getByText(/No tasks yet/)).toBeInTheDocument();
  });

  it("creates a task that appears CREATED with its classification", () => {
    render(<Harness ctx={makeCtx()} />);
    fireEvent.change(screen.getByLabelText("task title"), { target: { value: "Rotate keys" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));
    const row = screen.getByText(/Rotate keys/).closest("tr")!;
    expect(within(row).getByText("CREATED")).toBeInTheDocument();
    expect(within(row).getByText("UNCLASSIFIED")).toBeInTheDocument();
  });

  it("cancels a task (CREATED → CANCELLED)", () => {
    const logSink: never[] = [];
    render(<Harness ctx={makeCtx({ logSink })} />);
    fireEvent.change(screen.getByLabelText("task title"), { target: { value: "Rotate keys" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    const row = screen.getByText(/Rotate keys/).closest("tr")!;
    expect(within(row).getByText("CANCELLED")).toBeInTheDocument();
    // No Cancel button on a terminal task.
    expect(within(row).queryByRole("button", { name: "Cancel" })).toBeNull();
  });
});
