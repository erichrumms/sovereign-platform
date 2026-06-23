/** @jest-environment jsdom */
/**
 * module-lens — GovernanceExplainer.test.tsx
 * The question→answer surface. Key-less, so the engine serves the static tier: the
 * answer renders, the degraded banner is shown (not passed off as live), and the
 * source documents are named up front.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { GovernanceExplainer } from "../src/GovernanceExplainer";
import { makeCtx } from "./test-helpers";

describe("GovernanceExplainer", () => {
  it("names the two source documents it is grounded in", () => {
    render(<GovernanceExplainer ctx={makeCtx()} />);
    expect(screen.getByLabelText("Governance Explainer")).toHaveTextContent(/VIGIL Alert Response/);
    expect(screen.getByLabelText("Governance Explainer")).toHaveTextContent(/VIGIL Agent Approvals/);
  });

  it("answers a question (static tier, key-less) and labels the degraded mode", async () => {
    render(<GovernanceExplainer ctx={makeCtx()} />);

    fireEvent.change(screen.getByLabelText("Your question"), {
      target: { value: "Who can see security alerts in VIGIL?" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Ask the Explainer/ }));

    await waitFor(() => {
      expect(screen.getByLabelText("Explanation")).toBeInTheDocument();
    });
    // Degraded (static) mode is disclosed, not hidden.
    expect(screen.getByLabelText("Explanation")).toHaveTextContent(/Degraded mode/);
    expect(screen.getByLabelText("Explanation")).toHaveTextContent(/Partial/);
  });

  it("does not call out to ask when the question is empty", () => {
    render(<GovernanceExplainer ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("button", { name: /Ask the Explainer/ }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Enter a question/);
  });
});
