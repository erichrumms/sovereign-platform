/**
 * SOVEREIGN Platform — module-lens
 * LensApp.tsx — LENS composition root (React).
 *
 * The single React component the module mounts (via index.ts → createRoot) into the
 * shell-provided outlet. It renders the LENS chrome and the three orientation surfaces
 * (LENS core, Session 8): Governance Explainer (§2.1, lens-explainer), Pipeline
 * Navigator (§2.2, static), and AI Transparency Panel (§2.3, read-only).
 *
 * It owns the LENS session event capture: it wraps the shell logger so the events LENS
 * emits are observable by the AI Transparency Panel (session-events.ts) — the only
 * session activity the write-only shell logger lets a module see. The wrapped context
 * is what the Explainer uses; the Transparency Panel reads the capture.
 *
 * Version: 2.0 (LENS core) · Session 8 · June 22, 2026
 */

import { useMemo, useReducer, useRef, useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { GovernanceExplainer } from "./GovernanceExplainer";
import { PipelineNavigator } from "./PipelineNavigator";
import { AITransparencyPanel } from "./AITransparencyPanel";
import { createSessionEventLog, withSessionCapture } from "./session-events";

export interface LensAppProps {
  ctx: SovereignShellContext;
}

type Tab = "explainer" | "navigator" | "transparency";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "explainer", label: "Governance Explainer" },
  { id: "navigator", label: "Pipeline Navigator" },
  { id: "transparency", label: "AI Transparency" },
];

export function LensApp({ ctx }: LensAppProps): JSX.Element {
  const [tab, setTab] = useState<Tab>("explainer");
  // Force a re-render of the transparency tab as new events are captured.
  const [, bump] = useReducer((n: number) => n + 1, 0);

  // One session event log for the app's lifetime, and a logger-wrapping context
  // whose emissions are captured into it. Bump re-render on each captured event.
  const sessionLog = useRef(createSessionEventLog()).current;
  const capturedCtx = useMemo<SovereignShellContext>(() => {
    const wrapped = withSessionCapture(ctx, {
      record: (event) => {
        sessionLog.record(event);
        bump();
      },
      events: sessionLog.events,
    });
    return wrapped;
  }, [ctx, sessionLog]);

  return (
    <section style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>LENS</h1>
        <p style={subtitleStyle}>Orientation &amp; Explanation · Companion Suite</p>
      </header>

      <div style={bannerStyle}>
        Signed in as <strong>{ctx.auth.user.name}</strong>. LENS explains how the platform
        works — it makes no decisions and takes no actions.
      </div>

      <nav style={tabBarStyle} aria-label="LENS surfaces">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              style={{
                ...tabStyle,
                color: active ? "#0f172a" : "#64748b",
                borderBottom: active ? "2px solid #0f172a" : "2px solid transparent",
                fontWeight: active ? 700 : 500,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <div style={bodyStyle}>
        {tab === "explainer" && <GovernanceExplainer ctx={capturedCtx} />}
        {tab === "navigator" && <PipelineNavigator ctx={ctx} />}
        {tab === "transparency" && <AITransparencyPanel events={sessionLog.events()} />}
      </div>
    </section>
  );
}

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
const tabBarStyle: CSSProperties = {
  display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", marginBottom: 20,
};
const tabStyle: CSSProperties = {
  padding: "8px 14px", fontSize: 14, background: "none", border: "none", cursor: "pointer",
};
const bodyStyle: CSSProperties = {};

export default LensApp;
