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
 *
 * Version: 1.1 · Session 23 (CLEAR live) · June 29, 2026
 */

import { useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  DeterminismBanner,
  ClassificationBoundaryBanner,
  contentCardStyle,
  sectionHeadingStyle,
  bodyTextStyle,
  rootStyle,
  titleStyle,
  subtitleStyle,
} from "./banners";
import { ClearPanel } from "./ClearPanel";

export interface AriaAppProps {
  ctx: SovereignShellContext;
}

type Tab = "clear" | "tracer" | "arc";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "clear", label: "CLEAR" },
  { id: "tracer", label: "TRACER" },
  { id: "arc", label: "ARC" },
];

/** A scaffold placeholder for an ARIA component panel (Session 22 — logic lands in a later session). */
function PlaceholderPanel({ heading, summary, surfaces, arrivingIn }: {
  heading: string;
  summary: string;
  surfaces: string[];
  arrivingIn: string;
}): JSX.Element {
  return (
    <div style={contentCardStyle} data-testid={`aria-panel-${heading.toLowerCase()}`}>
      <h2 style={sectionHeadingStyle}>{heading}</h2>
      <p style={bodyTextStyle}>{summary}</p>
      <p style={{ ...bodyTextStyle, fontWeight: 600, marginBottom: 4 }}>What it will surface for a reviewer:</p>
      <ul style={listStyle}>
        {surfaces.map((s) => (
          <li key={s} style={{ marginBottom: 4 }}>{s}</li>
        ))}
      </ul>
      <p style={{ ...bodyTextStyle, color: "#64748b", margin: 0 }}>{arrivingIn}</p>
    </div>
  );
}

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

      {/* Category 3 — substantive content (Primary). CLEAR is live (S23); TRACER/ARC scaffold. */}
      {tab === "clear" && <ClearPanel ctx={ctx} />}
      {tab === "tracer" && (
        <PlaceholderPanel
          heading="TRACER"
          summary="Traceability and Accountability Chain for Evidence Records. TRACER traces every significant decision, document, and obligation back to its authoritative regulatory or policy basis — an unbroken chain from action to authority."
          surfaces={[
            "A traceability explorer: select any output and see its complete chain of authority.",
            "Decision, document, and obligation chains — each node cited to a source document or Logger event.",
            "Orphan findings: any output lacking a traceable regulatory basis.",
          ]}
          arrivingIn="Scaffold only this session — the Traceability Explorer arrives in Session 24."
        />
      )}
      {tab === "arc" && (
        <PlaceholderPanel
          heading="ARC"
          summary="Adaptive Regulatory Change engine. ARC answers 'if this regulation changes, what breaks?' — it models the operational impact of a proposed regulatory change before it is implemented, so adaptation is proactive rather than reactive."
          surfaces={[
            "A regulatory impact modeler: enter a proposed change and see what it affects.",
            "Impacted workflows, rules, chains, and templates, scored by severity (breaking / significant / minor).",
            "An impact report that feeds COUNSEL for adaptation decisions and NEXUS for action items.",
          ]}
          arrivingIn="Scaffold only this session — the Regulatory Impact Modeler arrives in Session 25."
        />
      )}
    </section>
  );
}

const tabBarStyle: CSSProperties = { display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", marginBottom: 16 };
const tabStyle: CSSProperties = { padding: "8px 14px", fontSize: 14, background: "none", border: "none", cursor: "pointer" };
const listStyle: CSSProperties = { margin: "0 0 10px", paddingLeft: 20, color: "#334155", fontSize: 14, lineHeight: 1.5, maxWidth: 820 };

export default AriaApp;
