/** @jest-environment jsdom */
/**
 * module-cpmi — useGateRunner.test.tsx
 * Auto gates emit CPMI_VRS_GATE_1/2/4_PASSED as governance records (no decision_type);
 * Gate 3 emits CPMI_VRS_GATE_3_ATTESTED as a HUMAN decision (decision_type
 * GATE_3_ATTESTATION, actor "human"). Note ≥10 required; certificate issues after all
 * four; Gate 2 fail-closed blocks a gate on emit failure.
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useGateRunner } from "../src/useGateRunner";
import { makeCtx } from "./test-helpers";

const NOTE = "Attested: known-answer benchmark and schema validation passed.";

describe("useGateRunner", () => {
  it("auto gates emit *_PASSED records; Gate 3 emits an attested human decision; certifies after all four", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useGateRunner(makeCtx({ logSink }), "CPMI"));

    act(() => result.current.passGate1());
    act(() => result.current.passGate2());
    act(() => { result.current.attestGate3(NOTE); });
    act(() => result.current.passGate4());

    const g1 = logSink.find((e) => e.event_type === "CPMI_VRS_GATE_1_PASSED")!;
    expect(g1.actor_id).toBe("cpmi.vrs-certification");
    expect(g1.actor).toBeUndefined();
    expect(g1.decision_type).toBeUndefined();
    expect(g1.workflow_step_id).toBe("cpmi-vrs-CPMI");

    const g3 = logSink.find((e) => e.event_type === "CPMI_VRS_GATE_3_ATTESTED")!;
    expect(g3.actor).toBe("human");
    expect(g3.actor_name).toBe("Dana Governance");
    expect(g3.decision_type).toBe("GATE_3_ATTESTATION");
    expect((g3.payload as { attestation_note: string }).attestation_note).toBe(NOTE);

    expect(result.current.certificate.certified).toBe(true);
    expect(result.current.certificate.issued_by).toBe("cpmi.vrs-certification");
  });

  it("rejects a Gate 3 attestation note shorter than 10 chars without emitting", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useGateRunner(makeCtx({ logSink }), "CPMI"));
    let ok = true;
    act(() => { ok = result.current.attestGate3("short"); });
    expect(ok).toBe(false);
    expect(result.current.error).toMatch(/at least 10 characters/);
    expect(logSink.filter((e) => e.event_type === "CPMI_VRS_GATE_3_ATTESTED")).toHaveLength(0);
  });

  it("fails closed when a gate Logger emit throws (Gate 2)", () => {
    const { result } = renderHook(() => useGateRunner(makeCtx({ throwOnLog: true }), "CPMI"));
    act(() => result.current.passGate1());
    expect(result.current.error).toMatch(/Logger emit failed/);
    // Gate not advanced — still pending.
    expect(result.current.records.find((r) => r.gate === 1)!.status).toBe("PENDING");
  });
});
