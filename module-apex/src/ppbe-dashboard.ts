/**
 * SOVEREIGN Platform — module-apex
 * ppbe-dashboard.ts — the PPBE performance dashboard computations (pure, no
 * React). Session 32, D5 — docs/18 §7.2 APEX scope: obligation rate,
 * budget-to-actual variance, dependency health index, learning velocity.
 *
 * Replaces the Session 17 Execution Monitoring stub (spec §17.2 Commitment 1
 * said exactly this would happen: live obligation-rate / budget-to-actual
 * content lands on the existing tab; no surrounding navigation changes).
 *
 * Everything here is deterministic arithmetic over governed records — no LLM,
 * no Logger call. The dashboard also renders activity counts across the FOUR
 * PPBE Logger event types (docs/18 §4; §7.2's done condition says "six", which
 * is a spec error against the four types that exist — Session 32 handoff logs
 * the discrepancy). Those counts are derived by the host from the Python-side
 * audit log (the four PPBE event types are Python-only, Session 31 decision
 * #3) and supplied as input — this module never reads the log itself.
 *
 * DATA VOLUME NOTE (Session 32): comprehensive PPBE synthetic data is Session
 * 33's dedicated scope. These computations are unit-tested against fixtures;
 * the dashboard renders honest empty states until that data exists.
 *
 * Version: 1.0 · Session 32 · July 13, 2026
 */

import type {
  DependencyMap,
  EvaluationFinding,
  ObligationRecord,
  ProgramRecord,
} from "@sovereign/data";

import type { ProgramStatusSurface } from "../../sovereign-shell/shell-contract";

// ============================================================
// PPBE EVENT ACTIVITY (the four Python-only event types, docs/18 §4)
// ============================================================

export const PPBE_EVENT_TYPES = [
  "PPBE_DECISION",
  "PPBE_PHASE_TRANSITION",
  "PPBE_ANOMALY",
  "PPBE_EVALUATION_FINDING",
] as const;

export type PPBEEventType = (typeof PPBE_EVENT_TYPES)[number];

/** Host-derived counts from the Python-side audit log — one per event type. */
export type PPBEEventCounts = Record<PPBEEventType, number>;

export const EMPTY_PPBE_EVENT_COUNTS: PPBEEventCounts = {
  PPBE_DECISION: 0,
  PPBE_PHASE_TRANSITION: 0,
  PPBE_ANOMALY: 0,
  PPBE_EVALUATION_FINDING: 0,
};

// ============================================================
// METRIC 1 — OBLIGATION RATE
// ============================================================

export interface ObligationRateMetric {
  program_id: string;
  planned_total: number;
  obligated_total: number;
  /** Rounded percent; null when nothing is planned (a rate over zero is not a rate). */
  rate_percent: number | null;
  /** Plain prose (Gap 5). */
  narrative: string;
}

export function obligationRate(
  program: ProgramRecord,
  obligations: readonly ObligationRecord[]
): ObligationRateMetric {
  const planned = program.obligation_plan.reduce((sum, e) => sum + e.planned_amount, 0);
  const obligated = obligations
    .filter((o) => o.program_id === program.program_id)
    .reduce((sum, o) => sum + o.amount, 0);
  const rate = planned > 0 ? Math.round((obligated / planned) * 100) : null;
  return {
    program_id: program.program_id,
    planned_total: planned,
    obligated_total: obligated,
    rate_percent: rate,
    narrative:
      rate === null
        ? `${program.name} has no planned obligations recorded — an obligation rate cannot be computed.`
        : `${program.name} has obligated ${obligated} of ${planned} planned — ${rate} percent.`,
  };
}

// ============================================================
// METRIC 2 — BUDGET-TO-ACTUAL VARIANCE
// ============================================================

export interface PeriodVariance {
  program_id: string;
  period: string;
  planned_amount: number;
  actual_amount: number;
  /** actual − planned, whole currency units. */
  variance: number;
  /** Plain prose with direction (Gap 5). */
  narrative: string;
}

export function budgetToActualVariance(
  program: ProgramRecord,
  actualByPeriod: Readonly<Record<string, number>>
): PeriodVariance[] {
  return program.obligation_plan.map((entry) => {
    const actual = actualByPeriod[entry.period] ?? 0;
    const variance = actual - entry.planned_amount;
    const status = variance === 0 ? "on-plan" : variance > 0 ? "over-executing" : "under-executing";
    const direction = variance === 0 ? "on plan" : variance > 0 ? "above plan" : "below plan";
    return {
      program_id: program.program_id,
      period: entry.period,
      planned_amount: entry.planned_amount,
      actual_amount: actual,
      variance,
      narrative:
        variance === 0
          ? `${program.name} (${entry.period}) is ${status}: actuals are on plan at ${actual}.`
          : `${program.name} (${entry.period}) is ${status}: actuals of ${actual} are ${Math.abs(variance)} ${direction} (planned ${entry.planned_amount}).`,
    };
  });
}

// ============================================================
// METRIC 3 — DEPENDENCY HEALTH INDEX
// ============================================================

export interface DependencyHealthIndex {
  healthy: number;
  at_risk: number;
  failed: number;
  /** Rounded percent healthy; null when no dependencies are registered. */
  index_percent: number | null;
  /** Plain prose (Gap 5). */
  narrative: string;
}

