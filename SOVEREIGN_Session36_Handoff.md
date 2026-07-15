# SOVEREIGN Session 36 Handoff
## PPBE Live-Smoke Diagnostic — No Code Defect Found
**Date:** July 14, 2026
**Build Agent:** Claude Code (Sonnet 4.6)
**Session type:** Diagnostic / single-commit

---

## A. Session-Open Check

HEAD at open: `2a5f764` (Session 35 close — expected). Shell-contract v1.16 verified at open: both copies `521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7` — never touched. Prompt registry: 20 registered = 19 approved + 1 pending (PR-SCRIBE-004) — unchanged.

---

## B. Original Diagnosis — Retracted, Confirmed Wrong

The Session 36 opening prompt diagnosed the live-call failure as a field-name typo: `api_key_anthropic` at `e2e/tests/ppbe-live-smoke.test.ts:259` vs. `AnthropicClientConfig.api_key`. This diagnosis was incorrect.

**Confirmed evidence against the original diagnosis:**

- `sovereign-api-client/src/index.ts:160–162`: `SovereignClientConfig` declares `api_key_anthropic?: string` — the factory's external-facing interface uses this exact field name.
- `sovereign-api-client/src/index.ts:203, 211`: the factory validates `config.api_key_anthropic` and translates it to `AnthropicClientConfig.api_key` via `defaultAnthropicConfig(config.api_key_anthropic)`.
- `tsc --noEmit` on the e2e package exits clean. TypeScript's excess-property check would have flagged a wrong field name on an object literal passed directly to a typed function.
- Applying the proposed fix (changing to `api_key`) would have caused the factory to throw "api_key_anthropic is required" at runtime.

The harness at line 259 is correct as written. No change was made to it.

**max_tokens: 4096 override also confirmed correct.** The spread at index.ts:214 (`...(config.max_tokens && { max_tokens: config.max_tokens })`) overrides the `defaultAnthropicConfig` default of 1,000. `this.max_tokens = 4096` reaches the wire request body. No issue here.

---

## C. Root Cause of the 401 — Not a Code Defect

The 401 observed in the diagnostic run was produced by submitting a placeholder string (`sk-ant-your-real-key-here`, 25 characters) rather than a real API key. The debug log's reported key length — exactly 25 — matched the placeholder precisely. This was a communication/formatting error outside the codebase. No code in `anthropic-client.ts`, `index.ts`, or `ppbe-live-smoke.test.ts` requires correction.

The full call chain — `SovereignClientConfig.api_key_anthropic` → factory validation → `defaultAnthropicConfig()` → `AnthropicClientConfig.api_key` → `this.api_key` → `"x-api-key"` header — is confirmed correct by direct evidence, not assumption.

---

## D. What Was Committed

**`d034d0f`** — `debug(api-client): add SOVEREIGN_CLIENT_DEBUG live-call diagnostic logging (Session 36)`

Two files modified:
- `sovereign-api-client/src/anthropic-client.ts` — three `SOVEREIGN_CLIENT_DEBUG`-gated `console.log` calls: (1) `buildHeaders()` — api_key presence and length (never value), max_tokens, timeout_ms; (2) `callProvider()` before fetch — model, max_tokens, message count, has_system; (3) `callProvider()` on non-ok — status + 300-char body preview; (4) `callProvider()` on ok — status, body length, 120-char preview.
- `sovereign-api-client/src/base-client.ts` — one `SOVEREIGN_CLIENT_DEBUG`-gated `console.log` in the tier-1 catch block — reason and full error detail string.

This logging is **retained as permanent diagnostic tooling**, not reverted. It is gated on `process.env["SOVEREIGN_CLIENT_DEBUG"]` and produces zero output when unset. The fail-closed e2e half confirmed 4/4 PASS with no debug output. 174 api-client unit tests green.

To invoke: `SOVEREIGN_CLIENT_DEBUG=1 RUN_PPBE_LIVE_SMOKE=1 ANTHROPIC_API_KEY=<real-key> npm run test:e2e -- ppbe-live-smoke` from the `e2e/` directory.

---

## E. Session 35 Part 1 Status — Still Open

The PPBE live-call smoke test (Session 35, Part 1) remains open. The code is correct. The remaining action is the Project Principal running the live half with a real, billing-enabled Anthropic API key. This is a credential-issuance and test-execution action, not a build action. No further session work is needed before that run.

---

## F. Test Counts

Unchanged from Session 35: **JS/TS 1680 + Python 195 = 1875.** No tests were added or removed. `tsc --noEmit` clean across all 14 workspaces (api-client verified directly; no other workspace was touched).

---

## G. Integration Brief Update Flags

1. **No shell-contract change.** No GD. No SBOM entry. No prompt registry change.
2. **Session 35 Part 1 (PPBE live-smoke) remains open.** Status: code confirmed correct; live run with real key is the remaining action.
3. **SOVEREIGN_CLIENT_DEBUG diagnostic tooling now permanent.** No governance action required — this is observability infrastructure gated behind an env flag, not a new agent, prompt, or shell-contract change.
4. **Prompt registry unchanged:** 20 registered = 19 approved + 1 pending (PR-SCRIBE-004).

## H. Commits This Session

`d034d0f` (diagnostic logging). Base: `2a5f764`. Pushed.

---

*SOVEREIGN_Session36_Handoff.md · Session 36 · July 14, 2026*
