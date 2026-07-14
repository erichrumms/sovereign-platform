/**
 * SOVEREIGN Platform — module-scribe
 * useVigilEscalationAuthorizations.ts — live view of VIGIL's TT formal-escalation
 * authorization decisions (Session 35, cross-module state gap fix).
 *
 * THE GAP THIS CLOSES (open since Session 30's close): TTManagerReview's
 * `vigilAuthorized` was a static prop seeded at composition time — when a manager
 * authorized the escalation in VIGIL, nothing told SCRIBE, and the send action
 * stayed disabled until a manual refresh.
 *
 * THE MECHANISM (GD-19, shell-contract v1.14): VIGIL's useApprovalDecision
 * publishes each decided TT escalation to ctx.taskSurface (tt-escalation-surface.ts,
 * origin_product "VIGIL", origin_request_id = the ComplianceFlag id). This hook
 * subscribes — mirroring module-agentos's useTaskRegistry pattern, including the
 * unchanged-set bailout so a re-supplied ctx never triggers a render loop — and
 * returns the set of flag ids whose escalation is currently AUTHORIZED.
 *
 * READ-ONLY, NO GOVERNANCE AUTHORITY (Constraint #1): the decision of record is
 * VIGIL's AGENT_ACTION_* Logger event. This hook only makes that decided state
 * visible; a REJECTED publication yields no membership — the item stays gated.
 * Optional-guarded: a partial test ctx without the surface degrades to the static
 * prop behavior (empty set).
 *
 * Version: 1.0 · Session 35 · July 13, 2026
 */

import { useEffect, useState } from "react";

import type { SharedTask, SovereignShellContext } from "../../sovereign-shell/shell-contract";

/** Must match module-vigil's tt-escalation-surface.ts prefix (restated — modules cannot import each other). */
const TT_ESCALATION_TASK_PREFIX = "tt-escalation-";

/** The flag ids whose formal escalation VIGIL has AUTHORIZED, per the surface snapshot. */
function authorizedFlagIds(tasks: readonly SharedTask[]): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const t of tasks) {
    if (
      t.origin_product === "VIGIL" &&
      t.status === "APPROVED" &&
      t.task_id.startsWith(TT_ESCALATION_TASK_PREFIX) &&
      t.origin_request_id
    ) {
      ids.add(t.origin_request_id);
    }
  }
  return ids;
}

function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

/**
 * Subscribe to the shared task surface and return the set of ComplianceFlag ids
 * whose formal escalation is currently VIGIL-authorized. Empty set when the
 * surface is absent.
 */
export function useVigilEscalationAuthorizations(ctx: SovereignShellContext): ReadonlySet<string> {
  const surface = ctx.taskSurface;
  const [authorized, setAuthorized] = useState<ReadonlySet<string>>(() =>
    authorizedFlagIds(surface?.list() ?? [])
  );

  useEffect(() => {
    if (!surface) return;
    const sync = (tasks: readonly SharedTask[]): void =>
      setAuthorized((prev) => {
        const next = authorizedFlagIds(tasks);
        return sameSet(prev, next) ? prev : next;
      });
    sync(surface.list());
    return surface.subscribe(sync);
  }, [surface]);

  return authorized;
}
