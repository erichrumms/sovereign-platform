/**
 * SOVEREIGN Platform — module-vigil
 * AlertDetail.tsx — single-alert drill-down (spec §2.2): event context, the response
 * actions, and the Anomaly Triage Assistant.
 *
 * Owns useAlertResponse for the selected alert; on a successful response it applies
 * the queue transition (passed in from VigilApp) and closes the detail when the alert
 * leaves the active queue. Assembles the AnomalyContext for triage from the alert —
 * recentEvents / similarAlerts come from the scoped Logger query (wired in the
 * Security Framework live-wiring session); until then they are honestly empty and the
 * triage assistant degrades to its static checklist.
 *
 * Version: 1.0 · Session 7 · June 18, 2026
 */

import { useMemo, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { AlertResponseAction, AnomalyContext, SecurityAlert } from "./vigil-types";
import { useAlertResponse, type RespondResult } from "./useAlertResponse";
import { AlertResponsePanel } from "./AlertResponsePanel";
import { AnomalyTriageAssistant } from "./AnomalyTriageAssistant";

export interface AlertDetailProps {
  ctx: SovereignShellContext;
  alert: SecurityAlert;
  /** Apply the recorded response to the queue (status transition / close). */
  applyResponse: (alertId: string, action: AlertResponseAction) => void;
  /** Called when the alert leaves the active queue (closed). */
  onClose: () => void;
}

export function AlertDetail({ ctx, alert, applyResponse, onClose }: AlertDetailProps): JSX.Element {
  const response = useAlertResponse(ctx);
  const isCpmiDrift = alert.alertType === "CPMI_DRIFT_DETECTED";

  // Minimal AnomalyContext from the alert. recentEvents / similarAlerts are filled by
  // the scoped Logger query in a later session; empty here (honest, not fabricated).
  const anomalyContext = useMemo<AnomalyContext>(
    () => ({
      alert,
      recentEvents: [],
      productBaseline: { product: alert.sourceProduct },
      similarAlerts: [],
    }),
    [alert]
  );

  function handleRespond(action: AlertResponseAction, note?: string): RespondResult {
    const result = response.respond(alert, action, note);
    if (result.ok) {
      applyResponse(alert.alertId, action);
      if (result.closed) onClose();
    }
    return result;
  }

  return (
    <section style={rootStyle} aria-label="Alert Detail">
      <h3 style={titleStyle}>Alert Detail</h3>

      <dl style={metaStyle}>
        <Row label="Alert ID" value={alert.alertId} />
        <Row label="Level" value={alert.alertLevel} />
        <Row label="Type" value={alert.alertType} />
        <Row label="Source product" value={alert.sourceProduct} />
        <Row label="Agent" value={alert.agentId ?? "—"} />
        <Row label="Detected" value={alert.timestamp} />
        <Row label="Status" value={alert.status} />
      </dl>

      {isCpmiDrift && (
        <p role="status" style={cpmiStyle}>
          CPMI integrity is a platform-wide dependency. Governance outputs to all six products may be affected
          while this alert is unresolved.
        </p>
      )}

      <AlertResponsePanel alert={alert} onRespond={handleRespond} error={response.error} />
      <AnomalyTriageAssistant ctx={ctx} context={anomalyContext} />
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div style={rowStyle}>
      <dt style={dtStyle}>{label}</dt>
      <dd style={ddStyle}>{value}</dd>
    </div>
  );
}

const rootStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const titleStyle: CSSProperties = { margin: 0, fontSize: 15 };
const metaStyle: CSSProperties = {
  margin: 0, padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff", maxWidth: 720,
};
const rowStyle: CSSProperties = { display: "flex", gap: 8, fontSize: 13, padding: "2px 0" };
const dtStyle: CSSProperties = { width: 130, color: "#64748b", flexShrink: 0 };
const ddStyle: CSSProperties = { margin: 0, color: "#0f172a" };
const cpmiStyle: CSSProperties = {
  margin: 0, padding: "10px 12px", borderRadius: 8, background: "#fef2f2",
  border: "1px solid #fecaca", color: "#991b1b", fontSize: 13, maxWidth: 720,
};

export default AlertDetail;
