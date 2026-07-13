/**
 * SOVEREIGN Platform — module-flowpath
 * ppbe-dependency-tracker.ts — PPBE workflow layer, Session 31 (Core Integration).
 *
 * ppbe-dependency-tracker (Monitoring, DETERMINISTIC — Agent Identity Standard,
 * D-P5; confirmed deterministic at Session 31 open against the registry, which
 * overrides docs/18 §5's self-flagged "LLM-backed" inference). No LLM call, no
 * prompt, no sovereign-api-client. Runs on NEXUS / FLOWPATH infrastructure.
 *
 * Tracks inter-workflow dependencies and handoff health across the six PPBE
 * phases. READS DependencyMap entities and handoff observations — never modifies
 * workflow artifacts, DependencyMap entities, or any FLOWPATH data. Flags timing
 * violations and quality-threshold failures BEFORE they cascade downstream,
 * producing PPBE anomaly findings for the VIGIL Alert Queue (docs/18 §4 payload
 * fields) and a readiness contribution for each Tier B phase handoff.
 *
 * Emission note: PPBE_ANOMALY is Python-only (Session 31 Project Principal
 * decision #3) — this module produces findings; the host routes them to VIGIL
 * and the Python-side emitter logs them (tt-escalation-monitor pattern:
 * track and route, never act or communicate).
 */

import type { DependencyMap } from "@sovereign/data";

export const PPBE_DEPENDENCY_TRACKER_AGENT_ID = "ppbe-dependency-tracker";

/** The deterministic dependency rules this agent evaluates. */
export type DependencyAnomalyType =
  | "DEPENDENCY_HEALTH_FAILURE"    // a dependency marked failed
  | "DEPENDENCY_AT_RISK"           // a dependency marked at-risk
  | "TIMING_VIOLATION"             // a handoff delivered late or overdue
  | "QUALITY_THRESHOLD_FAILURE";   // a handoff that failed its quality check

export type DependencySeverity = "P1" | "P2" | "P3";

/** One dependency finding, structured for the VIGIL Alert Queue (docs/18 §4). */
export interface DependencyAnomalyFinding {
  anomaly_type: DependencyAnomalyType;
  dependency_id: string;
  source_workflow: string;
  target_workflow: string;
  /** Plain prose (Gap 5): the rule, the observation, and the standard breached. */
  threshold_breached: string;
  severity: DependencySeverity;
  /** Constraint #6 — joins the finding to the audit trail. */
  workflow_step_id: string;
  /** Tracks and routes only — never acts, never communicates (registry scope). */
  observation_only: true;
}

/**
 * One observed handoff against a dependency. Observations are read-only inputs
 * supplied by the host — the tracker never writes them.
 */
export interface HandoffObservation {
  dependency_id: string;
  /** ISO 8601 — when the handoff was due. */
  due_by: string;
  /** Whether the handoff has been delivered at evaluation time. */
  delivered: boolean;
  /** ISO 8601 — present when delivered. */
  delivered_at?: string;
  /** Whether the delivered handoff met the dependency's handoff_standard. */
  quality_check_passed?: boolean;
}

function dependencyWorkflowStep(dependencyId: string): string {
  return `ppbe-dependency-${dependencyId}`;
}

/**
 * Rule 1 — health status. A failed dependency is a P1 finding; an at-risk
 * dependency is a P2 early warning (flagged before it cascades). Deterministic.
 */
export function detectHealthFailures(
  dependencies: readonly DependencyMap[]
): DependencyAnomalyFinding[] {
  const findings: DependencyAnomalyFinding[] = [];
  for (const dep of dependencies) {
    if (dep.health_status === "healthy") continue;
    const failed = dep.health_status === "failed";
    findings.push({
      anomaly_type: failed ? "DEPENDENCY_HEALTH_FAILURE" : "DEPENDENCY_AT_RISK",
      dependency_id: dep.dependency_id,
      source_workflow: dep.source_workflow,
      target_workflow: dep.target_workflow,
      threshold_breached: failed
        ? `The handoff from ${dep.source_workflow} to ${dep.target_workflow} is marked failed — the standard is: ${dep.handoff_standard}`
        : `The handoff from ${dep.source_workflow} to ${dep.target_workflow} is at risk — the standard is: ${dep.handoff_standard}`,
      severity: failed ? "P1" : "P2",
      workflow_step_id: dependencyWorkflowStep(dep.dependency_id),
      observation_only: true,
    });
  }
  return findings;
}

/**
 * Rule 2 — timing violations. An undelivered handoff past its due time, or a
 * delivery after the due time, breaches the dependency's timing requirement.
 * `asOfIso` is supplied by the host — the tracker holds no clock. Deterministic.
 */
