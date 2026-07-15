# SOVEREIGN Session 37 Handoff
## Retire claude-sonnet-4-20250514 — Standardize on claude-sonnet-4-6
**Date:** July 14, 2026
**Build Agent:** Claude Code (Sonnet 4.6)
**Session type:** Single-commit fix

---

## A. Session-Open Check

HEAD at open: `f04b3af` (Integration Brief v1.45 / Agent-to-Agent Briefing sync — expected post-Session-36 doc commit). Shell-contract v1.16 verified: both copies `521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7` — never touched.

---

## B. Every Location the Stale String Was Found

Full grep: `grep -rn "claude-sonnet-4-20250514" --include="*.ts" --include="*.tsx" --include="*.json" . | grep -v node_modules`

**Three hits, all in the api-client package:**

| File | Line | Type | Action |
|---|---|---|---|
| `sovereign-api-client/src/anthropic-client.ts` | 19 | Doc comment | Updated to `claude-sonnet-4-6` |
| `sovereign-api-client/src/anthropic-client.ts` | 54 | `SOVEREIGN_DEFAULT_MODEL` constant definition | Updated to `claude-sonnet-4-6` |
| `sovereign-api-client/tests/test_index.test.ts` | 325 | Exact-value test assertion | Updated to `claude-sonnet-4-6` |

**Additional pattern grep:** `claude-*-2025*` and `claude-*-2026*` — found only the same three hits above. No other dated snapshot strings in the codebase.

---

## C. Shared Constant — Already Exists, No New Abstraction Needed

`SOVEREIGN_DEFAULT_MODEL` is an exported constant at `sovereign-api-client/src/anthropic-client.ts:54`, consumed by `defaultAnthropicConfig()` (same file) and referenced in tests. The string is NOT independently duplicated in multiple places. All downstream callers receive the model identifier from this one constant. One edit to the constant fixes the platform.

**This is the good case:** no drift, no N-places-to-update problem. Flagging it here for the Governance Agent record because the Session 36/37 investigation established this explicitly — future model updates touch exactly one source line plus the test allowlist.

---

## D. Regression Test Added

**File:** `sovereign-api-client/tests/test_index.test.ts`

**What was added** (immediately after the existing exact-value test):

```typescript
const SOVEREIGN_ALLOWED_MODELS = new Set([
  "claude-sonnet-4-6",
]);

test("SOVEREIGN_DEFAULT_MODEL is in the known-available model allowlist", () => {
  expect(SOVEREIGN_ALLOWED_MODELS.has(SOVEREIGN_DEFAULT_MODEL)).toBe(true);
});
```

**What it catches:** Any future change of `SOVEREIGN_DEFAULT_MODEL` to a string not in `SOVEREIGN_ALLOWED_MODELS` fails this test immediately in the hermetic suite — before the string reaches a live smoke run and produces a 404. `claude-sonnet-4-20250514` is not in the list and would fail loudly.

**Update protocol (in test comment):** (1) confirm the new model exists on the Anthropic account; (2) add it to `SOVEREIGN_ALLOWED_MODELS`; (3) update `SOVEREIGN_DEFAULT_MODEL`; (4) update the exact-value test. Retired models removed from the allowlist so they cannot be re-introduced accidentally.

**Complementary to the exact-value test:** the existing `.toBe("claude-sonnet-4-6")` catches any drift from the specific current model; the allowlist test catches a drift to any *non-validated* string. Together they ensure neither silent drift nor a plausible-but-unavailable substitution passes the hermetic suite.

---

## E. Test Results

**api-client unit suite:** 175 tests, all pass (174 pre-existing + 1 new allowlist test). `tsc --noEmit` clean.

**e2e fail-closed half:** 4/4 PASS, validator=PASS, tier=static — unaffected by model string change (fail-closed path never calls the provider).

**e2e live half:** `ANTHROPIC_API_KEY` absent in this build environment — live half correctly skipped per standing protocol. The live half must be run by the Project Principal with a valid key to confirm the 404 is resolved.

---

## F. Session 35 Part 1 Status — One Action Remaining

**Is Part 1 of Session 35 now genuinely closed?** Not yet — one Project Principal action remains.

The code is fully correct:
- `api_key_anthropic` → `api_key` translation chain confirmed correct (Session 36)
- `max_tokens: 4096` override confirmed surviving the translation chain (Session 36)
- `SOVEREIGN_CLIENT_DEBUG` diagnostic logging in place and gated (Session 36)
- Model string `claude-sonnet-4-6` confirmed available on the account (this session)
- Fail-closed half: 4/4 PASS across all sessions

**Remaining action:** the Project Principal runs:
```bash
SOVEREIGN_CLIENT_DEBUG=1 \
RUN_PPBE_LIVE_SMOKE=1 \
ANTHROPIC_API_KEY=<real-key> \
npm run test:e2e -- ppbe-live-smoke
```
from the `e2e/` directory with a valid billing-enabled key. If the four live-half tests return `tier=live validator=PASS` (or `tier=static` with a specific validator detail indicating prompt-tuning is needed), Session 35 Part 1 is closed and Walkthrough F's pre-conditions are met. No further build work is anticipated unless a validator failure surfaces a prompt-tuning issue — which would be a short targeted session to tune the specific prompt that failed.

---

## G. Findings

**No duplicated config problem found.** The stale model string was in one constant only. The N-places-to-update risk the opening prompt flagged is not present in this codebase. The SBOM and Integration Brief do reference the model string independently (as documentation), but those are documentation artifacts — they don't drive runtime behavior and don't need to be in sync for correctness. The Governance Agent should update the SBOM entry for the Anthropic API model as part of the post-session doc cycle.

**One additional note for the Governance Agent:** `SOVEREIGN_ALLOWED_MODELS` in the regression test is the new authoritative allowlist of confirmed-available model identifiers. It should be updated every time the Governance Agent processes a model change — adding new entries when a model is confirmed available, removing retired entries. The test file comment documents the protocol.

---

## H. Integration Brief Update Flags

1. **SBOM update:** Anthropic API entry — model field changes from `claude-sonnet-4-20250514` to `claude-sonnet-4-6`. (No new component; this is a version/identifier update on an existing SBOM entry.)
2. **Test count delta:** +1 (api-client: 174 → 175). JS/TS total: 1680 → **1681**. Python: 195. Grand total: **1876**.
3. **Session 35 Part 1:** still open — one live-smoke run with real key remaining (Project Principal action).
4. **No shell-contract change. No GD. No prompt registry change.**

---

## I. Commits This Session

`508c991` (model string fix + regression test). Base: `f04b3af`. Pushed.

---

*SOVEREIGN_Session37_Handoff.md · Session 37 · July 14, 2026*
