/**
 * SOVEREIGN Platform — module-vigil
 * ApprovalQueue.tsx — the Agent Approval Queue surface (spec §4.1 / §4.3).
 *
 * Renders pending approval requests (sorted P1-first by useApprovalQueue), each
 * selectable to open its detail. Shows the risk badge, requesting agent, action type,
 * submission time, and expiry countdown (or an EXPIRED badge). Thin presenter — load /
 * sort / expiry live in useApprovalQueue. Empty state per spec §4.3.
 *
 * Version: 1.0 · Session 10 · June 23, 2026
 */

import type { CSSProperties } from "react";

import { minutesRemaining, type AgentApprovalRequest, type RiskClassification } from "./approval-contract";
import { formatIso } from "./vigil-types";

export interface ApprovalQueueProps {
  requests: AgentApprovalRequest[];
  selectedId: string | null;
  onSelect: (requestId: string) => void;
  /** Current time (ms) for the expiry countdown — injectable for deterministic tests. */
  nowMs?: number;
}

export function ApprovalQueue({ requests, selectedId, onSelect, nowMs }: ApprovalQueueProps): JSX.Element {
  const now = nowMs ?? Date.now();
  const hasRequests = requests.length > 0;

  return (
    <section style={panelStyle} aria-label="Actions Awaiting Your Approval">
      <h3 style={titleStyle}>Actions Awaiting Your Approval</h3>

      {hasRequests ? (
        <ul style={listStyle}>
          {requests.map((r) => (
            <RequestCard key={r.request_id} request={r} selected={r.request_id === selectedId} onSelect={onSelect} nowMs={now} />
          ))}
        </ul>
      ) : (
        <p style={emptyStyle}>No pending approvals — all agent actions are authorized or idle.</p>
      )}
    </section>
  );
}

function RequestCard({
  request,
  selected,
  onSelect,
  nowMs,
}: {
  request: AgentApprovalRequest;
  selected: boolean;
  onSelect: (requestId: string) => void;
  nowMs: number;
}): JSX.Element {
  const remaining = minutesRemaining(request, nowMs);
  const expired = remaining < 0;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(request.request_id)}
        aria-pressed={selected}
        style={{ ...cardStyle, ...(selected ? cardSelectedStyle : null) }}
      >
        <span style={{ ...badgeStyle, ...riskBadgeStyle(request.risk_classification) }}>{request.risk_classification}</span>
        <span style={cardMainStyle}>
          <span style={cardTypeStyle}>
            {request.action_type}
            {expired && <span style={expiredBadgeStyle}>EXPIRED</span>}
          </span>
          <span style={cardMetaStyle}>
            {request.requesting_agent_id} · {formatIso(request.submitted_at)}
          </span>
          {actionContext(request) && (
            <span style={cardContextStyle}>{actionContext(request)}</span>
          )}
          <span style={cardExpiryStyle}>
            {expired ? "Expired — will be auto-rejected" : `Expires in ${remaining} min`}
          </span>
        </span>
      </button>
    </li>
  );
}

/** §2.1 Supervision Efficiency — surface key context from action_detail inline on the card. */
function actionContext(request: AgentApprovalRequest): string | null {
  const d = request.action_detail;
  switch (request.action_type) {
    case "ppbe_obligation": {
      const program = typeof d.program_id === "string" ? d.program_id : "—";
      const amount = typeof d.amount === "number" ? `$${d.amount.toLocaleString()}` : "—";
      return `Program ${program} · ${amount}`;
    }
    case "ppbe_phase_transition":
      return `Phase ${d.from_phase ?? "?"} → ${d.to_phase ?? "?"}`;
    case "model_deployment": {
      const model = typeof d.model === "string" ? d.model : null;
      const target = typeof d.target_product === "string" ? d.target_product : null;
      if (!model && !target) return null;
      return [model, target].filter(Boolean).join(" → ");
    }
    case "data_export": {
      const dataset = typeof d.dataset === "string" ? d.dataset : null;
      const dest = typeof d.destination === "string" ? d.destination : null;
      if (!dataset && !dest) return null;
      return [dataset, dest].filter(Boolean).join(" → ");
    }
    case "configuration_change": {
      const param = typeof d.parameter === "string" ? d.parameter : null;
      if (!param) return null;
      const from = d.from !== undefined ? String(d.from) : "?";
      const to = d.to !== undefined ? String(d.to) : "?";
      return `${param}: ${from} → ${to}`;
    }
    case "send_formal_escalation_notice": {
      const employee = typeof d.employee_id === "string" ? d.employee_id : null;
      const category = typeof d.rule_category === "string"
        ? d.rule_category.toLowerCase().replace(/_/g, " ") : null;
      if (!employee && !category) return null;
      return [employee, category].filter(Boolean).join(" · ");
    }
    default:
      return null;
  }
}

function riskBadgeStyle(risk: RiskClassification): CSSProperties {
  switch (risk) {
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
const listStyle: CSSProperties = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 };
const cardStyle: CSSProperties = {
  display: "flex", gap: 10, alignItems: "flex-start", width: "100%", textAlign: "left",
  padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer",
};
const cardSelectedStyle: CSSProperties = { borderColor: "#0c4a6e", background: "#e0f2fe" };
const cardMainStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 2 };
const cardTypeStyle: CSSProperties = { fontSize: 13, fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 };
const cardMetaStyle: CSSProperties = { fontSize: 12, color: "#64748b" };
const cardContextStyle: CSSProperties = { fontSize: 11, color: "#0c4a6e", fontWeight: 500 };
const cardExpiryStyle: CSSProperties = { fontSize: 11, color: "#475569" };
const badgeStyle: CSSProperties = {
  color: "#ffffff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, flexShrink: 0,
};
const expiredBadgeStyle: CSSProperties = {
  background: "#fee2e2", color: "#7f1d1d", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 999,
};
const emptyStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#475569" };

export default ApprovalQueue;
