/**
 * SOVEREIGN Platform — module-flowpath
 * SessionManager.tsx — Screen 1: the Elicitation Session Manager.
 *
 * The entry point. Shows all elicitation sessions for the organization — each linked to a
 * workflow type, with the participating expert role, the date, and the Five-Question Gate status
 * in plain prose (Gap 5). A "Start a new session" button logs FLOWPATH_SESSION_STARTED.
 *
 * Gap 6: the CPMI-VRS Gate 1 AI-disclosure and GD-10 banners are Category 2 (permanent, blue);
 * the session list is Category 3 (substantive) in a white card on the light canvas.
 *
 * Version: 1.0 · Session 20 (D3) · June 26, 2026
 */

import { useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  Gate1Banner,
  ClassificationBoundaryBanner,
  contentCardStyle,
  sectionHeadingStyle,
  bodyTextStyle,
} from "./banners";
import {
  FLOWPATH_COORDINATOR,
  sessionWorkflowStep,
  type ElicitationSession,
  type WorkflowType,
} from "./flowpath-contract";
import { SYNTHETIC_SESSIONS } from "./synthetic-elicitation";

export interface SessionManagerProps {
  ctx: SovereignShellContext;
  /** Injectable initial sessions (tests). Defaults to the synthetic set. */
  initialSessions?: ElicitationSession[];
  /** Session ids whose artifact has been approved on Screen 3 (committed to the registry). */
  approvedSessionIds?: string[];
  /**
   * WC-1: invoked when a gate-passed session card is opened (click or keyboard) — the shell
   * navigates to the Artifact Review screen for that session. In-progress sessions are not
   * actionable and do not call this.
   */
  onOpenSession?: (sessionId: string) => void;
}

/**
 * WC-1/WC-2: a session is actionable when it has passed the Five-Question Gate — it is ready for
 * artifact review. In-progress / gate-pending sessions are not yet actionable.
 */
export function isActionableSession(s: ElicitationSession): boolean {
  return s.status === "COMPLETE" && s.gate_passed;
}

/** Workflow type rendered in plain language (Gap 5) — never the raw enum. */
function workflowTypeLabel(t: WorkflowType): string {
  switch (t) {
    case "operational":
      return "Operational workflow";
    case "ppbe":
      return "PPBE workflow";
    case "validation_cadence":
      return "Validation cadence";
    case "data_source_inventory":
      return "Data source inventory";
  }
}

/** Five-Question Gate status as a complete plain-prose sentence (Gap 5). */
export function gateStatusProse(session: ElicitationSession): string {
  if (session.status === "COMPLETE" && session.gate_passed) {
    return "Five-Question Gate passed — ready for artifact review.";
  }
  if (session.status === "GATE_PENDING") {
    return "Awaiting completeness review — some of the five questions are still open.";
  }
  return "Elicitation in progress.";
}

/** A readable date (Gap 5) — e.g. "June 24, 2026". */
function readableDate(iso: string): string {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  if (!y || !m || !d) return iso;
  return `${months[m - 1]} ${d}, ${y}`;
}

