/**
 * SOVEREIGN Platform — module-aria
 * AriaApp.tsx — ARIA Suite composition root (React).
 *
 * The single component the module mounts after the widened ARIA gate admits the user.
 * Renders the ARIA chrome and routes between the four ARIA Suite tabs. Per-tab role
 * gating is enforced here (D3, GD-22, Session 41): a user admitted to the module sees
 * only the tabs their role grants; other tabs are visible but disabled with an
 * explanation, matching the platform's existing disclosure pattern.
 *
 * Per-tab role assignments (SOVEREIGN_Role_Access_Matrix_20260718.md):
 *   CLEAR    → COMPLIANCE_OFFICER  (+ PLATFORM_ADMIN, SYSTEM_ADMIN)
 *   TRACER   → PROGRAM_MANAGER     (+ PLATFORM_ADMIN, SYSTEM_ADMIN)
 *   ARC      → ANALYST             (+ PLATFORM_ADMIN, SYSTEM_ADMIN)
 *   CPMI-VRS → PLATFORM_ADMIN, SYSTEM_ADMIN only (unchanged)
 *
 * Admin roles (PLATFORM_ADMIN, SYSTEM_ADMIN) see all four tabs — they are explicitly
 * included in every tab's role list rather than handled by a separate superuser path,
 * keeping the per-tab check a simple list membership test.
 *
 * Tab: CLEAR  — Continuous Legal and Regulatory Evaluation and Assessment Review
 * Tab: TRACER — Traceability and Accountability Chain for Evidence Records
 * Tab: ARC    — Adaptive Regulatory Change engine
 * Tab: CPMI-VRS — Determinism-verification benchmark + Gate 3/4 certification
 *
 * Version: 1.4 · Session 41 (GD-22 per-tab role gating) · July 18, 2026
 */

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import type { SovereignShellContext, SovereignRole } from "../../sovereign-shell/shell-contract";
import {
  DeterminismBanner,
  ClassificationBoundaryBanner,
  rootStyle,
  titleStyle,
  subtitleStyle,
} from "./banners";
import { ClearPanel } from "./ClearPanel";
import { CLEAR_DEMO_ITEMS } from "./ClearCertificationQueue";
import { publishAriaWorkQueues } from "./aria-work-queue-publisher";
import { publishAriaWorkspaceItems } from "./aria-workspace-publisher";
import { useAriaCertifications } from "./useAriaCertifications";
import { TracerExplorer } from "./TracerExplorer";
import { ArcImpactModeler } from "./ArcImpactModeler";
import { AriaVrsGates } from "./AriaVrsGates";

export interface AriaAppProps {
  ctx: SovereignShellContext;
}

type Tab = "clear" | "tracer" | "arc" | "vrs";

// Per-tab role definitions (GD-22 / SOVEREIGN_Role_Access_Matrix_20260718.md).
// Admin roles are included in every list — the check is straightforward list membership,
// no separate superuser path required.
const TAB_ROLES: Record<Tab, SovereignRole[]> = {
  clear:  ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "COMPLIANCE_OFFICER"],
  tracer: ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER"],
  arc:    ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "ANALYST"],
  vrs:    ["PLATFORM_ADMIN", "SYSTEM_ADMIN"],
};

// The primary (non-admin) role for each tab — shown in disabled-tab tooltips.
const TAB_PRIMARY_ROLE: Record<Tab, string> = {
  clear:  "COMPLIANCE_OFFICER",
  tracer: "PROGRAM_MANAGER",
  arc:    "ANALYST",
  vrs:    "PLATFORM_ADMIN / SYSTEM_ADMIN",
};

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "clear",  label: "CLEAR" },
  { id: "tracer", label: "TRACER" },
  { id: "arc",    label: "ARC" },
  { id: "vrs",    label: "CPMI-VRS" },
];

// Tabs in order — used to pick the default active tab.
const TAB_ORDER: readonly Tab[] = ["clear", "tracer", "arc", "vrs"];

