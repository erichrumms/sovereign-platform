/**
 * SOVEREIGN Platform — module-flowpath
 * FlowpathApp.tsx — FLOWPATH composition root (React).
 *
 * The single component the module mounts after the AGENT_OPERATOR gate admits the participant.
 * It renders the FLOWPATH chrome and the tabbed elicitation surfaces (Session Manager / Dialogue /
 * Artifact Review / Individual Workstyle / CPMI-VRS Certification). Every screen is built to Gap 5/6
 * from the first line of code: governance banners are Category 2 (permanent, blue), status notices
 * are Category 1 (amber), and substantive content sits in white cards on the light page canvas
 * (Category 3).
 *
 * Cross-tab navigation (Session 21, D1): approving a workflow artifact on Screen 3 returns to the
 * Session Manager (Screen 1) and marks that session approved; returning it for revision returns to
 * the Elicitation Dialogue (Screen 2).
 *
 * Session 63 (WH-20): FlowpathApp owns the sessions list and the active-dialogue session ID.
 * startNewSession (via SessionManager.onNewSession + onStartSession) appends the new session and
 * navigates to ElicitationDialogue for it. Completing the five questions produces an artifact that
 * navigates to WorkflowArtifactReview. The session card on Screen 1 becomes actionable once the
 * artifact is produced. The preliminary context gate (Task 2) is tracked on ElicitationSession.
 *
 * Session 64 (WH-25 / WH-24): sessions list migrated from bare useState to the module-level
 * flowpath-elicitation-session.ts store — navigate away and back no longer resets live sessions
 * to the synthetic seed. A navigation intent (GD-27) supplying selectedSessionId opens the
 * Elicitation Dialogue pre-focused on that session, supporting Workspace return-for-revision.
 *
 * Session 65 (F1): on mount with selectedSessionId + COMPLETE + gate_passed, reconstruct
 * activeBundle from the ReviewerWorkspaceSurface and route to the review tab instead of
 * dialogue. Edge case (already approved — no workspace item): fall back to sessions tab.
 *
 * Version: 1.4 · Session 65 (F1 — activeBundle reconstruction from workspace surface) · July 26, 2026
 */

import { useEffect, useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { Gate1Banner, rootStyle, titleStyle, subtitleStyle } from "./banners";
import {
  getApprovedFlowpathSessionIds,
  markFlowpathSessionApproved,
  subscribeFlowpathApprovalSession,
} from "./flowpath-approval-session";
import {
  initFlowpathElicitationSessions,
  createFlowpathElicitationSession,
  updateFlowpathElicitationSession,
  subscribeFlowpathElicitationSession,
} from "./flowpath-elicitation-session";
import type { ElicitationSession, FlowpathMapperOutput } from "./flowpath-contract";
import { SYNTHETIC_SESSIONS } from "./synthetic-elicitation";
import { SessionManager } from "./SessionManager";
import { ElicitationDialogue } from "./ElicitationDialogue";
import { WorkflowArtifactReview } from "./WorkflowArtifactReview";
import { IndividualWorkstyle } from "./IndividualWorkstyle";
import { GateRunnerPanel } from "./GateRunnerPanel";
import { publishFlowpathArtifact, FLOWPATH_WORKSPACE_MODULE_ID } from "./flowpath-workspace-publisher";

/** GD-27 (shell-contract v1.22) — FLOWPATH's narrowed initialState shape. */
export interface FlowpathInitialState {
  selectedSessionId?: string;
}

export interface FlowpathAppProps {
  ctx: SovereignShellContext;
  /** GD-27 — navigation intent from ctx.navigateToModule, already narrowed by index.ts. */
  initialState?: FlowpathInitialState;
}

type Tab = "sessions" | "dialogue" | "review" | "workstyle" | "certification";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "sessions", label: "Elicitation Sessions" },
  { id: "dialogue", label: "Elicitation Dialogue" },
  { id: "review", label: "Artifact Review" },
  { id: "workstyle", label: "My Workstyle" },
  { id: "certification", label: "CPMI-VRS Certification" },
];

