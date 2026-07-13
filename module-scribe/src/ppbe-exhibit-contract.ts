/**
 * SOVEREIGN Platform — module-scribe
 * ppbe-exhibit-contract.ts — the PPBE exhibit drafting output contract
 * (Session 32, D3).
 *
 * ppbe-exhibit-drafter extends SCRIBE's drafting engine with three PPBE
 * document modes (docs/18 §7.2): Budget Exhibit, Congressional Justification,
 * and Evaluation Report. It is a PPBE workflow-layer agent hosted on SCRIBE
 * infrastructure (D-P6 — no new module directory; AIS D-P5), operating under
 * the PENDING registered prompt ppbe/prompts/exhibit_drafting_system.md
 * (authored Session 32 per the July 12 AGENT_REFERENCE.md reassignment;
 * synthetic-data use only until approved).
 *
 * GOVERNANCE NOTES:
 *  - The registry's prompt requirement overrides docs/18 §5's "inferred no"
 *    (Session 32 standing rule — Registry wins; discrepancy logged in handoff).
 *  - The three document modes are a MODULE-LEVEL taxonomy, not SCRIBEMode
 *    members — SCRIBEMode is a shell-contract union (v1.1, GD-2) and no GD
 *    this session authorizes widening it. Same deliberate pattern as the TT
 *    communication modes (Session 28).
 *
 * FIGURE TRACEABILITY ENFORCED STRUCTURALLY (docs/18 §3.3 / architecture doc
 * §9): every figure in a draft must cite the workflow_step_id of a governed
 * record supplied in the drafting input. The validator rejects any draft
 * citing a source that was never supplied — a fabricated figure can never
 * reach the review queue.
 *
 * THE DOUBLE EXPORT GATE (docs/18 §7.2 — stricter than the general SCRIBE
 * gate): no PPBE document exports without BOTH (1) a positive ARIA Suite CLEAR
 * certification AND (2) an explicit human review and sign-off with a decision
 * note. Both are enforced here; neither alone opens the gate. The Output
 * Studio web publishing path is structurally disallowed for PPBE modes in
 * federal deployments (same rule as the general scribe-drafter registry entry,
 * restated as code).
 *
 * SYSTEM-INVISIBLE: the platform never appears in an outgoing document —
 * enforced by reusing the TT drafters' disclosure validator (same module,
 * same rule, Constraint #2: no divergent duplicate).
 *
 * Version: 1.0 · Session 32 · July 13, 2026
 */

import type { ValidationResult } from "@sovereign/data";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { disclosesSystem } from "./tt-draft-contract";

// ============================================================
// AGENT ID + PROMPT REGISTRY BINDING (Constraints #9 / #10)
// ============================================================

export const PPBE_EXHIBIT_DRAFTER = "ppbe-exhibit-drafter";

/** Registry binding stamped onto Logger events as prompt provenance (AIS D-P5). */
export const PPBE_EXHIBIT_PROMPT_REGISTRATION = {
  file: "ppbe/prompts/exhibit_drafting_system.md",
  promptVersion: "v1.0",
  /** PENDING — synthetic-data use only until the Project Principal approves. */
  status: "PENDING",
} as const;

// ============================================================
// THE THREE PPBE DOCUMENT MODES (module-level taxonomy — see header)
// ============================================================

export type PPBEDocumentMode =
  | "BUDGET_EXHIBIT"
  | "CONGRESSIONAL_JUSTIFICATION"
  | "EVALUATION_REPORT";

export const PPBE_DOCUMENT_MODES: readonly PPBEDocumentMode[] = [
  "BUDGET_EXHIBIT",
  "CONGRESSIONAL_JUSTIFICATION",
  "EVALUATION_REPORT",
];

/** Plain-prose mode names (Gap 5). */
export const PPBE_DOCUMENT_MODE_NAMES: Record<PPBEDocumentMode, string> = {
  BUDGET_EXHIBIT: "Budget Exhibit",
  CONGRESSIONAL_JUSTIFICATION: "Congressional Justification",
  EVALUATION_REPORT: "Evaluation Report",
};

// ============================================================
// DRAFT SHAPE + VALIDATION
// ============================================================

/** One numeric figure and the governed record it comes from. */
export interface ExhibitFigure {
  /** Plain prose (Gap 5) — what the figure is. */
  label: string;
  /** Whole currency units (or a count, for Evaluation Report figures). */
  value: number;
  /** The Logger reference of the governed record this figure comes from. */
  source_workflow_step_id: string;
}

