/**
 * SOVEREIGN Platform — module-workspace
 * WorkspaceApp.tsx — Reviewer's Workspace composition root (React) — GD-25, docs/23.
 *
 * One place where a reviewer acts on decisions from three modules, INLINE, on the
 * REAL embedded decision components — not curated summaries with links elsewhere
 * (docs/23 §1). Three per-section-gated panels:
 *
 *   VIGIL Approvals      → ApprovalQueue + ApprovalDetail  (PLATFORM_ADMIN, SYSTEM_ADMIN)
 *   ARIA Certifications  → ClearCertificationQueue         (COMPLIANCE_OFFICER + admins)
 *   SCRIBE T&T Reviews   → TTManagerReview                 (PROGRAM_MANAGER, ANALYST + admins)
 *
 * Per-section gating reuses the exact SECTION_ROLES/canAccessSection shape AriaApp's
 * TAB_ROLES/canAccessTab established (GD-22, Session 41) — list membership with admin
 * roles included in every list, disabled tabs with an honest tooltip, and a
 * LockedSectionNotice as defense in depth. NOT a new gating mechanism (Constraint #2).
 *
 * TYPE NARROWING (docs/23 §2): each panel narrows WorkspaceReviewItem.payload
 * (unknown on the shell contract — the contract never imports a module's types) back
 * to the source module's REAL item type via type-only imports — the established
 * cross-module pattern (module-agentos/src/approval-port.ts precedent):
 *   vigil  → VigilWorkspacePayload { request: AgentApprovalRequest, obligationCase? }
 *   aria   → ClearEvaluationInput
 *   scribe → TTReviewItem
 * The narrowed payload passes straight through as props — no reshaping (docs/23 §6).
 *
 * REMOVAL: each embedded component's own decision-commit callback removes the item
 * from the surface (VIGIL onDecided here; ARIA's decide() removes internally;
 * SCRIBE onSent here) — a decided item leaves the Workspace in place.
 *
 * Deliberately NOT built: state-preserving "go back to the source module" navigation —
 * deferred to v1.1 (docs/23 §1 item 4); loader.mount() takes no initial-state parameter.
 *
 * Version: 1.0 · Session 50 (GD-25) · July 20, 2026
 */

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import type {
  SovereignShellContext,
  SovereignRole,
  WorkspaceReviewItem,
} from "../../sovereign-shell/shell-contract";

// Real embedded decision components (value imports — the Workspace renders the real thing).
import { ApprovalQueue } from "../../module-vigil/src/ApprovalQueue";
import { ApprovalDetail } from "../../module-vigil/src/ApprovalDetail";
import { ClearCertificationQueue } from "../../module-aria/src/ClearCertificationQueue";
import { TTManagerReview, ttReviewItemKey } from "../../module-scribe/src/TTManagerReview";

// Type-only imports for payload narrowing (the module-agentos/approval-port.ts precedent).
import type { VigilWorkspacePayload } from "../../module-vigil/src/vigil-workspace-publisher";
import type { ClearEvaluationInput } from "../../module-aria/src/clear-types";
import type { TTReviewItem } from "../../module-scribe/src/TTManagerReview";

// Source-module id constants (value imports of frozen string constants only).
import { VIGIL_WORKSPACE_MODULE_ID } from "../../module-vigil/src/vigil-workspace-publisher";
import { ARIA_WORKSPACE_MODULE_ID } from "../../module-aria/src/aria-workspace-publisher";
import { SCRIBE_WORKSPACE_MODULE_ID } from "../../module-scribe/src/scribe-workspace-publisher";

import { useReviewerWorkspaceItems } from "./useReviewerWorkspaceItems";

