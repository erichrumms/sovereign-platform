# SOVEREIGN Platform — SBOM Registry
## Version 1.16 | June 24, 2026
### Merged through Session 15

**Classification:** Pre-Decisional · Internal Working Document
**Base:** SBOM Registry v1.15 (through Session 14)
**Merged:** SBOM_Session15_Update.md (Session 15 — autonomous, D1 shell-contract v1.8
/ GD-11, D2 NEXUS module, D3b AgentOS non-approval edge, D4 evaluate.py port)

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
| `@sovereign/module-agentos` | 1.0.0 | **65** | +9 tests S15 (D3b +3, D4 +6) |
| **`@sovereign/module-nexus`** | **1.0.0** | **48** | **NEW — Session 15** |
| `sovereign-security` (Python) | — | 127 | Unchanged |

---

## Shell Contract

| Artifact | Version | SHA-256 | Status |
|---|---|---|---|
| `shell-contract.ts` (both copies) | **v1.8** | **`bcf9eeb176d7eed6c64088fc54af4a365a527bf1740432905db32030a99b841f`** | Changed Session 15 (GD-11) |

**Previous (v1.7, retired):** `07f48524…060634`

**v1.8 additions (GD-11):**
- `SovereignEventType`: `NEXUS_REQUEST_SUBMITTED`, `NEXUS_REQUEST_ROUTED`,
  `NEXUS_APPROVAL_PENDING`, `NEXUS_REQUEST_IN_PROGRESS`,
  `NEXUS_REQUEST_COMPLETE`, `NEXUS_REQUEST_REJECTED`
- No `HumanDecisionType` change — no shared-types propagation required

**GD-12 pre-approved (Integration Brief v1.22 §6):**
Next shell-contract change: v1.8 → v1.9, add `"Orchestration"` to `AgentClass` union
and loader `VALID_AGENT_CLASSES`. Unblocks AgentOS orchestrator AgentCard registration.

---

## New Source Components — Session 15

### `module-nexus/src/` (D2)
- `nexus-contract.ts`, `request-registry.ts`, `useRequestRegistry.ts`
- `request-router.ts`, `agentos-port.ts`
- `NexusApp.tsx`, `RequestIntakePanel.tsx`, `RequestQueuePanel.tsx`, `RequestDetailPanel.tsx`
- `index.ts` — AGENT_OPERATOR gate, empty agentCards

### `module-agentos/src/` (D3b + D4)
- `evaluate-port.ts` — injectable EvaluatePort + synthetic backing
- `useModelEvaluation.ts` — model evaluation hook

### Changed
- `module-agentos/src/agentos-contract.ts` — ASSIGNED→IN_PROGRESS edge (D3b)
- `module-agentos/src/AgentDispatchPanel.tsx` — non-approval dispatch (D3b)
- `sovereign-shell/src/register-modules.ts` — mounts nexusModule
- Root `package.json` — module-nexus workspace + test:nexus

---

## Test Totals — Cumulative

| Suite | S1–S14 | S15 | Total |
|---|---|---|---|
| sovereign-api-client | 174 | — | **174** |
| sovereign-data | 43 | — | **43** |
| module-counsel | 91 | — | **91** |
| module-scribe | 122 | — | **122** |
| module-vigil | 113 | — | **113** |
| module-lens | 58 | — | **58** |
| module-cpmi | 58 | — | **58** |
| module-agentos | 56 | +9 | **65** |
| module-nexus | — | +48 | **48** |
| **JS total** | 715 | +57 | **772** |
| Python | 127 | — | **127** |
| **Grand total** | 842 | +57 | **899** |

---

## Git History (Recent)

| Commit | Session | Description |
|---|---|---|
| `d2e8299` | S15 | D1 — Shell Contract v1.7 → v1.8 (GD-11) |
| `d5b9671` | S15 | D2 — NEXUS Module |
| `c3393af` | S15 | D3b — AgentOS non-approval edge |
| `7668683` | S15 | D4 — evaluate.py injectable port |
| `1075701` | S15 | docs — Session 15 Handoff + SBOM update |

**HEAD / origin/main: `1075701`**

---

*SOVEREIGN Platform SBOM Registry v1.16 · June 24, 2026*
*Pre-Decisional · Internal Working Document*
