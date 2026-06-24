/**
 * module-cpmi — gate-checks.test.ts
 * Gate 1 / Gate 2 precondition checklists are complete and satisfied (facts on record),
 * so the auto gates may record.
 */
import { gate1Checks, gate2Checks, gate1Ready, gate2Ready } from "../src/gate-checks";

describe("gate checks", () => {
  it("Gate 1 lists the scope/boundary preconditions, all satisfied", () => {
    expect(gate1Checks().length).toBeGreaterThanOrEqual(4);
    expect(gate1Checks().every((c) => c.satisfied)).toBe(true);
    expect(gate1Ready()).toBe(true);
  });

  it("Gate 2 lists the transparency preconditions, all satisfied", () => {
    expect(gate2Checks().length).toBeGreaterThanOrEqual(4);
    expect(gate2Checks().every((c) => c.satisfied)).toBe(true);
    expect(gate2Ready()).toBe(true);
  });
});
