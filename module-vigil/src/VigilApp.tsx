/**
 * SOVEREIGN Platform — module-vigil
 * VigilApp.tsx — VIGIL composition root (React).
 *
 * The single React component the module mounts (via index.ts → createRoot) into the
 * shell-provided outlet, AFTER the structural role gate in index.ts admits the operator.
 * It renders the VIGIL chrome (Command Center summary) and two tabs:
 *   - Alert Queue (Session 7) — Alert Queue + Alert Detail (response + Anomaly Triage).
 *   - Agent Approval Queue (Session 10) — the request queue, vigil-approval-agent brief,
 *     and human-gated Approve/Reject/Escalate decisions.
 *
 * Both surfaces run on injectable backings (Standing Constraint #3): the alert feed via
 * VIGIL_ALERT_ENDPOINT (null → configuration notice this session), the approval queue via
 * the synthetic/dev AgentApprovalPort. Expired approval requests are auto-rejected with an
 * AGENT_ACTION_EXPIRED system event on mount and may be re-checked as the operator works.
 *
 * Version: 2.0 (Agent Approval Flow) · Session 10 · June 23, 2026
 */

import { useEffect, useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { AlertQueue } from "./AlertQueue";
import { AlertDetail } from "./AlertDetail";
import { ApprovalQueue } from "./ApprovalQueue";
import { ApprovalDetail } from "./ApprovalDetail";
import { useAlertQueue } from "./useAlertQueue";
import { useApprovalQueue } from "./useApprovalQueue";
import { DEMO_ARIA_ALERTS } from "./aria-alert-routing";

export interface VigilAppProps {
  ctx: SovereignShellContext;
}

type Tab = "alerts" | "approvals";

export function VigilApp({ ctx }: VigilAppProps): JSX.Element {
  const operatorRole = "BOTH"; // reaching here means the gate passed (spec §3)
  const [tab, setTab] = useState<Tab>("alerts");

  // ARIA Suite CLEAR routes compliance violations and governance-calendar timing alerts to
  // the VIGIL Alert Queue (Session 23 · D5). Until the live Alert Dispatcher endpoint is
  // wired (Stage 2), they are seeded on the synthetic/dev backing — the sanctioned dev path
  // (useAlertQueue.initialAlerts), the same pattern as the synthetic approval port.
  const alerts = useAlertQueue(ctx, { initialAlerts: DEMO_ARIA_ALERTS });
  const approvals = useApprovalQueue(ctx);

  // Auto-reject any already-overdue approval requests on mount (AGENT_ACTION_EXPIRED).
  useEffect(() => {
    approvals.expireOverdue(Date.now());
    // run once on mount; expireOverdue is keyed on the initial request set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>VIGIL</h1>
        <p style={subtitleStyle}>Agent &amp; Security Operator Dashboard · Companion Suite</p>
      </header>

      <div style={bannerStyle}>
        Alert response (vigil-triage-analyst, PR-VIGIL-001) and Agent Approval
        (vigil-approval-agent, PR-VIGIL-002) are both wired. ARIA Suite CLEAR routes
        compliance and governance-calendar alerts into the Alert Queue (source ARIA). The
        live alert feed and the live AgentOS approval port activate by configuration; this
        session all run on synthetic/dev backings. Operator: <strong>{ctx.auth.user.name}</strong> · scope{" "}
        <strong>{operatorRole}</strong>.
      </div>

      {/* ---- Command Center summary ---- */}
      <div style={summaryRowStyle} aria-label="Command Center summary">
        <SummaryCard
          label="Unacknowledged alerts"
          value={alerts.configured ? String(alerts.unacknowledgedCount) : "—"}
          note={alerts.configured ? (alerts.hasUnacknowledgedP1 ? "includes an unacknowledged P1" : "live") : "endpoint not configured"}
        />
        <SummaryCard
          label="Pending approvals"
          value={String(approvals.pendingCount)}
          note={approvals.hasPendingP1 ? "includes a P1 request" : "synthetic/dev port"}
        />
        <SummaryCard label="Pipeline health" value="—" note="wired in a later session" />
      </div>

      {/* ---- Tabs ---- */}
      <nav style={tabBarStyle} aria-label="VIGIL surfaces">
        <TabButton id="alerts" label="Alert Queue" active={tab === "alerts"} onClick={setTab} />
        <TabButton id="approvals" label="Agent Approval Queue" active={tab === "approvals"} onClick={setTab} />
      </nav>

      {alerts.ingestError && (
        <p role="alert" style={errorStyle}>
          {alerts.ingestError}
        </p>
      )}
      {approvals.expireError && (
        <p role="alert" style={errorStyle}>
          {approvals.expireError}
        </p>
      )}

      {tab === "alerts" ? (
        <div style={stackStyle}>
          <AlertQueue alerts={alerts.alerts} configured={alerts.configured} selectedId={alerts.selectedId} onSelect={alerts.select} />
          {alerts.selected ? (
            <AlertDetail ctx={ctx} alert={alerts.selected} applyResponse={alerts.applyResponse} onClose={() => alerts.select(null)} />
          ) : (
            alerts.alerts.length > 0 && <p style={hintStyle}>Select an alert to view its detail, triage it, and record a response.</p>
          )}
        </div>
      ) : (
        <div style={stackStyle}>
          <ApprovalQueue requests={approvals.requests} selectedId={approvals.selectedId} onSelect={approvals.select} />
          {approvals.selected ? (
            <ApprovalDetail ctx={ctx} request={approvals.selected} onDecided={approvals.remove} />
          ) : (
            approvals.requests.length > 0 && <p style={hintStyle}>Select a request to review its brief and record a decision.</p>
          )}
        </div>
      )}
    </section>
  );
}

function TabButton({ id, label, active, onClick }: { id: Tab; label: string; active: boolean; onClick: (t: Tab) => void }): JSX.Element {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onClick(id)}
      style={{ ...tabStyle, color: active ? "#0f172a" : "#475569", borderBottom: active ? "2px solid #0f172a" : "2px solid transparent", fontWeight: active ? 700 : 500 }}
    >
      {label}
    </button>
  );
}

