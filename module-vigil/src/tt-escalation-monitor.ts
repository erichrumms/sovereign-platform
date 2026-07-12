/**
 * SOVEREIGN Platform — module-vigil
 * tt-escalation-monitor.ts — Time & Travel workflow layer, Session 27 scaffold.
 *
 * tt.escalation-monitor (Monitoring, deterministic — Agent Identity Standard,
 * D-TT5). Tracks recurrence counts per employee across a rolling multi-period
 * window per rule category (docs/17 §6.2). At or beyond the configured recurrence
 * threshold, it upgrades the default communication type to the formal escalation
 * template and marks the case as requiring VIGIL human authorization before any
 * escalation communication is sent. It tracks and routes ONLY — it never sends
 * notices, modifies records, or makes personnel decisions.
 *
 * HARD STOP DISCOVERY (Session 27, surfaced in handoff — NOT acted on): docs/17
 * §7 expects TT escalations to enter the VIGIL Alert Queue, and §15 says a VIGIL
 * alert would carry sourceProduct: "TIME_TRAVEL" — but SovereignProduct (shell
 * contract v1.15) does NOT include "TIME_TRAVEL", and VIGILAlert.sourceProduct is
 * typed SovereignProduct. Wiring TT alerts therefore needs either a shell-contract
 * GD (add TIME_TRAVEL) or a governance decision to route under a host product.
 * This scaffold stops at the EscalationDecision boundary; the VIGIL queue wiring
 * is Session 28 scope, blocked on that decision.
 */

import type { ComplianceFlag, CorrectionCommunicationType, TimeRuleCategory } from "@sovereign/data";

export const TT_ESCALATION_MONITOR_AGENT_ID = "tt.escalation-monitor";

/** Rolling-window recurrence configuration (docs/17 §4: threshold is FLOWPATH-elicited). */
export interface EscalationMonitorConfig {
  /** How many pay periods the rolling window spans. */
  window_periods: number;
  /** The occurrence at which formal escalation triggers (docs/17 §6.2 default: 3). */
  formal_escalation_occurrence: number;
}

/** One recurrence-tracking outcome, displayed on the manager review dashboard. */
export interface EscalationDecision {
  employee_id: string;
  rule_category: TimeRuleCategory | ComplianceFlag["rule_category"];
  recurrence_count: number;
  /** The communication type this occurrence defaults to (manager still decides). */
  communication_type: CorrectionCommunicationType;
  /** true when the formal escalation threshold is met — VIGIL authorization required. */
  requires_vigil_authorization: boolean;
}

/**
 * The default communication type for an occurrence count (docs/17 §6.2): first and
 * second occurrences stay in standard correction channels; at the configured
 * threshold and beyond, the formal escalation template applies. The default for
 * sub-threshold occurrences is the caller's severity-appropriate template — this
 * function only decides whether the FORMAL_ESCALATION upgrade applies.
 */
export function upgradeCommunicationType(
  defaultType: CorrectionCommunicationType,
  recurrenceCount: number,
  config: EscalationMonitorConfig
): CorrectionCommunicationType {
  return recurrenceCount >= config.formal_escalation_occurrence ? "FORMAL_ESCALATION" : defaultType;
}

/**
 * Evaluate a set of raised flags (each already carrying its recurrence_count from
 * the rolling window) and produce the per-case escalation decisions. Deterministic:
 * a pure function of the flags, defaults, and configuration.
 */
export function evaluateEscalations(
  flags: ComplianceFlag[],
  defaultTypeFor: (flag: ComplianceFlag) => CorrectionCommunicationType,
  config: EscalationMonitorConfig
): EscalationDecision[] {
  return flags.map((flag) => {
    const communication_type = upgradeCommunicationType(defaultTypeFor(flag), flag.recurrence_count, config);
    return {
      employee_id: flag.employee_id,
      rule_category: flag.rule_category,
      recurrence_count: flag.recurrence_count,
      communication_type,
      requires_vigil_authorization: communication_type === "FORMAL_ESCALATION",
    };
  });
}
