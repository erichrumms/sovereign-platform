/** @jest-environment jsdom */
/**
 * module-nexus — index.test.ts
 * The SovereignModuleContract: identity matches the loader's pre-wired module-nexus slot,
 * the fail-closed AGENT_OPERATOR gate (nearest existing role; no OPERATOR in the taxonomy),
 * the two NEXUS-hosted Time & Travel agent cards (Session 27 — docs/17 §2, no new module
 * directory), the structural mount gate, and an honest NOT_STARTED health state.
 */
import { nexusModule } from "../src/index";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { makeCtx } from "./test-helpers";

describe("nexusModule contract", () => {
  it("declares the canonical module-nexus identity", () => {
    expect(nexusModule.moduleId).toBe("module-nexus");
    expect(nexusModule.mountPath).toBe("/nexus");
    expect(nexusModule.mountPath).toMatch(/^\/[a-z][a-z-]*$/);
    expect(nexusModule.displayName).toBe("NEXUS");
  });

  it("uses the GD-22 access matrix (AGENT_OPERATOR, PROGRAM_MANAGER, COMPLIANCE_OFFICER + admins)", () => {
    // GD-22 (v1.17): replaces the single AGENT_OPERATOR placeholder with the approved list.
    expect(nexusModule.minimumRole).toEqual([
      "PLATFORM_ADMIN", "SYSTEM_ADMIN", "AGENT_OPERATOR", "PROGRAM_MANAGER", "COMPLIANCE_OFFICER",
    ]);
  });

  it("registers the two NEXUS-hosted TT agents (Session 27) and the PPBE coordination assistant (Session 32)", () => {
    const ids = nexusModule.agentCards.map((c) => c.agent_id);
    expect(ids).toEqual(["tt.travel-compliance-engine", "tt.travel-router", "ppbe-coordination-assistant"]);
    const byId = Object.fromEntries(nexusModule.agentCards.map((c) => [c.agent_id, c]));
    expect(byId["tt.travel-compliance-engine"].agent_class).toBe("Governance");
    expect(byId["tt.travel-router"].agent_class).toBe("Operational");
    expect(byId["ppbe-coordination-assistant"].agent_class).toBe("Operational");
    // The workflow layer is not a SovereignProduct — cards carry the HOST product.
    expect(nexusModule.agentCards.every((c) => c.product === "NEXUS")).toBe(true);
    expect(nexusModule.agentCards.every((c) => c.data_classification_ceiling === "UNCLASSIFIED")).toBe(true);
  });

  it("reports an honest NOT_STARTED health state", async () => {
    await expect(nexusModule.healthCheck()).resolves.toEqual({ status: "HEALTHY", vrs_gate: "NOT_STARTED" });
  });
});

describe("nexusModule structural mount gate", () => {
  // GD-22: ANALYST, READ_ONLY, INDEPENDENT_REVIEWER are NOT in the NEXUS role list.
  it.each(["ANALYST", "READ_ONLY", "INDEPENDENT_REVIEWER"] as const)(
    "throws ModuleAccessDeniedError for role %s",
    (role) => {
      const el = document.createElement("div");
      expect(() => nexusModule.mount(makeCtx({ role }), el)).toThrow(ModuleAccessDeniedError);
    }
  );

  // GD-22: PROGRAM_MANAGER and COMPLIANCE_OFFICER are now admitted to NEXUS.
  it.each(["PLATFORM_ADMIN", "SYSTEM_ADMIN", "AGENT_OPERATOR", "PROGRAM_MANAGER", "COMPLIANCE_OFFICER"] as const)(
    "admits %s (mounts without throwing)",
    (role) => {
      const el = document.createElement("div");
      document.body.appendChild(el);
      expect(() => nexusModule.mount(makeCtx({ role }), el)).not.toThrow();
      nexusModule.unmount();
    }
  );
});
