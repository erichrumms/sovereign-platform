/**
 * SOVEREIGN Platform — module-nexus
 * RequestDetailPanel.tsx — the selected work-request detail surface.
 *
 * Shows the full request record and, once NEXUS has handed execution to AgentOS, the
 * AgentOS task id and its current TaskStatus (read through the injectable AgentOSPort —
 * the NEXUS → AgentOS hand-off). Read-only.
 *
 * Version: 1.0 · Session 15 · June 24, 2026
 */

import { type CSSProperties } from "react";

import type { WorkRequest } from "./nexus-contract";
import type { AgentOSPort } from "./agentos-port";

export interface RequestDetailPanelProps {
  request: WorkRequest;
  port: AgentOSPort;
}

export function RequestDetailPanel({ request, port }: RequestDetailPanelProps): JSX.Element {
  const agentosStatus = request.agentos_task_id ? port.getTaskStatus(request.agentos_task_id) : null;

  return (
    <section aria-label="Request Detail" style={wrapStyle}>
      <h2 style={h2Style}>Detail — {request.request_id}</h2>
      <dl style={dlStyle}>
        <Row label="Title" value={request.title} />
        <Row label="Type" value={request.request_type} />
        <Row label="Status" value={request.status} />
        <Row label="Classification" value={request.data_classification} />
        <Row label="Requester" value={request.requester_id} />
        <Row label="Agent class" value={request.assigned_agent_class ?? "— (not routed)"} />
        <Row label="Requires approval" value={request.requires_approval === undefined ? "— (not routed)" : request.requires_approval ? "yes" : "no"} />
        <Row label="Workflow step" value={request.workflow_step_id} />
        <Row label="AgentOS task" value={request.agentos_task_id ?? "— (not handed off)"} />
        <Row label="AgentOS task status" value={agentosStatus ?? "—"} />
      </dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <>
      <dt style={dtStyle}>{label}</dt>
      <dd style={ddStyle}>{value}</dd>
    </>
  );
}

const wrapStyle: CSSProperties = { padding: "12px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, maxWidth: 560 };
const h2Style: CSSProperties = { margin: "0 0 8px", fontSize: 14, color: "#0f172a" };
const dlStyle: CSSProperties = { display: "grid", gridTemplateColumns: "160px 1fr", gap: "4px 12px", margin: 0, fontSize: 13 };
const dtStyle: CSSProperties = { color: "#64748b" };
const ddStyle: CSSProperties = { margin: 0, color: "#0f172a" };

export default RequestDetailPanel;
