/**
 * SOVEREIGN Platform — module-apex
 * ProvenancePanel.tsx — the DC-3 data-provenance drill-down (generic by entity type).
 *
 * A reviewer cannot defend a finding they cannot trace (spec §4 DC-3). This panel renders the
 * five provenance fields — source data, baseline, date last updated, trend, responsible party —
 * for ANY figure or flag. It is deliberately generic: it renders from a ProvenanceRecord keyed
 * by `entity_type`, NOT hardcoded to World Model field names (spec §17.4 forward-compatibility).
 * When PPBE adds ObligationRecord / EvaluationFinding provenance, the same panel renders them.
 *
 * Plain-language field labels (Gap 5): "Source record", "Date last updated" — not "src_ref".
 *
 * Version: 1.0 · Session 17 · June 25, 2026
 */

import type { CSSProperties } from "react";

import type { ProvenanceRecord, ProvenanceTrend } from "./apex-contract";

export interface ProvenancePanelProps {
  record: ProvenanceRecord;
  onClose: () => void;
}

function trendText(t: ProvenanceTrend): string {
  if (t === "IMPROVING") return "Improving over time";
  if (t === "DEGRADING") return "Degrading over time";
  if (t === "STABLE") return "Stable over time";
  return "Trend not yet established";
}

export function ProvenancePanel({ record, onClose }: ProvenancePanelProps): JSX.Element {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Source record", value: record.source_data },
    { label: "Baseline (expected value)", value: record.baseline },
    { label: "Current actual", value: record.current_actual_value },
    { label: "Variance from plan", value: record.variance_from_baseline },
    { label: "Date last updated", value: record.last_updated },
    { label: "Trend over time", value: trendText(record.trend) },
    { label: "Responsible party", value: record.responsible_party },
  ];

  return (
    <aside aria-label="Data provenance" style={panelStyle} data-category="3-content">
      <div style={panelHeaderStyle}>
        <div>
          <p style={kindStyle}>{record.entity_type}</p>
          <h3 style={headingStyle}>{record.field_label}</h3>
        </div>
        <button type="button" onClick={onClose} style={closeBtnStyle} aria-label="Close provenance panel">
          Close
        </button>
      </div>
      <dl style={dlStyle}>
        {rows.map((r) => (
          <div key={r.label} style={rowStyle}>
            <dt style={dtStyle}>{r.label}</dt>
            <dd style={ddStyle}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

const panelStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  background: "#f8fafc",
  padding: 16,
  maxWidth: 520,
  boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
};
const panelHeaderStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 };
const kindStyle: CSSProperties = { margin: 0, fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: 0.4 };
const headingStyle: CSSProperties = { margin: "2px 0 0", fontSize: 16, color: "#0f172a" };
const closeBtnStyle: CSSProperties = { padding: "4px 12px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", color: "#334155", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const dlStyle: CSSProperties = { margin: 0, display: "flex", flexDirection: "column", gap: 10 };
const rowStyle: CSSProperties = { display: "grid", gridTemplateColumns: "180px 1fr", gap: 12 };
const dtStyle: CSSProperties = { margin: 0, fontSize: 13, fontWeight: 600, color: "#334155" };
const ddStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#0f172a", lineHeight: 1.5 };

export default ProvenancePanel;
