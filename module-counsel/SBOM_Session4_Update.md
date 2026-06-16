# SOVEREIGN Platform — SBOM Update
## Session 4 — module-counsel npm Dependencies (COUNSEL core)
**Append to SBOM_Registry.md — Node.js / npm Dependencies table**

Date Added: June 15, 2026
Session: 4 (Stage 2 — Workspace Linkage + COUNSEL Core)
Package: `module-counsel` (deps declared this session) + workspace root
Location in Monorepo: `module-counsel/`, `/` (root `package.json`)

---

## New Production-Runtime npm Dependencies — Session 4

**None new to the platform.** COUNSEL declares `react` and `react-dom` as runtime
dependencies, but these are the **already-declared** platform UI stack (introduced
for `sovereign-shell` in Session 2B); `module-counsel` now also declares them so it
resolves under npm workspaces. `@sovereign/api-client` and `@sovereign/data` are
internal workspace packages, not external dependencies.

| Package | Version (exact installed) | Type | Product(s) | Date Added | Purpose | License | Notes |
|---|---|---|---|---|---|---|---|
| react | 18.3.1 | npm (runtime) | sovereign-shell · module-counsel | (2B) declared by module-counsel 2026-06-15 | COUNSEL React UI | MIT | already platform stack |
| react-dom | 18.3.1 | npm (runtime) | sovereign-shell · module-counsel | (2B) declared by module-counsel 2026-06-15 | COUNSEL React mount (`createRoot`) | MIT | already platform stack |
| @sovereign/api-client | 1.0.0 (workspace) | internal | module-counsel | 2026-06-15 | LLM provider abstraction (`createSovereignClient`) | (internal) | workspace link |
| @sovereign/data | 1.0.0 (workspace) | internal | module-counsel | 2026-06-15 | canonical types + taxonomy | (internal) | workspace link |

## New Dev-Toolchain npm Dependencies — Session 4

The same TypeScript + Jest dev toolchain already used by `sovereign-data` /
`sovereign-api-client`, now declared by `module-counsel` (Node-env validator/logic
tests). Exact installed versions:

| Package | Version (exact installed) | Type | Product(s) | License |
|---|---|---|---|---|
| jest | 29.7.0 | npm (devDep) | module-counsel · sovereign-data · sovereign-api-client | MIT |
| ts-jest | 29.4.11 | npm (devDep) | module-counsel · sovereign-data · sovereign-api-client | MIT |
| @types/jest | 29.5.14 | npm (devDep) | module-counsel · sovereign-data | MIT |
| @types/react | 18.3.31 | npm (devDep) | module-counsel · sovereign-shell | MIT |
| @types/react-dom | 18.3.7 | npm (devDep) | module-counsel · sovereign-shell | MIT |
| typescript | 5.9.3 | npm (devDep) | all TS packages | Apache 2.0 |

Workspace root `package.json` (new) declares **no dependencies** — it is the npm
workspaces manifest only.

---

## Supply Chain Compliance Notes

- All Session 4 npm packages are MIT or Apache 2.0 licensed — compatible with
  federal use and SOVEREIGN licensing. **No non-U.S.-controlled components
  introduced.** (React — Meta / OpenJS; TypeScript — Microsoft; Jest/ts-jest —
  OpenJS / U.S.-anchored governance.)
- `npm audit --omit=dev` (production dependency tree): **0 vulnerabilities**.
- The GHSA-67mh-4wv8-2f99 esbuild dev-server advisory (Session 2B, via Vite in
  `sovereign-shell`) remains unremediated and deferred to the pre-production Vite
  review (Stage 5+). `module-counsel` does not depend on Vite directly.
- **No new external API services** introduced this session. COUNSEL's only external
  call (the LLM) routes exclusively through `@sovereign/api-client`
  (`createSovereignClient`); in synthetic/no-key runs it degrades to the static
  fallback tier (no outbound call).

---

## Files Produced — Session 4 (package inventory)

`module-counsel/`: `package.json` (deps + jest), `tsconfig.json` (jsx), `src/index.ts`,
`src/CounselApp.tsx`, `src/types.ts`, `src/frame-logic.ts`, `src/useDecisionFrame.ts`,
`src/DecisionFramer.tsx`, `src/analysis-contract.ts`, `src/analysis-engine.ts`,
`src/useAnalysis.ts`, `src/AnalysisPanel.tsx`, `src/prior-position.ts`,
`src/usePriorPositionCheck.ts`, `src/PriorPositionAlert.tsx`,
`src/prompts/analysis-system.prompt.ts`, `prompts/analysis-system-v1.0.md`,
`prompts/CHANGELOG.md`, `tests/{analysis-contract,frame-logic,analysis-engine,prior-position}.test.ts`.

`/` (root): `package.json` (workspaces).
`sovereign-data/`: `package.json` (exports), `src/shared-types.ts` (+HUMAN_DECISION_TYPES),
`src/index.ts`, `tests/shared-types.test.ts`.
`sovereign-api-client/`: `package.json` (exports).
`sovereign-shell/`: `src/shell.ts`, `src/module-loader/index.ts`, `src/register-modules.ts`.

**Test/compile status:** `module-counsel` `tsc --noEmit` strict 0 errors; **39 tests pass**.
Monorepo totals: pytest 127 · api-client 143 · data 27 · module-counsel 39; shell + counsel tsc 0 errors.

---

*SOVEREIGN SBOM Update · Session 4 · June 15, 2026*
*Append to SBOM_Registry.md Session 4 section*
*Pre-Decisional · Internal Working Document*
