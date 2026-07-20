# SOVEREIGN Platform — SBOM Update, Session 44
**Date:** 2026-07-19  
**Session:** 44  
**Governance Document:** GD-23  
**Commit:** 3f0db9d

---

## New Components

| Component | Type | Location | Introduced |
|---|---|---|---|
| `ProgramStatusSnapshot` | Interface (shell-contract) | `shell-contract.ts`, `sovereign-shell/shell-contract.ts` | GD-23 / v1.18 |
| `ProgramStatusSurface` | Interface (shell-contract) | `shell-contract.ts`, `sovereign-shell/shell-contract.ts` | GD-23 / v1.18 |
| `ShellProgramStatusSurface` | Class (shell runtime) | `sovereign-shell/src/shell.ts` | GD-23 |
| `statusFromObligationRate` | Pure function (APEX) | `module-apex/src/ppbe-dashboard.ts` | GD-23 |
| `publishProgramStatuses` | Function (APEX) | `module-apex/src/ppbe-dashboard.ts` | GD-23 |
| `createInMemoryProgramStatusSurface` | Test helper | `e2e/tests/harness.tsx`, `module-apex/tests/test-helpers.tsx` | GD-23 |
| `apex-vigil-program-status-convergence.test.ts` | E2E convergence test | `e2e/tests/` | GD-23 (D4) |

---

## Modified Components

| Component | Location | Change |
|---|---|---|
| `SovereignShellContext` | `shell-contract.ts` | Added `programStatusSurface: ProgramStatusSurface` (11th export) |
| `SovereignShell` | `sovereign-shell/src/shell.ts` | Added `programStatusSurface` field; instantiates `ShellProgramStatusSurface` in constructor |
| `ApexApp` | `module-apex/src/ApexApp.tsx` | Added `useEffect` to publish program statuses on mount |
| `BriefDeps` | `module-vigil/src/approval-engine.ts` | Added optional `programStatusSurface?: ProgramStatusSurface` |
| `staticBrief` | `module-vigil/src/approval-engine.ts` | Added optional `programStatusSurface` parameter; forwarded to `describeWhatChanges` |
| `describeWhatChanges` | `module-vigil/src/approval-engine.ts` | `ppbe_obligation` case appends program narrative when snapshot available |
| `runApprovalBrief` | `module-vigil/src/approval-engine.ts` | Tier 3 (static) call forwards `deps.programStatusSurface` |
| `makeCtx` (APEX tests) | `module-apex/tests/test-helpers.tsx` | Added `programStatusSurface` field |
| `makeCtx` (e2e harness) | `e2e/tests/harness.tsx` | Added `programStatusSurface` field |

---

## Shell-Contract Version History

| Version | Session | Change |
|---|---|---|
| v1.18 | 44 | GD-23: ProgramStatusSnapshot, ProgramStatusSurface, 11th SovereignShellContext export |
| v1.17 | 43 | GD-22: AriaCertificationSurface, 10th SovereignShellContext export |
| v1.16 | prior | TaskSurface (9th export) |

---

## No New External Dependencies

GD-23 introduces no new npm packages, no new API integrations, and no new runtime dependencies. All new types are in-memory, shell-owned, and cleared per session lifetime (matching the TaskSurface and AriaCertificationSurface patterns).

---

## Constraint Compliance

- **Constraint #7** (export count): Shell context now exports eleven fields. Section 7 comment updated in both shell-contract copies.
- **Constraint #11** (SHA identity): Both copies SHA `a03d4b21ffdae3621d82d8378e5cd5cb8b2b09800719cca602ef1f03efdec7c7`.
- **Constraint #5** (LLM routing): No new LLM calls. `staticBrief` is pure string assembly.