/** A drafted PPBE document. NEVER exported by the system — see the double gate. */
export interface PPBEExhibitDraft {
  document_mode: PPBEDocumentMode;
  /** Plain prose, naming the program and fiscal year from the data. */
  title: string;
  /** The document body — plain prose (Gap 5). */
  narrative: string;
  /** Every numeric figure the narrative uses, each cited to its source. */
  figures: ExhibitFigure[];
  workflow_step_id: string;
}

function result(errors: string[]): ValidationResult {
  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Validate a PPBE exhibit draft before it reaches the review queue: shape,
 * mode membership, figure-source traceability against the governed records
 * actually supplied, and system invisibility. Run on the LLM output AND
 * re-run by the sign-off gate on the human-edited draft.
 */
export function validatePPBEExhibitDraft(
  value: unknown,
  allowedSourceRefs: ReadonlySet<string>
): ValidationResult {
  const errors: string[] = [];
  if (typeof value !== "object" || value === null) {
    return result(["draft must be a non-null object"]);
  }
  const d = value as Partial<PPBEExhibitDraft>;

  if (!PPBE_DOCUMENT_MODES.includes(d.document_mode as PPBEDocumentMode)) {
    errors.push(`document_mode: must be one of ${PPBE_DOCUMENT_MODES.join(" | ")}`);
  }
  if (typeof d.title !== "string" || d.title.trim() === "") {
    errors.push("title: required non-empty string");
  }
  if (typeof d.narrative !== "string" || d.narrative.trim() === "") {
    errors.push("narrative: required non-empty string");
  }
  if (typeof d.workflow_step_id !== "string" || d.workflow_step_id.trim() === "") {
    errors.push("workflow_step_id: required non-empty string (Constraint #6)");
  }

  if (!Array.isArray(d.figures)) {
    errors.push("figures: required array (may be empty for a purely narrative document)");
  } else {
    d.figures.forEach((f, i) => {
      const fig = f as Partial<ExhibitFigure>;
      if (typeof fig.label !== "string" || fig.label.trim() === "") {
        errors.push(`figures[${i}].label: required`);
      }
      if (typeof fig.value !== "number" || !Number.isFinite(fig.value)) {
        errors.push(`figures[${i}].value: must be a finite number`);
      }
      if (typeof fig.source_workflow_step_id !== "string" || fig.source_workflow_step_id.trim() === "") {
        errors.push(`figures[${i}].source_workflow_step_id: required`);
      } else if (!allowedSourceRefs.has(fig.source_workflow_step_id)) {
        errors.push(
          `figures[${i}].source_workflow_step_id: "${fig.source_workflow_step_id}" is not a supplied ` +
            "governed record — fabricated figure source (docs/18 §3.3 traceability)"
        );
      }
    });
  }

  const prose = `${d.title ?? ""}\n${d.narrative ?? ""}`;
  if (disclosesSystem(prose)) {
    errors.push(
      "system-invisibility violation: the document references the platform, an agent, or an AI system — " +
        "PPBE documents follow the same invisibility rule as every other drafted communication"
    );
  }
  return result(errors);
}

/**
 * The BudgetExhibit entity fields a host assembles from an approved draft:
 * narrative_content plus the deduplicated source_data_lineage (docs/18 §3.3 —
 * every figure traceable). The host merges these into the canonical entity;
 * this module never writes to any data store.
 */
export function toBudgetExhibitFields(draft: PPBEExhibitDraft): {
  narrative_content: string;
  source_data_lineage: string[];
} {
  return {
    narrative_content: draft.narrative,
    source_data_lineage: [...new Set(draft.figures.map((f) => f.source_workflow_step_id))],
  };
}

// ============================================================
// EXPORT CHANNELS — Output Studio web publishing stays closed
// ============================================================

export type PPBEExportChannel = "SOVEREIGN_PRODUCT" | "DOCUMENT_EXPORT" | "OUTPUT_STUDIO_WEB";

/**
 * The Output Studio web publishing path is disabled for PPBE document modes in
 * federal deployments (registry scope constraint, restated structurally).
 */
export function isPPBEExportChannelPermitted(channel: PPBEExportChannel): boolean {
  return channel !== "OUTPUT_STUDIO_WEB";
}

// ============================================================
// THE DOUBLE EXPORT GATE — CLEAR certification AND human sign-off
// ============================================================

/** Aligned with the VIGIL decision-note minimum (restated — Constraint #11, no cross-module import). */
export const PPBE_SIGNOFF_NOTE_MIN_CHARS = 10;

export function validSignOffNote(note: string): boolean {
  return note.trim().length >= PPBE_SIGNOFF_NOTE_MIN_CHARS;
}

/**
 * THE GATE PREDICATE (docs/18 §7.2 — both required, stricter than the general
 * SCRIBE gate): the sign-off action stays inactive until the document holds a
 * positive CLEAR certification AND the reviewer has written a decision note.
 */
export function canSubmitExhibitSignOff(clearCertified: boolean, note: string): boolean {
  return clearCertified && validSignOffNote(note);
}

/** Minimal logger surface (ctx.logger-compatible; injectable for Node tests). */
export interface PPBEExhibitLogger {
  log: (event: SovereignLogEvent) => void;
}

/** The human reviewer signing off an exhibit export. */
export interface PPBEExhibitReviewer {
  id: string;
  name: string;
}

/** The export approval of record — carries both gate facts (registry export fields). */
export interface ExhibitExportApproval {
  document_mode: PPBEDocumentMode;
  program_id: string;
  fiscal_year: string;
  approved_by: string;
  decision_note: string;
  /** Both gates, recorded as facts of the approval. */
  aria_clear_certified: true;
  data_classification_confirmed: true;
  workflow_step_id: string;
}

export interface ExhibitSignOffResult {
  ok: boolean;
  approval?: ExhibitExportApproval;
  error?: string;
}

/**
 * Record the human sign-off half of the double gate. Blocks unless: the CLEAR
 * certification is present (gate 1), the note meets the minimum (gate 2's
 * evidence), and the (possibly human-edited) draft still validates against the
 * supplied governed records. Emits HUMAN_DECISION with decision_type
 * HUMAN_APPROVAL (Session 31 decision #5 — no PPBE-specific HumanDecisionType);
 * a failed Logger emit BLOCKS the approval (CPMI-VRS Gate 2). Pure over its
 * input — no data store is written here; the host performs the actual export
 * only on ok === true.
 */
export function recordExhibitSignOff(
  draft: PPBEExhibitDraft,
  program: { program_id: string; fiscal_year: string },
  allowedSourceRefs: ReadonlySet<string>,
  reviewer: PPBEExhibitReviewer,
  note: string,
  clearCertified: boolean,
  logger: PPBEExhibitLogger
): ExhibitSignOffResult {
  if (!clearCertified) {
    return {
      ok: false,
      error:
        "Export blocked — this document has not been certified by CLEAR. A compliance reviewer " +
        "must certify it in the ARIA Suite Certification Queue before it can be signed off " +
        "(docs/18 §7.2 — both gates are required).",
    };
  }
  if (!validSignOffNote(note)) {
    return {
      ok: false,
      error: `A decision note of at least ${PPBE_SIGNOFF_NOTE_MIN_CHARS} characters is required to sign off this export.`,
    };
  }
  const check = validatePPBEExhibitDraft(draft, allowedSourceRefs);
  if (!check.valid) {
    return {
      ok: false,
      error: `Export blocked — the draft does not satisfy the PPBE exhibit contract: ${check.errors.join("; ")}`,
    };
  }

  const trimmedNote = note.trim();
  try {
    logger.log({
      event_type: "HUMAN_DECISION",
      workflow_step_id: draft.workflow_step_id,
      sovereign_tier: "standard",
      product: "SCRIBE",
      actor_id: reviewer.id,
      outcome: "ppbe_exhibit_export_signed_off",
      decision_type: "HUMAN_APPROVAL",
      actor: "human",
      actor_name: reviewer.name,
      payload: {
        agent_id: PPBE_EXHIBIT_DRAFTER,
        prompt_file: PPBE_EXHIBIT_PROMPT_REGISTRATION.file,
        prompt_version: PPBE_EXHIBIT_PROMPT_REGISTRATION.promptVersion,
        document_mode: draft.document_mode,
        program_id: program.program_id,
        fiscal_year: program.fiscal_year,
        aria_clear_certified: true,
        data_classification_confirmed: true,
        figure_count: draft.figures.length,
        notes: trimmedNote,
      },
    });
  } catch (err) {
    return {
      ok: false,
      error: `Logger emission failed — sign-off not recorded (CPMI-VRS Gate 2): ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  return {
    ok: true,
    approval: {
      document_mode: draft.document_mode,
      program_id: program.program_id,
      fiscal_year: program.fiscal_year,
      approved_by: reviewer.name,
      decision_note: trimmedNote,
      aria_clear_certified: true,
      data_classification_confirmed: true,
      workflow_step_id: draft.workflow_step_id,
    },
  };
}
