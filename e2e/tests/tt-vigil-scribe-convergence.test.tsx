/** @jest-environment jsdom */
/**
 * e2e — tt-vigil-scribe-convergence.test.tsx (Session 35).
 *
 * THE LIVE SCENARIO for the cross-module state gap fix: one shared
 * SovereignShellContext (exactly as the shell wires it), the REAL VIGIL decision
 * hook on one side and the REAL SCRIBE manager-review component on the other.
 * A manager authorizes the seeded SYNTH-TM-205 formal escalation in VIGIL, and
 * SCRIBE's queue item flips to sendable in place — no manual refresh, no prop
 * change, no re-mount. This is the demonstration Walkthrough F will repeat in
 * the browser.
 *
 * Item 57 / GD-19 pattern precedent: nexus-agentos convergence via ctx.taskSurface.
 */

import { render, screen, act, renderHook } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { makeCtx } from "./harness";

import { useApprovalDecision } from "../../module-vigil/src/useApprovalDecision";
import { makeDemoTTApprovalRequest } from "../../module-vigil/src/tt-synthetic-alerts";
import { TTManagerReview } from "../../module-scribe/src/TTManagerReview";
import { DEMO_TT_REVIEW_ITEMS } from "../../module-scribe/src/tt-synthetic-review";

const NOTE = "Recurrence history reviewed with the supervisor; escalation authorized.";

describe("VIGIL → SCRIBE convergence via the shared task surface (Session 35 gap fix)", () => {
  it("a VIGIL authorization flips SCRIBE's escalation item to sendable without a refresh", () => {
    const logged: SovereignLogEvent[] = [];
    const ctx = makeCtx(logged); // ONE ctx shared by both modules — as the shell wires it.

    // SCRIBE: the manager review queue with the seeded PENDING formal escalation.
    const pending = DEMO_TT_REVIEW_ITEMS.find((i) => i.flag.flag_id === "SYNTH-TM-205-F1")!;
    render(<TTManagerReview ctx={ctx} items={[pending]} />);
    expect(screen.getByTestId("tt-send-communication")).toBeDisabled();
    expect(screen.getByTestId("tt-awaiting-authorization")).toBeInTheDocument();

    // VIGIL: the manager authorizes the same escalation in the Agent Approval Queue.
    const { result: vigil } = renderHook(() => useApprovalDecision(ctx));
    act(() => {
      const decision = vigil.current.decide(
        makeDemoTTApprovalRequest("2026-07-13T12:00:00.000Z"),
        "APPROVE",
        NOTE
      );
      expect(decision.ok).toBe(true);
    });

    // SCRIBE reflects it in place: sendable, no awaiting notice, no refresh.
    expect(screen.getByTestId("tt-send-communication")).not.toBeDisabled();
    expect(screen.queryByTestId("tt-awaiting-authorization")).not.toBeInTheDocument();

    // The decision of record is VIGIL's Logger event — the surface added visibility only.
    const decisionEvents = logged.filter((e) => e.event_type === "AGENT_ACTION_APPROVED");
    expect(decisionEvents).toHaveLength(1);
    expect(decisionEvents[0]).toMatchObject({
      product: "VIGIL",
      decision_type: "AGENT_APPROVAL",
      workflow_step_id: "vigil-approval-tt-escalation-SYNTH-TM-205-F1",
    });
  });

  it("a VIGIL rejection leaves SCRIBE's item gated — visible state, still unsendable", () => {
    const logged: SovereignLogEvent[] = [];
    const ctx = makeCtx(logged);

    const pending = DEMO_TT_REVIEW_ITEMS.find((i) => i.flag.flag_id === "SYNTH-TM-205-F1")!;
    render(<TTManagerReview ctx={ctx} items={[pending]} />);

    const { result: vigil } = renderHook(() => useApprovalDecision(ctx));
    act(() => {
      expect(
        vigil.current.decide(
          makeDemoTTApprovalRequest("2026-07-13T12:00:00.000Z"),
          "REJECT",
          "Recurrence explanation accepted; formal escalation not warranted."
        ).ok
      ).toBe(true);
    });

    expect(screen.getByTestId("tt-send-communication")).toBeDisabled();
    expect(screen.getByTestId("tt-awaiting-authorization")).toBeInTheDocument();
  });
});
