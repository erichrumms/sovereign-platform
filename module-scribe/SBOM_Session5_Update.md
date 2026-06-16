# SOVEREIGN Platform — SBOM Update
## Session 5 — module-scribe + RTL/jsdom test toolchain
**Append to SBOM_Registry.md — Node.js / npm Dependencies table**

Date Added: June 16, 2026
Session: 5 (Stage 2 — COUNSEL Completion + RTL Test Layer + SCRIBE Scaffold)
Packages: `module-scribe` (new workspace) + `module-counsel` (test deps) + workspace root
Location in Monorepo: `module-scribe/`, `module-counsel/`, `/` (root `package.json`)

---

## New Production-Runtime npm Dependencies — Session 5

**None new to the platform.** `module-scribe` declares `react` / `react-dom` (the
already-declared platform UI stack, Session 2B) plus the internal workspace
packages `@sovereign/api-client` and `@sovereign/data`. No external runtime
dependency was introduced.

| Package | Version (exact installed) | Type | Product(s) | Purpose | License | Notes |
|---|---|---|---|---|---|---|
| react | 18.3.1 | npm (runtime) | sovereign-shell · module-counsel · module-scribe | SCRIBE React UI | MIT | already platform stack |
| react-dom | 18.3.1 | npm (runtime) | sovereign-shell · module-counsel · module-scribe | SCRIBE React mount (`createRoot`) | MIT | already platform stack |
| @sovereign/api-client | 1.0.0 (workspace) | internal | module-scribe | LLM provider abstraction (drafting engine, later session) | (internal) | workspace link |
| @sovereign/data | 1.0.0 (workspace) | internal | module-scribe | canonical SCRIBE mode output schemas | (internal) | workspace link |

## New Dev-Toolchain npm Dependencies — Session 5

React Testing Library + jsdom, added to enable component tests (Deliverable 2),
declared by both `module-counsel` and the new `module-scribe`. jest 29 / React 18
matched. Exact installed versions:

| Package | Version (exact installed) | Type | Product(s) | License |
|---|---|---|---|---|
| @testing-library/react | 16.3.2 | npm (devDep) | module-counsel · module-scribe | MIT |
| @testing-library/dom | 10.4.1 | npm (devDep) | module-counsel · module-scribe | MIT |
| @testing-library/jest-dom | 6.9.1 | npm (devDep) | module-counsel · module-scribe | MIT |
| jest-environment-jsdom | 29.7.0 | npm (devDep) | module-counsel · module-scribe | MIT |

`module-scribe` also declares the existing shared TS+Jest toolchain (jest, ts-jest,
typescript, @types/*) at the same versions recorded in the Session 4 SBOM update.

---

## Supply Chain Compliance Notes

- All Session 5 npm packages are MIT licensed — compatible with federal use and
  SOVEREIGN licensing. RTL / jsdom are OpenJS Foundation / U.S.-anchored governance.
  **No non-U.S.-controlled components introduced.**
- `npm audit --omit=dev` (production dependency tree): **0 vulnerabilities** — unchanged.
- **Dev-only advisories:** the RTL/jsdom toolchain introduces **19 moderate** npm
  advisories in the **dev** tree (transitive, test-time only — never shipped). Same
  class as the deferred esbuild GHSA-67mh-4wv8-2f99 dev advisory. Recommend review
  at the pre-production dependency pass (Stage 5+); not on the production runtime path.
- **No new external API services.** SCRIBE's only external call (the LLM, in the
  later drafting-engine session) will route exclusively through `@sovereign/api-client`.

---

## Files Produced — Session 5 (package inventory)

`module-scribe/` (new): `package.json`, `tsconfig.json`, `src/index.ts`,
`src/ScribeApp.tsx`, `src/modes.ts`, `src/prompts/drafting-system.prompt.ts`,
`prompts/drafting-system-v1.0.md`, `prompts/CHANGELOG.md`,
`tests/{modes,index,ScribeApp}.test.{ts,tsx}`, `tests/setup-dom.ts`, `tests/test-helpers.tsx`.

`module-counsel/` (additions): `src/{counter-contract,counter-engine,useCounterargument,
premortem-contract,premortem-engine,usePreMortem,decision-record,useDecisionRecord,
anthropic-key}.ts`, `src/{CounterargumentPanel,PreMortemStudio,DecisionRecordPanel}.tsx`,
`src/prompts/{counter-system,premortem-system}.prompt.ts`,
`prompts/{counter-system-v1.0,premortem-system-v1.0}.md`,
`tests/{counter-engine,premortem-engine,decision-record}.test.ts`,
`tests/{AnalysisPanel,CounterargumentPanel,PreMortemStudio,DecisionRecordPanel,CounselApp}.test.tsx`,
`tests/{setup-dom.ts,test-helpers.tsx,__mocks__/anthropic-key.ts}`; edits to
`CounselApp.tsx`, `AnalysisPanel.tsx`, `types.ts`, `index.ts`, `package.json`.

`/` (root): `package.json` (workspaces + test:scribe/test:counsel).
`sovereign-shell/`: `src/register-modules.ts` (registers scribeModule).

**Test/compile status:** `module-scribe` + `module-counsel` `tsc --noEmit` strict 0 errors.
Monorepo JS totals: data 27 · api-client 143 · module-counsel 91 · module-scribe 11 (272);
shell + both modules tsc 0 errors; `shell-contract.ts` SHA-256 unchanged.

---

*SOVEREIGN SBOM Update · Session 5 · June 16, 2026*
*Append to SBOM_Registry.md Session 5 section*
*Pre-Decisional · Internal Working Document*