// Local literal union for the three module IDs this Workspace handles (GD-25, v1 scope).
// Derived from the imported constants — stays in sync if a constant changes its string value.
// Stays local: WorkspaceReviewItem.module_id remains `string` on the shell contract so the
// contract never imports module-level types. Adding a fourth ID here without a matching
// case in renderSection()'s switch causes a TypeScript error via assertHandled().
type WorkspaceModuleId =
  | typeof VIGIL_WORKSPACE_MODULE_ID
  | typeof ARIA_WORKSPACE_MODULE_ID
  | typeof SCRIBE_WORKSPACE_MODULE_ID;

export interface WorkspaceAppProps {
  ctx: SovereignShellContext;
}

type Section = WorkspaceModuleId;

// Per-section role definitions (GD-25 / docs/23 §3). Admin roles are included in every
// list — the check is straightforward list membership, no separate superuser path —
// the exact TAB_ROLES shape AriaApp.tsx established (GD-22).
const SECTION_ROLES: Record<Section, SovereignRole[]> = {
  vigil:  ["PLATFORM_ADMIN", "SYSTEM_ADMIN"],
  aria:   ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "COMPLIANCE_OFFICER"],
  scribe: ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER", "ANALYST"],
};

// The primary (non-admin) role for each section — shown in disabled-tab tooltips.
const SECTION_PRIMARY_ROLE: Record<Section, string> = {
  vigil:  "PLATFORM_ADMIN / SYSTEM_ADMIN",
  aria:   "COMPLIANCE_OFFICER",
  scribe: "PROGRAM_MANAGER / ANALYST",
};

const SECTIONS: Array<{ id: Section; label: string }> = [
  { id: "vigil",  label: "VIGIL Approvals" },
  { id: "aria",   label: "ARIA Certifications" },
  { id: "scribe", label: "SCRIBE T&T Reviews" },
];

// Sections in order — used to pick the default active section.
const SECTION_ORDER: readonly Section[] = ["vigil", "aria", "scribe"];

// Never-return exhaustiveness guard. renderSection()'s switch default calls this so
// TypeScript flags any new Section member without a corresponding render branch.
function assertHandled(id: never): never {
  throw new Error(`Unhandled workspace section: ${String(id)}`);
}

// Type-narrowed item filter — ensures every filter call references a known WorkspaceModuleId.
function itemsFor(
  all: readonly WorkspaceReviewItem[],
  moduleId: WorkspaceModuleId
): readonly WorkspaceReviewItem[] {
  return all.filter((i) => i.module_id === moduleId);
}

