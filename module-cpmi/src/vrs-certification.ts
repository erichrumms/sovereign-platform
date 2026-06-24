/**
 * SOVEREIGN Platform — module-cpmi
 * vrs-certification.ts — VRS certificate issuance (pure, no React).
 *
 * The VRS certificate is the governance artifact that authorizes a product build to
 * proceed (spec §4.3). cpmi.vrs-certification issues it ONLY after all four CPMI-VRS
 * gates are complete — Gates 1/2/4 passed and Gate 3 attested by a human. It cannot
 * self-certify and cannot issue a partial certification: if any gate is incomplete the
 * certificate is `certified: false` with no issue timestamp.
 *
 * Version: 1.0 · Session 11 · June 23, 2026
 */

import type { GateRecord, VRSCertificate } from "./cpmi-contract";
import { allGatesComplete } from "./gate-runner";

const CPMI_VRS_CERTIFICATION = "cpmi.vrs-certification";

/**
 * Issue (or decline) a VRS certificate for a product from its gate sequence. Certified
 * only when all four gates are complete; otherwise an honest uncertified record with no
 * issue timestamp (no partial certification).
 */
export function issueCertificate(productId: string, records: readonly GateRecord[], nowIso: string): VRSCertificate {
  const certified = allGatesComplete(records);
  return {
    product_id: productId,
    certified,
    gates: records.map((r) => ({ ...r })),
    issued_by: CPMI_VRS_CERTIFICATION,
    issued_at: certified ? nowIso : null,
  };
}
