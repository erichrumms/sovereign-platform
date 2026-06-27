/** @jest-environment jsdom */
/**
 * module-flowpath — index.test.ts
 * The SovereignModuleContract: identity matches the loader's pre-wired module-flowpath slot; the
 * fail-closed AGENT_OPERATOR gate; the six registered agent cards (all Analytical, FLOWPATH,
 * UNCLASSIFIED ceiling per GD-10); the structural mount gate; an honest NOT_STARTED health state.
 */
import { flowpathModule } from "../src/index";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { makeCtx } from "./test-helpers";

describe("flowpathModule contract", () => {
  it("declares the canonical module-flowpath identity", () => {
    expect(flowpathModule.moduleId).toBe("module-flowpath");
    expect(flowpathModule.mountPath).toBe("/flowpath");
    expect(flowpathModule.mountPath).toMatch(/^\/[a-z][a-z-]*$/);
    expect(flowpathModule.displayName).toBe("FLOWPATH");
  });

  it("uses the fail-closed AGENT_OPERATOR gate", () => {
    expect(flowpathModule.minimumRole).toBe("AGENT_OPERATOR");
  });

  it("registers the six FLOWPATH agents (all Analytical, FLOWPATH, UNCLASSIFIED ceiling)", () => {
    const ids = flowpathModule.agentCards.map((c) => c.agent_id);
    expect(ids).toEqual([
      "flowpath.coordinator",
      "flowpath.interviewer",
      "flowpath.mapper",
      "flowpath.validator",
      "flowpath.analyzer",
      "flowpath.domain-translator",
    ]);
    expect(flowpathModule.agentCards.every((c) => c.agent_class === "Analytical")).toBe(true);
    expect(flowpathModule.agentCards.every((c) => c.product === "FLOWPATH")).toBe(true);
    expect(flowpathModule.agentCards.every((c) => c.data_classification_ceiling === "UNCLASSIFIED")).toBe(true);
  });

  it("reports an honest NOT_STARTED health state", async () => {
    await expect(flowpathModule.healthCheck()).resolves.toEqual({ status: "HEALTHY", vrs_gate: "NOT_STARTED" });
  });
});

describe("flowpathModule structural mount gate", () => {
  it.each(["READ_ONLY", "ANALYST", "COMPLIANCE_OFFICER", "PROGRAM_MANAGER"] as const)(
    "throws ModuleAccessDeniedError for non-operator role %s",
    (role) => {
      const el = document.createElement("div");
      expect(() => flowpathModule.mount(makeCtx({ role }), el)).toThrow(ModuleAccessDeniedError);
    }
  );

  it.each(["AGENT_OPERATOR", "SYSTEM_ADMIN"] as const)("admits %s (mounts without throwing)", (role) => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(() => flowpathModule.mount(makeCtx({ role }), el)).not.toThrow();
    flowpathModule.unmount();
  });
});
