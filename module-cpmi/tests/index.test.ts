/** @jest-environment jsdom */
/**
 * module-cpmi — index.test.ts
 * The SovereignModuleContract: identity matches the loader's pre-wired module-cpmi slot,
 * the fail-closed PLATFORM_ADMIN gate (governance engine), the three registered agent
 * cards (classes + RE_EXECUTE for the reasoning chain), the structural mount gate, and an
 * honest NOT_STARTED health state.
 */
import { cpmiModule } from "../src/index";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { makeCtx } from "./test-helpers";

describe("cpmiModule contract", () => {
  it("declares the canonical module-cpmi identity", () => {
    expect(cpmiModule.moduleId).toBe("module-cpmi");
    expect(cpmiModule.mountPath).toBe("/cpmi");
    expect(cpmiModule.mountPath).toMatch(/^\/[a-z][a-z-]*$/);
    expect(cpmiModule.displayName).toBe("CPMI");
  });

  it("uses the fail-closed PLATFORM_ADMIN gate for the governance engine", () => {
    // GD-22 (v1.17): minimumRole is now SovereignRole[]. CPMI is unchanged — admin-only.
    expect(cpmiModule.minimumRole).toEqual(["PLATFORM_ADMIN", "SYSTEM_ADMIN"]);
  });

  it("registers the three CPMI agents with their classes", () => {
    const ids = cpmiModule.agentCards.map((c) => c.agent_id);
    expect(ids).toEqual(["cpmi.reasoning-chain", "cpmi.world-model-api", "cpmi.vrs-certification"]);
    const byId = Object.fromEntries(cpmiModule.agentCards.map((c) => [c.agent_id, c]));
    expect(byId["cpmi.reasoning-chain"].agent_class).toBe("Governance");
    expect(byId["cpmi.reasoning-chain"].task_lifecycle_contract.approval_behavior).toBe("RE_EXECUTE");
    expect(byId["cpmi.world-model-api"].agent_class).toBe("Operational");
    expect(byId["cpmi.vrs-certification"].agent_class).toBe("Governance");
    expect(cpmiModule.agentCards.every((c) => c.product === "CPMI")).toBe(true);
  });

  it("reports an honest NOT_STARTED health state", async () => {
    await expect(cpmiModule.healthCheck()).resolves.toEqual({ status: "HEALTHY", vrs_gate: "NOT_STARTED" });
  });
});

describe("cpmiModule structural mount gate", () => {
  it.each(["ANALYST", "PROGRAM_MANAGER", "READ_ONLY"] as const)(
    "throws ModuleAccessDeniedError for non-admin role %s",
    (role) => {
      const el = document.createElement("div");
      expect(() => cpmiModule.mount(makeCtx({ role }), el)).toThrow(ModuleAccessDeniedError);
    }
  );

  it.each(["PLATFORM_ADMIN", "SYSTEM_ADMIN"] as const)("admits %s (mounts without throwing)", (role) => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(() => cpmiModule.mount(makeCtx({ role }), el)).not.toThrow();
    cpmiModule.unmount();
  });
});
