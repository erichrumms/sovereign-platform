# SBOM Session 12 Update — SOVEREIGN Platform
## June 23, 2026 · merges into SBOM Registry · AUTONOMOUS SESSION

**Classification:** Pre-Decisional · Internal Working Document
**Scope:** Components added/changed in Session 12 (D1 benchmark suite, D2 autonomous
gate cycle, D3 world-model config seam). For merge into the master SBOM Registry.

---

## 1. Third-Party Dependencies

**No new third-party dependencies.** All work is internal to `module-cpmi`.
`npm audit --omit=dev`: **0 production vulnerabilities.**

The world-model config seam reads a build-time platform-config value
(`VITE_CPMI_WORLD_MODEL_ENDPOINT` / `VITE_NOTION_API_KEY`); no live external service is
connected this session (synthetic/dev backing).

---

## 2. Contract / Data-Dictionary Versions

| Artifact | Status |
|---|---|
| `shell-contract.ts` | **v1.5, UNCHANGED.** SHA `8f50399c…37a7a` — both copies identical. No change this session. |
| `@sovereign/data` | 1.2.0, unchanged. |

---

## 3. New Source Components (`module-cpmi`)

| File | Purpose |
|---|---|
| `src/benchmark.ts` | Known-answer suite — 3 scenarios (A/B/C), `BenchmarkReport`/`ScenarioResult`, `gate3_ready` logic. |
| `src/useBenchmark.ts` | Benchmark hook — runs the suite, AGENT_STEP_* Logger emission, Gate 2 fail-closed. |
| `src/BenchmarkPanel.tsx` | Benchmark report UI + Gate 3 attestation surface (enabled only when `gate3_ready`). |
| `src/gate-checks.ts` | Gate 1 / Gate 2 precondition checklists. |
| `src/cpmi-world-model-endpoint.ts` | Isolated reader for the world-model endpoint / Notion key. |
| `tests/__mocks__/cpmi-world-model-endpoint.ts` | Test stub (null → synthetic). |
| `tests/benchmark.test.ts`, `tests/useBenchmark.test.ts`, `tests/BenchmarkPanel.test.tsx`, `tests/gate-checks.test.ts` | New tests. |

**Changed:**
- `src/GateRunnerPanel.tsx` — auto-runs Gates 1 & 2 on mount; embeds `BenchmarkPanel`; Gate 3 enabled only when `gate3_ready`; Gate 4 deferred to the Project Principal.
- `src/world-model-port.ts` — adds `createWorldModelPort()` (config-aware) + `isWorldModelConfigured()`; default null → synthetic.
- `src/useReasoningChain.ts`, `src/ReasoningChainPanel.tsx`, `src/WorldModelPanel.tsx` — use `createWorldModelPort()` (null → synthetic; no behavior change).
- `package.json` — jest mapper for `cpmi-world-model-endpoint`.
- `tests/world-model-port.test.ts`, `tests/GateRunnerPanel.test.tsx`, `tests/CpmiApp.test.tsx` — updated.

---

## 4. Agent / Prompt Registry Delta

- **None.** No new agents, no new prompts (autonomous constraint). The benchmark and gate
  cycle run under the existing `cpmi.reasoning-chain` / `cpmi.vrs-certification` and
  PR-CPMI-001.

---

## 5. Test Inventory

| Suite | Session 11 | Session 12 |
|---|---|---|
| sovereign-data | 43 | 43 |
| sovereign-api-client | 143 | 143 |
| module-counsel | 91 | 91 |
| module-scribe | 122 | 122 |
| module-vigil | 113 | 113 |
| module-lens | 58 | 58 |
| module-cpmi | 46 | **58** |
| **JS total** | 616 | **628** |
| Python | 127 | 127 |
| **Total** | 743 | **755** |

---

*SBOM Session 12 Update · June 23, 2026 · Autonomous Session · merge into master SBOM Registry · Pre-Decisional · Internal Working Document*
