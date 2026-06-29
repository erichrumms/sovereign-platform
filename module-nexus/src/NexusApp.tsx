/**
 * SOVEREIGN Platform — module-nexus
 * NexusApp.tsx — NEXUS composition root (React).
 *
 * The single component the module mounts (via index.ts → createRoot) after the structural
 * role gate admits the operator. It lifts the work-request registry hook and the AgentOS
 * port ONCE here and passes them to the surfaces so they share one request list, then
 * renders the NEXUS chrome — including the Gate-1 AI disclosure and the GD-10 classification
 * boundary notice — with two tabs: Request Intake and the Request Queue (which shows the
 * selected request's detail).
 *
 * Item 57 (Session 22, D2): the AgentOS hand-off uses the LIVE AgentOS-backed port
 * (createAgentOSBackedPort) instead of the Session 15 synthetic dev port. The live port creates
 * a real AgentOS task, emits AGENTOS_TASK_ASSIGNED, and — via GD-19's shared task surface
 * (ctx.taskSurface, the ninth shell export) — publishes the task so it appears in the AgentOS
 * Task Registry panel. This is a configuration change at the composition root, not a NEXUS
 * rewrite (Standing Constraint #3); useRequestRegistry still consumes the injected AgentOSPort.
 *
 * Version: 1.1 · Session 22 (D2) · June 29, 2026
 */

import { useMemo, useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { useRequestRegistry } from "./useRequestRegistry";
import { createAgentOSBackedPort } from "../../module-agentos/src/nexus-agentos-port";
import { RequestIntakePanel } from "./RequestIntakePanel";
import { RequestQueuePanel } from "./RequestQueuePanel";

export interface NexusAppProps {
  ctx: SovereignShellContext;
}

type Tab = "intake" | "queue";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "intake", label: "Request Intake" },
  { id: "queue", label: "Request Queue" },
];

export function NexusApp({ ctx }: NexusAppProps): JSX.Element {
  // Live AgentOS-backed port (Item 57): captures the shell ctx so its submitTask creates a real
  // AgentOS task and publishes it to ctx.taskSurface. Stable across renders (the request lifecycle
  // and AgentOS task store live behind it), mirroring the prior synthetic port's identity.
  const port = useMemo(() => createAgentOSBackedPort(ctx), [ctx]);
  const registry = useRequestRegistry(ctx, port);
  const [tab, setTab] = useState<Tab>("intake");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <section style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>NEXUS</h1>
        <p style={subtitleStyle}>Work-Request Intake · Routing · Execution Hand-off to AgentOS</p>
      </header>

      <div style={disclosureStyle}>
        <strong>AI disclosure (CPMI-VRS Gate 1):</strong> NEXUS routes every work request to an AI agent class
        and hands execution to AgentOS, which runs the platform's governed agents. Requests requiring authorization
        are routed to the VIGIL approval queue. Outputs are advisory until human review.
      </div>

      <div style={boundaryStyle}>
        <strong>Classification boundary (GD-10):</strong> SOVEREIGN processes <strong>UNCLASSIFIED</strong> synthetic
        data only. CUI / SECRET / TOP_SECRET requests are refused at intake. Operator: <strong>{ctx.auth.user.name}</strong>.
        Governance Clock OFF.
      </div>

      <nav style={tabBarStyle} aria-label="NEXUS surfaces">
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

      <div>
        {tab === "intake" && <RequestIntakePanel registry={registry} ctx={ctx} />}
        {tab === "queue" && (
          <RequestQueuePanel registry={registry} port={port} selectedId={selectedId} onSelect={setSelectedId} />
        )}
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
const disclosureStyle: CSSProperties = {
  padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, color: "#1e40af", fontSize: 13, marginBottom: 10, maxWidth: 820,
};
const boundaryStyle: CSSProperties = {
  padding: "10px 14px", background: "#fef9c3", border: "1px solid #fde047", borderRadius: 8, color: "#854d0e", fontSize: 13, marginBottom: 16, maxWidth: 820,
};
const tabBarStyle: CSSProperties = { display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", marginBottom: 16 };
const tabStyle: CSSProperties = { padding: "8px 14px", fontSize: 14, background: "none", border: "none", cursor: "pointer" };

export default NexusApp;
