/**
 * SOVEREIGN Platform — sovereign-shell
 * governance/CPMIVRSDashboard.tsx
 *
 * THE CPMI-VRS STATUS DASHBOARD — PLACEHOLDER.
 *
 * Renders the portfolio governance view from ctx.governance: overall status,
 * per-product VRS gate state, certification, and HOLD reasons. This is the
 * shell governance dashboard the CPMI Independent Validation Architecture
 * (architecture.md §15.4) calls for — "a portfolio-level view of CPMI behavior
 * over time, independent of any individual query."
 *
 * PLACEHOLDER scope (Session 2B): the data source is the synthetic snapshot
 * seeded into the shell. In Stage 3, when CPMI's world model REST API connects
 * (GET /v1/world-model/portfolio-status, GET /v1/vrs/certificates/{id}), the
 * snapshot source swaps to live queries with no change to this component — it
 * already reads the contract governance export, not any data source directly.
 *
 * Version: 1.0 · Session 2B · June 2, 2026
 */

import type { CSSProperties } from "react";
import type { SovereignShellContext } from "../../shell-contract";
import { SOVEREIGN_THEME as T } from "../navigation/theme";
import { gateVisual, overallColor } from "./gateStatus";

export interface CPMIVRSDashboardProps {
  governance: SovereignShellContext["governance"];
}

export function CPMIVRSDashboard({
  governance,
}: CPMIVRSDashboardProps): JSX.Element {
  const { cpmiStatus, vrsGates } = governance;

  return (
    <section style={rootStyle}>
      <header style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: T.text.primary }}>
            CPMI-VRS Portfolio Status
          </h2>
          <span
            style={{
              ...pillStyle,
              background: overallColor(cpmiStatus.overall),
              color: "#0D1018",
            }}
          >
            {cpmiStatus.overall}
          </span>
        </div>
        <div style={{ marginTop: 6, color: T.text.muted, fontSize: 12 }}>
          Last updated: {cpmiStatus.last_updated} · Pending Gate 3 reviews:{" "}
          {cpmiStatus.pending_gate3_reviews}
        </div>
      </header>

      <table style={tableStyle}>
        <thead>
          <tr>
            {["Product", "VRS Gate", "Last Certified", "Certifying Officer", "Hold Reason"].map(
              (h) => (
                <th key={h} style={thStyle}>
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {vrsGates.map((gate) => {
            const visual = gateVisual(gate.gate_state);
            const held = governance.isOnHold(gate.product);
            return (
              <tr
                key={gate.product}
                style={{
                  background: held ? "rgba(224,83,63,0.08)" : "transparent",
                }}
              >
                <td style={tdStyle}>
                  <span style={{ fontWeight: 600 }}>{gate.product}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: visual.color,
                      }}
                    />
                    <span style={{ color: visual.color }}>{visual.label}</span>
                  </span>
                </td>
                <td style={tdStyle}>
                  {gate.last_certified ?? (
                    <span style={{ color: T.text.muted }}>—</span>
                  )}
                </td>
                <td style={tdStyle}>
                  {gate.certifying_officer ?? (
                    <span style={{ color: T.text.muted }}>—</span>
                  )}
                </td>
                <td style={tdStyle}>
                  {gate.hold_reason ? (
                    <span style={{ color: T.semantic.red }}>
                      {gate.hold_reason}
                    </span>
                  ) : (
                    <span style={{ color: T.text.muted }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <footer style={footnoteStyle}>
        Placeholder view · Synthetic data — the Governance Clock has not
        activated. CPMI world model REST API connects in Stage 3.
      </footer>
    </section>
  );
}

const rootStyle: CSSProperties = {
  padding: 24,
  fontFamily: T.font.sans,
  color: T.text.primary,
  background: T.bg.base,
  minHeight: "100%",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: `1px solid ${T.border}`,
  color: T.text.secondary,
  fontWeight: 600,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

const tdStyle: CSSProperties = {
  padding: "10px",
  borderBottom: `1px solid ${T.bg.elevated}`,
  color: T.text.primary,
};

const pillStyle: CSSProperties = {
  padding: "2px 9px",
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.4,
};

const footnoteStyle: CSSProperties = {
  marginTop: 16,
  color: T.text.muted,
  fontSize: 11,
  fontStyle: "italic",
};
