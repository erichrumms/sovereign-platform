# SOVEREIGN Platform — SBOM Update
## Session 7 — module-lens scaffold (new workspace)
**Append to SBOM_Registry.md — Node.js / npm Dependencies table**

Date Added: June 18, 2026
Session: 7 (Stage 2 — VIGIL Core + LENS Scaffold)
Packages: `module-lens` (new workspace) + workspace root
Location in Monorepo: `module-lens/`, `/` (root `package.json`)

---

## New Production-Runtime npm Dependencies — Session 7 (module-lens)

**None new to the platform.** `module-lens` declares only `react` / `react-dom` (the
already-declared platform UI stack, Session 2B). The scaffold makes no LLM call (LENS core
deferred), defines no canonical entity, and its only cross-package reference is the
**types-only** `shell-contract.ts`.

| Package | Version (exact installed) | Type | Product(s) | Purpose | License | Notes |
|---|---|---|---|---|---|---|
| react | 18.3.1 | npm (runtime) | sovereign-shell · module-counsel · module-scribe · module-vigil · module-lens | LENS React UI | MIT | already platform stack |
| react-dom | 18.3.1 | npm (runtime) | sovereign-shell · module-counsel · module-scribe · module-vigil · module-lens | LENS React mount (`createRoot`) | MIT | already platform stack |

`module-lens` does **not** declare `@sovereign/api-client` or `@sovereign/data`: the
scaffold makes no LLM call and defines no canonical entity. These link when LENS core is
built (a dependency addition, like VIGIL's this session — not a new platform package).

## New Dev-Toolchain npm Dependencies — Session 7 (module-lens)

**None new to the platform.** `module-lens` declares the same shared TS + Jest + RTL/jsdom
toolchain already recorded (Session 5/6 SBOM updates), at identical versions:

| Package | Version (exact installed) | Type | Product(s) | License |
|---|---|---|---|---|
| @testing-library/react | 16.3.2 | npm (devDep) | module-lens (+ counsel/scribe/vigil) | MIT |
| @testing-library/dom | 10.4.1 | npm (devDep) | module-lens (+ counsel/scribe/vigil) | MIT |
| @testing-library/jest-dom | 6.9.1 | npm (devDep) | module-lens (+ counsel/scribe/vigil) | MIT |
| jest-environment-jsdom | 29.7.0 | npm (devDep) | module-lens (+ counsel/scribe/vigil) | MIT |
| jest / ts-jest / typescript / @types/jest / @types/react / @types/react-dom | 29.x / 29.x / 5.9.3 / 29.5.x / 18.3.x / 18.3.x | npm (devDep) | module-lens | MIT / Apache 2.0 |

---

## Supply Chain Compliance Notes

- **No new packages introduced** (production or dev) — `module-lens` reuses the existing
  platform stack only. No non-U.S.-controlled components introduced.
- `npm install` linked the new `module-lens` workspace (symlink `node_modules/@sovereign/module-lens`); `npm audit --omit=dev`: **0 vulnerabilities** — unchanged.
- **Dev-only advisories:** unchanged (RTL/jsdom + esbuild/Vite, transitive/test-time only). `module-lens` adds no new advisory class.
- **No new external API services.** LENS core (the only LENS LLM call) is a later session and will route exclusively through `@sovereign/api-client`.

---

## Files Produced — Session 7 (module-lens inventory)

`module-lens/` (new): `package.json`, `tsconfig.json`, `src/index.ts`, `src/LensApp.tsx`,
`prompts/explainer-system-v1.0.md` (PR-LENS-001, PENDING), `prompts/CHANGELOG.md`,
`tests/{index,LensApp}.test.{ts,tsx}`, `tests/setup-dom.ts`, `tests/test-helpers.tsx`.
`/` (root): `package.json` (workspaces + test:lens), `package-lock.json` (workspace link).
`sovereign-shell/`: `src/register-modules.ts` (registers lensModule).
`Agent_Identity_Standard.md`: Companion Suite section (lens-explainer / lens-orientation, + catch-up).

**Test/compile status:** `module-lens` `tsc --noEmit` strict 0 errors; **9 tests**; shell
`tsc --noEmit` 0 errors (now compiles module-lens via register-modules). Monorepo JS totals:
data 27 · api-client 143 · module-counsel 91 · module-scribe 86 · module-vigil 63 ·
module-lens 9 (**419**); `shell-contract.ts` SHA-256 `4d78754f…6836acc2` unchanged (both copies), v1.3.

---

*SOVEREIGN SBOM Update · Session 7 · June 18, 2026 · module-lens*
*Append to SBOM_Registry.md Session 7 section (with module-vigil/SBOM_Session7_Update.md)*
*Pre-Decisional · Internal Working Document*
