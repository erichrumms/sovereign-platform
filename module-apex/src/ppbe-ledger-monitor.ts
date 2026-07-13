/**
 * SOVEREIGN Platform — module-apex
 * ppbe-ledger-monitor.ts — PPBE workflow layer, Session 31 (Core Integration).
 *
 * ppbe-ledger-monitor (Monitoring, DETERMINISTIC — Agent Identity Standard, D-P5;
 * confirmed deterministic at Session 31 open against the registry, which overrides
 * docs/18 §5's self-flagged "LLM-backed" inference). No LLM call, no prompt, no
 * sovereign-api-client. Runs on APEX / Logger infrastructure.
 *
 * Analyzes obligation records and performance data against deployment-configured
 * thresholds, producing PPBE anomaly findings for the VIGIL Alert Queue with
 * structured context (docs/18 §4 PPBE_ANOMALY payload fields: anomaly_type,
 * program_id, threshold_breached, severity). OBSERVES AND ALERTS ONLY — it does
 * not modify obligation records, resolve anomalies, or authorize corrective
 * actions; every anomaly response is a human decision in VIGIL.
 *
 * Emission note: PPBE_ANOMALY is Python-only (Session 31 Project Principal
 * decision #3) — this module produces findings; the host routes them to VIGIL
 * and the Python-side emitter logs them, mirroring the tt-pattern-analyst
 * surface-only pattern.
 */

import type { ObligationRecord, ProgramRecord, EvaluationFinding } from "@sovereign/data";

export const PPBE_LEDGER_MONITOR_AGENT_ID = "ppbe-ledger-monitor";

/** The deterministic anomaly rules this agent evaluates. */
export type PPBEAnomalyType =
  | "OBLIGATION_RATE_DEVIATION"   // actual vs planned obligation for a period
  | "CEILING_PROXIMITY"           // cumulative obligations near the lifecycle estimate
  | "CEILING_EXCEEDED"            // cumulative obligations above the lifecycle estimate
  | "FEEDBACK_LOOP_STALL";        // evaluation findings not entering the planning cycle (R-P7)

export type PPBEAnomalySeverity = "P1" | "P2" | "P3";

/** One anomaly finding, structured for the VIGIL Alert Queue (docs/18 §4). */
export interface PPBEAnomalyFinding {
  anomaly_type: PPBEAnomalyType;
  program_id: string;
  /** Plain prose (Gap 5): the rule, the actual value, and the threshold breached. */
  threshold_breached: string;
  severity: PPBEAnomalySeverity;
  /** Constraint #6 — joins the finding to the audit trail. */
  workflow_step_id: string;
  /** Observation only — never a correction or a resolution (registry scope). */
  observation_only: true;
}

/** Deployment-configured thresholds — deterministic, no learned parameters. */
export interface LedgerMonitorConfig {
  /** Percent deviation from the planned obligation at which a period is anomalous. */
  obligation_deviation_percent: number;
  /** Percent of lifecycle_cost_estimate at which proximity is flagged (e.g. 90). */
  ceiling_proximity_percent: number;
  /** Fraction (0-1) of findings NOT feeding the planning cycle at which the loop is stalled. */
  feedback_stall_fraction: number;
  /** Minimum findings before the feedback-loop rule applies (avoid one-sample noise). */
  feedback_minimum_findings: number;
}

function ledgerWorkflowStep(programId: string): string {
  return `ppbe-ledger-${programId}`;
}

/** Sum of obligations recorded against one program, whole currency units. */
export function totalObligated(obligations: readonly ObligationRecord[], programId: string): number {
  return obligations
    .filter((o) => o.program_id === programId)
    .reduce((sum, o) => sum + o.amount, 0);
}

/**
 * Rule 1 — obligation rate deviation. Compares actual obligations in a period
 * against the program's obligation_plan entry for that period. A period with no
 * plan entry is not evaluated (no threshold to breach). Deterministic.
 */
