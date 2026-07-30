/**
 * SOVEREIGN Platform — sovereign-shell
 * PlatformHome.tsx — landing page (Session 47, D1–D4 — Home Dashboard Phase 1).
 *
 * Implements the three-category design from SOVEREIGN_Home_Dashboard_Design_20260720.md
 * and the Session 47 opening prompt. Replaces the Session 30 CPMI/Platform-Facts/
 * Things-to-Do layout.
 *
 * Phase 1 scope (Session 47):
 *   Work Scope  — Program Health (ProgramStatusSurface) + Module Orientation (module registry)
 *   Issues      — Flagged Programs (at_risk / off_track from ProgramStatusSurface)
 *   To Do/Review — WorkQueueSurface (GD-24, wired Session 49)
 *
 * Session 57 (D2/WG-7 + D3/GD-27):
 *   Module Orientation now shows live per-module queue counts from WorkQueueSurface
 *   (replacing the static MODULE_INFO tagline removed in this session). Each module row
 *   is a clickable button calling ctx.navigateToModule() (GD-27).
 *
 * Data sources:
 *   ctx.programStatusSurface.list() — program obligation snapshots published by APEX
 *   ctx.workQueueSurface (subscribed) — live per-module queue counts for Module Orientation
 *     and the To Do / Review section
 *
 * Role visibility:
 *   Program Health / Flagged Programs: PROGRAM_MANAGER, ANALYST, PLATFORM_ADMIN, SYSTEM_ADMIN
 *   Module Orientation: all roles (filtered to the user's accessible modules via isAccessible)
 *
 * Session 64 (WH-3/WH-2/WH-4/WH-6):
 *   WH-4: ProgramTile now renders snapshot.narrative (was never shown).
 *   WH-3/WH-2: Issues section uses a wider grid (issueGridStyle); narrative in tiles
 *              adds substantive context the Program Health section doesn't provide alone.
 *   WH-6: ModuleOrientationPanel receives all modules (not just accessible), shows locked
 *          modules with a role-requirement explanation — matches the sidebar pattern.
 *
 * Session 70 (WH-31):
 *   ModuleOrientationPanel and the hardcoded WorkQueueModuleGroup section merged into a
 *   single ModuleStatusPanel driven by modules.map(). Locked rows unchanged. Clear rows
 *   unchanged. Pending modules now show WorkQueueTile cards inline beneath the nav button.
 *   Work Scope section conditioned on canSeeProgramData (Module Orientation moved out).
 *
 * Version: 2.3 · Session 70 · July 27, 2026 (WH-31: merge Module Orientation → To Do / Review)
 */

import { useEffect, useState, type CSSProperties } from "react";
import type {
  SovereignShellContext,
  ProgramStatusSnapshot,
  SovereignRole,
  WorkQueueSummary,
} from "../shell-contract";
import {
  buildPPBEDashboard,
  type PPBEDashboardData,
  type PeriodVariance,
} from "../../module-apex/src/ppbe-dashboard";
import { createSyntheticPPBEDashboardInputs } from "../../module-apex/src/ppbe-data-adapter";
import type { RegisteredModuleView } from "./module-loader";
import {
  expireVigilSessionRequests,
  getVigilApprovalSession,
} from "../../module-vigil/src/vigil-approval-session";
import { EXPIRY_SWEEP_INTERVAL_MS } from "../../module-vigil/src/approval-contract";
import { VIGIL_WORKSPACE_MODULE_ID } from "../../module-vigil/src/vigil-workspace-publisher";
import { publishVigilWorkQueues } from "../../module-vigil/src/vigil-work-queue-publisher";

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
  variances,
}: {
  snapshot: ProgramStatusSnapshot;
  variances?: PeriodVariance[];
}): JSX.Element {
  const pct = Math.round(snapshot.percent_obligated);
  const latestVariance = variances && variances.length > 0
    ? variances[variances.length - 1]
    : undefined;
  const varianceSign = latestVariance
    ? latestVariance.variance > 0 ? "+" : latestVariance.variance < 0 ? "" : "±"
    : null;
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
      {latestVariance && varianceSign !== null && (
        <span style={{
          ...pctLabelStyle,
          color: latestVariance.variance === 0 ? "#16a34a"
            : latestVariance.variance > 0 ? "#92400e"
            : "#6b7280",
        }}>
          {latestVariance.period}: {varianceSign}{latestVariance.variance.toLocaleString()} variance
        </span>
      )}
      {snapshot.point_of_contact && (
        <span style={pocLabelStyle}>
          {snapshot.point_of_contact.name} · {snapshot.point_of_contact.role}
        </span>
      )}
      {snapshot.narrative && (
        <p style={tileNarrativeStyle}>{snapshot.narrative}</p>
      )}
    </div>
  );
}

