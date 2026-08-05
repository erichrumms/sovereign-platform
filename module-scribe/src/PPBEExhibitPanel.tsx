/**
 * SOVEREIGN Platform — module-scribe
 * PPBEExhibitPanel.tsx — clickable trigger for the SCRIBE-hosted PPBE
 * exhibit drafting agent (ppbe-exhibit-drafter).
 *
 * Part 2 (Session 38 Walkthrough F fix): the agent existed but had zero
 * call sites outside its own definition file. This panel wires it to a
 * real, clickable UI trigger on a new "PPBE Exhibits" surface in SCRIBE.
 *
 * Output is advisory — every draft feeds review, and export requires both
 * a CLEAR certification and human sign-off (ppbe-exhibit-contract.ts).
 * This panel has no export path.
 *
 * All LLM access via createSovereignClient() (Constraint #5). Prompt loaded
 * at build time from ppbe/prompts/exhibit_drafting_system.md (APPROVED v1.0).
 * Static fallback is expected in dev (no API key).
 *
 * Version: 1.0 · Session 38 · July 16, 2026
 */

import { useState, type CSSProperties, type JSX } from "react";

import { SYNTH_PPBE_PROGRAMS, SYNTH_PPBE_OBLIGATIONS, SYNTH_PPBE_FINDINGS } from "@sovereign/data";
import type { ObligationRecord } from "@sovereign/data";
import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { formatCurrency } from "../../sovereign-shell/src/format-currency";

import {
  type ExhibitDraftInput,
} from "./ppbe-exhibit-engine";
import {
  PPBE_DOCUMENT_MODES,
  PPBE_DOCUMENT_MODE_NAMES,
  type PPBEDocumentMode,
} from "./ppbe-exhibit-contract";
import { usePPBEExhibitDraft } from "./usePPBEExhibitDraft";

// ─── Cost-code aggregation (D2b — WH-15) ────────────────────────────────────

function aggregateByCostCode(
  obligations: readonly ObligationRecord[]
): Array<{ code: string; total: number }> {
  const map = new Map<string, number>();
  for (const o of obligations) {
    map.set(o.cost_code, (map.get(o.cost_code) ?? 0) + o.amount);
  }
  return Array.from(map.entries())
    .map(([code, total]) => ({ code, total }))
    .sort((a, b) => b.total - a.total);
}