export function detectObligationRateDeviation(
  program: ProgramRecord,
  actualByPeriod: Readonly<Record<string, number>>,
  config: LedgerMonitorConfig
): PPBEAnomalyFinding[] {
  const findings: PPBEAnomalyFinding[] = [];
  for (const planned of program.obligation_plan) {
    if (planned.planned_amount === 0) continue;
    const actual = actualByPeriod[planned.period] ?? 0;
    const deviation = ((actual - planned.planned_amount) / planned.planned_amount) * 100;
    if (Math.abs(deviation) >= config.obligation_deviation_percent) {
      const rounded = Math.round(Math.abs(deviation));
      const direction = deviation < 0 ? "below" : "above";
      findings.push({
        anomaly_type: "OBLIGATION_RATE_DEVIATION",
        program_id: program.program_id,
        threshold_breached: `Obligations for ${planned.period} are ${rounded} percent ${direction} plan — the configured limit is ${config.obligation_deviation_percent} percent.`,
        severity: Math.abs(deviation) >= config.obligation_deviation_percent * 2 ? "P1" : "P2",
        workflow_step_id: ledgerWorkflowStep(program.program_id),
        observation_only: true,
      });
    }
  }
  return findings;
}

/**
 * Rule 2 — lifecycle ceiling. Flags proximity at the configured percent and
 * exceedance at 100 percent of lifecycle_cost_estimate. Deterministic.
 */
export function detectCeilingBreach(
  program: ProgramRecord,
  obligations: readonly ObligationRecord[],
  config: LedgerMonitorConfig
): PPBEAnomalyFinding[] {
  if (program.lifecycle_cost_estimate === 0) return [];
  const obligated = totalObligated(obligations, program.program_id);
  const percent = (obligated / program.lifecycle_cost_estimate) * 100;
  const rounded = Math.round(percent);
  if (percent > 100) {
    return [
      {
        anomaly_type: "CEILING_EXCEEDED",
        program_id: program.program_id,
        threshold_breached: `Cumulative obligations are ${rounded} percent of the lifecycle cost estimate — the ceiling has been exceeded.`,
        severity: "P1",
        workflow_step_id: ledgerWorkflowStep(program.program_id),
        observation_only: true,
      },
    ];
  }
  if (percent >= config.ceiling_proximity_percent) {
    return [
      {
        anomaly_type: "CEILING_PROXIMITY",
        program_id: program.program_id,
        threshold_breached: `Cumulative obligations are ${rounded} percent of the lifecycle cost estimate — the configured proximity limit is ${config.ceiling_proximity_percent} percent.`,
        severity: "P2",
        workflow_step_id: ledgerWorkflowStep(program.program_id),
        observation_only: true,
      },
    ];
  }
  return [];
}

/**
 * Rule 3 — feedback-loop stall (risk R-P7: evaluation findings not entering the
 * planning cycle). The loop is measured through the feeds_planning_cycle field
 * (docs/18 §3.5), never assumed. Deterministic.
 */
export function detectFeedbackLoopStall(
  programId: string,
  findings: readonly EvaluationFinding[],
  config: LedgerMonitorConfig
): PPBEAnomalyFinding[] {
  const programFindings = findings.filter((f) => f.program_id === programId);
  if (programFindings.length < config.feedback_minimum_findings) return [];
  const stalled = programFindings.filter((f) => !f.feeds_planning_cycle).length;
  const fraction = stalled / programFindings.length;
  if (fraction < config.feedback_stall_fraction) return [];
  return [
    {
      anomaly_type: "FEEDBACK_LOOP_STALL",
      program_id: programId,
      threshold_breached: `${stalled} of ${programFindings.length} evaluation findings are not feeding the planning cycle — the configured limit is ${Math.round(config.feedback_stall_fraction * 100)} percent.`,
      severity: "P3",
      workflow_step_id: ledgerWorkflowStep(programId),
      observation_only: true,
    },
  ];
}

/**
 * The full ledger pass over one program: all three rules, one finding list,
 * ready for VIGIL routing. Deterministic — same input, same output.
 */
export function runLedgerMonitor(
  program: ProgramRecord,
  obligations: readonly ObligationRecord[],
  actualByPeriod: Readonly<Record<string, number>>,
  evaluationFindings: readonly EvaluationFinding[],
  config: LedgerMonitorConfig
): PPBEAnomalyFinding[] {
  return [
    ...detectObligationRateDeviation(program, actualByPeriod, config),
    ...detectCeilingBreach(program, obligations, config),
    ...detectFeedbackLoopStall(program.program_id, evaluationFindings, config),
  ];
}
