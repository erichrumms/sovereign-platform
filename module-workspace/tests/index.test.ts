/** @jest-environment jsdom */
/**
 * module-workspace — module contract tests (GD-25, Session 50; updated WH-27, Session 69).
 * The structural mount gate: the union of all section roles is admitted (docs/23 §3,
 * WH-27 adds AGENT_OPERATOR to match the NEXUS/FLOWPATH panels added by WH-19);
 * every other role throws ModuleAccessDeniedError before the tree is built.
 */
import { workspaceModule, WORKSPACE_MINIMUM_ROLES } from "../src/index";
import type { SovereignRole } from "../../sovereign-shell/shell-contract";
import { makeCtx } from "./test-helpers";

const ADMITTED: SovereignRole[] = [
  "PLATFORM_ADMIN",
  "SYSTEM_ADMIN",
  "COMPLIANCE_OFFICER",
  "PROGRAM_MANAGER",
  "ANALYST",
  "AGENT_OPERATOR", // WH-27: NEXUS/FLOWPATH panels both admit AGENT_OPERATOR (WH-19)
];

const DENIED: SovereignRole[] = ["INDEPENDENT_REVIEWER", "READ_ONLY"];

function host(): HTMLElement {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

describe("workspaceModule contract", () => {
  afterEach(() => {
    workspaceModule.unmount();
    document.body.innerHTML = "";
  });

  it("declares the GD-25 module identity and the six-role union gate (docs/23 §3, updated WH-27)", () => {
    expect(workspaceModule.moduleId).toBe("module-workspace");
    expect(workspaceModule.mountPath).toBe("/workspace");
    expect(workspaceModule.displayName).toBe("Reviewer's Workspace");
    expect(workspaceModule.minimumRole).toEqual(WORKSPACE_MINIMUM_ROLES);
    expect(WORKSPACE_MINIMUM_ROLES).toEqual(ADMITTED);
    expect(workspaceModule.agentCards).toEqual([]); // no agents — Constraint #10
  });

  it.each(ADMITTED)("mounts for %s (structural gate admits the section-role union)", (role) => {
    const el = host();
    expect(() => workspaceModule.mount(makeCtx({ role }), el)).not.toThrow();
  });

  it.each(DENIED)("throws ModuleAccessDeniedError for %s (fail-closed)", (role) => {
    const el = host();
    expect(() => workspaceModule.mount(makeCtx({ role }), el)).toThrow(
      /Access to module-workspace denied/
    );
  });

  it("healthCheck reports HEALTHY / NOT_STARTED (Governance Clock OFF)", async () => {
    await expect(workspaceModule.healthCheck()).resolves.toEqual({
      status: "HEALTHY",
      vrs_gate: "NOT_STARTED",
    });
  });
});
