/**
 * SOVEREIGN Platform — module-cpmi
 * gate-runner.ts — the CPMI-VRS Gate 1–4 sequence (pure, no React).
 *
 * The execution logic that sequences a product/agent through the four CPMI-VRS gates
 * (spec §5): Gate 1 (Scope, auto), Gate 2 (Transparency, auto), Gate 3 (Accuracy,
 * human-attested), Gate 4 (Monitoring, auto after first cycle). Pure functions over an
 * immutable GateRecord[] — the hook (useGateRunner) wires Logger emission; certification
 * (vrs-certification) reads the completed sequence.
 *
 * Version: 1.0 · Session 11 · June 23, 2026
 */

import type { GateRecord, VRSGateNumber } from "./cpmi-contract";

/** A fresh four-gate sequence for a product, all PENDING. */
export function createGateSequence(productId: string): GateRecord[] {
  return ([1, 2, 3, 4] as VRSGateNumber[]).map((gate) => ({
    gate,
    status: "PENDING" as const,
    product_id: productId,
    recorded_at: null,
  }));
}

/** Look up a gate record by number. */
export function getGate(records: readonly GateRecord[], gate: VRSGateNumber): GateRecord | undefined {
  return records.find((r) => r.gate === gate);
}

/**
 * Pass an AUTO gate (1, 2, or 4) at `nowIso`. Returns a new array. Gate 3 is rejected
 * here — it requires human attestation (attestGate3).
 */
export function passAutoGate(records: readonly GateRecord[], gate: 1 | 2 | 4, nowIso: string): GateRecord[] {
  return records.map((r) => (r.gate === gate ? { ...r, status: "PASSED" as const, recorded_at: nowIso } : r));
}

/** Attest Gate 3 (human) at `nowIso`, recording the attesting human. Returns a new array. */
export function attestGate3(records: readonly GateRecord[], nowIso: string, attestedBy: string): GateRecord[] {
  return records.map((r) =>
    r.gate === 3 ? { ...r, status: "ATTESTED" as const, recorded_at: nowIso, attested_by: attestedBy } : r
  );
}

/**
 * Whether all four gates are complete: Gates 1/2/4 PASSED and Gate 3 ATTESTED. This is
 * the precondition for VRS certification (spec §4.3 — no partial certifications).
 */
export function allGatesComplete(records: readonly GateRecord[]): boolean {
  const g = (n: VRSGateNumber) => getGate(records, n);
  return (
    g(1)?.status === "PASSED" &&
    g(2)?.status === "PASSED" &&
    g(3)?.status === "ATTESTED" &&
    g(4)?.status === "PASSED"
  );
}
