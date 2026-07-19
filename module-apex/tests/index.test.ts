/** @jest-environment jsdom */
/**
 * module-apex — index.test.ts
 * The SovereignModuleContract: identity matches the loader's pre-wired module-apex slot; the
 * fail-closed PLATFORM_ADMIN gate; the two registered agent cards (classes + UNCLASSIFIED
 * ceiling per GD-10); the structural mount gate; an honest NOT_STARTED health state.
 */
import { apexModule } from "../src/index";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { makeCtx } from "./test-helpers";

describe("apexModule contract", () => {
  it("declares the canonical module-apex identity", () => {
    expect(apexModule.moduleId).toBe("module-apex");
    expect(apexModule.mountPath).toBe("/apex");
    expect(apexModule.mountPath).toMatch(/^\/[a-z][a-z-]*$/);
    expect(apexModule.displayName).toBe("APEX");
  });

  it("uses the GD-22 access matrix (PROGRAM_MANAGER, ANALYST + admins)", () => {
    // GD-22 (v1.17): replaces the single PLATFORM_ADMIN placeholder with the approved list.
    expect(apexModule.minimumRole).toEqual(["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER", "ANALYST"]);
  });

  it("registers the two APEX agents, the three APEX-hosted TT agents (Session 27), and the APEX-hosted PPBE synthesizer (Session 32)", () => {
    const ids = apexModule.agentCards.map((c) => c.agent_id);
    expect(ids).toEqual([
      "apex.ai-assistant",
      "apex.report-generator",
      "tt.time-compliance-engine",
      "tt.pattern-analyst",
      "tt.audit-reporter",
      "ppbe-evidence-synthesizer",
      "ppbe-scenario-analyst",
    ]);
    const byId = Object.fromEntries(apexModule.agentCards.map((c) => [c.agent_id, c]));
    expect(byId["apex.ai-assistant"].agent_class).toBe("Analytical");
    expect(byId["apex.report-generator"].agent_class).toBe("Operational");
    expect(byId["tt.time-compliance-engine"].agent_class).toBe("Governance");
    expect(byId["tt.pattern-analyst"].agent_class).toBe("Monitoring");
    expect(byId["tt.audit-reporter"].agent_class).toBe("Governance");
    expect(byId["ppbe-evidence-synthesizer"].agent_class).toBe("Analytical");
    expect(byId["ppbe-scenario-analyst"].agent_class).toBe("Analytical");
    // TT/PPBE cards carry the HOST product — a workflow layer is not a SovereignProduct.
    expect(apexModule.agentCards.every((c) => c.product === "APEX")).toBe(true);
    expect(apexModule.agentCards.every((c) => c.data_classification_ceiling === "UNCLASSIFIED")).toBe(true);
  });

  it("reports an honest NOT_STARTED health state", async () => {
    await expect(apexModule.healthCheck()).resolves.toEqual({ status: "HEALTHY", vrs_gate: "NOT_STARTED" });
  });
});

describe("apexModule structural mount gate", () => {
  // GD-22: READ_ONLY, AGENT_OPERATOR, COMPLIANCE_OFFICER, INDEPENDENT_REVIEWER are NOT in the APEX list.
  it.each(["READ_ONLY", "AGENT_OPERATOR", "COMPLIANCE_OFFICER", "INDEPENDENT_REVIEWER"] as const)(
    "throws ModuleAccessDeniedError for role %s",
    (role) => {
      const el = document.createElement("div");
      expect(() => apexModule.mount(makeCtx({ role }), el)).toThrow(ModuleAccessDeniedError);
    }
  );

  // GD-22: PROGRAM_MANAGER and ANALYST are now admitted to APEX.
  it.each(["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER", "ANALYST"] as const)(
    "admits %s (mounts without throwing)",
    (role) => {
      const el = document.createElement("div");
      document.body.appendChild(el);
      expect(() => apexModule.mount(makeCtx({ role }), el)).not.toThrow();
      apexModule.unmount();
    }
  );
});
