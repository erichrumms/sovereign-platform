/**
 * SOVEREIGN Platform — module-scribe
 * tt-synthetic-review.ts — seeded Time & Travel manager-review items (Session 29, D3).
 *
 * Walkthrough E findings WE-3/WE-5: TTManagerReview.tsx existed (Session 28 D3)
 * but was mounted nowhere and had no data, so the approver's side of the time &
 * expense workflow could not be exercised at all. This file seeds the review
 * queue from the canonical @sovereign/data SYNTH records — one item per
 * communication type (docs/17 §6.4), including BOTH VIGIL gate states for a
 * formal escalation (pending authorization: send structurally disabled; already
 * authorized: send recordable).
 *
 * ALL SYNTHETIC (SYNTH- ids). Drafts here are static seed drafts standing in
 * for tt.time-drafter output so the review surface is demonstrable without a
 * live LLM call; every draft passes validateTTDraft — including the structural
 * system-invisibility rule (docs/17 §6.4: the tool name never appears).
 *
 * SCOPE NOTE (documented for Walkthrough E-2): only TIME items are seeded here.
 * Travel DECISIONS are recorded in NEXUS (recordTravelDecision emits the GD-21
 * TRAVEL_APPROVAL event there — Session 28 handoff §5.5); the NEXUS Travel &
 * Time Queue is the travel approval surface, seeded separately.
 *
 * Version: 1.0 · Session 29 · July 12, 2026
 */

import { SYNTH_TT_COMPLIANCE_FLAGS } from "@sovereign/data";
import type { ComplianceFlag } from "@sovereign/data";

import { validateTTDraft, type TTDraft } from "./tt-draft-contract";
import type { TimeReviewItem } from "./TTManagerReview";

function seedFlag(flagId: string): ComplianceFlag {
  const flag = SYNTH_TT_COMPLIANCE_FLAGS.find((f) => f.flag_id === flagId);
  if (!flag) throw new Error(`tt-synthetic-review: seed flag not found: ${flagId}`);
  return flag;
}

function seedDraft(draft: TTDraft): TTDraft {
  const check = validateTTDraft(draft);
  if (!check.valid) {
    throw new Error(`tt-synthetic-review: seed draft invalid: ${check.errors.join("; ")}`);
  }
  return draft;
}

function item(
  flagId: string,
  draft: TTDraft,
  gate?: { requiresVigilAuthorization: boolean; vigilAuthorized: boolean }
): TimeReviewItem {
  const flag = seedFlag(flagId);
  return {
    kind: "time",
    flag,
    draft: seedDraft(draft),
    requiresVigilAuthorization: gate?.requiresVigilAuthorization ?? false,
    vigilAuthorized: gate?.vigilAuthorized ?? false,
    workflow_step_id: `tt-time-${flag.flag_id}`,
  };
}

/** One review item per communication type, plus both formal-escalation gate states. */
export const DEMO_TT_REVIEW_ITEMS: TimeReviewItem[] = [
  item("SYNTH-TM-201-F1", {
    communication_type: "ERROR_CORRECTION",
    subject: "Time record 2026-06-22 to 2026-06-26 — correction required",
    body:
      "Hi,\n\nDuring review of your time record for the period June 22–26, the five entries " +
      "charged to account SYNTH-CC-4002 were flagged: that account was closed on June 15 and " +
      "no longer accepts charges (Timekeeping Policy, authorized charge account lists).\n\n" +
      "To correct: open the period in the timekeeping application, select each June 22–26 " +
      "entry, and move it to your assigned active account (SYNTH-CC-1001). Corrections are " +
      "needed before period close on July 3.\n\nIf you believe the original account is " +
      "correct, reply and we will review it together.\n\nThank you.",
  }),
  item("SYNTH-TM-202-F1", {
    communication_type: "CLARIFICATION_REQUEST",
    subject: "Time record 2026-06-22 to 2026-06-26 — quick confirmation",
    body:
      "Hi,\n\nYour time record for June 22–26 shows three 12-hour days against the " +
      "engineering account, which is above the standard 10-hour daily threshold " +
      "(Timekeeping Policy, overtime thresholds). This is often legitimate — for example " +
      "(1) approved surge support for the integration test window, or (2) a shift " +
      "extension your lead requested. Could you confirm which applies, or correct the " +
      "entries if the hours were recorded in error?\n\nThank you.",
  }),
  item("SYNTH-TM-203-F1", {
    communication_type: "JUSTIFICATION_REQUEST",
    subject: "Time record 2026-06-22 to 2026-06-26 — justification needed",
    body:
      "Hi,\n\nThe 10-hour entry on June 24 requires a brief justification narrative " +
      "(Timekeeping Policy, justification requirements) and none was recorded. Example: " +
      "“Extended shift to complete test data reduction before the June 25 review; " +
      "approved by the program lead.”\n\nTo add it: open June 24 in the timekeeping " +
      "application, select the entry, and enter the narrative in the justification field.\n\n" +
      "Thank you.",
  }),
  item("SYNTH-TM-204-F1", {
    communication_type: "PATTERN_FLAG_NOTICE",
    subject: "Checking in on recent time charging",
    body:
      "Hi,\n\nNo action needed — just checking in. Your charging this period shifted " +
      "noticeably toward the overhead account compared with your recent baseline. If your " +
      "assignments changed, that explains it and we're all set; if not, it may be worth a " +
      "quick look at the period before close. Happy to talk it through either way.\n\nThanks.",
  }),
  // Formal escalation — PENDING at the VIGIL gate: send is structurally disabled
  // until a human authorization is recorded (docs/17 §7 Tier B).
  item(
    "SYNTH-TM-205-F1",
    {
      communication_type: "FORMAL_ESCALATION",
      subject: "Formal notice — recurring time record compliance issue",
      body:
        "This is a formal notice regarding your time record for June 22–26. No hours were " +
        "recorded for June 24, and this is the third occurrence of missing hours within the " +
        "current review window (Timekeeping Policy, complete daily recording; occurrences on " +
        "May 13, June 3, and June 24). Under the recurring-issue procedure this notice is " +
        "copied to your supervisor.\n\nTo correct: record the June 24 hours, or annotate " +
        "approved leave, before period close on July 3. Please reply to confirm, or contact " +
        "me to discuss the circumstances.",
    },
    { requiresVigilAuthorization: true, vigilAuthorized: false }
  ),
  // Formal escalation — ALREADY AUTHORIZED: the send action is recordable.
  item(
    "SYNTH-TM-206-F1",
    {
      communication_type: "FORMAL_ESCALATION",
      subject: "Formal notice — recurring overtime threshold issue",
      body:
        "This is a formal notice regarding your time record for June 22–26, which totals 60 " +
        "hours against a 45-hour weekly threshold (Timekeeping Policy, overtime thresholds). " +
        "This is the third consecutive period above the threshold; per the recurring-issue " +
        "procedure this notice is copied to your supervisor.\n\nIf the sustained tempo was " +
        "directed, please have your lead confirm the authorization in writing; otherwise the " +
        "hours require correction before period close on July 3. Please reply to confirm " +
        "receipt.",
    },
    { requiresVigilAuthorization: true, vigilAuthorized: true }
  ),
];
