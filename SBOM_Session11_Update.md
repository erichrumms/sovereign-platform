# SBOM Session 11 Update — SOVEREIGN Platform
## June 23, 2026 · merges into SBOM Registry

**Classification:** Pre-Decisional · Internal Working Document
**Scope:** Components added/changed in Session 11 (D1 shell-contract v1.5 / GD-7,
D2 CPMI module — first Stage 3 build). For merge into the master SBOM Registry.

---

## 1. Third-Party Dependencies

**No new third-party dependencies.** `module-cpmi` declares the same internal workspace
packages the other modules use (`@sovereign/api-client`, `@sovereign/data`, react,
react-dom). `npm audit --omit=dev`: **0 production vulnerabilities.**

The world-model port uses a SYNTHETIC/DEV backing this session — no Notion API, no
external service. (The live Notion backing is injectable by configuration later.)

---

## 2. Contract / Data-Dictionary Versions

| Artifact | Status |
|---|---|
| `shell-contract.ts` | **v1.4 → v1.5 (GD-7).** New SHA-256 `8f50399cf5e03c33f3d2a809ff5a5c66167b98ba7aa980b418c259b1d4537a7a` — both copies verified identical. +5 `SovereignEventType`, +2 `HumanDecisionType`. |
| `@sovereign/data` | **1.1.0 → 1.2.0.** New entity `ReasoningChainOutput` + validator. `HumanDecisionType` / `HUMAN_DECISION_TYPES` → **13 members** (synced GD-7). |

---

## 3. New Module — `module-cpmi`

| File | Purpose |
|---|---|
| `src/index.ts` | `SovereignModuleContract` + three agent cards; PLATFORM_ADMIN structural gate. |
| `src/cpmi-contract.ts` | Reasoning input, six-step defs, 0.7× constant, gate/cert shapes, workflow_step_id helpers. |
| `src/world-model-port.ts` | Injectable `WorldModelPort` + synthetic/dev program data. |
| `src/reasoning-engine.ts` | Six-step chain, three-tier fallback, surfaceable-output rule. |
| `src/useReasoningChain.ts` | Chain hook — one `createSovereignClient()`/chain; `AGENT_STEP_*` + `CPMI_REASONING_CHAIN_COMPLETE`. |
| `src/gate-runner.ts` | Pure CPMI-VRS gate sequence. |
| `src/useGateRunner.ts` | Gate hook — Gates 1/2/4 auto, Gate 3 attestation (`GATE_3_ATTESTATION`), Gate 2 fail-closed. |
| `src/vrs-certification.ts` | Certificate issuance after all four gates. |
| `src/CpmiApp.tsx`, `ReasoningChainPanel.tsx`, `WorldModelPanel.tsx`, `GateRunnerPanel.tsx` | Tabbed surfaces (Gate 1 AI disclosure). |
| `src/prompts/reasoning-chain.prompt.ts`, `prompts/reasoning-chain-v1.0.md`, `prompts/CHANGELOG.md` | PR-CPMI-001 (APPROVED June 23). |
| `src/anthropic-key.ts` | Vite env key reader (jest-mocked). |

**Changed:** `sovereign-shell/src/register-modules.ts` (mounts `cpmiModule`), root
`package.json` (workspaces + `test:cpmi`).

---

## 4. Agent & Prompt Registry Delta

- **Three CPMI agents implemented and registered** (Agent Identity Standard v1.2):
  `cpmi.reasoning-chain` (Governance, RE_EXECUTE), `cpmi.world-model-api` (Operational),
  `cpmi.vrs-certification` (Governance). Platform now has 8 companion + 3 CPMI = 11 registered agents.
- **PR-CPMI-001** — APPROVED (June 23, 2026); runtime copy created. Only `cpmi.reasoning-chain` uses a prompt.

---

## 5. Test Inventory

| Suite | Session 10 | Session 11 |
|---|---|---|
| sovereign-data | 36 | 43 |
| sovereign-api-client | 143 | 143 |
| module-counsel | 91 | 91 |
| module-scribe | 122 | 122 |
| module-vigil | 113 | 113 |
| module-lens | 58 | 58 |
| module-cpmi | — | **46** |
| **JS total** | 563 | **616** |
| Python | 127 | 127 |
| **Total** | 690 | **743** |

---

*SBOM Session 11 Update · June 23, 2026 · merge into master SBOM Registry · Pre-Decisional · Internal Working Document*
