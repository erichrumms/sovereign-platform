/**
 * SOVEREIGN Platform — module-apex
 * ProgramDetailView.tsx — APEX Screen 2 (spec §5 Screen 2, deliverable D-APEX-3).
 *
 * The per-program view: the full World Model record in plain prose (Gap 5), the risk register
 * where EVERY flag is clickable and opens the generic DC-3 ProvenancePanel (emitting
 * APEX_PROVENANCE_VIEWED), the reasoning-chain history in chronological order with each entry
 * expandable, the governance decisions, the AgentOS task history, and a prominent, always-
 * visible Export Dossier button.
 *
 * Version: 1.0 · Session 17 · June 25, 2026
 */

import { useMemo, useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { ApexDataAdapter } from "./apex-data-adapter";
import type { ProvenanceRecord } from "./apex-contract";
import { ProvenancePanel } from "./ProvenancePanel";
import {
  rootStyle,
  contentCardStyle,
  titleStyle,
  subtitleStyle,
  sectionHeadingStyle,
  bodyTextStyle,
  statusPillColors,
  statusLabelText,
} from "./banners";

export interface ProgramDetailViewProps {
  ctx: SovereignShellContext;
  adapter: ApexDataAdapter;
  programId: string;
  onExportDossier: (programId: string) => void;
  onBack: () => void;
}

export function ProgramDetailView({ ctx, adapter, programId, onExportDossier, onBack }: ProgramDetailViewProps): JSX.Element {
  const program = useMemo(() => adapter.getProgram(programId), [adapter, programId]);
  const reasoning = useMemo(() => adapter.getReasoningChainHistory(programId), [adapter, programId]);
  const decisions = useMemo(() => adapter.getGovernanceDecisions(programId), [adapter, programId]);
  const tasks = useMemo(() => adapter.getTaskHistory(programId), [adapter, programId]);

  const [provenance, setProvenance] = useState<ProvenanceRecord | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!program) {
    return (
      <section style={rootStyle}>
        <p style={bodyTextStyle}>No program record was found for {programId}.</p>
        <button type="button" onClick={onBack} style={backBtnStyle}>Back to portfolio</button>
      </section>
    );
  }

  const pill = statusPillColors(program.status_label);

  const openProvenance = (flagId: string, record: ProvenanceRecord): void => {
    try {
      ctx.logger.log({
        event_type: "APEX_PROVENANCE_VIEWED",
        workflow_step_id: `apex-provenance-${programId}`, // Constraint #6
        sovereign_tier: "standard",
        product: "APEX",
        actor_id: ctx.auth.user.employee_id,
        outcome: "apex_provenance_viewed",
        payload: { program_id: programId, field_id: flagId, actor: "human" },
      });
    } catch {
      // Telemetry only — never block the drill-down from opening.
    }
    setProvenance(record);
  };

  return (
    <section style={rootStyle} aria-label="APEX Program Detail">
      <button type="button" onClick={onBack} style={backBtnStyle}>← Back to portfolio</button>

      <header style={{ margin: "12px 0 16px" }}>
        <h1 style={titleStyle}>{program.program_name}</h1>
        <p style={subtitleStyle}>
          Program {program.program_id} · {program.classification} ·{" "}
          <span style={{ ...pillStyle, color: pill.color, background: pill.background }}>{statusLabelText(program.status_label)}</span> ·
          Responsible party: {program.responsible_party}
        </p>
      </header>

      <button type="button" onClick={() => onExportDossier(program.program_id)} style={exportBtnStyle}>
        Export Dossier
      </button>

      <div style={contentCardStyle} data-category="3-content">
        <h2 style={sectionHeadingStyle}>Program Status</h2>
        <p style={bodyTextStyle}>{program.status_narrative}</p>

        <h2 style={sectionHeadingStyle}>Objectives</h2>
        <ul style={listStyle}>
          {program.objectives.map((o, i) => (
            <li key={i} style={liStyle}>{o}</li>
          ))}
        </ul>

        <h2 style={sectionHeadingStyle}>Milestones</h2>
        <ul style={listStyle}>
          {program.milestones.map((m, i) => (
            <li key={i} style={liStyle}><strong>{m.name}.</strong> {m.status_narrative}</li>
          ))}
        </ul>
      </div>

      <div style={contentCardStyle} data-category="3-content">
        <h2 style={sectionHeadingStyle}>Risk Register</h2>
        {program.risk_flags.length === 0 ? (
          <p style={bodyTextStyle}>There are no open risk flags for this program.</p>
        ) : (
          <ul style={listStyle}>
            {program.risk_flags.map((flag) => (
              <li key={flag.flag_id} style={liStyle}>
                <button type="button" onClick={() => openProvenance(flag.flag_id, flag.provenance)} style={flagBtnStyle}>
                  {flag.summary} <span style={traceHintStyle}>(Priority {flag.severity.slice(1)} — view source data)</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {provenance ? <ProvenancePanel record={provenance} onClose={() => setProvenance(null)} /> : null}

      <div style={contentCardStyle} data-category="3-content">
        <h2 style={sectionHeadingStyle}>Reasoning Chain History</h2>
        {reasoning.length === 0 ? (
          <p style={bodyTextStyle}>No reasoning chains have been recorded for this program yet.</p>
        ) : (
          <ul style={listStyle}>
            {reasoning.map((r, i) => (
              <li key={i} style={liStyle}>
                <button type="button" onClick={() => setExpanded(expanded === i ? null : i)} style={expandBtnStyle}>
                  {new Date(r.recorded_at).toISOString().slice(0, 10)} — {expanded === i ? "hide detail" : "show detail"}
                </button>
                {expanded === i ? (
                  <p style={{ ...bodyTextStyle, marginTop: 6 }}>
                    Recommendation: {r.recommendation} This output was served from the {r.tier} tier and{" "}
                    {r.schema_valid ? "passed schema validation." : "did not pass schema validation."}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={contentCardStyle} data-category="3-content">
        <h2 style={sectionHeadingStyle}>Governance Decisions</h2>
        {decisions.length === 0 ? (
          <p style={bodyTextStyle}>No human governance decisions have been logged against this program yet.</p>
        ) : (
          <ul style={listStyle}>
            {decisions.map((d, i) => (
              <li key={i} style={liStyle}>
                On {new Date(d.decided_at).toISOString().slice(0, 10)}, {d.actor_name} recorded a {d.outcome} decision: {d.note}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={contentCardStyle} data-category="3-content">
        <h2 style={sectionHeadingStyle}>Agent Task History</h2>
        {tasks.length === 0 ? (
          <p style={bodyTextStyle}>No agent tasks have been created for this program yet.</p>
        ) : (
          <ul style={listStyle}>
            {tasks.map((t) => (
            <li key={t.task_id} style={liStyle}>
              {t.title}. Approval status: {t.approval_status}
              {t.approved_by ? ` (approved by ${t.approved_by})` : ""}. {t.completed ? "Completed." : "Not yet completed."}
            </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

const backBtnStyle: CSSProperties = { background: "none", border: "none", padding: 0, color: "#1e40af", cursor: "pointer", fontSize: 13 };
const exportBtnStyle: CSSProperties = { padding: "6px 16px", borderRadius: 6, border: "1px solid #0c4a6e", background: "#0c4a6e", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 16 };
const pillStyle: CSSProperties = { display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 };
const listStyle: CSSProperties = { margin: "0 0 14px", paddingLeft: 20, maxWidth: 820 };
const liStyle: CSSProperties = { color: "#334155", fontSize: 14, lineHeight: 1.5, marginBottom: 6 };
const flagBtnStyle: CSSProperties = { background: "none", border: "none", padding: 0, color: "#0f172a", cursor: "pointer", fontSize: 14, textAlign: "left", lineHeight: 1.5 };
const traceHintStyle: CSSProperties = { color: "#1e40af", textDecoration: "underline", fontSize: 13 };
const expandBtnStyle: CSSProperties = { background: "none", border: "none", padding: 0, color: "#1e40af", cursor: "pointer", fontSize: 14 };

export default ProgramDetailView;
