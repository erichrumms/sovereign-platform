/**
 * SOVEREIGN Platform — module-nexus
 * PPBECoordinationPanel.tsx — clickable trigger for the NEXUS-hosted PPBE
 * coordination tracking agent (ppbe-coordination-assistant).
 *
 * Part 2 (Session 38 Walkthrough F fix): the agent existed but had zero
 * call sites outside its own definition file. This panel wires it to a
 * real, clickable trigger on a new "PPBE Coordination" tab in NEXUS.
 *
 * The LLM half produces advisory digests (Tier A — docs/18 §6). Closing an
 * item still requires the human-authorized close path from
 * ppbe-coordination-assistant.ts — this panel does NOT close items.
 *
 * All LLM access via createSovereignClient() (Constraint #5). Prompt loaded
 * at build time from ppbe/prompts/coordination_system.md (APPROVED v1.0).
 * Static fallback expected in dev (no API key).
 *
 * Version: 1.0 · Session 38 · July 16, 2026
 */

import { useState, type CSSProperties } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignLLMResponse, SovereignMessage, SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  runCoordinationTracking,
  detectCoordinationFailures,
  PPBE_COORDINATION_ASSISTANT_AGENT_ID,
  PPBE_COORDINATION_ADVISORY_LABEL,
  type CoordinationOutcome,
} from "./ppbe-coordination-assistant";
import {
  SYNTH_PPBE_COORDINATION_ITEMS,
  SYNTH_PPBE_MEETING_NOTES,
} from "./ppbe-synthetic-coordination";
import { readAnthropicKey } from "../../module-scribe/src/anthropic-key";

import coordinationPromptRaw from "../../ppbe/prompts/coordination_system.md?raw";

const COORDINATION_SYSTEM_PROMPT = coordinationPromptRaw.replace(/^<!--[\s\S]*?-->\s*/, "");

type AgentStatus = "idle" | "running" | "done";

export interface PPBECoordinationPanelProps {
  ctx: SovereignShellContext;
}

