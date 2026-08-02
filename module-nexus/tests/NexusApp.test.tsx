/** @jest-environment jsdom */
/**
 * module-nexus — NexusApp.test.tsx
 * End-to-end through the mounted UI: render the chrome (Gate-1 disclosure + GD-10 boundary),
 * submit a request, route it, drive the approval path to COMPLETE, and assert the GD-11
 * Logger trail. Also: the GD-10 intake refusal surfaced in the UI.
 */
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { NexusApp } from "../src/NexusApp";
import { resetTTSessionForTests } from "../src/tt-session";
import { makeCtx } from "./test-helpers";

function submitViaUI(title: string, type: string, classification = "UNCLASSIFIED"): void {
  fireEvent.change(screen.getByLabelText("request title"), { target: { value: title } });
  fireEvent.change(screen.getByLabelText("request type"), { target: { value: type } });
  fireEvent.change(screen.getByLabelText("data classification"), { target: { value: classification } });
  fireEvent.click(screen.getByRole("button", { name: "Submit Request" }));
}

describe("NexusApp", () => {
  // D4 (Session 61): the TT queues are a module-level session store — reset per test.
  beforeEach(() => resetTTSessionForTests());

  it("renders the Gate-1 AI disclosure and the GD-10 classification boundary", () => {
    render(<NexusApp ctx={makeCtx()} />);
    expect(screen.getByRole("heading", { name: "NEXUS" })).toBeInTheDocument();
    expect(screen.getByText(/AI disclosure \(CPMI-VRS Gate 1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Classification boundary \(GD-10\)/)).toBeInTheDocument();
  });

  it("drives a COMPLIANCE_CHECK request through the approval path to COMPLETE", () => {
    const logSink: SovereignLogEvent[] = [];
    render(<NexusApp ctx={makeCtx({ logSink })} />);

    submitViaUI("Q3 compliance review", "COMPLIANCE_CHECK");
    fireEvent.click(screen.getByRole("tab", { name: "Request Queue" }));

    fireEvent.click(screen.getByRole("button", { name: "Route" }));
    // COMPLIANCE_CHECK requires approval → Send for Approval, then Approve.
    fireEvent.click(screen.getByRole("button", { name: "Send for Approval" }));
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    fireEvent.click(screen.getByRole("button", { name: "Complete" }));

    const row = screen.getByText(/Q3 compliance review/).closest("tr")!;
    expect(within(row).getByText("COMPLETE")).toBeInTheDocument();

    // Item 57 (D2): the live AgentOS-backed port creates a real AgentOS task on the way into
    // IN_PROGRESS, so AGENTOS_TASK_ASSIGNED now appears in the trail (the Session 15 synthetic
    // port emitted nothing). This is the convergence: the NEXUS hand-off is a real AgentOS task.
    expect(logSink.map((e) => e.event_type)).toEqual([
      "NEXUS_REQUEST_SUBMITTED",
      "NEXUS_REQUEST_ROUTED",
      "NEXUS_APPROVAL_PENDING",
      "NEXUS_REQUEST_IN_PROGRESS",
      "AGENTOS_TASK_ASSIGNED",
      "NEXUS_REQUEST_COMPLETE",
    ]);
    // The NEXUS lifecycle events all share the request workflow_step_id; the AgentOS task
    // carries its own (traceable) workflow_step_id that ties the hand-off together (Constraint #6).
    expect(logSink.filter((e) => e.product === "NEXUS").every((e) => e.workflow_step_id === "nexus-request-req-1")).toBe(true);
    const assigned = logSink.find((e) => e.event_type === "AGENTOS_TASK_ASSIGNED")!;
    expect(assigned.product).toBe("AGENTOS");
    expect(assigned.workflow_step_id).toBe("agentos-task-nexus-req-1");
    expect(assigned.payload.request_id).toBe("req-1");
  });

  it("drives a DOCUMENT_REVIEW request through the no-approval path (Route → Start → Complete)", () => {
    render(<NexusApp ctx={makeCtx()} />);
    submitViaUI("Review the SOW", "DOCUMENT_REVIEW");
    fireEvent.click(screen.getByRole("tab", { name: "Request Queue" }));
    fireEvent.click(screen.getByRole("button", { name: "Route" }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    fireEvent.click(screen.getByRole("button", { name: "Complete" }));
    const row = screen.getByText(/Review the SOW/).closest("tr")!;
    expect(within(row).getByText("COMPLETE")).toBeInTheDocument();
  });

  it("Gap 1: a freshly submitted request renders in the Request Queue with SUBMITTED status", () => {
    render(<NexusApp ctx={makeCtx()} />);
    submitViaUI("OilShield Q3 compliance document review", "DOCUMENT_REVIEW");
    fireEvent.click(screen.getByRole("tab", { name: "Request Queue" }));
    const row = screen.getByText(/OilShield Q3 compliance document review/).closest("tr")!;
    expect(within(row).getByText("SUBMITTED")).toBeInTheDocument();
    expect(within(row).getByText(/req-1/)).toBeInTheDocument();
  });

  it("Gap 1: two back-to-back submissions both appear as distinct queue rows", () => {
    render(<NexusApp ctx={makeCtx()} />);
    submitViaUI("First request", "DOCUMENT_REVIEW");
    submitViaUI("Second request", "DOCUMENT_REVIEW");
    fireEvent.click(screen.getByRole("tab", { name: "Request Queue" }));
    expect(screen.getByText(/First request/).closest("tr")).toBeTruthy();
    expect(screen.getByText(/Second request/).closest("tr")).toBeTruthy();
    expect(screen.getByText(/req-1/)).toBeInTheDocument();
    expect(screen.getByText(/req-2/)).toBeInTheDocument();
  });

  it("populates token_usage on AGENT_STEP_COMPLETE when travelDrafter live tier serves (GD-31)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const mockComplete = async () =>
      ({
        content: "Subject: Travel approved\n\nYour travel to Huntsville is approved.",
        fallback_activated: false,
        fallback_tier: "live",
        usage: { input_tokens: 100, output_tokens: 50 },
      } as unknown as import("@sovereign/api-client").SovereignLLMResponse);
    render(<NexusApp ctx={makeCtx({ logSink })} travelDrafterComplete={mockComplete} />);
    fireEvent.click(screen.getByRole("tab", { name: "Travel & Time Queue" }));
    fireEvent.click(screen.getByTestId("tt-approve-SYNTH-TR-102"));
    await waitFor(() => {
      const e = logSink.find(
        (ev) => ev.event_type === "AGENT_STEP_COMPLETE" && ev.agent_id === "tt.travel-drafter"
      );
      expect(e).toBeDefined();
      expect(e!.token_usage?.input_tokens).toBe(100);
      expect(e!.token_usage?.output_tokens).toBe(50);
      expect(typeof e!.token_usage?.estimated_cost_usd).toBe("number");
    });
  });

  it("leaves token_usage absent on AGENT_STEP_COMPLETE when travelDrafter fallback served (GD-31)", async () => {
    const logSink: SovereignLogEvent[] = [];
    render(<NexusApp ctx={makeCtx({ logSink })} />);
    fireEvent.click(screen.getByRole("tab", { name: "Travel & Time Queue" }));
    fireEvent.click(screen.getByTestId("tt-approve-SYNTH-TR-102"));
    await waitFor(() => {
      const e = logSink.find(
        (ev) => ev.event_type === "AGENT_STEP_COMPLETE" && ev.agent_id === "tt.travel-drafter"
      );
      expect(e).toBeDefined();
      expect(e!.token_usage).toBeUndefined();
    });
  });

  it("refuses a CUI intake (GD-10) and shows the boundary message", () => {
    const logSink: SovereignLogEvent[] = [];
    render(<NexusApp ctx={makeCtx({ logSink })} />);
    submitViaUI("Process CUI doc", "DATA_ANALYSIS", "CUI");
    expect(
      screen.getByText(
        "This classification level is not authorized for processing in SOVEREIGN. Contact your system administrator."
      )
    ).toBeInTheDocument();
    expect(logSink).toHaveLength(0);
  });
});
