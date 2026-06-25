/**
 * SOVEREIGN Platform — module-nexus
 * RequestQueuePanel.tsx — the work-request queue surface (list + lifecycle actions).
 *
 * Lists every request with its status and the action(s) available from that status:
 *   SUBMITTED → Route · ROUTED → Send for Approval (approval types) or Start (no-approval)
 *   PENDING_APPROVAL → Approve / Reject · IN_PROGRESS → Complete. Selecting a row shows its
 *   detail (RequestDetailPanel), including the AgentOS task hand-off status.
 *
 * Version: 1.0 · Session 15 · June 24, 2026
 */

import { type CSSProperties, type MouseEvent } from "react";

import type { WorkRequest, WorkRequestStatus } from "./nexus-contract";
import type { UseRequestRegistry } from "./useRequestRegistry";
import type { AgentOSPort } from "./agentos-port";
import { RequestDetailPanel } from "./RequestDetailPanel";

export interface RequestQueuePanelProps {
  registry: UseRequestRegistry;
  port: AgentOSPort;
  selectedId: string | null;
  onSelect: (requestId: string) => void;
}

export function RequestQueuePanel({ registry, port, selectedId, onSelect }: RequestQueuePanelProps): JSX.Element {
  const selected = selectedId ? registry.requests.find((r) => r.request_id === selectedId) ?? null : null;

  return (
    <section aria-label="Request Queue" style={wrapStyle}>
      {registry.error ? <p role="alert" style={errorStyle}>{registry.error}</p> : null}

      {registry.requests.length === 0 ? (
        <p style={emptyStyle}>No requests yet. Submit one on the Request Intake tab.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Request</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Agent class</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registry.requests.map((req) => (
              <tr key={req.request_id} onClick={() => onSelect(req.request_id)} style={req.request_id === selectedId ? selectedRowStyle : rowStyle}>
                <td style={tdStyle}><strong>{req.request_id}</strong> — {req.title}</td>
                <td style={tdStyle}>{req.request_type}</td>
                <td style={tdStyle}><span style={badgeStyle(req.status)}>{req.status}</span></td>
                <td style={tdStyle}>{req.assigned_agent_class ?? "—"}</td>
                <td style={tdStyle}>{renderActions(req, registry)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected ? <RequestDetailPanel request={selected} port={port} /> : null}
    </section>
  );
}

function renderActions(req: WorkRequest, registry: UseRequestRegistry): JSX.Element | null {
  const stop = (fn: () => void) => (e: MouseEvent) => { e.stopPropagation(); fn(); };
  switch (req.status) {
    case "SUBMITTED":
      return <button type="button" onClick={stop(() => registry.route(req.request_id))} style={actionBtn}>Route</button>;
    case "ROUTED":
      return req.requires_approval ? (
        <button type="button" onClick={stop(() => registry.sendForApproval(req.request_id))} style={actionBtn}>Send for Approval</button>
      ) : (
        <button type="button" onClick={stop(() => registry.startWork(req.request_id))} style={actionBtn}>Start</button>
      );
    case "PENDING_APPROVAL":
      return (
        <span style={btnGroup}>
          <button type="button" onClick={stop(() => registry.approveAndStart(req.request_id))} style={approveBtn}>Approve</button>
          <button type="button" onClick={stop(() => registry.reject(req.request_id))} style={rejectBtn}>Reject</button>
        </span>
      );
    case "IN_PROGRESS":
      return <button type="button" onClick={stop(() => registry.complete(req.request_id))} style={actionBtn}>Complete</button>;
    default:
      return null;
  }
}

function badgeColors(status: WorkRequestStatus): { color: string; background: string } {
  if (status === "COMPLETE") return { color: "#065f46", background: "#d1fae5" };
  if (status === "REJECTED") return { color: "#b91c1c", background: "#fee2e2" };
  if (status === "IN_PROGRESS") return { color: "#1e40af", background: "#dbeafe" };
  return { color: "#475569", background: "#e2e8f0" };
}

const wrapStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 14, maxWidth: 900 };
const tableStyle: CSSProperties = { borderCollapse: "collapse", width: "100%", fontSize: 13 };
const thStyle: CSSProperties = { textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 600 };
const tdStyle: CSSProperties = { padding: "6px 8px", borderBottom: "1px solid #f1f5f9" };
const rowStyle: CSSProperties = { cursor: "pointer" };
const selectedRowStyle: CSSProperties = { cursor: "pointer", background: "#f1f5f9" };
const emptyStyle: CSSProperties = { margin: 0, color: "#64748b", fontSize: 13 };
const errorStyle: CSSProperties = { margin: 0, color: "#b91c1c", fontSize: 13, fontWeight: 600 };
const btnGroup: CSSProperties = { display: "flex", gap: 6 };
const actionBtn: CSSProperties = { padding: "3px 12px", borderRadius: 6, border: "1px solid #0c4a6e", background: "#0c4a6e", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const approveBtn: CSSProperties = { padding: "3px 12px", borderRadius: 6, border: "1px solid #047857", background: "#fff", color: "#047857", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const rejectBtn: CSSProperties = { padding: "3px 12px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fff", color: "#b91c1c", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const badgeStyle = (status: WorkRequestStatus): CSSProperties => {
  const { color, background } = badgeColors(status);
  return { display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, color, background };
};

export default RequestQueuePanel;
