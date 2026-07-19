/**
 * SOVEREIGN Platform — sovereign-shell
 * PlatformHome.tsx — landing page (Session 30, D4 — WE-7).
 *
 * Replaces the blank canvas that appeared on platform load before any module was
 * selected. Shows three panels framed as "current state" (not live activity):
 *
 *   1. CPMI-VRS status rollup — overall portfolio health + per-product gate state.
 *   2. Platform facts — registered module count, agent count, governance clock state.
 *   3. Things to do — cross-product aggregation from governance context: products on
 *      HOLD, products at GATE_3_PENDING, pending Gate 3 reviews.
 *
 * Reads from `ctx.governance` only — no additional imports, no new shell exports.
 * The navigation instruction ("Select a module from the left nav") is the only
 * interactive element; this page is purely informational.
 *
 * Version: 1.0 · Session 30 · July 12, 2026
 */

import type { CSSProperties } from "react";
import type { SovereignShellContext, VRSGateStatus } from "../shell-contract";

// Authoritative from Agent_Identity_Standard.md (v1.0, 44 agents total, frozen).
const TOTAL_REGISTERED_AGENTS = 44;
// Primary + companion modules (SovereignProduct union, shell-contract v1.16).
const PRIMARY_MODULE_COUNT = 6;   // NEXUS CPMI APEX FLOWPATH AGENTOS ARIA
const COMPANION_MODULE_COUNT = 4; // COUNSEL SCRIBE LENS VIGIL

const GATE_STATE_ORDER: Record<string, number> = {
  HOLD: -1,
  NOT_STARTED: 0,
  GATE_1_COMPLETE: 1,
  GATE_2_COMPLETE: 2,
  GATE_3_PENDING: 3,
  GATE_3_COMPLETE: 4,
  GATE_4_CERTIFIED: 5,
};

const GATE_STATE_LABEL: Record<string, string> = {
  HOLD: "On Hold",
  NOT_STARTED: "Not started",
  GATE_1_COMPLETE: "Gate 1 complete",
  GATE_2_COMPLETE: "Gate 2 complete",
  GATE_3_PENDING: "Gate 3 pending",
  GATE_3_COMPLETE: "Gate 3 complete",
  GATE_4_CERTIFIED: "Certified",
};

function overallBadgeStyle(overall: string): CSSProperties {
  if (overall === "GREEN") return { ...badgeBase, background: "#dcfce7", color: "#166534", borderColor: "#86efac" };
  if (overall === "AMBER") return { ...badgeBase, background: "#fef9c3", color: "#854d0e", borderColor: "#fde047" };
  return { ...badgeBase, background: "#fee2e2", color: "#7f1d1d", borderColor: "#fca5a5" };
}

function gateStateBadge(state: string): CSSProperties {
  if (state === "HOLD") return { ...tagBase, background: "#fee2e2", color: "#7f1d1d" };
  if (state === "GATE_4_CERTIFIED") return { ...tagBase, background: "#dcfce7", color: "#166534" };
  if (state === "GATE_3_PENDING") return { ...tagBase, background: "#fef9c3", color: "#854d0e" };
  return { ...tagBase, background: "#f1f5f9", color: "#475569" };
}

function ProductRow({ gs }: { gs: VRSGateStatus }): JSX.Element {
  return (
    <div style={productRowStyle}>
      <span style={productNameStyle}>{gs.product}</span>
      <span style={gateStateBadge(gs.gate_state)}>{GATE_STATE_LABEL[gs.gate_state] ?? gs.gate_state}</span>
      {gs.hold_reason && (
        <span style={holdReasonStyle} title={gs.hold_reason}>Hold: {gs.hold_reason}</span>
      )}
    </div>
  );
}

