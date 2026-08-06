# SOVEREIGN Platform — Session 92 Handoff
## Committee Review Standard
**Date:** August 5, 2026  
**Session:** 92  
**Subject:** WH-43 badge-mismatch defect — NEXUS Travel workspace badge over-count by 1

---

## Finding

The Reviewer's Workspace "NEXUS Travel" tab badge displayed **5** items. Both NEXUS's own Travel & Time Queue and the Workspace panel's own rendered list showed **4** items. The discrepancy was confirmed live in the browser before this session began.

This is not the original WH-43 defect recurring. The original WH-43 bug was an **under-count** (badge excluded ESCALATED items that visually appeared in the UI). The Session 92 defect is an **over-count** (badge included an ESCALATED item that renders as read-only in both UIs, without decision buttons).

---

## Evidence

**Root cause file:** `module-nexus/src/nexus-workspace-publisher.ts`

The WH-43 fix (commit `0ab1610`) changed the publisher filter from:
```typescript
const pending = items.filter((i) => i.request.status === "ROUTED");
```
to:
```typescript
const pending = items.filter(
  (i) => i.request.status === "ROUTED" || i.request.status === "ESCALATED"
);
```

The seeded data (`sovereign-data/src/synthetic/tt-seed.ts`) contains 8 travel requests: 4 ROUTED, 1 ESCALATED (TR-105), 2 APPROVED, 1 DENIED. After the WH-43 change, the ESCALATED item (TR-105) was published to the workspace surface, inflating the badge to 5.

**Rule 11 violation:** Two independent computations for "items needing current-reviewer action" disagreed:
- Publisher filter: `ROUTED || ESCALATED` → surface count = 5 → badge = 5
- `TravelQueueRow.decidable` (`module-nexus/src/TTQueuePanel.tsx:103`): `request.status === "ROUTED"` → rendered actionable rows = 4

ESCALATED items render in both UIs (NEXUS Travel & Time Queue and Workspace panel) as **read-only information cards** without decision buttons. The WH-43 commit message claimed "NEXUS's Travel queue visually presents [ESCALATED] as requiring attention" — this is inaccurate. `TTQueuePanel` renders ALL 8 items in NEXUS's own queue (it has no status filter); only the 4 ROUTED items have decision buttons. ESCALATED items have already transferred responsibility to senior authority and are not actionable for the current reviewer.

**Secondary contributor:** The WH-43 fix also added an ESCALATED-keeping branch in `WorkspaceApp.tsx` (`NexusWorkspaceSection.decideTravel`). When a reviewer escalated an item, that branch re-published the ESCALATED item to the surface instead of removing it, perpetuating the count inflation across the decision lifecycle.

**Startup publication:** `sovereign-shell/src/startup-publish.ts` calls `publishNexusTravelItems` with all 8 seed items at shell start. After the Session 92 fix (ROUTED-only filter), startup correctly publishes 4 items.

---

## Constraints Implicated

**Rule 11 (one computation for one fact):** The badge count and the rendered workspace item set must derive from a single filter. Having the publisher use a different predicate than `TravelQueueRow.decidable` is a structural Rule 11 violation. The fix consolidates to one computation (ROUTED only) applied at the publisher; all downstream consumers observe the same filtered set.

**Workspace semantic contract:** Items on the `ReviewerWorkspaceSurface` represent work awaiting the current reviewer's action. ESCALATED items have transferred responsibility to a different authority — they must not occupy surface slots or inflate the badge count for the current reviewer.

**WH-43 non-regression:** The original WH-43 complaint was that ESCALATED items were absent from the badge when they should appear. The Session 92 analysis confirms this was a mis-diagnosis: ESCALATED items were absent from the workspace surface (correct behavior), but their visual presence in NEXUS's own Travel & Time Queue was mistaken for workspace-surface membership. The WH-43 fix over-corrected. Session 92 reverts to the pre-WH-43 ROUTED-only filter.

---

## Options Considered

**Option A — ROUTED-only filter (selected):** Revert `publishNexusTravelItems` to ROUTED-only. Remove the ESCALATED-keeping branch in `WorkspaceApp.tsx`. Badge = surface count = rendered card count = 4. Satisfies Rule 11. Aligns with `TravelQueueRow.decidable`. Startup-publish uses the same function; automatically publishes 4 at startup. Permanent parity test (Check 7) encodes the invariant.

**Option B — ROUTED-only filter + remove ESCALATED from TTQueuePanel rendering:** Same as Option A but also filter ESCALATED items out of NEXUS's own Travel & Time Queue display. Rejected — TTQueuePanel's all-statuses view is by design; supervisors and managers need visibility into escalated items. The workspace is the only surface that needs ROUTED-only scope.

**Option C — Add ESCALATED status indicator to badge:** Show badge as "4 actionable / 1 escalated". Rejected — the badge semantic in this platform is actionable items awaiting decision; mixing categories would require UI contract changes across all seven workspace tabs.

---

## Recommended Resolution

**Option A** was applied:

1. `module-nexus/src/nexus-workspace-publisher.ts` — Filter restored to ROUTED-only. Single computation now drives both the surface population and (by extension) the badge count. JSDoc documents the Rule 11 guarantee.

2. `module-workspace/src/WorkspaceApp.tsx` — ESCALATED-keeping branch removed. All decision outcomes (APPROVED, DENIED, ESCALATED) call `surface.remove()`. An escalated item transfers to senior authority and is no longer actionable for the current reviewer.

3. `e2e/tests/nexus-flowpath-workspace-convergence.test.tsx` — Check 1 updated (ROUTED-only filter). New Check 7 added: permanent badge-count / rendered-item parity test asserting (a) all surface items ROUTED, (b) badge text === surface count, (c) rendered card count === surface count.

---

## Justification

The Session 92 fix is the minimum correct change: revert one mis-applied filter expansion and its downstream consequence. No new abstractions, no new interfaces, no scope creep.

Rule 11 is now satisfied: one filter (`status === "ROUTED"`) in one function (`publishNexusTravelItems`), reused by startup-publish, workspace publisher, and reconciliation. `TravelQueueRow.decidable` applies the same predicate independently — the two computations now agree.

Check 7 permanently closes the gap. Future changes to the publisher filter will immediately break the parity test, making it impossible for this class of badge-mismatch defect to survive undetected to a browser walkthrough.

Pre-existing failure in `module-nexus/tests/useTTIntake.test.tsx` (routing_tier expectation mismatch) confirmed pre-existing via `git stash` verification — present on main before Session 92 changes. Out of scope for this session.

**Test results:** 15 workspaces tsc clean. 156 e2e tests pass (up from 155 — Check 7 added). 33 workspace tests pass. 171 nexus tests pass (pre-existing single failure unchanged). Zero new production dependencies. Shell contract unchanged at v1.28.