function CostCodeBarChart({
  data,
}: {
  data: ReadonlyArray<{ code: string; total: number }>;
}): JSX.Element {
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const labelW = 60;
  const barAreaW = 220;
  const valueW = 80;
  const rowH = 26;
  const barH = 16;
  const padTop = 8;
  const svgW = labelW + barAreaW + valueW;
  const svgH = padTop + data.length * rowH;

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width="100%"
      style={{ maxWidth: svgW, display: "block" }}
      aria-label="Obligations by cost code bar chart"
      role="img"
    >
      {data.map(({ code, total }, i) => {
        const barW = Math.max((total / maxVal) * barAreaW, 2);
        const y = padTop + i * rowH;
        return (
          <g key={code}>
            <text
              x={labelW - 4}
              y={y + barH * 0.72}
              textAnchor="end"
              fontSize={10}
              fill="#475569"
              fontFamily="system-ui, sans-serif"
            >
              {code}
            </text>
            <rect
              x={labelW}
              y={y}
              width={barW}
              height={barH}
              rx={2}
              fill="#0c4a6e"
              fillOpacity={0.72}
            />
            <text
              x={labelW + barW + 4}
              y={y + barH * 0.72}
              fontSize={10}
              fill="#334155"
              fontFamily="system-ui, sans-serif"
            >
              {formatCurrency(total)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Use the ALPHA FY2027 record as the demonstration target (Budget Year — forward-facing).
const DEMO_PROGRAM = SYNTH_PPBE_PROGRAMS.find(
  (p) => p.program_id === 'SYNTH-PRG-ALPHA' && p.fiscal_year === 'FY 2027'
) ?? SYNTH_PPBE_PROGRAMS[0];
const DEMO_OBLIGATIONS = SYNTH_PPBE_OBLIGATIONS.filter(
  (o) => o.program_id === DEMO_PROGRAM?.program_id
);
const DEMO_FINDINGS = SYNTH_PPBE_FINDINGS.filter(
  (f) => f.program_id === DEMO_PROGRAM?.program_id
);

export interface PPBEExhibitPanelProps {
  ctx: SovereignShellContext;
}

export function PPBEExhibitPanel({ ctx }: PPBEExhibitPanelProps): JSX.Element {
  const [mode, setMode] = useState<PPBEDocumentMode>("BUDGET_EXHIBIT");
  const { status, outcome, error, run } = usePPBEExhibitDraft(ctx);

  if (!DEMO_PROGRAM) {
    return <p style={mutedStyle}>No seeded PPBE programs available.</p>;
  }

  function runDraft(): void {
    const input: ExhibitDraftInput = {
      mode,
      program: DEMO_PROGRAM,
      obligations: DEMO_OBLIGATIONS,
      findings: mode === "EVALUATION_REPORT" ? DEMO_FINDINGS : [],
    };
    void run(input);
  }

  return (
    <section style={sectionStyle} aria-label="PPBE Exhibit Drafting">
      <h2 style={headingStyle}>PPBE Exhibit Drafting</h2>
      <p style={noteStyle}>
        ppbe-exhibit-drafter (Operational, LLM-backed). Drafts PPBE budget exhibits from
        governed records. Static fallback expected in dev — no API key. Export requires CLEAR
        certification and human sign-off (this panel has no export path).
      </p>

      <div style={controlRowStyle}>
        <label style={labelStyle} htmlFor="ppbe-exhibit-mode">Document mode</label>
        <select
          id="ppbe-exhibit-mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as PPBEDocumentMode)}
          style={selectStyle}
          data-testid="ppbe-exhibit-mode-select"
        >
          {PPBE_DOCUMENT_MODES.map((m) => (
            <option key={m} value={m}>{PPBE_DOCUMENT_MODE_NAMES[m]}</option>
          ))}
        </select>
        <button
          type="button"
          style={status === "running" ? btnDisabledStyle : btnStyle}
          disabled={status === "running"}
          onClick={() => void runDraft()}
          data-testid="ppbe-run-exhibit-draft"
        >
          {status === "running" ? "Drafting…" : "Draft Exhibit"}
        </button>
      </div>

      <p style={contextStyle}>
        Program: <strong>{DEMO_PROGRAM.name}</strong> ({DEMO_PROGRAM.fiscal_year}) ·{" "}
        {DEMO_OBLIGATIONS.length} obligation{DEMO_OBLIGATIONS.length !== 1 ? "s" : ""} ·{" "}
        {DEMO_FINDINGS.length} finding{DEMO_FINDINGS.length !== 1 ? "s" : ""}
      </p>

      {error && <p style={errorStyle}>{error}</p>}

      {outcome && (
        <div style={outputStyle} data-testid="ppbe-exhibit-draft-output">
          <div style={tierRowStyle}>
            <span style={tierBadgeStyle(outcome.tier)}>{outcome.tier.toUpperCase()}</span>
            {outcome.tier === "static" && (
              <span style={staticNoteStyle}>
                Static tier — LLM unavailable in dev. Output built from governed records; not generated.
              </span>
            )}
          </div>
          <h4 style={outputTitleStyle}>{outcome.draft.title}</h4>
          <p style={outputBodyStyle}>{outcome.draft.narrative}</p>
          {outcome.draft.figures.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong style={{ fontSize: 12 }}>Figures</strong>
              <table style={figureTableStyle} aria-label="Exhibit figures">
                <thead>
                  <tr>
                    <th style={figThStyle}>Label</th>
                    <th style={{ ...figThStyle, textAlign: "right" }}>Value</th>
                    <th style={figThStyle}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {outcome.draft.figures.map((fig, i) => (
                    <tr key={i}>
                      <td style={figTdStyle}>{fig.label}</td>
                      <td style={{ ...figTdStyle, textAlign: "right" }}>
                        {formatCurrency(fig.value)}
                      </td>
                      <td style={{ ...figTdStyle, ...sourceStyle }}>
                        {fig.source_workflow_step_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {DEMO_OBLIGATIONS.length > 0 && (() => {
            const costCodeData = aggregateByCostCode(DEMO_OBLIGATIONS);
            return (
              <div style={{ marginTop: 12 }}>
                <strong style={{ fontSize: 12 }}>Obligations by cost code</strong>
                <div style={{ marginTop: 6 }}>
                  <CostCodeBarChart data={costCodeData} />
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </section>
  );
}

const sectionStyle: CSSProperties = { padding: "14px 16px", maxWidth: 760 };
const headingStyle: CSSProperties = { margin: "0 0 4px", fontSize: 15, fontWeight: 700 };
const noteStyle: CSSProperties = { margin: "0 0 12px", fontSize: 12, color: "#475569" };
const controlRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 };
const labelStyle: CSSProperties = { fontSize: 12, color: "#475569", whiteSpace: "nowrap" };
const selectStyle: CSSProperties = { fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1" };
const contextStyle: CSSProperties = { margin: "0 0 12px", fontSize: 12, color: "#64748b" };
const outputStyle: CSSProperties = {
  padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc",
};
const tierRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 };
const outputTitleStyle: CSSProperties = { margin: "0 0 6px", fontSize: 14, fontWeight: 600 };
const outputBodyStyle: CSSProperties = { margin: "0 0 8px", fontSize: 12, color: "#334155" };
const sourceStyle: CSSProperties = { fontSize: 11, color: "#94a3b8" };
const figureTableStyle: CSSProperties = {
  borderCollapse: "collapse",
  width: "100%",
  fontSize: 12,
  marginTop: 4,
};
const figThStyle: CSSProperties = {
  padding: "4px 8px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  textAlign: "left",
  fontWeight: 600,
  color: "#0f172a",
  fontSize: 11,
};
const figTdStyle: CSSProperties = {
  padding: "4px 8px",
  borderBottom: "1px solid #f1f5f9",
  color: "#334155",
  fontSize: 12,
};
const mutedStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#64748b" };
const errorStyle: CSSProperties = { margin: "8px 0 0", padding: "6px 8px", background: "#fef2f2", borderRadius: 4, fontSize: 11, color: "#7f1d1d", border: "1px solid #fecaca" };
const btnStyle: CSSProperties = {
  padding: "6px 14px", borderRadius: 6, border: "1px solid #0c4a6e",
  background: "#0c4a6e", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600,
};
const btnDisabledStyle: CSSProperties = { ...btnStyle, background: "#e2e8f0", borderColor: "#cbd5e1", color: "#94a3b8", cursor: "not-allowed" };
const staticNoteStyle: CSSProperties = { fontSize: 11, color: "#7f1d1d" };

function tierBadgeStyle(tier: string): CSSProperties {
  if (tier === "live") return { fontSize: 10, fontWeight: 700, color: "#065f46", padding: "2px 6px", borderRadius: 999, background: "#d1fae5" };
  if (tier === "cache") return { fontSize: 10, fontWeight: 700, color: "#92400e", padding: "2px 6px", borderRadius: 999, background: "#fef3c7" };
  return { fontSize: 10, fontWeight: 700, color: "#7f1d1d", padding: "2px 6px", borderRadius: 999, background: "#fee2e2" };
}

export default PPBEExhibitPanel;
