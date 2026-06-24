/**
 * module-cpmi — gate-runner.test.ts
 * The pure CPMI-VRS gate sequence: fresh sequence is all PENDING; auto gates pass;
 * Gate 3 is attested (not auto); completion requires Gates 1/2/4 PASSED + Gate 3 ATTESTED.
 */
import {
  createGateSequence,
  passAutoGate,
  attestGate3,
  allGatesComplete,
  getGate,
} from "../src/gate-runner";

const NOW = "2026-06-23T12:00:00.000Z";

describe("gate-runner", () => {
  it("creates a fresh four-gate sequence, all PENDING", () => {
    const seq = createGateSequence("CPMI");
    expect(seq.map((g) => g.gate)).toEqual([1, 2, 3, 4]);
    expect(seq.every((g) => g.status === "PENDING" && g.recorded_at === null)).toBe(true);
  });

  it("passes auto gates and records the timestamp", () => {
    let seq = createGateSequence("CPMI");
    seq = passAutoGate(seq, 1, NOW);
    expect(getGate(seq, 1)!.status).toBe("PASSED");
    expect(getGate(seq, 1)!.recorded_at).toBe(NOW);
  });

  it("attests Gate 3 with the human's name", () => {
    const seq = attestGate3(createGateSequence("CPMI"), NOW, "Dana Governance");
    expect(getGate(seq, 3)!.status).toBe("ATTESTED");
    expect(getGate(seq, 3)!.attested_by).toBe("Dana Governance");
  });

  it("is complete only when 1/2/4 PASSED and 3 ATTESTED", () => {
    let seq = createGateSequence("CPMI");
    expect(allGatesComplete(seq)).toBe(false);
    seq = passAutoGate(seq, 1, NOW);
    seq = passAutoGate(seq, 2, NOW);
    seq = passAutoGate(seq, 4, NOW);
    expect(allGatesComplete(seq)).toBe(false); // Gate 3 not attested
    seq = attestGate3(seq, NOW, "Dana Governance");
    expect(allGatesComplete(seq)).toBe(true);
  });
});
