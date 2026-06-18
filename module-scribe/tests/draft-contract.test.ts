/**
 * module-scribe — draft-contract.test.ts
 * The per-mode output validators and the validateModeOutput dispatcher: a valid
 * draft passes for each of the six product-intake modes, representative malformed
 * drafts are rejected, decision_type is checked against the canonical taxonomy, and
 * the dispatcher refuses the two intermediate modes. Node env; no React, no network.
 */

import {
  validateModeOutput,
  validateCorrespondenceDraft,
  validateProgramNarrative,
  validateReportCommentary,
  validateVVRDescription,
  validateGovernanceMemo,
  validateRuleChangeProposal,
  isDraftableMode,
  DRAFTABLE_MODES,
  PR_SCRIBE_001,
} from "../src/draft-contract";

function expectValid(r: { valid: boolean }): void {
  expect(r.valid).toBe(true);
}
function expectInvalid(r: { valid: boolean }): string[] {
  expect(r.valid).toBe(false);
  return (r as { valid: false; errors: string[] }).errors;
}

describe("PR-SCRIBE-001 binding", () => {
  it("stamps the registered drafting prompt id + version", () => {
    expect(PR_SCRIBE_001.registryId).toBe("PR-SCRIBE-001");
    expect(PR_SCRIBE_001.promptVersion).toBe("v1.0");
  });
});

describe("DRAFTABLE_MODES / isDraftableMode", () => {
  it("is exactly the six product-aligned modes", () => {
    expect([...DRAFTABLE_MODES].sort()).toEqual(
      [
        "correspondence_draft",
        "governance_memo",
        "program_narrative",
        "report_commentary",
        "rule_change_proposal",
        "vvr_description",
      ].sort()
    );
  });
  it("excludes the intermediate modes", () => {
    expect(isDraftableMode("correspondence_draft")).toBe(true);
    expect(isDraftableMode("synthesis")).toBe(false);
    expect(isDraftableMode("framing")).toBe(false);
  });
});

describe("validateCorrespondenceDraft (→ NEXUS)", () => {
  const valid = {
    subject: "Vendor change response",
    body: "Drafted body text.",
    action_items: [{ description: "Confirm cost code", owner_role: "PM", due_date: "2026-07-01" }],
    program_id: "PRG-1",
    decision_type: "HUMAN_APPROVAL",
  };
  it("accepts a well-formed draft (with optional fields)", () => expectValid(validateCorrespondenceDraft(valid)));
  it("accepts an empty action_items array", () =>
    expectValid(validateCorrespondenceDraft({ subject: "s", body: "b", action_items: [] })));
  it("rejects a missing subject", () => {
    const e = expectInvalid(validateCorrespondenceDraft({ ...valid, subject: "" }));
    expect(e.join()).toMatch(/subject/);
  });
  it("rejects an action_item without a description", () => {
    const e = expectInvalid(validateCorrespondenceDraft({ subject: "s", body: "b", action_items: [{}] }));
    expect(e.join()).toMatch(/action_items\[0\]\.description/);
  });
  it("rejects an out-of-taxonomy decision_type", () => {
    const e = expectInvalid(validateCorrespondenceDraft({ ...valid, decision_type: "MAYBE" }));
    expect(e.join()).toMatch(/decision_type/);
  });
});

describe("validateProgramNarrative (→ NEXUS/APEX)", () => {
  const valid = {
    program_id: "PRG-1",
    period: "Q3 FY26",
    narrative: "Program is on track.",
    key_themes: ["schedule"],
    risks_noted: [],
  };
  it("accepts a well-formed narrative", () => expectValid(validateProgramNarrative(valid)));
  it("rejects a non-array key_themes", () => {
    const e = expectInvalid(validateProgramNarrative({ ...valid, key_themes: "schedule" }));
    expect(e.join()).toMatch(/key_themes/);
  });
  it("rejects a missing program_id", () =>
    expect(expectInvalid(validateProgramNarrative({ ...valid, program_id: "" })).join()).toMatch(/program_id/));
});

describe("validateReportCommentary (→ APEX)", () => {
  const valid = {
    report_section: "executive_summary",
    program_id: "PRG-1",
    commentary: "Executive view.",
    anomalies_addressed: ["DOE-NORM-001"],
  };
  it("accepts a valid report section", () => expectValid(validateReportCommentary(valid)));
  it("rejects an unknown report_section", () => {
    const e = expectInvalid(validateReportCommentary({ ...valid, report_section: "appendix" }));
    expect(e.join()).toMatch(/report_section/);
  });
});

describe("validateVVRDescription (→ FLOWPATH frozen fields)", () => {
  const valid = {
    step_id: "STEP-1",
    description: "Operator verifies the invoice.",
    inputs: ["invoice"],
    outputs: ["verification record"],
    decision_required: true,
    human_role: "Operator",
    decision_type: "HUMAN_APPROVAL",
  };
  it("accepts the frozen-field shape", () => expectValid(validateVVRDescription(valid)));
  it("rejects a non-boolean decision_required", () => {
    const e = expectInvalid(validateVVRDescription({ ...valid, decision_required: "yes" }));
    expect(e.join()).toMatch(/decision_required/);
  });
  it("rejects a missing human_role", () =>
    expect(expectInvalid(validateVVRDescription({ ...valid, human_role: "" })).join()).toMatch(/human_role/));
});

describe("validateGovernanceMemo (→ CPMI, decision_type REQUIRED)", () => {
  const valid = {
    subject: "Accept CPMI rec",
    cpmi_reference: "CPMI-REC-12",
    decision: "Accept",
    reasoning: "Aligns with baseline.",
    decision_type: "HUMAN_APPROVAL",
  };
  it("accepts a valid memo", () => expectValid(validateGovernanceMemo(valid)));
  it("rejects a missing (required) decision_type", () => {
    const { decision_type, ...noType } = valid;
    void decision_type;
    const e = expectInvalid(validateGovernanceMemo(noType));
    expect(e.join()).toMatch(/decision_type: required/);
  });
});

describe("validateRuleChangeProposal (→ ARIA)", () => {
  const valid = {
    rule_id: "RULE-9",
    current_rule: "Old text.",
    proposed_rule: "New text.",
    justification: "Reg update.",
    regulatory_source: "FAR 52.244",
    effective_date: "2026-09-01",
  };
  it("accepts a valid proposal", () => expectValid(validateRuleChangeProposal(valid)));
  it("accepts without the optional effective_date", () => {
    const { effective_date, ...noDate } = valid;
    void effective_date;
    expectValid(validateRuleChangeProposal(noDate));
  });
  it("rejects a missing regulatory_source", () =>
    expect(expectInvalid(validateRuleChangeProposal({ ...valid, regulatory_source: "" })).join()).toMatch(/regulatory_source/));
});

describe("validateModeOutput dispatcher", () => {
  it("routes to the correct per-mode validator", () => {
    expectValid(
      validateModeOutput("governance_memo", {
        subject: "s",
        cpmi_reference: "c",
        decision: "d",
        reasoning: "r",
        decision_type: "HUMAN_APPROVAL",
      })
    );
  });
  it("rejects a non-object draft", () => {
    expect(expectInvalid(validateModeOutput("correspondence_draft", null)).join()).toMatch(/non-null object/);
  });
  it("refuses the intermediate modes (no product intake schema)", () => {
    expect(expectInvalid(validateModeOutput("synthesis", {})).join()).toMatch(/synthesis and framing/);
    expect(expectInvalid(validateModeOutput("framing", {})).join()).toMatch(/synthesis and framing/);
  });
});
