/**
 * SOVEREIGN Platform — module-counsel
 * useDecisionRecord.ts — the Decision Record hook.
 *
 * Owns assembly + Logger emission of the final DecisionRecord. Wraps the pure
 * buildDecisionRecord (decision-record.ts) with ctx.auth identity, a runtime clock
 * and document-id generator, and ctx.logger.
 *
 * CPMI-VRS Gate 2 (spec §7): the HUMAN_DECISION event is emitted via ctx.logger;
 * if the emit FAILS, the hook surfaces an error and does NOT silently continue —
 * the record is not treated as produced.
 * CPMI-VRS Gate 3: buildDecisionRecord refuses to assemble until reviewConfirmed.
 *
 * The Decision Record involves no LLM call — it aggregates the completed session —
 * so there is no three-tier fallback here; the fallback discipline lives in the
 * analysis / counterargument / pre-mortem engines that feed it.
 *
 * Version: 1.0 · Session 5 · June 16, 2026
 */

import { useCallback, useState } from "react";

import type { Document } from "@sovereign/data";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  buildDecisionRecord,
  type DecisionRecordDeps,
  type DecisionRecordInput,
} from "./decision-record";

export type DecisionRecordStatus = "idle" | "recorded" | "error";

export interface UseDecisionRecord {
  status: DecisionRecordStatus;
  document: Document | null;
  errors: string[] | null;
  /** Assemble, validate, and emit the HUMAN_DECISION event. Returns the Document on success. */
  record: (input: DecisionRecordInput) => Document | null;
  reset: () => void;
}

export function useDecisionRecord(ctx: SovereignShellContext): UseDecisionRecord {
  const [status, setStatus] = useState<DecisionRecordStatus>("idle");
  const [document, setDocument] = useState<Document | null>(null);
  const [errors, setErrors] = useState<string[] | null>(null);

  const record = useCallback(
    (input: DecisionRecordInput): Document | null => {
      setErrors(null);

      const deps: DecisionRecordDeps = {
        now: () => new Date().toISOString(),
        newDocumentId: () =>
          `COUNSEL-DR-${input.frame.sovereignContext.workflowStepId}-${Date.now()}`,
        actorId: ctx.auth.user.employee_id,
        actorName: ctx.auth.user.name,
      };

      const result = buildDecisionRecord(input, deps);
      if (!result.ok) {
        setErrors(result.errors);
        setStatus("error");
        return null;
      }

      // --- Gate 2: emit the HUMAN_DECISION event. A failed emit aborts. ---
      try {
        ctx.logger.log(result.record.event);
      } catch (err) {
        setErrors([
          `Logger emission failed — Decision Record not produced (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`,
        ]);
        setStatus("error");
        return null;
      }

      setDocument(result.record.document);
      setStatus("recorded");
      return result.record.document;
    },
    [ctx]
  );

  const reset = useCallback((): void => {
    setStatus("idle");
    setDocument(null);
    setErrors(null);
  }, []);

  return { status, document, errors, record, reset };
}
