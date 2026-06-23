/**
 * module-lens — orientation-data.test.ts
 * The static Pipeline Navigator knowledge base: every primary product has an
 * orientation, path→product derivation matches the frozen-contract currentPath, and
 * companion/unknown routes derive null (so the Navigator shows the picker).
 */
import {
  PIPELINE_ORDER,
  PRODUCT_ORIENTATIONS,
  getOrientation,
  productFromPath,
} from "../src/orientation-data";

describe("orientation knowledge base", () => {
  it("covers exactly the six primary products in pipeline order", () => {
    expect(PIPELINE_ORDER).toEqual(["FLOWPATH", "CPMI", "AGENTOS", "NEXUS", "APEX", "ARIA"]);
    expect(PRODUCT_ORIENTATIONS.map((o) => o.product).sort()).toEqual([...PIPELINE_ORDER].sort());
  });

  it("returns an orientation for each primary product", () => {
    for (const p of PIPELINE_ORDER) {
      expect(getOrientation(p)).not.toBeNull();
    }
  });

  it("returns null for a companion module (not in the pipeline)", () => {
    expect(getOrientation("LENS")).toBeNull();
  });

  it("does not fabricate agent activity inside primary products", () => {
    expect(PRODUCT_ORIENTATIONS.every((o) => o.active_agents.length === 0)).toBe(true);
  });
});

describe("productFromPath (frozen-contract currentPath derivation)", () => {
  it.each([
    ["/flowpath", "FLOWPATH"],
    ["/cpmi", "CPMI"],
    ["/agentos", "AGENTOS"],
    ["/nexus", "NEXUS"],
    ["/apex", "APEX"],
    ["/aria", "ARIA"],
    ["/nexus/task/42", "NEXUS"],
  ])("maps %s → %s", (path, product) => {
    expect(productFromPath(path)).toBe(product);
  });

  it.each(["/lens", "/counsel", "/scribe", "/vigil", "/", ""])(
    "derives null for companion/unknown route %s",
    (path) => {
      expect(productFromPath(path)).toBeNull();
    }
  );
});