export function detectTimingViolations(
  dependencies: readonly DependencyMap[],
  observations: readonly HandoffObservation[],
  asOfIso: string
): DependencyAnomalyFinding[] {
  const byId = new Map(dependencies.map((d) => [d.dependency_id, d]));
  const findings: DependencyAnomalyFinding[] = [];
  for (const obs of observations) {
    const dep = byId.get(obs.dependency_id);
    if (!dep) continue;
    const overdueUndelivered = !obs.delivered && asOfIso > obs.due_by;
    const deliveredLate =
      obs.delivered && typeof obs.delivered_at === "string" && obs.delivered_at > obs.due_by;
    if (!overdueUndelivered && !deliveredLate) continue;
    findings.push({
      anomaly_type: "TIMING_VIOLATION",
      dependency_id: dep.dependency_id,
      source_workflow: dep.source_workflow,
      target_workflow: dep.target_workflow,
      threshold_breached: overdueUndelivered
        ? `The handoff from ${dep.source_workflow} to ${dep.target_workflow} is overdue and undelivered — the timing requirement is: ${dep.timing_requirement}`
        : `The handoff from ${dep.source_workflow} to ${dep.target_workflow} was delivered after its due time — the timing requirement is: ${dep.timing_requirement}`,
      severity: overdueUndelivered ? "P1" : "P2",
      workflow_step_id: dependencyWorkflowStep(dep.dependency_id),
      observation_only: true,
    });
  }
  return findings;
}

/**
 * Rule 3 — quality-threshold failures. A delivered handoff that failed its
 * quality check breaches the dependency's handoff standard. Deterministic.
 */
export function detectQualityFailures(
  dependencies: readonly DependencyMap[],
  observations: readonly HandoffObservation[]
): DependencyAnomalyFinding[] {
  const byId = new Map(dependencies.map((d) => [d.dependency_id, d]));
  const findings: DependencyAnomalyFinding[] = [];
  for (const obs of observations) {
    const dep = byId.get(obs.dependency_id);
    if (!dep || !obs.delivered || obs.quality_check_passed !== false) continue;
    findings.push({
      anomaly_type: "QUALITY_THRESHOLD_FAILURE",
      dependency_id: dep.dependency_id,
      source_workflow: dep.source_workflow,
      target_workflow: dep.target_workflow,
      threshold_breached: `The handoff from ${dep.source_workflow} to ${dep.target_workflow} failed its quality check — the standard is: ${dep.handoff_standard}`,
      severity: "P2",
      workflow_step_id: dependencyWorkflowStep(dep.dependency_id),
      observation_only: true,
    });
  }
  return findings;
}

/**
 * The full tracking pass: all three rules over the dependency set. Deterministic —
 * same input, same output.
 */
export function runDependencyTracker(
  dependencies: readonly DependencyMap[],
  observations: readonly HandoffObservation[],
  asOfIso: string
): DependencyAnomalyFinding[] {
  return [
    ...detectHealthFailures(dependencies),
    ...detectTimingViolations(dependencies, observations, asOfIso),
    ...detectQualityFailures(dependencies, observations),
  ];
}

/** The tracker's contribution to a Tier B phase handoff (registry: readiness check). */
export interface DependencyReadiness {
  ready: boolean;
  /** Plain prose (Gap 5) — feeds the VIGIL gate's integration_readiness_check. */
  summary: string;
  blocking_dependency_ids: string[];
}

/**
 * Readiness of every dependency whose source workflow belongs to the closing
 * phase: ready only when none are failed, at risk, late, or quality-failed.
 */
export function assessPhaseReadiness(
  dependencies: readonly DependencyMap[],
  observations: readonly HandoffObservation[],
  asOfIso: string,
  sourceWorkflowPrefix: string
): DependencyReadiness {
  const inPhase = dependencies.filter((d) => d.source_workflow.startsWith(sourceWorkflowPrefix));
  const findings = runDependencyTracker(inPhase, observations, asOfIso);
  const blocking = [...new Set(findings.map((f) => f.dependency_id))];
  if (inPhase.length === 0) {
    return {
      ready: true,
      summary: "No registered dependencies originate from this phase.",
      blocking_dependency_ids: [],
    };
  }
  return blocking.length === 0
    ? {
        ready: true,
        summary: `All ${inPhase.length} dependencies originating from this phase are healthy, on time, and within their handoff standards.`,
        blocking_dependency_ids: [],
      }
    : {
        ready: false,
        summary: `${blocking.length} of ${inPhase.length} dependencies originating from this phase have open findings and require human review before handoff.`,
        blocking_dependency_ids: blocking,
      };
}
