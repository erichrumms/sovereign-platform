/** @jest-environment jsdom */
/**
 * module-aria — index.test.ts (D4 scaffold)
 * The SovereignModuleContract: identity, PLATFORM_ADMIN role gate (fail-closed structural mount
 * gate), the single registered aria.rules-engine AgentCard (Governance, deterministic), and the
 * mount / unmount / healthCheck lifecycle.
 */
import { act } from "@testing-library/react";

import { ariaModule } from "../src/index";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { makeCtx } from "./test-helpers";

describe("ariaModule — module contract", () => {
  it("declares the ARIA Suite identity and PLATFORM_ADMIN minimum role", () => {
    expect(ariaModule.moduleId).toBe("module-aria");
    expect(ariaModule.mountPath).toBe("/aria");
    expect(ariaModule.displayName).toBe("ARIA Suite");
    expect(ariaModule.minimumRole).toBe("PLATFORM_ADMIN");
  });

  it("registers exactly the aria.rules-engine AgentCard (Governance, deterministic)", () => {
    expect(ariaModule.agentCards).toHaveLength(1);
    const card = ariaModule.agentCards[0];
    expect(card.agent_id).toBe("aria.rules-engine");
    expect(card.agent_class).toBe("Governance");
    expect(card.product).toBe("ARIA");
    expect(card.data_classification_ceiling).toBe("UNCLASSIFIED"); // GD-10
  });

  it("mounts for a PLATFORM_ADMIN and renders the ARIA chrome", () => {
    const el = document.createElement("div");
    act(() => {
      ariaModule.mount(makeCtx({ role: "PLATFORM_ADMIN" }), el);
    });
    expect(el.textContent).toMatch(/ARIA Suite/);
    act(() => ariaModule.unmount());
  });

  it("mounts for a SYSTEM_ADMIN (superuser) as well", () => {
    const el = document.createElement("div");
    expect(() => ariaModule.mount(makeCtx({ role: "SYSTEM_ADMIN" }), el)).not.toThrow();
    ariaModule.unmount();
  });

  it("refuses to mount for a non-admin role (fail-closed structural gate)", () => {
    const el = document.createElement("div");
    expect(() => ariaModule.mount(makeCtx({ role: "READ_ONLY" }), el)).toThrow(ModuleAccessDeniedError);
  });

  it("unmount is safe to call and clears the rendered tree", () => {
    const el = document.createElement("div");
    act(() => {
      ariaModule.mount(makeCtx(), el);
    });
    expect(el.textContent).toMatch(/ARIA Suite/);
    act(() => ariaModule.unmount());
    expect(el.textContent).toBe("");
  });

  it("healthCheck reports HEALTHY with a NOT_STARTED VRS gate (scaffold, Governance Clock OFF)", async () => {
    const health = await ariaModule.healthCheck();
    expect(health.status).toBe("HEALTHY");
    expect(health.vrs_gate).toBe("NOT_STARTED");
  });
});
