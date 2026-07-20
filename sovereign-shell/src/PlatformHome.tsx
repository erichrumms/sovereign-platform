/**
 * SOVEREIGN Platform — sovereign-shell
 * PlatformHome.tsx — landing page (Session 47, D1–D4 — Home Dashboard Phase 1).
 *
 * Implements the three-category design from SOVEREIGN_Home_Dashboard_Design_20260720.md
 * and the Session 47 opening prompt. Replaces the Session 30 CPMI/Platform-Facts/
 * Things-to-Do layout.
 *
 * Phase 1 scope (this session):
 *   Work Scope  — Program Health (ProgramStatusSurface) + Module Orientation (MODULE_INFO)
 *   Issues      — Flagged Programs (at_risk / off_track from ProgramStatusSurface)
 *   To Do/Review — honest placeholder; WorkQueueSurface wired in a future session
 *
 * Phase 2 (future): populate To Do / Review with Pending Approvals, T&T Reviews,
 * Certifications, Coordination Items via WorkQueueSurface.
 *
 * Data sources:
 *   ctx.programStatusSurface.list() — program obligation snapshots published by APEX
 *   MODULE_INFO (navigation/ModuleNav) — module labels; imported directly, not duplicated
 *
 * Role visibility:
 *   Program Health / Flagged Programs: PROGRAM_MANAGER, ANALYST, PLATFORM_ADMIN, SYSTEM_ADMIN
 *   Module Orientation: all roles (filtered to the user's accessible modules via isAccessible)
 *
 * Version: 2.0 · Session 47 · July 20, 2026
 */

import { useEffect, useState, type CSSProperties } from "react";
import type {
  SovereignShellContext,
  ProgramStatusSnapshot,
  SovereignRole,
  WorkQueueSummary,
} from "../shell-contract";
import type { RegisteredModuleView } from "./module-loader";
import { MODULE_INFO } from "./navigation/ModuleNav";

/** Roles that may see program financial obligation data (D1/D2). */
const PROGRAM_DATA_ROLES: ReadonlySet<SovereignRole> = new Set([
  "PROGRAM_MANAGER",
  "ANALYST",
  "PLATFORM_ADMIN",
  "SYSTEM_ADMIN",
]);

