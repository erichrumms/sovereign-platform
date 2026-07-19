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

  it("uses the GD-22 access matrix (AGENT_OPERATOR, ANALYST, PROGRAM_MANAGER + admins)", () => {
    // GD-22 (v1.17): replaces the single AGENT_OPERATOR placeholder with the approved list.
    expect(flowpathModule.minimumRole).toEqual([
      "PLATFORM_ADMIN", "SYSTEM_ADMIN", "AGENT_OPERATOR", "ANALYST", "PROGRAM_MANAGER",
    ]);
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
  // GD-22: READ_ONLY, COMPLIANCE_OFFICER, INDEPENDENT_REVIEWER are NOT in the FLOWPATH list.
  it.each(["READ_ONLY", "COMPLIANCE_OFFICER", "INDEPENDENT_REVIEWER"] as const)(
    "throws ModuleAccessDeniedError for role %s",
    (role) => {
      const el = document.createElement("div");
      expect(() => flowpathModule.mount(makeCtx({ role }), el)).toThrow(ModuleAccessDeniedError);
    }
  );

  // GD-22: ANALYST and PROGRAM_MANAGER are now admitted to FLOWPATH.
  it.each(["PLATFORM_ADMIN", "SYSTEM_ADMIN", "AGENT_OPERATOR", "ANALYST", "PROGRAM_MANAGER"] as const)(
    "admits %s (mounts without throwing)",
    (role) => {
      const el = document.createElement("div");
      document.body.appendChild(el);
      expect(() => flowpathModule.mount(makeCtx({ role }), el)).not.toThrow();
      flowpathModule.unmount();
    }
  );
});
