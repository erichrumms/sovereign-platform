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
 * Version: 1.1 (Screens 3/5) · Session 21 · June 26, 2026
 */

import { useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { rootStyle, titleStyle, subtitleStyle } from "./banners";
import { SessionManager } from "./SessionManager";
import { ElicitationDialogue } from "./ElicitationDialogue";
import { WorkflowArtifactReview } from "./WorkflowArtifactReview";
import { IndividualWorkstyle } from "./IndividualWorkstyle";
import { GateRunnerPanel } from "./GateRunnerPanel";

export interface FlowpathAppProps {
  ctx: SovereignShellContext;
}

type Tab = "sessions" | "dialogue" | "review" | "workstyle" | "certification";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "sessions", label: "Elicitation Sessions" },
  { id: "dialogue", label: "Elicitation Dialogue" },
  { id: "review", label: "Artifact Review" },
  { id: "workstyle", label: "My Workstyle" },
  { id: "certification", label: "CPMI-VRS Certification" },
];

export function FlowpathApp({ ctx }: FlowpathAppProps): JSX.Element {
  const [tab, setTab] = useState<Tab>("sessions");
  const [approvedSessionIds, setApprovedSessionIds] = useState<string[]>([]);

  const onApproved = (sessionId: string): void => {
    setApprovedSessionIds((prev) => (prev.includes(sessionId) ? prev : [...prev, sessionId]));
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

        {tab === "sessions" && <SessionManager ctx={ctx} approvedSessionIds={approvedSessionIds} onOpenSession={onOpenSession} />}
        {tab === "dialogue" && <ElicitationDialogue ctx={ctx} />}
        {tab === "review" && <WorkflowArtifactReview ctx={ctx} onApproved={onApproved} onReturnForRevision={onReturnForRevision} />}
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
