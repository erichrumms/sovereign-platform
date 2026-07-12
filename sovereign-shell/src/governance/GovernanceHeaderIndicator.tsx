/**
 * SOVEREIGN Platform — sovereign-shell
 * governance/GovernanceHeaderIndicator.tsx
 *
 * The governance indicator that renders in the shell header (ShellNavChrome
 * `headerSlot`). Shows the CPMI-VRS portfolio status pill and — when any
 * product is on HOLD — a prominent red HOLD badge. This is the shell-level
 * surfacing of governance.isOnHold() required by the Session 2B done condition.
 *
 * Reads only the contract governance export; computes holds via the contract's
 * isOnHold() method (not by re-deriving state).
 *
 * Version: 1.0 · Session 2B · June 2, 2026
 */

import type { CSSProperties } from "react";
import type { SovereignShellContext } from "../../shell-contract";
import { SOVEREIGN_THEME as T } from "../navigation/theme";
import { overallColor } from "./gateStatus";

export interface GovernanceHeaderIndicatorProps {
  governance: SovereignShellContext["governance"];
  /** Open the full CPMI-VRS dashboard (host wires navigation). */
  onOpenDashboard?: () => void;
}

export function GovernanceHeaderIndicator({
  governance,
  onOpenDashboard,
}: GovernanceHeaderIndicatorProps): JSX.Element {
  const { cpmiStatus } = governance;
  const heldProducts = cpmiStatus.products
    .map((p) => p.product)
    .filter((product) => governance.isOnHold(product));

  return (
    <button
      type="button"
      onClick={onOpenDashboard}
      title="Open CPMI-VRS governance dashboard"
      style={containerStyle}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          aria-label={`portfolio ${cpmiStatus.overall}`}
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: overallColor(cpmiStatus.overall),
          }}
        />
        <span style={{ color: T.text.secondary, fontSize: 12 }}>CPMI-VRS</span>
        <span
          style={{
            color: overallColor(cpmiStatus.overall),
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {cpmiStatus.overall}
        </span>
      </span>

      {heldProducts.length > 0 && (
        <span style={holdBadgeStyle}>
          ⛔ {heldProducts.length} HOLD
        </span>
      )}
    </button>
  );
}

const containerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "5px 10px",
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  background: T.bg.elevated,
  cursor: "pointer",
  fontFamily: T.font.sans,
};

const holdBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "2px 7px",
  borderRadius: 4,
  background: T.semantic.red,
  // Session 29 (WE-2): dark-on-red (6.25:1) — white-on-red fails AA at 3.04:1.
  // Matches the CPMI-VRS dashboard's dark-text-on-semantic-color badge.
  color: "#0D1018",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.3,
};