export function FlowpathApp({ ctx, initialState }: FlowpathAppProps): JSX.Element {
  // WH-25 (Session 64): sessions live in the module-level store — navigate away and
  // back no longer resets to the synthetic seed.
  const [sessions, setSessions] = useState<readonly ElicitationSession[]>(() =>
    initFlowpathElicitationSessions(SYNTHETIC_SESSIONS)
  );
  useEffect(() => subscribeFlowpathElicitationSession(setSessions), []);

  // F1 (Session 65): on mount with selectedSessionId, route depends on session status.
  // COMPLETE + gate_passed + workspace item → "review" with bundle reconstructed from surface.
  // WH-24 return-for-revision path (session is IN_PROGRESS after store reset) → "dialogue".
  // Edge case (COMPLETE + no workspace item, already approved) → "sessions" fallback.
  const [tab, setTab] = useState<Tab>(() => {
    const sid = initialState?.selectedSessionId;
    if (!sid) return "sessions";
    const currentSessions = initFlowpathElicitationSessions(SYNTHETIC_SESSIONS);
    const session = currentSessions.find((s) => s.session_id === sid);
    if (!session || session.status !== "COMPLETE" || !session.gate_passed) return "dialogue";
    const item = ctx.reviewerWorkspaceSurface
      .listForModule(FLOWPATH_WORKSPACE_MODULE_ID)
      .find((i) => i.item_id === sid);
    return item ? "review" : "sessions";
  });
  // The session ID currently being elicited in the dialogue (null = synthetic default).
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    initialState?.selectedSessionId ?? null
  );
  // F1 (Session 65): reconstruct from the workspace surface when COMPLETE + gate_passed at mount.
  // The surface holds the full FlowpathMapperOutput the mapper produced (per workspace-publisher
  // header: "The payload is the full FlowpathMapperOutput the mapper produced").
  const [activeBundle, setActiveBundle] = useState<FlowpathMapperOutput | null>(() => {
    const sid = initialState?.selectedSessionId;
    if (!sid) return null;
    const currentSessions = initFlowpathElicitationSessions(SYNTHETIC_SESSIONS);
    const session = currentSessions.find((s) => s.session_id === sid);
    if (!session || session.status !== "COMPLETE" || !session.gate_passed) return null;
    const item = ctx.reviewerWorkspaceSurface
      .listForModule(FLOWPATH_WORKSPACE_MODULE_ID)
      .find((i) => i.item_id === sid);
    return item ? (item.payload as FlowpathMapperOutput) : null;
  });

  // D5 (Session 61, finding D3-4): approvals live in the session-persistent
  // store (flowpath-approval-session.ts), not per-mount state — an approved
  // artifact no longer reverts to pending when FLOWPATH remounts.
  const [approvedSessionIds, setApprovedSessionIds] = useState<readonly string[]>(
    () => getApprovedFlowpathSessionIds()
  );
  useEffect(() => subscribeFlowpathApprovalSession(setApprovedSessionIds), []);

  // Task 3 (WH-19): publish/unpublish the active bundle to the Reviewer's Workspace surface
  // so it appears in the FLOWPATH Workspace panel. An approved artifact is unpublished
  // (approvedSessionIds changes → we republish nothing for that session).
  useEffect(() => {
    publishFlowpathArtifact(activeBundle, approvedSessionIds, ctx.reviewerWorkspaceSurface, new Date().toISOString());
  }, [activeBundle, approvedSessionIds, ctx.reviewerWorkspaceSurface]);

  // ── Session lifecycle callbacks ────────────────────────────────────────────

  // WH-20: a new session is created in SessionManager; store it (store notifies → setSessions).
  const handleNewSession = (session: ElicitationSession): void => {
    createFlowpathElicitationSession(session);
  };

  // WH-20: called by SessionManager right after handleNewSession — navigate into the dialogue.
  const handleStartSession = (sessionId: string): void => {
    setActiveSessionId(sessionId);
    setTab("dialogue");
  };

  // WH-20 Task 2: preliminary context confirmed — mark the session.
  const handlePreliminaryComplete = (sessionId: string): void => {
    updateFlowpathElicitationSession(sessionId, { preliminary_complete: true });
  };

  // WH-20: artifact produced from the dialogue — mark session COMPLETE + gate_passed,
  // store the bundle, and navigate to the review tab.
  const handleArtifactProduced = (sessionId: string, bundle: FlowpathMapperOutput): void => {
    updateFlowpathElicitationSession(sessionId, { status: "COMPLETE", gate_passed: true });
    setActiveBundle(bundle);
    setTab("review");
  };

  const onApproved = (sessionId: string): void => {
    // WorkflowArtifactReview already marked the store at the emit site; this
    // repeat mark is an idempotent no-op kept for callers outside that screen.
    markFlowpathSessionApproved(sessionId);
    setActiveBundle(null); // unpublish from workspace
    setTab("sessions");
  };
  const onReturnForRevision = (): void => {
    setTab("dialogue");
  };
  // WC-1: opening a gate-passed session card on Screen 1 navigates to its Artifact Review (Screen 3).
  const onOpenSession = (_sessionId: string): void => {
    setTab("review");
  };

  return (
    <section style={shellStyle}>
      {/* Session 122 (Session 121 survey Finding 5): Gate 1 consolidated to the composition
          root — F-20 pattern — covering all five tabs. Replaces the three panel-level
          instances (SessionManager, ElicitationDialogue, GateRunnerPanel); Workstyle and
          Review previously had no disclosure. */}
      <Gate1Banner />
      <nav style={tabBarStyle} aria-label="FLOWPATH surfaces">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              style={{ ...tabStyle, color: active ? "#0f172a" : "#475569", borderBottom: active ? "2px solid #0f172a" : "2px solid transparent", fontWeight: active ? 700 : 500 }}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <div style={rootStyle}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={titleStyle}>FLOWPATH</h1>
          <p style={subtitleStyle}>Workflow Elicitation and Process Intelligence — the entry point to the SOVEREIGN pipeline.</p>
        </header>

        {tab === "sessions" && (
          <SessionManager
            ctx={ctx}
            sessions={sessions}
            onNewSession={handleNewSession}
            onStartSession={handleStartSession}
            approvedSessionIds={approvedSessionIds}
            onOpenSession={onOpenSession}
          />
        )}
        {tab === "dialogue" && (
          <ElicitationDialogue
            ctx={ctx}
            sessionId={activeSessionId ?? undefined}
            onPreliminaryComplete={handlePreliminaryComplete}
            onArtifactProduced={handleArtifactProduced}
          />
        )}
        {tab === "review" && (
          <WorkflowArtifactReview
            ctx={ctx}
            bundle={activeBundle ?? undefined}
            onApproved={onApproved}
            onReturnForRevision={onReturnForRevision}
          />
        )}
        {tab === "workstyle" && <IndividualWorkstyle ctx={ctx} />}
        {tab === "certification" && <GateRunnerPanel ctx={ctx} />}
      </div>
    </section>
  );
}

const shellStyle: CSSProperties = { height: "100%", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" };
const tabBarStyle: CSSProperties = { display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", padding: "0 32px", background: "#fff", flexWrap: "wrap" };
const tabStyle: CSSProperties = { padding: "10px 14px", fontSize: 14, background: "none", border: "none", cursor: "pointer" };

export default FlowpathApp;
