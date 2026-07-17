/**
 * SOVEREIGN Platform — module-vigil
 * useObligationDecision.ts — Tier C obligation authorization decision hook.
 *
 * Wraps recordObligationAuthorization() from ppbe-authorization.ts. Holds the
 * gate case in state (initially PENDING_AUTHORIZATION) and records the human's
 * decision. The Approve action requires BOTH a note (≥10 chars) AND a linked
 * COUNSEL Decision Record ID — this is structurally enforced by
 * canSubmitObligationDecision() inside recordObligationAuthorization().
 *
 * CPMI-VRS Gate 2: a failed Logger emit blocks the decision; the case stays
 * PENDING_AUTHORIZATION and the operator sees the error.
 *
 * Version: 1.0 · Session 38 · July 16, 2026
 */

import { useCallback, useState } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  recordObligationAuthorization,
  type PPBEGateAction,
  type PPBEGateOperator,
  type PPBEObligationCase,
} from "./ppbe-authorization";

export interface ObligationDecisionResult {
  ok: boolean;
}

export interface UseObligationDecision {
  gateCase: PPBEObligationCase;
  error: string | null;
  decide: (action: PPBEGateAction, note: string, counselDecisionRecordId: string) => ObligationDecisionResult;
}

export function useObligationDecision(
  ctx: SovereignShellContext,
  initialCase: PPBEObligationCase
): UseObligationDecision {
  const [gateCase, setGateCase] = useState<PPBEObligationCase>(initialCase);
  const [error, setError] = useState<string | null>(null);

  const decide = useCallback(
    (action: PPBEGateAction, note: string, counselDecisionRecordId: string): ObligationDecisionResult => {
      setError(null);

      const operator: PPBEGateOperator = {
        id: ctx.auth.user.employee_id,
        name: ctx.auth.user.name,
      };

      const result = recordObligationAuthorization(
        gateCase,
        action,
        operator,
        note,
        counselDecisionRecordId,
        ctx.logger
      );

      if (!result.ok) {
        setError(result.error ?? "Decision failed.");
        return { ok: false };
      }

      setGateCase(result.case);
      return { ok: true };
    },
    [ctx, gateCase]
  );

  return { gateCase, error, decide };
}
