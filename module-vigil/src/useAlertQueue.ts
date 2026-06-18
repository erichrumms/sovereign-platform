/**
 * SOVEREIGN Platform — module-vigil
 * useAlertQueue.ts — the Security Operator's alert-queue state (spec §2.1 / §3.2).
 *
 * The ingestion path with the platform's stub-with-stable-signature shape. The live
 * feed (Alert Dispatcher webhook → VIGIL_ALERT_ENDPOINT) is wired by configuration in
 * the Security Framework live-wiring session (not a VIGIL rewrite — Standing
 * Constraint #3). This session VIGIL_ALERT_ENDPOINT is null, so:
 *   - `configured` is false and the queue does not poll;
 *   - the Alert Queue renders the empty-queue configuration notice (spec §3.2 Tier 3:
 *     an empty queue with a connectivity notice does NOT imply the platform is secure —
 *     it implies the operator cannot see the alert state);
 *   - `ingest()` is the stable entry the live poller will call once the endpoint is
 *     configured. It is exercised now (tests / a seeded demo alert) so the ingestion +
 *     ALERT_RECEIVED + sort + response machinery is real, not a placeholder.
 *
 * Alert state lives in React state for the response session and is discarded when the
 * session ends; the SOF Logger is the permanent record (spec §4). A closed alert
 * (RESOLVED / ESCALATED / FALSE_POSITIVE) leaves the active queue — its audit record
 * persists in the Logger.
 *
 * ALERT_RECEIVED is emitted on ingest. Unlike a response emit (which Gate 2 blocks on
 * failure), a failed ALERT_RECEIVED emit does NOT hide the alert: an unseen P1 is the
 * worse failure, so the alert is still shown and the emit failure is surfaced
 * (ingestError) rather than swallowed (Gate 2 — never silently continue).
 *
 * Version: 1.0 · Session 7 · June 18, 2026
 */

import { useCallback, useMemo, useState } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { VIGIL_ALERT_ENDPOINT } from "./config";
import {
  alertWorkflowStep,
  sortAlerts,
  type AlertResponseAction,
  type SecurityAlert,
} from "./vigil-types";

const SOF_ALERT_DISPATCHER = "sof-alert-dispatcher";

export interface UseAlertQueueOptions {
  /** Defaults to the platform config binding (null until Stage 2 wiring). */
  endpoint?: string | null;
  /** Pre-seed the active queue (dev/demo/test) without emitting ALERT_RECEIVED. */
  initialAlerts?: SecurityAlert[];
}

export interface UseAlertQueue {
  /** Active alerts, sorted P1-first then oldest-first within a level. */
  alerts: SecurityAlert[];
  /** Whether VIGIL_ALERT_ENDPOINT is configured (false until Stage 2 wiring). */
  configured: boolean;
  /** The currently selected alert, or null. */
  selected: SecurityAlert | null;
  selectedId: string | null;
  /** Count of UNACKNOWLEDGED alerts (drives the command-center summary). */
  unacknowledgedCount: number;
  /** True while any UNACKNOWLEDGED P1 is present (persistent indicator, spec §2.1). */
  hasUnacknowledgedP1: boolean;
  /** A surfaced ingestion-emit failure, if any (not swallowed — Gate 2). */
  ingestError: string | null;
  /** Live-feed entry point: add an alert and emit ALERT_RECEIVED. */
  ingest: (alert: SecurityAlert) => void;
  select: (alertId: string | null) => void;
  /** Apply a recorded operator response to the queue (status / close). */
  applyResponse: (alertId: string, action: AlertResponseAction) => void;
}

const CLOSING_ACTIONS: readonly AlertResponseAction[] = ["RESOLVED", "ESCALATED", "FALSE_POSITIVE"];

export function useAlertQueue(ctx: SovereignShellContext, opts: UseAlertQueueOptions = {}): UseAlertQueue {
  const endpoint = opts.endpoint !== undefined ? opts.endpoint : VIGIL_ALERT_ENDPOINT;
  const configured = endpoint !== null;

  const [alerts, setAlerts] = useState<SecurityAlert[]>(() => opts.initialAlerts ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);

  const ingest = useCallback(
    (alert: SecurityAlert): void => {
      // Append first (dedupe by id) so the operator sees the alert even if the
      // ALERT_RECEIVED emit then fails — an unseen alert is the worse outcome.
      setAlerts((prev) => (prev.some((a) => a.alertId === alert.alertId) ? prev : [...prev, alert]));

      try {
        ctx.logger.log({
          event_type: "ALERT_RECEIVED",
          workflow_step_id: alertWorkflowStep(alert.alertId),
          sovereign_tier: "standard",
          product: "VIGIL",
          actor_id: SOF_ALERT_DISPATCHER,
          outcome: "alert_received",
          payload: {
            alert_id: alert.alertId,
            alert_level: alert.alertLevel,
            alert_type: alert.alertType,
            source_product: alert.sourceProduct,
            agent_id: alert.agentId,
            received_at: alert.timestamp,
          },
        });
      } catch (err) {
        setIngestError(
          `ALERT_RECEIVED Logger emit failed for ${alert.alertId} — the alert is shown but its receipt was not logged (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    },
    [ctx]
  );

  const select = useCallback((alertId: string | null): void => setSelectedId(alertId), []);

  const applyResponse = useCallback((alertId: string, action: AlertResponseAction): void => {
    if (CLOSING_ACTIONS.includes(action)) {
      // Closed: leaves the active queue (Logger keeps the permanent record).
      setAlerts((prev) => prev.filter((a) => a.alertId !== alertId));
      setSelectedId((cur) => (cur === alertId ? null : cur));
      return;
    }
    // ACKNOWLEDGED / INVESTIGATING: in-place status transition.
    const nextStatus = action === "ACKNOWLEDGED" ? "ACKNOWLEDGED" : "INVESTIGATING";
    setAlerts((prev) => prev.map((a) => (a.alertId === alertId ? { ...a, status: nextStatus } : a)));
  }, []);

  const sorted = useMemo(() => sortAlerts(alerts), [alerts]);
  const selected = useMemo(
    () => sorted.find((a) => a.alertId === selectedId) ?? null,
    [sorted, selectedId]
  );
  const unacknowledgedCount = useMemo(
    () => alerts.filter((a) => a.status === "UNACKNOWLEDGED").length,
    [alerts]
  );
  const hasUnacknowledgedP1 = useMemo(
    () => alerts.some((a) => a.status === "UNACKNOWLEDGED" && a.alertLevel === "P1"),
    [alerts]
  );

  return {
    alerts: sorted,
    configured,
    selected,
    selectedId,
    unacknowledgedCount,
    hasUnacknowledgedP1,
    ingestError,
    ingest,
    select,
    applyResponse,
  };
}
