/**
 * SOVEREIGN Platform — sovereign-shell
 * navigation/ModuleNav.tsx
 *
 * The module sidebar. Lists registered modules (from ModuleLoader.list()),
 * highlights the active one, shows a live health dot and the enhanced-tier
 * marker, and renders inaccessible modules as locked (fail-closed: the loader
 * still hard-enforces minimumRole at mount — this is only the visual surface).
 *
 * Session 42: added three-word module labels (shown as muted subtext below each
 * display name) and a hover ⓘ popover with plain-English bullet content per
 * module. The SCRIBE label "Ghostwrites Your Memos" is PROVISIONAL — see
 * handoff F1 for Project Principal confirmation needed.
 *
 * Accessibility of each module is supplied by the host via `isAccessible`,
 * which should mirror the ModuleLoader's active RoleAccessPolicy.
 *
 * Version: 1.1 · Session 42 · July 19, 2026
 */

import { useState } from "react";
import type { CSSProperties } from "react";
import type { RegisteredModuleView } from "../module-loader";
import { SOVEREIGN_THEME as T } from "./theme";

export interface ModuleInfo {
  label: string;
  bullets: string[];
}

/** Three-word labels and hover bullet content per moduleId (Session 42, D1). */
export const MODULE_INFO: Record<string, ModuleInfo> = {
  "module-counsel": {
    label: "Argues Both Sides",
    bullets: [
      "Weighs a decision from every angle",
      "Argues the other side, on purpose",
      "Spots how a plan could fail",
    ],
  },
  "module-scribe": {
    // PROVISIONAL — Project Principal confirmation needed. Was "Your Ghostwriter"
    // (two words) before this session; current spec says "Ghostwrites Your Memos".
    // See handoff F1.
    label: "Ghostwrites Your Memos",
    bullets: [
      "Writes your emails and memos",
      "Drafts fixes for travel and timesheet issues",
      "Drafts budget paperwork",
      "Learns and matches your writing style",
    ],
  },
  "module-vigil": {
    label: "Approves Agent Actions",
    bullets: [
      "Flags alerts that need a look",
      "Lets you approve, reject, or escalate AI requests",
    ],
  },
  "module-lens": {
    label: "Explains The Rules",
    bullets: [
      "Explains the rules in plain English",
      "Walks new users through each module",
    ],
  },
  "module-cpmi": {
    // Bullets drawn from governance documentation; visual double-check recommended.
    // See handoff F2.
    label: "Signs The Certificate",
    bullets: [
      "Double-checks big decisions, step by step",
      "Signs off once every rule is met",
      'Answers "big picture" questions for other modules',
    ],
  },
  "module-agentos": {
    label: "Manages AI Models",
    bullets: [
      "Starts and watches AI training",
      "Rolls out new models, once approved",
      "Watches for models drifting off track",
    ],
  },
  "module-nexus": {
    label: "Sorts The Mail",
    bullets: [
      "Sorts incoming requests to the right team",
      "Handles travel and timesheet reviews",
      "Tracks budget coordination tasks",
    ],
  },
  "module-apex": {
    label: "Reads The Gauges",
    bullets: [
      "Shows how every program is doing",
      "Drills into one program's risks",
      "Builds reports for leadership",
      "Flags budgets running over or under",
    ],
  },
  "module-flowpath": {
    label: "Maps Your Workflow",
    bullets: [
      "Interviews people about how work gets done",
      "Draws a map of the process",
      "Flags where things slow down",
    ],
  },
  "module-aria": {
    // Bullets drawn from governance documentation; visual double-check recommended.
    // See handoff F2.
    label: "Runs The Checklist",
    bullets: [
      "Applies rules automatically, no AI",
      "Proves the rules were followed",
    ],
  },
};

export interface ModuleNavProps {
  modules: RegisteredModuleView[];
  activeMountPath?: string;
  isAccessible: (m: RegisteredModuleView) => boolean;
  hideInaccessible?: boolean;
  onSelect: (m: RegisteredModuleView) => void;
}

