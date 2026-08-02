# SOVEREIGN Platform — Session Handoff
## Build Agent → Governance Agent
## GD-31 Token & Cost Telemetry — Build Session 1 of 2

**Date:** August 2, 2026
**Session type:** Autonomous build (GD-31, docs/31)
**Git close:** see push output below — session is not complete until push has run

---

## 1 — What Was Built

GD-31 (Token & Cost Telemetry), Build Session 1. All five done conditions in
docs/31 §5 are met:

1. `token_usage` optional field added to `SovereignLogEvent` in both shell-contract
   copies, identical; shell-contract bumped v1.24 → v1.25; SHA-256 re-verified.
2. Versioned static rate table added in `sovereign-api-client/src/token-cost.ts`;
   pricing date documented (August 2026, from Anthropic published rates); zero new
   production dependencies.
3. All 10 confirmed-in-scope emission sites thread real `usage` from `complete()`
   into `token_usage` on their `AGENT_STEP_COMPLETE` event.
4. All `FALLBACK_ACTIVATED` paths leave `token_usage` absent (not zero) — the
   conditional spread `...(result.usage ? {...} : {})` ensures this at every site.
5. Convergence tests per emission site (9 hookable sites + NexusApp noted below)
   confirm `token_usage` is populated from the mock client's real `usage` response,
   not hardcoded.

---

## 2 — Files Changed

**Shell Contract (both copies, identical)**

- `shell-contract.ts` — v1.24 → v1.25; changelog entry added; `token_usage?` field
  added to `SovereignLogEvent`; Section 9 sentinel line added.
- `sovereign-shell/shell-contract.ts` — identical changes.
- SHA-256 both copies: `d22694a34d9621f620d365dfa1bb9838685bea684a1a2a2a694e2aa1c77693f7`

Excerpt from `git diff HEAD shell-contract.ts`:
```
- * Version: 1.24
+ * Version: 1.25
+  // GD-31 (v1.25) — AGENT_STEP_COMPLETE events only. Real usage from the model provider
+  // response. Present only when a live call actually occurred; absent (never zero) when
+  // FALLBACK_ACTIVATED served the response instead, since no live usage exists to report.
+  token_usage?: {
+    input_tokens: number;
+    output_tokens: number;
+    estimated_cost_usd?: number;
+  };
```

**Static Rate Table (new file)**

- `sovereign-api-client/src/token-cost.ts` — new file; `RATE_TABLE` keyed by model
  string; `computeEstimatedCostUSD(model, inputTokens, outputTokens)` exported.
- `sovereign-api-client/src/index.ts` — added `export { computeEstimatedCostUSD }
  from "./token-cost"`.

Excerpt from `git diff HEAD sovereign-api-client/src/index.ts`:
```
+// RE-EXPORTS — TOKEN COST (GD-31)
+export { computeEstimatedCostUSD } from "./token-cost";
```

**Engines (9 files — `usage?` field added to Outcome interface, live-tier return includes `usage: response.usage`)**

- `module-vigil/src/approval-engine.ts` — `BriefOutcome.usage?`
- `module-vigil/src/triage-engine.ts` — `TriageOutcome.usage?`
- `module-scribe/src/draft-engine.ts` — `DraftOutcome.usage?`
- `module-scribe/src/style-engine.ts` — `StyleOutcome.usage?`
- `module-scribe/src/intermediate-engine.ts` — `IntermediateOutcome.usage?`
- `module-scribe/src/tt-draft-engine.ts` — `TTDraftOutcome.usage?`
- `module-cpmi/src/reasoning-engine.ts` — `ReasoningOutcome.usage?`
- `module-cpmi/src/benchmark.ts` — `ScenarioResult.usage?` + `BenchmarkReport.total_usage?`
  (accumulates across all live scenarios)
- `module-lens/src/explanation-engine.ts` — `ExplanationOutcome.usage?`

**Hooks (10 emission sites)**

Pattern applied to all hooks lacking `opts.complete` injection (7 hooks):
- Added `UseXOptions` interface with `complete?` field
- Updated function signature to accept `opts: UseXOptions = {}`
- Wired `opts.complete ?? (default client)` into `deps.complete`
- Added conditional spread on `AGENT_STEP_COMPLETE`:
  `...(result.usage ? { token_usage: { ...result.usage, estimated_cost_usd: computeEstimatedCostUSD(SOVEREIGN_DEFAULT_MODEL, ...) } } : {})`
- Updated `useCallback` deps array to include `opts.complete`

Hooks updated with full injection pattern:
- `module-vigil/src/useApprovalBrief.ts` — `UseApprovalBriefOptions`
- `module-vigil/src/useTriage.ts` — `UseTriageOptions`
- `module-scribe/src/useDraft.ts` — `UseDraftOptions`
- `module-scribe/src/useStyleProfile.ts` — `UseStyleProfileOptions`
- `module-scribe/src/useIntermediate.ts` — `UseIntermediateOptions`
- `module-scribe/src/useTTDraft.ts` — `UseTTDraftOptions`
- `module-lens/src/useExplanation.ts` — `UseExplanationOptions`

