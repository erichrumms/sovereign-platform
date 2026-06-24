/**
 * sovereign-api-client — test_routing.test.ts
 * Data-classification provider selection: CUI + Ollama enabled → ollama; everything else
 * → anthropic; CUI + Ollama disabled is a recorded classification fallback.
 */
import { selectProvider, isClassificationFallback } from "../src/routing";

describe("selectProvider", () => {
  it("routes CUI to Ollama when enabled", () => {
    expect(selectProvider("CUI", true)).toBe("ollama");
  });
  it("routes CUI to Anthropic when Ollama is disabled", () => {
    expect(selectProvider("CUI", false)).toBe("anthropic");
  });
  it("routes non-CUI classifications to Anthropic even when Ollama is enabled", () => {
    expect(selectProvider("UNCLASSIFIED", true)).toBe("anthropic");
    expect(selectProvider("SECRET", true)).toBe("anthropic");
    expect(selectProvider("TOP_SECRET", true)).toBe("anthropic");
  });
  it("routes an absent classification to Anthropic", () => {
    expect(selectProvider(undefined, true)).toBe("anthropic");
  });
});

describe("isClassificationFallback", () => {
  it("is true only for CUI with Ollama disabled", () => {
    expect(isClassificationFallback("CUI", false)).toBe(true);
    expect(isClassificationFallback("CUI", true)).toBe(false);
    expect(isClassificationFallback("UNCLASSIFIED", false)).toBe(false);
    expect(isClassificationFallback(undefined, false)).toBe(false);
  });
});
