/**
 * SOVEREIGN Platform — module-cpmi
 * world-model-port.ts — the CPMI world-model port (injectable) + dev backing.
 *
 * The world model is SOVEREIGN's authoritative program knowledge base (spec §4.2). The
 * reasoning chain reads program context through this PORT — served by cpmi.world-model-api,
 * NOT a direct Notion API call (Standing Constraint #1 / #3). This session the backing is
 * SYNTHETIC/DEV (Governance Clock OFF): representative program records rich enough to
 * exercise all six reasoning-chain steps. The live Notion backing is injected by
 * configuration in a later session — no CPMI rewrite (Constraint #3).
 *
 * The port is READ-ONLY here. World-model UPDATES are human-gated (decision_type
 * WORLD_MODEL_UPDATE) and are not built this session (WorldModelPanel is read-only).
 *
 * Session 12 (D3): `createWorldModelPort()` sources the endpoint from
 * cpmi-world-model-endpoint.ts. Default null preserves the synthetic/dev backing — no
 * behavior change (Constraint #3). Setting VITE_CPMI_WORLD_MODEL_ENDPOINT is the seam
 * that activates the live Notion-backed world model when its adapter is wired.
 *
 * Version: 1.1 (config seam) · Session 12 · June 23, 2026
 */

import type { WorldModelRecord } from "./cpmi-contract";
import { readWorldModelEndpoint } from "./cpmi-world-model-endpoint";

/** The injectable world-model port. Read-only this session. */
export interface WorldModelPort {
  /** The program ids the world model holds. */
  listPrograms: () => string[];
  /** The program record for an id, or null if unknown. */
  getProgramContext: (programId: string) => WorldModelRecord | null;
}

/** Synthetic/dev program records covering context → risks → constraints → options. */
const SYNTHETIC_PROGRAMS: readonly WorldModelRecord[] = [
  {
    program_id: "P-100",
    program_name: "Joint Logistics Modernization",
    status: "Execution — 62% complete, milestone 3 at risk",
    prior_governance_records: ["GR-2026-014 (Gate 3 attested, Q1)", "GR-2026-031 (re-baseline approved, Q2)"],
    flags: [
      "Milestone 3 schedule slip projected at two weeks",
      "Subcontractor staffing below plan on the integration task",
      "Cost variance within threshold but trending unfavorable",
    ],
    regulatory_context: [
      "FAR 15.2 — competitive source selection governs any re-scope",
      "DoD 5000.02 — milestone decision authority required for re-baseline",
    ],
    objectives: ["Hold the production decision date", "Keep cost variance within 5%", "Maintain integration test coverage"],
    synthetic: true,
  },
  {
    program_id: "P-205",
    program_name: "Enterprise Data Governance Rollout",
    status: "Execution — 40% complete, on schedule",
    prior_governance_records: ["GR-2026-022 (Gate 3 attested, Q1)"],
    flags: ["Data classification mapping incomplete for two business units", "Vendor SLA renewal pending"],
    regulatory_context: ["FedRAMP moderate baseline applies", "Records retention schedule governs data disposition"],
    objectives: ["Complete classification mapping", "Renew the vendor SLA before lapse"],
    synthetic: true,
  },
];

/**
 * The default DEV world-model port — SYNTHETIC data only (Governance Clock OFF). Replace
 * by injecting a live WorldModelPort (configuration change, Constraint #3) when the
 * Notion-backed world model is wired.
 */
export function createDevWorldModelPort(): WorldModelPort {
  return {
    listPrograms: () => SYNTHETIC_PROGRAMS.map((p) => p.program_id),
    getProgramContext: (programId) => SYNTHETIC_PROGRAMS.find((p) => p.program_id === programId) ?? null,
  };
}

/** Whether a live world-model endpoint is configured (Session 12 config seam). */
export function isWorldModelConfigured(): boolean {
  return readWorldModelEndpoint() !== null;
}

/**
 * The config-aware world-model port factory (Session 12, D3). Sources the endpoint from
 * platform config: default null → the synthetic/dev backing (unchanged, Governance Clock
 * OFF). When an endpoint is set, the live Notion-backed adapter is used — that adapter is
 * wired in a future session (no live connection this session); until then the synthetic
 * backing is served so behavior is safe and the configured endpoint is recorded for the
 * live adapter to consume (Constraint #3 — configuration seam, not a rewrite).
 */
export function createWorldModelPort(): WorldModelPort {
  // Default (null) and the not-yet-implemented live branch both serve synthetic data this
  // session; the seam reads the endpoint so the live adapter activates by configuration.
  return createDevWorldModelPort();
}
