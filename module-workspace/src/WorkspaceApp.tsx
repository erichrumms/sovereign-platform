/**
 * SOVEREIGN Platform — module-workspace
 * WorkspaceApp.tsx — Reviewer's Workspace composition root (React) — GD-25, docs/23.
 *
 * One place where a reviewer acts on decisions from five modules, INLINE, on the
 * REAL embedded decision components — not curated summaries with links elsewhere
 * (docs/23 §1). Five per-section-gated panels:
 *
 *   VIGIL Approvals      → ApprovalQueue + ApprovalDetail  (PLATFORM_ADMIN, SYSTEM_ADMIN)
 *   ARIA Certifications  → ClearCertificationQueue         (COMPLIANCE_OFFICER + admins)
 *   SCRIBE T&T Reviews   → TTManagerReview                 (PROGRAM_MANAGER, ANALYST + admins)
 *   NEXUS Travel         → TravelQueueRow (travel half of TTQueuePanel, no TimeQueueRow)
 *                          (PLATFORM_ADMIN, SYSTEM_ADMIN, AGENT_OPERATOR, PROGRAM_MANAGER,
 *                           COMPLIANCE_OFFICER — matching NEXUS_MINIMUM_ROLES exactly)
 *   FLOWPATH Review      → WorkflowArtifactReview
 *                          (PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER, AGENT_OPERATOR)
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
 *   vigil    → VigilWorkspacePayload { request: AgentApprovalRequest, obligationCase? }
 *   aria     → ClearEvaluationInput
 *   scribe   → TTReviewItem
 *   nexus    → SubmittedTravelItem
 *   flowpath → FlowpathMapperOutput
 * The narrowed payload passes straight through as props — no reshaping (docs/23 §6).
 *
 * REMOVAL: each embedded component's own decision-commit callback removes the item
 * from the surface (VIGIL onDecided here; ARIA's decide() removes internally;
 * SCRIBE onSent here; NEXUS decideTravel here; FLOWPATH onApproved/onReturnForRevision here)
 * — a decided item leaves the Workspace.
 *
 * Session 53 (GD-27, docs/25 §4 D4): the v1.1 deferral above is now RESOLVED —
 * each section offers real "Open in [module]" actions calling
 * ctx.navigateToModule(moduleId, { ...item id... }), the first real consumer of
 * the cross-module navigation primitive. The actions sit ALONGSIDE the embedded
 * decision experience (docs/23's embed pattern is unchanged): deciding inline
 * still works exactly as before; opening the source module with the item
 * pre-selected is now also one click.
 *
 * Version: 1.2 · Session 63 (WH-19 — NEXUS travel panel + FLOWPATH review panel) · July 25, 2026
 */

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import type {
  SovereignShellContext,
  SovereignRole,
  WorkspaceReviewItem,
} from "../../sovereign-shell/shell-contract";

// Real embedded decision components (value imports — the Workspace renders the real thing).
import { ApprovalQueue } from "../../module-vigil/src/ApprovalQueue";
import { ApprovalDetail } from "../../module-vigil/src/ApprovalDetail";
import { EXPIRY_SWEEP_INTERVAL_MS } from "../../module-vigil/src/approval-contract";
import {
  expireVigilSessionRequests,
  getVigilApprovalSession,
  removeVigilSessionRequest,
} from "../../module-vigil/src/vigil-approval-session";
import { publishVigilWorkQueues } from "../../module-vigil/src/vigil-work-queue-publisher";
import { ClearCertificationQueue } from "../../module-aria/src/ClearCertificationQueue";
import { TTManagerReview, ttReviewItemKey } from "../../module-scribe/src/TTManagerReview";
import { TravelQueueRow } from "../../module-nexus/src/TTQueuePanel";
import { recordTravelDecision, type TravelDecisionOutcome } from "../../module-nexus/src/tt-travel-queue";
import { getTTSession, setTTSessionTravel } from "../../module-nexus/src/tt-session";
import { WorkflowArtifactReview } from "../../module-flowpath/src/WorkflowArtifactReview";
import { markFlowpathSessionApproved } from "../../module-flowpath/src/flowpath-approval-session";
import { returnFlowpathSessionForRevision } from "../../module-flowpath/src/flowpath-elicitation-session";

// Type-only imports for payload narrowing (the module-agentos/approval-port.ts precedent).
import type { VigilWorkspacePayload } from "../../module-vigil/src/vigil-workspace-publisher";
import type { ClearEvaluationInput } from "../../module-aria/src/clear-types";
import type { TTReviewItem } from "../../module-scribe/src/TTManagerReview";
import type { SubmittedTravelItem } from "../../module-nexus/src/useTTIntake";
import type { FlowpathMapperOutput } from "../../module-flowpath/src/flowpath-contract";

