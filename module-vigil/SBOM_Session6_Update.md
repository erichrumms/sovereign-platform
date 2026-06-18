# SOVEREIGN Platform — SBOM Update
## Session 6 — SCRIBE core (Drafting Engine + Style DNA) + module-vigil scaffold
**Append to SBOM_Registry.md — Node.js / npm Dependencies table**

Date Added: June 17, 2026
Session: 6 (Stage 2 — SCRIBE Drafting Engine + Style DNA + VIGIL Scaffold)
Packages: `module-vigil` (new workspace) + `module-scribe` (additions) + workspace root
Location in Monorepo: `module-vigil/`, `module-scribe/`, `/` (root `package.json`)

---

## New Production-Runtime npm Dependencies — Session 6

**None new to the platform.** `module-vigil` declares only `react` / `react-dom`
(the already-declared platform UI stack, Session 2B). The SCRIBE core (D1/D2)
introduced no new dependency — it uses the already-linked workspace packages
`@sovereign/api-client` and `@sovereign/data` and the existing React stack.

| Package | Version (exact installed) | Type | Product(s) | Purpose | License | Notes |
|---|---|---|---|---|---|---|
| react | 18.3.1 | npm (runtime) | sovereign-shell · module-counsel · module-scribe · module-vigil | VIGIL React UI | MIT | already platform stack |
| react-dom | 18.3.1 | npm (runtime) | sovereign-shell · module-counsel · module-scribe · module-vigil | VIGIL React mount (`createRoot`) | MIT | already platform stack |

`module-vigil` does **not** declare `@sovereign/api-client` or `@sovereign/data`:
the scaffold makes no LLM call (triage deferred, `agentCards: []`) and defines no
canonical entity. Its only cross-package reference is the **types-only**
`shell-contract.ts` plus a single **runtime** import of the canonical
`ModuleAccessDeniedError` from the shell's module-loader (a relative source
reference, not an npm dependency — see handoff for the rationale).

## New Dev-Toolchain npm Dependencies — Session 6

**None new to the platform.** `module-vigil` declares the same shared TS+Jest+RTL/jsdom
toolchain already recorded in the Session 5 SBOM update, at identical versions:

| Package | Version (exact installed) | Type | Product(s) | License |
|---|---|---|---|---|
| @testing-library/react | 16.3.2 | npm (devDep) | module-vigil (+ counsel/scribe) | MIT |
| @testing-library/dom | 10.4.1 | npm (devDep) | module-vigil (+ counsel/scribe) | MIT |
| @testing-library/jest-dom | 6.9.1 | npm (devDep) | module-vigil (+ counsel/scribe) | MIT |
| jest-environment-jsdom | 29.7.0 | npm (devDep) | module-vigil (+ counsel/scribe) | MIT |
| jest / ts-jest / typescript / @types/jest / @types/react / @types/react-dom | 29.x / 29.x / 5.9.3 / 29.5.x / 18.3.x / 18.3.x | npm (devDep) | module-vigil | MIT / Apache 2.0 |

---

## Supply Chain Compliance Notes

- **No new packages introduced this session** (production or dev) — Session 6 reuses
  the existing platform stack only. No non-U.S.-controlled components introduced.
- `npm audit --omit=dev` (production dependency tree): **0 vulnerabilities** — unchanged.
- **Dev-only advisories:** unchanged from Session 5 (the RTL/jsdom + esbuild/Vite dev
  advisories; transitive, test/dev-time only, never shipped). `module-vigil` adds no
  new advisory class. Review at the pre-production dependency pass (Stage 5+).
- **No new external API services.** The VIGIL Anomaly Triage Assistant (the only VIGIL
  LLM call) is a later session and will route exclusively through `@sovereign/api-client`.
  The SCRIBE drafting + Style DNA LLM calls (D1/D2) route through `@sovereign/api-client`
  only — no direct provider call.

---

## Files Produced — Session 6 (package inventory)

`module-vigil/` (new): `package.json`, `tsconfig.json`, `src/index.ts`,
`src/VigilApp.tsx`, `src/AlertQueue.tsx`, `src/AgentApprovalQueue.tsx`, `src/config.ts`,
`prompts/triage-system-v1.0.md`, `prompts/CHANGELOG.md`,
`tests/{index,VigilApp}.test.{ts,tsx}`, `tests/setup-dom.ts`, `tests/test-helpers.tsx`.

`module-scribe/` (D1/D2 additions): `src/{draft-contract,draft-engine,useDraft,
useExport,anthropic-key,style-contract,style-engine,useStyleProfile}.ts`,
`src/{DraftWorkspace,StyleDNAManager}.tsx`,
`src/prompts/style-analysis-system.prompt.ts`,
`prompts/style-analysis-system-v1.0.md`,
`tests/{draft-contract,draft-engine,style-contract,style-engine}.test.ts`,
`tests/{DraftWorkspace,StyleDNAManager}.test.tsx`, `tests/__mocks__/anthropic-key.ts`;
edits to `ScribeApp.tsx`, `prompts/CHANGELOG.md`, `package.json`, `tests/{test-helpers,ScribeApp}`.

`/` (root): `package.json` (workspaces + test:vigil).
`sovereign-shell/`: `src/register-modules.ts` (registers vigilModule).

**Test/compile status:** `module-scribe` + `module-vigil` + `module-counsel`
`tsc --noEmit` strict 0 errors; shell `tsc --noEmit` 0 errors (now compiles
module-vigil via register-modules). Monorepo JS totals: data 27 · api-client 143 ·
module-counsel 91 · module-scribe 86 · module-vigil 17 (**364**); `shell-contract.ts`
SHA-256 `4d78754f…6836acc2` unchanged (both copies), v1.3.

---

*SOVEREIGN SBOM Update · Session 6 · June 17, 2026*
*Append to SBOM_Registry.md Session 6 section*
*Pre-Decisional · Internal Working Document*
