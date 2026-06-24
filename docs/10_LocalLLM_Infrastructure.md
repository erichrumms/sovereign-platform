# Local LLM Infrastructure — Session 13 Architecture
## Document ID: 10_LocalLLM_Infrastructure.md | Version 1.0 | June 24, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Parent Brief:** SOVEREIGN Platform Integration Brief v1.19
**Status:** Approved for Session 13 Build (Autonomous)

---

## §1 — Purpose and Scope

Session 13 builds the Local LLM infrastructure layer — Provider B registration inside
`sovereign-api-client`, the Ollama provider adapter, data-classification-driven routing
logic in `createSovereignClient()`, SBOM model registry, and the Security Framework
integration for inference-layer events.

All five Local LLM governance decisions are recorded (R7 CLOSED, Integration Brief
v1.17). No new governance decisions are required this session. This is a pure
infrastructure build.

**Pipeline position:** This work sits inside `sovereign-api-client` — beneath every
product, not a product itself. No module changes. No shell-contract changes. No new
agents. No new prompts. This is the plumbing that makes the routing story credible
for a demo.

**Governance Clock stays OFF. All data SYNTHETIC. Anthropic API remains primary.**

---

## §2 — What Gets Built

### 2.1 Provider B Registration

`sovereign-api-client` gains a second registered provider alongside the existing
Anthropic provider.

```typescript
// New provider enum value
type InferenceProvider = 'anthropic' | 'ollama';

// Provider registry
interface ProviderConfig {
  provider: InferenceProvider;
  endpoint: string;
  modelId: string;
  enabled: boolean;
}
```

The provider registry is injectable — a configuration object, not a hardcoded value.
Default: Anthropic only (Provider A). When `VITE_OLLAMA_ENDPOINT` is set and
`VITE_OLLAMA_ENABLED=true`, Provider B activates.

### 2.2 Data-Classification Routing

`createSovereignClient()` gains routing logic that selects the provider based on
the `data_classification` field of the incoming request.

```typescript
// Routing logic (conceptual)
function selectProvider(request: SovereignRequest): InferenceProvider {
  if (request.data_classification === 'CUI' && ollamaEnabled()) {
    return 'ollama';
  }
  return 'anthropic';
}
```

**Routing rules:**
- `data_classification: 'CUI'` + Ollama enabled → Provider B (Ollama)
- `data_classification: 'CUI'` + Ollama not enabled → Provider A (Anthropic) with
  a Logger warning (`INFERENCE_PROVIDER_FALLBACK`)
- All other classifications → Provider A (Anthropic) always
- No `data_classification` field → Provider A (Anthropic) with a Logger warning

This satisfies D1 (infrastructure component) and D2 (routing by classification)
from the recorded governance decisions.

### 2.3 Ollama Provider Adapter

A new `OllamaProvider` class implements the same interface as the existing
`AnthropicProvider`. Both providers return the standard `SovereignResponse` schema.
Products call `createSovereignClient()` — they never touch the provider directly.

```typescript
interface SovereignResponse {
  content: string;
  provider: InferenceProvider;
  model_id: string;
  latency_ms: number;
  data_classification: DataClassification;
}
```

The Ollama adapter uses the OpenAI-compatible REST API that Ollama exposes at
`localhost:11434`. When Ollama is not running, the adapter throws a typed
`OllamaUnavailableError` which triggers the three-tier fallback.

### 2.4 Three-Tier Fallback

Per the D2 governance decision, the fallback sequence is:

1. **Tier 1 — Live Ollama inference:** Ollama running, model loaded, request succeeds
2. **Tier 2 — Anthropic fallback:** Ollama unavailable; route to Anthropic with a
   `INFERENCE_PROVIDER_FALLBACK` Logger warning noting the fallback reason
3. **Tier 3 — Static response:** Both providers unavailable; return a static degraded
   response (same pattern as VIGIL triage and LENS explainer static tiers)

The fallback is transparent to the calling module — it always receives a
`SovereignResponse`. The `provider` field in the response tells the module which
tier served the request.

### 2.5 SBOM Model Registry

A new `ModelRegistry` in `sovereign-api-client` tracks registered model versions.
Each model entry includes:

```typescript
interface ModelRegistryEntry {
  model_id: string;          // e.g. 'mistral:13b-q4'
  provider: 'ollama';
  sha256: string;            // hash recorded at registration
  source_url: string;        // verified download source
  model_card_url: string;    // training data documentation
  cpmi_vrs_gate_status: 'PENDING' | 'PASSED' | 'FAILED';
  registered_at: string;     // ISO timestamp
  registered_by: string;     // 'project_principal'
  deployment_environments: ('dev' | 'govcloud' | 'both')[];
  sbom_version: string;      // SBOM version at registration
}
```

For this session, the model registry contains one synthetic entry — a placeholder
for the 13B model that will be registered when actually downloaded. The placeholder
has `cpmi_vrs_gate_status: 'PENDING'` and a synthetic `sha256`. This makes the
registry functional and testable without requiring Ollama to be installed.

The `sha256` verification at model load is enforced in code — a mismatch throws
`ModelIntegrityError` and blocks inference. For the synthetic placeholder, the
hash check uses a test bypass flag (jest env only).

### 2.6 Security Framework Integration

Three new Logger events added to `sovereign-api-client`:

**`INFERENCE_CALL`** — emitted on every successful inference call:
```typescript
{
  event_type: 'INFERENCE_CALL',
  provider: InferenceProvider,
  model_id: string,
  input_classification: DataClassification,
  output_schema_valid: boolean,
  latency_ms: number,
  workflow_step_id: string,
}
```

**`INFERENCE_PROVIDER_FALLBACK`** — emitted when routing falls back:
```typescript
{
  event_type: 'INFERENCE_PROVIDER_FALLBACK',
  intended_provider: InferenceProvider,
  actual_provider: InferenceProvider,
  fallback_reason: string,
  workflow_step_id: string,
}
```

**`MODEL_HASH_MISMATCH`** — emitted when SHA-256 verification fails (P1 severity):
```typescript
{
  event_type: 'MODEL_HASH_MISMATCH',
  model_id: string,
  expected_sha256: string,
  actual_sha256: string,
  workflow_step_id: string,
}
```

These three new event types require a **shell-contract change: v1.5 → v1.6**.
This is D1 of the session — do it first, same governance process as GD-6 and GD-7.

### 2.7 New `DataClassification` field on SovereignRequest

The existing `SovereignRequest` type gains a `data_classification` field:

```typescript
type DataClassification = 'UNCLASSIFIED' | 'CUI' | 'SECRET' | 'TOP_SECRET';

interface SovereignRequest {
  // existing fields...
  data_classification?: DataClassification;  // defaults to 'UNCLASSIFIED' if absent
}
```

This is a **shell-contract addition** — part of the v1.5 → v1.6 change in D1.

---

## §3 — Shell Contract Change: v1.5 → v1.6

**New SovereignEventType values:**
- `INFERENCE_CALL`
- `INFERENCE_PROVIDER_FALLBACK`
- `MODEL_HASH_MISMATCH`

**New DataClassification type:**
- `'UNCLASSIFIED' | 'CUI' | 'SECRET' | 'TOP_SECRET'`

**SovereignRequest addition:**
- `data_classification?: DataClassification`