// Source-module id constants (value imports of frozen string constants only).
import { VIGIL_WORKSPACE_MODULE_ID } from "../../module-vigil/src/vigil-workspace-publisher";
import { ARIA_WORKSPACE_MODULE_ID } from "../../module-aria/src/aria-workspace-publisher";
import { SCRIBE_WORKSPACE_MODULE_ID } from "../../module-scribe/src/scribe-workspace-publisher";
import { NEXUS_WORKSPACE_MODULE_ID } from "../../module-nexus/src/nexus-workspace-publisher";
import { FLOWPATH_WORKSPACE_MODULE_ID } from "../../module-flowpath/src/flowpath-workspace-publisher";
import { markScribeItemSent } from "../../module-scribe/src/scribe-sent-session";
import { publishScribeWorkQueues } from "../../module-scribe/src/scribe-work-queue-publisher";
import { publishAriaWorkQueues } from "../../module-aria/src/aria-work-queue-publisher";
import { SYNTH_TT_EMPLOYEES } from "@sovereign/data";

import { useReviewerWorkspaceItems } from "./useReviewerWorkspaceItems";

// Local literal union for the five module IDs this Workspace handles.
// Derived from the imported constants — stays in sync if a constant changes its string value.
// Stays local: WorkspaceReviewItem.module_id remains `string` on the shell contract so the
// contract never imports module-level types. Adding a new ID here without a matching
// case in renderSection()'s switch causes a TypeScript error via assertHandled().
type WorkspaceModuleId =
  | typeof VIGIL_WORKSPACE_MODULE_ID
  | typeof ARIA_WORKSPACE_MODULE_ID
  | typeof SCRIBE_WORKSPACE_MODULE_ID
  | typeof NEXUS_WORKSPACE_MODULE_ID
  | typeof FLOWPATH_WORKSPACE_MODULE_ID;

export interface WorkspaceAppProps {
  ctx: SovereignShellContext;
}

type Section = WorkspaceModuleId | "activity" | "cost";

// Per-section role definitions (GD-25 / docs/23 §3). Admin roles are included in every
// list — the check is straightforward list membership, no separate superuser path —
// the exact TAB_ROLES shape AriaApp.tsx established (GD-22).
const SECTION_ROLES: Record<Section, SovereignRole[]> = {
  vigil:    ["PLATFORM_ADMIN", "SYSTEM_ADMIN"],
  aria:     ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "COMPLIANCE_OFFICER"],
  scribe:   ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER", "ANALYST"],
  // NEXUS: matches NEXUS_MINIMUM_ROLES from module-nexus/src/index.ts exactly (GD-22).
  nexus:    ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "AGENT_OPERATOR", "PROGRAM_MANAGER", "COMPLIANCE_OFFICER"],
  // FLOWPATH: program managers and process owners review workflow artifacts.
  flowpath: ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER", "AGENT_OPERATOR"],
  // Union of all five section roles — updated by WH-27 after WH-19 added NEXUS/FLOWPATH (both include AGENT_OPERATOR).
  activity: ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "COMPLIANCE_OFFICER", "PROGRAM_MANAGER", "ANALYST", "AGENT_OPERATOR"],
  // GD-32 (docs/32) — token cost telemetry; same two roles as VIGIL.
  cost:     ["PLATFORM_ADMIN", "SYSTEM_ADMIN"],
};

// The primary (non-admin) role for each section — shown in disabled-tab tooltips.
const SECTION_PRIMARY_ROLE: Record<Section, string> = {
  vigil:    "PLATFORM_ADMIN / SYSTEM_ADMIN",
  aria:     "COMPLIANCE_OFFICER",
  scribe:   "PROGRAM_MANAGER / ANALYST",
  nexus:    "AGENT_OPERATOR / PROGRAM_MANAGER / COMPLIANCE_OFFICER",
  flowpath: "PROGRAM_MANAGER / AGENT_OPERATOR",
  cost:     "PLATFORM_ADMIN / SYSTEM_ADMIN",
  activity: "(all roles)",
};

const SECTIONS: Array<{ id: Section; label: string }> = [
  { id: "vigil",    label: "VIGIL Approvals" },
  { id: "aria",     label: "ARIA Certifications" },
  { id: "scribe",   label: "SCRIBE T&T Reviews" },
  { id: "nexus",    label: "NEXUS Travel" },
  { id: "flowpath", label: "FLOWPATH Review" },
  { id: "cost",     label: "Cost Dashboard" },
  { id: "activity", label: "Activity & Decisions" },
];

