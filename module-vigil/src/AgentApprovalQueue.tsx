/**
 * SOVEREIGN Platform — module-vigil
 * AgentApprovalQueue.tsx — the Agent Operator's approval surface (spec §2.4) — STUB.
 *
 * D3 scaffold: ctx.a2a is below the IMPLEMENTED stage (spec notes it at "DEFINED",
 * with invokeAgent()/getTaskState() throwing ProtocolNotImplementedError). This
 * renders the empty approval queue with an A2A stage indicator and does NOT call
 * the throwing methods (spec §3.3 / §2.4: "The component tree exists and is fully
 * typed; it does not throw"). It reflects the ACTUAL current stage — DEFINED before
 * any agent registers, CARDS_REGISTERED once COUNSEL/SCRIBE register their cards —
 * and only the IMPLEMENTED stage enables request ingestion (a later session).
 *
 * Version: 1.0 (scaffold) · Session 6 · June 17, 2026
 */

import type { CSSProperties } from "react";

export type A2AStage = "DEFINED" | "CARDS_REGISTERED" | "IMPLEMENTED";

export interface AgentApprovalQueueProps {
  /** The live ctx.a2a._stage. Only "IMPLEMENTED" enables request ingestion. */
  a2aStage: A2AStage;
}

export function AgentApprovalQueue({ a2aStage }: AgentApprovalQueueProps): JSX.Element {
  const implemented = a2aStage === "IMPLEMENTED";
  return (
    <section style={panelStyle} aria-label="Agent Approval Queue">
      <h3 style={titleStyle}>Agent Approval Queue</h3>
      {implemented ? (
        <p style={noticeOkStyle}>
          A2A protocol is IMPLEMENTED. Approval request ingestion is wired in a later session.
        </p>
      ) : (
        <div style={noticeStyle} role="status">
          <strong>A2A protocol at {a2aStage} stage.</strong>
          <p style={noticeBodyStyle}>
            Requests will appear here when AgentOS A2A is implemented in Stage&nbsp;2. The queue is fully
            typed and does not call <code>invokeAgent()</code> / <code>getTaskState()</code> (both throw at
            this stage).
          </p>
        </div>
      )}
    </section>
  );
}

const panelStyle: CSSProperties = {
  padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff", maxWidth: 720,
};
const titleStyle: CSSProperties = { margin: "0 0 8px", fontSize: 15 };
const noticeStyle: CSSProperties = {
  padding: "10px 12px", borderRadius: 8, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", fontSize: 13,
};
const noticeBodyStyle: CSSProperties = { margin: "6px 0 0" };
const noticeOkStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#475569" };

export default AgentApprovalQueue;
