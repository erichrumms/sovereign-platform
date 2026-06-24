# SBOM Session 14 Update — SOVEREIGN Platform
## June 24, 2026 · merges into SBOM Registry · AUTONOMOUS SESSION

**Classification:** Pre-Decisional · Internal Working Document
**Scope:** Components added/changed in Session 14 (D0 GD-10 classification boundary,
D1 shell-contract v1.7 / GD-9, D2 AgentOS module). For merge into the master SBOM Registry.

---

## 1. Third-Party Dependencies

**No new third-party dependencies.** `module-agentos` reuses the same React / Jest /
ts-jest / testing-library stack as the other modules (already in the lockfile via npm
workspaces). `npm audit --omit=dev`: **0 production vulnerabilities.**

---

## 2. Contract / Data-Dictionary Versions

| Artifact | Status |
|---|---|
| `shell-contract.ts` | **v1.6 → v1.7 (GD-9).** SHA `07f4852410390d937d18bdcbde5511c25f6896487452bbe0cef8e55c79060634` — both copies identical. +7 `SovereignEventType` (`AGENTOS_TASK_ASSIGNED`, `AGENTOS_APPROVAL_REQUESTED`, `AGENTOS_TASK_APPROVED`, `AGENTOS_TASK_REJECTED`, `AGENTOS_TASK_STARTED`, `AGENTOS_TASK_COMPLETE`, `AGENTOS_TASK_CANCELLED`); +2 `HumanDecisionType` (`TASK_APPROVAL`, `TASK_CANCELLATION`). Retires v1.6 `99e47b10…01c8af`. |
| `sovereign-data/src/shared-types.ts` | **Synced to v1.7.** `HumanDecisionType` + `HUMAN_DECISION_TYPES` 13 → 15 (`TASK_APPROVAL`, `TASK_CANCELLATION`) per Constraint #11; test updated. |
| `sovereign-api-client/src/routing.ts` | **v1.0 → v1.1 (GD-10).** Classification boundary — `ClassificationNotAuthorizedError`, `AUTHORIZED_CLASSIFICATIONS` (UNCLASSIFIED only), `isClassificationAuthorized` / `assertClassificationAuthorized`. No shell-contract change for GD-10. |

---

## 3. New Source Components

### `sovereign-api-client/src` (D0 — GD-10)
| File | Change |
|---|---|
| `routing.ts` | `selectProvider()` now throws `ClassificationNotAuthorizedError` for CUI / SECRET / TOP_SECRET; UNCLASSIFIED → Anthropic. Session 13 Ollama/CUI route retained as latent architecture (reactivates when `AUTHORIZED_CLASSIFICATIONS` widens). |
| `routed-inference.ts` | The boundary guard sits outside the try/catch — `ClassificationNotAuthorizedError` propagates to the caller (not swallowed by the three-tier fallback). |
| `index.ts` | Export the GD-10 surface. |

### `module-agentos/src` (D2 — new workspace package)
| File | Purpose |
|---|---|
| `agentos-contract.ts` | `Task` (8-status lifecycle), `AgentAssignment`, `ALLOWED_TRANSITIONS`, GD-9 event mapping, human-decision mapping, `taskWorkflowStep`, validation. |
| `task-registry.ts` | Pure lifecycle state machine; `TaskTransitionError` / `TaskNotFoundError`. |
| `useTaskRegistry.ts` | State + GD-9 Logger emission; Gate-2 fail-closed; ref-backed for synchronous chained transitions. |
| `agent-dispatcher.ts` | Synthetic/dev dispatch roster + builders; GD-10 enforcement (reuses api-client rule). |
| `useAgentDispatcher.ts` | Approval-port wiring (submit / poll / decision); GD-10 error surfacing. |
| `approval-port.ts` | AgentOS implementation of VIGIL's `AgentApprovalPort` (`listPending`) + `submitRequest` / `getDecision` / `recordDecision`. Closes the Session 10 loop. |
| `AgentOSApp.tsx`, `TaskRegistryPanel.tsx`, `AgentDispatchPanel.tsx` | Tabbed UI (Task Registry + Agent Dispatch / approval queue). |
| `index.ts` | `SovereignModuleContract`, fail-closed PLATFORM_ADMIN gate, **empty `agentCards`** (Constraint #10). |

**Changed (wiring):** `sovereign-shell/src/register-modules.ts` (registers `agentosModule`); root `package.json` (`module-agentos` workspace + `test:agentos`).

---

## 4. Agent / Prompt Registry Delta

- **None.** No new agents, no new prompts (autonomous constraint #9/#10). AgentOS
  orchestrator agents are NOT yet in `Agent_Identity_Standard.md`; `module-agentos`
  registers **zero** `agentCards`. The dispatcher's synthetic roster
  (`agentos-deployer` / `-exporter` / `-configurator`) is dev dispatch-target data,
  not platform agent registration. **Governance flag:** when AgentOS orchestrator
  agents are entered in the registry, their `AgentCard`s are added to `module-agentos`.

---

## 5. Governance Decisions Recorded This Session

| ID | Decision | Surface |
|---|---|---|
| **GD-9** | AgentOS task-lifecycle events | shell-contract v1.7 (+7 event types, +2 decision types) |
| **GD-10** | Classification boundary — UNCLASSIFIED-only processing | `sovereign-api-client` (no shell-contract change) |

---

## 6. Test Inventory

| Suite | Session 13 | Session 14 |
|---|---|---|
| sovereign-data | 43 | 43 |
| sovereign-api-client | 167 | **174** |
| module-counsel | 91 | 91 |
| module-scribe | 122 | 122 |
| module-vigil | 113 | 113 |
| module-lens | 58 | 58 |
| module-cpmi | 58 | 58 |
| **module-agentos** | — | **56** |
| **JS total** | 652 | **715** |
| Python | 127 | 127 |
| **Total** | 779 | **842** |

---

*SBOM Session 14 Update · June 24, 2026 · Autonomous Session · merge into master SBOM Registry · Pre-Decisional · Internal Working Document*
