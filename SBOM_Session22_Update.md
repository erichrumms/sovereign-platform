# SOVEREIGN Platform — SBOM Session 22 Update

**Session:** 22
**Date:** June 29, 2026
**Merge basis for:** SBOM Registry v1.23 (to be merged from this update)
**Supersedes baseline:** SBOM Registry v1.22 (merged through Session 21)
**HEAD at close:** cfb6b02
**Classification:** Pre-Decisional · Internal Working Document

---

## 1. Shell Contract Version History (update)

| Version | GD | Date | SHA-256 | Status |
|---|---|---|---|---|
| v1.13 | GD-18 | June 26, 2026 | `2a3f0b9d8f390c30e23816e4e928cbcd02ccd59f765294f8ed247d9c75d18569` | Retired (Session 22) |
| **v1.14** | **GD-19** | **June 29, 2026** | **`2b3d8674c5d350e81324a3eb9b81568fe378dfa1784025bbf898756ef17e9910`** | **CURRENT — hash of record for Session 23** |

Both copies (`shell-contract.ts`, `sovereign-shell/shell-contract.ts`) verified byte-identical at
v1.14.

---

## 2. Governance Decision — GD-19 APPLIED

| GD | Session | Status | Description | Contract |
|---|---|---|---|---|
| **GD-19** | **22** | **APPLIED** | `TaskSurface` + `SharedTask` types (+ `SharedTaskStatus`). `taskSurface` added as the **ninth** shell export. Shell context 8→9 exports; Standing Constraint #7 formally relaxed for this one addition. Enables the NEXUS→AgentOS UI convergence (Item 57). Additive only — no event/decision/product/role/agent-class change; no shared-types or Python-logger propagation. Impact: module-nexus + module-agentos. | v1.14 |

---

## 3. Test Suite Registry (Session 22 close)

| Suite | v1.22 baseline | Δ | Session 22 total | Notes |
|---|---|---|---|---|
| sovereign-security (Python) | 142 | — | **142** | Unchanged |
| sovereign-api-client | 174 | — | **174** | Unchanged |
| sovereign-data | 43 | — | **43** | Unchanged |
| module-counsel | 91 | — | **91** | Unchanged |
| module-scribe | 122 | — | **122** | Unchanged |
| module-vigil | 113 | — | **113** | Unchanged |
| module-lens | 58 | — | **58** | Unchanged |
| module-cpmi | 58 | — | **58** | Unchanged |
| module-agentos | 86 | **+3** | **89** | D2 convergence suite (`nexus-agentos-convergence.test.tsx`) |
| module-nexus | 52 | — | **52** | `NexusApp.test.tsx` updated (AGENTOS_TASK_ASSIGNED in trail) — count unchanged |
| module-apex | 97 | — | **97** | Unchanged |
| module-flowpath | 93 | **+5** | **98** | WC-1…WC-5 test changes (SessionManager +4, FlowpathApp +1, ElicitationDialogue −1, IndividualWorkstyle +1) |
| **module-aria** | 0 | **+17** | **17** | **NEW** (D4 scaffold) |
| e2e | 6 | — | **6** | Unchanged (Scenario 5 still exercises the live AgentOS task) |

- **JS total:** 993 → **1018** (+25).
- **Python total:** **142** (unchanged).
- **Grand total:** **1160** tests passing · 0 failures · 0 regressions.

Close gates: `tsc --noEmit` 0 errors across all modules + shell; `npm audit --omit=dev` **0
production vulnerabilities**.

---

## 4. New Components (Session 22)

