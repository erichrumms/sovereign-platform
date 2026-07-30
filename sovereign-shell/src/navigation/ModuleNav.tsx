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
 * module. Tooltip content and labels confirmed for all modules (WH-26,
 * Session 73 — AgentOS label corrected, SCRIBE/CPMI/ARIA provisional flags
 * removed, module-workspace entry added).
 *
 * Accessibility of each module is supplied by the host via `isAccessible`,
 * which should mirror the ModuleLoader's active RoleAccessPolicy.
 *
 * Version: 1.2 · Session 73 · July 29, 2026
 */

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import type { RegisteredModuleView } from "../module-loader";
import { SOVEREIGN_THEME as T } from "./theme";

export interface ModuleInfo {
  label: string;
  bullets: string[];
}

/** Three-word labels and hover bullet content per moduleId. */
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
    // WH-26 Issue B (Session 73): label confirmed, provisional flag removed.
    label: "Drafts Your Documents",
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
    // WH-26 Issue C (Session 73): provisional flag removed; bullets confirmed against governance docs.
    label: "Signs The Certificate",
    bullets: [
      "Double-checks big decisions, step by step",
      "Signs off once every rule is met",
      'Answers "big picture" questions for other modules',
    ],
  },
  "module-agentos": {
    // WH-26 Issue A (Session 73): corrected from model-training description.
    // Real screens are Task Registry and Agent Dispatch — task/agent orchestration, not model lifecycle.
    label: "Dispatches Agent Tasks",
    bullets: [
      "Routes work to the right AI agent",
      "Tracks every task from assignment to completion",
      "Queues actions that need human approval",
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
    // WH-26 Issue D (Session 73): provisional flag removed; bullets confirmed against governance docs.
    label: "Runs The Checklist",
    bullets: [
      "Applies rules automatically, no AI",
      "Proves the rules were followed",
    ],
  },
  "module-workspace": {
    // WH-26 Issue E (Session 73): Reviewer's Workspace was absent from the tooltip system.
    label: "Reviews All Decisions",
    bullets: [
      "Collects pending approvals from VIGIL",
      "Shows compliance certifications from ARIA",
      "Surfaces T&T communications from SCRIBE",
      "Logs every decision made this session",
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
                  aria-label="Enhanced monitoring tier — 0.7× anomaly threshold"
                  title="Enhanced monitoring tier (0.7× anomaly threshold)"
                  // Session 29 (WE-2): identity purple is framing-only (2.2–2.9:1 as
                  // text); identityText is the AA-verified tint for identity-colored text.
                  style={{ fontSize: 10, color: T.identityText, display: "flex", alignItems: "center", gap: 2 }}
                >
                  <span aria-hidden="true">◆</span>
                  <span style={{ fontSize: 9 }}>Enh.</span>
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

/**
 * Hover ⓘ affordance — shows plain-English bullet content for the module.
 *
 * WG-2 (Session 54): the popover renders through a React portal to
 * document.body instead of inside the sidebar. The sidebar's `<aside>` sets
 * `overflowY: "auto"`, and per the CSS overflow spec an unset `overflowX`
 * then computes to `auto` too — so anything absolutely positioned inside it
 * was clipped exactly at the sidebar/content boundary. The portal escapes the
 * scroll container entirely; position is fixed, computed from the icon's
 * viewport rect at hover time (fixed positioning is viewport-relative, so no
 * scroll-offset math is needed). asideStyle's overflow is deliberately
 * untouched — the sidebar must keep scrolling as the module list grows.
 */
function InfoBadge({ info }: { info: ModuleInfo }): JSX.Element {
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  return (
    <span
      ref={wrapRef}
      style={infoBadgeWrapStyle}
      onMouseEnter={() => setAnchorRect(wrapRef.current?.getBoundingClientRect() ?? null)}
      onMouseLeave={() => setAnchorRect(null)}
      onClick={(e) => e.stopPropagation()}
    >
      <span style={infoIconStyle} aria-label="Module info">ⓘ</span>
      {anchorRect &&
        createPortal(
          <div
            role="tooltip"
            style={{
              ...infoPopoverStyle,
              position: "fixed",
              left: anchorRect.right + 6,
              top: anchorRect.top + anchorRect.height / 2,
              transform: "translateY(-50%)",
            }}
          >
            <ul style={infoBulletListStyle}>
              {info.bullets.map((b, i) => (
                <li key={i} style={infoBulletStyle}>{b}</li>
              ))}
            </ul>
          </div>,
          document.body
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

// WG-2 (Session 54): position/left/top/transform are set inline at render time
// from the hovered icon's viewport rect — the popover is portaled to
// document.body, so it can no longer be positioned relative to the icon in CSS.
const infoPopoverStyle: CSSProperties = {
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