export function dependencyHealthIndex(dependencies: readonly DependencyMap[]): DependencyHealthIndex {
  const healthy = dependencies.filter((d) => d.health_status === "healthy").length;
  const atRisk = dependencies.filter((d) => d.health_status === "at-risk").length;
  const failed = dependencies.filter((d) => d.health_status === "failed").length;
  const index = dependencies.length > 0 ? Math.round((healthy / dependencies.length) * 100) : null;
  return {
    healthy,
    at_risk: atRisk,
    failed,
    index_percent: index,
    narrative:
      index === null
        ? "No inter-workflow dependencies are registered — there is no handoff health to index."
        : `${healthy} of ${dependencies.length} registered dependencies are healthy (${index} percent); ` +
          `${atRisk} at risk, ${failed} failed.`,
  };
}

// ============================================================
// METRIC 4 — LEARNING VELOCITY (R-P7 measured, never assumed)
// ============================================================

export interface LearningVelocityMetric {
  total_findings: number;
  feeding_planning_cycle: number;
  /** Rounded percent; null when no findings exist. */
  velocity_percent: number | null;
  /** Plain prose (Gap 5) — absence of findings is a fact, not health. */
  narrative: string;
}

export function learningVelocity(findings: readonly EvaluationFinding[]): LearningVelocityMetric {
  const feeding = findings.filter((f) => f.feeds_planning_cycle).length;
  const velocity = findings.length > 0 ? Math.round((feeding / findings.length) * 100) : null;
  return {
    total_findings: findings.length,
    feeding_planning_cycle: feeding,
    velocity_percent: velocity,
    narrative:
      velocity === null
        ? "No evaluation findings are recorded. That absence is reported as a fact — it is not evidence " +
          "that the feedback loop is working."
        : `${feeding} of ${findings.length} evaluation findings are feeding the planning cycle ` +
          `(${velocity} percent). Findings that never re-enter planning are the R-P7 failure mode.`,
  };
}

// ============================================================
// THE FULL DASHBOARD
// ============================================================

export interface PPBEDashboardInputs {
  programs: ProgramRecord[];
  obligations: ObligationRecord[];
  /** Actual obligations by plan period, per program (host-assembled). */
  actualsByProgram: Readonly<Record<string, Readonly<Record<string, number>>>>;
  dependencies: DependencyMap[];
  findings: EvaluationFinding[];
  /** Host-derived from the Python-side audit log; EMPTY_PPBE_EVENT_COUNTS when unread. */
  eventCounts: PPBEEventCounts;
}

export interface PPBEDashboardData {
  obligation_rates: ObligationRateMetric[];
  variances: PeriodVariance[];
  dependency_health: DependencyHealthIndex;
  learning_velocity: LearningVelocityMetric;
  event_counts: PPBEEventCounts;
  /** True when there is nothing to show yet — the UI renders an honest empty state. */
  is_empty: boolean;
}

export function buildPPBEDashboard(inputs: PPBEDashboardInputs): PPBEDashboardData {
  const sorted = [...inputs.programs].sort((a, b) => a.program_id.localeCompare(b.program_id));
  return {
    obligation_rates: sorted.map((p) => obligationRate(p, inputs.obligations)),
    variances: sorted.flatMap((p) => budgetToActualVariance(p, inputs.actualsByProgram[p.program_id] ?? {})),
    dependency_health: dependencyHealthIndex(inputs.dependencies),
    learning_velocity: learningVelocity(inputs.findings),
    event_counts: inputs.eventCounts,
    is_empty:
      inputs.programs.length === 0 &&
      inputs.obligations.length === 0 &&
      inputs.dependencies.length === 0 &&
      inputs.findings.length === 0,
  };
}

// ============================================================
// PROGRAM STATUS SURFACE PUBLISHER (GD-23)
// ============================================================

/**
 * Derive a ProgramStatusSnapshot status field from an obligation rate.
 *
 * Threshold rule (Build Agent judgment, Session 44 D2):
 *   ≥ 80 %  → on_track  (program is obligating close to plan)
 *   ≥ 50 %  → at_risk   (noticeable shortfall but not critical)
 *   < 50 % or null → off_track  (major under-obligation or no plan at all)
 *
 * "off_track" for null follows the same honest-empty-state principle as the
 * narrative: a rate that cannot be computed is not healthy by default.
 */
export function statusFromObligationRate(
  rate: number | null
): "on_track" | "at_risk" | "off_track" {
  if (rate === null || rate < 50) return "off_track";
  if (rate < 80) return "at_risk";
  return "on_track";
}

/**
 * Publish one ProgramStatusSnapshot per program to the shared surface (GD-23).
 * Reads `percent_obligated` and `narrative` from the deterministic
 * `obligationRate()` function — one computation, no second summarization path
 * (docs/20 §2). `nowIso` is supplied by the caller so this function stays pure.
 */
export function publishProgramStatuses(
  inputs: PPBEDashboardInputs,
  surface: ProgramStatusSurface,
  nowIso: string
): void {
  for (const program of inputs.programs) {
    const metric = obligationRate(program, inputs.obligations);
    surface.publish({
      program_id: metric.program_id,
      percent_obligated: metric.rate_percent ?? 0,
      status: statusFromObligationRate(metric.rate_percent),
      narrative: metric.narrative,
      updated_at: nowIso,
    });
  }
}
