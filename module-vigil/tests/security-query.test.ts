/**
 * module-vigil — security-query.test.ts
 * The scoped Security Framework observability query: pure scoping (±30-min window +
 * source product for recentEvents; same type+product, self-excluded, for similarAlerts)
 * and the synthetic/dev backing that applies it. Read-only — emits nothing.
 */
import {
  scopeRecentEvents,
  scopeSimilarAlerts,
  createDevSecurityQuery,
  RECENT_EVENT_WINDOW_MINUTES,
  type ObservabilityEntry,
} from "../src/security-query";
import { makeAlert } from "./test-helpers";

const ALERT = makeAlert({ alertId: "A1", alertType: "ANOMALY_DETECTED", sourceProduct: "APEX", timestamp: "2026-06-18T12:00:00.000Z" });

function shift(min: number): string {
  return new Date(Date.parse(ALERT.timestamp) + min * 60_000).toISOString();
}

describe("scopeRecentEvents", () => {
  const entries: ObservabilityEntry[] = [
    { product: "APEX", timestamp: shift(-20), event: { id: "in-early" } },
    { product: "APEX", timestamp: shift(25), event: { id: "in-late" } },
    { product: "APEX", timestamp: shift(-90), event: { id: "out-of-window" } },
    { product: "CPMI", timestamp: shift(-2), event: { id: "other-product" } },
  ];

  it(`keeps only same-product events within ±${RECENT_EVENT_WINDOW_MINUTES} min`, () => {
    const ids = scopeRecentEvents(entries, ALERT).map((e) => (e as { id: string }).id);
    expect(ids).toEqual(["in-early", "in-late"]);
  });

  it("drops everything when nothing is in window/product", () => {
    expect(scopeRecentEvents([entries[2], entries[3]], ALERT)).toEqual([]);
  });
});

describe("scopeSimilarAlerts", () => {
  it("keeps same type+product, excludes the alert itself and other types", () => {
    const prior = [
      makeAlert({ alertId: "A1", alertType: "ANOMALY_DETECTED", sourceProduct: "APEX" }), // self
      makeAlert({ alertId: "P1", alertType: "ANOMALY_DETECTED", sourceProduct: "APEX" }), // keep
      makeAlert({ alertId: "P2", alertType: "ANOMALY_DETECTED", sourceProduct: "CPMI" }), // other product
      makeAlert({ alertId: "P3", alertType: "THRESHOLD_BREACH", sourceProduct: "APEX" }), // other type
    ];
    expect(scopeSimilarAlerts(prior, ALERT).map((a) => a.alertId)).toEqual(["P1"]);
  });
});

describe("createDevSecurityQuery (synthetic/dev backing)", () => {
  const query = createDevSecurityQuery();

  it("returns scoped in-window same-product synthetic events (decoys dropped)", () => {
    const events = query.recentEvents(ALERT);
    expect(events).toHaveLength(3); // offsets -20, -5, +8; -90 and other-product dropped
    expect(events.every((e) => (e as { synthetic?: boolean }).synthetic === true)).toBe(true);
  });

  it("returns same-type prior alerts only (decoy type dropped, self excluded)", () => {
    const similar = query.similarAlerts(ALERT);
    expect(similar).toHaveLength(2);
    expect(similar.every((a) => a.alertType === "ANOMALY_DETECTED" && a.sourceProduct === "APEX")).toBe(true);
    expect(similar.every((a) => a.alertId !== ALERT.alertId)).toBe(true);
  });
});
