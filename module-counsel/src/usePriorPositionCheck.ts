/**
 * SOVEREIGN Platform — module-counsel
 * usePriorPositionCheck.ts — the Prior Position Check hook.
 *
 * Owns the scoped lookup of prior Decision Records (via the injectable
 * PriorPositionProvider) and the PRIOR_POSITION_RECONCILIATION Logger emission
 * (GD-3, shell-contract v1.1). Both resolution paths are logged; neither is
 * blocked. CPMI-VRS Gate 2: a Logger-emit failure is surfaced, never swallowed.
 *
 * Version: 1.0 · Session 4 · June 15, 2026
 */

import { useCallback, useEffect, useRef, useState } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { DecisionFrame } from "./types";
import {
  buildReconciliationPayload,
  syntheticPriorPositionProvider,
  type ConflictingRecord,
  type PriorPositionProvider,
  type ReconciliationResolution,
} from "./prior-position";

const COUNSEL_ANALYST = "counsel-analyst";

export type PriorCheckStatus = "checking" | "ready" | "error";

export interface UsePriorPositionCheck {
  status: PriorCheckStatus;
  conflicts: ConflictingRecord[];
  error: string | null;
  /** Emit the reconciliation event. Returns true on success (event logged). */
  reconcile: (resolution: ReconciliationResolution, note?: string) => Promise<boolean>;
}

/** Session-stable id for the decision currently being reconciled. */
function newDecisionId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  return c?.randomUUID?.() ?? `counsel-dr-${Date.now()}`;
}

export function usePriorPositionCheck(
  ctx: SovereignShellContext,
  frame: DecisionFrame,
  provider: PriorPositionProvider = syntheticPriorPositionProvider
): UsePriorPositionCheck {
  const [status, setStatus] = useState<PriorCheckStatus>("checking");
  const [conflicts, setConflicts] = useState<ConflictingRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const currentDecisionId = useRef<string>(newDecisionId());
  const queried = useRef(false);

  useEffect(() => {
    if (queried.current) return;
    queried.current = true;
    let cancelled = false;
    void (async () => {
      try {
        const found = await provider.findConflicts({
          userId: ctx.auth.user.employee_id,
          decisionType: frame.sovereignContext.decisionType,
          workflowStepId: frame.sovereignContext.workflowStepId,
        });
        if (!cancelled) {
          setConflicts(found);
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setError(`Prior position lookup failed: ${err instanceof Error ? err.message : String(err)}`);
          setStatus("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ctx, frame, provider]);

  const reconcile = useCallback(
    async (resolution: ReconciliationResolution, note?: string): Promise<boolean> => {
      const built = buildReconciliationPayload({
        currentDecisionId: currentDecisionId.current,
        conflictingRecordIds: conflicts.map((c) => c.recordId),
        resolution,
        decisionType: frame.sovereignContext.decisionType,
        note,
      });
      if (!built.ok) {
        setError(built.error);
        return false;
      }
      try {
        ctx.logger.log({
          event_type: "PRIOR_POSITION_RECONCILIATION",
          workflow_step_id: frame.sovereignContext.workflowStepId,
          sovereign_tier: "standard",
          product: "COUNSEL",
          actor_id: ctx.auth.user.employee_id,
          agent_id: COUNSEL_ANALYST,
          outcome: resolution,
          payload: built.payload as unknown as Record<string, unknown>,
        });
        setError(null);
        return true;
      } catch (err) {
        // Gate 2: surface, do not silently continue.
        setError(
          `Logger emission failed — reconciliation not recorded (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        return false;
      }
    },
    [ctx, frame, conflicts]
  );

  return { status, conflicts, error, reconcile };
}
