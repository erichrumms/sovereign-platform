/**
 * sovereign-api-client — test_routing.test.ts
 * GD-10 classification boundary (Session 14): UNCLASSIFIED (or absent) is the only
 * authorized classification and routes to Anthropic; CUI / SECRET / TOP_SECRET throw
 * ClassificationNotAuthorizedError with the governance-fixed message. The latent
 * isClassificationFallback signal is retained as a pure function (architecture).
 */
import {
  selectProvider,
  isClassificationFallback,
  isClassificationAuthorized,
  assertClassificationAuthorized,
  ClassificationNotAuthorizedError,
  AUTHORIZED_CLASSIFICATIONS,
} from "../src/routing";

const UNAUTH_MESSAGE =
  "This classification level is not authorized for processing in SOVEREIGN. " +
  "Contact your system administrator.";

describe("selectProvider (GD-10 boundary)", () => {
  it("routes UNCLASSIFIED to Anthropic", () => {
    expect(selectProvider("UNCLASSIFIED", true)).toBe("anthropic");
    expect(selectProvider("UNCLASSIFIED", false)).toBe("anthropic");
  });

  it("routes an absent classification (treated as UNCLASSIFIED) to Anthropic", () => {
    expect(selectProvider(undefined, true)).toBe("anthropic");
    expect(selectProvider(undefined, false)).toBe("anthropic");
  });

  it("throws ClassificationNotAuthorizedError for CUI", () => {
    expect(() => selectProvider("CUI", true)).toThrow(ClassificationNotAuthorizedError);
    expect(() => selectProvider("CUI", false)).toThrow(ClassificationNotAuthorizedError);
  });

  it("throws ClassificationNotAuthorizedError for SECRET", () => {
    expect(() => selectProvider("SECRET", true)).toThrow(ClassificationNotAuthorizedError);
  });

  it("throws ClassificationNotAuthorizedError for TOP_SECRET", () => {
    expect(() => selectProvider("TOP_SECRET", true)).toThrow(ClassificationNotAuthorizedError);
  });

  it("carries the governance-fixed message and the offending classification", () => {
    try {
      selectProvider("SECRET", false);
      throw new Error("expected to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ClassificationNotAuthorizedError);
      expect((err as ClassificationNotAuthorizedError).message).toBe(UNAUTH_MESSAGE);
      expect((err as ClassificationNotAuthorizedError).classification).toBe("SECRET");
      expect((err as ClassificationNotAuthorizedError).name).toBe("ClassificationNotAuthorizedError");
    }
  });
});

describe("isClassificationAuthorized / assertClassificationAuthorized (GD-10)", () => {
  it("authorizes only UNCLASSIFIED (and absent)", () => {
    expect(isClassificationAuthorized("UNCLASSIFIED")).toBe(true);
    expect(isClassificationAuthorized(undefined)).toBe(true);
    expect(isClassificationAuthorized("CUI")).toBe(false);
    expect(isClassificationAuthorized("SECRET")).toBe(false);
    expect(isClassificationAuthorized("TOP_SECRET")).toBe(false);
  });

  it("AUTHORIZED_CLASSIFICATIONS is UNCLASSIFIED only", () => {
    expect(AUTHORIZED_CLASSIFICATIONS).toEqual(["UNCLASSIFIED"]);
  });

  it("assert passes for UNCLASSIFIED and throws otherwise", () => {
    expect(() => assertClassificationAuthorized("UNCLASSIFIED")).not.toThrow();
    expect(() => assertClassificationAuthorized(undefined)).not.toThrow();
    expect(() => assertClassificationAuthorized("CUI")).toThrow(ClassificationNotAuthorizedError);
  });
});

describe("isClassificationFallback (retained Session 13 architecture)", () => {
  it("is true only for CUI with Ollama disabled (pure signal; gated by GD-10 in routing)", () => {
    expect(isClassificationFallback("CUI", false)).toBe(true);
    expect(isClassificationFallback("CUI", true)).toBe(false);
    expect(isClassificationFallback("UNCLASSIFIED", false)).toBe(false);
    expect(isClassificationFallback(undefined, false)).toBe(false);
  });
});
