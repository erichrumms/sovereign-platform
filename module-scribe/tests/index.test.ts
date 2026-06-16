/**
 * module-scribe — index.test.ts
 * The SovereignModuleContract scaffold: identity matches the loader's pre-wired
 * module-scribe slot, the GD-1/GD-2 agents are declared, the lifecycle methods
 * exist, and healthCheck honestly reports NOT_STARTED (no fabricated gate state).
 */
import { scribeModule } from "../src/index";

describe("scribeModule contract", () => {
  it("declares the canonical module-scribe identity the loader expects", () => {
    expect(scribeModule.moduleId).toBe("module-scribe");
    expect(scribeModule.mountPath).toBe("/scribe");
    expect(scribeModule.mountPath).toMatch(/^\/[a-z][a-z-]*$/); // loader MOUNT_PATH_PATTERN
    expect(scribeModule.displayName).toBe("SCRIBE");
    expect(scribeModule.minimumRole).toBe("READ_ONLY"); // fail-closed placeholder
  });

  it("declares the GD-1/GD-2 SCRIBE agents with valid classes", () => {
    const ids = scribeModule.agentCards.map((c) => c.agent_id);
    expect(ids).toContain("scribe-drafter");
    expect(ids).toContain("scribe-style-analyst");
    for (const card of scribeModule.agentCards) {
      expect(card.product).toBe("SCRIBE");
      expect(["Analytical", "Operational", "Governance", "Monitoring"]).toContain(card.agent_class);
    }
  });

  it("exposes the lifecycle methods the loader requires", () => {
    expect(typeof scribeModule.mount).toBe("function");
    expect(typeof scribeModule.unmount).toBe("function");
    expect(typeof scribeModule.healthCheck).toBe("function");
  });

  it("reports an honest NOT_STARTED health state for the scaffold", async () => {
    await expect(scribeModule.healthCheck()).resolves.toEqual({
      status: "HEALTHY",
      vrs_gate: "NOT_STARTED",
    });
  });
});
