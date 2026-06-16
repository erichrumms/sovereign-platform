/**
 * SOVEREIGN Platform — module-counsel
 * prior-position.ts — Prior Position Check logic (pure, no React).
 *
 * The Prior Position Alert surfaces the user's own prior Decision Records that may
 * conflict with the decision now being framed (spec §2.1 / §6), then logs how the
 * user reconciled them as a PRIOR_POSITION_RECONCILIATION event (GD-3, shell-
 * contract v1.1). Both resolution paths are logged; neither is blocked.
 *
 * DATA SOURCE — stub-with-stable-signature:
 *   The spec calls for a SOF Logger scoped-query API (read-only, scoped to
 *   ctx.auth.userId, scope enforced by the platform). The shell contract's
 *   `logger` exposes only log() — there is NO scoped query API on the context yet.
 *   Adding one is a shell-contract change (governance decision). Until then a
 *   synthetic provider stands in behind the PriorPositionProvider interface; the
 *   real provider swaps in with no call-site change. FLAGGED for the Integration
 *   Brief.
 *
 * Version: 1.0 · Session 4 · June 15, 2026
 */

import type { HumanDecisionType } from "@sovereign/data";

/** A prior Decision Record that may conflict with the current decision (spec §3). */
export interface ConflictingRecord {
  recordId: string;
  date: string; // ISO 8601
  decisionType: HumanDecisionType;
  conclusion: string;
  conflictingElement: string;
}

export interface PriorPositionQuery {
  /** Scoped to this user — the real provider relies on platform-enforced scoping. */
  userId: string;
  decisionType: HumanDecisionType;
  workflowStepId: string;
}

/**
 * The scoped lookup of the user's prior Decision Records. Injectable so the
 * synthetic provider (now) and the real SOF Logger scoped-query provider (later)
 * are interchangeable with no call-site change.
 */
export interface PriorPositionProvider {
  findConflicts: (query: PriorPositionQuery) => Promise<ConflictingRecord[]>;
}

export type ReconciliationResolution = "acknowledged" | "dismissed";

// ------------------------------------------------------------
// Synthetic provider (the approved demo default)
// ------------------------------------------------------------

/**
 * Synthetic prior Decision Records for the demo. Deterministic; keyed by
 * decisionType so common framing paths (e.g. HUMAN_APPROVAL) surface a real
 * prior-position alert. Replaced by the SOF Logger scoped query when that API is
 * added to the contract.
 */
const SYNTHETIC_PRIOR_RECORDS: ConflictingRecord[] = [
  {
    recordId: "DR-2026-0042",
    date: "2026-05-20",
    decisionType: "HUMAN_APPROVAL",
    conclusion: "Approved a comparable vendor change request.",
    conflictingElement:
      "That prior approval proceeded without independently verifying the vendor's CAGE/cleared status — the same step you are weighing skipping now.",
  },
  {
    recordId: "DR-2026-0031",
    date: "2026-04-11",
    decisionType: "HUMAN_DENIAL",
    conclusion: "Denied a comparable request citing incomplete documentation.",
    conflictingElement:
      "You previously denied a similar request for incomplete documentation — reconcile that prior standard with the current direction.",
  },
  {
    recordId: "DR-2026-0050",
    date: "2026-06-02",
    decisionType: "TRAVEL_ESCALATED",
    conclusion: "Escalated a borderline travel authorization rather than deciding it.",
    conflictingElement: "A comparable borderline case was escalated rather than approved directly.",
  },
];

export const syntheticPriorPositionProvider: PriorPositionProvider = {
  findConflicts: async (query) =>
    SYNTHETIC_PRIOR_RECORDS.filter((r) => r.decisionType === query.decisionType),
};

// ------------------------------------------------------------
// Reconciliation event payload (pure, testable)
// ------------------------------------------------------------

export interface ReconciliationInput {
  currentDecisionId: string;
  conflictingRecordIds: string[];
  resolution: ReconciliationResolution;
  decisionType: HumanDecisionType;
  /** Required iff resolution === "acknowledged". */
  note?: string;
}

/**
 * The structured PRIOR_POSITION_RECONCILIATION payload (shell-contract v1.1
 * PriorPositionReconciliationEvent shape, minus the top-level event_type /
 * workflow_step_id / agent_id which the Logger carries). reconciliation_note is
 * PRESENT iff acknowledged and ABSENT otherwise — enforced here at the emit site.
 */
export interface ReconciliationPayload {
  current_decision_id: string;
  conflicting_record_ids: string[];
  resolution: ReconciliationResolution;
  decision_type: HumanDecisionType;
  reconciliation_note?: string;
}

export type BuildReconciliationResult =
  | { ok: true; payload: ReconciliationPayload }
  | { ok: false; error: string };

/**
 * Build + validate the reconciliation payload. Enforces the contract constraint:
 * acknowledged ⇒ a non-empty reconciliation_note is present; dismissed ⇒ the
 * field is absent (not just undefined).
 */
export function buildReconciliationPayload(input: ReconciliationInput): BuildReconciliationResult {
  const base: ReconciliationPayload = {
    current_decision_id: input.currentDecisionId,
    conflicting_record_ids: input.conflictingRecordIds,
    resolution: input.resolution,
    decision_type: input.decisionType,
  };

  if (input.resolution === "acknowledged") {
    const note = (input.note ?? "").trim();
    if (note === "") {
      return { ok: false, error: "An acknowledged prior position requires a reconciliation note." };
    }
    return { ok: true, payload: { ...base, reconciliation_note: note } };
  }

  // dismissed — reconciliation_note must be ABSENT from the object.
  return { ok: true, payload: base };
}