export function WorkspaceApp({ ctx }: WorkspaceAppProps): JSX.Element {
  const canAccessSection = (id: Section) =>
    SECTION_ROLES[id].some((r) => ctx.auth.hasRole(r));

  // Default to the first section this role can access. If (somehow) none are
  // accessible, fall back to "vigil" — the module gate should have blocked entry.
  const defaultSection = SECTION_ORDER.find(canAccessSection) ?? "vigil";
  const [section, setSection] = useState<Section>(defaultSection);

  const items = useReviewerWorkspaceItems(ctx);
  const vigilItems = useMemo(() => itemsFor(items, VIGIL_WORKSPACE_MODULE_ID), [items]);
  const ariaItems = useMemo(() => itemsFor(items, ARIA_WORKSPACE_MODULE_ID), [items]);
  const scribeItems = useMemo(() => itemsFor(items, SCRIBE_WORKSPACE_MODULE_ID), [items]);
  const countFor: Record<Section, number> = {
    vigil: vigilItems.length,
    aria: ariaItems.length,
    scribe: scribeItems.length,
  };

  // Exhaustiveness-checked section renderer. TypeScript reports an error at the
  // assertHandled(s) default if Section gains a new member without a render branch.
  const renderSection = (s: Section): JSX.Element => {
    switch (s) {
      case VIGIL_WORKSPACE_MODULE_ID:
        return canAccessSection("vigil")
          ? <VigilWorkspaceSection ctx={ctx} items={vigilItems} />
          : <LockedSectionNotice sectionLabel="VIGIL Approvals" requiredRole={SECTION_PRIMARY_ROLE.vigil} />;
      case ARIA_WORKSPACE_MODULE_ID:
        return canAccessSection("aria")
          ? <AriaWorkspaceSection ctx={ctx} items={ariaItems} />
          : <LockedSectionNotice sectionLabel="ARIA Certifications" requiredRole={SECTION_PRIMARY_ROLE.aria} />;
      case SCRIBE_WORKSPACE_MODULE_ID:
        return canAccessSection("scribe")
          ? <ScribeWorkspaceSection ctx={ctx} items={scribeItems} />
          : <LockedSectionNotice sectionLabel="SCRIBE T&T Reviews" requiredRole={SECTION_PRIMARY_ROLE.scribe} />;
      default:
        return assertHandled(s);
    }
  };

  return (
    <section style={rootStyle}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={titleStyle}>Reviewer&apos;s Workspace</h1>
        <p style={subtitleStyle}>
          Decisions from VIGIL, ARIA, and SCRIBE, actionable inline — the real components,
          published by their source modules. Signed in as <strong>{ctx.auth.user.name}</strong>.
        </p>
      </header>

      <div style={disclosureStyle}>
        Each panel embeds the source module&apos;s real decision component; a decision recorded
        here is the same governed decision, with the same audit trail. Items appear as their
        source module publishes them this session, and leave the Workspace when decided. Full
        reference material stays in the source module, one click away (docs/22 §2).
      </div>

      <nav style={tabBarStyle} aria-label="Reviewer's Workspace sections">
        {SECTIONS.map((s) => {
          const accessible = canAccessSection(s.id);
          const active = s.id === section;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={!accessible}
              onClick={() => { if (accessible) setSection(s.id); }}
              title={
                accessible
                  ? s.label
                  : `${s.label} — requires role: ${SECTION_PRIMARY_ROLE[s.id]}`
              }
              style={tabButtonStyle(active, accessible)}
            >
              {s.label}
              {accessible && <span style={countBadgeStyle}>{countFor[s.id]}</span>}
              {!accessible && (
                <span aria-hidden="true" style={{ marginLeft: 5, fontSize: 11 }}>🔒</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Exhaustiveness-checked dispatch — renderSection()'s switch handles all Section members. */}
      {renderSection(section)}
    </section>
  );
}

// ============================================================
// VIGIL SECTION — ApprovalQueue + ApprovalDetail (the full
// request-plus-decision experience — docs/23 §2).
// ============================================================

function VigilWorkspaceSection({
  ctx,
  items,
}: {
  ctx: SovereignShellContext;
  items: readonly WorkspaceReviewItem[];
}): JSX.Element {
  // Narrow by module_id (the discriminant is the filter upstream) — the payload is the
  // full VigilWorkspacePayload VIGIL published: the real AgentApprovalRequest, plus the
  // PPBEObligationCase for Tier C obligation requests.
  const payloads = useMemo(
    () => items.map((i) => i.payload as VigilWorkspacePayload),
    [items]
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = payloads.find((p) => p.request.request_id === selectedId) ?? null;

  if (payloads.length === 0) {
    return <EmptySection sourceLabel="VIGIL has published no pending approval requests this session." />;
  }

  return (
    <div style={stackStyle} data-testid="workspace-vigil-section">
      <ApprovalQueue
        requests={payloads.map((p) => p.request)}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      {selected ? (
        <ApprovalDetail
          ctx={ctx}
          request={selected.request}
          obligationCase={selected.obligationCase}
          onDecided={(requestId) => {
            // GD-25 — the decision-commit path: a decided request leaves the Workspace.
            ctx.reviewerWorkspaceSurface.remove(VIGIL_WORKSPACE_MODULE_ID, requestId);
            setSelectedId(null);
          }}
        />
      ) : (
        <p style={hintStyle}>Select a request to review its brief and record a decision.</p>
      )}
    </div>
  );
}

// ============================================================
// ARIA SECTION — ClearCertificationQueue. Removal happens inside the
// component's own decide() (the certify handler) — GD-25.
// ============================================================

function AriaWorkspaceSection({
  ctx,
  items,
}: {
  ctx: SovereignShellContext;
  items: readonly WorkspaceReviewItem[];
}): JSX.Element {
  const narrowed = useMemo(
    () => items.map((i) => i.payload as ClearEvaluationInput),
    [items]
  );

  if (narrowed.length === 0) {
    return <EmptySection sourceLabel="ARIA has published no pending CLEAR certification items this session." />;
  }

  return (
    <div data-testid="workspace-aria-section">
      <ClearCertificationQueue ctx={ctx} items={narrowed} />
    </div>
  );
}

// ============================================================
// SCRIBE SECTION — TTManagerReview.
// ============================================================

function ScribeWorkspaceSection({
  ctx,
  items,
}: {
  ctx: SovereignShellContext;
  items: readonly WorkspaceReviewItem[];
}): JSX.Element {
  const narrowed = useMemo(
    () => items.map((i) => i.payload as TTReviewItem),
    [items]
  );

  if (narrowed.length === 0) {
    return <EmptySection sourceLabel="SCRIBE has published no T&T review items this session." />;
  }

  return (
    <div data-testid="workspace-scribe-section">
      <TTManagerReview
        ctx={ctx}
        items={narrowed}
        // GD-25 — the decision-commit path: a sent communication leaves the Workspace.
        onSent={(item) =>
          ctx.reviewerWorkspaceSurface.remove(SCRIBE_WORKSPACE_MODULE_ID, ttReviewItemKey(item))
        }
      />
    </div>
  );
}

// ============================================================
// SHARED PRESENTATION
// ============================================================

/** Honest empty state — items appear only after their source module publishes them. */
function EmptySection({ sourceLabel }: { sourceLabel: string }): JSX.Element {
  return (
    <div style={emptyStyle} data-testid="workspace-empty-section">
      {sourceLabel} Items appear here as source modules publish them (on module load and as
      queues change) and leave when decided.
    </div>
  );
}

// Shown when a section is somehow reached by a user who lacks access — defense in depth.
// Matches AriaApp's LockedTabNotice (the platform's honest-disclosure pattern).
function LockedSectionNotice({
  sectionLabel,
  requiredRole,
}: {
  sectionLabel: string;
  requiredRole: string;
}): JSX.Element {
  return (
    <div style={lockedNoticeStyle}>
      <strong>{sectionLabel}</strong> is not available for your current role.
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

const rootStyle: CSSProperties = {
  fontFamily: "system-ui, sans-serif", padding: 32, color: "#0f172a", height: "100%",
  boxSizing: "border-box", overflow: "auto",
};
const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 22 };
const subtitleStyle: CSSProperties = { margin: 0, color: "#475569" };
const disclosureStyle: CSSProperties = {
  padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8,
  color: "#1e40af", fontSize: 13, marginBottom: 16, maxWidth: 720,
};
const tabBarStyle: CSSProperties = {
  display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", marginBottom: 16,
};
const countBadgeStyle: CSSProperties = {
  display: "inline-block", marginLeft: 6, padding: "1px 7px", borderRadius: 999,
  fontSize: 11, fontWeight: 700, background: "#e0f2fe", color: "#0c4a6e",
};
const stackStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const hintStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#64748b" };
const emptyStyle: CSSProperties = {
  padding: "16px 20px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 8,
  color: "#475569", fontSize: 13, maxWidth: 720,
};
const lockedNoticeStyle: CSSProperties = {
  padding: "16px 20px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8,
  color: "#475569", fontFamily: "system-ui, sans-serif", fontSize: 14, lineHeight: 1.6,
};

export default WorkspaceApp;
