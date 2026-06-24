/**
 * SOVEREIGN Platform — sovereign-api-client
 * model-registry.ts — the SBOM model registry for Local LLM weights (GD-8 / Session 13).
 *
 * Every model loaded into the inference runtime must be registered before first use, with
 * a recorded SHA-256 hash that is verified at load (a mismatch is a P1 MODEL_HASH_MISMATCH
 * and blocks inference). This session ships ONE synthetic placeholder entry (the 13B model
 * that will be registered when actually downloaded) with cpmi_vrs_gate_status PENDING — so
 * the registry is functional and testable without Ollama installed.
 *
 * Version: 1.0 · Session 13 · June 24, 2026
 */

export type CpmiVrsGateStatus = "PENDING" | "PASSED" | "FAILED";
export type DeploymentEnvironment = "dev" | "govcloud" | "both";

export interface ModelRegistryEntry {
  model_id: string;
  provider: "ollama";
  sha256: string;
  source_url: string;
  model_card_url: string;
  cpmi_vrs_gate_status: CpmiVrsGateStatus;
  registered_at: string;
  registered_by: string;
  deployment_environments: DeploymentEnvironment[];
  sbom_version: string;
}

/** Thrown when a model's SHA-256 does not match its registry entry (blocks inference). */
export class ModelIntegrityError extends Error {
  constructor(
    public readonly model_id: string,
    public readonly expected_sha256: string,
    public readonly actual_sha256: string
  ) {
    super(`Model integrity check failed for ${model_id}: expected ${expected_sha256}, got ${actual_sha256}`);
    this.name = "ModelIntegrityError";
  }
}

export class ModelRegistry {
  private readonly entries = new Map<string, ModelRegistryEntry>();

  register(entry: ModelRegistryEntry): void {
    this.entries.set(entry.model_id, entry);
  }

  get(modelId: string): ModelRegistryEntry | null {
    return this.entries.get(modelId) ?? null;
  }

  list(): ModelRegistryEntry[] {
    return [...this.entries.values()];
  }

  /**
   * Verify a model's integrity against its registered hash. Throws ModelIntegrityError on
   * mismatch (caller emits MODEL_HASH_MISMATCH and blocks inference). Throws if the model
   * is not registered — an unregistered model cannot be loaded.
   */
  verifyIntegrity(modelId: string, actualSha256: string): void {
    const entry = this.get(modelId);
    if (!entry) {
      throw new ModelIntegrityError(modelId, "(unregistered)", actualSha256);
    }
    if (entry.sha256 !== actualSha256) {
      throw new ModelIntegrityError(modelId, entry.sha256, actualSha256);
    }
  }
}

/**
 * The synthetic placeholder entry for the 13B model — a stand-in until the real weights
 * are downloaded and registered (then the synthetic sha256 is replaced and gates run).
 * cpmi_vrs_gate_status PENDING: a model without PASSED is refused at load (enforced by the
 * loader, not here). Clearly synthetic — Governance Clock OFF.
 */
export const SYNTHETIC_MODEL_PLACEHOLDER: ModelRegistryEntry = {
  model_id: "mistral:13b-q4",
  provider: "ollama",
  sha256: "synthetic-placeholder-sha256-pending-real-download",
  source_url: "https://ollama.com/library/mistral",
  model_card_url: "https://ollama.com/library/mistral",
  cpmi_vrs_gate_status: "PENDING",
  registered_at: "2026-06-24T00:00:00.000Z",
  registered_by: "project_principal",
  deployment_environments: ["dev"],
  sbom_version: "1.12",
};

/** A model registry pre-seeded with the synthetic placeholder. */
export function createDefaultModelRegistry(): ModelRegistry {
  const registry = new ModelRegistry();
  registry.register({ ...SYNTHETIC_MODEL_PLACEHOLDER });
  return registry;
}
