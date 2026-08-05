# SOVEREIGN Platform — Session 87 Handoff
**Date:** August 4, 2026
**Governance Decision:** GD-34
**SBOM version:** v1.54

---

## Work completed

Session 87 implemented four findings from the Session 86 Cost Tracking Reflection, plus the
documentation fix F6a, as a single shell-contract v1.27 bump. F4 and F5 were explicitly
out of scope this session.

### F1 — Failure Categorization

`base-client.ts` catch block now derives a structured `FallbackCategory` from the actual
error before logging FALLBACK_ACTIVATED:

- `instanceof SovereignTimeoutError` → `"timeout"`
- `err.name === "GovCloudNotYetResolvedException"` → `"provider_unresolved"` (avoids import)
- `.status === 401` → `"auth_failure"`
- `.status === 429` → `"rate_limited"`
- `.status >= 500` → `"server_error"`
- Fallback → `"network_or_parse"`

`FallbackCategory` is now an exported type from `base-client.ts`. It is carried as a direct
field on the `ClientLogger.log()` event (`fallback_category?`) and also forwarded into the
event payload for full observability. The Cost Dashboard (`CostDashboardSection` in
`WorkspaceApp.tsx`) renders per-category sub-rows below the fallback activation total.

### F2 — Duration

`performance.now()` is captured as `requestedAt` before each `callProvider()` call in the
live tier. `duration_ms = Math.round(performance.now() - requestedAt)` is computed after
and threaded through `_wrapResponse` into `SovereignLLMResponse.duration_ms?`. All 9 engine
files (approval, triage, draft, tt-draft, style, intermediate, reasoning, explanation, plus
benchmark-aggregate as `total_duration_ms`) return `duration_ms` in their Outcome interface.
All 10 GD-31 hook sites thread `duration_ms` into `token_usage` on AGENT_STEP_COMPLETE.

### F3 — Stop Reason

`AnthropicClient._parseResponse` now returns `stop_reason?: string` from the wire JSON.
`callProvider` abstract signature updated to propagate it. `_wrapResponse` sets
`response.stop_reason` when present. All 9 standard engine files return `stop_reason` in
their Outcome (not benchmark — not meaningful for 3-scenario aggregate). All 9 standard
hook sites thread `stop_reason` into `token_usage` on AGENT_STEP_COMPLETE.

### F6b — responded_at

`sovereign_metadata.responded_at` (already present on `SovereignLLMResponse`) is now
forwarded from each live-tier engine return through to AGENT_STEP_COMPLETE `token_usage`.
All 9 standard engine files return `responded_at` in their Outcome (not benchmark). All 9
standard hook sites thread `responded_at` into `token_usage` on AGENT_STEP_COMPLETE.
Optional chaining (`?.`) is used when accessing `response.sovereign_metadata?.responded_at`
to prevent TypeError when test mocks omit `sovereign_metadata`.

### F6a — GovCloud coverage disclosure

`CostDashboardSection`'s coverage disclosure in `WorkspaceApp.tsx` now includes the
sentence: "GovCloud live-call cost estimates are excluded until R7 resolves — the GovCloud
provider always serves the static fallback tier."

### Shell contract v1.27

Both copies (`shell-contract.ts` and `sovereign-shell/shell-contract.ts`) updated
identically:

- `SovereignLogEvent.token_usage` extended with `duration_ms?`, `stop_reason?`, `responded_at?`
- New `fallback_category?: FallbackCategory` direct field on `SovereignLogEvent`
- GD-34 changelog entry added at v1.27

SHA-256 at close:
```
3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff  shell-contract.ts
3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff  sovereign-shell/shell-contract.ts
```
Both copies identical — verified.

---

## Test evidence

### Full test suite (post-fix)

```
sovereign-data:        163 tests — PASS
sovereign-api-client:  192 tests — PASS  (+7: 6 fallback-category + 1 stop_reason)
sovereign-shell:        19 tests — PASS
module-counsel:        100 tests — PASS
module-scribe:         240 tests — PASS
module-vigil:          215 tests — PASS
module-lens:            63 tests — PASS
module-cpmi:            62 tests — PASS
module-agentos:         89 tests — PASS
module-nexus:          169 tests — PASS
module-apex:           228 tests — PASS
module-flowpath:       152 tests — PASS
module-aria:           150 tests — PASS
module-workspace:       33 tests — PASS
e2e:          149 pass, 4 skip — PASS
```