function buildThingsToDo(
  governance: SovereignShellContext["governance"]
): Array<{ severity: "high" | "medium" | "info"; text: string }> {
  const items: Array<{ severity: "high" | "medium" | "info"; text: string }> = [];
  const { cpmiStatus, vrsGates, isOnHold } = governance;

  // Products on HOLD.
  const onHoldProducts = vrsGates.filter((g) => isOnHold(g.product));
  if (onHoldProducts.length > 0) {
    items.push({
      severity: "high",
      text: `${onHoldProducts.map((g) => g.product).join(", ")} on HOLD — resolve hold condition before proceeding`,
    });
  }

  // Products at GATE_3_PENDING (need Gate 3 review by the certifying officer).
  const gate3Pending = vrsGates.filter((g) => g.gate_state === "GATE_3_PENDING" && !isOnHold(g.product));
  if (gate3Pending.length > 0) {
    items.push({
      severity: "medium",
      text: `${gate3Pending.map((g) => g.product).join(", ")} — Gate 3 review ready for certifying officer`,
    });
  }

  // Pending Gate 3 reviews from CPMI portfolio status.
  if (cpmiStatus.pending_gate3_reviews > 0) {
    items.push({
      severity: "medium",
      text: `${cpmiStatus.pending_gate3_reviews} pending Gate 3 review${cpmiStatus.pending_gate3_reviews !== 1 ? "s" : ""} — open CPMI for details`,
    });
  }

  // Overall not GREEN.
  if (cpmiStatus.overall !== "GREEN") {
    items.push({
      severity: cpmiStatus.overall === "AMBER" ? "medium" : "high",
      text: `Portfolio overall: ${cpmiStatus.overall} — review product status in CPMI`,
    });
  }

  if (items.length === 0) {
    items.push({ severity: "info", text: "No actions required — all products GREEN" });
  }

  return items;
}

export interface PlatformHomeProps {
  ctx: SovereignShellContext;
}