export function AriaApp({ ctx }: AriaAppProps): JSX.Element {
  const canAccessTab = (id: Tab) =>
    TAB_ROLES[id].some((r) => ctx.auth.hasRole(r));

  // Default to the first tab this role can access. If (somehow) none are accessible,
  // fall back to "clear" — the module gate should have blocked entry before this point.
  const defaultTab = TAB_ORDER.find(canAccessTab) ?? "clear";
  const [tab, setTab] = useState<Tab>(defaultTab);

  // GD-24 / GD-25 — the still-pending CLEAR demo items, derived from the certification
  // surface via the existing useAriaCertifications subscription (each decide() call
  // records to ctx.aria; statusOf changes identity when the surface changes).
  const { workQueueSurface, reviewerWorkspaceSurface } = ctx;
  const { statusOf } = useAriaCertifications(ctx);
  const pendingItems = useMemo(
    () => CLEAR_DEMO_ITEMS.filter((item) => statusOf(item.document_id) === "pending"),
    [statusOf]
  );
  const pendingCertCount = pendingItems.length;

  // GD-24 — publish ARIA's WorkQueueSurface summary whenever the pending count changes.
  useEffect(() => {
    publishAriaWorkQueues(pendingCertCount, workQueueSurface, new Date().toISOString());
  }, [workQueueSurface, pendingCertCount]);

  // GD-25 — publish the FULL pending ClearEvaluationInput items to the Reviewer's
  // Workspace surface. The publisher also reconciles away decided items, so a
  // certified/flagged document does not linger in the Workspace.
  useEffect(() => {
    publishAriaWorkspaceItems(pendingItems, reviewerWorkspaceSurface, new Date().toISOString());
  }, [reviewerWorkspaceSurface, pendingItems]);

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
          const accessible = canAccessTab(t.id);
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={!accessible}
              onClick={() => { if (accessible) setTab(t.id); }}
              title={
                accessible
                  ? t.label
                  : `${t.label} — requires role: ${TAB_PRIMARY_ROLE[t.id]}`
              }
              style={tabButtonStyle(active, accessible)}
            >
              {t.label}
              {!accessible && (
                <span aria-hidden="true" style={{ marginLeft: 5, fontSize: 11 }}>🔒</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Category 3 — substantive content (Primary). Render only the active tab.
          The canAccessTab guard below is defensive: the module gate + disabled tabs
          mean an inaccessible panel should never be reached in normal use. */}
      {tab === "clear" && (
        canAccessTab("clear")
          ? <ClearPanel ctx={ctx} />
          : <LockedTabNotice tabLabel="CLEAR" requiredRole={TAB_PRIMARY_ROLE.clear} />
      )}
      {tab === "tracer" && (
        canAccessTab("tracer")
          ? <TracerExplorer ctx={ctx} />
          : <LockedTabNotice tabLabel="TRACER" requiredRole={TAB_PRIMARY_ROLE.tracer} />
      )}
      {tab === "arc" && (
        canAccessTab("arc")
          ? <ArcImpactModeler ctx={ctx} />
          : <LockedTabNotice tabLabel="ARC" requiredRole={TAB_PRIMARY_ROLE.arc} />
      )}
      {tab === "vrs" && (
        canAccessTab("vrs")
          ? <AriaVrsGates ctx={ctx} />
          : <LockedTabNotice tabLabel="CPMI-VRS" requiredRole={TAB_PRIMARY_ROLE.vrs} />
      )}
    </section>
  );
}

// Shown when a tab is somehow reached by a user who lacks access — defense in depth.
// Matches the platform's honest-disclosure pattern (STATIC badges, etc.).
function LockedTabNotice({
  tabLabel,
  requiredRole,
}: {
  tabLabel: string;
  requiredRole: string;
}): JSX.Element {
  return (
    <div style={lockedNoticeStyle}>
      <strong>{tabLabel}</strong> is not available for your current role.
      <br />
      Access requires: <code>{requiredRole}</code>. Contact your system administrator.
    </div>
  );
}

function tabButtonStyle(active: boolean, accessible: boolean): CSSProperties {
  return {
    padding: "8px 14px",
    fontSize: 14,
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid #0f172a" : "2px solid transparent",
    color: !accessible ? "#94a3b8" : active ? "#0f172a" : "#475569",
    cursor: accessible ? "pointer" : "not-allowed",
    fontWeight: active ? 700 : 500,
    opacity: accessible ? 1 : 0.7,
  };
}

const tabBarStyle: CSSProperties = {
  display: "flex",
  gap: 4,
  borderBottom: "1px solid #e2e8f0",
  marginBottom: 16,
};

const lockedNoticeStyle: CSSProperties = {
  padding: "16px 20px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  color: "#475569",
  fontFamily: "system-ui, sans-serif",
  fontSize: 14,
  lineHeight: 1.6,
};

export default AriaApp;
