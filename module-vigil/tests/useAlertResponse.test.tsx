/** @jest-environment jsdom */
/**
 * module-vigil — useAlertResponse.test.tsx
 * Alert responses emit the GD-4 ALERT_* events (spec §2.2) with operator identity and
 * workflow_step_id, enforce ACKNOWLEDGE-first ordering and the note requirement, do
 * NOT emit HUMAN_DECISION / decision_type (Session 7 governance decision), treat
 * INVESTIGATING as a no-emit local transition, and halt on a failed emit (Gate 2).
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useAlertResponse } from "../src/useAlertResponse";
import { makeCtx, makeAlert } from "./test-helpers";

type Res = { ok: boolean; closed: boolean };

describe("useAlertResponse — ALERT_* emission (spec §2.2)", () => {
  it("ACKNOWLEDGED emits ALERT_ACKNOWLEDGED with operator identity and no decision_type", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useAlertResponse(makeCtx({ logSink })));

    let res: Res | undefined;
    act(() => {
      res = result.current.respond(makeAlert(), "ACKNOWLEDGED");
    });

    expect(res).toEqual({ ok: true, closed: false });
    expect(logSink).toHaveLength(1);
    const e = logSink[0];
    expect(e.event_type).toBe("ALERT_ACKNOWLEDGED");
    expect(e.product).toBe("VIGIL");
    expect(e.actor).toBe("human");
    expect(e.actor_name).toBe("Pat Operator");
    expect(e.actor_id).toBe("E-900");
    expect(e.workflow_step_id).toBe("vigil-alert-ALERT-1");
    expect(e.decision_type).toBeUndefined();
  });

  it("blocks a non-acknowledge action until the alert is acknowledged", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useAlertResponse(makeCtx({ logSink })));

    let res: Res | undefined;
    act(() => {
      res = result.current.respond(makeAlert({ status: "UNACKNOWLEDGED" }), "RESOLVED", "a sufficiently long note");
    });

    expect(res?.ok).toBe(false);
    expect(logSink).toHaveLength(0);
    expect(result.current.error).toMatch(/Acknowledge the alert before/i);
  });

  it("requires a note (≥10 chars) to resolve", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useAlertResponse(makeCtx({ logSink })));

    let res: Res | undefined;
    act(() => {
      res = result.current.respond(makeAlert({ status: "ACKNOWLEDGED" }), "RESOLVED", "short");
    });

    expect(res?.ok).toBe(false);
    expect(logSink).toHaveLength(0);
    expect(result.current.error).toMatch(/note of at least 10/i);
  });

  it("RESOLVED with a note emits ALERT_RESOLVED (closing) carrying the note", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useAlertResponse(makeCtx({ logSink })));

    let res: Res | undefined;
    act(() => {
      res = result.current.respond(makeAlert({ status: "ACKNOWLEDGED" }), "RESOLVED", "resolved after investigation");
    });

    expect(res).toEqual({ ok: true, closed: true });
    expect(logSink[0].event_type).toBe("ALERT_RESOLVED");
    expect((logSink[0].payload as { note?: string }).note).toBe("resolved after investigation");
  });

  it("ESCALATED and FALSE_POSITIVE map to their GD-4 events and close the alert", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useAlertResponse(makeCtx({ logSink })));

    act(() => {
      result.current.respond(makeAlert({ status: "ACKNOWLEDGED" }), "ESCALATED", "needs SOC action");
    });
    act(() => {
      result.current.respond(makeAlert({ status: "INVESTIGATING" }), "FALSE_POSITIVE", "known benign job");
    });

    expect(logSink.map((e) => e.event_type)).toEqual(["ALERT_ESCALATED", "ALERT_FALSE_POSITIVE"]);
    expect(logSink.every((e) => e.decision_type === undefined)).toBe(true);
  });

  it("INVESTIGATING is a local transition with NO Logger event", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useAlertResponse(makeCtx({ logSink })));

    let res: Res | undefined;
    act(() => {
      res = result.current.respond(makeAlert({ status: "ACKNOWLEDGED" }), "INVESTIGATING");
    });

    expect(res).toEqual({ ok: true, closed: false });
    expect(logSink).toHaveLength(0);
  });

  it("halts on a failed Logger emit (Gate 2) — response not recorded", () => {
    const { result } = renderHook(() => useAlertResponse(makeCtx({ throwOnLog: true })));

    let res: Res | undefined;
    act(() => {
      res = result.current.respond(makeAlert(), "ACKNOWLEDGED");
    });

    expect(res?.ok).toBe(false);
    expect(result.current.error).toMatch(/Gate 2/);
  });
});