export function ModuleNav({
  modules,
  activeMountPath,
  isAccessible,
  hideInaccessible,
  onSelect,
}: ModuleNavProps): JSX.Element {
  const visible = hideInaccessible ? modules.filter(isAccessible) : modules;

  return (
    <nav
      aria-label="Modules"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: 8,
        fontFamily: T.font.sans,
      }}
    >
      {visible.map((m) => {
        const accessible = isAccessible(m);
        const active = m.mountPath === activeMountPath;
        const info = MODULE_INFO[m.moduleId];
        return (
          <button
            key={m.moduleId}
            type="button"
            disabled={!accessible}
            onClick={() => {
              if (accessible) onSelect(m);
            }}
            title={
              accessible
                ? m.displayName
                : `${m.displayName} — requires one of: ${m.minimumRole.join(", ")}`
            }
            style={navItemStyle(active, accessible)}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <HealthDot status={m.lastHealth?.status} />
              <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span>{m.displayName}</span>
                {info && (
                  <span style={navLabelStyle}>{info.label}</span>
                )}
              </span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {m.tier === "enhanced" && (
                <span
                  title="Enhanced monitoring tier (0.7× anomaly threshold)"
                  // Session 29 (WE-2): identity purple is framing-only (2.2–2.9:1 as
                  // text); identityText is the AA-verified tint for identity-colored text.
                  style={{ fontSize: 10, color: T.identityText }}
                >
                  ◆
                </span>
              )}
              {info && <InfoBadge info={info} />}
              {!accessible && (
                <span aria-hidden="true" style={{ fontSize: 11 }}>
                  🔒
                </span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/** Hover ⓘ affordance — shows plain-English bullet content for the module. */
function InfoBadge({ info }: { info: ModuleInfo }): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <span
      style={infoBadgeWrapStyle}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <span style={infoIconStyle} aria-label="Module info">ⓘ</span>
      {open && (
        <div style={infoPopoverStyle} role="tooltip">
          <ul style={infoBulletListStyle}>
            {info.bullets.map((b, i) => (
              <li key={i} style={infoBulletStyle}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </span>
  );
}

function HealthDot({
  status,
}: {
  status?: "HEALTHY" | "DEGRADED" | "UNAVAILABLE";
}): JSX.Element {
  const color =
    status === "HEALTHY"
      ? T.semantic.green
      : status === "DEGRADED"
      ? T.semantic.amber
      : status === "UNAVAILABLE"
      ? T.semantic.red
      : T.text.muted; // unknown / not yet polled
  return (
    <span
      aria-label={`health: ${status ?? "unknown"}`}
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

function navItemStyle(active: boolean, accessible: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    width: "100%",
    padding: "8px 10px",
    border: "none",
    borderLeft: `3px solid ${active ? T.identity : "transparent"}`,
    borderRadius: 4,
    background: active ? T.bg.elevated : "transparent",
    color: accessible ? T.text.primary : T.text.muted,
    cursor: accessible ? "pointer" : "not-allowed",
    fontFamily: "inherit",
    fontSize: 14,
    textAlign: "left",
    overflow: "visible",
  };
}

const navLabelStyle: CSSProperties = {
  fontSize: 10,
  color: T.text.muted,
  fontWeight: 400,
  lineHeight: 1,
};

const infoBadgeWrapStyle: CSSProperties = {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
};

const infoIconStyle: CSSProperties = {
  fontSize: 12,
  color: T.text.muted,
  lineHeight: 1,
  cursor: "default",
  userSelect: "none",
};

const infoPopoverStyle: CSSProperties = {
  position: "absolute",
  left: "calc(100% + 6px)",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 200,
  background: T.bg.elevated,
  border: "1px solid #3D4466",
  borderRadius: 6,
  padding: "8px 10px",
  minWidth: 210,
  maxWidth: 290,
  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
  pointerEvents: "none",
};

const infoBulletListStyle: CSSProperties = {
  margin: 0,
  padding: "0 0 0 14px",
  listStyle: "disc",
};

const infoBulletStyle: CSSProperties = {
  fontSize: 12,
  color: T.text.primary,
  lineHeight: "1.6",
  padding: "1px 0",
};
