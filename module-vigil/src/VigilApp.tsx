/**
 * SOVEREIGN Platform — module-vigil
 * VigilApp.tsx — VIGIL composition root (React) — scaffold.
 *
 * The single React component the module mounts (via index.ts → createRoot) into the
 * shell-provided outlet, AFTER the structural role gate in index.ts has admitted the
 * operator. It renders the VIGIL chrome (CommandCenter summary) and the two D3
 * stubs: the Alert Queue (null-endpoint configuration notice) and the Agent Approval
 * Queue (A2A stage indicator). The full operator surface — Alert Detail, Anomaly
 * Triage Assistant, Approval Decision, Pipeline Health, Agent Registry, Audit Trail
 * — is built across later sessions (spec §8).
 *
 * Presentation reads the context; it never re-derives it. Reaching VigilApp at all
 * means the role gate passed — operatorRole is BOTH for PLATFORM_ADMIN / SYSTEM_ADMIN
 * (spec §3); it updates when the operator roles are formally separated.
 *
 * Version: 1.0 (scaffold) · Session 6 · June 17, 2026
 */

import type { CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { VIGIL_ALERT_ENDPOINT } from "./config";
import { AlertQueue } from "./AlertQueue";
import { AgentApprovalQueue } from "./AgentApprovalQueue";

export interface VigilAppProps {
  ctx: SovereignShellContext;
}

export function VigilApp({ ctx }: VigilAppProps): JSX.Element {
  // Reaching here means the gate passed → both operator scopes (spec §3).
  const operatorRole = "BOTH";

  return (
    <section style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>VIGIL</h1>
        <p style={subtitleStyle}>Agent &amp; Security Operator Dashboard · Companion Suite</p>
      </header>

      <div style={bannerStyle}>
        Scaffold — the role gate, command center, and the Alert / Agent-Approval queue stubs are wired.
        Live alert ingestion, the Anomaly Triage Assistant, and the approval decision flow arrive in later
        sessions. Operator: <strong>{ctx.auth.user.name}</strong> · scope <strong>{operatorRole}</strong>.
      </div>

      {/* ---- Command Center summary (static counts for the scaffold) ---- */}
      <div style={summaryRowStyle} aria-label="Command Center summary">
        <SummaryCard label="Unacknowledged alerts" value="—" note="endpoint not configured" />
        <SummaryCard label="Pending approvals" value="—" note="A2A pre-IMPLEMENTED" />
        <SummaryCard label="Pipeline health" value="—" note="wired in a later session" />
      </div>

      <div style={stackStyle}>
        <AlertQueue endpoint={VIGIL_ALERT_ENDPOINT} />
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
  padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8,
  color: "#92400e", fontSize: 13, marginBottom: 16, maxWidth: 720,
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

export default VigilApp;