// Sections in order — used to pick the default active section.
const SECTION_ORDER: readonly Section[] = ["vigil", "aria", "scribe", "nexus", "flowpath", "cost", "activity"];

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
  const nexusItems = useMemo(() => itemsFor(items, NEXUS_WORKSPACE_MODULE_ID), [items]);
  const flowpathItems = useMemo(() => itemsFor(items, FLOWPATH_WORKSPACE_MODULE_ID), [items]);

  // WH-18: lift showAll so the activity badge reflects the same filter the section renders.
  const isAdmin = ctx.auth.hasRole("PLATFORM_ADMIN") || ctx.auth.hasRole("SYSTEM_ADMIN");
  const [showAll, setShowAll] = useState(false);
  const allEntries = ctx.logger.getEntries();
  const activityCount = isAdmin && showAll
    ? allEntries.length
    : allEntries.filter((e) => e.actor_name === ctx.auth.user.name).length;

  const costCount = allEntries.filter(
    (e) => e.event_type === "AGENT_STEP_COMPLETE" && e.token_usage != null
  ).length;

  const countFor: Record<Section, number> = {
    vigil:    vigilItems.length,
    aria:     ariaItems.length,
    scribe:   scribeItems.length,
    nexus:    nexusItems.length,
    flowpath: flowpathItems.length,
    cost:     costCount,
    activity: activityCount,
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
      case NEXUS_WORKSPACE_MODULE_ID:
        return canAccessSection("nexus")
          ? <NexusWorkspaceSection ctx={ctx} items={nexusItems} />
          : <LockedSectionNotice sectionLabel="NEXUS Travel" requiredRole={SECTION_PRIMARY_ROLE.nexus} />;
      case FLOWPATH_WORKSPACE_MODULE_ID:
        return canAccessSection("flowpath")
          ? <FlowpathWorkspaceSection ctx={ctx} items={flowpathItems} />
          : <LockedSectionNotice sectionLabel="FLOWPATH Review" requiredRole={SECTION_PRIMARY_ROLE.flowpath} />;
      case "cost":
        return canAccessSection("cost")
          ? <CostDashboardSection ctx={ctx} />
          : <LockedSectionNotice sectionLabel="Cost Dashboard" requiredRole={SECTION_PRIMARY_ROLE.cost} />;
      case "activity":
        return canAccessSection("activity")
          ? <ActivitySection ctx={ctx} showAll={showAll} setShowAll={setShowAll} />
          : <LockedSectionNotice sectionLabel="Activity & Decisions" requiredRole={SECTION_PRIMARY_ROLE.activity} />;
      default:
        return assertHandled(s);
    }
  };

  return (
    <section style={rootStyle}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={titleStyle}>Reviewer&apos;s Workspace</h1>
        <p style={subtitleStyle}>
          Decisions from VIGIL, ARIA, SCRIBE, NEXUS, and FLOWPATH, actionable inline — the real components,
          published by their source modules. Signed in as <strong>{ctx.auth.user.name}</strong>.
        </p>
      </header>

      <div style={disclosureStyle}>
        Each panel embeds the source module&apos;s real decision component; a decision recorded
        here is the same governed decision, with the same audit trail, confirmed by deciding
        in either surface. Items appear as their source module publishes them this session,
        and leave the Workspace when decided. Full reference material stays in the source
        module, one click away (docs/22 §2).
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

  // WG-5 (Session 54): the live expiry sweep, reaching the Workspace's embedded
  // copy of VIGIL's queue. While this section is open, an overdue request is
  // auto-rejected through the SHARED session store (single AGENT_ACTION_EXPIRED
  // emit site — VigilApp's own screen sweeps the same store via
  // useApprovalQueue.expireOverdue; the two screens are never mounted at once,
  // so the sweeps cannot double-emit) and then leaves this surface. An expired
  // selected item deselects itself because `selected` derives from the items.
  useEffect(() => {
    const sweep = (): void => {
      const { expired } = expireVigilSessionRequests(Date.now(), ctx.logger);
      for (const req of expired) {
        ctx.reviewerWorkspaceSurface.remove(VIGIL_WORKSPACE_MODULE_ID, req.request_id);
      }
    };
    sweep();
    const timer = setInterval(sweep, EXPIRY_SWEEP_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [ctx]);

  // D3 (WG-16): republish VIGIL's pending-approvals count whenever the set of
  // displayed items changes (decision or expiry) so Home's To Do / Review tile
  // updates without requiring a VIGIL visit. Alert counts do not change with
  // approval decisions, so we read them from the live surface rather than
  // importing the static alert seeds into this component.
  useEffect(() => {
    const session = getVigilApprovalSession();
    const remaining = session?.requests ?? [];
    const alertQueue = ctx.workQueueSurface.list().find(
      (q) => q.module_id === "vigil" && q.queue_label === "Unacknowledged Alerts"
    );
    const RISK_ORDER_WS: Record<string, number> = { P1: 0, P2: 1, P3: 2 };
    const highestApproval: "P1" | "P2" | "P3" | null = remaining.length === 0 ? null :
      remaining.reduce<"P1" | "P2" | "P3">((best, r) =>
        RISK_ORDER_WS[r.risk_classification] < RISK_ORDER_WS[best] ? r.risk_classification : best,
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
  }, [payloads, ctx]);

  if (payloads.length === 0) {
    return <EmptySection sourceLabel="VIGIL has published no pending approval requests this session." />;
  }

  return (
    <div style={stackStyle} data-testid="workspace-vigil-section">
      {/* GD-27 (docs/25 §4 D4) — real open-in-source-module actions; item_id is the request_id. */}
      <OpenInSourceModuleActions
        moduleLabel="VIGIL"
        items={items}
        describe={(i) => (i.payload as VigilWorkspacePayload).request.request_id}
        onOpen={(i) => ctx.navigateToModule("module-vigil", { selectedRequestId: i.item_id })}
      />
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
            // WG-13 (Session 54): it also leaves the shared session store, so VIGIL's
            // own screen mounting later in this session shows the queue without it.
            ctx.reviewerWorkspaceSurface.remove(VIGIL_WORKSPACE_MODULE_ID, requestId);
            removeVigilSessionRequest(requestId);
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

  // D3 (WG-16): republish ARIA's pending-cert count after any certification
  // decision so Home's tile updates without requiring an ARIA visit.
  useEffect(() => {
    publishAriaWorkQueues(narrowed.length, ctx.workQueueSurface, new Date().toISOString());
  }, [narrowed, ctx]);

  if (narrowed.length === 0) {
    return <EmptySection sourceLabel="ARIA has published no pending CLEAR certification items this session." />;
  }

  return (
    <div data-testid="workspace-aria-section">
      {/* GD-27 (docs/25 §4 D4) — real open-in-source-module actions; item_id is the document_id. */}
      <OpenInSourceModuleActions
        moduleLabel="ARIA"
        items={items}
        describe={(i) => (i.payload as ClearEvaluationInput).document_name}
        onOpen={(i) => ctx.navigateToModule("module-aria", { selectedDocumentId: i.item_id })}
      />
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

  // D3 (WG-16): republish SCRIBE's pending-review count after any send decision
  // so Home's tile updates without requiring a SCRIBE visit.
  useEffect(() => {
    publishScribeWorkQueues(narrowed.length, ctx.workQueueSurface, new Date().toISOString());
  }, [narrowed, ctx]);

  if (narrowed.length === 0) {
    return <EmptySection sourceLabel="SCRIBE has published no T&T review items this session." />;
  }

  return (
    <div data-testid="workspace-scribe-section">
      {/* GD-27 (docs/25 §4 D4) — real open-in-source-module actions; item_id is ttReviewItemKey. */}
      <OpenInSourceModuleActions
        moduleLabel="SCRIBE"
        items={items}
        describe={(i) => i.item_id}
        onOpen={(i) => ctx.navigateToModule("module-scribe", { selectedItemKey: i.item_id })}
      />
      <TTManagerReview
        ctx={ctx}
        items={narrowed}
        // WH-13 (Session 73): supply human-readable names for the queue item labels.
        employeeNames={Object.fromEntries(SYNTH_TT_EMPLOYEES.map((e) => [e.employee_id, e.name]))}
        // GD-25 — the decision-commit path: a sent communication leaves the Workspace.
        // D2 (WG-15): also mark it sent in the session store so future SCRIBE mounts
        // and startup-publish exclude it from their counts.
        onSent={(item) => {
          markScribeItemSent(ttReviewItemKey(item));
          ctx.reviewerWorkspaceSurface.remove(SCRIBE_WORKSPACE_MODULE_ID, ttReviewItemKey(item));
        }}
      />
    </div>
  );
}

// ============================================================
// NEXUS SECTION — TravelQueueRow (travel-decision half of TTQueuePanel only;
// TimeQueueRow is read-only display, not a decision surface — excluded).
// Bidirectional: deciding here updates tt-session.ts → NexusApp's effect reconciles
// the surface; deciding in NEXUS updates the surface via that same publish effect.
// ============================================================

function NexusWorkspaceSection({
  ctx,
  items,
}: {
  ctx: SovereignShellContext;
  items: readonly WorkspaceReviewItem[];
}): JSX.Element {
  const travelItems = useMemo(
    () => items.map((i) => i.payload as SubmittedTravelItem),
    [items]
  );

  if (travelItems.length === 0) {
    return <EmptySection sourceLabel="NEXUS has no travel requests pending a decision this session." />;
  }

  return (
    <div style={stackStyle} data-testid="workspace-nexus-section">
      <OpenInSourceModuleActions
        moduleLabel="NEXUS"
        items={items}
        describe={(i) => i.item_id}
        onOpen={(i) => ctx.navigateToModule("module-nexus", { selectedRequestId: i.item_id })}
      />
      {travelItems.map((item) => {
        // Workspace-scoped TravelQueueDecider: calls recordTravelDecision (the SOLE
        // path to APPROVED/DENIED/ESCALATED — docs/17 §5.3), updates tt-session so
        // NEXUS's own queue reflects the decision, then removes from this surface.
        const tt = {
          decideTravel: (requestId: string, outcome: TravelDecisionOutcome, note: string): void => {
            try {
              const decided = recordTravelDecision(
                item.request,
                outcome,
                { id: ctx.auth.user.employee_id, name: ctx.auth.user.name },
                note,
                ctx.logger
              );
              // Mirror into the session store so NEXUS's own panel sees the decided status.
              const session = getTTSession();
              if (session) {
                setTTSessionTravel(
                  session.travel.map((t) =>
                    t.request.request_id === requestId ? { ...t, request: decided.request } : t
                  )
                );
              }
              if (outcome === "ESCALATED") {
                // ESCALATED = pending senior-authority action — item remains on the
                // surface as a read-only card (decidable becomes false, no buttons).
                // Publish the updated payload so TravelQueueRow reflects the new status.
                // NexusApp's publish effect reconciles this further on remount.
                ctx.reviewerWorkspaceSurface.publish({
                  module_id: NEXUS_WORKSPACE_MODULE_ID,
                  item_id: requestId,
                  payload: { ...item, request: decided.request },
                  published_at: new Date().toISOString(),
                });
              } else {
                // APPROVED and DENIED are final outcomes — item leaves the surface.
                ctx.reviewerWorkspaceSurface.remove(NEXUS_WORKSPACE_MODULE_ID, requestId);
              }
            } catch (err) {
              // Surface the error without crashing — the user can try again.
              console.error("NEXUS workspace decision error:", err);
            }
          },
        };
        return (
          <TravelQueueRow
            key={item.request.request_id}
            item={item}
            tt={tt}
          />
        );
      })}
    </div>
  );
}

// ============================================================
// FLOWPATH SECTION — WorkflowArtifactReview.
// Bidirectional: approving here calls markFlowpathSessionApproved → FlowpathApp's
// subscription fires → publishFlowpathArtifact removes the approved artifact from
// the surface; approving in FLOWPATH does the same via the same session store.
// ============================================================

function FlowpathWorkspaceSection({
  ctx,
  items,
}: {
  ctx: SovereignShellContext;
  items: readonly WorkspaceReviewItem[];
}): JSX.Element {
  const bundles = useMemo(
    () => items.map((i) => i.payload as FlowpathMapperOutput),
    [items]
  );

  if (bundles.length === 0) {
    return <EmptySection sourceLabel="FLOWPATH has published no workflow artifacts awaiting review this session." />;
  }

  return (
    <div data-testid="workspace-flowpath-section">
      <OpenInSourceModuleActions
        moduleLabel="FLOWPATH"
        items={items}
        describe={(i) => i.item_id}
        onOpen={(i) => ctx.navigateToModule("module-flowpath", { selectedSessionId: i.item_id })}
      />
      {bundles.map((bundle) => (
        <WorkflowArtifactReview
          key={bundle.artifact.session_id}
          ctx={ctx}
          bundle={bundle}
          onApproved={(sessionId) => {
            // markFlowpathSessionApproved is already called inside WorkflowArtifactReview
            // before this callback fires — this is the idempotent removal from the surface.
            markFlowpathSessionApproved(sessionId);
            ctx.reviewerWorkspaceSurface.remove(FLOWPATH_WORKSPACE_MODULE_ID, sessionId);
          }}
          onReturnForRevision={(sessionId) => {
            // Reset the session status before navigating — otherwise FLOWPATH sees
            // COMPLETE + gate_passed: true from the prior submission.
            returnFlowpathSessionForRevision(sessionId);
            ctx.navigateToModule("module-flowpath", { selectedSessionId: sessionId });
            ctx.reviewerWorkspaceSurface.remove(FLOWPATH_WORKSPACE_MODULE_ID, sessionId);
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// ACTIVITY SECTION — GD-28 (v1.23) — per-user decision history
// read from ctx.logger.getEntries() (the session-scoped audit buffer).
// Default view: entries where actor_name === the signed-in user.
// Admin toggle (PLATFORM_ADMIN / SYSTEM_ADMIN): show all entries.
// ============================================================

function ActivitySection({
  ctx,
  showAll,
  setShowAll,
}: {
  ctx: SovereignShellContext;
  showAll: boolean;
  setShowAll: (v: boolean) => void;
}): JSX.Element {
  const isAdmin = ctx.auth.hasRole("PLATFORM_ADMIN") || ctx.auth.hasRole("SYSTEM_ADMIN");

  const allEntries = ctx.logger.getEntries();
  const userEntries = allEntries.filter((e) => e.actor_name === ctx.auth.user.name);
  const displayed = isAdmin && showAll ? allEntries : userEntries;

  return (
    <div data-testid="workspace-activity-section">
      <div style={activityDisclosureStyle} data-testid="activity-scope-disclosure">
        Session-scoped only: this buffer is in-memory and does not persist across page reloads
        (Stage 1 / Decision 21). It is not a permanent audit record — consult the platform
        audit log for historical decisions.
      </div>
      {isAdmin && (
        <label style={activityToggleLabelStyle} data-testid="activity-admin-toggle-label">
          <input
            type="checkbox"
            data-testid="activity-admin-toggle"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
          />
          {" "}Show all platform entries (admin view — {allEntries.length} total this session)
        </label>
      )}
      {displayed.length === 0 ? (
        <div style={emptyStyle} data-testid="activity-empty">
          {isAdmin && showAll
            ? "No events have been logged to the session buffer yet."
            : `No decisions recorded for ${ctx.auth.user.name} this session.`}
        </div>
      ) : (
        <ul style={activityListStyle} data-testid="activity-log-list">
          {displayed.map((e, i) => (
            <li key={i} style={activityEntryItemStyle} data-testid={`activity-entry-${i}`}>
              <span style={activityEventTypeStyle}>{e.event_type.replace(/_/g, " ")}</span>
              {e.decision_type && (
                <span style={activityDecisionTypeStyle}>{e.decision_type.replace(/_/g, " ")}</span>
              )}
              <span style={activityProductBadgeStyle}>{e.product}</span>
              {e.actor_name && (
                <span style={activityActorStyle}>{e.actor_name}</span>
              )}
              <span style={activityOutcomeStyle}>{e.outcome}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================
// COST DASHBOARD SECTION — GD-32 (docs/32). SYSTEM_ADMIN / PLATFORM_ADMIN only.
// Reads ctx.logger.getEntries() — the same session-scoped in-memory buffer the
// Activity tab uses. Filters to AGENT_STEP_COMPLETE events where token_usage is
// present (i.e. live calls only; FALLBACK_ACTIVATED steps have no token_usage).
// FALLBACK_ACTIVATED events are counted separately as a distinct "wasted spend"
// line, never merged into the cost total (docs/32 §4).
// ============================================================

function CostDashboardSection({ ctx }: { ctx: SovereignShellContext }): JSX.Element {
  const allEntries = ctx.logger.getEntries();

  // Live-call steps: AGENT_STEP_COMPLETE with real token_usage (absent on fallback).
  const stepEvents = allEntries.filter(
    (e) => e.event_type === "AGENT_STEP_COMPLETE" && e.token_usage != null
  );

  // Fallback activations — distinct line, never merged into cost total (docs/32 §4).
  const fallbackEvents = allEntries.filter((e) => e.event_type === "FALLBACK_ACTIVATED");
  const fallbackCount = fallbackEvents.length;
  const fallbackByCategory = new Map<string, number>();
  for (const e of fallbackEvents) {
    const cat = e.fallback_category ?? "unknown";
    fallbackByCategory.set(cat, (fallbackByCategory.get(cat) ?? 0) + 1);
  }

  // Running totals.
  let totalInput = 0;
  let totalOutput = 0;
  let totalCost = 0;
  for (const e of stepEvents) {
    totalInput += e.token_usage!.input_tokens;
    totalOutput += e.token_usage!.output_tokens;
    totalCost += e.token_usage!.estimated_cost_usd ?? 0;
  }

  // Per-product aggregates.
  const byProduct = new Map<string, { input: number; output: number; cost: number; steps: number }>();
  for (const e of stepEvents) {
    const p = byProduct.get(e.product) ?? { input: 0, output: 0, cost: 0, steps: 0 };
    byProduct.set(e.product, {
      input: p.input + e.token_usage!.input_tokens,
      output: p.output + e.token_usage!.output_tokens,
      cost: p.cost + (e.token_usage!.estimated_cost_usd ?? 0),
      steps: p.steps + 1,
    });
  }

  // Per-agent aggregates (agent_id may be absent on some events).
  const byAgent = new Map<string, { input: number; output: number; cost: number; steps: number }>();
  for (const e of stepEvents) {
    if (!e.agent_id) continue;
    const a = byAgent.get(e.agent_id) ?? { input: 0, output: 0, cost: 0, steps: 0 };
    byAgent.set(e.agent_id, {
      input: a.input + e.token_usage!.input_tokens,
      output: a.output + e.token_usage!.output_tokens,
      cost: a.cost + (e.token_usage!.estimated_cost_usd ?? 0),
      steps: a.steps + 1,
    });
  }

  return (
    <div data-testid="cost-dashboard-section">
      {/* Session-scope banner — same wording pattern as Activity & Decisions tab (docs/32 §4). */}
      <div style={activityDisclosureStyle} data-testid="cost-scope-disclosure">
        Session-scoped only: this buffer is in-memory and does not persist across page reloads
        (Stage 1 / Decision 21). It is not a permanent cost record — consult the platform
        audit log for historical spend.
      </div>

      {/* Coverage statement — grounded in GD-31 Build Session 1 actual facts. */}
      <div style={costCoverageStyle} data-testid="cost-coverage-disclosure">
        Coverage (GD-31 / GD-35): all 14 in-scope AGENT_STEP_COMPLETE emission sites are
        instrumented. The 4 PPBE advisory panels (ppbe-exhibit-drafter, ppbe-coordination-assistant,
        ppbe-evidence-synthesizer, ppbe-scenario-analyst) were added in GD-35 (Session 88).
        The 5 excluded sites (tracer-integration, security-query, 2 NEXUS deterministic
        engines, counsel REASONING_STEP_COMPLETE) do not call the model — they have no token
        usage to report. This session total is complete. GovCloud live-call cost estimates are
        excluded until R7 resolves — the GovCloud provider always serves the static fallback tier.
      </div>

      {stepEvents.length === 0 && fallbackCount === 0 ? (
        <div style={emptyStyle} data-testid="cost-empty">
          No agent steps recorded this session. Token usage data appears here as agent
          steps complete with live model calls.
        </div>
      ) : (
        <>
          {/* Running session total */}
          <section style={costBlockStyle} aria-label="Running session total">
            <h2 style={costHeadingStyle}>Running Session Total</h2>
            <table style={costTableStyle} aria-label="Session cost totals">
              <tbody>
                <tr>
                  <td style={costLabelCellStyle}>Input tokens</td>
                  <td style={costNumCellStyle} data-testid="cost-total-input">{totalInput.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={costLabelCellStyle}>Output tokens</td>
                  <td style={costNumCellStyle} data-testid="cost-total-output">{totalOutput.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={costLabelCellStyle}>Live agent steps</td>
                  <td style={costNumCellStyle} data-testid="cost-total-steps">{stepEvents.length.toLocaleString()}</td>
                </tr>
                <tr style={costTotalRowStyle}>
                  <td style={costLabelCellStyle}>Estimated cost (USD)</td>
                  <td style={costNumCellStyle} data-testid="cost-total-usd">${totalCost.toFixed(4)}</td>
                </tr>
                <tr style={costFallbackRowStyle}>
                  <td style={costLabelCellStyle}>Fallback activations (wasted spend — no live tokens consumed)</td>
                  <td style={costNumCellStyle} data-testid="cost-fallback-count">{fallbackCount.toLocaleString()}</td>
                </tr>
                {Array.from(fallbackByCategory.entries()).map(([cat, count]) => (
                  <tr key={cat}>
                    <td style={{ ...costLabelCellStyle, paddingLeft: 24, color: "#64748b", fontSize: 12 }}>↳ {cat}</td>
                    <td style={{ ...costNumCellStyle, color: "#64748b", fontSize: 12 }} data-testid={`cost-fallback-cat-${cat}`}>{count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Per-product breakdown */}
          {byProduct.size > 0 && (
            <section style={costBlockStyle} aria-label="Cost by product">
              <h2 style={costHeadingStyle}>By Product</h2>
              <table style={costTableStyle} aria-label="Cost breakdown by product">
                <thead>
                  <tr>
                    <th style={costThStyle}>Product</th>
                    <th style={costThStyle}>Steps</th>
                    <th style={costThStyle}>Input tokens</th>
                    <th style={costThStyle}>Output tokens</th>
                    <th style={costThStyle}>Est. cost (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(byProduct.entries()).map(([product, stats]) => (
                    <tr key={product} data-testid={`cost-product-${product}`}>
                      <td style={costLabelCellStyle}>
                        <span style={activityProductBadgeStyle}>{product}</span>
                      </td>
                      <td style={costNumCellStyle}>{stats.steps.toLocaleString()}</td>
                      <td style={costNumCellStyle}>{stats.input.toLocaleString()}</td>
                      <td style={costNumCellStyle}>{stats.output.toLocaleString()}</td>
                      <td style={costNumCellStyle}>${stats.cost.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Per-agent breakdown */}
          {byAgent.size > 0 && (
            <section style={costBlockStyle} aria-label="Cost by agent">
              <h2 style={costHeadingStyle}>By Agent</h2>
              <table style={costTableStyle} aria-label="Cost breakdown by agent">
                <thead>
                  <tr>
                    <th style={costThStyle}>Agent</th>
                    <th style={costThStyle}>Steps</th>
                    <th style={costThStyle}>Input tokens</th>
                    <th style={costThStyle}>Output tokens</th>
                    <th style={costThStyle}>Est. cost (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(byAgent.entries()).map(([agentId, stats]) => (
                    <tr key={agentId} data-testid={`cost-agent-${agentId}`}>
                      <td style={costLabelCellStyle}>{agentId}</td>
                      <td style={costNumCellStyle}>{stats.steps.toLocaleString()}</td>
                      <td style={costNumCellStyle}>{stats.input.toLocaleString()}</td>
                      <td style={costNumCellStyle}>{stats.output.toLocaleString()}</td>
                      <td style={costNumCellStyle}>${stats.cost.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// SHARED PRESENTATION
// ============================================================

/**
 * GD-27 (docs/25 §4 D4) — the first real consumer of ctx.navigateToModule: one
 * "open in the source module" action per pending item, alongside (never replacing)
 * the embedded decision experience. The target module mounts with the item
 * pre-selected via its own narrowed initialState.
 */
function OpenInSourceModuleActions({
  moduleLabel,
  items,
  describe,
  onOpen,
}: {
  moduleLabel: string;
  items: readonly WorkspaceReviewItem[];
  describe: (item: WorkspaceReviewItem) => string;
  onOpen: (item: WorkspaceReviewItem) => void;
}): JSX.Element | null {
  if (items.length === 0) return null;
  return (
    <div style={openActionsStyle} data-testid={`open-in-${moduleLabel.toLowerCase()}-actions`}>
      <span style={openActionsLabelStyle}>Open in {moduleLabel}:</span>
      {items.map((item) => (
        <button
          key={item.item_id}
          type="button"
          style={openActionButtonStyle}
          title={`Open ${moduleLabel} with ${describe(item)} selected`}
          onClick={() => onOpen(item)}
        >
          {describe(item)} ↗
        </button>
      ))}
    </div>
  );
}

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
const openActionsStyle: CSSProperties = {
  display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6,
  padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0",
  borderRadius: 8, marginBottom: 12, maxWidth: 720,
};
const openActionsLabelStyle: CSSProperties = { fontSize: 12, fontWeight: 700, color: "#475569" };
const openActionButtonStyle: CSSProperties = {
  padding: "3px 10px", fontSize: 12, borderRadius: 999, border: "1px solid #cbd5e1",
  background: "#ffffff", color: "#0c4a6e", cursor: "pointer",
};

const activityDisclosureStyle: CSSProperties = {
  padding: "10px 14px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8,
  color: "#9a3412", fontSize: 13, marginBottom: 12, maxWidth: 720,
};
const activityToggleLabelStyle: CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569",
  marginBottom: 12, cursor: "pointer",
};
const activityListStyle: CSSProperties = {
  listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6,
  maxWidth: 720,
};
const activityEntryItemStyle: CSSProperties = {
  display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
  padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8,
  fontSize: 13,
};
const activityEventTypeStyle: CSSProperties = { fontWeight: 700, color: "#0f172a" };
const activityDecisionTypeStyle: CSSProperties = {
  padding: "1px 8px", borderRadius: 999, background: "#dbeafe", color: "#1e3a8a",
  fontSize: 11, fontWeight: 600,
};
const activityProductBadgeStyle: CSSProperties = {
  padding: "1px 8px", borderRadius: 999, background: "#f0fdf4", color: "#166534",
  fontSize: 11, fontWeight: 600,
};
const activityActorStyle: CSSProperties = { color: "#64748b", fontSize: 12 };
const activityOutcomeStyle: CSSProperties = { marginLeft: "auto", color: "#475569", fontSize: 12 };

// Cost Dashboard styles (GD-32)
const costCoverageStyle: CSSProperties = {
  padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8,
  color: "#166534", fontSize: 13, marginBottom: 16, maxWidth: 720,
};
const costBlockStyle: CSSProperties = { marginBottom: 20, maxWidth: 720 };
const costHeadingStyle: CSSProperties = { margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "#0f172a" };
const costTableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const costThStyle: CSSProperties = {
  textAlign: "left", padding: "6px 12px", background: "#f1f5f9", color: "#475569",
  fontWeight: 700, fontSize: 12, borderBottom: "1px solid #e2e8f0",
};
const costLabelCellStyle: CSSProperties = {
  padding: "6px 12px", color: "#475569", borderBottom: "1px solid #f1f5f9",
};
const costNumCellStyle: CSSProperties = {
  padding: "6px 12px", fontVariantNumeric: "tabular-nums", color: "#0f172a",
  borderBottom: "1px solid #f1f5f9",
};
const costTotalRowStyle: CSSProperties = { fontWeight: 700 };
const costFallbackRowStyle: CSSProperties = { background: "#fef9c3" };

export default WorkspaceApp;