export interface PlatformHomeProps {
  ctx: SovereignShellContext;
  /** Registered modules from ModuleLoader.list(). Used for Module Orientation (D3). */
  modules?: RegisteredModuleView[];
  /** Whether the user may access a module — mirrors the loader's RoleAccessPolicy. */
  isAccessible?: (m: RegisteredModuleView) => boolean;
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatusBadge({
  status,
}: {
  status: ProgramStatusSnapshot["status"];
}): JSX.Element {
  const cfg = {
    on_track:  { label: "On Track",  bg: "#dcfce7", color: "#166534" },
    at_risk:   { label: "At Risk",   bg: "#fef9c3", color: "#854d0e" },
    off_track: { label: "Off Track", bg: "#fee2e2", color: "#7f1d1d" },
  } as const;
  const { label, bg, color } = cfg[status];
  return (
    <span
      style={{
        padding: "1px 8px",
        borderRadius: 10,
        fontSize: 11,
        fontWeight: 700,
        background: bg,
        color,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}

function ProgramTile({
  snapshot,
}: {
  snapshot: ProgramStatusSnapshot;
}): JSX.Element {
  const pct = Math.round(snapshot.percent_obligated);
  return (
    <div style={programTileStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <span style={programIdStyle}>{snapshot.program_id}</span>
        <StatusBadge status={snapshot.status} />
      </div>
      <div style={barTrackStyle}>
        <div
          style={{
            height: "100%",
            borderRadius: 3,
            background: "#3b82f6",
            width: `${Math.min(pct, 100)}%`,
          }}
          title={`${pct}% obligated`}
        />
      </div>
      <span style={pctLabelStyle}>{pct}% obligated</span>
    </div>
  );
}

function ProgramHealthPanel({
  programs,
}: {
  programs: readonly ProgramStatusSnapshot[];
}): JSX.Element {
  return (
    <div style={subPanelStyle}>
      <h3 style={subPanelTitleStyle}>Program Health</h3>
      {programs.length === 0 ? (
        <p style={emptyTextStyle}>
          No program data published — APEX populates this when programs are loaded.
        </p>
      ) : (
        <div style={programGridStyle}>
          {[...programs].map((p) => (
            <ProgramTile key={p.program_id} snapshot={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function FlaggedProgramsPanel({
  flagged,
}: {
  flagged: readonly ProgramStatusSnapshot[];
}): JSX.Element {
  if (flagged.length === 0) {
    return (
      <div style={emptyStateBoxStyle}>
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#22c55e",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 13, color: "#166534" }}>
          No flagged programs — all programs are on track.
        </span>
      </div>
    );
  }
  return (
    <div style={programGridStyle}>
      {flagged.map((p) => (
        <ProgramTile key={p.program_id} snapshot={p} />
      ))}
    </div>
  );
}

function WorkQueueTile({ summary }: { summary: WorkQueueSummary }): JSX.Element {
  const severityColor =
    summary.highest_severity === "P1" ? "#7f1d1d"
    : summary.highest_severity === "P2" ? "#92400e"
    : "#334155";
  return (
    <div style={workQueueTileStyle}>
      <span style={workQueueCountStyle}>{summary.count}</span>
      <span style={workQueueLabelStyle}>{summary.queue_label}</span>
      {summary.highest_severity && (
        <span style={{ ...workQueueSeverityStyle, color: severityColor }}>
          {summary.highest_severity} pending
        </span>
      )}
    </div>
  );
}

function WorkQueueModuleGroup({
  moduleId,
  label,
  summaries,
}: {
  moduleId: string;
  label: string;
  summaries: readonly WorkQueueSummary[];
}): JSX.Element {
  const relevant = summaries.filter((s) => s.module_id === moduleId);
  if (relevant.length === 0) return <></>;
  return (
    <div style={workQueueGroupStyle}>
      <span style={workQueueGroupLabelStyle}>{label}</span>
      <div style={workQueueGroupTilesStyle}>
        {relevant.map((s) => (
          <WorkQueueTile key={s.queue_label} summary={s} />
        ))}
      </div>
    </div>
  );
}

function ModuleOrientationPanel({
  modules,
}: {
  modules: RegisteredModuleView[];
}): JSX.Element {
  return (
    <div style={subPanelStyle}>
      <h3 style={subPanelTitleStyle}>Module Orientation</h3>
      {modules.length === 0 ? (
        <p style={emptyTextStyle}>No modules accessible with your current role.</p>
      ) : (
        <ul style={moduleListStyle}>
          {modules.map((m) => {
            const info = MODULE_INFO[m.moduleId];
            return (
              <li key={m.moduleId} style={moduleItemStyle}>
                <span style={moduleNameStyle}>{m.displayName}</span>
                {info && <span style={moduleLabelStyle}>{info.label}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function PlatformHome({
  ctx,
  modules = [],
  isAccessible = () => false,
}: PlatformHomeProps): JSX.Element {
  const programs = ctx.programStatusSurface.list();
  const flagged = programs.filter((p) => p.status !== "on_track");
  const accessibleModules = modules.filter(isAccessible);
  const canSeeProgramData = PROGRAM_DATA_ROLES.has(ctx.auth.user.role);

  // GD-24 — subscribe to WorkQueueSurface so the "To Do / Review" section
  // updates reactively whenever a module publishes (or re-publishes) its counts.
  const [workQueues, setWorkQueues] = useState<readonly WorkQueueSummary[]>(
    () => ctx.workQueueSurface.list()
  );
  useEffect(() => {
    const unsub = ctx.workQueueSurface.subscribe(setWorkQueues);
    return unsub;
  }, [ctx.workQueueSurface]);

  // Filter to queues from modules this role can actually access — reuse the same
  // isAccessible / module minimumRole check wired for Module Orientation (Session 47).
  // No new role list; tile visibility derives from the live module registry.
  const accessibleQueues = workQueues.filter((q) => {
    const mod = modules.find((m) => m.moduleId === `module-${q.module_id}`);
    return mod ? isAccessible(mod) : false;
  });

  return (
    <div style={pageStyle}>
      <header style={pageHeaderStyle}>
        <h1 style={pageTitleStyle}>SOVEREIGN Platform</h1>
        <p style={pageSubtitleStyle}>
          {ctx.auth.user.name} · {ctx.auth.user.role} — Select a module from
          the left navigation to begin
        </p>
      </header>

      {/* ---- Work Scope ---- */}
      <section style={sectionStyle} aria-label="Work scope">
        <div style={sectionHeaderRowStyle}>
          <h2 style={sectionTitleStyle}>Work Scope</h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: canSeeProgramData ? "1fr 1fr" : "1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {canSeeProgramData && <ProgramHealthPanel programs={programs} />}
          <ModuleOrientationPanel modules={accessibleModules} />
        </div>
      </section>

      {/* ---- Issues ---- */}
      <section style={sectionStyle} aria-label="Issues">
        <div style={sectionHeaderRowStyle}>
          <h2 style={sectionTitleStyle}>Issues</h2>
          {canSeeProgramData && flagged.length > 0 && (
            <span style={issueCountBadgeStyle}>{flagged.length} flagged</span>
          )}
        </div>
        {canSeeProgramData ? (
          <FlaggedProgramsPanel flagged={flagged} />
        ) : (
          <p style={emptyTextStyle}>
            Program status is visible to Program Managers, Analysts, Platform
            Admins, and System Admins.
          </p>
        )}
      </section>

      {/* ---- To Do / Review — WorkQueueSurface (GD-24, Session 49) ---- */}
      <section style={sectionStyle} aria-label="To do and review">
        <div style={sectionHeaderRowStyle}>
          <h2 style={sectionTitleStyle}>To Do / Review</h2>
          {accessibleQueues.length > 0 && (
            <span style={issueCountBadgeStyle}>
              {accessibleQueues.reduce((n, s) => n + s.count, 0)} items
            </span>
          )}
        </div>
        {accessibleQueues.length === 0 ? (
          <div style={emptyStateBoxStyle}>
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#166534" }}>
              No pending reviews — queues are clear, or no accessible modules have published yet.
            </span>
          </div>
        ) : (
          <div style={workQueueSectionStyle}>
            <WorkQueueModuleGroup moduleId="vigil" label="VIGIL" summaries={accessibleQueues} />
            <WorkQueueModuleGroup moduleId="scribe" label="SCRIBE" summaries={accessibleQueues} />
            <WorkQueueModuleGroup moduleId="aria" label="ARIA" summaries={accessibleQueues} />
            <WorkQueueModuleGroup moduleId="nexus" label="NEXUS" summaries={accessibleQueues} />
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const pageStyle: CSSProperties = {
  padding: "24px 28px",
  fontFamily: "system-ui, sans-serif",
  color: "#0f172a",
  maxWidth: 1100,
  boxSizing: "border-box",
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const pageHeaderStyle: CSSProperties = { marginBottom: 4 };

const pageTitleStyle: CSSProperties = {
  margin: "0 0 4px",
  fontSize: 22,
  fontWeight: 700,
  letterSpacing: 0.3,
  color: "#0f172a",
};

const pageSubtitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: "#64748b",
};

const sectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const sectionHeaderRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  borderBottom: "2px solid #e2e8f0",
  paddingBottom: 6,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: "#475569",
};

const issueCountBadgeStyle: CSSProperties = {
  padding: "1px 8px",
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 700,
  background: "#fee2e2",
  color: "#7f1d1d",
};

const subPanelStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "12px 14px",
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const subPanelTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 700,
  color: "#0f172a",
};

const emptyTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: "#64748b",
  fontStyle: "italic",
};

const programGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: 10,
};

const programTileStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  padding: "8px 10px",
  background: "#f8fafc",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const programIdStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#0f172a",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  flexShrink: 1,
  minWidth: 0,
};

const barTrackStyle: CSSProperties = {
  background: "#e2e8f0",
  borderRadius: 3,
  height: 5,
  overflow: "hidden",
};

const pctLabelStyle: CSSProperties = {
  fontSize: 10,
  color: "#64748b",
};

const emptyStateBoxStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  background: "#f0fdf4",
  borderRadius: 6,
  border: "1px solid #bbf7d0",
};

const moduleListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const moduleItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 8,
  padding: "4px 0",
  borderBottom: "1px solid #f1f5f9",
};

const moduleNameStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#0f172a",
  minWidth: 80,
};

const moduleLabelStyle: CSSProperties = {
  fontSize: 11,
  color: "#64748b",
};

const workQueueSectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const workQueueGroupStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "10px 12px",
  background: "#ffffff",
};

const workQueueGroupLabelStyle: CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.8,
  textTransform: "uppercase",
  color: "#64748b",
  marginBottom: 8,
};

const workQueueGroupTilesStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const workQueueTileStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  minWidth: 140,
};

const workQueueCountStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: "#0c4a6e",
};

const workQueueLabelStyle: CSSProperties = {
  fontSize: 12,
  color: "#334155",
};

const workQueueSeverityStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
};
