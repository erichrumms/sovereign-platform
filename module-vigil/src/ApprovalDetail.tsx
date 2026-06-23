/**
 * SOVEREIGN Platform — module-vigil
 * ApprovalDetail.tsx — single approval-request drill-down (spec §4.1 / §4.2).
 *
 * Shows the full request fields, the vigil-approval-agent brief (generated via
 * useApprovalBrief — one createSovereignClient() per brief, with serving-tier
 * disclosure), and the decision controls (ApprovalDecisionPanel + useApprovalDecision).
 * The hooks own the LLM call and Logger emission; this component is composition +
 * presentation (spec §9.3 patterns). On a recorded decision the request is removed
 * from the active queue (onDecided).
 *
 * Version: 1.0 · Session 10 · June 23, 2026
 */

import { useEffect, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { minutesRemaining, type AgentApprovalRequest, type ApprovalDecisionAction } from "./approval-contract";
import { useApprovalBrief } from "./useApprovalBrief";
import { useApprovalDecision } from "./useApprovalDecision";
import { ApprovalDecisionPanel } from "./ApprovalDecisionPanel";

export interface ApprovalDetailProps {
  ctx: SovereignShellContext;
  request: AgentApprovalRequest;
  /** Called after a decision is recorded (request leaves the active queue). */
  onDecided: (requestId: string) => void;
}

const TIER_NOTE: Record<"live" | "cache" | "static", string> = {
  live: "Live brief from vigil-approval-agent.",
  cache: "Served from cache — the live agent was unavailable, so the last good brief for this request was reused.",
  static: "Static brief — the agent service is unavailable. Assembled directly from the request fields, not generated.",
};

export function ApprovalDetail({ ctx, request, onDecided }: ApprovalDetailProps): JSX.Element {
  const brief = useApprovalBrief(ctx);
  const decision = useApprovalDecision(ctx);

  // One brief per request — regenerate when the selected request changes.
  useEffect(() => {
    void brief.generate(request);
    // brief.generate is stable (useCallback over ctx); intentionally keyed on the request id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.request_id]);

  const onDecide = (action: ApprovalDecisionAction, notes: string): boolean => {
    const result = decision.decide(request, action, notes);
    if (result.ok) onDecided(request.request_id);
    return result.ok;
  };

  const remaining = minutesRemaining(request, Date.now());

  return (
    <section style={rootStyle} aria-label="Approval Detail">
      <h3 style={titleStyle}>Approval Request Detail</h3>

      <dl style={metaStyle}>
        <Row label="Request ID" value={request.request_id} />
        <Row label="Requesting agent" value={`${request.requesting_agent_id} (${request.requesting_agent_class})`} />
        <Row label="Action type" value={request.action_type} />
        <Row label="Risk" value={request.risk_classification} />
        <Row label="Submitted" value={request.submitted_at} />
        <Row label="Expires" value={`${request.expires_at} (${remaining >= 0 ? `${remaining} min left` : "EXPIRED"})`} />
        <Row label="Action detail" value={JSON.stringify(request.action_detail)} />
        {request.context ? <Row label="Agent context" value={request.context} /> : null}
      </dl>

      {/* ---- vigil-approval-agent brief ---- */}
      <div style={briefPanelStyle}>
        <div style={briefHeaderStyle}>
          <strong>Brief</strong>
          {brief.outcome ? <span style={tierBadgeStyle(brief.outcome.tier)}>{brief.outcome.tier.toUpperCase()}</span> : null}
        </div>
        {brief.status === "generating" ? (
          <p style={mutedStyle}>Generating brief…</p>
        ) : brief.error ? (
          <p style={errorStyle}>{brief.error}</p>
        ) : brief.outcome ? (
          <>
            <p style={tierNoteStyle}>{TIER_NOTE[brief.outcome.tier]}</p>
            <pre style={briefTextStyle}>{brief.outcome.brief}</pre>
          </>
        ) : null}
      </div>

      <ApprovalDecisionPanel onDecide={onDecide} error={decision.error} />
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div style={rowStyle}>
      <dt style={dtStyle}>{label}</dt>
      <dd style={ddStyle}>{value}</dd>
    </div>
  );
}

const rootStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const titleStyle: CSSProperties = { margin: 0, fontSize: 15 };
const metaStyle: CSSProperties = {
  margin: 0, padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff", maxWidth: 720,
};
const rowStyle: CSSProperties = { display: "flex", gap: 8, fontSize: 13, padding: "2px 0" };
const dtStyle: CSSProperties = { width: 140, color: "#64748b", flexShrink: 0 };
const ddStyle: CSSProperties = { margin: 0, color: "#0f172a", wordBreak: "break-word" };
const briefPanelStyle: CSSProperties = {
  padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc", maxWidth: 720,
};
const briefHeaderStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 };
const tierNoteStyle: CSSProperties = { margin: "0 0 6px", fontSize: 12, color: "#475569" };
const briefTextStyle: CSSProperties = {
  margin: 0, whiteSpace: "pre-wrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 12, color: "#0f172a",
};
const tierBadgeStyle = (tier: "live" | "cache" | "static"): CSSProperties => ({
  display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700,
  color: tier === "live" ? "#065f46" : tier === "cache" ? "#92400e" : "#7f1d1d",
  background: tier === "live" ? "#d1fae5" : tier === "cache" ? "#fef3c7" : "#fee2e2",
});
const mutedStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#64748b" };
const errorStyle: CSSProperties = { margin: 0, color: "#b91c1c", fontSize: 13 };

export default ApprovalDetail;
