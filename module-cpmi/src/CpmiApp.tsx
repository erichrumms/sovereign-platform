/**
 * SOVEREIGN Platform — module-cpmi
 * CpmiApp.tsx — CPMI composition root (React).
 *
 * The single React component the module mounts (via index.ts → createRoot) into the
 * shell-provided outlet, AFTER the structural role gate in index.ts admits the operator.
 * It renders the CPMI chrome and three tabs: the Reasoning Chain (where AI runs, carrying
 * the Gate 1 AI disclosure), the read-only World Model query, and the CPMI-VRS Gate Runner
 * (Gates 1/2 auto, Gate 3 human attestation, Gate 4 monitoring, VRS certification).
 *
 * Version: 1.0 · Session 11 · June 23, 2026
 */

import { useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { ReasoningChainPanel } from "./ReasoningChainPanel";
import { WorldModelPanel } from "./WorldModelPanel";
import { GateRunnerPanel } from "./GateRunnerPanel";

export interface CpmiAppProps {
  ctx: SovereignShellContext;
}

type Tab = "reasoning" | "world-model" | "gates";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "reasoning", label: "Reasoning Chain" },
  { id: "world-model", label: "World Model" },
  { id: "gates", label: "CPMI-VRS Gates" },
];

export function CpmiApp({ ctx }: CpmiAppProps): JSX.Element {
  const [tab, setTab] = useState<Tab>("reasoning");

  return (
    <section style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>CPMI</h1>
        <p style={subtitleStyle}>Contextual Program Management Intelligence · AI Governance Engine</p>
      </header>

      <div style={bannerStyle}>
        CPMI is the platform's AI governance engine — its outputs are the governance foundation for all six
        products, under enhanced monitoring (0.7× anomaly threshold). Reasoning is advisory until Gate 3 human
        attestation. Operator: <strong>{ctx.auth.user.name}</strong>. Synthetic/dev data (Governance Clock OFF).
      </div>

      <nav style={tabBarStyle} aria-label="CPMI surfaces">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              style={{ ...tabStyle, color: active ? "#0f172a" : "#64748b", borderBottom: active ? "2px solid #0f172a" : "2px solid transparent", fontWeight: active ? 700 : 500 }}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <div>
        {tab === "reasoning" && <ReasoningChainPanel ctx={ctx} />}
        {tab === "world-model" && <WorldModelPanel />}
        {tab === "gates" && <GateRunnerPanel ctx={ctx} />}
      </div>
    </section>
  );
}

const rootStyle: CSSProperties = {
  fontFamily: "system-ui, sans-serif", padding: 32, color: "#0f172a", height: "100%", boxSizing: "border-box", overflow: "auto",
};
const headerStyle: CSSProperties = { marginBottom: 16 };
const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 22 };
const subtitleStyle: CSSProperties = { margin: 0, color: "#475569" };
const bannerStyle: CSSProperties = {
  padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, color: "#1e40af", fontSize: 13, marginBottom: 16, maxWidth: 760,
};
const tabBarStyle: CSSProperties = { display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", marginBottom: 16 };
const tabStyle: CSSProperties = { padding: "8px 14px", fontSize: 14, background: "none", border: "none", cursor: "pointer" };

export default CpmiApp;
