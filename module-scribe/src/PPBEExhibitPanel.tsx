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

import { useState, type CSSProperties } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignLLMResponse, SovereignMessage, SovereignRequestContext } from "@sovereign/api-client";

import { SYNTH_PPBE_PROGRAMS, SYNTH_PPBE_OBLIGATIONS, SYNTH_PPBE_FINDINGS } from "@sovereign/data";
import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";

import {
  runExhibitDraft,
  exhibitWorkflowStepId,
  type ExhibitDraftInput,
  type ExhibitDraftOutcome,
} from "./ppbe-exhibit-engine";
import {
  PPBE_DOCUMENT_MODES,
  PPBE_DOCUMENT_MODE_NAMES,
  PPBE_EXHIBIT_DRAFTER,
  type PPBEDocumentMode,
} from "./ppbe-exhibit-contract";
import { readAnthropicKey } from "./anthropic-key";

import exhibitPromptRaw from "../../ppbe/prompts/exhibit_drafting_system.md?raw";

const EXHIBIT_SYSTEM_PROMPT = exhibitPromptRaw.replace(/^<!--[\s\S]*?-->\s*/, "");

type AgentStatus = "idle" | "running" | "done";

// Use the first seeded PPBE program as the demonstration target.
const DEMO_PROGRAM = SYNTH_PPBE_PROGRAMS[0];
const DEMO_OBLIGATIONS = SYNTH_PPBE_OBLIGATIONS.filter(
  (o) => o.program_id === DEMO_PROGRAM?.program_id
);
const DEMO_FINDINGS = SYNTH_PPBE_FINDINGS.filter(
  (f) => f.program_id === DEMO_PROGRAM?.program_id
);

export interface PPBEExhibitPanelProps {
  ctx: SovereignShellContext;
}

export function PPBEExhibitPanel({ ctx: _ctx }: PPBEExhibitPanelProps): JSX.Element {
  const [mode, setMode] = useState<PPBEDocumentMode>("BUDGET_EXHIBIT");
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [outcome, setOutcome] = useState<ExhibitDraftOutcome | null>(null);

  const cacheRef = new Map<string, ExhibitDraftOutcome["draft"]>();

  if (!DEMO_PROGRAM) {
    return <p style={mutedStyle}>No seeded PPBE programs available.</p>;
  }

  async function runDraft(): Promise<void> {
    setStatus("running");
    setOutcome(null);

    const input: ExhibitDraftInput = {
      mode,
      program: DEMO_PROGRAM,
      obligations: DEMO_OBLIGATIONS,
      findings: mode === "EVALUATION_REPORT" ? DEMO_FINDINGS : [],
    };
    const wsid = exhibitWorkflowStepId(input);
    const reqCtx: SovereignRequestContext = {
      workflow_step_id: wsid,
      product: "SCRIBE",
      agent_id: PPBE_EXHIBIT_DRAFTER,
      tier: "standard",
    };
    const complete = (messages: SovereignMessage[], rc: SovereignRequestContext): Promise<SovereignLLMResponse> => {
      const client = createSovereignClient({ tier: "standard" }, { api_key_anthropic: readAnthropicKey() });
      return client.complete(messages, rc);
    };

    const result = await runExhibitDraft(input, EXHIBIT_SYSTEM_PROMPT, reqCtx, {
      complete,
      cacheGet: (key) => cacheRef.get(key) ?? null,
      cacheSet: (key, value) => { cacheRef.set(key, value); },
    });
    setOutcome(result);
    setStatus("done");
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
            <div>
              <strong style={{ fontSize: 12 }}>Figures</strong>
              <ul style={figureListStyle}>
                {outcome.draft.figures.map((fig, i) => (
                  <li key={i} style={figureItemStyle}>
                    {fig.label}: {fig.value.toLocaleString()}
                    <span style={sourceStyle}> · source: {fig.source_workflow_step_id}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
const figureListStyle: CSSProperties = { margin: "4px 0 0", paddingLeft: 18 };
const figureItemStyle: CSSProperties = { fontSize: 12, color: "#334155" };
const sourceStyle: CSSProperties = { fontSize: 11, color: "#94a3b8" };
const mutedStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#64748b" };
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
