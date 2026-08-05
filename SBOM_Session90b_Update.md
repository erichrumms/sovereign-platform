# SOVEREIGN Platform — SBOM Registry
## Version 1.57 · August 5, 2026

**Supersedes:** v1.56 (Session 90 — F1: NEXUS Travel + FLOWPATH Review e2e test; F3: docs/23 section-count fix)
**Adds:** Session 90b — stale test-name label fix in `startup-publish-convergence.test.ts` (authorized in Session 90 Open Items). No code behavior changed.

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| **v1.27** | **Session 87** | **GD-34: added `FallbackCategory` type + `fallback_category?` field to `SovereignLogEvent`; added `duration_ms?`, `stop_reason?`, `responded_at?` to `SovereignLogEvent.token_usage`.** | **`3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff`** |
| v1.27 | Session 88 | Unchanged. Re-verified at close. | `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff` |
| v1.27 | Session 89 | Unchanged. Re-verified at close. | `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff` |
| v1.27 | Session 90 | Unchanged. Re-verified at close. | `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff` |
| v1.27 | Session 90b | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff` |

SHA-256 verified at close: `shasum -a 256 shell-contract.ts sovereign-shell/shell-contract.ts` — both copies produced identical hash.

**Agents: 44 total — unchanged.**

**Prompts: 20 = 19 approved + 1 pending — unchanged.**

---

## 2 — Third-Party Dependencies

**Zero new production dependencies.** One test-name string changed. Zero-new-production-dependency streak continues unbroken from Session 62.

**Audit posture:** unchanged.

---

## 3 — Test Totals

| Close point | JS/TS (modules) | e2e | Python | Platform Total | Confidence |
|---|---|---|---|---|---|
| Session 88 | 1,887 | 149 (4 skip) | 195 | 2,231 | High |
| Session 90 | 1,887 | 155 (4 skip) | 195 | 2,237 | High — +6 tests (F1) |
| **Session 90b** | **1,887** | **155 (4 skip)** | **195** | **2,237** | **High — label fix only, test count unchanged** |

`tsc --noEmit`: e2e workspace clean.

---

## 4 — Session 90b Component Changes

| File | Change |
|------|--------|
| `e2e/tests/startup-publish-convergence.test.ts` | Test name updated: "populates ReviewerWorkspaceSurface on all three sections with FULL payloads" → "populates ReviewerWorkspaceSurface on VIGIL, ARIA, SCRIBE, and NEXUS sections with FULL payloads". Label-only fix; assertions unchanged. Closes the stale-label open item from Session 90. |
| `SOVEREIGN_Session90b_Handoff.md` | New — Session 90b evidence record. |
| `SBOM_Session90b_Update.md` | This file — v1.57. |
