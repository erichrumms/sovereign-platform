/**
 * SOVEREIGN Platform — sovereign-shell
 * navigation/ModuleNav.tsx
 *
 * The module sidebar. Lists registered modules (from ModuleLoader.list()),
 * highlights the active one, shows a live health dot and the enhanced-tier
 * marker, and renders inaccessible modules as locked (fail-closed: the loader
 * still hard-enforces minimumRole at mount — this is only the visual surface).
 *
 * Accessibility of each module is supplied by the host via `isAccessible`,
 * which should mirror the ModuleLoader's active RoleAccessPolicy.
 *
 * Version: 1.0 · Session 2B · June 2, 2026
 */

import type { CSSProperties } from "react";
import type { RegisteredModuleView } from "../module-loader";
import { SOVEREIGN_THEME as T } from "./theme";

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
                : `${m.displayName} — requires role ${m.minimumRole}`
            }
            style={navItemStyle(active, accessible)}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <HealthDot status={m.lastHealth?.status} />
              <span>{m.displayName}</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {m.tier === "enhanced" && (
                <span
                  title="Enhanced monitoring tier (0.7× anomaly threshold)"
                  style={{ fontSize: 10, color: T.identity }}
                >
                  ◆
                </span>
              )}
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
  };
}
