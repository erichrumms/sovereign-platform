/**
 * module-cpmi — vrs-certification.test.ts
 * The certificate is issued only when all four gates are complete; otherwise an honest
 * uncertified record with no issue timestamp (no partial / self certification).
 */
import { issueCertificate } from "../src/vrs-certification";
import { createGateSequence, passAutoGate, attestGate3 } from "../src/gate-runner";

const NOW = "2026-06-23T12:00:00.000Z";

function completeSequence() {
  let seq = createGateSequence("CPMI");
  seq = passAutoGate(seq, 1, NOW);
  seq = passAutoGate(seq, 2, NOW);
  seq = attestGate3(seq, NOW, "Dana Governance");
  seq = passAutoGate(seq, 4, NOW);
  return seq;
}

describe("issueCertificate", () => {
  it("declines certification while gates are incomplete", () => {
    const cert = issueCertificate("CPMI", createGateSequence("CPMI"), NOW);
    expect(cert.certified).toBe(false);
    expect(cert.issued_at).toBeNull();
    expect(cert.issued_by).toBe("cpmi.vrs-certification");
  });

  it("declines when only Gate 3 is missing", () => {
    let seq = createGateSequence("CPMI");
    seq = passAutoGate(seq, 1, NOW);
    seq = passAutoGate(seq, 2, NOW);
    seq = passAutoGate(seq, 4, NOW);
    expect(issueCertificate("CPMI", seq, NOW).certified).toBe(false);
  });

  it("certifies when all four gates are complete", () => {
    const cert = issueCertificate("CPMI", completeSequence(), NOW);
    expect(cert.certified).toBe(true);
    expect(cert.issued_at).toBe(NOW);
    expect(cert.gates).toHaveLength(4);
  });
});
