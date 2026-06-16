/**
 * module-counsel — prior-position.test.ts
 * Synthetic provider scoping + the PRIOR_POSITION_RECONCILIATION payload rule
 * (acknowledged ⇒ note present; dismissed ⇒ note absent). Node env, no React.
 */

import {
  syntheticPriorPositionProvider,
  buildReconciliationPayload,
} from "../src/prior-position";

describe("syntheticPriorPositionProvider", () => {
  it("returns prior records matching the decision type", async () => {
    const approval = await syntheticPriorPositionProvider.findConflicts({
      userId: "u1",
      decisionType: "HUMAN_APPROVAL",
      workflowStepId: "NEXUS-APPROVE-v1-step-3",
    });
    expect(approval).toHaveLength(1);
    expect(approval[0].recordId).toBe("DR-2026-0042");
    expect(approval[0].decisionType).toBe("HUMAN_APPROVAL");
  });

  it("returns no records when none match the decision type", async () => {
    const overrides = await syntheticPriorPositionProvider.findConflicts({
      userId: "u1",
      decisionType: "HUMAN_OVERRIDE",
      workflowStepId: "x",
    });
    expect(overrides).toEqual([]);
  });
});

describe("buildReconciliationPayload", () => {
  const base = {
    currentDecisionId: "counsel-dr-1",
    conflictingRecordIds: ["DR-2026-0042"],
    decisionType: "HUMAN_APPROVAL" as const,
  };

  it("acknowledged with a note → ok, reconciliation_note present (trimmed)", () => {
    const r = buildReconciliationPayload({ ...base, resolution: "acknowledged", note: "  differs because X  " });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.payload.reconciliation_note).toBe("differs because X");
    expect(r.payload.resolution).toBe("acknowledged");
    expect(r.payload.decision_type).toBe("HUMAN_APPROVAL");
    expect(r.payload.conflicting_record_ids).toEqual(["DR-2026-0042"]);
    expect(r.payload.current_decision_id).toBe("counsel-dr-1");
  });

  it("acknowledged without a note → error", () => {
    const r = buildReconciliationPayload({ ...base, resolution: "acknowledged" });
    expect(r.ok).toBe(false);
  });

  it("acknowledged with a whitespace-only note → error", () => {
    const r = buildReconciliationPayload({ ...base, resolution: "acknowledged", note: "   " });
    expect(r.ok).toBe(false);
  });

  it("dismissed → ok and reconciliation_note key is ABSENT (not just undefined)", () => {
    const r = buildReconciliationPayload({ ...base, resolution: "dismissed" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect("reconciliation_note" in r.payload).toBe(false);
    expect(r.payload.resolution).toBe("dismissed");
  });

  it("dismissed ignores any supplied note (key stays absent)", () => {
    const r = buildReconciliationPayload({ ...base, resolution: "dismissed", note: "should be ignored" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect("reconciliation_note" in r.payload).toBe(false);
  });
});
