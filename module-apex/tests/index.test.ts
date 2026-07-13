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

  it("uses the fail-closed PLATFORM_ADMIN gate", () => {
    expect(apexModule.minimumRole).toBe("PLATFORM_ADMIN");
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
  it.each(["ANALYST", "PROGRAM_MANAGER", "READ_ONLY", "AGENT_OPERATOR"] as const)(
    "throws ModuleAccessDeniedError for non-admin role %s",
    (role) => {
      const el = document.createElement("div");
      expect(() => apexModule.mount(makeCtx({ role }), el)).toThrow(ModuleAccessDeniedError);
    }
  );

  it.each(["PLATFORM_ADMIN", "SYSTEM_ADMIN"] as const)("admits %s (mounts without throwing)", (role) => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(() => apexModule.mount(makeCtx({ role }), el)).not.toThrow();
    apexModule.unmount();
  });
});
