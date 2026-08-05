# SOVEREIGN Platform — Session 84 Handoff
**Date:** August 4, 2026
**Session:** 84
**Scope:** Anthropic browser CORS header fix (`sovereign-api-client`)

---

## What was done

Live browser diagnostics confirmed that requests from the browser to
`https://api.anthropic.com/v1/messages` were failing at the CORS preflight stage
with "Status code: 400." The root cause: Anthropic's API requires the header
`anthropic-dangerous-direct-browser-access: true` on any browser-originated request.
A grep of the full codebase prior to this session confirmed the header was absent everywhere.

### Change 1 — `sovereign-api-client/src/anthropic-client.ts` (line 243)

Added the required header to `buildHeaders()` — the single site in the codebase where
Anthropic request headers are constructed. A 5-line comment directly above the new
header states the tradeoff plainly: the header is necessary to clear Anthropic's CORS
gate; it accepts the risk that `x-api-key` is visible in the browser's Network panel;
this is deliberate for the local dev/demo context; real production must use a backend proxy.

**Exact diff (production file):**

```diff
 protected buildHeaders(): Record<string, string> {
   return {
     "Content-Type": "application/json",
     "x-api-key": this.api_key,
     "anthropic-version": ANTHROPIC_API_VERSION,
+    // Required for browser-originated requests: Anthropic's API refuses any direct
+    // browser fetch without this header (400 CORS preflight failure). Trade-off: the
+    // x-api-key value above is visible to anyone who inspects the browser's Network
+    // panel. That is an accepted, deliberate risk for this local dev/demo environment.
+    // A real production deployment MUST NOT call Anthropic directly from the browser —
+    // route LLM calls through a backend proxy that holds the key server-side instead.
+    "anthropic-dangerous-direct-browser-access": "true",
   };
 }
```

### Change 2 — `sovereign-api-client/tests/test_anthropic_client.test.ts`

Added one test to the `auth header injection` describe block confirming the header is
present on every live `fetch()` call. Test references the exact CORS failure observed
in diagnostics so the reason is self-documenting.

**Test added:**

```typescript
test("includes anthropic-dangerous-direct-browser-access header set to 'true' on every live request", async () => {
  // Without this header Anthropic's API returns 400 on browser-originated CORS preflights.
  // Confirmed absent from the codebase prior to Session 84; confirmed required by live
  // browser diagnostics (Status code: 400 on preflight to api.anthropic.com/v1/messages).
  mockFetchSuccess("ok");
  const client = new AnthropicClient(BASE_CONFIG);
  await client.complete(BASE_MESSAGES, BASE_CONTEXT);

  const [, init] = (global.fetch as FetchMock).mock.calls[0];
  const headers = init?.headers as Record<string, string>;
  expect(headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
});
```

---

## Test results

**sovereign-api-client:** 185 passed, 0 failed (was 184; +1 new test)

Full 14-package JS/TS run at session close:

```
sovereign-data:     163 passed
sovereign-api-client: 185 passed  ← +1
sovereign-shell:     19 passed
module-counsel:     100 passed
module-scribe:      240 passed
module-vigil:       215 passed
module-lens:         63 passed
module-cpmi:         62 passed
module-agentos:      89 passed
module-nexus:       169 passed
module-apex:        228 passed
module-flowpath:    152 passed
module-aria:        150 passed
module-workspace:    33 passed
Total:            1,868 passed
```

**tsc --noEmit:** all 15 workspaces clean (unchanged from Session 83).

---

## Pre-existing open item (not from Session 84)

`module-vigil/src/useApprovalBrief.ts` contains a stray `console.log` debug line
that was present in the working tree at the start of this session (visible in
session-open `git status`). It was not introduced by Session 84 and is not included
in the Session 84 commit. Needs removal in a future session.

---

## SBOM

`SBOM_Session84_Update.md` — v1.52. Zero new production dependencies. +1 test.
All 15 workspaces type-clean.

---

## For the next session

1. Remove the stray `console.log` in `module-vigil/src/useApprovalBrief.ts` (pre-existing,
   not from Session 84).
2. If browser testing confirms the CORS fix resolves the preflight failure, no further
   action on the header. If a 403 follows, check that the API key itself is valid.
3. Production path: replace the direct-browser call pattern with a backend proxy so the
   API key is never exposed in browser network traffic.
