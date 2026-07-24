/** @jest-environment jsdom */
/**
 * module-vigil — useAlertQueue.test.tsx
 * Ingestion emits ALERT_RECEIVED (system actor), the queue sorts P1-first, the null
 * endpoint is handled gracefully (configured=false), and responses transition / close
 * alerts (closed alerts leave the active queue; the Logger keeps the record).
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useAlertQueue } from "../src/useAlertQueue";
import { makeCtx, makeAlert } from "./test-helpers";
import {
  applyVigilAlertSessionResponse,
  resetVigilAlertSessionForTests,
} from "../src/vigil-alert-session";

describe("useAlertQueue — ingestion and null handling", () => {
  it("defaults to the unconfigured endpoint with an empty queue", () => {
    const { result } = renderHook(() => useAlertQueue(makeCtx()));
    expect(result.current.configured).toBe(false);
    expect(result.current.alerts).toHaveLength(0);
  });

  it("reports configured=true when an endpoint is supplied", () => {
    const { result } = renderHook(() => useAlertQueue(makeCtx(), { endpoint: "https://sof/alerts" }));
    expect(result.current.configured).toBe(true);
  });

  it("ingest() adds the alert and emits ALERT_RECEIVED from the dispatcher (no human actor)", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useAlertQueue(makeCtx({ logSink })));

    act(() => {
      result.current.ingest(makeAlert({ alertId: "A1" }));
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(logSink).toHaveLength(1);
    expect(logSink[0].event_type).toBe("ALERT_RECEIVED");
    expect(logSink[0].actor_id).toBe("sof-alert-dispatcher");
    expect(logSink[0].actor).toBeUndefined();
    expect(logSink[0].workflow_step_id).toBe("vigil-alert-A1");
  });

  it("sorts P1 before P2 before P3 regardless of ingest order", () => {
    const { result } = renderHook(() => useAlertQueue(makeCtx()));
    act(() => {
      result.current.ingest(makeAlert({ alertId: "p3", alertLevel: "P3", timestamp: "2026-06-18T10:00:00Z" }));
      result.current.ingest(makeAlert({ alertId: "p1", alertLevel: "P1", timestamp: "2026-06-18T11:00:00Z" }));
      result.current.ingest(makeAlert({ alertId: "p2", alertLevel: "P2", timestamp: "2026-06-18T09:00:00Z" }));
    });
    expect(result.current.alerts.map((a) => a.alertId)).toEqual(["p1", "p2", "p3"]);
    expect(result.current.hasUnacknowledgedP1).toBe(true);
    expect(result.current.unacknowledgedCount).toBe(3);
  });

  it("ACKNOWLEDGED transitions status in place; closing actions remove the alert", () => {
    const { result } = renderHook(() => useAlertQueue(makeCtx()));
    act(() => {
      result.current.ingest(makeAlert({ alertId: "A1" }));
    });
    act(() => {
      result.current.applyResponse("A1", "ACKNOWLEDGED");
    });
    expect(result.current.alerts[0].status).toBe("ACKNOWLEDGED");
    expect(result.current.unacknowledgedCount).toBe(0);

    act(() => {
      result.current.applyResponse("A1", "RESOLVED");
    });
    expect(result.current.alerts).toHaveLength(0);
  });

  it("select() exposes the selected alert and closing clears the selection", () => {
    const { result } = renderHook(() => useAlertQueue(makeCtx()));
    act(() => {
      result.current.ingest(makeAlert({ alertId: "A1" }));
    });
    act(() => {
      result.current.select("A1");
    });
    expect(result.current.selected?.alertId).toBe("A1");
    act(() => {
      result.current.applyResponse("A1", "ESCALATED");
    });
    expect(result.current.selected).toBeNull();
  });
});

// D2 (Session 61, finding D3-1 HIGH) — the hook-level resurrection proof: with
// sessionStore, a responded alert does NOT come back when the hook remounts
// (the exact navigate-away-and-back sequence the Session 60 assessment flagged).
describe("useAlertQueue — sessionStore (D2, no resurrection on remount)", () => {
  beforeEach(() => resetVigilAlertSessionForTests());

  const seeds = () => [
    makeAlert({ alertId: "S1", alertLevel: "P1" }),
    makeAlert({ alertId: "S2", alertLevel: "P2" }),
  ];

  it("a RESOLVED alert stays gone across unmount/remount; ACKNOWLEDGED status persists", () => {
    const first = renderHook(() =>
      useAlertQueue(makeCtx(), { initialAlerts: seeds(), sessionStore: true })
    );
    expect(first.result.current.alerts).toHaveLength(2);

    act(() => {
      first.result.current.applyResponse("S1", "RESOLVED");
      first.result.current.applyResponse("S2", "ACKNOWLEDGED");
    });
    expect(first.result.current.alerts).toHaveLength(1);
    first.unmount(); // navigate away

    // Navigate back: a fresh mount with the SAME static seeds.
    const second = renderHook(() =>
      useAlertQueue(makeCtx(), { initialAlerts: seeds(), sessionStore: true })
    );
    expect(second.result.current.alerts).toHaveLength(1); // S1 did not resurrect
    expect(second.result.current.alerts[0].alertId).toBe("S2");
    expect(second.result.current.alerts[0].status).toBe("ACKNOWLEDGED"); // not reset
    second.unmount();
  });

  it("a store mutation from another consumer reaches an already-mounted hook (live subscription)", () => {
    const hook = renderHook(() =>
      useAlertQueue(makeCtx(), { initialAlerts: seeds(), sessionStore: true })
    );
    expect(hook.result.current.alerts).toHaveLength(2);

    act(() => {
      applyVigilAlertSessionResponse("S1", "FALSE_POSITIVE");
    });
    expect(hook.result.current.alerts).toHaveLength(1);
    hook.unmount();
  });
});
