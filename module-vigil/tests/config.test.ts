/**
 * module-vigil — config.test.ts
 * VIGIL_ALERT_ENDPOINT is now sourced from platform config (Session 9). Under test the
 * vigil-endpoint reader is mapped to a stub returning null, so the default posture is
 * the unconfigured (graceful-degradation) path. Activation when an endpoint IS supplied
 * is covered by useAlertQueue.test.tsx (opts.endpoint → configured=true).
 */
import { VIGIL_ALERT_ENDPOINT } from "../src/config";
import { readAlertEndpoint } from "../src/vigil-endpoint";

describe("VIGIL alert endpoint config sourcing", () => {
  it("reads from the platform-config binding (null by default under test)", () => {
    expect(readAlertEndpoint()).toBeNull();
  });

  it("config exposes the sourced endpoint (null default → degradation path preserved)", () => {
    expect(VIGIL_ALERT_ENDPOINT).toBeNull();
  });
});
