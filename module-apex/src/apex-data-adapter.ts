/**
 * SOVEREIGN Platform — module-apex
 * apex-data-adapter.ts — the extensible data-access seam for APEX (spec §17.2 Commitment 2).
 *
 * Every APEX screen and agent reads program data through this interface, never a concrete
 * source directly. The initial implementation projects the CPMI World Model (read-only —
 * APEX never writes upstream) plus the Logger-derived reasoning history, governance
 * decisions, and AgentOS task records. When PPBE Phase II lands (~Session 22), the adapter
 * is EXTENDED to also query ObligationRecord / EvaluationFinding / StrategicObjective
 * without modifying the screens — they call the same interface and receive enriched objects.
 *
 * Live wiring (later, by configuration — Constraint #3, no rewrite): the synthetic backing
 * is replaced with calls to cpmi.world-model-api and Logger event queries. The result shapes
 * are identical, so the live adapter maps directly.
 *
 * Version: 1.0 · Session 17 · June 25, 2026
 */

import type {
  ApexProgramRecord,
  ReasoningChainSummary,
  GovernanceDecisionRecord,
  AgentTaskRecord,
} from "./apex-contract";
import {
  SYNTHETIC_PROGRAMS,
  SYNTHETIC_REASONING_HISTORY,
  SYNTHETIC_GOVERNANCE_DECISIONS,
  SYNTHETIC_TASK_HISTORY,
} from "./synthetic-world-model";

/**
 * The APEX data-access contract. Open for extension: PPBE adds new query methods here without
 * changing existing ones, so screens built against this interface keep working unchanged.
 */
export interface ApexDataAdapter {
  /** All programs in the portfolio (World Model projection). */
  listPrograms: () => ApexProgramRecord[];
  /** One program's full record, or null if the id is unknown. */
  getProgram: (programId: string) => ApexProgramRecord | null;
  /** Reasoning-chain history for a program, chronological (DC-2). */
  getReasoningChainHistory: (programId: string) => ReasoningChainSummary[];
  /** Human governance decisions logged against a program (DC-2). */
  getGovernanceDecisions: (programId: string) => GovernanceDecisionRecord[];
  /** AgentOS task records for a program (DC-2). */
  getTaskHistory: (programId: string) => AgentTaskRecord[];
}

/**
 * The synthetic/dev backing. Reads the in-module synthetic World Model projection. Returns
 * defensive copies so a screen can never mutate the underlying record (APEX is read-only).
 */
export function createSyntheticApexDataAdapter(): ApexDataAdapter {
  const byId = new Map(SYNTHETIC_PROGRAMS.map((p) => [p.program_id, p]));
  const sortByDateAsc = <T extends { recorded_at?: string; decided_at?: string }>(rows: T[]): T[] =>
    [...rows].sort((a, b) => String(a.recorded_at ?? a.decided_at).localeCompare(String(b.recorded_at ?? b.decided_at)));

  return {
    listPrograms: () => SYNTHETIC_PROGRAMS.map((p) => ({ ...p })),
    getProgram: (programId) => {
      const found = byId.get(programId);
      return found ? { ...found } : null;
    },
    getReasoningChainHistory: (programId) => sortByDateAsc(SYNTHETIC_REASONING_HISTORY[programId] ?? []),
    getGovernanceDecisions: (programId) => sortByDateAsc(SYNTHETIC_GOVERNANCE_DECISIONS[programId] ?? []),
    getTaskHistory: (programId) => [...(SYNTHETIC_TASK_HISTORY[programId] ?? [])],
  };
}
