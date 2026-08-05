# SOVEREIGN Platform — SBOM Registry
## Version 1.56 · August 5, 2026

**Supersedes:** v1.55 (Session 88 — GD-35: four PPBE advisory panels wired to Logger-instrumented hooks)
**Adds:** Session 90 — F1: permanent e2e convergence test for NEXUS Travel + FLOWPATH Review Workspace sections (six checks); F3: docs/23 section-count correction (seven sections, not six). Session 89 was a zero-code regression verification (no SBOM update per Session 81/86 precedent).

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.26 | GD-33 Build Session | Added `reports_to?: string` to `SovereignUser`. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| **v1.27** | **Session 87** | **GD-34: added `FallbackCategory` type + `fallback_category?` field to `SovereignLogEvent`; added `duration_ms?`, `stop_reason?`, `responded_at?` to `SovereignLogEvent.token_usage`.** | **`3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff`** |
| v1.27 | Session 88 | Unchanged. Re-verified at close. | `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff` |
| v1.27 | Session 89 | Unchanged. Re-verified at close (regression verification session, no code). | `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff` |
| v1.27 | Session 90 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff` |

SHA-256 verified at close: `shasum -a 256 shell-contract.ts sovereign-shell/shell-contract.ts` — both copies produced identical hash.

**Agents: 44 total — unchanged.**

**Prompts: 20 = 19 approved + 1 pending — unchanged.**

---

## 2 — Third-Party Dependencies

**Zero new production dependencies.** Session 90 adds one new test file (`e2e/tests/nexus-flowpath-workspace-convergence.test.tsx`) and one documentation append (`docs/23_Reviewers_Workspace_v1.md`). All imports in the new test file use existing workspace dependencies. Zero-new-production-dependency streak continues unbroken from Session 62.

**Audit posture:** unchanged — 5 vulnerabilities (1 moderate, 4 high) all in dev-tooling dependencies, pre-existing.

---

## 3 — Test Totals

| Close point | JS/TS (modules) | e2e | Python | Platform Total | Confidence |
|---|---|---|---|---|---|
| Session 87 | 1,875 | 149 (4 skip) | 195 | 2,219 | High — full 15-package + e2e run at close; +7 tests |
| Session 88 | 1,887 | 149 (4 skip) | 195 | 2,231 | High — full 15-package + e2e run at close; +12 tests |
| Session 89 | 1,887 | 149 (4 skip) | 195 | 2,231 | High — no code; regression verification only |
| **Session 90** | **1,887** | **155 (4 skip)** | **195** | **2,237** | **High — full e2e run at close; +6 tests (F1)** |

Per-package JS/TS breakdown (Session 90): same as Session 88 (1,887) — no module code changed this session.

`tsc --noEmit`: **all 15 workspaces clean** — e2e, sovereign-shell, module-workspace verified at close; remaining workspaces unchanged.

---

## 4 — Session 90 Component Changes (F1, F3)

| File | Change |
|------|--------|
| `e2e/tests/nexus-flowpath-workspace-convergence.test.tsx` | F1 (new): six-check permanent convergence test for the WH-19 NEXUS Travel and FLOWPATH Review Workspace sections. Covers: NEXUS startup publication with full SubmittedTravelItem payloads and workflow_step_ids; final-outcome reconciliation removing items; FLOWPATH bundle publish/clear; a render of all seven Workspace tabs from one shared SYSTEM_ADMIN ctx; in-Workspace TRAVEL_APPROVAL decision removing the item and logging the correct HUMAN_DECISION event. |
| `docs/23_Reviewers_Workspace_v1.md` | F3: appended August 5, 2026 section-count correction. The July 30 append recorded six sections; the module has seven since GD-32 (Session 87) added the Cost Dashboard tab. Correction records all seven sections with their source modules and decision components. Also records F1 coverage gap (Session 89) as closed. |
| `SOVEREIGN_Session90_Handoff.md` | New — Session 90 evidence record. |
| `SBOM_Session90_Update.md` | This file — v1.56. |
