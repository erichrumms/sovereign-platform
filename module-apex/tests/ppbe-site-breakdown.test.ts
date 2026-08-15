/**
 * module-apex — ppbe-site-breakdown.test.ts
 * Obligation-status thresholds for the synthetic per-site breakdown (D2, Session 113).
 *
 * The site status must not report an OVER-obligated site (obligated beyond its plan,
 * i.e. > 100%) as "on_track". SYNTH-SITE-A3 (Tobyhanna / SYNTH-PRG-ALPHA) is seeded at
 * 135000 obligated against 100000 planned (135%); before the D2 fix `siteStatus` had only
 * a lower bound (>= 80% -> on_track) and reported it green. See the Session 113 handoff.
 */
import { SYNTH_SITE_BREAKDOWNS } from "../src/ppbe-site-breakdown";

describe("ppbe-site-breakdown obligation status thresholds (D2, Session 113)", () => {
  it("flags the deliberately over-obligated 135% site (A3) as at_risk, not on_track", () => {
    const a3 = SYNTH_SITE_BREAKDOWNS.find((s) => s.site_id === "SYNTH-SITE-A3")!;
    expect(a3).toBeDefined();
    expect(Math.round((a3.obligations_to_date / a3.planned_amount) * 100)).toBe(135);
    // Over-obligation (> 100% of plan) is not "on track". This assertion fails before the fix.
    expect(a3.status).not.toBe("on_track");
    expect(a3.status).toBe("at_risk");
  });

  it("flags every over-obligated site (> 100% of plan) as at_risk", () => {
    const over = SYNTH_SITE_BREAKDOWNS.filter(
      (s) => s.planned_amount > 0 && s.obligations_to_date / s.planned_amount > 1
    );
    expect(over.length).toBeGreaterThan(0);
    for (const s of over) expect(s.status).toBe("at_risk");
  });

  it("still reports a site obligating 80–100% of plan as on_track (regression guard)", () => {
    const onTrack = SYNTH_SITE_BREAKDOWNS.filter((s) => {
      if (s.planned_amount <= 0) return false;
      const r = s.obligations_to_date / s.planned_amount;
      return r >= 0.8 && r <= 1;
    });
    expect(onTrack.length).toBeGreaterThan(0);
    for (const s of onTrack) expect(s.status).toBe("on_track");
  });
});
