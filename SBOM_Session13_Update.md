# SBOM Session 13 Update — SOVEREIGN Platform
## June 24, 2026 · merges into SBOM Registry · AUTONOMOUS SESSION

**Classification:** Pre-Decisional · Internal Working Document
**Scope:** Components added/changed in Session 13 (D1 shell-contract v1.6 / GD-8,
D2 Local LLM infrastructure in sovereign-api-client). For merge into the master SBOM Registry.

---

## 1. Third-Party Dependencies

**No new third-party dependencies.** The Ollama adapter calls an injected `fetchImpl`
(no live connection this session). `npm audit --omit=dev`: **0 production vulnerabilities.**

---

## 2. Contract / Data-Dictionary Versions

| Artifact | Status |
|---|---|
| `shell-contract.ts` | **v1.5 → v1.6 (GD-8).** SHA `99e47b10b558b3896fbc0fa8c8c635f145a8460f35051c4d5ca100d01d01c8af` — both copies identical. +3 `SovereignEventType` (`INFERENCE_CALL`, `INFERENCE_PROVIDER_FALLBACK`, `MODEL_HASH_MISMATCH`). No `HumanDecisionType` change. |
| `sovereign-api-client/src/types.ts` | **v1.1 → v1.2.** Added `ClearanceLevel` synced copy (the data-classification taxonomy; no divergent `DataClassification`). |
| `@sovereign/data` | unchanged (43 tests) — `SovereignEventType` is not mirrored in shared-types, so GD-8 requires no propagation there. |

---

## 3. New Source Components (`sovereign-api-client/src`)

| File | Purpose |
|---|---|
| `providers/provider-registry.ts` | `InferenceProvider`, `ProviderConfig`, `ProviderRegistry`; Anthropic always on, Ollama by config. |
| `providers/ollama-provider.ts` | `OllamaProvider` (OpenAI-compatible, injected fetch — no live call), `OllamaUnavailableError`. |
| `routing.ts` | `selectProvider()` / `isClassificationFallback()` — data-classification routing (CUI → Ollama). |
| `model-registry.ts` | `ModelRegistry`, `ModelRegistryEntry`, SHA-256 `verifyIntegrity`, `ModelIntegrityError`, synthetic placeholder (`mistral:13b-q4`, PENDING). |
| `inference-logger.ts` | `emitInferenceCall` / `emitProviderFallback` / `emitModelHashMismatch` (the GD-8 events, via ClientLogger). |
| `routed-inference.ts` | `routedComplete()` — classification routing + three-tier fallback + `INFERENCE_CALL`. |
| `ollama-endpoint.ts` | `readOllamaEndpoint` / `readOllamaEnabled` (process.env — commonjs-safe). |

**Changed:**
- `src/base-client.ts` — `SovereignRequestContext` += optional `data_classification?: ClearanceLevel`; `ClientLogger` event-type union += the three GD-8 events.
- `src/types.ts` — added `ClearanceLevel`.
- `src/index.ts` — export the new Local LLM surface (`createSovereignClient` unchanged).
- `shell-contract.ts` (both copies) — v1.6 (GD-8).

---

## 4. Model Registry Entry (SBOM)

| Field | Value |
|---|---|
| model_id | `mistral:13b-q4` |
| provider | `ollama` |
| sha256 | `synthetic-placeholder-sha256-pending-real-download` (replace at real download) |
| cpmi_vrs_gate_status | `PENDING` |
| deployment_environments | `["dev"]` |
| sbom_version | `1.12` |

---

## 5. Agent / Prompt Registry Delta

- **None.** Local LLM is infrastructure (D1 governance decision — SBOM entry only, not an agent). No new agents, no new prompts (autonomous constraint).

---

## 6. Test Inventory

| Suite | Session 12 | Session 13 |
|---|---|---|
| sovereign-data | 43 | 43 |
| sovereign-api-client | 143 | **167** |
| module-counsel | 91 | 91 |
| module-scribe | 122 | 122 |
| module-vigil | 113 | 113 |
| module-lens | 58 | 58 |
| module-cpmi | 58 | 58 |
| **JS total** | 628 | **652** |
| Python | 127 | 127 |
| **Total** | 755 | **779** |

---

*SBOM Session 13 Update · June 24, 2026 · Autonomous Session · merge into master SBOM Registry · Pre-Decisional · Internal Working Document*
