# SBOM Session 16 Update — SOVEREIGN Platform
## June 24, 2026 · merges into SBOM Registry · AUTONOMOUS SESSION

**Classification:** Pre-Decisional · Internal Working Document
**Scope:** Components added/changed in Session 16 (D1 GD-12, D2 AgentCards, D3 GD-13 +
evaluate.py, D4 GD-14 + A2A layer, D5 e2e suite). For merge into the master SBOM Registry.

---

## 1. Third-Party Dependencies

**No new third-party dependencies.** The new `e2e` workspace reuses the existing React /
Jest / ts-jest / testing-library stack. evaluate.py uses only the Python stdlib (no new
pip dependency). `npm audit --omit=dev`: **0 production vulnerabilities.**

---

## 2. Contract / Data-Dictionary Versions

| Artifact | Status |
|---|---|
| `shell-contract.ts` | **v1.8 → v1.11** (three GDs). GD-12: AgentClass += "Orchestration". GD-13: SovereignEventType += MODEL_EVALUATION_COMPLETE. GD-14: SovereignEventType += AGENT_MESSAGE_SENT / AGENT_MESSAGE_RECEIVED. Final SHA `78709b213ff9976ecadd4066645a897ece55fb9b3ffb049b59dd02d19c0162db` — both copies identical. |
| `sovereign-shell/src/module-loader` | `VALID_AGENT_CLASSES` += "Orchestration" (GD-12 sync). |
| `sovereign-security/sovereign_logger.py` | `APPROVED_AGENT_CLASSES` += "Orchestration" (GD-12); `APPROVED_EVENT_TYPES` += MODEL_EVALUATION_COMPLETE (GD-13), AGENT_MESSAGE_SENT / RECEIVED (GD-14). **Drift flagged** — still missing GD-2..GD-11 event types (see Handoff §G). |
| `sovereign-data/src/shared-types.ts` | **Unchanged** — no HumanDecisionType change this session; shared-types does not mirror AgentClass or SovereignEventType. |

---

## 3. New / Changed Source Components

### `sovereign-security` (D3)
| File | Purpose |
|---|---|
| `evaluate.py` | CPMI-VRS four-gate model-evaluation pipeline; emits MODEL_EVALUATION_COMPLETE via the Security Framework logger. Synthetic/dev. |
| `test_evaluate.py` | 15 pytest tests (gates, verdict, promotion gate, real-logger emission). |
| `sovereign_logger.py` | event-type / agent-class taxonomy sync (GD-12/13/14). |

### `module-agentos` (D2, D3, D4)
| File | Change |
|---|---|
| `src/index.ts` | D2 — 3 orchestrator AgentCards (Orchestration). |
| `src/evaluate-port.ts` | D3 — createEvaluatePort()/isEvaluateConfigured() config seam to the live evaluate.py. |
| `src/evaluate-endpoint.ts` | D3 — VITE_EVALUATE_ENDPOINT reader. |
| `src/agentos-message.ts` | D4 — AgentMessage contract + GD-14 event map. |
| `src/message-bus.ts` | D4 — injectable MessageBus + synthetic backing. |
| `src/useMessageBus.ts` | D4 — A2A hook (Logger emission, Gate-2 fail-closed). |

### `e2e` (D5 — new workspace)
| File | Purpose |
|---|---|
| `tests/harness.tsx` | wires the real NEXUS + AgentOS hooks + shared logger. |
| `tests/pipeline.test.tsx` | the 4 required end-to-end scenarios. |

**Changed (wiring):** root `package.json` — `e2e` workspace + `test:e2e` script.

---

## 4. Governance Decisions Recorded This Session

| ID | Decision | Surface |
|---|---|---|
| **GD-12** | Orchestration AgentClass | shell-contract v1.9 + loader + Python logger |
| **GD-13** | MODEL_EVALUATION_COMPLETE event | shell-contract v1.10 + Python logger |
| **GD-14** | AGENT_MESSAGE_SENT / RECEIVED events | shell-contract v1.11 + Python logger |

---

## 5. Agent / Prompt Registry Delta

- **3 AgentOS orchestrator agents activated in code** (agentos.deployer / .exporter /
  .configurator, class Orchestration) — already registered in Agent_Identity_Standard.md
  v1.3; this session adds their AgentCards. No new agents; no new prompts.

---

## 6. Test Inventory

| Suite | Session 15 | Session 16 |
|---|---|---|
| sovereign-data | 43 | 43 |
| sovereign-api-client | 174 | 174 |
| module-counsel | 91 | 91 |
| module-scribe | 122 | 122 |
| module-vigil | 113 | 113 |
| module-lens | 58 | 58 |
| module-cpmi | 58 | 58 |
| module-agentos | 65 | **81** |
| module-nexus | 48 | 48 |
| **e2e** | — | **4** |
| **JS total** | 772 | **792** |
| Python | 127 | **142** |
| **Total** | 899 | **934** |

---

*SBOM Session 16 Update · June 24, 2026 · Autonomous Session · merge into master SBOM Registry · Pre-Decisional · Internal Working Document*
