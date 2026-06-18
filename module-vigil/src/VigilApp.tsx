/**
 * SOVEREIGN Platform — module-vigil
 * VigilApp.tsx — VIGIL composition root (React).
 *
 * The single React component the module mounts (via index.ts → createRoot) into the
 * shell-provided outlet, AFTER the structural role gate in index.ts has admitted the
 * operator. It renders the VIGIL chrome (CommandCenter summary), the wired Alert Queue
 * + Alert Detail (response actions + Anomaly Triage Assistant — D1, Session 7), and the
 * Agent Approval Queue STUB (A2A pre-IMPLEMENTED; the approval decision flow and
 * vigil-approval-agent are a later session).
 *
 * The Alert Queue is wired with graceful null handling: VIGIL_ALERT_ENDPOINT is null
 * this session, so the queue shows the configuration notice (empty ≠ secure) and the
 * live feed activates by configuration in the Security Framework live-wiring session —
 * no VIGIL rewrite (Standing Constraint #3). The ingestion, triage, and response
 * machinery is real and test-covered; it becomes operator-visible once an alert flows.
 *
 * Presentation reads the context; it never re-derives it. Reaching VigilApp at all
 * means the role gate passed — operatorRole is BOTH for PLATFORM_ADMIN / SYSTEM_ADMIN
 * (spec §3); it updates when the operator roles are formally separated.
 *
 * Version: 1.1 (core D1) · Session 7 · June 18, 2026
 */

import type { CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { AlertQueue } from "./AlertQueue";
import { AlertDetail } from "./AlertDetail";
import { AgentApprovalQueue } from "./AgentApprovalQueue";
import { useAlertQueue } from "./useAlertQueue";

export interface VigilAppProps {
  ctx: SovereignShellContext;
}

export function VigilApp({ ctx }: VigilAppProps): JSX.Element {
  // Reaching here means the gate passed → both operator scopes (spec §3).
  const operatorRole = "BOTH";
  const queue = useAlertQueue(ctx);

  return (
    <section style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>VIGIL</h1>
        <p style={subtitleStyle}>Agent &amp; Security Operator Dashboard · Companion Suite</p>
      </header>

      <div style={bannerStyle}>
        Security-alert response is wired — Alert Queue, Anomaly Triage Assistant (vigil-triage-analyst,
        PR-VIGIL-001), and human-gated response actions. The live alert feed activates when
        <code> VIGIL_ALERT_ENDPOINT</code> is configured (Security Framework live-wiring session); the Agent
        Approval Queue remains a stub until A2A is IMPLEMENTED. Operator:{" "}
        <strong>{ctx.auth.user.name}</strong> · scope <strong>{operatorRole}</strong>.
      </div>

      {/* ---- Command Center summary ---- */}
      <div style={summaryRowStyle} aria-label="Command Center summary">
        <SummaryCard
          label="Unacknowledged alerts"
          value={queue.configured ? String(queue.unacknowledgedCount) : "—"}
          note={queue.configured ? (queue.hasUnacknowledgedP1 ? "includes an unacknowledged P1" : "live") : "endpoint not configured"}
        />
        <SummaryCard label="Pending approvals" value="—" note="A2A pre-IMPLEMENTED" />
        <SummaryCard label="Pipeline health" value="—" note="wired in a later session" />
      </div>

      {queue.ingestError && (
        <p role="alert" style={ingestErrorStyle}>
          {queue.ingestError}
        </p>
      )}

      <div style={stackStyle}>
        <AlertQueue
          alerts={queue.alerts}
          configured={queue.configured}
          selectedId={queue.selectedId}
          onSelect={queue.select}
        />

        {queue.selected ? (
          <AlertDetail
            ctx={ctx}
            alert={queue.selected}
            applyResponse={queue.applyResponse}
            onClose={() => queue.select(null)}
          />
        ) : (
          queue.alerts.length > 0 && (
            <p style={hintStyle}>Select an alert to view its detail, triage it, and record a response.</p>
          )
        )}

        <AgentApprovalQueue a2aStage={ctx.a2a._stage} />
      </div>
    </section>
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
const cardNoteStyle: CSSProperties = { fontSize: 11, color: "#94a3b8" };
const stackStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const hintStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#64748b" };
const ingestErrorStyle: CSSProperties = {
  margin: "0 0 12px", padding: "8px 10px", borderRadius: 8, background: "#fef2f2",
  border: "1px solid #fecaca", color: "#991b1b", fontSize: 12, maxWidth: 720,
};

export default VigilApp;
