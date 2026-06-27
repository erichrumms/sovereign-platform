/**
 * SOVEREIGN Platform — module-flowpath
 * FlowpathApp.tsx — FLOWPATH composition root (React).
 *
 * The single component the module mounts after the AGENT_OPERATOR gate admits the participant.
 * It renders the FLOWPATH chrome; the tabbed elicitation surfaces (Session Manager / Dialogue /
 * Individual Workstyle) are wired in across Session 20 deliverables D3–D5. Every screen is built
 * to Gap 5/6 from the first line of code: governance banners are Category 2 (permanent, blue),
 * status notices are Category 1 (amber), and substantive content sits in white cards on the light
 * page canvas (Category 3).
 *
 * Version: 1.0 (scaffold) · Session 20 · June 26, 2026
 */

import { useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { rootStyle, titleStyle, subtitleStyle } from "./banners";
import { SessionManager } from "./SessionManager";
import { ElicitationDialogue } from "./ElicitationDialogue";

export interface FlowpathAppProps {
  ctx: SovereignShellContext;
}

type Tab = "sessions" | "dialogue";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "sessions", label: "Elicitation Sessions" },
  { id: "dialogue", label: "Elicitation Dialogue" },
];

export function FlowpathApp({ ctx }: FlowpathAppProps): JSX.Element {
  const [tab, setTab] = useState<Tab>("sessions");

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

        {tab === "sessions" && <SessionManager ctx={ctx} />}
        {tab === "dialogue" && <ElicitationDialogue ctx={ctx} />}
      </div>
    </section>
  );
}

const shellStyle: CSSProperties = { height: "100%", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" };
const tabBarStyle: CSSProperties = { display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", padding: "0 32px", background: "#fff" };
const tabStyle: CSSProperties = { padding: "10px 14px", fontSize: 14, background: "none", border: "none", cursor: "pointer" };

export default FlowpathApp;