function SummaryCard({ label, value, note }: { label: string; value: string; note: string }): JSX.Element {
  return (
    <div style={cardStyle}>
      <span style={cardValueStyle}>{value}</span>
      <span style={cardLabelStyle}>{label}</span>
      <span style={cardNoteStyle}>{note}</span>
    </div>
  );
}

// ============================================================
// STYLES (inline — consistent with the shell chrome / other modules)
// ============================================================

const rootStyle: CSSProperties = {
  fontFamily: "system-ui, sans-serif", padding: 32, color: "#0f172a", height: "100%",
  boxSizing: "border-box", overflow: "auto",
};
const headerStyle: CSSProperties = { marginBottom: 16 };
const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 22 };
const subtitleStyle: CSSProperties = { margin: 0, color: "#475569" };
const bannerStyle: CSSProperties = {
  padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8,
  color: "#1e40af", fontSize: 13, marginBottom: 16, maxWidth: 720,
};
const summaryRowStyle: CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16, maxWidth: 720 };
const cardStyle: CSSProperties = {
  display: "flex", flexDirection: "column", gap: 2, padding: 12, borderRadius: 10,
  border: "1px solid #e2e8f0", background: "#f8fafc", minWidth: 160,
};
const cardValueStyle: CSSProperties = { fontSize: 22, fontWeight: 700, color: "#0c4a6e" };
const cardLabelStyle: CSSProperties = { fontSize: 13, color: "#334155" };
const cardNoteStyle: CSSProperties = { fontSize: 11, color: "#475569" };
const tabBarStyle: CSSProperties = { display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", marginBottom: 16 };
const tabStyle: CSSProperties = { padding: "8px 14px", fontSize: 14, background: "none", border: "none", cursor: "pointer" };
const stackStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const hintStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#64748b" };
const errorStyle: CSSProperties = {
  margin: "0 0 12px", padding: "8px 10px", borderRadius: 8, background: "#fef2f2",
  border: "1px solid #fecaca", color: "#991b1b", fontSize: 12, maxWidth: 720,
};

export default VigilApp;
