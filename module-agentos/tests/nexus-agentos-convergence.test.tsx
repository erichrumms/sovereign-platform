/** @jest-environment jsdom */
/**
 * module-agentos — nexus-agentos-convergence.test.tsx (Session 22, D2 / Item 57).
 *
 * The NEXUS → AgentOS UI convergence: a NEXUS work request routed through the LIVE
 * AgentOS-backed port (createAgentOSBackedPort) publishes its AgentOS task to the shared
 * task surface (GD-19, ctx.taskSurface — the ninth shell export), and the AgentOS Task
 * Registry panel — subscribed to the same surface through useTaskRegistry — shows it.
 *
 * This is the proof that closes the Session 18 SCOPE BOUNDARY note: the NEXUS submission now
 * "appears in AgentOS". Both sides share ONE ctx (as the real shell hands the same context to
 * every module), so they share one taskSurface instance.
 */
import { act, fireEvent, render, screen, within } from "@testing-library/react";

import type { AgentOSSubmitInput } from "../../module-nexus/src/agentos-port";
import { createAgentOSBackedPort } from "../src/nexus-agentos-port";
import { AgentOSApp } from "../src/AgentOSApp";
import { makeCtx } from "./test-helpers";

function submitInput(requestId: string, requestType = "DOCUMENT_REVIEW"): AgentOSSubmitInput {
  return {
    request_id: requestId,
    request_type: requestType,
    agent_class: "Analytical",
    requires_approval: requestType === "COMPLIANCE_CHECK",
    data_classification: "UNCLASSIFIED",
    workflow_step_id: `nexus-request-${requestId}`,
  };
}

describe("NEXUS → AgentOS convergence via the shared task surface (Item 57)", () => {
  it("a NEXUS hand-off appears in the AgentOS Task Registry panel", () => {
    // One ctx shared by NEXUS's port and the AgentOS app — exactly as the shell wires it.
    const ctx = makeCtx();
    const port = createAgentOSBackedPort(ctx);

    render(<AgentOSApp ctx={ctx} />);

    // Before any hand-off, the registry is empty.
    expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();

    // NEXUS routes a request to AgentOS (the live port publishes to ctx.taskSurface).
    act(() => {
      port.submitTask(submitInput("req-9"));
    });

    // The task now shows in the AgentOS Task Registry, tagged with its NEXUS origin.
    const row = screen.getByText(/nexus-req-9/).closest("tr") as HTMLElement;
    expect(row).toBeInTheDocument();
    expect(within(row).getByText(/DOCUMENT_REVIEW \(NEXUS req-9\)/)).toBeInTheDocument();
    expect(within(row).getByText(/from NEXUS · req-9/)).toBeInTheDocument();
    expect(within(row).getByText("ASSIGNED")).toBeInTheDocument();
  });

  it("a NEXUS-originated task is shown but not locally driveable (no AgentOS Cancel)", () => {
    const ctx = makeCtx();
    const port = createAgentOSBackedPort(ctx);

    render(<AgentOSApp ctx={ctx} />);
    act(() => {
      port.submitTask(submitInput("req-10"));
    });

    const row = screen.getByText(/nexus-req-10/).closest("tr") as HTMLElement;
    // The task is ASSIGNED (non-terminal) but owned by NEXUS — AgentOS offers no Cancel for it.
    expect(within(row).queryByRole("button", { name: /cancel/i })).toBeNull();
    expect(row.getAttribute("data-origin")).toBe("NEXUS");
  });

  it("a locally created AgentOS task remains independently driveable alongside NEXUS tasks", () => {
    const ctx = makeCtx();
    const port = createAgentOSBackedPort(ctx);

    render(<AgentOSApp ctx={ctx} />);
    act(() => {
      port.submitTask(submitInput("req-11"));
    });

    // Create a native AgentOS task through the panel form.
    const input = screen.getByLabelText(/task title/i);
    fireEvent.change(input, { target: { value: "Native local task" } });
    fireEvent.click(screen.getByRole("button", { name: /create task/i }));

    // The NEXUS task has no Cancel; the native task does (it is AgentOS-owned).
    const nexusRow = screen.getByText(/nexus-req-11/).closest("tr") as HTMLElement;
    const nativeRow = screen.getByText(/Native local task/).closest("tr") as HTMLElement;
    expect(within(nexusRow).queryByRole("button", { name: /cancel/i })).toBeNull();
    expect(within(nativeRow).getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(nativeRow.getAttribute("data-origin")).toBe("AGENTOS");
  });
});
