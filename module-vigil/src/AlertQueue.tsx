/**
 * SOVEREIGN Platform — module-vigil
 * AlertQueue.tsx — the Security Operator's alert surface (spec §2.1) — STUB.
 *
 * D3 scaffold: VIGIL_ALERT_ENDPOINT is null until Stage 2 (config.ts), so this
 * renders an empty queue with a configuration notice and does NOT throw or imply
 * the platform is secure (spec §3.2 Tier-3 state: "An empty queue with a clear
 * connectivity notice is a correct response to a null or unreachable endpoint — it
 * does not imply the platform is secure; it implies the operator cannot see the
 * alert state"). Live ingestion (WebSocket/polling, ALERT_RECEIVED) lands in the
 * alert-wiring session.
 *
 * Version: 1.0 (scaffold) · Session 6 · June 17, 2026
 */

import type { CSSProperties } from "react";

export interface AlertQueueProps {
  /** The configured alert endpoint, or null until Stage 2 wiring (config.ts). */
  endpoint: string | null;
}

export function AlertQueue({ endpoint }: AlertQueueProps): JSX.Element {
  const configured = endpoint !== null;
  return (
    <section style={panelStyle} aria-label="Alert Queue">
      <h3 style={titleStyle}>Alert Queue</h3>
      {configured ? (
        <p style={noticeOkStyle}>
          Alert endpoint configured. Live ingestion (WebSocket / polling) is wired in a later session;
          this scaffold does not yet poll.
        </p>
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

const panelStyle: CSSProperties = {
  padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff", maxWidth: 720,
};
const titleStyle: CSSProperties = { margin: "0 0 8px", fontSize: 15 };
const noticeStyle: CSSProperties = {
  padding: "10px 12px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", fontSize: 13,
};
const noticeBodyStyle: CSSProperties = { margin: "6px 0 0" };
const noticeOkStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#475569" };

export default AlertQueue;
