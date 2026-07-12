/**
 * SOVEREIGN Platform — module-apex
 * tt-audit-reporter.ts — Time & Travel workflow layer, Session 27 scaffold.
 *
 * tt.audit-reporter (Governance, deterministic — Agent Identity Standard, D-TT5).
 * Produces period-close audit exports and session-based decision logs from
 * governed records (docs/17 / AIS). Two export modes: session-based (travel
 * approval decisions) and period-based (time record flags, resolutions,
 * correction history, recurrence records — DCAA / IG / internal audit use).
 *
 * Reads and formats ONLY. It does not modify any Logger record, time record, or
 * travel request. Export is initiated by an authorized manager or administrator —
 * never automatically generated. No LLM call.
 */

import type { ComplianceFlag, CorrectionRecord, TravelRequest } from "@sovereign/data";

export const TT_AUDIT_REPORTER_AGENT_ID = "tt.audit-reporter";

/** One decided travel request, as it appears in a session-based export. */
export interface TravelDecisionLine {
  request_id: string;
  employee_id: string;
  destination: string;
  total_cost: number;
  routing_tier: string;
  assigned_authority: string;
  /** Terminal status recorded by the human decision (APPROVED / DENIED / ESCALATED). */
  outcome: string;
}

/** Session-based export — travel approval decisions (docs/17 audit-reporter design). */
export interface TravelSessionExport {
  export_type: "TRAVEL_SESSION";
  /** Caller-supplied ISO 8601 timestamp — the reporter takes no wall-clock reads. */
  generated_at: string;
  generated_by: string;
  decisions: TravelDecisionLine[];
  total_requests: number;
  outcomes: Record<string, number>;
}

/** Period-based export — time flags, resolutions, and recurrence (DCAA/IG format basis). */
export interface TimePeriodExport {
  export_type: "TIME_PERIOD";
  generated_at: string;
  generated_by: string;
  period_start: string;
  period_end: string;
  flags: ComplianceFlag[];
  corrections: CorrectionRecord[];
  open_flag_count: number;
  flags_by_severity: Record<string, number>;
  /** Employee-rule pairs at or beyond recurrence 3 (formal-escalation territory). */
  recurrence_watchlist: Array<{ employee_id: string; rule_category: string; recurrence_count: number }>;
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}

/** Assemble the session-based travel decision export from decided requests. */
export function buildTravelSessionExport(
  requests: TravelRequest[],
  generated_at: string,
  generated_by: string
): TravelSessionExport {
  const decided = requests.filter((r) =>
    r.status === "APPROVED" || r.status === "DENIED" || r.status === "ESCALATED"
  );
  const decisions: TravelDecisionLine[] = decided.map((r) => ({
    request_id: r.request_id,
    employee_id: r.employee_id,
    destination: r.destination,
    total_cost: r.total_cost,
    routing_tier: r.routing_tier ?? "UNEVALUATED",
    assigned_authority: r.assigned_authority ?? "UNASSIGNED",
    outcome: r.status,
  }));
  return {
    export_type: "TRAVEL_SESSION",
    generated_at,
    generated_by,
    decisions,
    total_requests: decisions.length,
    outcomes: countBy(decisions, (d) => d.outcome),
  };
}

/** Assemble the period-close time & expense export for audit use. */
export function buildTimePeriodExport(
  flags: ComplianceFlag[],
  corrections: CorrectionRecord[],
  period_start: string,
  period_end: string,
  generated_at: string,
  generated_by: string
): TimePeriodExport {
  return {
    export_type: "TIME_PERIOD",
    generated_at,
    generated_by,
    period_start,
    period_end,
    flags,
    corrections,
    open_flag_count: flags.filter((f) => f.status === "OPEN").length,
    flags_by_severity: countBy(flags, (f) => f.severity),
    recurrence_watchlist: flags
      .filter((f) => f.recurrence_count >= 3)
      .map((f) => ({
        employee_id: f.employee_id,
        rule_category: f.rule_category,
        recurrence_count: f.recurrence_count,
      })),
  };
}
