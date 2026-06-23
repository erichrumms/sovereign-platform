/** @jest-environment jsdom */
/**
 * module-lens — index.test.ts
 * The SovereignModuleContract (LENS core): identity matches the loader's pre-wired
 * module-lens slot, the READ_ONLY placeholder gate (COUNSEL/SCRIBE rationale), the
 * two registered agent cards (lens-explainer Analytical — corrected from the scaffold's
 * Operational, lens-orientation Analytical), and an honest NOT_STARTED health state.
 */
import { lensModule } from "../src/index";
import { makeCtx } from "./test-helpers";

describe("lensModule contract", () => {
  it("declares the canonical module-lens identity the loader expects", () => {
    expect(lensModule.moduleId).toBe("module-lens");
    expect(lensModule.mountPath).toBe("/lens");
    expect(lensModule.mountPath).toMatch(/^\/[a-z][a-z-]*$/); // loader MOUNT_PATH_PATTERN
    expect(lensModule.displayName).toBe("LENS");
  });

  it("uses the READ_ONLY placeholder gate (Decision 24), like COUNSEL/SCRIBE", () => {
    expect(lensModule.minimumRole).toBe("READ_ONLY");
  });

  it("registers lens-explainer (Analytical) and lens-orientation (Analytical)", () => {
    expect(lensModule.agentCards.map((c) => c.agent_id)).toEqual(["lens-explainer", "lens-orientation"]);
    const byId = Object.fromEntries(lensModule.agentCards.map((c) => [c.agent_id, c]));
    // Corrected this session from the scaffold's Operational (LENS spec §2.1).
    expect(byId["lens-explainer"].agent_class).toBe("Analytical");
    expect(byId["lens-orientation"].agent_class).toBe("Analytical");
    expect(lensModule.agentCards.every((c) => c.product === "LENS")).toBe(true);
  });

  it("exposes the lifecycle methods the loader requires", () => {
    expect(typeof lensModule.mount).toBe("function");
    expect(typeof lensModule.unmount).toBe("function");
    expect(typeof lensModule.healthCheck).toBe("function");
  });

  it("reports an honest NOT_STARTED health state (Governance Clock not activated)", async () => {
    await expect(lensModule.healthCheck()).resolves.toEqual({
      status: "HEALTHY",
      vrs_gate: "NOT_STARTED",
    });
  });

  it("mounts and unmounts without throwing (no structural role gate, unlike VIGIL)", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(() => lensModule.mount(makeCtx(), el)).not.toThrow();
    expect(() => lensModule.unmount()).not.toThrow();
  });
});
