/**
 * SOVEREIGN Platform — module-aria
 * AriaApp.tsx — ARIA Suite composition root (React).
 *
 * The single component the module mounts after the PLATFORM_ADMIN gate admits the reviewer. It
 * renders the ARIA chrome and routes between the three ARIA Suite components as tabs:
 *   - CLEAR  — Continuous Legal and Regulatory Evaluation and Assessment Review (compliance)
 *   - TRACER — Traceability and Accountability Chain for Evidence Records (traceability)
 *   - ARC    — Adaptive Regulatory Change engine (regulatory-impact modeling)
 *
 * Session 22 (D4) SCOPE: scaffold only. TRACER and ARC remain placeholders describing the
 * component and the Session in which their logic lands (TRACER S24, ARC S25 — docs/16 §9).
 * Session 23 (D2/D3): the CLEAR tab now renders the live ClearPanel — the Compliance Dashboard
 * and the Certification Queue — replacing its scaffold placeholder. Every screen is built to
 * Gap 5/6: the ARIA determinism notice and GD-10 boundary are Category 2 (permanent, blue);
 * substantive content sits in white cards on the light page canvas (Category 3 / Primary).
 * Session 24 (D2): the TRACER tab now renders the live TracerExplorer — the Traceability
 * Explorer — replacing its scaffold placeholder.
 * Session 25 (D2): the ARC tab now renders the live ArcImpactModeler — the Regulatory Impact
 * Modeler — replacing the last scaffold placeholder. All three ARIA components are now live.
 *
 * Version: 1.3 · Session 25 (ARC live — ARIA Suite feature-complete) · June 29, 2026
 */

import { useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  DeterminismBanner,
  ClassificationBoundaryBanner,
  rootStyle,
  titleStyle,
  subtitleStyle,
} from "./banners";
import { ClearPanel } from "./ClearPanel";
import { TracerExplorer } from "./TracerExplorer";
import { ArcImpactModeler } from "./ArcImpactModeler";

export interface AriaAppProps {
  ctx: SovereignShellContext;
}

type Tab = "clear" | "tracer" | "arc";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "clear", label: "CLEAR" },
  { id: "tracer", label: "TRACER" },
  { id: "arc", label: "ARC" },
];


export function AriaApp({ ctx }: AriaAppProps): JSX.Element {
  const [tab, setTab] = useState<Tab>("clear");

  return (
    <section style={rootStyle}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={titleStyle}>ARIA Suite</h1>
        <p style={subtitleStyle}>
          Compliance, Traceability, and Regulatory Impact — the governance layer after APEX in the pipeline.
        </p>
      </header>

      {/* Category 2 — permanent governance guardrails (blue). */}
      <DeterminismBanner />
      <ClassificationBoundaryBanner operatorName={ctx.auth.user.name} />

      <nav style={tabBarStyle} aria-label="ARIA Suite components">
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

      {/* Category 3 — substantive content (Primary). CLEAR (S23), TRACER (S24), ARC (S25) all live. */}
      {tab === "clear" && <ClearPanel ctx={ctx} />}
      {tab === "tracer" && <TracerExplorer ctx={ctx} />}
      {tab === "arc" && <ArcImpactModeler ctx={ctx} />}
    </section>
  );
}

const tabBarStyle: CSSProperties = { display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", marginBottom: 16 };
const tabStyle: CSSProperties = { padding: "8px 14px", fontSize: 14, background: "none", border: "none", cursor: "pointer" };

export default AriaApp;
