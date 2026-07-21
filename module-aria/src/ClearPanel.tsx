/**
 * SOVEREIGN Platform — module-aria
 * ClearPanel.tsx — the CLEAR component shell (Stage 6, Session 23).
 *
 * Composes the two CLEAR surfaces behind a sub-navigation inside the ARIA Suite CLEAR
 * tab: the Compliance Dashboard (D2) and the Certification Queue (D3). The dashboard's
 * "Review in Certification Queue" links switch to the queue. Both read and write the
 * shell ctx.aria certification surface (GD-20), so a decision recorded in the queue is
 * reflected in the dashboard's status column.
 *
 * Version: 1.0 · Session 23 · June 29, 2026
 */

import { useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { ClearDashboard } from "./ClearDashboard";
import { ClearCertificationQueue } from "./ClearCertificationQueue";

type ClearView = "dashboard" | "queue";

export function ClearPanel({
  ctx,
  initialDocumentId,
}: {
  ctx: SovereignShellContext;
  /** GD-27 — a navigation intent naming a document starts on the Certification Queue. */
  initialDocumentId?: string;
}): JSX.Element {
  const [view, setView] = useState<ClearView>(initialDocumentId ? "queue" : "dashboard");

  return (
    <div data-testid="clear-panel">
      <nav style={subTabBarStyle} aria-label="CLEAR surfaces">
        <SubTab id="dashboard" label="Compliance Dashboard" active={view === "dashboard"} onClick={setView} />
        <SubTab id="queue" label="Certification Queue" active={view === "queue"} onClick={setView} />
      </nav>

      {view === "dashboard" ? (
        <ClearDashboard ctx={ctx} onOpenQueue={() => setView("queue")} />
      ) : (
        <ClearCertificationQueue ctx={ctx} initialSelectedDocumentId={initialDocumentId} />
      )}
    </div>
  );
}

function SubTab({ id, label, active, onClick }: { id: ClearView; label: string; active: boolean; onClick: (v: ClearView) => void }): JSX.Element {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onClick(id)}
      style={{ ...subTabStyle, color: active ? "#0f172a" : "#475569", borderBottom: active ? "2px solid #1d4ed8" : "2px solid transparent", fontWeight: active ? 700 : 500 }}
    >
      {label}
    </button>
  );
}

const subTabBarStyle: CSSProperties = { display: "flex", gap: 4, marginBottom: 12 };
const subTabStyle: CSSProperties = { padding: "6px 12px", fontSize: 13, background: "none", border: "none", cursor: "pointer" };

export default ClearPanel;
