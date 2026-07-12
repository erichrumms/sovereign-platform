/**
 * SOVEREIGN Platform — module-apex
 * tt-pattern-analyst.ts — Time & Travel workflow layer, Session 27 scaffold.
 *
 * tt.pattern-analyst (Monitoring, deterministic — Agent Identity Standard, D-TT5).
 * Maintains rolling baselines and surfaces pattern-drift flags to the manager
 * dashboard (docs/17 §6.3). Two analysis levels: individual baseline (current
 * period vs. rolling average by account category per employee) and peer group
 * comparison. Pattern flags are INFORMATIONAL ONLY by design — a deviation has
 * many legitimate explanations. This agent NEVER generates automatic employee
 * communications; it surfaces signals, managers apply context and decide.
 *
 * PRIVACY (docs/17 §6.3 / AIS): individual baseline data is
 * data_classification: user — the employee ID is one-way hashed BEFORE any
 * logging or surfacing, following the AnalystWorkstyleProfile hashed-id pattern.
 * No admin read path resolves the hash back to an identity.
 */

import type { TimeRecord } from "@sovereign/data";

export const TT_PATTERN_ANALYST_AGENT_ID = "tt.pattern-analyst";

/**
 * One-way FNV-1a hash with a per-deployment salt, hex-encoded. Deterministic for
 * the same (salt, id) pair; the salt never appears in any log or export.
 */
export function hashEmployeeId(employee_id: string, salt: string): string {
  const input = `${salt}:${employee_id}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/** Average hours per account category (ChargeAccount.cost_code) per period. */
export type CategoryBaseline = Record<string, number>;

/** An informational drift signal surfaced to the manager dashboard. */
export interface PatternDriftSignal {
  /** Hashed — never the cleartext employee ID (data_classification: user). */
  employee_id_hash: string;
  comparison: "INDIVIDUAL_BASELINE" | "PEER_GROUP";
  cost_code: string;
  /** Hours in the period under analysis. */
  current_hours: number;
  /** The baseline hours the current period is compared against. */
  baseline_hours: number;
  /** Signed percent deviation from the baseline. */
  deviation_percent: number;
  /** Always informational — never a correction demand (docs/17 §6.1/§6.3). */
  informational_only: true;
}

/** Per-category average hours across a set of prior periods for one employee. */
export function computeIndividualBaseline(priorRecords: TimeRecord[]): CategoryBaseline {
  if (priorRecords.length === 0) return {};
  const totals: Record<string, number> = {};
  for (const record of priorRecords) {
    for (const entry of record.entries) {
      totals[entry.cost_code] = (totals[entry.cost_code] ?? 0) + entry.hours;
    }
  }
  const baseline: CategoryBaseline = {};
  for (const [code, total] of Object.entries(totals)) {
    baseline[code] = total / priorRecords.length;
  }
  return baseline;
}

/** Per-category average hours across a peer group's records (same program/function). */
export function computePeerBaseline(peerRecords: TimeRecord[]): CategoryBaseline {
  const byEmployee = new Map<string, TimeRecord[]>();
  for (const r of peerRecords) {
    const list = byEmployee.get(r.employee_id) ?? [];
    list.push(r);
    byEmployee.set(r.employee_id, list);
  }
  if (byEmployee.size === 0) return {};
  const merged: Record<string, { total: number; employees: Set<string> }> = {};
  for (const [employee, records] of byEmployee) {
    const individual = computeIndividualBaseline(records);
    for (const [code, avg] of Object.entries(individual)) {
      merged[code] = merged[code] ?? { total: 0, employees: new Set() };
      merged[code].total += avg;
      merged[code].employees.add(employee);
    }
  }
  const baseline: CategoryBaseline = {};
  for (const [code, { total, employees }] of Object.entries(merged)) {
    baseline[code] = total / employees.size;
  }
  return baseline;
}

/**
 * Compare a current period against a baseline; surface a signal for every account
 * category whose deviation meets the configured drift threshold. Deterministic;
 * informational only.
 */
export function detectPatternDrift(
  current: TimeRecord,
  baseline: CategoryBaseline,
  driftThresholdPercent: number,
  comparison: PatternDriftSignal["comparison"],
  salt: string
): PatternDriftSignal[] {
  const signals: PatternDriftSignal[] = [];
  const currentByCode: Record<string, number> = {};
  for (const entry of current.entries) {
    currentByCode[entry.cost_code] = (currentByCode[entry.cost_code] ?? 0) + entry.hours;
  }
  const codes = new Set([...Object.keys(baseline), ...Object.keys(currentByCode)]);
  for (const code of codes) {
    const baselineHours = baseline[code] ?? 0;
    const currentHours = currentByCode[code] ?? 0;
    if (baselineHours === 0 && currentHours === 0) continue;
    const deviation =
      baselineHours === 0 ? 100 : ((currentHours - baselineHours) / baselineHours) * 100;
    if (Math.abs(deviation) >= driftThresholdPercent) {
      signals.push({
        employee_id_hash: hashEmployeeId(current.employee_id, salt),
        comparison,
        cost_code: code,
        current_hours: currentHours,
        baseline_hours: baselineHours,
        deviation_percent: Math.round(deviation * 100) / 100,
        informational_only: true,
      });
    }
  }
  return signals;
}
