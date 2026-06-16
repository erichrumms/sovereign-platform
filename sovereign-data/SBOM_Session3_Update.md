# SOVEREIGN Platform — SBOM Update
## Session 3 — sovereign-data npm Dependencies
**Append to SBOM_Registry.md — Node.js / npm Dependencies table**

Date Added: June 13, 2026
Session: 3 (Stage 2 — Companion Suite Foundation)
Package: `sovereign-data` (new)
Location in Monorepo: `sovereign-data/`

---

## New npm Dependencies — Session 3

The `sovereign-data` package introduces **no new production-runtime npm
dependencies** (`"dependencies": {}`). It adds the same TypeScript + Jest dev
toolchain already used by `sovereign-api-client` (Session 2A). Versions below are
the exact installed versions in `sovereign-data/package-lock.json`.

| Package | Version (exact installed) | Type | Product(s) | Date Added | Purpose | License | Installed |
|---|---|---|---|---|---|---|---|
| typescript | 5.9.3 | npm (devDep) | sovereign-data · sovereign-shell · sovereign-api-client | 2026-06-13 | TypeScript compiler — strict compile of entities/schemas/StyleProfile | Apache 2.0 | ✓ 2026-06-13 (shared toolchain version, already recorded 2A/2B) |
| jest | 29.7.0 | npm (devDep) | sovereign-data · sovereign-api-client | 2026-06-13 | Unit test runner (StyleProfile + entity validators) | MIT | ✓ 2026-06-13 |
| ts-jest | 29.4.11 | npm (devDep) | sovereign-data · sovereign-api-client | 2026-06-13 | TypeScript preset for Jest | MIT | ✓ 2026-06-13 |
| @types/jest | 29.5.14 | npm (devDep) | sovereign-data | 2026-06-13 | TypeScript type definitions for Jest | MIT | ✓ 2026-06-13 |
| @types/node | 20.19.43 | npm (devDep) | sovereign-data | 2026-06-13 | Node 20 type definitions | MIT | ✓ 2026-06-13 |

Transitive dependencies: **280 packages added (audited 281)**. Full lockfile
recorded in `sovereign-data/package-lock.json` — the authoritative transitive
inventory. `npm install` reported **0 vulnerabilities**.

---

## Production Runtime Dependencies — Session 3

**None.** `sovereign-data` ships zero production-runtime npm dependencies; it is a
pure TypeScript types + validation package. No new external API services were
introduced this session.

`module-counsel` (also new this session) declares **no dependencies** at all
(`"dependencies": {}`, `"devDependencies": {}`): its scaffold imports only TYPES
from the shared shell-contract and renders via `el.innerHTML`.

---

## Python Environment Note (test execution, not a platform dependency change)

The Session 3 monorepo health check ran the Security Framework's existing 127-test
suite. This machine had none of the framework's already-declared Python runtime
dependencies installed, so they were installed into the local user environment
(`pip install --user`) purely to execute the existing tests:

`pytest`, `structlog`, `pyyaml`, `scikit-learn`, `joblib`, `numpy`, `requests`.

These are the Security Framework's **already-declared** stack (system_prompt.md /
prior SBOM), not new platform packages. `pytest` is a test-only runner. No change
to the platform's declared Python dependency set; recorded here for traceability.

---

## Supply Chain Compliance Notes

- All Session 3 npm devDeps are MIT or Apache 2.0 licensed — compatible with
  federal use and SOVEREIGN licensing. **No non-U.S.-controlled components
  introduced.** (TypeScript — Microsoft; Jest/ts-jest — OpenJS / U.S.-anchored
  governance.)
- `sovereign-data`: **0 npm vulnerabilities** at install. It does not depend on
  Vite/esbuild, so the GHSA-67mh-4wv8-2f99 dev-server advisory (Session 2B,
  sovereign-shell) does not apply to this package. That advisory remains
  unremediated and deferred to the pre-production Vite review (Stage 5+).

---

## Files Produced — Session 3 (package inventory)

`sovereign-data/`: `package.json`, `tsconfig.json`, `src/index.ts`,
`src/shared-types.ts`, `src/entities/{style-profile,employee,program,cost-code,document,vendor}.ts`,
`src/schemas/scribe-modes.ts`, `tests/{style-profile,entities}.test.ts`.

`sovereign-shell/`: `index.html`, `src/main.tsx`, `src/register-modules.ts` (no
new npm deps — uses the existing React/Vite toolchain from Session 2B).

`module-counsel/`: `package.json`, `tsconfig.json`, `src/index.ts` (no npm deps).

**Test/compile status: `sovereign-data` `tsc --noEmit` strict 0 errors; 23 tests pass.**

---

*SOVEREIGN SBOM Update · Session 3 · June 13, 2026*
*Append to SBOM_Registry.md Session 3 section*
*Pre-Decisional · Internal Working Document*
