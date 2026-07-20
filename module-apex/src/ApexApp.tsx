/**
 * SOVEREIGN Platform — module-apex
 * ApexApp.tsx — APEX composition root (React).
 *
 * The single component the module mounts after the role gate admits the reviewer. It lifts the
 * ApexDataAdapter ONCE and renders the APEX chrome with five tabs: Portfolio Dashboard,
 * Program Detail, Report Generation, CPMI-VRS Certification (the gate runner — Session 18), and
 * the PPBE performance dashboard (Session 32 — replaced the Session 17 Execution Monitoring
 * stub on the same tab). The "Export Dossier" actions and program links
 * route between tabs. Governance banners on each screen are Category 2 (permanent, blue); status
 * notices are Category 1 (amber); program content is Category 3 (substantive) — the Gap 6
 * three-category model.
 *
 * Version: 1.1 (CPMI-VRS Gates tab) · Session 18 · June 26, 2026
 */

import { useEffect, useMemo, useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { createSyntheticApexDataAdapter, type ApexDataAdapter } from "./apex-data-adapter";
import { PortfolioDashboard } from "./PortfolioDashboard";
import { ProgramDetailView } from "./ProgramDetailView";
import { ReportGenerationPanel } from "./ReportGenerationPanel";
import { GateRunnerPanel } from "./GateRunnerPanel";
import { PPBEDashboard } from "./PPBEDashboard";
import { PPBEAgentsPanel } from "./PPBEAgentsPanel";
import { createSyntheticPPBEDashboardInputs } from "./ppbe-data-adapter";
import { publishProgramStatuses } from "./ppbe-dashboard";

export interface ApexAppProps {
  ctx: SovereignShellContext;
  /** Injectable data adapter (tests). Defaults to the synthetic/dev backing. */
  adapter?: ApexDataAdapter;
}

type Tab = "portfolio" | "detail" | "report" | "gates" | "execution";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "portfolio", label: "Portfolio Dashboard" },
  { id: "detail", label: "Program Detail" },
  { id: "report", label: "Report Generation" },
  { id: "gates", label: "CPMI-VRS Certification" },
  { id: "execution", label: "Execution Monitoring" },
];

export function ApexApp({ ctx, adapter: injected }: ApexAppProps): JSX.Element {
  const adapter = useMemo(() => injected ?? createSyntheticApexDataAdapter(), [injected]);
  const ppbeInputs = useMemo(() => createSyntheticPPBEDashboardInputs(), []);
  const [tab, setTab] = useState<Tab>("portfolio");

  // GD-23: publish per-program obligation status to the shared surface whenever
  // PPBE inputs are available. Runs once on mount (ppbeInputs is stable).
  useEffect(() => {
    publishProgramStatuses(ppbeInputs, ctx.programStatusSurface, new Date().toISOString());
  }, [ppbeInputs, ctx.programStatusSurface]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  const openProgram = (programId: string): void => {
    setSelectedProgram(programId);
    setTab("detail");
  };
  const exportDossierFor = (programId: string): void => {
    setSelectedProgram(programId);
    setTab("report");
  };

  return (
    <section style={shellStyle}>
      <nav style={tabBarStyle} aria-label="APEX surfaces">
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

      {tab === "portfolio" && (
        <PortfolioDashboard ctx={ctx} adapter={adapter} onOpenProgram={openProgram} onExportDossier={exportDossierFor} />
      )}
      {tab === "detail" && (
        selectedProgram ? (
          <ProgramDetailView ctx={ctx} adapter={adapter} programId={selectedProgram} onExportDossier={exportDossierFor} onBack={() => setTab("portfolio")} />
        ) : (
          <p style={detailHintStyle}>Select a program from the Portfolio Dashboard to view its detail.</p>
        )
      )}
      {tab === "report" && <ReportGenerationPanel ctx={ctx} adapter={adapter} />}
      {tab === "gates" && <GateRunnerPanel ctx={ctx} adapter={adapter} />}
      {/* Session 32 (D5) replaced the Session 17 stub with the live PPBE dashboard;
          Session 33 (goal item 8) wired the host data adapter over the canonical
          seeded portfolio — the dashboard now renders real metrics. A production
          deployment swaps the adapter, not the component.
          Session 46 (D2): onSelectProgram wired to openProgram — the existing
          mechanism (setSelectedProgram + setTab("detail")), not a new one. */}
      {tab === "execution" && (
        <>
          <PPBEDashboard inputs={ppbeInputs} onSelectProgram={openProgram} />
          <PPBEAgentsPanel ctx={ctx} inputs={ppbeInputs} />
        </>
      )}
    </section>
  );
}

const shellStyle: CSSProperties = { height: "100%", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" };
const tabBarStyle: CSSProperties = { display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", padding: "0 32px", background: "#fff" };
const tabStyle: CSSProperties = { padding: "10px 14px", fontSize: 14, background: "none", border: "none", cursor: "pointer" };
const detailHintStyle: CSSProperties = { margin: "32px", fontSize: 14, color: "#64748b" };

export default ApexApp;
