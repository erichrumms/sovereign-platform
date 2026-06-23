/**
 * SOVEREIGN Platform — module-lens
 * PipelineNavigator.tsx — LENS surface §2.2.
 *
 * Shows the user where a product sits in the SOVEREIGN pipeline, what it does, what it
 * feeds, and what the user is expected to do there. Powered by lens-orientation
 * (Analytical) as a STATIC render — it makes NO LLM call (spec §2.2); it reads the
 * static orientation knowledge base.
 *
 * Frozen-contract adaptation: the spec text reads `ctx.navigation.currentProduct`, but
 * the shell contract's navigation exposes `currentPath` / `breadcrumb` only. The
 * Navigator derives the product from `currentPath` and otherwise lets the user pick a
 * product to orient on — no shell-contract change (Standing Constraints #3 / #7).
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */

import { useState, type CSSProperties } from "react";

import type {
  SovereignShellContext,
  SovereignProduct,
} from "../../sovereign-shell/shell-contract";
import {
  PIPELINE_ORDER,
  PRODUCT_ORIENTATIONS,
  getOrientation,
  productFromPath,
} from "./orientation-data";

export interface PipelineNavigatorProps {
  ctx: SovereignShellContext;
}

export function PipelineNavigator({ ctx }: PipelineNavigatorProps): JSX.Element {
  const derived = productFromPath(ctx.navigation.currentPath);
  // Default the selection to the derived product, or the head of the pipeline.
  const [selected, setSelected] = useState<SovereignProduct>(derived ?? PIPELINE_ORDER[0]);
  const orientation = getOrientation(selected);

  return (
    <section aria-label="Pipeline Navigator" style={wrapStyle}>
      <p style={leadStyle}>
        The SOVEREIGN pipeline: {PIPELINE_ORDER.join(" → ")}.{" "}
        {derived
          ? `You are currently in ${derived}.`
          : "Pick a product below to see its place in the pipeline."}
      </p>

      <div style={stripStyle}>
        {PIPELINE_ORDER.map((p) => {
          const isSelected = p === selected;
          return (
            <button
              key={p}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelected(p)}
              style={{
                ...chipStyle,
                background: isSelected ? "#0f172a" : "#f1f5f9",
                color: isSelected ? "#ffffff" : "#334155",
                borderColor: isSelected ? "#0f172a" : "#e2e8f0",
              }}
            >
              {p}
            </button>
          );
        })}
      </div>

      {orientation && (
        <article style={cardStyle} aria-label={`${selected} orientation`}>
          <h3 style={cardTitleStyle}>{selected}</h3>
          <p style={roleStyle}>{orientation.role_in_pipeline}</p>
          <dl style={dlStyle}>
            <Row
              label="Receives from"
              value={orientation.receives_from.length ? orientation.receives_from.join(", ") : "—"}
            />
            <Row
              label="Feeds into"
              value={orientation.feeds_into.length ? orientation.feeds_into.join(", ") : "—"}
            />
            <Row label="What you do here" value={orientation.user_action} />
            <Row
              label="AI agents active here"
              value={
                orientation.active_agents.length
                  ? orientation.active_agents.join(", ")
                  : "None — no AI agents are registered inside this product yet."
              }
            />
          </dl>
        </article>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div style={rowStyle}>
      <dt style={dtStyle}>{label}</dt>
      <dd style={ddStyle}>{value}</dd>
    </div>
  );
}

// Exported so a future dynamic orientation (PR-LENS-002) can reuse the catalog.
export { PRODUCT_ORIENTATIONS };

const wrapStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 };
const leadStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#475569" };
const stripStyle: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 6 };
const chipStyle: CSSProperties = {
  padding: "6px 12px", fontSize: 12, fontWeight: 600, borderRadius: 999, border: "1px solid",
  cursor: "pointer",
};
const cardStyle: CSSProperties = {
  padding: 16, border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff",
};
const cardTitleStyle: CSSProperties = { margin: "0 0 6px", fontSize: 16 };
const roleStyle: CSSProperties = { margin: "0 0 12px", fontSize: 13, color: "#334155", lineHeight: 1.5 };
const dlStyle: CSSProperties = { margin: 0, display: "flex", flexDirection: "column", gap: 8 };
const rowStyle: CSSProperties = { display: "flex", gap: 10 };
const dtStyle: CSSProperties = {
  flex: "0 0 140px", fontSize: 12, fontWeight: 700, color: "#64748b",
};
const ddStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#0f172a", lineHeight: 1.5 };

export default PipelineNavigator;
