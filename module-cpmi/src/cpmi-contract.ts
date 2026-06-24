/**
 * SOVEREIGN Platform — module-cpmi
 * cpmi-contract.ts — the CPMI module contract (PR-CPMI-001 + CPMI-VRS gates).
 *
 * Owns the shapes the reasoning engine, world-model port, gate runner, certification,
 * and panels share: the reasoning-chain input, the six-step definitions, the CPMI-VRS
 * gate sequence, and the VRS certificate. The OUTPUT shape — ReasoningChainOutput — is
 * CANONICAL and lives in @sovereign/data (Standing Constraint #2: not redefined here);
 * it is re-exported for module-local convenience.
 *
 * Version: 1.0 · Session 11 · June 23, 2026
 */

import {
  validateReasoningChainOutput,
  type ReasoningChainOutput,
} from "@sovereign/data";

import type { SovereignEventType } from "../../sovereign-shell/shell-contract";

// Canonical output type + validator — re-exported, never redefined.
export { validateReasoningChainOutput };
export type { ReasoningChainOutput };

/** PR-CPMI-001 registry binding — stamped onto Logger events as prompt provenance. */
export const PR_CPMI_001 = {
  registryId: "PR-CPMI-001",
  file: "prompts/reasoning-chain-v1.0.md",
  promptVersion: "v1.0",
} as const;

/**
 * CPMI enhanced-monitoring anomaly threshold factor (spec §6.1) — an ARCHITECTURAL
 * CONSTANT. CPMI evaluates every reasoning-chain output at 0.7× the standard anomaly
 * threshold. Changing this is a governance decision, not a code edit.
 */
export const CPMI_ANOMALY_THRESHOLD_FACTOR = 0.7;

// ============================================================
// WORLD MODEL + REASONING CHAIN INPUT
// ============================================================

/**
 * A world-model program record — the authoritative program knowledge the reasoning
 * chain reasons over (served by cpmi.world-model-api via the WorldModelPort). Synthetic/
 * dev this session. `[key: string]` allows the synthetic backing to carry extra fields
 * the model may use without the contract enumerating every one.
 */
export interface WorldModelRecord {
  program_id: string;
  program_name: string;
  status: string;
  prior_governance_records: string[];
  flags: string[];
  regulatory_context: string[];
  objectives: string[];
  [key: string]: unknown;
}

/** The input to one reasoning-chain execution. */
export interface ReasoningChainInput {
  program_id: string;
  /** The world-model record assembled for this program. */
  worldModel: WorldModelRecord;
}

// ============================================================
// THE SIX-STEP CHAIN (spec §3)
// ============================================================

export interface ReasoningStep {
  step: number;
  name: string;
  description: string;
}

export const REASONING_STEPS: readonly ReasoningStep[] = [
  { step: 1, name: "Context Assembly", description: "Assemble program context with a confidence score." },
  { step: 2, name: "Risk Identification", description: "Identify material risks with severity and type." },
  { step: 3, name: "Constraint Mapping", description: "Map constraints — permit / prohibit / require approval (Gate 1 auto-record)." },
  { step: 4, name: "Option Generation", description: "Generate governance options with tradeoff analysis." },
  { step: 5, name: "Recommendation Formation", description: "Rank options and form a recommendation (Gate 2 auto-record)." },
  { step: 6, name: "Output Schema Validation", description: "Validate the output schema before it is surfaced (Gate 3 attestation required)." },
] as const;

/** Per-program reasoning workflow_step_id (Standing Constraint #6). */
export function reasoningWorkflowStep(programId: string): string {
  return `cpmi-reasoning-${programId}`;
}

/**
 * Whether a reasoning-chain output may be surfaced downstream: it must validate against
 * the canonical schema AND the agent must assert schema_valid === true (spec §3 / §8
 * STEP 6 — a schema_valid:false output never reaches downstream products).
 */
export function hasSurfaceableOutput(output: ReasoningChainOutput): boolean {
  return validateReasoningChainOutput(output).valid && output.schema_valid === true;
}

// ============================================================
// CPMI-VRS GATE SEQUENCE (spec §5)
// ============================================================

export type VRSGateNumber = 1 | 2 | 3 | 4;
export type GateStatus = "PENDING" | "PASSED" | "ATTESTED";

export interface GateRecord {
  gate: VRSGateNumber;
  status: GateStatus;
  product_id: string;
  /** ISO timestamp when recorded, or null while pending. */
  recorded_at: string | null;
  /** Gate 3 only — the attesting human (Project Principal). */
  attested_by?: string;
}

/** Map a gate to its GD-7 Logger event type (spec §5 / §6.2). */
export function eventTypeForGate(gate: VRSGateNumber): SovereignEventType {
  switch (gate) {
    case 1:
      return "CPMI_VRS_GATE_1_PASSED";
    case 2:
      return "CPMI_VRS_GATE_2_PASSED";
    case 3:
      return "CPMI_VRS_GATE_3_ATTESTED";
    case 4:
      return "CPMI_VRS_GATE_4_PASSED";
  }
}

/** Per-product gate-runner workflow_step_id. */
export function gateWorkflowStep(productId: string): string {
  return `cpmi-vrs-${productId}`;
}

// ============================================================
// VRS CERTIFICATE (spec §4.3)
// ============================================================

export interface VRSCertificate {
  product_id: string;
  /** True only when all four gates have passed (Gate 3 with human attestation). */
  certified: boolean;
  gates: GateRecord[];
  /** The issuing agent — cpmi.vrs-certification. Never self-certifies (all gates required). */
  issued_by: string;
  /** ISO timestamp, or null when not certified. */
  issued_at: string | null;
}
