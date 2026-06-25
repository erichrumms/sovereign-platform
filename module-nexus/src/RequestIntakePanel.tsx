/**
 * SOVEREIGN Platform — module-nexus
 * RequestIntakePanel.tsx — the work-request intake surface.
 *
 * Collects a title, a work-request type (one of five), and a data classification
 * (ClearanceLevel — Constraint #2), then submits the request. GD-10 is enforced in the
 * registry at intake; a non-UNCLASSIFIED request is refused and the boundary message is
 * shown here. The routing table is displayed so the operator sees which agent class and
 * approval requirement each type carries.
 *
 * Version: 1.0 · Session 15 · June 24, 2026
 */

import { useState, type CSSProperties } from "react";

import { CLEARANCE_LEVELS } from "@sovereign/data";
import type { ClearanceLevel } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { WORK_REQUEST_TYPES, type WorkRequestType } from "./nexus-contract";
import { routingTable } from "./request-router";
import type { UseRequestRegistry } from "./useRequestRegistry";

export interface RequestIntakePanelProps {
  registry: UseRequestRegistry;
  ctx: SovereignShellContext;
}

export function RequestIntakePanel({ registry, ctx }: RequestIntakePanelProps): JSX.Element {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<WorkRequestType>("DOCUMENT_REVIEW");
  const [classification, setClassification] = useState<ClearanceLevel>("UNCLASSIFIED");

  const table = routingTable();

  const onSubmit = (): void => {
    const trimmed = title.trim();
    if (trimmed === "") return;
    const nextId = `req-${registry.requests.length + 1}`;
    registry.submit({
      request_id: nextId,
      title: trimmed,
      description: `Synthetic NEXUS work request: ${trimmed}`,
      request_type: type,
      data_classification: classification,
      requester_id: ctx.auth.user.employee_id,
    });
    setTitle("");
  };

  return (
    <section aria-label="Request Intake" style={wrapStyle}>
      <div style={formStyle}>
        <input
          aria-label="request title"
          placeholder="New work-request title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
        <select aria-label="request type" value={type} onChange={(e) => setType(e.target.value as WorkRequestType)} style={selectStyle}>
          {WORK_REQUEST_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select aria-label="data classification" value={classification} onChange={(e) => setClassification(e.target.value as ClearanceLevel)} style={selectStyle}>
          {CLEARANCE_LEVELS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="button" onClick={onSubmit} style={submitBtnStyle}>Submit Request</button>
      </div>

      {registry.error ? <p role="alert" style={errorStyle}>{registry.error}</p> : null}

      <div>
        <h2 style={h2Style}>Routing table</h2>
        <table style={tableStyle}>
          <thead>
            <tr><th style={thStyle}>Request type</th><th style={thStyle}>Agent class</th><th style={thStyle}>Approval</th></tr>
          </thead>
          <tbody>
            {WORK_REQUEST_TYPES.map((t) => (
              <tr key={t}>
                <td style={tdStyle}>{t}</td>
                <td style={tdStyle}>{table[t].agent_class}</td>
                <td style={tdStyle}>{table[t].requires_approval ? "requires approval" : "no approval"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const wrapStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 14, maxWidth: 720 };
const formStyle: CSSProperties = { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" };
const inputStyle: CSSProperties = { padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, minWidth: 220 };
const selectStyle: CSSProperties = { padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 };
const submitBtnStyle: CSSProperties = { padding: "6px 14px", borderRadius: 6, border: "1px solid #0c4a6e", background: "#0c4a6e", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const errorStyle: CSSProperties = { margin: 0, color: "#b91c1c", fontSize: 13, fontWeight: 600 };
const h2Style: CSSProperties = { margin: "0 0 6px", fontSize: 14, color: "#0f172a" };
const tableStyle: CSSProperties = { borderCollapse: "collapse", width: "100%", fontSize: 12 };
const thStyle: CSSProperties = { textAlign: "left", padding: "5px 8px", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 600 };
const tdStyle: CSSProperties = { padding: "5px 8px", borderBottom: "1px solid #f1f5f9" };

export default RequestIntakePanel;