**Governance process (Constraint #8 — all mandatory):**
1. Version increment: v1.5 → v1.6
2. Changelog entry: "GD-8 — Local LLM inference events + DataClassification routing field"
3. Impact assessment: `sovereign-api-client` only for new event types;
   `SovereignRequest` addition is additive and non-breaking (optional field,
   defaults to UNCLASSIFIED); `@sovereign/data` shared-types sync required for
   any SovereignEventType additions (Constraint #11)
4. SHA-256 verify both copies after change — record new v1.6 hash
5. Project Principal approval — this document serves as pre-approval;
   Claude Code confirms before making the change

---

## §4 — Files to Build

### New files in `sovereign-api-client/src/`

| File | Purpose |
|---|---|
| `providers/anthropic-provider.ts` | Extracts existing Anthropic call logic into a typed provider class |
| `providers/ollama-provider.ts` | Ollama OpenAI-compatible adapter, OllamaUnavailableError |
| `providers/provider-registry.ts` | ProviderConfig, InferenceProvider enum, registry management |
| `routing.ts` | selectProvider() — data-classification-driven routing logic |
| `model-registry.ts` | ModelRegistry, ModelRegistryEntry, sha256 verification, ModelIntegrityError |
| `inference-logger.ts` | INFERENCE_CALL, INFERENCE_PROVIDER_FALLBACK, MODEL_HASH_MISMATCH emission |
| `ollama-endpoint.ts` | Isolated reader for VITE_OLLAMA_ENDPOINT + VITE_OLLAMA_ENABLED (mirrors vigil-endpoint.ts pattern) |

### Changed files

| File | Change |
|---|---|
| `src/index.ts` | Export new types; update createSovereignClient() with routing logic |
| `src/client.ts` | Add provider selection, fallback chain, INFERENCE_CALL emission |
| `sovereign-shell/shell-contract.ts` (both copies) | v1.5 → v1.6 (GD-8) |
| `sovereign-data/src/shared-types.ts` | Add new SovereignEventType members (Constraint #11) |

### Tests

Full test coverage required for all new files. Key test scenarios:
- UNCLASSIFIED request → routes to Anthropic
- CUI request + Ollama enabled → routes to Ollama
- CUI request + Ollama disabled → routes to Anthropic with INFERENCE_PROVIDER_FALLBACK
- Ollama unavailable → falls back to Anthropic (Tier 2)
- Both unavailable → static response (Tier 3)
- SHA-256 mismatch → ModelIntegrityError thrown
- INFERENCE_CALL emitted on every successful call
- workflow_step_id present on every Logger event

---

## §5 — Session 13 Done Condition

**D1 — Shell Contract v1.5 → v1.6 (GD-8, do first)**
- Add INFERENCE_CALL, INFERENCE_PROVIDER_FALLBACK, MODEL_HASH_MISMATCH to SovereignEventType
- Add DataClassification type + data_classification field to SovereignRequest
- Version increment, changelog (GD-8), impact assessment
- Propagate SovereignEventType additions to @sovereign/data shared-types (Constraint #11)
- SHA-256 verify both copies — record new v1.6 hash
- Do not proceed to D2 until verified

**D2 — Local LLM Infrastructure**
- Provider registry with Anthropic (A) and Ollama (B) providers
- Data-classification routing in createSovereignClient()
- Ollama adapter (OpenAI-compatible, OllamaUnavailableError)
- Three-tier fallback: live Ollama → Anthropic → static
- Model registry with synthetic placeholder entry (13B, PENDING CPMI-VRS)
- SHA-256 model integrity check (ModelIntegrityError on mismatch)
- INFERENCE_CALL + INFERENCE_PROVIDER_FALLBACK + MODEL_HASH_MISMATCH Logger events
- Ollama endpoint config reader (mirrors vigil-endpoint.ts)
- Full test coverage — all routing scenarios, fallback chain, integrity check

**Close requirements:**
- Full test suite: all JS suites + Python
- tsc --noEmit clean — sovereign-shell + sovereign-api-client
- npm audit --omit=dev — zero production vulnerabilities
- Both shell-contract copies SHA-256 identical at v1.6 hash
- Commit D1 and D2 as separate commits
- Push to origin
- Session 13 Handoff + SBOM_Session13_Update.md

---

## §6 — Autonomous Operation Rules

**This is a fully autonomous session.** The Project Principal will not be available.

**Authorized without stopping:**
- All technical decisions within the defined scope
- TypeScript errors from new files
- Test mock adjustments
- Minor interface adjustments to make routing work cleanly

**Not authorized — record in handoff instead:**
- Any shell-contract change beyond GD-8 additions defined above
- New agents or prompts
- Connecting to a live Ollama instance
- Activating real inference through Provider B
- Any decision requiring a governance record beyond what this spec defines

**If a genuine blocker is encountered:** Complete as much of the done condition as
possible, document the blocker precisely in the handoff, and close cleanly.

---

## §7 — Governance Decisions Already Made

All five Local LLM decisions (D1–D5) recorded June 23, 2026 (Integration Brief v1.17):

- **D1:** Infrastructure component — SBOM entry only, no agent registry entry
- **D2:** Ollama on Mac Mini M4; Anthropic primary through demo; 13B Q4/Q5;
  three-tier fallback; inference activates by configuration when client requires it
- **D3:** Mac Mini M4 for development and demo; GovCloud deferred
- **D4:** Inference-only; fine-tuning deferred to Stage 10
- **D5:** Agent Operator Scope update deferred until live inference activation

Shell-contract change GD-8 is pre-approved by this document and the Project
Principal's authorization of Session 13 scope.

---

*SOVEREIGN Platform · 10_LocalLLM_Infrastructure.md · v1.0 · June 24, 2026*
*Pre-Decisional · Internal Working Document · Approved for Autonomous Session 13*
