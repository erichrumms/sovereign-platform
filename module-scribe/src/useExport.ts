/**
 * SOVEREIGN Platform — module-scribe
 * useExport.ts — the SCRIBE Export gate hook (CPMI-VRS Gate 3).
 *
 * The human approval step (spec §4.5). No draft reaches a SOVEREIGN product
 * without explicit human approval, and a draft that FAILS schema validation cannot
 * be approved (spec §7 Gate 3: "Schema validation must pass before the approval
 * button is active"). This session covers the SOVEREIGN-product export path for the
 * six product-intake modes; the Output Studio external path is a later deliverable.
 *
 * On approval the hook:
 *   0. CLEAR export gate (ARIA Suite, GD-20): if the draft targets an existing pipeline
 *      document (source.context.documentId present), the document must hold a positive
 *      CLEAR certification on the shell certification surface (ctx.aria.isCertified). An
 *      uncertified document is blocked from export with a plain-prose notice — a
 *      compliance reviewer must certify it in the ARIA Suite Certification Queue first.
 *      Drafts with no documentId (new authored content) are not subject to the gate.
 *   1. Re-validates the (human-edited) draft against the mode's @sovereign/data
 *      schema — defense in depth; never trusts the UI's enable/disable alone.
 *   2. Emits a HUMAN_DECISION Logger event (approved event type) carrying the
 *      frozen IL fields: decision_type (from the canonical HumanDecisionType
 *      taxonomy — the human's approval is HUMAN_APPROVAL), actor "human",
 *      actor_name, and workflow_step_id (Standing Constraints #4 and #6).
 *   3. Routes to the destination product via ctx.navigation (no direct product API
 *      call from SCRIBE — spec §4 integrations).
 *
 * CPMI-VRS Gate 2: if the Logger emit FAILS the export is NOT performed (no
 * navigation, not marked exported) and the error is surfaced — an unlogged export
 * is an ungoverned export. The Logger emit gates the navigation.
 *
 * Version: 1.0 · Session 6 · June 17, 2026
 */

import { useCallback, useState } from "react";

import type { SovereignShellContext, SovereignProduct } from "../../sovereign-shell/shell-contract";
import { PR_SCRIBE_001, validateModeOutput, type DraftableMode, type ModeOutput } from "./draft-contract";
import { DRAFTING_PROMPT_VERSION } from "./prompts/drafting-system.prompt";
import { draftWorkflowStepId, type DraftInput } from "./draft-engine";

export type ExportStatus = "idle" | "exported" | "error";

/** Everything needed to approve and route one draft to its destination product. */
export interface ExportInput {
  mode: DraftableMode;
  /** The current (possibly human-edited) draft. */
  draft: ModeOutput;
  /** The originating input — supplies the workflow_step_id and product context. */
  source: DraftInput;
  /** Destination SOVEREIGN product (the mode's target). */
  targetProduct: SovereignProduct;
}

export interface UseExport {
  status: ExportStatus;
  error: string | null;
  /** True when the current draft passes the mode schema — Gate 3 enables approval. */
  isExportable: (mode: DraftableMode, draft: ModeOutput) => boolean;
  /** Approve + emit + route. Returns true on a fully completed, logged export. */
  approve: (input: ExportInput) => boolean;
  reset: () => void;
}

export function useExport(ctx: SovereignShellContext): UseExport {
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const isExportable = useCallback(
    (mode: DraftableMode, draft: ModeOutput): boolean => validateModeOutput(mode, draft).valid,
    []
  );

  const approve = useCallback(
    (input: ExportInput): boolean => {
      setError(null);

      // --- CLEAR export gate (ARIA Suite, GD-20): an existing pipeline document must be
      // certified by CLEAR before it can leave the platform. New drafts (no documentId)
      // carry no certifiable pipeline identity and are not gated here. ---
      const documentId = input.source.context?.documentId;
      if (documentId && !ctx.aria.isCertified(documentId)) {
        setError(
          "Export blocked — this document has not been certified by CLEAR. A compliance reviewer " +
            "must certify it in the ARIA Suite Certification Queue before it can be exported."
        );
        setStatus("error");
        return false;
      }

      // --- Gate 3: schema must validate before anything is exported ---
      const check = validateModeOutput(input.mode, input.draft);
      if (!check.valid) {
        setError(
          `Export blocked — the draft does not satisfy the ${input.mode} schema (CPMI-VRS Gate 3): ${check.errors.join("; ")}`
        );
        setStatus("error");
        return false;
      }

      const wsid = draftWorkflowStepId(input.source);

      // --- Gate 2: emit the HUMAN_DECISION event. A failed emit blocks export. ---
      try {
        ctx.logger.log({
          event_type: "HUMAN_DECISION",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "SCRIBE",
          actor_id: ctx.auth.user.employee_id,
          outcome: "draft_exported",
          // HUMAN_DECISION-only frozen IL fields (shell logger validator enforces all three).
          decision_type: "HUMAN_APPROVAL",
          actor: "human",
          actor_name: ctx.auth.user.name,
          payload: {
            registry_id: PR_SCRIBE_001.registryId,
            prompt_version: DRAFTING_PROMPT_VERSION,
            mode: input.mode,
            target_product: input.targetProduct,
            export_schema_valid: true,
            program_id: input.source.context?.programId ?? null,
            document_id: input.source.context?.documentId ?? null,
          },
        });
      } catch (err) {
        setError(
          `Logger emission failed — export not performed (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setStatus("error");
        return false;
      }

      // --- Logged → route to the destination product (no direct product API call) ---
      ctx.navigation.navigateTo(`/${input.targetProduct.toLowerCase()}`);
      setStatus("exported");
      return true;
    },
    [ctx]
  );

  const reset = useCallback((): void => {
    setStatus("idle");
    setError(null);
  }, []);

  return { status, error, isExportable, approve, reset };
}
