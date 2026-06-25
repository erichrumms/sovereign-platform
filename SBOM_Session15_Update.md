# SBOM Session 15 Update — SOVEREIGN Platform
## June 24, 2026 · merges into SBOM Registry · AUTONOMOUS SESSION

**Classification:** Pre-Decisional · Internal Working Document
**Scope:** Components added/changed in Session 15 (D1 shell-contract v1.8 / GD-11,
D2 NEXUS module, D3b AgentOS non-approval edge, D4 evaluate.py injectable port). For
merge into the master SBOM Registry.

---

## 1. Third-Party Dependencies

**No new third-party dependencies.** `module-nexus` reuses the same React / Jest /
ts-jest / testing-library stack as the other modules (already in the lockfile via npm
workspaces). `npm audit --omit=dev`: **0 production vulnerabilities.**

---

## 2. Contract / Data-Dictionary Versions

| Artifact | Status |
|---|---|
| `shell-contract.ts` | **v1.7 → v1.8 (GD-11).** SHA `bcf9eeb176d7eed6c64088fc54af4a365a527bf1740432905db32030a99b841f` — both copies identical. +6 `SovereignEventType` (`NEXUS_REQUEST_SUBMITTED`, `NEXUS_REQUEST_ROUTED`, `NEXUS_APPROVAL_PENDING`, `NEXUS_REQUEST_IN_PROGRESS`, `NEXUS_REQUEST_COMPLETE`, `NEXUS_REQUEST_REJECTED`). No `HumanDecisionType` change. Retires v1.7 `07f48524…060634`. |
| `sovereign-data/src/shared-types.ts` | **Unchanged** (43 tests) — GD-11 makes no `HumanDecisionType` change, so no shared-types propagation is required. |

---

## 3. New / Changed Source Components

### `module-nexus/src` (D2 — new workspace package)
| File | Purpose |
|---|---|
| `nexus-contract.ts` | `WorkRequest`, 5 `WorkRequestType`, 6-status lifecycle, `ALLOWED_TRANSITIONS`, GD-11 event mapping, `requestWorkflowStep`, validation. |
| `request-router.ts` | type → agent class + approval requirement (the routing table). |
| `request-registry.ts` | pure work-request state machine; `RequestTransitionError` / `RequestNotFoundError`. |
| `useRequestRegistry.ts` | state + GD-11 Logger emission (Gate-2 fail-closed); GD-10 intake check; AgentOS port hand-off on IN_PROGRESS; ref-backed. |
| `agentos-port.ts` | injectable `AgentOSPort` + synthetic backing (`submitTask` → task_id, `getTaskStatus` → AgentOS `TaskStatus`). |
| `NexusApp.tsx`, `RequestIntakePanel.tsx`, `RequestQueuePanel.tsx`, `RequestDetailPanel.tsx` | tabbed UI; Gate-1 AI disclosure; GD-10 boundary in the UI. |
| `index.ts` | `SovereignModuleContract`, fail-closed `AGENT_OPERATOR` gate, empty `agentCards`. |

### `module-agentos/src` (D3b + D4)
| File | Change |
|---|---|
| `agentos-contract.ts` | D3b — `ALLOWED_TRANSITIONS.ASSIGNED += IN_PROGRESS` (requires_approval=false path). |
| `AgentDispatchPanel.tsx` | D3b — non-approval dispatch assigns then starts directly. |
| `evaluate-port.ts` | D4 — injectable `EvaluatePort` + synthetic backing (CPMI-VRS validation), `canPromote`. |
| `useModelEvaluation.ts` | D4 — hook wrapping the evaluate port. |

**Changed (wiring):** `sovereign-shell/src/register-modules.ts` (registers `nexusModule`); root `package.json` (`module-nexus` workspace + `test:nexus`).

---

## 4. Governance Decisions Recorded This Session

| ID | Decision | Surface |
|---|---|---|
| **GD-11** | NEXUS work-request lifecycle events | shell-contract v1.8 (+6 event types) |

---

## 5. Agent / Prompt Registry Delta

- **None.** No new agents, no new prompts. `module-nexus.agentCards` is empty (NEXUS routes
  to AgentOS-orchestrated agent classes; it owns no agents). **D3a deferred** — the three
  AgentOS orchestrator agents in `Agent_Identity_Standard.md v1.3` are class "Orchestration",
  which is not in the shell-contract `AgentClass` union; registering their AgentCards needs a
  future shell-contract GD (see Session 15 Handoff §G).

---

## 6. Open Items Surfaced (for governance)

1. **"Orchestration" AgentClass** — add to shell-contract `AgentClass` + loader `VALID_AGENT_CLASSES` (a GD) to unblock AgentOS orchestrator AgentCard registration.
2. **`docs/12_NEXUS_Architecture.md`** — author for the record (NEXUS was built from the opening prompt's inline spec).
3. **`evaluate.py`** — author the CPMI-VRS evaluation pipeline + an evaluation event type (GD); then wire AgentOS's `evaluate-port.ts` live backing.

---

## 7. Test Inventory

| Suite | Session 14 | Session 15 |
|---|---|---|
| sovereign-data | 43 | 43 |
| sovereign-api-client | 174 | 174 |
| module-counsel | 91 | 91 |
| module-scribe | 122 | 122 |
| module-vigil | 113 | 113 |
| module-lens | 58 | 58 |
| module-cpmi | 58 | 58 |
| module-agentos | 56 | **65** |
| **module-nexus** | — | **48** |
| **JS total** | 715 | **772** |
| Python | 127 | 127 |
| **Total** | 842 | **899** |

---

*SBOM Session 15 Update · June 24, 2026 · Autonomous Session · merge into master SBOM Registry · Pre-Decisional · Internal Working Document*
