/**
 * SOVEREIGN Platform — module-cpmi
 * WorldModelPanel.tsx — read-only world-model query surface (spec §4.2 / §7.1).
 *
 * Serves world-model program records through the injectable WorldModelPort (synthetic/dev
 * this session). READ-ONLY: world-model UPDATES are human-gated (decision_type
 * WORLD_MODEL_UPDATE) and are not enabled this session. Makes NO LLM call.
 *
 * Version: 1.0 · Session 11 · June 23, 2026
 */

import { useMemo, useState, type CSSProperties } from "react";

import { createDevWorldModelPort } from "./world-model-port";

export function WorldModelPanel(): JSX.Element {
  const port = useMemo(() => createDevWorldModelPort(), []);
  const programs = useMemo(() => port.listPrograms(), [port]);
  const [programId, setProgramId] = useState(programs[0] ?? "");
  const record = port.getProgramContext(programId);

  return (
    <section aria-label="World Model" style={wrapStyle}>
      <p style={leadStyle}>
        The world model is SOVEREIGN's authoritative program knowledge base. This surface is read-only —
        updates are human-gated (<code>WORLD_MODEL_UPDATE</code>) and not enabled this session. Synthetic/dev data.
      </p>

      <div style={rowStyle}>
        <label style={labelStyle} htmlFor="wm-program">Program</label>
        <select id="wm-program" style={selectStyle} value={programId} onChange={(e) => setProgramId(e.target.value)}>
          {programs.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {record ? (
        <dl style={cardStyle} aria-label={`World model ${record.program_id}`}>
          <Row label="Program" value={`${record.program_name} (${record.program_id})`} />
          <Row label="Status" value={record.status} />
          <Row label="Objectives" value={record.objectives.join("; ")} />
          <Row label="Flags" value={record.flags.join("; ")} />
          <Row label="Regulatory context" value={record.regulatory_context.join("; ")} />
          <Row label="Prior governance" value={record.prior_governance_records.join("; ")} />
        </dl>
      ) : (
        <p style={mutedStyle}>No world-model record for that program.</p>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div style={rowItemStyle}>
      <dt style={dtStyle}>{label}</dt>
      <dd style={ddStyle}>{value}</dd>
    </div>
  );
}

const wrapStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 };
const leadStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#475569" };
const rowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10 };
const labelStyle: CSSProperties = { fontSize: 13, color: "#334155" };
const selectStyle: CSSProperties = { padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 };
const cardStyle: CSSProperties = { margin: 0, padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff", display: "flex", flexDirection: "column", gap: 8 };
const rowItemStyle: CSSProperties = { display: "flex", gap: 10 };
const dtStyle: CSSProperties = { flex: "0 0 150px", fontSize: 12, fontWeight: 700, color: "#64748b" };
const ddStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#0f172a", lineHeight: 1.5 };
const mutedStyle: CSSProperties = { margin: 0, color: "#64748b", fontSize: 13 };

export default WorldModelPanel;