function ProgramHealthPanel({
  programs,
  ppbeMetrics,
}: {
  programs: readonly ProgramStatusSnapshot[];
  ppbeMetrics?: PPBEDashboardData;
}): JSX.Element {
  const depHealth = ppbeMetrics?.dependency_health;
  const lv = ppbeMetrics?.learning_velocity;
  return (
    <div style={subPanelStyle}>
      <h3 style={subPanelTitleStyle}>Program Health</h3>
      {ppbeMetrics && (
        <div style={portfolioMetricsRowStyle}>
          <div style={portfolioMetricBoxStyle}>
            <span style={portfolioMetricLabelStyle}>Dependency Health</span>
            <span style={portfolioMetricValueStyle}>
              {depHealth?.index_percent !== null && depHealth?.index_percent !== undefined
                ? `${depHealth.index_percent}%`
                : "—"}
            </span>
            {depHealth && (
              <span style={portfolioMetricSubStyle}>
                {depHealth.healthy} healthy · {depHealth.at_risk} at risk · {depHealth.failed} failed
              </span>
            )}
          </div>
          <div style={portfolioMetricBoxStyle}>
            <span style={portfolioMetricLabelStyle}>Learning Velocity</span>
            <span style={portfolioMetricValueStyle}>
              {lv?.velocity_percent !== null && lv?.velocity_percent !== undefined
                ? `${lv.velocity_percent}%`
                : "—"}
            </span>
            {lv && (
              <span style={portfolioMetricSubStyle}>
                {lv.feeding_planning_cycle} of {lv.total_findings} findings feeding planning
              </span>
            )}
          </div>
        </div>
      )}
      {programs.length === 0 ? (
        <p style={emptyTextStyle}>
          No program data published — APEX populates this when programs are loaded.
        </p>
      ) : (
        <div style={programGridStyle}>
          {[...programs].map((p) => {
            const programVariances = ppbeMetrics?.variances.filter(
              (v) => v.program_id === p.program_id
            );
            return (
              <ProgramTile
                key={p.program_id}
                snapshot={p}
                variances={programVariances}
              />
            );
          })}
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
    <div style={issueGridStyle}>
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

function ModuleStatusPanel({
  modules,
  workQueues,
  isAccessible = () => false,
  onNavigate,
}: {
  modules: RegisteredModuleView[];
  workQueues: readonly WorkQueueSummary[];
  isAccessible?: (m: RegisteredModuleView) => boolean;
  onNavigate?: (moduleId: string) => void;
}): JSX.Element {
  if (modules.length === 0) {
    return (
      <div style={emptyStateBoxStyle}>
        <span style={{ fontSize: 13, color: "#64748b" }}>
          No modules registered on this platform.
        </span>
      </div>
    );
  }

  const accessibleModules = modules.filter(isAccessible);

  if (accessibleModules.length === 0) {
    return (
      <div style={emptyStateBoxStyle}>
        <span style={{ fontSize: 13, color: "#64748b" }}>
          No modules are accessible to your current role.
        </span>
      </div>
    );
  }

  return (
    <ul style={moduleListStyle}>
      {accessibleModules.map((m) => {
        const shortId = m.moduleId.replace("module-", "");
        const moduleQueues = workQueues.filter((q) => q.module_id === shortId && q.count > 0);
        const totalCount = moduleQueues.reduce((n, s) => n + s.count, 0);

        if (totalCount === 0) {
          return onNavigate ? (
            <li key={m.moduleId} style={{ ...moduleItemStyle, padding: 0 }}>
              <button
                type="button"
                onClick={() => onNavigate(m.moduleId)}
                aria-label={`Navigate to ${m.displayName}`}
                style={moduleNavButtonStyle}
              >
                <span style={moduleNameStyle}>{m.displayName}</span>
                <span style={{ ...moduleLabelStyle, color: "#16a34a" }}>Clear</span>
              </button>
            </li>
          ) : (
            <li key={m.moduleId} style={moduleItemStyle}>
              <span style={moduleNameStyle}>{m.displayName}</span>
              <span style={{ ...moduleLabelStyle, color: "#16a34a" }}>Clear</span>
            </li>
          );
        }

        return (
          <li key={m.moduleId} style={modulePendingItemStyle}>
            {onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate(m.moduleId)}
                aria-label={`Navigate to ${m.displayName}`}
                style={moduleNavButtonPendingStyle}
              >
                <span style={moduleNameStyle}>{m.displayName}</span>
              </button>
            ) : (
              <span style={moduleNameStyle}>{m.displayName}</span>
            )}
            <div style={workQueueGroupTilesStyle}>
              {moduleQueues.map((s) => (
                <WorkQueueTile key={s.queue_label} summary={s} />
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

// Compute PPBE portfolio metrics once at module level — the seed is static and
// deterministic, so there is no need to re-run on every render.
const _ppbeInputs = createSyntheticPPBEDashboardInputs();
const _ppbeMetrics: PPBEDashboardData = buildPPBEDashboard(_ppbeInputs);

export function PlatformHome({
  ctx,
  modules = [],
  isAccessible = () => false,
}: PlatformHomeProps): JSX.Element {
  const programs = ctx.programStatusSurface.list();
  const flagged = programs.filter((p) => p.status !== "on_track");
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

  // D1 (WG-17): expiry sweep — ensures VIGIL approval requests expire even when
  // the user stays on Home without visiting VigilApp or WorkspaceApp.
  // Reuses EXPIRY_SWEEP_INTERVAL_MS and expireVigilSessionRequests, the same
  // primitives both VigilApp and WorkspaceApp use (Constraint #2).
  useEffect(() => {
    const sweep = (): void => {
      const { expired } = expireVigilSessionRequests(Date.now(), ctx.logger);
      if (expired.length === 0) return;
      for (const req of expired) {
        ctx.reviewerWorkspaceSurface.remove(VIGIL_WORKSPACE_MODULE_ID, req.request_id);
      }
      const session = getVigilApprovalSession();
      const remaining = session?.requests ?? [];
      const alertQueue = ctx.workQueueSurface.list().find(
        (q) => q.module_id === "vigil" && q.queue_label === "Unacknowledged Alerts"
      );
      const RISK_ORDER_PH: Record<string, number> = { P1: 0, P2: 1, P3: 2 };
      const highestApproval: "P1" | "P2" | "P3" | null = remaining.length === 0 ? null :
        remaining.reduce<"P1" | "P2" | "P3">((best, r) =>
          RISK_ORDER_PH[r.risk_classification] < RISK_ORDER_PH[best] ? r.risk_classification : best,
          remaining[0].risk_classification
        );
      publishVigilWorkQueues(
        remaining.length,
        highestApproval,
        alertQueue?.count ?? 0,
        alertQueue?.highest_severity === "P1",
        ctx.workQueueSurface,
        new Date().toISOString()
      );
    };
    sweep();
    const timer = setInterval(sweep, EXPIRY_SWEEP_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [ctx]);

  // Filter to queues from modules this role can actually access — reuse the same
  // isAccessible / module minimumRole check wired for Module Orientation (Session 47).
  // No new role list; tile visibility derives from the live module registry.
  const accessibleQueues = workQueues.filter((q) => {
    const mod = modules.find((m) => m.moduleId === `module-${q.module_id}`);
    return mod ? isAccessible(mod) : false;
  });
  const totalPending = accessibleQueues.reduce((n, s) => n + s.count, 0);

  return (
    <div style={pageStyle}>
      <header style={pageHeaderStyle}>
        <h1 style={pageTitleStyle}>SOVEREIGN Platform</h1>
        <p style={pageSubtitleStyle}>
          {ctx.auth.user.name} · {ctx.auth.user.role} — Select a module from
          the left navigation to begin
        </p>
      </header>

      {/* ---- Work Scope — Program Health only (Module Orientation moved to To Do / Review) ---- */}
      {canSeeProgramData && (
        <section style={sectionStyle} aria-label="Work scope">
          <div style={sectionHeaderRowStyle}>
            <h2 style={sectionTitleStyle}>Work Scope</h2>
          </div>
          <ProgramHealthPanel programs={programs} ppbeMetrics={_ppbeMetrics} />
        </section>
      )}

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

      {/* ---- To Do / Review — merged with Module Orientation (WH-31, Session 70) ---- */}
      <section style={sectionStyle} aria-label="To do and review">
        <div style={sectionHeaderRowStyle}>
          <h2 style={sectionTitleStyle}>To Do / Review</h2>
          {totalPending > 0 && (
            <span style={issueCountBadgeStyle}>{totalPending} items</span>
          )}
        </div>
        <ModuleStatusPanel
          modules={modules}
          workQueues={workQueues}
          isAccessible={isAccessible}
          onNavigate={(moduleId) => ctx.navigateToModule(moduleId)}
        />
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

const issueGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 12,
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

const tileNarrativeStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 11,
  color: "#475569",
  lineHeight: 1.4,
};

const pocLabelStyle: CSSProperties = {
  fontSize: 10,
  color: "#64748b",
  fontStyle: "italic",
};

const portfolioMetricsRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 8,
};

const portfolioMetricBoxStyle: CSSProperties = {
  flex: "1 1 140px",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  padding: "8px 10px",
  background: "#f8fafc",
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const portfolioMetricLabelStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: "#475569",
};

const portfolioMetricValueStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#0c4a6e",
  lineHeight: 1.2,
};

const portfolioMetricSubStyle: CSSProperties = {
  fontSize: 10,
  color: "#64748b",
  lineHeight: 1.3,
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

const moduleNavButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 8,
  padding: "4px 0",
  width: "100%",
  background: "none",
  border: "none",
  borderBottom: "1px solid #f1f5f9",
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
  textAlign: "left",
};

const modulePendingItemStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: "4px 0 8px",
  borderBottom: "1px solid #f1f5f9",
};

const moduleNavButtonPendingStyle: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 8,
  padding: "4px 0 0",
  width: "100%",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
  textAlign: "left",
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
