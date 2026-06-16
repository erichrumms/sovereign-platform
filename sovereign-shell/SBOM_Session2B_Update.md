# SOVEREIGN Platform — SBOM Update
## Session 2B — sovereign-shell npm Dependencies
**Append to SBOM_Registry.md — Node.js / npm Dependencies table**

Date Added: June 2, 2026
Session: 2B
Package: `sovereign-shell`
Location in Monorepo: `sovereign-shell/`

---

## New npm Dependencies — Session 2B

The shell host application introduces the platform's first **production runtime**
npm dependencies (React + React-DOM) and its React/Vite build toolchain. These
were documented as "Pending Stage 1" in the Session 0 baseline registry; this
session flips them to **installed** with exact versions.

| Package | Version (exact installed) | Type | Product(s) | Date Added | Purpose | License | Installed |
|---|---|---|---|---|---|---|---|
| react | 18.3.1 | npm (runtime) | sovereign-shell · all modules | 2026-06-02 | UI component framework — shell host and module surfaces | MIT | ✓ 2026-06-02 |
| react-dom | 18.3.1 | npm (runtime) | sovereign-shell · all modules | 2026-06-02 | React DOM renderer for the shell host | MIT | ✓ 2026-06-02 |
| @types/react | 18.3.30 | npm (devDep) | sovereign-shell | 2026-06-02 | TypeScript type definitions for React 18 | MIT | ✓ 2026-06-02 |
| @types/react-dom | 18.3.7 | npm (devDep) | sovereign-shell | 2026-06-02 | TypeScript type definitions for React-DOM 18 | MIT | ✓ 2026-06-02 |
| @vitejs/plugin-react | 4.7.0 | npm (devDep) | sovereign-shell | 2026-06-02 | Vite plugin — React Fast Refresh + JSX transform | MIT | ✓ 2026-06-02 |
| vite | 5.4.21 | npm (devDep) | sovereign-shell · NEXUS frontend | 2026-06-02 | Build tool and dev server (Vite 5) | MIT | ✓ 2026-06-02 |
| typescript | 5.9.3 | npm (devDep) | sovereign-shell · sovereign-api-client | 2026-06-02 | TypeScript compiler — strict compile against shell-contract.ts | Apache 2.0 | ✓ 2026-06-02 (already installed Session 2A) |

> `typescript` 5.9.3 was already recorded in the Session 2A SBOM update; it is
> repeated here only to note that the shell package also depends on it. It is a
> single shared toolchain version, not a duplicate install.

Transitive dependencies: 67 packages added (audited 68). Full lockfile recorded
in `sovereign-shell/package-lock.json` — the authoritative transitive inventory.

---

## Production Runtime Dependencies — Session 2B

| Dependency | Notes |
|---|---|
| `react` 18.3.1 | First production runtime npm dependency in the platform. Shell host + all module UIs. |
| `react-dom` 18.3.1 | Production runtime — DOM renderer. |

The shell does **not** depend on `@sovereign/api-client`: `SovereignShellContext`
(shell-contract v1.0, Decision 18 — eight exports, complete list) exposes no LLM
client slot. Modules call `createSovereignClient()` from `@sovereign/api-client`
themselves per the Integration Brief §6 standing constraint. No new external API
services were introduced this session.

---

## Supply Chain Compliance Notes

- All seven packages are MIT or Apache 2.0 licensed — compatible with federal use
  and SOVEREIGN licensing.
- React / React-DOM are maintained by Meta (U.S.) under open-source governance.
  Vite and @vitejs/plugin-react are maintained by the Vite team (OpenJS / VoidZero,
  U.S.-anchored governance). TypeScript is maintained by Microsoft (U.S.).
  **No non-U.S.-controlled components introduced.**

### Known Advisory — Recorded, Not Remediated This Session

`npm audit` reports **2 moderate** advisories, both originating from `esbuild`
(≤0.24.2), pulled in transitively by `vite` 5.x:

- **GHSA-67mh-4wv8-2f99** — esbuild allows any website to send requests to the
  esbuild **development server** and read the response.

Assessment:
- **Scope is the local development server only.** It does not affect any built
  artifact or production runtime path. The shell is deployed as static assets +
  module backends behind the shell ATO boundary; the esbuild dev server is never
  deployed.
- The only `npm audit fix --force` remedy upgrades to **vite 8** — a breaking
  change that violates the Session 2B done condition (Vite 5) and the Session 0
  baseline.

Decision: **not remediated this session.** Recorded here for traceability. The
GovCloud / production build pipeline (Stage 5+) does not expose the esbuild dev
server; revisit at the Vite major-version review before production hardening.

---

## Files Produced — Session 2B

| File | Type | Location in Monorepo | Purpose |
|---|---|---|---|
| `shell-contract.ts` | TypeScript governance doc | `sovereign-shell/shell-contract.ts` | Canonical-home copy of approved v1.0 contract (byte-identical to root) |
| `shell.ts` | TypeScript | `sovereign-shell/src/shell.ts` | Composition root — implements SovereignShellContext |
| `module-loader/index.ts` | TypeScript | `sovereign-shell/src/module-loader/` | Mount/unmount, minimumRole, agentCards, healthCheck polling |
| `navigation/theme.ts` | TypeScript | `sovereign-shell/src/navigation/` | Shared SOVEREIGN design tokens |
| `navigation/useNavigationState.ts` | TypeScript | `sovereign-shell/src/navigation/` | React reactivity bridge |
| `navigation/Breadcrumb.tsx` | TSX | `sovereign-shell/src/navigation/` | Breadcrumb trail |
| `navigation/ModuleNav.tsx` | TSX | `sovereign-shell/src/navigation/` | Module sidebar (health, tier, lock states) |
| `navigation/ShellNavChrome.tsx` | TSX | `sovereign-shell/src/navigation/` | Platform nav chrome + module outlet |
| `navigation/index.ts` | TypeScript | `sovereign-shell/src/navigation/` | Public surface |
| `governance/gateStatus.ts` | TypeScript | `sovereign-shell/src/governance/` | Gate/portfolio state → visuals |
| `governance/GovernanceHeaderIndicator.tsx` | TSX | `sovereign-shell/src/governance/` | Header CPMI-VRS status + HOLD badge |
| `governance/CPMIVRSDashboard.tsx` | TSX | `sovereign-shell/src/governance/` | CPMI-VRS dashboard placeholder |
| `governance/index.ts` | TypeScript | `sovereign-shell/src/governance/` | Public surface |
| `package.json` | JSON | `sovereign-shell/` | Package manifest — React 18 / TS 5 / Vite 5 |
| `tsconfig.json` | JSON | `sovereign-shell/` | TypeScript compiler config (strict) |
| `tsconfig.node.json` | JSON | `sovereign-shell/` | Vite config TypeScript project |
| `vite.config.ts` | TypeScript | `sovereign-shell/` | Vite build configuration |

**Compile status: all components pass `tsc --noEmit` under strict mode against the approved `shell-contract.ts` (React 18 + @types/react). 0 errors.**

---

*SOVEREIGN SBOM Update · Session 2B · June 2, 2026*
*Append to SBOM_Registry.md Session 2B section*
*Pre-Decisional · Internal Working Document*
