/**
 * module-cpmi — world-model-port.test.ts
 * The synthetic/dev world-model port: lists programs and serves records rich enough to
 * drive the six-step chain; unknown ids return null. The Session 12 config-aware factory
 * defaults to the synthetic backing (endpoint null under the mock).
 */
import { createDevWorldModelPort, createWorldModelPort, isWorldModelConfigured } from "../src/world-model-port";
import { readWorldModelEndpoint } from "../src/cpmi-world-model-endpoint";

describe("dev world-model port", () => {
  const port = createDevWorldModelPort();

  it("lists synthetic programs", () => {
    expect(port.listPrograms().length).toBeGreaterThanOrEqual(2);
    expect(port.listPrograms()).toContain("P-100");
  });

  it("serves a record with the fields the reasoning chain needs", () => {
    const r = port.getProgramContext("P-100");
    expect(r).not.toBeNull();
    expect(r!.program_name).toBeTruthy();
    expect(r!.flags.length).toBeGreaterThan(0);          // → risks
    expect(r!.regulatory_context.length).toBeGreaterThan(0); // → constraints
    expect(r!.objectives.length).toBeGreaterThan(0);     // → recommendation ranking
    expect(r!.synthetic).toBe(true);
  });

  it("returns null for an unknown program", () => {
    expect(port.getProgramContext("P-999")).toBeNull();
  });
});

describe("config-aware world-model port (Session 12 D3)", () => {
  it("defaults to the synthetic backing when no endpoint is configured", () => {
    expect(readWorldModelEndpoint()).toBeNull();
    expect(isWorldModelConfigured()).toBe(false);
    const port = createWorldModelPort();
    expect(port.listPrograms()).toContain("P-100"); // synthetic backing preserved
  });
});