export function PlatformHome({ ctx }: PlatformHomeProps): JSX.Element {
  const { cpmiStatus, vrsGates } = ctx.governance;
  const thingsToDo = buildThingsToDo(ctx.governance);

  // Sort products: HOLD first, then by gate state ascending.
  const sortedGates = [...vrsGates].sort(
    (a, b) => (GATE_STATE_ORDER[a.gate_state] ?? 0) - (GATE_STATE_ORDER[b.gate_state] ?? 0)
  );

  return (
    <div style={pageStyle}>
      <header style={pageHeaderStyle}>
        <h1 style={pageTitleStyle}>SOVEREIGN Platform</h1>
        <p style={pageSubtitleStyle}>
          Select a module from the left navigation to begin · Status as of{" "}
          {Number.isNaN(Date.parse(cpmiStatus.last_updated))
            ? "Status date unavailable"
            : new Date(cpmiStatus.last_updated).toLocaleString(undefined, {
                month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
        </p>
      </header>

      <div style={gridStyle}>
        {/* ---- Panel 1: CPMI-VRS status rollup ---- */}
        <section style={panelStyle} aria-label="CPMI-VRS portfolio status">
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>CPMI-VRS Status</h2>
            <span style={overallBadgeStyle(cpmiStatus.overall)}>{cpmiStatus.overall}</span>
          </div>
          <div style={productListStyle}>
            {sortedGates.length === 0 ? (
              <p style={mutedStyle}>No product gate status available.</p>
            ) : (
              sortedGates.map((gs) => <ProductRow key={gs.product} gs={gs} />)
            )}
          </div>
          {cpmiStatus.pending_gate3_reviews > 0 && (
            <p style={pendingReviewsStyle}>
              {cpmiStatus.pending_gate3_reviews} Gate 3 review{cpmiStatus.pending_gate3_reviews !== 1 ? "s" : ""} pending
            </p>
          )}
        </section>

        {/* ---- Panel 2: Platform facts ---- */}
        <section style={panelStyle} aria-label="Platform facts">
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Platform State</h2>
          </div>
          <dl style={factListStyle}>
            <div style={factRowStyle}>
              <dt style={factLabelStyle}>Registered modules</dt>
              <dd style={factValueStyle}>
                {PRIMARY_MODULE_COUNT + COMPANION_MODULE_COUNT}
                <span style={factDetailStyle}> ({PRIMARY_MODULE_COUNT} primary · {COMPANION_MODULE_COUNT} companion)</span>
              </dd>
            </div>
            <div style={factRowStyle}>
              <dt style={factLabelStyle}>Registered agents</dt>
              <dd style={factValueStyle}>
                {TOTAL_REGISTERED_AGENTS}
                <span style={factDetailStyle}> (Agent Identity Standard v1.0)</span>
              </dd>
            </div>
            <div style={factRowStyle}>
              <dt style={factLabelStyle}>Governance clock</dt>
              <dd style={factValueStyle}>OFF <span style={factDetailStyle}>(Stage 2 synthetic — EAMS SSO not wired)</span></dd>
            </div>
            <div style={factRowStyle}>
              <dt style={factLabelStyle}>Data classification</dt>
              <dd style={factValueStyle}>UNCLASSIFIED / SYNTH- <span style={factDetailStyle}>(GD-10)</span></dd>
            </div>
            <div style={factRowStyle}>
              <dt style={factLabelStyle}>Operator</dt>
              <dd style={factValueStyle}>{ctx.auth.user.name} <span style={factDetailStyle}>({ctx.auth.user.role})</span></dd>
            </div>
          </dl>
        </section>

        {/* ---- Panel 3: Things to do ---- */}
        <section style={{ ...panelStyle, gridColumn: "1 / -1" }} aria-label="Things to do">
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Things to Do</h2>
            <span style={mutedStyle}>Cross-product · current state</span>
          </div>
          <ul style={todoListStyle}>
            {thingsToDo.map((item, i) => (
              <li key={i} style={todoItemStyle(item.severity)}>
                <span style={severityDotStyle(item.severity)} aria-hidden="true" />
                {item.text}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

// ---- Styles ----------------------------------------------------------------

const pageStyle: CSSProperties = {
  padding: "28px 32px",
  fontFamily: "system-ui, sans-serif",
  color: "#0f172a",
  maxWidth: 1100,
  height: "100%",
  boxSizing: "border-box",
  overflow: "auto",
};

const pageHeaderStyle: CSSProperties = { marginBottom: 24 };
const pageTitleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 24, fontWeight: 700, letterSpacing: 0.5 };
const pageSubtitleStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#475569" };

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const panelStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: "14px 16px",
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const panelHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};

const panelTitleStyle: CSSProperties = { margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" };

const badgeBase: CSSProperties = {
  padding: "2px 10px",
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 700,
  border: "1px solid",
};

const tagBase: CSSProperties = {
  padding: "1px 8px",
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const productListStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };

const productRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 12,
};

const productNameStyle: CSSProperties = {
  minWidth: 80,
  fontWeight: 600,
  color: "#0f172a",
};

const holdReasonStyle: CSSProperties = {
  fontSize: 11,
  color: "#7f1d1d",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: 200,
};

const mutedStyle: CSSProperties = { margin: 0, fontSize: 12, color: "#64748b" };

const pendingReviewsStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: "#854d0e",
  fontWeight: 600,
  background: "#fef9c3",
  padding: "4px 10px",
  borderRadius: 6,
  border: "1px solid #fde047",
};

const factListStyle: CSSProperties = { margin: 0, display: "flex", flexDirection: "column", gap: 6 };

const factRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 8,
  borderBottom: "1px solid #f1f5f9",
  paddingBottom: 4,
};

const factLabelStyle: CSSProperties = { fontSize: 12, color: "#64748b", fontWeight: 500 };
const factValueStyle: CSSProperties = { fontSize: 12, color: "#0f172a", fontWeight: 600, textAlign: "right" };
const factDetailStyle: CSSProperties = { fontWeight: 400, color: "#475569" };

const todoListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

function todoItemStyle(severity: "high" | "medium" | "info"): CSSProperties {
  const base: CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 6,
  };
  if (severity === "high") return { ...base, background: "#fee2e2", color: "#7f1d1d" };
  if (severity === "medium") return { ...base, background: "#fef9c3", color: "#78350f" };
  return { ...base, background: "#f0fdf4", color: "#166534" };
}

function severityDotStyle(severity: "high" | "medium" | "info"): CSSProperties {
  const color = severity === "high" ? "#dc2626" : severity === "medium" ? "#d97706" : "#16a34a";
  return {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
    marginTop: 3,
  };
}
