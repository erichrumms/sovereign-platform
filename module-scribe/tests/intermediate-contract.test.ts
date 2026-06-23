/**
 * module-scribe — intermediate-contract.test.ts
 * The intermediate-mode contract: identifies synthesis/framing (and only those),
 * binds to the approved PR-SCRIBE-001, and exposes a non-empty prose guard that is NOT
 * product-schema validation.
 */
import {
  INTERMEDIATE_MODES,
  isIntermediateMode,
  hasUsableProse,
  PR_SCRIBE_001_INTERMEDIATE,
  INTERMEDIATE_MODE_PURPOSE,
} from "../src/intermediate-contract";

describe("intermediate-contract", () => {
  it("identifies exactly synthesis and framing as intermediate", () => {
    expect([...INTERMEDIATE_MODES]).toEqual(["synthesis", "framing"]);
    expect(isIntermediateMode("synthesis")).toBe(true);
    expect(isIntermediateMode("framing")).toBe(true);
  });

  it("does not treat product-intake modes as intermediate", () => {
    expect(isIntermediateMode("correspondence_draft")).toBe(false);
    expect(isIntermediateMode("governance_memo")).toBe(false);
  });

  it("binds to the already-approved PR-SCRIBE-001 (no new prompt this session)", () => {
    expect(PR_SCRIBE_001_INTERMEDIATE.registryId).toBe("PR-SCRIBE-001");
    expect(PR_SCRIBE_001_INTERMEDIATE.promptVersion).toBe("v1.0");
  });

  it("describes each intermediate mode's purpose", () => {
    expect(INTERMEDIATE_MODE_PURPOSE.synthesis).toMatch(/synthesize/i);
    expect(INTERMEDIATE_MODE_PURPOSE.framing).toMatch(/FLOWPATH/);
  });

  it("hasUsableProse accepts non-empty strings and rejects empty/non-strings", () => {
    expect(hasUsableProse("prose")).toBe(true);
    expect(hasUsableProse("   ")).toBe(false);
    expect(hasUsableProse(123)).toBe(false);
    expect(hasUsableProse(null)).toBe(false);
  });
});
