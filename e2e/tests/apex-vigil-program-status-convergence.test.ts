/**
 * e2e — apex-vigil-program-status-convergence.test.ts (Session 44, D4).
 *
 * THE FULL LOOP for the GD-23 ProgramStatusSurface: APEX publishes program
 * obligation status to ctx.programStatusSurface; VIGIL reads it in the
 * ppbe_obligation approval brief. One shared SovereignShellContext — exactly
 * as the shell wires it. No mocks past the point that matters.
 *
 * Resolves WF-20: the ppbe_obligation brief now includes current program
 * financial context for the approving operator, sourced from APEX's own
 * obligation-rate computation.
 *
 * Mirrors Session 35's VIGIL→SCRIBE convergence test style (tt-vigil-scribe-
 * convergence.test.tsx): makeCtx() once, real functions from both modules.
 */

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { makeCtx } from "./harness";

import { publishProgramStatuses, statusFromObligationRate } from "../../module-apex/src/ppbe-dashboard";
import { createSyntheticPPBEDashboardInputs } from "../../module-apex/src/ppbe-data-adapter";
import { staticBrief } from "../../module-vigil/src/approval-engine";
import { computeExpiresAt, approvalWorkflowStep } from "../../module-vigil/src/approval-contract";
import type { AgentApprovalRequest } from "../../module-vigil/src/approval-contract";

const NOW_ISO = "2026-07-19T10:00:00.000Z";

function makePPBEObligationRequest(programId: string): AgentApprovalRequest {
  const ANCHOR = NOW_ISO;
  return {
    request_id: `req-ppbe-conv-${programId}`,
    requesting_agent_id: "apex.obligation-recorder",
    requesting_agent_class: "Operational",
    action_type: "ppbe_obligation",
    action_detail: { program_id: programId, amount: 250_000, cost_code: "CC-4421", obligation_id: "OBL-0042" },
    risk_classification: "P2",
    submitted_at: ANCHOR,
    expires_at: computeExpiresAt(ANCHOR, "P2"),
    workflow_step_id: approvalWorkflowStep(`req-ppbe-conv-${programId}`),
  };
}

describe("APEX → VIGIL convergence via programStatusSurface (GD-23, WF-20 resolution)", () => {
  it("a ppbe_obligation static brief includes the program narrative after APEX publishes", () => {
    const logged: SovereignLogEvent[] = [];
    const ctx = makeCtx(logged); // ONE ctx shared by both modules — as the shell wires it.

    // APEX side: publish program statuses from the canonical synthetic PPBE inputs.
    const ppbeInputs = createSyntheticPPBEDashboardInputs();
    publishProgramStatuses(ppbeInputs, ctx.programStatusSurface, NOW_ISO);

    // Confirm at least one program was published.
    const published = ctx.programStatusSurface.list();
    expect(published.length).toBeGreaterThan(0);

    // VIGIL side: build a ppbe_obligation request for the first published program.
    const snapshot = published[0];
    const request = makePPBEObligationRequest(snapshot.program_id);

    // The static brief now includes the program narrative (WF-20 fix).
    const brief = staticBrief(request, ctx.programStatusSurface);
    expect(brief).toMatch(/WHAT CHANGES:/);
    expect(brief).toContain(snapshot.narrative);
    expect(brief).toMatch(/Current program status:/);
  });

  it("all published programs carry structurally valid snapshots", () => {
    const ctx = makeCtx([]);
    const ppbeInputs = createSyntheticPPBEDashboardInputs();
    publishProgramStatuses(ppbeInputs, ctx.programStatusSurface, NOW_ISO);

    for (const snap of ctx.programStatusSurface.list()) {
      expect(typeof snap.program_id).toBe("string");
      expect(snap.program_id.length).toBeGreaterThan(0);
      expect(typeof snap.percent_obligated).toBe("number");
      expect(["on_track", "at_risk", "off_track"]).toContain(snap.status);
      expect(typeof snap.narrative).toBe("string");
      expect(snap.narrative.length).toBeGreaterThan(0);
      expect(snap.updated_at).toBe(NOW_ISO);
    }
  });

  it("a brief without a published snapshot omits program context but remains structurally valid", () => {
    const ctx = makeCtx([]);
    // Nothing published — surface is empty.

    const request = makePPBEObligationRequest("PROG-UNKNOWN-999");
    const brief = staticBrief(request, ctx.programStatusSurface);

    expect(brief).toMatch(/REQUESTED ACTION:/);
    expect(brief).toMatch(/WHAT CHANGES:/);
    expect(brief).not.toMatch(/Current program status:/);
  });

  it("a brief passed no surface behaves identically to before GD-23 (backward-compat)", () => {
    const request = makePPBEObligationRequest("PROG-001");
    const brief = staticBrief(request); // no surface — old call-site style
    expect(brief).toMatch(/REQUESTED ACTION:/);
    expect(brief).not.toMatch(/Current program status:/);
  });

  it("subscribe fires when APEX publishes and VIGIL can immediately read the new snapshot", () => {
    const ctx = makeCtx([]);
    const received: string[] = [];

    ctx.programStatusSurface.subscribe((statuses) => {
      received.push(...statuses.map((s) => s.program_id));
    });

    const ppbeInputs = createSyntheticPPBEDashboardInputs();
    publishProgramStatuses(ppbeInputs, ctx.programStatusSurface, NOW_ISO);

    // Subscriber saw each published program_id.
    expect(received.length).toBeGreaterThan(0);

    // Each published id is immediately retrievable via get().
    for (const programId of received) {
      expect(ctx.programStatusSurface.get(programId)).toBeDefined();
    }
  });
});

describe("statusFromObligationRate thresholds", () => {
  it("≥80 is on_track", () => {
    expect(statusFromObligationRate(80)).toBe("on_track");
    expect(statusFromObligationRate(100)).toBe("on_track");
  });
  it("50–79 is at_risk", () => {
    expect(statusFromObligationRate(50)).toBe("at_risk");
    expect(statusFromObligationRate(79)).toBe("at_risk");
  });
  it("<50 is off_track", () => {
    expect(statusFromObligationRate(49)).toBe("off_track");
    expect(statusFromObligationRate(0)).toBe("off_track");
  });
  it("null (no plan recorded) is off_track", () => {
    expect(statusFromObligationRate(null)).toBe("off_track");
  });
});
