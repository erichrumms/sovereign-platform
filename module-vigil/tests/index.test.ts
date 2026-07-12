/** @jest-environment jsdom */
/**
 * module-vigil — index.test.ts
 * The SovereignModuleContract scaffold: identity matches the loader's pre-wired
 * module-vigil slot, the real PLATFORM_ADMIN role gate, the three registered agent
 * cards (triage, approval, and the Session 27 tt.escalation-monitor), and the
 * structural mount gate throws the
 * canonical ModuleAccessDeniedError for non-admin roles while admitting
 * PLATFORM_ADMIN / SYSTEM_ADMIN.
 */
import { vigilModule } from "../src/index";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { makeCtx } from "./test-helpers";

describe("vigilModule contract", () => {
  it("declares the canonical module-vigil identity the loader expects", () => {
    expect(vigilModule.moduleId).toBe("module-vigil");
    expect(vigilModule.mountPath).toBe("/vigil");
    expect(vigilModule.mountPath).toMatch(/^\/[a-z][a-z-]*$/); // loader MOUNT_PATH_PATTERN
    expect(vigilModule.displayName).toBe("VIGIL");
  });

  it("declares the real VIGIL role gate (PLATFORM_ADMIN), not a placeholder", () => {
    expect(vigilModule.minimumRole).toBe("PLATFORM_ADMIN");
  });

  it("registers vigil-triage-analyst, vigil-approval-agent, and tt.escalation-monitor (all Monitoring)", () => {
    const ids = vigilModule.agentCards.map((c) => c.agent_id);
    expect(ids).toEqual(["vigil-triage-analyst", "vigil-approval-agent", "tt.escalation-monitor"]);
    const byId = Object.fromEntries(vigilModule.agentCards.map((c) => [c.agent_id, c]));
    expect(byId["vigil-triage-analyst"].agent_class).toBe("Monitoring");
    // Activated this session (Session 10 — Agent Approval Flow).
    expect(byId["vigil-approval-agent"].agent_class).toBe("Monitoring");
    // Session 27 — Time & Travel workflow layer, hosted on VIGIL infrastructure.
    expect(byId["tt.escalation-monitor"].agent_class).toBe("Monitoring");
    expect(vigilModule.agentCards.every((c) => c.product === "VIGIL")).toBe(true);
  });

  it("exposes the lifecycle methods the loader requires", () => {
    expect(typeof vigilModule.mount).toBe("function");
    expect(typeof vigilModule.unmount).toBe("function");
    expect(typeof vigilModule.healthCheck).toBe("function");
  });

  it("reports an honest NOT_STARTED health state for the scaffold", async () => {
    await expect(vigilModule.healthCheck()).resolves.toEqual({
      status: "HEALTHY",
      vrs_gate: "NOT_STARTED",
    });
  });
});

describe("vigilModule structural mount gate (spec §7)", () => {
  function mountWith(role: Parameters<typeof makeCtx>[0]["role"]): () => void {
    const el = document.createElement("div");
    document.body.appendChild(el);
    return () => vigilModule.mount(makeCtx({ role }), el);
  }

  it.each(["ANALYST", "PROGRAM_MANAGER", "READ_ONLY", "AGENT_OPERATOR"] as const)(
    "throws ModuleAccessDeniedError for non-admin role %s",
    (role) => {
      expect(mountWith(role)).toThrow(ModuleAccessDeniedError);
    }
  );

  it("carries the moduleId, user role, and minimumRole on the error", () => {
    const el = document.createElement("div");
    try {
      vigilModule.mount(makeCtx({ role: "ANALYST" }), el);
      throw new Error("expected mount to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ModuleAccessDeniedError);
      const err = e as ModuleAccessDeniedError;
      expect(err.moduleId).toBe("module-vigil");
      expect(err.userRole).toBe("ANALYST");
      expect(err.minimumRole).toBe("PLATFORM_ADMIN");
    }
  });

  it.each(["PLATFORM_ADMIN", "SYSTEM_ADMIN"] as const)("admits %s (mounts without throwing)", (role) => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(() => vigilModule.mount(makeCtx({ role }), el)).not.toThrow();
    vigilModule.unmount();
  });
});
