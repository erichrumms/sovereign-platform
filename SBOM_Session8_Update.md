# SBOM Session 8 Update — SOVEREIGN Platform
## June 23, 2026 · merges into SBOM Registry (current base: v1.8)

**Classification:** Pre-Decisional · Internal Working Document
**Scope:** Software components added/changed in Session 8 (D1 LENS core, D2 SCRIBE
intermediate modes, D3 Smart Capture). For merge into the master SBOM Registry in Claude Chat.

---

## 1. Third-Party Dependencies

**No new third-party dependencies introduced this session.** `module-lens` now declares
two **internal workspace** packages it already relied on transitively:

| Package | Type | Version |
|---|---|---|
| `@sovereign/api-client` | internal workspace | ^1.0.0 |
| `@sovereign/data` | internal workspace | ^1.0.0 |

`npm audit --omit=dev`: **0 production vulnerabilities.**

Web Speech API (Smart Capture, D3) is a **browser-native** API — no package, no service;
transcription occurs in-browser and no audio leaves the device.

---

## 2. Package Version Changes

| Package | Before | After | Reason |
|---|---|---|---|
| `@sovereign/data` | 1.0.0 | **1.1.0** | New canonical entity `LensExplanation` + `validateLensExplanation`. |
| `@sovereign/module-lens` | 1.0.0 (scaffold) | 1.0.0 (core) | LENS core build; description de-scaffolded; deps added. |

`shell-contract.ts`: **v1.3, unchanged.** SHA-256 `4d78754f…6836acc2` — both synced copies verified identical at close.

---

## 3. New Source Components

### `@sovereign/data`
- `src/entities/lens-explanation.ts` — `LensExplanation` entity + validator.
- `tests/lens-explanation.test.ts`

### `module-lens` (D1 — LENS core)
- `src/lens-contract.ts` — PR-LENS-001 binding, `ExplanationInput`, canonical validator re-export.
- `src/source-documents.ts` — knowledge base (condensations of the two VIGIL source docs).
- `src/explanation-engine.ts` — three-tier fallback (live → cache → static).
- `src/useExplanation.ts` — hook + Logger emission (approved event types only).
- `src/orientation-data.ts` — static six-product orientation knowledge base.
- `src/session-events.ts` — LENS session activity capture (write-only-logger adaptation).
- `src/GovernanceExplainer.tsx`, `src/PipelineNavigator.tsx`, `src/AITransparencyPanel.tsx` — the three surfaces.
- `src/anthropic-key.ts` — Vite env key reader (jest-mocked).
- `src/prompts/explainer-system.prompt.ts` — runtime copy of PR-LENS-001.
- Tests: `explanation-engine`, `useExplanation`, `GovernanceExplainer`, `PipelineNavigator`, `AITransparencyPanel`, `orientation-data`, `session-events` (+ updated `index`, `LensApp`, `test-helpers`, `__mocks__/anthropic-key`).

### `module-scribe` (D2 — intermediate modes)
- `src/intermediate-contract.ts` — `IntermediateMode`, `IntermediateResult`, non-empty-prose guard (NOT product-schema), PR-SCRIBE-001 binding.
- `src/intermediate-engine.ts` — three-tier prose fallback (no product-schema validation).
- `src/useIntermediate.ts` — hook + Logger emission.
- `src/IntermediateWorkspace.tsx` — synthesis/framing surface (no Export gate).
- Tests: `intermediate-contract`, `intermediate-engine`, `useIntermediate`, `IntermediateWorkspace`.

### `module-scribe` (D3 — Smart Capture)
- `src/speech-recognition.ts` — typed Web Speech API adapter (null when unsupported).
- `src/useVoiceCapture.ts` — voice capture hook emitting `VOICE_CAPTURE_COMPLETED` (GD-2).
- `src/SmartCapturePanel.tsx` — voice modality (Gate 1 disclosure; degrades to typed-only).
- Wired into `DraftWorkspace.tsx` and `IntermediateWorkspace.tsx`.
- Tests: `speech-recognition`, `useVoiceCapture`, `SmartCapturePanel`.

---

## 4. Agent Registry Delta

- `lens-explainer` — agent class **Operational → Analytical** (LENS spec §2.1). No new agents registered. `vigil-approval-agent` remains deferred.

---

## 5. Prompt Registry Delta

- **PR-LENS-001** — status corrected to **APPROVED** (June 18) in the prompt file + CHANGELOG; runtime copy created. No prompt-text change.
- **PR-SCRIBE-001** — now also serves `synthesis`/`framing` (no text change).
- No new prompts authored. PR-SCRIBE-002/003 and PR-LENS-002 remain unauthored.

---

## 6. Test Inventory

| Suite | Session 7 | Session 8 |
|---|---|---|
| sovereign-data | 27 | 36 |
| sovereign-api-client | 143 | 143 |
| module-counsel | 91 | 91 |
| module-scribe | 86 | 122 |
| module-vigil | 63 | 63 |
| module-lens | 9 | 58 |
| **JS total** | **419** | **513** |
| Python (sovereign-security) | 127 | 127 |
| **Total** | **546** | **640** |

---

*SBOM Session 8 Update · June 23, 2026 · merge into master SBOM Registry · Pre-Decisional · Internal Working Document*