export function PPBECoordinationPanel({ ctx: _ctx }: PPBECoordinationPanelProps): JSX.Element {
  const [notes, setNotes] = useState(SYNTH_PPBE_MEETING_NOTES);
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [outcome, setOutcome] = useState<CoordinationOutcome | null>(null);

  const asOfIso = "2026-07-16T12:00:00Z";
  const overdueCount = detectCoordinationFailures(SYNTH_PPBE_COORDINATION_ITEMS, asOfIso).length;

  async function runTracking(): Promise<void> {
    setStatus("running");
    setOutcome(null);
    const wsid = `ppbe-coordination-digest-${SYNTH_PPBE_COORDINATION_ITEMS.length}-items`;
    const reqCtx: SovereignRequestContext = {
      workflow_step_id: wsid,
      product: "NEXUS",
      agent_id: PPBE_COORDINATION_ASSISTANT_AGENT_ID,
      tier: "standard",
    };
    const complete = (messages: SovereignMessage[], rc: SovereignRequestContext): Promise<SovereignLLMResponse> => {
      const client = createSovereignClient({ tier: "standard" }, { api_key_anthropic: readAnthropicKey() });
      return client.complete(messages, rc);
    };
    const result = await runCoordinationTracking(
      { items: [...SYNTH_PPBE_COORDINATION_ITEMS], notes },
      asOfIso,
      COORDINATION_SYSTEM_PROMPT,
      reqCtx,
      { complete }
    );
    setOutcome(result);
    setStatus("done");
  }

  return (
    <section style={sectionStyle} aria-label="PPBE Coordination Tracking">
      <h2 style={headingStyle}>PPBE Coordination Tracking</h2>
      <p style={noteStyle}>
        ppbe-coordination-assistant (Operational, LLM-backed). Reads meeting notes against
        tracked coordination items and produces advisory digests. Tier A — all update proposals
        require explicit human authorization; closing items requires the human-authorized close
        path (not available on this panel). Static fallback expected in dev.
      </p>

      <div style={statsRowStyle}>
        <span style={statStyle}>
          <strong>{SYNTH_PPBE_COORDINATION_ITEMS.length}</strong> tracked items
        </span>
        <span style={statStyle}>
          <strong>{SYNTH_PPBE_COORDINATION_ITEMS.filter(i => i.status === "OPEN").length}</strong> open
        </span>
        {overdueCount > 0 && (
          <span style={overdueStatStyle}>
            <strong>{overdueCount}</strong> overdue
          </span>
        )}
      </div>

      <label style={labelStyle} htmlFor="coordination-notes">
        Meeting notes / status update to read
      </label>
      <textarea
        id="coordination-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={6}
        style={textareaStyle}
        data-testid="ppbe-coordination-notes"
      />

      <button
        type="button"
        style={status === "running" ? btnDisabledStyle : btnStyle}
        disabled={status === "running"}
        onClick={() => void runTracking()}
        data-testid="ppbe-run-coordination-tracking"
      >
        {status === "running" ? "Running…" : "Run Coordination Tracking"}
      </button>

      {outcome && (
        <div style={outputStyle} data-testid="ppbe-coordination-output">
          <div style={tierRowStyle}>
            <span style={tierBadgeStyle(outcome.tier)}>{outcome.tier.toUpperCase()}</span>
            <span style={advisoryStyle}>{PPBE_COORDINATION_ADVISORY_LABEL}</span>
          </div>
          {outcome.tier === "static" && (
            <p style={staticNoteStyle}>
              Static tier — LLM unavailable in dev (no API key). Notes were NOT read by the
              model. Output is the deterministic overdue scan only. A reviewer should read the
              notes directly.
            </p>
          )}
          <p style={outputBodyStyle}>{outcome.digest.summary}</p>
          {outcome.digest.risks_flagged.length > 0 && (
            <div>
              <strong style={{ fontSize: 12 }}>Risks flagged</strong>
              <ul style={riskListStyle}>
                {outcome.digest.risks_flagged.map((risk, i) => (
                  <li key={i} style={riskItemStyle}>{risk}</li>
                ))}
              </ul>
            </div>
          )}
          {outcome.digest.update_proposals.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong style={{ fontSize: 12 }}>Update proposals (require human authorization)</strong>
              <ul style={riskListStyle}>
                {outcome.digest.update_proposals.map((p, i) => (
                  <li key={i} style={riskItemStyle}>
                    {p.item_id} → {p.proposed_status}: {p.rationale}
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

const sectionStyle: CSSProperties = { padding: "0 0 16px" };
const headingStyle: CSSProperties = { margin: "0 0 4px", fontSize: 15, fontWeight: 700 };
const noteStyle: CSSProperties = { margin: "0 0 12px", fontSize: 12, color: "#475569", maxWidth: 680 };
const statsRowStyle: CSSProperties = { display: "flex", gap: 16, marginBottom: 12 };
const statStyle: CSSProperties = { fontSize: 12, color: "#334155" };
const overdueStatStyle: CSSProperties = { fontSize: 12, color: "#b91c1c", fontWeight: 600 };
const labelStyle: CSSProperties = { display: "block", fontSize: 12, color: "#475569", marginBottom: 4 };
const textareaStyle: CSSProperties = {
  width: "100%", maxWidth: 680, boxSizing: "border-box", padding: "8px 10px",
  borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", resize: "vertical", marginBottom: 8,
};
const outputStyle: CSSProperties = {
  marginTop: 12, padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", maxWidth: 680,
};
const tierRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 };
const outputBodyStyle: CSSProperties = { margin: "0 0 8px", fontSize: 12, color: "#334155" };
const riskListStyle: CSSProperties = { margin: "4px 0 0", paddingLeft: 18 };
const riskItemStyle: CSSProperties = { fontSize: 12, color: "#7f1d1d", marginBottom: 2 };
const staticNoteStyle: CSSProperties = {
  margin: "0 0 8px", padding: "6px 8px", background: "#fef2f2", borderRadius: 4,
  fontSize: 11, color: "#7f1d1d", border: "1px solid #fecaca",
};
const advisoryStyle: CSSProperties = {
  padding: "2px 8px", background: "#eff6ff", border: "1px solid #bfdbfe",
  borderRadius: 4, fontSize: 11, fontWeight: 600, color: "#1e40af", display: "inline-block",
};
const btnStyle: CSSProperties = {
  padding: "6px 14px", borderRadius: 6, border: "1px solid #0c4a6e",
  background: "#0c4a6e", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600,
};
const btnDisabledStyle: CSSProperties = { ...btnStyle, background: "#e2e8f0", borderColor: "#cbd5e1", color: "#94a3b8", cursor: "not-allowed" };

function tierBadgeStyle(tier: string): CSSProperties {
  if (tier === "live") return { fontSize: 10, fontWeight: 700, color: "#065f46", padding: "2px 6px", borderRadius: 999, background: "#d1fae5" };
  if (tier === "cache") return { fontSize: 10, fontWeight: 700, color: "#92400e", padding: "2px 6px", borderRadius: 999, background: "#fef3c7" };
  return { fontSize: 10, fontWeight: 700, color: "#7f1d1d", padding: "2px 6px", borderRadius: 999, background: "#fee2e2" };
}

export default PPBECoordinationPanel;
