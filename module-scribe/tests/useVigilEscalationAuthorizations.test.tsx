/** @jest-environment jsdom */
/**
 * module-scribe — useVigilEscalationAuthorizations.test.tsx (Session 35).
 * The SCRIBE half of the cross-module state gap fix: a VIGIL escalation
 * authorization published on ctx.taskSurface (GD-19) flips the matching
 * TTManagerReview item to sendable WITHOUT a manual refresh or prop change.
 */

import { render, screen, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

import type { SharedTask } from "../../sovereign-shell/shell-contract";
import { makeCtx, createInMemoryTaskSurface } from "./test-helpers";
import { useVigilEscalationAuthorizations } from "../src/useVigilEscalationAuthorizations";
import { TTManagerReview } from "../src/TTManagerReview";
import { DEMO_TT_REVIEW_ITEMS } from "../src/tt-synthetic-review";

const NOW = "2026-07-13T12:00:00.000Z";

/** The SharedTask VIGIL's tt-escalation-surface publishes for a decided case. */
function vigilDecision(flagId: string, status: "APPROVED" | "REJECTED"): SharedTask {
  return {
    task_id: `tt-escalation-${flagId}`,
    title: `Formal escalation authorization — ${flagId}`,
    description: "Manager authorization decision recorded in VIGIL.",
    status,
    origin_product: "VIGIL",
    assigned_agent_id: "tt.escalation-monitor",
    requires_approval: true,
    data_classification: "UNCLASSIFIED",
    workflow_step_id: `vigil-approval-tt-escalation-${flagId}`,
    origin_request_id: flagId,
    created_at: NOW,
    updated_at: NOW,
  };
}

// The seeded pending formal escalation (tt-synthetic-review.ts — VIGIL gate PENDING).
const PENDING_FLAG_ID = "SYNTH-TM-205-F1";

describe("useVigilEscalationAuthorizations — the live authorization set", () => {
  it("starts empty and adds a flag id when VIGIL publishes APPROVED", () => {
    const surface = createInMemoryTaskSurface();
    const ctx = makeCtx({ taskSurface: surface });
    const { result } = renderHook(() => useVigilEscalationAuthorizations(ctx));
    expect(result.current.size).toBe(0);
    act(() => surface.publish(vigilDecision(PENDING_FLAG_ID, "APPROVED")));
    expect(result.current.has(PENDING_FLAG_ID)).toBe(true);
  });

  it("a REJECTED publication yields no membership — the item stays gated", () => {
    const surface = createInMemoryTaskSurface();
    const ctx = makeCtx({ taskSurface: surface });
    const { result } = renderHook(() => useVigilEscalationAuthorizations(ctx));
    act(() => surface.publish(vigilDecision(PENDING_FLAG_ID, "REJECTED")));
    expect(result.current.size).toBe(0);
  });

  it("non-VIGIL and non-escalation tasks on the surface are ignored", () => {
    const surface = createInMemoryTaskSurface();
    const ctx = makeCtx({ taskSurface: surface });
    const { result } = renderHook(() => useVigilEscalationAuthorizations(ctx));
    act(() =>
      surface.publish({
        ...vigilDecision("SYNTH-REQ-9", "APPROVED"),
        task_id: "nexus-req-9",
        origin_product: "NEXUS",
      })
    );
    expect(result.current.size).toBe(0);
  });

  it("a ctx without the surface degrades to the empty set (partial test ctx)", () => {
    const ctx = makeCtx();
    (ctx as { taskSurface?: unknown }).taskSurface = undefined;
    const { result } = renderHook(() => useVigilEscalationAuthorizations(ctx));
    expect(result.current.size).toBe(0);
  });
});

describe("TTManagerReview — the queue flips sendable without a manual refresh", () => {
  function renderPendingEscalation(surface = createInMemoryTaskSurface()) {
    const ctx = makeCtx({ taskSurface: surface });
    const pending = DEMO_TT_REVIEW_ITEMS.find(
      (i) => i.flag.flag_id === PENDING_FLAG_ID
    )!;
    render(<TTManagerReview ctx={ctx} items={[pending]} />);
    return { surface };
  }

  it("before authorization: send disabled, 'Awaiting VIGIL authorization' shown", () => {
    renderPendingEscalation();
    expect(screen.getByTestId("tt-send-communication")).toBeDisabled();
    expect(screen.getByTestId("tt-awaiting-authorization")).toBeInTheDocument();
  });

  it("a live VIGIL authorization enables send in place — same render, no prop change", () => {
    const { surface } = renderPendingEscalation();
    expect(screen.getByTestId("tt-send-communication")).toBeDisabled();
    act(() => surface.publish(vigilDecision(PENDING_FLAG_ID, "APPROVED")));
    expect(screen.getByTestId("tt-send-communication")).not.toBeDisabled();
    expect(screen.queryByTestId("tt-awaiting-authorization")).not.toBeInTheDocument();
  });

  it("a live VIGIL rejection keeps the item gated", () => {
    const { surface } = renderPendingEscalation();
    act(() => surface.publish(vigilDecision(PENDING_FLAG_ID, "REJECTED")));
    expect(screen.getByTestId("tt-send-communication")).toBeDisabled();
    expect(screen.getByTestId("tt-awaiting-authorization")).toBeInTheDocument();
  });

  it("an authorization for a DIFFERENT flag does not unlock this item", () => {
    const { surface } = renderPendingEscalation();
    act(() => surface.publish(vigilDecision("SYNTH-TM-999-F1", "APPROVED")));
    expect(screen.getByTestId("tt-send-communication")).toBeDisabled();
  });
});
