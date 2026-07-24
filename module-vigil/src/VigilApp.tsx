/**
 * SOVEREIGN Platform — module-vigil
 * VigilApp.tsx — VIGIL composition root (React).
 *
 * The single React component the module mounts (via index.ts → createRoot) into the
 * shell-provided outlet, AFTER the structural role gate in index.ts admits the operator.
 * It renders the VIGIL chrome (Command Center summary) and two tabs:
 *   - Alert Queue (Session 7) — Alert Queue + Alert Detail (response + Anomaly Triage).
 *   - Agent Approval Queue (Session 10) — the request queue, vigil-approval-agent brief,
 *     and human-gated Approve/Reject/Escalate decisions.
 *
 * Both surfaces run on injectable backings (Standing Constraint #3): the alert feed via
 * VIGIL_ALERT_ENDPOINT (null → configuration notice this session), the approval queue via
 * the shared session store over the synthetic/dev AgentApprovalPort (WG-13, Session 54).
 * Expired approval requests are auto-rejected with an AGENT_ACTION_EXPIRED system event by
 * a live sweep — on mount and on an interval while the screen is open (WG-5, Session 54).
 *
 * Version: 2.2 (live session-store subscription — D1, docs/30 §2) · Session 61 · July 23, 2026
 */

import { useEffect, useMemo, useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { AlertQueue } from "./AlertQueue";
import { AlertDetail } from "./AlertDetail";
import { ApprovalQueue } from "./ApprovalQueue";
import { ApprovalDetail } from "./ApprovalDetail";
import { useAlertQueue } from "./useAlertQueue";
import { useApprovalQueue } from "./useApprovalQueue";
import { DEMO_ARIA_ALERTS } from "./aria-alert-routing";
import { DEMO_TT_ALERTS } from "./tt-synthetic-alerts";
import { EXPIRY_SWEEP_INTERVAL_MS } from "./approval-contract";
import { ensureVigilApprovalSession } from "./vigil-approval-session";
import { publishVigilWorkQueues } from "./vigil-work-queue-publisher";
import {
  publishVigilWorkspaceItems,
  VIGIL_WORKSPACE_MODULE_ID,
} from "./vigil-workspace-publisher";

/**
 * GD-27 (shell-contract v1.22, docs/25 §3) — VIGIL's narrowed initialState shape.
 * An externally-supplied STARTING VALUE for the approval queue's existing
 * selection state (useApprovalQueue.selectedId), not a new selection mechanism.
 */
export interface VigilInitialState {
  selectedRequestId?: string;
}

export interface VigilAppProps {
  ctx: SovereignShellContext;
  /** GD-27 — navigation intent from ctx.navigateToModule, already narrowed by index.ts. */
  initialState?: VigilInitialState;
}

type Tab = "alerts" | "approvals";

export function VigilApp({ ctx, initialState }: VigilAppProps): JSX.Element {
  const operatorRole = "BOTH"; // reaching here means the gate passed (spec §3)
  // GD-27: a navigation intent naming a request opens directly on the Approvals
  // tab; otherwise the module opens at its own default screen exactly as before.
  const [tab, setTab] = useState<Tab>(
    initialState?.selectedRequestId ? "approvals" : "alerts"
  );
  const [lastDecision, setLastDecision] = useState<{ action: string; agentId: string; actionType: string } | null>(null);
  const [expiredRequestCount, setExpiredRequestCount] = useState(0);

  // ARIA Suite CLEAR routes compliance violations and governance-calendar timing alerts to
  // the VIGIL Alert Queue (Session 23 · D5). Until the live Alert Dispatcher endpoint is
  // wired (Stage 2), they are seeded on the synthetic/dev backing — the sanctioned dev path
  // (useAlertQueue.initialAlerts), the same pattern as the synthetic approval port.
  // Session 29 (WE-5): Time & Travel alerts + the TT formal-escalation approval
  // item join the seeded queues — same sanctioned dev path. Session 54 (WG-1/13):
  // the TT approval now anchors to the shared session's assembly time (shell
  // start) rather than this component's mount, so its P2 window is live from
  // the moment the platform opens.
  // D2 (Session 61, D3-1 HIGH): sessionStore — alert state lives in the
  // session-persistent store (vigil-alert-session.ts), so an acknowledged or
  // resolved alert no longer resurrects when this component remounts. The
  // seeds below feed the store's ONE per-session assembly.
  const alerts = useAlertQueue(ctx, {
    initialAlerts: [...DEMO_ARIA_ALERTS, ...DEMO_TT_ALERTS],
    sessionStore: true,
  });

  // WG-1 / WG-13 (Session 54): the approval queue comes from the shared,
  // session-persistent store (vigil-approval-session.ts) — the same queue the
  // shell's startup publisher and the Reviewer's Workspace read.
  // D1 (Session 61): consumption is now a LIVE SUBSCRIPTION, not mount-time
  // seeding — subscribeToSession below holds the hook on the store, so a
  // decision recorded in the Workspace is reflected in this already-mounted
  // screen (the D3-9 root fix; previously reflection only worked because this
  // component happened to re-seed fresh on every mount). session.obligationCase
  // is read per render — the store-triggered re-render keeps it fresh too.
  const session = useMemo(() => ensureVigilApprovalSession(ctx.logger), [ctx.logger]);
  const demoPPBEObligationCase = session.obligationCase;

  const approvals = useApprovalQueue(ctx, {
    initialRequests: [...session.requests],
    // GD-27 — seed the queue's existing selection state with the navigation intent.
    initialSelectedId: initialState?.selectedRequestId,
    // D1 (Session 61) — live subscription on the shared session store.
    subscribeToSession: true,
  });

  // WG-5 (Session 54): the expiry sweep is LIVE — on mount and every
  // EXPIRY_SWEEP_INTERVAL_MS while this screen is open — so a P1's 15-minute
  // window elapsing on an idle screen expires, logs (AGENT_ACTION_EXPIRED),
  // and removes the request without a remount. (Previously ran once on mount.)
  // expireOverdue also mirrors removals into the shared session store.
  useEffect(() => {
    const sweep = (): void => {
      const expired = approvals.expireOverdue(Date.now());
      if (expired.length > 0) setExpiredRequestCount((count) => count + expired.length);
    };
    sweep();
    const timer = setInterval(sweep, EXPIRY_SWEEP_INTERVAL_MS);
    return () => clearInterval(timer);
    // expireOverdue changes identity when the queue changes; re-arming the
    // interval then is correct (the sweep is idempotent on an unchanged queue).
  }, [approvals.expireOverdue]);

  // GD-24 — publish VIGIL's two WorkQueueSurface summaries whenever the counts change.
  // Reuses the counts already computed by useApprovalQueue / useAlertQueue above.
  const { workQueueSurface } = ctx;
  useEffect(() => {
    publishVigilWorkQueues(
      approvals.pendingCount,
      approvals.hasPendingP1,
      alerts.unacknowledgedCount,
      alerts.hasUnacknowledgedP1,
      workQueueSurface,
      new Date().toISOString()
    );
  }, [workQueueSurface, approvals.pendingCount, approvals.hasPendingP1, alerts.unacknowledgedCount, alerts.hasUnacknowledgedP1]);

  // GD-25 — publish the FULL pending approval requests (with the Tier C obligation
  // case where applicable) to the Reviewer's Workspace surface whenever the queue
  // changes. The publisher also reconciles away items no longer in the live queue
  // (decided or expired), so a resolved request does not linger in the Workspace.
  const { reviewerWorkspaceSurface } = ctx;
  useEffect(() => {
    publishVigilWorkspaceItems(
      approvals.requests,
      demoPPBEObligationCase,
      reviewerWorkspaceSurface,
      new Date().toISOString()
    );
  }, [reviewerWorkspaceSurface, approvals.requests, demoPPBEObligationCase]);

  return (
    <section style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>VIGIL</h1>
        <p style={subtitleStyle}>Agent &amp; Security Operator Dashboard · Companion Suite</p>
      </header>

      <div style={bannerStyle}>
        Alert response (vigil-triage-analyst, PR-VIGIL-001) and Agent Approval
        (vigil-approval-agent, PR-VIGIL-002) are both wired. ARIA Suite CLEAR routes
        compliance and governance-calendar alerts into the Alert Queue (source ARIA). The
        live alert feed and the live AgentOS approval port activate by configuration; this
        session all run on synthetic/dev backings. Operator: <strong>{ctx.auth.user.name}</strong> · scope{" "}
        <strong>{operatorRole}</strong>.
      </div>

      {/* ---- Command Center summary ---- */}
      <div style={summaryRowStyle} aria-label="Command Center summary">
        <SummaryCard
          label="Unacknowledged alerts"
          value={alerts.configured ? String(alerts.unacknowledgedCount) : "—"}
          note={alerts.configured ? (alerts.hasUnacknowledgedP1 ? "includes an unacknowledged P1" : "live") : "endpoint not configured"}
        />
        <SummaryCard
          label="Pending approvals"
          value={String(approvals.pendingCount)}
          note={approvals.hasPendingP1 ? "includes a P1 request" : "synthetic/dev port"}
        />
        <SummaryCard label="Pipeline health" value="—" note="wired in a later session" />
      </div>

      {/* ---- Tabs ---- */}
      <nav style={tabBarStyle} aria-label="VIGIL surfaces">
        <TabButton id="alerts" label="Alert Queue" active={tab === "alerts"} onClick={setTab} />
        <TabButton id="approvals" label="Actions Awaiting Your Approval" active={tab === "approvals"} onClick={setTab} />
      </nav>

      {alerts.ingestError && (
        <p role="alert" style={errorStyle}>
          {alerts.ingestError}
        </p>
      )}
      {approvals.expireError && (
        <p role="alert" style={errorStyle}>
          {approvals.expireError}
        </p>
      )}

      {tab === "alerts" ? (
        <div style={stackStyle}>
          <AlertQueue alerts={alerts.alerts} configured={alerts.configured} selectedId={alerts.selectedId} onSelect={alerts.select} />
          {alerts.selected ? (
            <AlertDetail ctx={ctx} alert={alerts.selected} applyResponse={alerts.applyResponse} onClose={() => alerts.select(null)} />
          ) : (
            alerts.alerts.length > 0 && <p style={hintStyle}>Select an alert to view its detail, triage it, and record a response.</p>
          )}
        </div>
      ) : (
        <div style={stackStyle}>
          {lastDecision && (
            <div role="status" style={confirmBannerStyle}>
              Decision recorded: <strong>{lastDecision.action}</strong> · {lastDecision.agentId} ({lastDecision.actionType})
              <button type="button" onClick={() => setLastDecision(null)} style={dismissStyle} aria-label="Dismiss">✕</button>
            </div>
          )}
          {expiredRequestCount > 0 && (
            <p role="status" style={expiredNoticeStyle}>
              {expiredRequestCount} request{expiredRequestCount !== 1 ? "s" : ""} expired and {expiredRequestCount !== 1 ? "were" : "was"} auto-rejected (AGENT_ACTION_EXPIRED).
            </p>
          )}
          <ApprovalQueue requests={approvals.requests} selectedId={approvals.selectedId} onSelect={approvals.select} />
          {approvals.selected ? (
            <ApprovalDetail
              ctx={ctx}
              request={approvals.selected}
              onDecided={(requestId) => {
                // GD-25 — the decision-commit path: a decided request leaves the
                // Reviewer's Workspace, then the local queue.
                reviewerWorkspaceSurface.remove(VIGIL_WORKSPACE_MODULE_ID, requestId);
                approvals.remove(requestId);
              }}
              onDecisionMade={(_requestId, action, agentId, actionType) => {
                setLastDecision({ action, agentId, actionType });
              }}
              obligationCase={
                approvals.selected.action_type === "ppbe_obligation" && demoPPBEObligationCase
                  ? demoPPBEObligationCase
                  : undefined
              }
            />
          ) : (
            approvals.requests.length > 0 && <p style={hintStyle}>Select a request to review its brief and record a decision.</p>
          )}
        </div>
      )}
    </section>
  );
}

function TabButton({ id, label, active, onClick }: { id: Tab; label: string; active: boolean; onClick: (t: Tab) => void }): JSX.Element {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onClick(id)}
      style={{ ...tabStyle, color: active ? "#0f172a" : "#475569", borderBottom: active ? "2px solid #0f172a" : "2px solid transparent", fontWeight: active ? 700 : 500 }}
    >
      {label}
    </button>
  );
}

