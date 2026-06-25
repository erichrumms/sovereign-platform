/** @jest-environment jsdom */
/**
 * module-agentos — index.test.ts
 * The SovereignModuleContract: identity matches the loader's pre-wired module-agentos slot,
 * the fail-closed PLATFORM_ADMIN gate (orchestration backbone), empty agentCards (no
 * self-registered agents — Constraint #10), the structural mount gate, and an honest
 * NOT_STARTED health state.
 */
import { agentosModule } from "../src/index";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { makeCtx } from "./test-helpers";

describe("agentosModule contract", () => {
  it("declares the canonical module-agentos identity", () => {
    expect(agentosModule.moduleId).toBe("module-agentos");
    expect(agentosModule.mountPath).toBe("/agentos");
    expect(agentosModule.mountPath).toMatch(/^\/[a-z][a-z-]*$/);
    expect(agentosModule.displayName).toBe("AgentOS");
  });

  it("uses the fail-closed PLATFORM_ADMIN gate for the orchestration backbone", () => {
    expect(agentosModule.minimumRole).toBe("PLATFORM_ADMIN");
  });

  it("registers the three AgentOS orchestrator agents (D2; Orchestration class, GD-12)", () => {
    const ids = agentosModule.agentCards.map((c) => c.agent_id);
    expect(ids).toEqual(["agentos.deployer", "agentos.exporter", "agentos.configurator"]);
    expect(agentosModule.agentCards.every((c) => c.agent_class === "Orchestration")).toBe(true);
    expect(agentosModule.agentCards.every((c) => c.product === "AGENTOS")).toBe(true);
    expect(agentosModule.agentCards.every((c) => c.data_classification_ceiling === "UNCLASSIFIED")).toBe(true);
    expect(agentosModule.agentCards.every((c) => c.task_lifecycle_contract.approval_behavior === "ACKNOWLEDGE_AND_CONTINUE")).toBe(true);
  });

  it("reports an honest NOT_STARTED health state", async () => {
    await expect(agentosModule.healthCheck()).resolves.toEqual({ status: "HEALTHY", vrs_gate: "NOT_STARTED" });
  });
});

describe("agentosModule structural mount gate", () => {
  it.each(["ANALYST", "PROGRAM_MANAGER", "READ_ONLY"] as const)(
    "throws ModuleAccessDeniedError for non-admin role %s",
    (role) => {
      const el = document.createElement("div");
      expect(() => agentosModule.mount(makeCtx({ role }), el)).toThrow(ModuleAccessDeniedError);
    }
  );

  it.each(["PLATFORM_ADMIN", "SYSTEM_ADMIN"] as const)("admits %s (mounts without throwing)", (role) => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(() => agentosModule.mount(makeCtx({ role }), el)).not.toThrow();
    agentosModule.unmount();
  });
});
