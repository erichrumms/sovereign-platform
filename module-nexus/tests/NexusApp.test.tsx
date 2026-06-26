/** @jest-environment jsdom */
/**
 * module-nexus — NexusApp.test.tsx
 * End-to-end through the mounted UI: render the chrome (Gate-1 disclosure + GD-10 boundary),
 * submit a request, route it, drive the approval path to COMPLETE, and assert the GD-11
 * Logger trail. Also: the GD-10 intake refusal surfaced in the UI.
 */
import { render, screen, fireEvent, within } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { NexusApp } from "../src/NexusApp";
import { makeCtx } from "./test-helpers";

function submitViaUI(title: string, type: string, classification = "UNCLASSIFIED"): void {
  fireEvent.change(screen.getByLabelText("request title"), { target: { value: title } });
  fireEvent.change(screen.getByLabelText("request type"), { target: { value: type } });
  fireEvent.change(screen.getByLabelText("data classification"), { target: { value: classification } });
  fireEvent.click(screen.getByRole("button", { name: "Submit Request" }));
}

describe("NexusApp", () => {
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

    expect(logSink.map((e) => e.event_type)).toEqual([
      "NEXUS_REQUEST_SUBMITTED",
      "NEXUS_REQUEST_ROUTED",
      "NEXUS_APPROVAL_PENDING",
      "NEXUS_REQUEST_IN_PROGRESS",
      "NEXUS_REQUEST_COMPLETE",
    ]);
    expect(logSink.every((e) => e.workflow_step_id === "nexus-request-req-1")).toBe(true);
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
