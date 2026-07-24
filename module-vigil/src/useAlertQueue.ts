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
 * D2 (Session 61, finding D3-1 HIGH): when opts.sessionStore is set, alert state
 * lives in the module-level session store (vigil-alert-session.ts) instead of
 * this hook's own per-mount React state — assembled once per browser session,
 * mutated through the store, consumed via the same live-subscription pattern
 * as useApprovalQueue's D1 change. A responded alert therefore no longer
 * resurrects when VigilApp remounts. Off by default so store-less tests keep
 * their isolated per-render state.
 *
 * Version: 1.1 · Session 61 (D2) · July 23, 2026
 */

import { useCallback, useEffect, useMemo, useState } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { VIGIL_ALERT_ENDPOINT } from "./config";
import {
  applyResponseToAlerts,
  applyVigilAlertSessionResponse,
  CLOSING_ACTIONS,
  ensureVigilAlertSession,
  ingestVigilAlertSessionAlert,
  subscribeVigilAlertSession,
} from "./vigil-alert-session";
import {
  alertWorkflowStep,
  sortAlerts,
  type AlertResponseAction,
  type SecurityAlert,
} from "./vigil-types";

const SOF_ALERT_DISPATCHER = "sof-alert-dispatcher";

/** D2 — CLOSING_ACTIONS is canonical in vigil-alert-session.ts (Constraint #2). */
function isClosing(action: AlertResponseAction): boolean {
  return CLOSING_ACTIONS.includes(action);
}

export interface UseAlertQueueOptions {
  /** Defaults to the platform config binding (null until Stage 2 wiring). */
  endpoint?: string | null;
  /** Pre-seed the active queue (dev/demo/test) without emitting ALERT_RECEIVED. */
  initialAlerts?: SecurityAlert[];
  /**
   * D2 (Session 61) — hold alert state in the session-persistent store
   * (vigil-alert-session.ts) instead of per-mount React state, so responded
   * alerts do not resurrect on remount (D3-1 HIGH). initialAlerts then seeds
   * the store's ONE per-session assembly. Read once at mount. Off by default
   * so store-less tests keep isolated state.
   */
  sessionStore?: boolean;
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

export function useAlertQueue(ctx: SovereignShellContext, opts: UseAlertQueueOptions = {}): UseAlertQueue {
  const endpoint = opts.endpoint !== undefined ? opts.endpoint : VIGIL_ALERT_ENDPOINT;
  const configured = endpoint !== null;
  // D2 — read once at mount (documented on the option).
  const sessionStore = opts.sessionStore ?? false;

  const [alerts, setAlerts] = useState<SecurityAlert[]>(() =>
    sessionStore
      ? [...ensureVigilAlertSession(opts.initialAlerts ?? [])]
      : opts.initialAlerts ?? []
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);

  // D2 — the live session-store subscription (same external-store pattern as
  // useApprovalQueue's D1 change). The store notifies only on actual change,
  // and clears a selection whose alert just left the queue.
  useEffect(() => {
    if (!sessionStore) return;
    return subscribeVigilAlertSession((next) => {
      setAlerts([...next]);
      setSelectedId((cur) =>
        cur !== null && !next.some((a) => a.alertId === cur) ? null : cur
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ingest = useCallback(
    (alert: SecurityAlert): void => {
      // Append first (dedupe by id) so the operator sees the alert even if the
      // ALERT_RECEIVED emit then fails — an unseen alert is the worse outcome.
      if (sessionStore) {
        ingestVigilAlertSessionAlert(alert); // dedupes; notify updates local state
      } else {
        setAlerts((prev) => (prev.some((a) => a.alertId === alert.alertId) ? prev : [...prev, alert]));
      }

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
    [ctx, sessionStore]
  );

  const select = useCallback((alertId: string | null): void => setSelectedId(alertId), []);

  const applyResponse = useCallback(
    (alertId: string, action: AlertResponseAction): void => {
      if (sessionStore) {
        // D2 — route the mutation through the session store; the subscription
        // above updates local state (and clears a closed alert's selection).
        applyVigilAlertSessionResponse(alertId, action);
        return;
      }
      // Store-less path: the single shared response semantics (Constraint #2 —
      // applyResponseToAlerts is the one implementation, used by both paths).
      setAlerts((prev) => applyResponseToAlerts(prev, alertId, action));
      setSelectedId((cur) => (cur === alertId && isClosing(action) ? null : cur));
    },
    [sessionStore]
  );

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
