/** @jest-environment jsdom */
/**
 * module-vigil — AlertDetail.test.tsx
 * The scoped Security Framework query is wired into the AnomalyContext: recentEvents
 * and similarAlerts are populated (synthetic/dev) and shown to the operator for review
 * before triage. An injected query overrides the default backing (Constraint #3 seam).
 */
import { render, screen } from "@testing-library/react";

import { AlertDetail } from "../src/AlertDetail";
import type { SecurityObservabilityQuery } from "../src/security-query";
import { makeCtx, makeAlert } from "./test-helpers";

describe("AlertDetail — scoped query wiring", () => {
  it("fills recentEvents and similarAlerts from the default (dev) Security query", () => {
    const alert = makeAlert({ alertId: "A1", alertType: "ANOMALY_DETECTED", sourceProduct: "APEX" });
    render(<AlertDetail ctx={makeCtx()} alert={alert} applyResponse={() => {}} onClose={() => {}} />);

    // AnomalyTriageAssistant reports the counts it received (operator review surface).
    expect(screen.getByText(/Recent events supplied: 3/)).toBeInTheDocument();
    expect(screen.getByText(/Similar prior alerts supplied: 2/)).toBeInTheDocument();
  });

  it("uses an injected Security query (live-implementation seam)", () => {
    const injected: SecurityObservabilityQuery = {
      recentEvents: () => [{ id: "x" }, { id: "y" }],
      similarAlerts: () => [],
    };
    const alert = makeAlert({ alertId: "A2" });
    render(
      <AlertDetail ctx={makeCtx()} alert={alert} applyResponse={() => {}} onClose={() => {}} securityQuery={injected} />
    );

    expect(screen.getByText(/Recent events supplied: 2/)).toBeInTheDocument();
    expect(screen.getByText(/Similar prior alerts supplied: 0/)).toBeInTheDocument();
  });
});
