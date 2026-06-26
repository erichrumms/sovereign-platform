# SOVEREIGN Platform — SBOM Registry
## Version 1.17 | June 24, 2026
### Merged through Session 16

**Classification:** Pre-Decisional · Internal Working Document
**Base:** SBOM Registry v1.16 (through Session 15)
**Merged:** SBOM_Session16_Update.md (Session 16 — autonomous, D1 GD-12, D2 AgentCards,
D3 GD-13 + evaluate.py, D4 GD-14 + A2A, D5 E2E suite)

---

## Package Inventory

| Package | Version | Tests | Status |
|---|---|---|---|
| `@sovereign/data` | 1.2.0 | 43 | Unchanged |
| `@sovereign/api-client` | 1.0.0 | 174 | Unchanged |
| `@sovereign/shell` | 1.0.0 | — | Unchanged |
| `@sovereign/module-counsel` | 1.0.0 | 91 | Unchanged |
| `@sovereign/module-scribe` | 1.0.0 | 122 | Unchanged |
| `@sovereign/module-vigil` | 1.0.0 | 113 | Unchanged |
| `@sovereign/module-lens` | 1.0.0 | 58 | Unchanged |
| `@sovereign/module-cpmi` | 1.0.0 | 58 | Unchanged |
| `@sovereign/module-agentos` | 1.0.0 | **81** | +16 tests S16 (D2/D3/D4) |
| `@sovereign/module-nexus` | 1.0.0 | 48 | Unchanged |
| **`@sovereign/e2e`** | **1.0.0** | **4** | **NEW — Session 16** |
| `sovereign-security` (Python) | — | **142** | +15 tests S16 (evaluate.py) |

---

## Shell Contract

| Artifact | Version | SHA-256 | Status |
|---|---|---|---|
| `shell-contract.ts` (both copies) | **v1.11** | **`78709b213ff9976ecadd4066645a897ece55fb9b3ffb049b59dd02d19c0162db`** | Three changes S16 (GD-12/13/14) |

**Version progression Session 16:**
- v1.8 → v1.9 (GD-12: `"Orchestration"` AgentClass)
- v1.9 → v1.10 (GD-13: `MODEL_EVALUATION_COMPLETE`)
- v1.10 → v1.11 (GD-14: `AGENT_MESSAGE_SENT`, `AGENT_MESSAGE_RECEIVED`)

---

## Governance Decisions — Session 16

| ID | Decision | Contract version |
|---|---|---|
| GD-12 | Orchestration AgentClass | v1.9 |
| GD-13 | MODEL_EVALUATION_COMPLETE event | v1.10 |
| GD-14 | AGENT_MESSAGE_SENT / RECEIVED events | v1.11 |
| GD-15 | Python logger taxonomy re-sync (pre-approved, pending) | — |

---

## Agent Registry (16 total — all AgentCards active)

| Agent ID | Module | Class | Status |
|---|---|---|---|
| `agentos.deployer` | AgentOS | **Orchestration** | **Implemented S16** |
| `agentos.exporter` | AgentOS | **Orchestration** | **Implemented S16** |
| `agentos.configurator` | AgentOS | **Orchestration** | **Implemented S16** |
| `cpmi.reasoning-chain` | CPMI | Governance | Implemented |
| `cpmi.world-model-api` | CPMI | Operational | Implemented |
| `cpmi.vrs-certification` | CPMI | Governance | Implemented |
| `counsel-analyst` | COUNSEL | Analytical | Implemented |
| `scribe-drafter` | SCRIBE | Operational | Implemented |
| `scribe-style-analyst` | SCRIBE | Analytical | Implemented |
| `vigil-triage-analyst` | VIGIL | Monitoring | Implemented |
| `vigil-approval-agent` | VIGIL | Monitoring | Implemented |
| `lens-explainer` | LENS | Analytical | Implemented |
| `lens-orientation` | LENS | Analytical | Registered only |

---

## New Source Components — Session 16

### `sovereign-security/`
- `evaluate.py` — CPMI-VRS four-gate model evaluation pipeline
- `test_evaluate.py` — 15 pytest tests

### `module-agentos/src/`
- `agentos-message.ts` — AgentMessage contract + GD-14 event map
- `message-bus.ts` — injectable MessageBus + synthetic backing
- `useMessageBus.ts` — A2A hook, Gate-2 fail-closed
- `evaluate-port.ts` — updated config seam to live evaluate.py
- `evaluate-endpoint.ts` — VITE_EVALUATE_ENDPOINT reader
- `index.ts` — 3 Orchestration AgentCards added

### `e2e/` (new workspace)
- `tests/harness.tsx` — pipeline test harness
- `tests/pipeline.test.tsx` — 4 E2E scenarios

---

## Test Totals — Cumulative

| Suite | S1–S15 | S16 | Total |
|---|---|---|---|
| All JS modules | 772 | +20 | **792** |
| e2e | — | +4 | **4** |
| **JS total** | 772 | +24 (incl e2e) | **792** |
| Python | 127 | +15 | **142** |
| **Grand total** | 899 | +35 | **934** |

---

## Git History (Session 16)

| Commit | Description |
|---|---|
| `3f6a13c` | D1 — Shell Contract v1.8→v1.9 (GD-12) |
| `ec74024` | D2 — AgentOS Orchestrator AgentCards |
| `f00719d` | D3 — Shell Contract v1.9→v1.10 (GD-13) |
| `5853e67` | D3 — evaluate.py implementation |
| `6c1be16` | D4 — Shell Contract v1.10→v1.11 (GD-14) |
| `a163c00` | D4 — AgentOS A2A Communication Layer |
| `22315a4` | D5 — E2E test suite |
| `058e630` | docs — Session 16 Handoff + SBOM update |

**HEAD / origin/main: `058e630`**

---

*SOVEREIGN Platform SBOM Registry v1.17 · June 24, 2026*
*Stage 4 COMPLETE · Pre-Decisional · Internal Working Document*
