/** @jest-environment jsdom */
/**
 * module-vigil — VigilApp.test.tsx
 * The chrome renders the command center and two tabs: the Alert Queue (default — shows
 * the null-endpoint configuration notice) and the Agent Approval Queue (port-driven,
 * synthetic/dev requests). The legacy A2A-stage AgentApprovalQueue component is tested
 * standalone below (it is no longer rendered by VigilApp).
 */
import { render, screen, fireEvent, act } from "@testing-library/react";

import { VigilApp } from "../src/VigilApp";
import { AgentApprovalQueue } from "../src/AgentApprovalQueue";
import {
  removeVigilSessionRequest,
  resetVigilApprovalSessionForTests,
} from "../src/vigil-approval-session";
import { resetVigilAlertSessionForTests } from "../src/vigil-alert-session";
import { makeCtx } from "./test-helpers";

describe("VigilApp (scaffold)", () => {
  // Session 54 (WG-13): the approval queue is a module-level session store —
  // reset it so each test assembles a fresh queue.
  beforeEach(() => {
    resetVigilApprovalSessionForTests();
    resetVigilAlertSessionForTests(); // D2 (Session 61) — VigilApp now uses the alert session store
  });

  it("renders the VIGIL chrome and the operator identity", () => {
    render(<VigilApp ctx={makeCtx()} />);
    expect(screen.getByRole("heading", { name: "VIGIL", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Agent & Security Operator Dashboard/)).toBeInTheDocument();
    expect(screen.getByText(/Pat Operator/)).toBeInTheDocument();
  });

  it("renders the Alert Queue with the seeded ARIA Suite CLEAR alerts (S23 · D5)", () => {
    render(<VigilApp ctx={makeCtx()} />);
    const queue = screen.getByLabelText("Alert Queue");
    // ARIA CLEAR alerts are routed into the queue alongside existing alert types, and are
    // identifiable by source (the ARIA · CLEAR tag and the "ARIA" source meta).
    expect(queue).toHaveTextContent(/ARIA · CLEAR/);
    expect(queue.querySelectorAll('[data-source-product="ARIA"]').length).toBeGreaterThan(0);
  });

  it("shows the pending-approvals count from the synthetic/dev port in the command center", () => {
    render(<VigilApp ctx={makeCtx()} />);
    const summary = screen.getByLabelText("Command Center summary");
    expect(summary).toHaveTextContent(/Pending approvals/);
    expect(summary).toHaveTextContent(/5/); // three synthetic AgentOS requests + the seeded TT escalation (Session 29, WE-5) + Tier C obligation (Session 38, Part 3)
  });

  it("switches to the Actions Awaiting Your Approval tab and shows the synthetic requests", () => {
    render(<VigilApp ctx={makeCtx()} />);
    // Default tab is the Alert Queue; the approval queue is not yet shown.
    expect(screen.getByLabelText("Alert Queue")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Actions Awaiting Your Approval" }));
    expect(screen.getByLabelText("Actions Awaiting Your Approval")).toBeInTheDocument();
    expect(
      screen.getAllByText(/model_deployment|data_export|configuration_change/).length
    ).toBeGreaterThan(0);
  });

  // D1 (Session 61, docs/30 §2 step 1) — THE done-condition proof: a decision made at
  // another entry point (the Reviewer's Workspace's embedded copy ends its decision-commit
  // path in exactly this store removal) is reflected in an ALREADY-MOUNTED VigilApp,
  // with no remount. Before D1 this only worked by re-seeding at mount (finding D3-9).
  it("reflects a session-store removal in the already-mounted queue without a remount (D1)", () => {
    render(<VigilApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("tab", { name: "Actions Awaiting Your Approval" }));

    const summary = screen.getByLabelText("Command Center summary");
    expect(summary).toHaveTextContent(/5/); // full seeded queue

    // The Workspace's decision-commit path: remove from the shared session store.
    act(() => {
      removeVigilSessionRequest("req-dev-002");
    });

    // Same mounted component — the live subscription reflects the removal.
    expect(summary).toHaveTextContent(/4/);
    const queue = screen.getByLabelText("Actions Awaiting Your Approval");
    expect(queue).not.toHaveTextContent("req-dev-002");
  });
});

describe("AgentApprovalQueue — does not call throwing A2A methods", () => {
  it("renders the implemented note only at the IMPLEMENTED stage", () => {
    render(<AgentApprovalQueue a2aStage="IMPLEMENTED" />);
    expect(screen.getByLabelText("Agent Approval Queue")).toHaveTextContent(/A2A protocol is IMPLEMENTED/i);
  });
});
