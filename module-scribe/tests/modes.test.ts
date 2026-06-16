/**
 * module-scribe — modes.test.ts
 * The drafting-mode catalog: it covers exactly the eight SCRIBEModes, binds each
 * product-intake mode to a target product, and marks the two intermediate modes.
 */
import { SCRIBE_MODES, describeMode } from "../src/modes";

const EXPECTED_MODES = [
  "correspondence_draft",
  "program_narrative",
  "report_commentary",
  "vvr_description",
  "governance_memo",
  "rule_change_proposal",
  "synthesis",
  "framing",
];

describe("SCRIBE_MODES catalog", () => {
  it("covers exactly the eight SCRIBEModes, with unique entries", () => {
    const modes = SCRIBE_MODES.map((m) => m.mode);
    expect(new Set(modes).size).toBe(SCRIBE_MODES.length);
    expect([...modes].sort()).toEqual([...EXPECTED_MODES].sort());
  });

  it("binds every product-intake mode to a target product", () => {
    for (const m of SCRIBE_MODES) {
      if (m.producesProductIntake) {
        expect(m.targetProduct).not.toBeNull();
      } else {
        expect(m.targetProduct).toBeNull();
      }
    }
  });

  it("marks synthesis and framing as intermediate (no product intake)", () => {
    expect(describeMode("synthesis").producesProductIntake).toBe(false);
    expect(describeMode("framing").producesProductIntake).toBe(false);
  });

  it("routes the six drafting modes to their documented destinations", () => {
    expect(describeMode("correspondence_draft").targetProduct).toBe("NEXUS");
    expect(describeMode("report_commentary").targetProduct).toBe("APEX");
    expect(describeMode("vvr_description").targetProduct).toBe("FLOWPATH");
    expect(describeMode("governance_memo").targetProduct).toBe("CPMI");
    expect(describeMode("rule_change_proposal").targetProduct).toBe("ARIA");
  });
});