Total JS/TS: **1,875** (was 1,868; +7). Platform total: **2,219**.
Zero FAILs across all workspaces.

### tsc --noEmit

All 15 workspaces: **0 errors**. Verified by running
`./node_modules/.bin/tsc --noEmit` in each workspace directory.

### Bug discovered and fixed during implementation

The background agent that updated the 9 engine files wrote `response.sovereign_metadata.responded_at`
(non-optional). When the test mocks supply only `{ content, usage }` (without `sovereign_metadata`),
this threw a TypeError in the live-tier return, which was silently caught by the engine's
fallback-catch block, causing the result tier to report "cache" instead of "live". The fix
was optional chaining (`response.sovereign_metadata?.responded_at`) across all 8 standard
engines. All affected tests now pass.

---

## Files changed (26)

```
sovereign-api-client/src/base-client.ts               (F1+F2)
sovereign-api-client/src/anthropic-client.ts          (F3)
sovereign-api-client/tests/test_base_client.test.ts   (+6 tests F1)
sovereign-api-client/tests/test_anthropic_client.test.ts (+1 test F3)
module-vigil/src/approval-engine.ts                   (F2+F3+F6b, ?.fix)
module-vigil/src/triage-engine.ts                     (F2+F3+F6b, ?.fix)
module-vigil/src/useApprovalBrief.ts                  (GD-31 token_usage threading)
module-vigil/src/useTriage.ts                         (GD-31 token_usage threading)
module-scribe/src/draft-engine.ts                     (F2+F3+F6b, ?.fix)
module-scribe/src/tt-draft-engine.ts                  (F2+F3+F6b, ?.fix)
module-scribe/src/style-engine.ts                     (F2+F3+F6b, ?.fix)
module-scribe/src/intermediate-engine.ts              (F2+F3+F6b, ?.fix)
module-scribe/src/useDraft.ts                         (GD-31 token_usage threading)
module-scribe/src/useTTDraft.ts                       (GD-31 token_usage threading)
module-scribe/src/useStyleProfile.ts                  (GD-31 token_usage threading)
module-scribe/src/useIntermediate.ts                  (GD-31 token_usage threading)
module-cpmi/src/reasoning-engine.ts                   (F2+F3+F6b, ?.fix)
module-cpmi/src/benchmark.ts                          (F2 aggregate only)
module-cpmi/src/useReasoningChain.ts                  (GD-31 token_usage threading)
module-cpmi/src/useBenchmark.ts                       (GD-31 token_usage threading, total_duration_ms)
module-lens/src/explanation-engine.ts                 (F2+F3+F6b, ?.fix)
module-lens/src/useExplanation.ts                     (GD-31 token_usage threading)
module-nexus/src/NexusApp.tsx                         (GD-31 token_usage threading)
module-workspace/src/WorkspaceApp.tsx                 (F1 display + F6a note)
shell-contract.ts                                     (v1.27 bump)
sovereign-shell/shell-contract.ts                     (v1.27 bump — identical)
```

---

## Open items

- **F4 — Cost persistence across sessions** — not implemented; out of scope for Session 87.
- **F5 — Export audit trail** — not implemented; out of scope for Session 87.
- **R7 (GovCloud)** — remains unresolved; GovCloud provider always serves static fallback tier.
- The session 86 SBOM update (SBOM_Session86_Update.md) was not written — Session 86 was
  a reflection-only session with no code changes; no SBOM file was needed.

---

## Gate: session close

- [x] tsc --noEmit clean on all 15 workspaces (0 errors)
- [x] All tests pass (1,875 JS/TS + 149 e2e — zero FAILs)
- [x] Shell contract v1.27: both copies SHA-256 identical
- [x] SBOM v1.54 written
- [x] Handoff written with real evidence
- [x] Commits per-deliverable
- [x] Copied to ~/Desktop/
- [x] git push (shown below)
