/** @jest-environment jsdom */
/**
 * module-flowpath — FlowpathApp.test.tsx
 * The composition root: the FLOWPATH header renders, the Session Manager is the default surface,
 * and the tab bar switches to the Elicitation Dialogue (which now shows preliminary context first).
 *
 * Session 63 (WH-20): FlowpathApp owns sessions state and routes navigation through lifecycle
 * callbacks. makeCtx() now provides a no-op reviewerWorkspaceSurface so workspace-publish effects
 * don't throw in tests.
 * Session 65 (F1): makeCtx supports flowpathWorkspaceItems so the lazy tab/bundle initializers
 * can be exercised — tests verify the three mount-time routing branches.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { FlowpathApp } from "../src/FlowpathApp";
import { makeCtx } from "./test-helpers";
import { resetFlowpathApprovalSessionForTests } from "../src/flowpath-approval-session";
import { resetFlowpathElicitationSessionForTests } from "../src/flowpath-elicitation-session";
import { SYNTHETIC_SESSION_ID, SYNTHETIC_MAPPER_OUTPUT } from "../src/synthetic-elicitation";

describe("FlowpathApp", () => {
  // Both session stores are module-level singletons — reset per test.
  beforeEach(() => {
    resetFlowpathApprovalSessionForTests();
    resetFlowpathElicitationSessionForTests();
  });

  it("renders the FLOWPATH header and defaults to the Session Manager", () => {
    render(<FlowpathApp ctx={makeCtx()} />);
    expect(screen.getByRole("heading", { name: "FLOWPATH" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: /elicitation sessions/i })).toBeInTheDocument();
  });

  // Session 122 (survey Finding 5): Gate 1 consolidated to the composition root —
  // present on every tab, exactly once, including Workstyle and Review which
  // previously had no disclosure.
  it("renders the Gate 1 banner once at the root, on every tab", () => {
    render(<FlowpathApp ctx={makeCtx()} />);
    const GATE1 = /AI disclosure \(CPMI-VRS Gate 1\)/;
    expect(screen.getAllByText(GATE1)).toHaveLength(1);
    for (const tab of [/my workstyle/i, /certification/i, /artifact review/i, /elicitation dialogue/i, /elicitation sessions/i]) {
      fireEvent.click(screen.getByRole("tab", { name: tab }));
      expect(screen.getAllByText(GATE1)).toHaveLength(1);
    }
  });

  it("switches to the Elicitation Dialogue via the tab bar and shows the preliminary context stage", () => {
    render(<FlowpathApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("tab", { name: /elicitation dialogue/i }));
    // Session 63 Task 2: preliminary context stage is shown first; five questions are locked.
    expect(screen.getByRole("heading", { name: /Preliminary context/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirm preliminary context/i })).toBeInTheDocument();
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

// F1 (Session 65) — three mount-time routing branches for the initialState.selectedSessionId path.
describe("FlowpathApp — F1 initialState routing (Session 65)", () => {
  beforeEach(() => {
    resetFlowpathApprovalSessionForTests();
    resetFlowpathElicitationSessionForTests();
  });

  it("F1 main: COMPLETE + gate_passed + workspace item → Artifact Review tab with the real bundle", () => {
    // Use a distinct title so we can prove the real bundle is used, not SYNTHETIC_MAPPER_OUTPUT fallback.
    const testBundle = {
      ...SYNTHETIC_MAPPER_OUTPUT,
      artifact: {
        ...SYNTHETIC_MAPPER_OUTPUT.artifact,
        title: "F1 Reconstruction Test Workflow",
      },
    };
    const ctx = makeCtx({
      flowpathWorkspaceItems: [
        {
          module_id: "flowpath",
          item_id: SYNTHETIC_SESSION_ID,
          payload: testBundle,
          published_at: "2026-07-26T00:00:00.000Z",
        },
      ],
    });
    render(<FlowpathApp ctx={ctx} initialState={{ selectedSessionId: SYNTHETIC_SESSION_ID }} />);
    // Artifact Review tab should be open with the real bundle title visible.
    expect(screen.getByTestId("artifact-review")).toBeInTheDocument();
    expect(screen.getByText("F1 Reconstruction Test Workflow")).toBeInTheDocument();
    // Sessions list must not be the primary surface.
    expect(screen.queryByRole("list", { name: /elicitation sessions/i })).not.toBeInTheDocument();
  });

  it("F1 edge case: COMPLETE + gate_passed but no workspace item (already approved) → sessions tab", () => {
    // Default makeCtx: listForModule returns [] — no workspace item for SYNTHETIC_SESSION_ID.
    render(
      <FlowpathApp
        ctx={makeCtx()}
        initialState={{ selectedSessionId: SYNTHETIC_SESSION_ID }}
      />
    );
    // Falls back to sessions tab — does not open an empty review tab.
    expect(screen.getByRole("list", { name: /elicitation sessions/i })).toBeInTheDocument();
    expect(screen.queryByTestId("artifact-review")).not.toBeInTheDocument();
  });

  it("WH-24 regression: IN_PROGRESS session with initialState still routes to the Dialogue tab", () => {
    // S-DSI-003 is IN_PROGRESS in the synthetic sessions — should open the dialogue, not review.
    render(
      <FlowpathApp
        ctx={makeCtx()}
        initialState={{ selectedSessionId: "S-DSI-003" }}
      />
    );
    expect(screen.getByRole("heading", { name: /Preliminary context/i })).toBeInTheDocument();
    expect(screen.queryByTestId("artifact-review")).not.toBeInTheDocument();
  });
});

// D5 (Session 61, finding D3-4) — the end-to-end resurrection proof: an approved
// session shows as approved on Screen 1 after the whole module remounts.
describe("FlowpathApp — approvals persist across remount (D5, Session 61)", () => {
  beforeEach(() => {
    resetFlowpathApprovalSessionForTests();
    resetFlowpathElicitationSessionForTests();
  });

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