export function SessionManager({ ctx, initialSessions, approvedSessionIds = [], onOpenSession }: SessionManagerProps): JSX.Element {
  const [sessions, setSessions] = useState<ElicitationSession[]>(initialSessions ?? SYNTHETIC_SESSIONS);
  const [newCount, setNewCount] = useState(0);
  const approved = new Set(approvedSessionIds);

  const startNewSession = (): void => {
    const n = newCount + 1;
    const sessionId = `S-NEW-${String(n).padStart(3, "0")}`;
    const workflowType: WorkflowType = "operational";

    // FLOWPATH_SESSION_STARTED (spec §8) — workflow_step_id on every event (Constraint #6).
    ctx.logger.log({
      event_type: "FLOWPATH_SESSION_STARTED",
      workflow_step_id: sessionWorkflowStep(sessionId),
      sovereign_tier: "standard",
      product: "FLOWPATH",
      actor_id: ctx.auth.user.employee_id,
      agent_id: FLOWPATH_COORDINATOR,
      outcome: "flowpath_session_started",
      payload: { session_id: sessionId, workflow_type: workflowType },
    });

    setSessions((prev) => [
      { session_id: sessionId, workflow_type: workflowType, expert_role: ctx.auth.user.name, date: "2026-06-26", status: "IN_PROGRESS", gate_passed: false },
      ...prev,
    ]);
    setNewCount(n);
  };

  return (
    <div>
      {/* Category 2 — permanent governance guardrails. */}
      <Gate1Banner />
      <ClassificationBoundaryBanner operatorName={ctx.auth.user.name} />

      {/* Category 3 — substantive content. */}
      <div style={contentCardStyle}>
        <div style={headerRowStyle}>
          <h2 style={sectionHeadingStyle}>Elicitation sessions</h2>
          <button type="button" onClick={startNewSession} style={primaryButtonStyle}>
            Start a new session
          </button>
        </div>
        <p style={bodyTextStyle}>
          Each session draws out how the organization actually works. A session is ready for review
          once it passes the Five-Question Gate.
        </p>

        {sessions.length === 0 ? (
          <p style={bodyTextStyle}>No elicitation sessions yet. Start a new session to begin.</p>
        ) : (
          <ul style={listStyle} aria-label="Elicitation sessions">
            {sessions.map((s) => {
              // WC-1: a gate-passed session card opens its artifact review on click / Enter / Space.
              const actionable = isActionableSession(s);
              const open = actionable && onOpenSession ? () => onOpenSession(s.session_id) : undefined;
              return (
                <li
                  key={s.session_id}
                  // WC-2: gate-passed sessions are visually prominent (actionable); in-progress /
                  // gate-pending sessions are muted, so a reviewer sees what to act on at a glance.
                  style={{ ...(actionable ? actionableRowStyle : mutedRowStyle), cursor: open ? "pointer" : "default" }}
                  data-session-id={s.session_id}
                  data-actionable={actionable}
                  onClick={open}
                  onKeyDown={
                    open
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            open();
                          }
                        }
                      : undefined
                  }
                  tabIndex={open ? 0 : undefined}
                  aria-label={open ? `Open ${workflowTypeLabel(s.workflow_type)} session for artifact review` : undefined}
                >
                  <div style={{ fontWeight: 600 }}>
                    {workflowTypeLabel(s.workflow_type)} — with the {s.expert_role}
                  </div>
                  <div style={metaStyle}>Conducted on {readableDate(s.date)}.</div>
                  <div style={metaStyle}>
                    {approved.has(s.session_id)
                      ? "Approved and committed to the workflow registry."
                      : gateStatusProse(s)}
                  </div>
                  {open ? <div style={openCueStyle}>Open for artifact review →</div> : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

const headerRowStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 4 };
const primaryButtonStyle: CSSProperties = { padding: "8px 14px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#2563eb", border: "1px solid #1d4ed8", borderRadius: 8, cursor: "pointer" };
const listStyle: CSSProperties = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 };
// WC-2 — actionable (gate-passed): prominent white card with a blue accent rail and a soft lift.
const actionableRowStyle: CSSProperties = {
  padding: "12px 14px",
  background: "#ffffff",
  border: "1px solid #bfdbfe",
  borderLeft: "4px solid #2563eb",
  borderRadius: 8,
  color: "#0f172a",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
};
// WC-2 — non-actionable (in-progress / gate-pending): muted, flat, recessed; still AA-legible.
const mutedRowStyle: CSSProperties = {
  padding: "12px 14px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderLeft: "4px solid #e2e8f0",
  borderRadius: 8,
  color: "#475569",
};
const metaStyle: CSSProperties = { color: "#475569", fontSize: 13, marginTop: 2 };
const openCueStyle: CSSProperties = { color: "#2563eb", fontSize: 13, fontWeight: 600, marginTop: 6 };

export default SessionManager;
