/**
 * SOVEREIGN Platform — module-agentos
 * AgentOSApp.tsx — AgentOS composition root (React).
 *
 * The single component the module mounts (via index.ts → createRoot) after the structural
 * role gate admits the operator. It lifts the task registry and dispatcher hooks ONCE here
 * and passes them to both surfaces so they share one task list, then renders the AgentOS
 * chrome with two tabs: the Task Registry (lifecycle state) and Agent Dispatch (dispatch +
 * the VIGIL approval queue).
 *
 * Version: 1.0 · Session 14 · June 24, 2026
 */

import { useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { useTaskRegistry } from "./useTaskRegistry";
import { useAgentDispatcher } from "./useAgentDispatcher";
import { TaskRegistryPanel } from "./TaskRegistryPanel";
import { AgentDispatchPanel } from "./AgentDispatchPanel";

export interface AgentOSAppProps {
  ctx: SovereignShellContext;
}

type Tab = "tasks" | "dispatch";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "tasks", label: "Task Registry" },
  { id: "dispatch", label: "Agent Dispatch" },
];

export function AgentOSApp({ ctx }: AgentOSAppProps): JSX.Element {
  const registry = useTaskRegistry(ctx);
  const dispatcher = useAgentDispatcher();
  const [tab, setTab] = useState<Tab>("tasks");

  return (
    <section style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>AgentOS</h1>
        <p style={subtitleStyle}>Agent Orchestration · Task Lifecycle · MLOps Backbone</p>
      </header>

      <div style={bannerStyle}>
        AgentOS orchestrates agents and routes human authorizations to VIGIL. It embeds the Security Framework
        and CPMI-VRS — agents inherit platform governance. Operator: <strong>{ctx.auth.user.name}</strong>.
        GD-10: UNCLASSIFIED synthetic data only (Governance Clock OFF).
      </div>

      <nav style={tabBarStyle} aria-label="AgentOS surfaces">
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
        {tab === "tasks" && <TaskRegistryPanel registry={registry} />}
        {tab === "dispatch" && <AgentDispatchPanel registry={registry} dispatcher={dispatcher} />}
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

export default AgentOSApp;
