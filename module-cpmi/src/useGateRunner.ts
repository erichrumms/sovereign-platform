/**
 * SOVEREIGN Platform — module-cpmi
 * useGateRunner.ts — the CPMI-VRS gate runner hook.
 *
 * Drives a product through the four CPMI-VRS gates and emits the GD-7 gate Logger events.
 * Gates 1/2/4 auto-record (CPMI_VRS_GATE_1/2/4_PASSED — governance records attributed to
 * cpmi.vrs-certification, no decision_type). Gate 3 is HUMAN-attested
 * (CPMI_VRS_GATE_3_ATTESTED, decision_type GATE_3_ATTESTATION, actor "human" — Standing
 * Constraint #4). The VRS certificate is recomputed after each gate and is issued only
 * when all four are complete (vrs-certification — no partial certifications).
 *
 * CPMI-VRS Gate 2 (fail-closed): a failed Logger emit BLOCKS the gate transition — an
 * unlogged gate pass is an ungoverned gate pass. Every event carries workflow_step_id
 * `cpmi-vrs-<productId>` (Constraint #6).
 *
 * Version: 1.0 · Session 11 · June 23, 2026
 */

import { useCallback, useMemo, useState } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  eventTypeForGate,
  gateWorkflowStep,
  type GateRecord,
  type VRSCertificate,
} from "./cpmi-contract";
import { createGateSequence, passAutoGate, attestGate3 } from "./gate-runner";
import { issueCertificate } from "./vrs-certification";

const CPMI_VRS_CERTIFICATION = "cpmi.vrs-certification";
const GATE_3_DECISION_TYPE = "GATE_3_ATTESTATION" as const;

export interface UseGateRunner {
  records: GateRecord[];
  certificate: VRSCertificate;
  error: string | null;
  /** Auto-record Gate 1 (Scope) / Gate 2 (Transparency). */
  passGate1: () => void;
  passGate2: () => void;
  /** Human attestation of Gate 3 (Accuracy) — requires a ≥10-char attestation note. */
  attestGate3: (note: string) => boolean;
  /** Auto-record Gate 4 (Monitoring) after the first cycle. */
  passGate4: () => void;
  clearError: () => void;
}

export function useGateRunner(ctx: SovereignShellContext, productId: string): UseGateRunner {
  const operatorId = ctx.auth.user.employee_id;
  const [records, setRecords] = useState<GateRecord[]>(() => createGateSequence(productId));
  const [error, setError] = useState<string | null>(null);

  const workflowStep = gateWorkflowStep(productId);

  const passAuto = useCallback(
    (gate: 1 | 2 | 4): void => {
      setError(null);
      const nowIso = new Date().toISOString();

      // --- Gate 2 fail-closed: emit first; a failed emit blocks the transition. ---
      try {
        ctx.logger.log({
          event_type: eventTypeForGate(gate),
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "CPMI",
          actor_id: CPMI_VRS_CERTIFICATION,
          agent_id: CPMI_VRS_CERTIFICATION,
          outcome: `cpmi_vrs_gate_${gate}_passed`,
          payload: { product_id: productId, gate },
        });
      } catch (err) {
        setError(gateEmitError(gate, err));
        return;
      }
      setRecords((prev) => passAutoGate(prev, gate, nowIso));
    },
    [ctx, productId, workflowStep]
  );

  const passGate1 = useCallback(() => passAuto(1), [passAuto]);
  const passGate2 = useCallback(() => passAuto(2), [passAuto]);
  const passGate4 = useCallback(() => passAuto(4), [passAuto]);

  const doAttestGate3 = useCallback(
    (note: string): boolean => {
      setError(null);
      if (note.trim().length < 10) {
        setError("Gate 3 attestation requires a note of at least 10 characters.");
        return false;
      }
      const nowIso = new Date().toISOString();

      // --- Gate 2 fail-closed: emit the human attestation first. ---
      try {
        ctx.logger.log({
          event_type: eventTypeForGate(3),
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "CPMI",
          actor_id: operatorId,
          outcome: "cpmi_vrs_gate_3_attested",
          actor: "human",
          actor_name: ctx.auth.user.name,
          decision_type: GATE_3_DECISION_TYPE,
          payload: { product_id: productId, gate: 3, attestation_note: note.trim() },
        });
      } catch (err) {
        setError(gateEmitError(3, err));
        return false;
      }
      setRecords((prev) => attestGate3(prev, nowIso, ctx.auth.user.name));
      return true;
    },
    [ctx, operatorId, productId, workflowStep]
  );

  const clearError = useCallback((): void => setError(null), []);

  const certificate = useMemo(
    () => issueCertificate(productId, records, new Date().toISOString()),
    [productId, records]
  );

  return {
    records,
    certificate,
    error,
    passGate1,
    passGate2,
    attestGate3: doAttestGate3,
    passGate4,
    clearError,
  };
}

function gateEmitError(gate: number, err: unknown): string {
  return `Gate ${gate} Logger emit failed — gate not recorded (CPMI-VRS Gate 2): ${
    err instanceof Error ? err.message : String(err)
  }`;
}