| Component | Path | Purpose |
|---|---|---|
| Agent Audit Report | `SOVEREIGN_Agent_Audit_20260629.md` | D0 — registry-vs-codebase reconciliation, 36-agent roster, findings |
| **module-aria** (workspace) | `module-aria/` | Stage 6 scaffold — ARIA Suite (compliance/traceability/regulatory-impact) |
| ARIA composition root | `module-aria/src/AriaApp.tsx` | Routes CLEAR / TRACER / ARC placeholder panels |
| ARIA banners | `module-aria/src/banners.tsx` | `contentCardStyle` + Gap 6 categories (blue/amber/primary) + ARIA determinism notice |
| ARIA module contract | `module-aria/src/index.ts` | `SovereignModuleContract`, PLATFORM_ADMIN gate, `aria.rules-engine` AgentCard (Governance) |
| ARIA package/tsconfig/tests | `module-aria/package.json`, `tsconfig.json`, `tests/*` | Workspace + 17 tests (`AriaApp.test.tsx`, `index.test.ts`) |
| NEXUS→AgentOS convergence test | `module-agentos/tests/nexus-agentos-convergence.test.tsx` | D2 — proves a NEXUS hand-off appears in the AgentOS panel |

### Agent registry impact
- `aria.rules-engine` — **now carded** in code (`module-aria/src/index.ts`); class `Governance`,
  deterministic, no prompt, no `sovereign-api-client` call. Still the same single ARIA agent
  registered in `Agent_Identity_Standard.md`. Verified agent count unchanged at **36**.

---

## 5. Changed Components (Session 22)

| Component | Path | Change |
|---|---|---|
| Shell contract (×2 copies) | `shell-contract.ts`, `sovereign-shell/shell-contract.ts` | v1.14 — `taskSurface` ninth export + `SharedTask`/`TaskSurface`/`SharedTaskStatus` types |
| Shell composition root | `sovereign-shell/src/shell.ts` | `ShellTaskSurface` implementation of the ninth export |
| Module registration | `sovereign-shell/src/register-modules.ts` | Registers `ariaModule` |
| Root manifest | `package.json` | `module-aria` workspace + `test:aria` script |
| AgentOS task contract | `module-agentos/src/agentos-contract.ts` | `TaskStatus` aliases `SharedTaskStatus`; `Task` gains optional `origin_product`/`origin_request_id` |
| AgentOS live port | `module-agentos/src/nexus-agentos-port.ts` | Publishes each NEXUS task to `ctx.taskSurface` |
| AgentOS task hook | `module-agentos/src/useTaskRegistry.ts` | Subscribes to the surface; merges external tasks (loop-safe bail-out) |
| AgentOS registry panel | `module-agentos/src/TaskRegistryPanel.tsx` | Provenance tag + no local Cancel for NEXUS-owned tasks |
| AgentOS test helpers | `module-agentos/tests/test-helpers.tsx` | In-memory `taskSurface` |
| NEXUS composition root | `module-nexus/src/NexusApp.tsx` | Wires the live `createAgentOSBackedPort` |
| e2e harness | `e2e/tests/harness.tsx` | `taskSurface` in `makeCtx` |
| FLOWPATH Screen 1 | `module-flowpath/src/SessionManager.tsx` | WC-1 clickable cards · WC-2 visual distinction |
| FLOWPATH root | `module-flowpath/src/FlowpathApp.tsx` | WC-1 `onOpenSession` → Artifact Review |
| FLOWPATH Screen 2 | `module-flowpath/src/ElicitationDialogue.tsx` | WC-3 gate notice only after a produce attempt · WC-4 questions rewritten |
| FLOWPATH Screen 4 | `module-flowpath/src/IndividualWorkstyle.tsx` | WC-5 workstyle question 3 rewritten |

---

## 6. Carry-Forward Notes

- **Hash of record for Session 23:** `2b3d8674c5d350e81324a3eb9b81568fe378dfa1784025bbf898756ef17e9910`.
- **Verified agent count: 36** (re-verify in-file each session — Lesson 12).
- **F-2 (open, non-blocking):** 8 registered agents (2 NEXUS + 6 AgentOS core) are
  implemented-but-not-carded — known design state, not a Constraint #10 violation.
- ARIA Suite CLEAR/TRACER/ARC core logic: Sessions 23–25 (docs/16 §9). PPBE: future scope.
- Integration Brief v1.32 flags: see `SOVEREIGN_Session22_Handoff.md` §9.

---

*SBOM Session 22 Update · June 29, 2026 · Build Agent (Claude Code)*
*Pre-Decisional · Internal Working Document*
