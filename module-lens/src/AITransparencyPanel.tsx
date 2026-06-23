/**
 * SOVEREIGN Platform — module-lens
 * AITransparencyPanel.tsx — LENS surface §2.3.
 *
 * A plain-language, read-only account of what AI agents did this session: what they
 * produced, whether they ran live or in fallback, and any human decisions. NO agent,
 * NO LLM call (spec §2.3) — it renders from captured Logger events.
 *
 * Data source (frozen-contract reality): the shell logger is write-only, so this panel
 * renders the LENS-session capture (events LENS emitted, observed via session-events.ts).
 * It honestly says so, and treats "no captured activity" distinctly from a fabricated
 * empty assertion — the same posture VIGIL takes for an unconfigured endpoint.
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */

import type { CSSProperties } from "react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";

export interface AITransparencyPanelProps {
  /** Captured session events (from session-events.ts). */
  events: readonly SovereignLogEvent[];
}

/**
 * Turn a Logger event into a human-readable timeline line, or null to suppress it
 * (events with no human-readable summary are suppressed — spec §2.3). Only
 * AGENT_STEP_COMPLETE and HUMAN_DECISION are surfaced.
 */
export function summarizeEvent(event: SovereignLogEvent): string | null {
  if (event.event_type === "AGENT_STEP_COMPLETE") {
    const agent = event.agent_id ?? "An AI";
    const fellBack =
      event.payload && (event.payload as { fallback_activated?: unknown }).fallback_activated === true;
    const mode = fellBack
      ? "It operated in offline mode."
      : "It operated at full capacity.";
    return `The ${agent} agent completed a step in ${event.product}. ${mode}`;
  }
  if (event.event_type === "HUMAN_DECISION") {
    const who = event.actor_name ?? event.actor_id;
    const decision = event.decision_type ? ` (${event.decision_type})` : "";
    return `${who} recorded a decision in ${event.product}${decision}.`;
  }
  return null;
}

export function AITransparencyPanel({ events }: AITransparencyPanelProps): JSX.Element {
  const lines = events
    .map((e) => summarizeEvent(e))
    .filter((line): line is string => line !== null);

  return (
    <section aria-label="AI Transparency Panel" style={wrapStyle}>
      <p style={leadStyle}>
        A plain-language record of AI agent activity LENS observed this session. This panel
        is read-only — it takes no action and makes no AI call.
      </p>

      <div style={noticeStyle}>
        LENS shows the agent activity it observed directly this session. A platform-wide
        session activity feed is not yet wired into the shell context, so this reflects
        LENS activity only.
      </div>

      {lines.length === 0 ? (
        <div style={emptyStyle}>No AI agent activity has been captured this session yet.</div>
      ) : (
        <ol style={listStyle} aria-label="Agent activity timeline">
          {lines.map((line, i) => (
            <li key={i} style={itemStyle}>
              {line}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

const wrapStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 };
const leadStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#475569" };
const noticeStyle: CSSProperties = {
  padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8,
  color: "#475569", fontSize: 12,
};
const emptyStyle: CSSProperties = {
  padding: 16, border: "1px dashed #cbd5e1", borderRadius: 10, color: "#64748b", fontSize: 13,
};
const listStyle: CSSProperties = {
  margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8,
};
const itemStyle: CSSProperties = {
  padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#ffffff",
  fontSize: 13, color: "#0f172a",
};

export default AITransparencyPanel;
