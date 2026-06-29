/**
 * SOVEREIGN Platform — module-vigil
 * AlertQueue.tsx — the Security Operator's alert surface (spec §2.1).
 *
 * Renders the active alerts (sorted P1-first by the queue hook), each selectable to
 * open its detail. When VIGIL_ALERT_ENDPOINT is null (this session — Stage 2 wiring
 * pending), the queue shows the configuration notice and does NOT imply the platform
 * is secure (spec §3.2 Tier 3: an empty queue with a connectivity notice means the
 * operator cannot see the alert state, not that the platform is secure). Thin
 * presenter — ingestion / sort / state live in useAlertQueue.
 *
 * Version: 1.1 · Session 7 · June 18, 2026
 */

import type { CSSProperties } from "react";

import type { SecurityAlert } from "./vigil-types";

export interface AlertQueueProps {
  alerts: SecurityAlert[];
  /** Whether VIGIL_ALERT_ENDPOINT is configured (false until Stage 2 wiring). */
  configured: boolean;
  selectedId: string | null;
  onSelect: (alertId: string) => void;
}

export function AlertQueue({ alerts, configured, selectedId, onSelect }: AlertQueueProps): JSX.Element {
  const hasAlerts = alerts.length > 0;

  return (
    <section style={panelStyle} aria-label="Alert Queue">
      <h3 style={titleStyle}>Alert Queue</h3>

      {hasAlerts ? (
        <ul style={listStyle}>
          {alerts.map((a) => (
            <AlertCard key={a.alertId} alert={a} selected={a.alertId === selectedId} onSelect={onSelect} />
          ))}
        </ul>
      ) : configured ? (
        <p style={noticeOkStyle}>Alert endpoint configured. No active alerts in the queue.</p>
      ) : (
        <div style={noticeStyle} role="status">
          <strong>No alert endpoint configured.</strong>
          <p style={noticeBodyStyle}>
            <code>VIGIL_ALERT_ENDPOINT</code> is null (Stage&nbsp;2 not yet wired). The queue is empty because
            the operator cannot see the alert state — <em>not</em> because the platform is known to be secure.
            Configuring the Alert Dispatcher webhook is a platform-config change, not a VIGIL change.
          </p>
        </div>
      )}
    </section>
  );
}

function AlertCard({
  alert,
  selected,
  onSelect,
}: {
  alert: SecurityAlert;
  selected: boolean;
  onSelect: (alertId: string) => void;
}): JSX.Element {
  const unackP1 = alert.status === "UNACKNOWLEDGED" && alert.alertLevel === "P1";
  const isCpmiDrift = alert.alertType === "CPMI_DRIFT_DETECTED";
  // ARIA Suite CLEAR alerts (S23 · D5) — made visually identifiable by source within the
  // existing card pattern: an ARIA source tag and a governance-blue accent. No new component.
  const isAria = alert.sourceProduct === "ARIA";
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(alert.alertId)}
        aria-pressed={selected}
        data-source-product={alert.sourceProduct}
        style={{
          ...cardStyle,
          ...(selected ? cardSelectedStyle : null),
          ...(isCpmiDrift ? cardCpmiStyle : null),
          ...(isAria ? cardAriaStyle : null),
        }}
      >
        <span style={{ ...badgeStyle, ...levelBadgeStyle(alert.alertLevel) }}>{alert.alertLevel}</span>
        <span style={cardMainStyle}>
          <span style={cardTypeStyle}>
            {alert.alertType}
            {isAria && <span style={ariaTagStyle}>ARIA · CLEAR</span>}
            {unackP1 && <span style={p1DotStyle} aria-label="unacknowledged P1" title="Unacknowledged P1" />}
          </span>
          <span style={cardMetaStyle}>
            {alert.sourceProduct} · {alert.timestamp} · {alert.status}
          </span>
          {isCpmiDrift && (
            <span style={cpmiNoteStyle}>
              CPMI integrity is a platform-wide dependency. Governance outputs to all six products may be
              affected while this alert is unresolved.
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

function levelBadgeStyle(level: SecurityAlert["alertLevel"]): CSSProperties {
  switch (level) {
    case "P1":
      return { background: "#991b1b" };
    case "P2":
      return { background: "#b45309" };
    case "P3":
      return { background: "#475569" };
  }
}

const panelStyle: CSSProperties = {
  padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff", maxWidth: 720,
};
const titleStyle: CSSProperties = { margin: "0 0 8px", fontSize: 15 };
const listStyle: CSSProperties = {
  listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8,
};
const cardStyle: CSSProperties = {
  display: "flex", gap: 10, alignItems: "flex-start", width: "100%", textAlign: "left",
  padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer",
};
const cardSelectedStyle: CSSProperties = { borderColor: "#0c4a6e", background: "#e0f2fe" };
const cardCpmiStyle: CSSProperties = { borderColor: "#fecaca" };
const cardAriaStyle: CSSProperties = { borderLeft: "3px solid #2563eb" };
const ariaTagStyle: CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "#1e40af", background: "#eff6ff",
  border: "1px solid #bfdbfe", borderRadius: 999, padding: "1px 6px",
};
const cardMainStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 2 };
const cardTypeStyle: CSSProperties = {
  fontSize: 13, fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: 6,
};
const cardMetaStyle: CSSProperties = { fontSize: 12, color: "#64748b" };
const cpmiNoteStyle: CSSProperties = { fontSize: 11, color: "#991b1b", marginTop: 2 };
const badgeStyle: CSSProperties = {
  color: "#ffffff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, flexShrink: 0,
};
const p1DotStyle: CSSProperties = {
  width: 8, height: 8, borderRadius: 999, background: "#dc2626", display: "inline-block",
};
const noticeStyle: CSSProperties = {
  padding: "10px 12px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", fontSize: 13,
};
const noticeBodyStyle: CSSProperties = { margin: "6px 0 0" };
const noticeOkStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#475569" };

export default AlertQueue;
