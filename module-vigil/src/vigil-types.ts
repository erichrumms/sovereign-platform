/**
 * SOVEREIGN Platform — module-vigil
 * vigil-types.ts — VIGIL's local operational types (spec §4 Data Model).
 *
 * VIGIL has no database of its own (spec §3 / §4): the SOF Logger is the
 * authoritative record. These types describe the alert and response objects VIGIL
 * holds in React state during an active response session. Canonical SHARED entities
 * are never redefined here (Standing Constraint #2) — SovereignProduct is imported
 * from the shell contract; these are VIGIL-local operational shapes the platform
 * data dictionary does not own.
 *
 * Version: 1.0 · Session 7 · June 18, 2026
 */

import type { SovereignProduct } from "../../sovereign-shell/shell-contract";

/** Severity assigned by the Security Framework (spec §2.1). P1 is most critical. */
export type AlertLevel = "P1" | "P2" | "P3";

/** Categories of anomalous behaviour the Security Framework surfaces (spec §2.1). */
export type AlertType =
  | "HONEYTOKEN_TRIGGERED"
  | "ANOMALY_DETECTED"
  | "CPMI_DRIFT_DETECTED"
  | "CASCADE_RISK"
  | "THRESHOLD_BREACH"
  | "FALLBACK_ACTIVATED";

/** Lifecycle state of an alert in the queue (spec §4 SecurityAlert.status). */
export type AlertStatus =
  | "UNACKNOWLEDGED"
  | "ACKNOWLEDGED"
  | "INVESTIGATING"
  | "RESOLVED"
  | "ESCALATED";

/**
 * An alert received from the Alert Dispatcher (spec §4). Rendered and acted on in
 * VIGIL; never written back to any product. `rawEvent` is the original Logger event
 * that triggered the alert — kept opaque (the Security Framework owns its shape).
 */
export interface SecurityAlert {
  alertId: string;
  alertLevel: AlertLevel;
  alertType: AlertType;
  sourceProduct: SovereignProduct;
  /** The agent associated with the alert, if any. */
  agentId?: string;
  /** ISO 8601 — when the Security Framework detected the anomaly. */
  timestamp: string;
  /** The original Logger event that triggered the alert. */
  rawEvent: Record<string, unknown>;
  status: AlertStatus;
}

/**
 * The operator's response action on an alert (spec §4 AlertResponse.action).
 * INVESTIGATING is an interim working state — see useAlertResponse for why it does
 * not emit a Logger event (no approved ALERT_INVESTIGATING event type exists; GD-4
 * defined only ACKNOWLEDGED / RESOLVED / ESCALATED / FALSE_POSITIVE).
 */
export type AlertResponseAction =
  | "ACKNOWLEDGED"
  | "INVESTIGATING"
  | "RESOLVED"
  | "ESCALATED"
  | "FALSE_POSITIVE";

/**
 * The operator's response to a security alert (spec §4). Emitted as a Logger event
 * when the operator acts (except INVESTIGATING — see above). `note` is required for
 * RESOLVED / ESCALATED / FALSE_POSITIVE.
 */
export interface AlertResponse {
  alertId: string;
  operatorId: string;
  action: AlertResponseAction;
  note?: string;
  workflowStepId: string;
  /** ISO 8601. */
  timestamp: string;
}

/**
 * The affected product's IsolationForest baseline summary (spec §4 AnomalyContext).
 * Opaque numeric summary assembled by the Security Framework; VIGIL only forwards it
 * to the triage analyst as context and never re-derives it.
 */
export interface ProductBaselineSummary {
  product: SovereignProduct;
  /** Mean anomaly score across the baseline window, if available. */
  mean_score?: number;
  /** The configured anomaly threshold for this product, if available. */
  threshold?: number;
  /** Free-form additional baseline fields supplied by the Security Framework. */
  [key: string]: unknown;
}

/**
 * The structured context for the Anomaly Triage Assistant LLM call (spec §4).
 * Assembled by the operator surface before the call; the operator reviews it before
 * the triage call is made (spec §2.3 — a triage session cannot proceed without
 * operator review of context).
 */
export interface AnomalyContext {
  alert: SecurityAlert;
  /** Logger events surrounding the triggering event (±30 minutes). */
  recentEvents: Record<string, unknown>[];
  /** The affected product's IsolationForest baseline summary. */
  productBaseline: ProductBaselineSummary;
  /** Prior alerts of the same type for the same product. */
  similarAlerts: SecurityAlert[];
}

/**
 * Per-alert workflow step id. Every Logger event for a given alert — ingestion
 * (ALERT_RECEIVED) and each operator response (ALERT_*) — shares this id so the
 * audit trail ties the whole alert lifecycle together (Standing Constraint #6).
 */
export function alertWorkflowStep(alertId: string): string {
  return `vigil-alert-${alertId}`;
}

/** Severity sort order — P1 first (spec §2.1: sorted by level, P1 first). */
export const ALERT_LEVEL_ORDER: Record<AlertLevel, number> = {
  P1: 0,
  P2: 1,
  P3: 2,
};

/**
 * Sort a copy of the alerts by severity (P1 first) then timestamp ascending within
 * each level (oldest-waiting first). Pure; does not mutate the input.
 */
export function sortAlerts(alerts: readonly SecurityAlert[]): SecurityAlert[] {
  return [...alerts].sort((a, b) => {
    const byLevel = ALERT_LEVEL_ORDER[a.alertLevel] - ALERT_LEVEL_ORDER[b.alertLevel];
    if (byLevel !== 0) return byLevel;
    return a.timestamp.localeCompare(b.timestamp);
  });
}