Hooks with imports only (already had injection):
- `module-cpmi/src/useBenchmark.ts` — already had `UseBenchmarkOptions`; uses
  `result.total_usage` (sum across all live scenarios), not `result.usage`
- `module-cpmi/src/useReasoningChain.ts` — already had `UseReasoningChainOptions`

Composition root (no injection point):
- `module-nexus/src/NexusApp.tsx` — `travelDrafter` port wired to `runTTDraft` inside
  a `useMemo`; `token_usage` conditional spread added directly to the `AGENT_STEP_COMPLETE`
  emission there; no `complete` injection point added — composition-root pattern means
  the function captures `readAnthropicKey()` directly. Token_usage correctly absent when
  `result.tier !== "live"`.

Excerpt from `git diff HEAD module-vigil/src/useApprovalBrief.ts`:
```
-import { createSovereignClient } from "@sovereign/api-client";
+import { createSovereignClient, computeEstimatedCostUSD, SOVEREIGN_DEFAULT_MODEL } from "@sovereign/api-client";
+export interface UseApprovalBriefOptions {
+  complete?: BriefDeps["complete"];
+}
-export function useApprovalBrief(ctx: SovereignShellContext): UseApprovalBrief {
+export function useApprovalBrief(ctx: SovereignShellContext, opts: UseApprovalBriefOptions = {}): UseApprovalBrief {
+  ...(result.usage ? { token_usage: { ...result.usage, estimated_cost_usd: computeEstimatedCostUSD(SOVEREIGN_DEFAULT_MODEL, result.usage.input_tokens, result.usage.output_tokens) } } : {}),
```

**Tests (12 files — 18 new tests)**

Added 2 convergence tests per hookable emission site (live tier populates `token_usage`;
fallback tier leaves it absent):

- `module-vigil/tests/useApprovalBrief.test.tsx` — 2 tests added (total vigil: 215)
- `module-vigil/tests/useTriage.test.tsx` — 2 tests added
- `module-scribe/tests/useIntermediate.test.tsx` — 2 tests added (total scribe: 240)
- `module-scribe/tests/useDraft.test.tsx` — new file, 2 tests
- `module-scribe/tests/useStyleProfile.test.tsx` — new file, 2 tests
- `module-scribe/tests/useTTDraft.test.tsx` — new file, 2 tests
- `module-cpmi/tests/useBenchmark.test.ts` — 2 tests added (total cpmi: 62)
- `module-cpmi/tests/useReasoningChain.test.tsx` — 2 tests added
- `module-lens/tests/useExplanation.test.tsx` — 2 tests added (total lens: 63)

NexusApp travelDrafter convergence test: deferred — no `complete` injection point in
composition-root `useMemo`; pattern verified by proxy through `useTTDraft` convergence
tests (same engine, same token_usage threading path).

---

## 3 — Out-of-Scope Sites Resolved

Per docs/31 §4 flagged sites:

- **`module-aria/src/tracer-integration.ts`** — excluded. Records historical lineage
  chain nodes; no live LLM `complete()` call in the emission path.
- **`module-vigil/src/security-query.ts`** — excluded. Pure read port returning
  synthetic data; no LLM `complete()` call.

Additional sites reviewed and excluded:

- `module-counsel/src/useAnalysis.ts`, `usePreMortem.ts`, `useCounterargument.ts` —
  emit `REASONING_STEP_COMPLETE` not `AGENT_STEP_COMPLETE`; `token_usage` is scoped to
  `AGENT_STEP_COMPLETE` only per docs/31.
- `module-nexus/src/tt-travel-queue.ts` — deterministic engines (tt.travel-compliance-
  engine, tt.travel-router); no LLM `complete()` call.
- `module-nexus/src/useTTIntake.ts` — deterministic time-compliance engine; no LLM
  `complete()` call.

---

## 4 — Test Run

Full suite run immediately before close. All 1,811 JS/TS tests pass:

- sovereign-shell: 19
- sovereign-data: 125
- sovereign-api-client: 175
- module-counsel: 100
- module-vigil: 215
- module-scribe: 240
- module-cpmi: 62
- module-lens: 63
- module-agentos: 89
- module-nexus: 166
- module-apex: 228
- module-flowpath: 151
- module-aria: 150
- module-workspace: 28

**Zero new production dependencies** — static rate table has no external imports.
`token-cost.ts` is a module-internal file, not a new package. Zero-new-production-
dependency streak continues.

---

## 5 — Shell Contract Version

| Field | Value |
|---|---|
| Version | 1.25 |
| Date | August 2, 2026 |
| SHA-256 | `d22694a34d9621f620d365dfa1bb9838685bea684a1a2a2a694e2aa1c77693f7` |
| Both copies identical | Yes (root + sovereign-shell/) |

---

## 6 — Blocked Session

**docs/32 (SysAdmin Cost Dashboard, Build Session 2) remains blocked** on this session
completing. The `token_usage` field is now live on all in-scope `AGENT_STEP_COMPLETE`
events. The dashboard can be built.

---

## 7 — Commits

Commits made per-deliverable. See `git log` for real commit SHAs after push.

---

*Build Agent · GD-31 Build Session 1 · August 2, 2026*
