/**
 * SOVEREIGN Platform — module-vigil
 * security-query.ts — the scoped Security Framework observability query (port + dev backing).
 *
 * Fills AnomalyContext.recentEvents and AnomalyContext.similarAlerts for the Anomaly
 * Triage Assistant (spec §4). The data comes from the SOVEREIGN Security Observability
 * Framework's store — the platform's security system — read through this injectable
 * PORT (Standing Constraint #1: VIGIL does not own its own event/alert store, and #5/§4:
 * VIGIL never reaches the write-only shell logger to read events). This session the port
 * is backed by SYNTHETIC/DEV data (Governance Clock OFF, all data SYNTHETIC); pointing it
 * at the real Security Framework later is a CONFIGURATION change — inject a live
 * implementation of SecurityObservabilityQuery, no VIGIL rewrite (Standing Constraint #3).
 *
 * No Logger emission and no new event types: the query is READ-ONLY.
 *
 * Version: 1.0 · Session 9 · June 23, 2026
 */

import type { SovereignProduct } from "../../sovereign-shell/shell-contract";
import type { SecurityAlert, AlertType } from "./vigil-types";

/** The ±window (minutes) of Logger events the triage brief considers "recent" (spec §4). */
export const RECENT_EVENT_WINDOW_MINUTES = 30;

/**
 * One entry in the Security Framework observability store: a Logger event with the
 * product and timestamp the store indexes it by. `event` is the opaque event payload
 * (the Security Framework owns its shape — VIGIL forwards it, never re-derives it).
 */
export interface ObservabilityEntry {
  product: SovereignProduct;
  /** ISO 8601 — when the event was recorded. */
  timestamp: string;
  event: Record<string, unknown>;
}

/**
 * The Security Framework observability query port. The triage surface depends on this
 * interface, not on a concrete store — so the synthetic/dev backing here is swapped for
 * the live Security Framework by injecting a different implementation (Constraint #3).
 */
export interface SecurityObservabilityQuery {
  /** Logger events within ±RECENT_EVENT_WINDOW_MINUTES of the alert, same product. */
  recentEvents: (alert: SecurityAlert) => Record<string, unknown>[];
  /** Prior alerts of the same type for the same product (excludes the alert itself). */
  similarAlerts: (alert: SecurityAlert) => SecurityAlert[];
}

// ============================================================
// PURE SCOPING — testable without any store. The real filtering logic that the live
// implementation will run against the Security Framework store unchanged.
// ============================================================

/** Events within ±windowMinutes of the alert AND from the alert's source product. */
export function scopeRecentEvents(
  entries: readonly ObservabilityEntry[],
  alert: SecurityAlert,
  windowMinutes: number = RECENT_EVENT_WINDOW_MINUTES
): Record<string, unknown>[] {
  const anchor = Date.parse(alert.timestamp);
  const windowMs = windowMinutes * 60_000;
  return entries
    .filter((e) => e.product === alert.sourceProduct)
    .filter((e) => {
      const t = Date.parse(e.timestamp);
      return !Number.isNaN(t) && Math.abs(t - anchor) <= windowMs;
    })
    .map((e) => e.event);
}

/** Prior alerts of the same type for the same product, excluding the alert itself. */
export function scopeSimilarAlerts(
  priorAlerts: readonly SecurityAlert[],
  alert: SecurityAlert
): SecurityAlert[] {
  return priorAlerts.filter(
    (a) =>
      a.alertId !== alert.alertId &&
      a.alertType === alert.alertType &&
      a.sourceProduct === alert.sourceProduct
  );
}

// ============================================================
// DEV BACKING — SYNTHETIC data only (Governance Clock OFF). Anchored to the queried
// alert so the dev app shows real, scoped context; includes decoys (out-of-window,
// other-product, other-type) that the scoping above correctly drops.
// ============================================================

/** Shift an ISO timestamp by `minutes` (negative = earlier). */
function shiftIso(iso: string, minutes: number): string {
  return new Date(Date.parse(iso) + minutes * 60_000).toISOString();
}

/** Synthetic observability entries anchored to an alert (clearly labelled synthetic). */
function syntheticEntriesFor(alert: SecurityAlert): ObservabilityEntry[] {
  const otherProduct: SovereignProduct = alert.sourceProduct === "CPMI" ? "APEX" : "CPMI";
  const mk = (offset: number, outcome: string): Record<string, unknown> => ({
    event_type: "AGENT_STEP_COMPLETE",
    workflow_step_id: `synthetic-${alert.sourceProduct}-${offset}`,
    product: alert.sourceProduct,
    outcome,
    synthetic: true,
  });
  return [
    { product: alert.sourceProduct, timestamp: shiftIso(alert.timestamp, -20), event: mk(-20, "baseline_step") },
    { product: alert.sourceProduct, timestamp: shiftIso(alert.timestamp, -5), event: mk(-5, "precipitating_step") },
    { product: alert.sourceProduct, timestamp: shiftIso(alert.timestamp, 8), event: mk(8, "follow_on_step") },
    // Decoys the scoping drops:
    { product: alert.sourceProduct, timestamp: shiftIso(alert.timestamp, -90), event: mk(-90, "out_of_window") },
    { product: otherProduct, timestamp: shiftIso(alert.timestamp, -2), event: { event_type: "AGENT_STEP_COMPLETE", product: otherProduct, synthetic: true } },
  ];
}

/** Synthetic prior alerts anchored to an alert (same type+product, plus a decoy type). */
function syntheticPriorAlertsFor(alert: SecurityAlert): SecurityAlert[] {
  const decoyType: AlertType = alert.alertType === "ANOMALY_DETECTED" ? "THRESHOLD_BREACH" : "ANOMALY_DETECTED";
  const base = (idSuffix: string, alertType: AlertType, offset: number): SecurityAlert => ({
    alertId: `${alert.alertId}-prior-${idSuffix}`,
    alertLevel: alert.alertLevel,
    alertType,
    sourceProduct: alert.sourceProduct,
    timestamp: shiftIso(alert.timestamp, offset),
    rawEvent: { synthetic: true },
    status: "RESOLVED",
  });
  return [
    base("1", alert.alertType, -60 * 24),
    base("2", alert.alertType, -60 * 48),
    base("decoy", decoyType, -60 * 12), // dropped by scopeSimilarAlerts
  ];
}

/**
 * The default DEV Security Framework query — SYNTHETIC data only. Applies the same pure
 * scoping the live port will use. Replace by injecting a live SecurityObservabilityQuery
 * (configuration change, Constraint #3) when the Governance Clock is activated.
 */
export function createDevSecurityQuery(): SecurityObservabilityQuery {
  return {
    recentEvents: (alert) => scopeRecentEvents(syntheticEntriesFor(alert), alert),
    similarAlerts: (alert) => scopeSimilarAlerts(syntheticPriorAlertsFor(alert), alert),
  };
}
