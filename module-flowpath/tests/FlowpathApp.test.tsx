/** @jest-environment jsdom */
/**
 * module-flowpath — FlowpathApp.test.tsx
 * The composition root: the FLOWPATH header renders, the Session Manager is the default surface,
 * and the tab bar switches to the Elicitation Dialogue.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { FlowpathApp } from "../src/FlowpathApp";
import { makeCtx } from "./test-helpers";
import { resetFlowpathApprovalSessionForTests } from "../src/flowpath-approval-session";

describe("FlowpathApp", () => {
  // D5 (Session 61): approvals are a module-level session store — reset per test.
  beforeEach(() => resetFlowpathApprovalSessionForTests());

  it("renders the FLOWPATH header and defaults to the Session Manager", () => {
    render(<FlowpathApp ctx={makeCtx()} />);
    expect(screen.getByRole("heading", { name: "FLOWPATH" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: /elicitation sessions/i })).toBeInTheDocument();
  });

  it("switches to the Elicitation Dialogue via the tab bar", () => {
    render(<FlowpathApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("tab", { name: /elicitation dialogue/i }));
    expect(screen.getByRole("list", { name: /five-question gate status/i })).toBeInTheDocument();
  });

  it("WC-1: clicking a gate-passed session card navigates to the Artifact Review screen", () => {
    render(<FlowpathApp ctx={makeCtx()} />);
    // Default surface is the Session Manager; click the gate-passed (actionable) session.
    const row = screen.getByText(/Operational workflow — with the Program Analyst/i).closest("li")!;
    fireEvent.click(row);
    // Artifact Review (Screen 3) is now shown.
    expect(screen.getByTestId("artifact-review")).toBeInTheDocument();
  });
});

// D5 (Session 61, finding D3-4) — the end-to-end resurrection proof: an approved
// session shows as approved on Screen 1 after the whole module remounts.
describe("FlowpathApp — approvals persist across remount (D5, Session 61)", () => {
  beforeEach(() => resetFlowpathApprovalSessionForTests());

  it("an approved session's card still reads approved after unmounting and remounting the module", () => {
    const first = render(<FlowpathApp ctx={makeCtx()} />);
    // Screen 1 → open the gate-passed session → Screen 3 → approve.
    fireEvent.click(screen.getByRole("tab", { name: "Artifact Review" }));
    fireEvent.click(screen.getByRole("button", { name: /Approve and commit to registry/ }));
    // Back on Screen 1, the session reads approved.
    expect(screen.getByText(/Approved and committed to the workflow registry/)).toBeInTheDocument();
    first.unmount(); // navigate away from FLOWPATH entirely

    render(<FlowpathApp ctx={makeCtx()} />); // remount the module
    expect(screen.getByText(/Approved and committed to the workflow registry/)).toBeInTheDocument();
  });
});
