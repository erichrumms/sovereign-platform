# SOVEREIGN Platform — SBOM Update
## Session 7 — module-vigil core (Anomaly Triage Assistant + Alert Response)
**Append to SBOM_Registry.md — Node.js / npm Dependencies table**

Date Added: June 18, 2026
Session: 7 (Stage 2 — VIGIL Core + LENS Scaffold)
Packages: `module-vigil` (core build; dependency additions)
Location in Monorepo: `module-vigil/`

---

## New Production-Runtime npm Dependencies — Session 7 (module-vigil)

**None new to the platform.** The VIGIL core build added two **already-linked workspace
packages** to `module-vigil/package.json` — `@sovereign/api-client` and `@sovereign/data`
— because the Anomaly Triage Assistant now makes an LLM call (`createSovereignClient`)
and reuses the canonical `ValidationResult`. Both are existing platform packages, not new
external dependencies.

| Package | Version (exact installed) | Type | Product(s) | Purpose | License | Notes |
|---|---|---|---|---|---|---|
| @sovereign/api-client | 1.0.0 (workspace) | npm (runtime, workspace) | module-vigil (+ counsel/scribe) | Triage LLM call via `createSovereignClient()` (no direct provider call) | UNLICENSED (internal) | already platform package |
| @sovereign/data | 1.0.0 (workspace) | npm (runtime, workspace) | module-vigil (+ counsel/scribe) | Canonical `ValidationResult` for the triage-brief validator | UNLICENSED (internal) | already platform package |
| react | 18.3.1 | npm (runtime) | sovereign-shell · module-counsel · module-scribe · module-vigil · module-lens | VIGIL React UI | MIT | already platform stack |
| react-dom | 18.3.1 | npm (runtime) | sovereign-shell · module-counsel · module-scribe · module-vigil · module-lens | VIGIL React mount (`createRoot`) | MIT | already platform stack |

No new external npm package entered the production tree. The triage call routes
exclusively through `@sovereign/api-client`; VIGIL makes no direct provider call
(Standing Constraint #5).

## New Dev-Toolchain npm Dependencies — Session 7 (module-vigil)

**None new.** `module-vigil` uses the same shared TS + Jest + RTL/jsdom toolchain already
recorded (Session 5/6 SBOM updates), at identical versions. The `anthropic-key` jest
`moduleNameMapper` added this session maps to a local test stub (no new package).

---

## Supply Chain Compliance Notes

- **No new packages introduced** (production or dev). `npm audit --omit=dev`: **0 vulnerabilities** — unchanged.
- **Dev-only advisories:** unchanged (RTL/jsdom + esbuild/Vite, transitive/test-time only; never shipped). Review at the pre-production pass (Stage 5+).
- **No new external API services.** The Anomaly Triage Assistant (the only VIGIL LLM call) routes through `@sovereign/api-client` only.

---

## Files Produced — Session 7 (module-vigil inventory)

`module-vigil/src/` (new): `triage-contract.ts`, `triage-engine.ts`, `useTriage.ts`,
`useAlertQueue.ts`, `useAlertResponse.ts`, `vigil-types.ts`, `anthropic-key.ts`,
`prompts/triage-system.prompt.ts`, `AlertDetail.tsx`, `AlertResponsePanel.tsx`,
`AnomalyTriageAssistant.tsx`.
`module-vigil/src/` (edited): `index.ts` (registers vigil-triage-analyst), `VigilApp.tsx`
(wired queue + detail), `AlertQueue.tsx` (stub → real).
`module-vigil/tests/` (new): `triage-contract.test.ts`, `triage-engine.test.ts`,
`useTriage.test.tsx`, `useAlertResponse.test.tsx`, `useAlertQueue.test.tsx`,
`AlertQueue.test.tsx`, `__mocks__/anthropic-key.ts`.
`module-vigil/tests/` (edited): `index.test.ts`, `test-helpers.tsx`.
`module-vigil/` (edited): `package.json` (workspace deps + jest mock map),
`prompts/CHANGELOG.md` + `prompts/triage-system-v1.0.md` (PR-VIGIL-001 APPROVED + wired).

**Test/compile status:** `module-vigil` `tsc --noEmit` strict 0 errors; **63 tests** (was 17).
`shell-contract.ts` SHA-256 `4d78754f…6836acc2` unchanged (both copies), v1.3.

---

*SOVEREIGN SBOM Update · Session 7 · June 18, 2026 · module-vigil*
*Append to SBOM_Registry.md Session 7 section (with module-lens/SBOM_Session7_Update.md)*
*Pre-Decisional · Internal Working Document*
