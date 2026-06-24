/**
 * sovereign-api-client — test_model_registry.test.ts
 * Register/get/list; the synthetic placeholder (13B, PENDING); SHA-256 integrity check —
 * match passes, mismatch and unregistered throw ModelIntegrityError.
 */
import {
  ModelRegistry,
  ModelIntegrityError,
  createDefaultModelRegistry,
  SYNTHETIC_MODEL_PLACEHOLDER,
} from "../src/model-registry";

describe("model registry", () => {
  it("ships one synthetic placeholder (13B, PENDING gate status)", () => {
    const reg = createDefaultModelRegistry();
    expect(reg.list()).toHaveLength(1);
    const entry = reg.get("mistral:13b-q4");
    expect(entry).not.toBeNull();
    expect(entry!.cpmi_vrs_gate_status).toBe("PENDING");
    expect(entry!.provider).toBe("ollama");
    expect(entry!.deployment_environments).toContain("dev");
  });

  it("verifyIntegrity passes on a matching hash", () => {
    const reg = createDefaultModelRegistry();
    expect(() => reg.verifyIntegrity("mistral:13b-q4", SYNTHETIC_MODEL_PLACEHOLDER.sha256)).not.toThrow();
  });

  it("verifyIntegrity throws ModelIntegrityError on a hash mismatch", () => {
    const reg = createDefaultModelRegistry();
    expect(() => reg.verifyIntegrity("mistral:13b-q4", "tampered-hash")).toThrow(ModelIntegrityError);
  });

  it("verifyIntegrity throws for an unregistered model", () => {
    const reg = new ModelRegistry();
    expect(() => reg.verifyIntegrity("ghost:model", "any")).toThrow(ModelIntegrityError);
  });
});
