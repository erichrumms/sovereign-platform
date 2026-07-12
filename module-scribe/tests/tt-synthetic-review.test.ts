/**
 * module-scribe — tt-synthetic-review.test.ts (Session 29, D3)
 * The seeded manager-review queue: every draft passes the FULL TT draft
 * validation (including the structural system-invisibility rule), every item
 * references a canonical seed flag, all five communication types are present,
 * and the formal escalation appears in BOTH VIGIL gate states.
 */
import { SYNTH_TT_COMPLIANCE_FLAGS } from "@sovereign/data";
import { validateTTDraft } from "../src/tt-draft-contract";
import { DEMO_TT_REVIEW_ITEMS } from "../src/tt-synthetic-review";

describe("DEMO_TT_REVIEW_ITEMS", () => {
  it("every draft validates — including system-invisibility (docs/17 §6.4)", () => {
    for (const item of DEMO_TT_REVIEW_ITEMS) {
      expect(validateTTDraft(item.draft)).toEqual({ valid: true });
    }
  });

  it("every item references a canonical seed flag and carries its workflow step id", () => {
    const flagIds = new Set(SYNTH_TT_COMPLIANCE_FLAGS.map((f) => f.flag_id));
    for (const item of DEMO_TT_REVIEW_ITEMS) {
      expect(flagIds).toContain(item.flag.flag_id);
      expect(item.workflow_step_id).toBe(`tt-time-${item.flag.flag_id}`);
      expect(item.flag.flag_id).toMatch(/^SYNTH-/);
    }
  });

  it("covers all five communication types", () => {
    const types = new Set(DEMO_TT_REVIEW_ITEMS.map((i) => i.draft.communication_type));
    for (const t of [
      "ERROR_CORRECTION",
      "CLARIFICATION_REQUEST",
      "JUSTIFICATION_REQUEST",
      "PATTERN_FLAG_NOTICE",
      "FORMAL_ESCALATION",
    ]) {
      expect(types).toContain(t);
    }
  });

  it("includes the formal escalation in BOTH gate states — pending and authorized", () => {
    const escalations = DEMO_TT_REVIEW_ITEMS.filter((i) => i.requiresVigilAuthorization);
    expect(escalations.some((i) => !i.vigilAuthorized)).toBe(true); // send structurally disabled
    expect(escalations.some((i) => i.vigilAuthorized)).toBe(true); // send recordable
    // Only FORMAL_ESCALATION drafts sit behind the Tier B gate (docs/17 §7).
    for (const i of escalations) expect(i.draft.communication_type).toBe("FORMAL_ESCALATION");
    for (const i of DEMO_TT_REVIEW_ITEMS.filter((x) => !x.requiresVigilAuthorization)) {
      expect(i.draft.communication_type).not.toBe("FORMAL_ESCALATION");
    }
  });
});