function SummaryCard({ label, value, note }: { label: string; value: string; note: string }): JSX.Element {
  return (
    <div style={cardStyle}>
      <span style={cardValueStyle}>{value}</span>
      <span style={cardLabelStyle}>{label}</span>
      <span style={cardNoteStyle}>{note}</span>
    </div>
  );
}

// ============================================================
// STYLES (inline — consistent with the shell chrome / other modules)
// ============================================================

const rootStyle: CSSProperties = {
  fontFamily: "system-ui, sans-serif", padding: 32, color: "#0f172a", height: "100%",
  boxSizing: "border-box", overflow: "auto",
};
const headerStyle: CSSProperties = { marginBottom: 16 };
const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 22 };
const subtitleStyle: CSSProperties = { margin: 0, color: "#475569" };
const bannerStyle: CSSProperties = {
  padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8,
  color: "#1e40af", fontSize: 13, marginBottom: 16, maxWidth: 720,
};
const summaryRowStyle: CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16, maxWidth: 720 };
const cardStyle: CSSProperties = {
  display: "flex", flexDirection: "column", gap: 2, padding: 12, borderRadius: 10,
  border: "1px solid #e2e8f0", background: "#f8fafc", minWidth: 160,
};
const cardValueStyle: CSSProperties = { fontSize: 22, fontWeight: 700, color: "#0c4a6e" };
const cardLabelStyle: CSSProperties = { fontSize: 13, color: "#334155" };
const cardNoteStyle: CSSProperties = { fontSize: 11, color: "#475569" };
const tabBarStyle: CSSProperties = { display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", marginBottom: 16 };
const tabStyle: CSSProperties = { padding: "8px 14px", fontSize: 14, background: "none", border: "none", cursor: "pointer" };
const stackStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const hintStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#64748b" };
const errorStyle: CSSProperties = {
  margin: "0 0 12px", padding: "8px 10px", borderRadius: 8, background: "#fef2f2",
  border: "1px solid #fecaca", color: "#991b1b", fontSize: 12, maxWidth: 720,
};
const confirmBannerStyle: CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "8px 12px", borderRadius: 8, background: "#f0fdf4",
  border: "1px solid #bbf7d0", color: "#166534", fontSize: 13, maxWidth: 720,
};
const dismissStyle: CSSProperties = {
  background: "none", border: "none", cursor: "pointer", color: "#166534", fontWeight: 700, padding: "0 4px",
};
const expiredNoticeStyle: CSSProperties = {
  margin: 0, padding: "7px 12px", borderRadius: 8, background: "#fffbeb",
  border: "1px solid #fde68a", color: "#92400e", fontSize: 12, maxWidth: 720,
};

export default VigilApp;
