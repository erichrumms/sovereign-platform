# docs/31 (provisional) — Token & Cost Telemetry: Real Usage Data Into the Logger

**Prepared by:** Governance Agent, August 1, 2026
**Status:** Pre-Decisional · Internal Working Document — ready to scope as a Build Agent session
**Governance Decision:** **GD-31 (provisional — confirm against the live GD Registry and
DOCUMENT_MANIFEST before formal assignment. This document's own numbering is subject to the
same Rule 17 discipline it describes elsewhere in this project: a number appearing correct in
a chat conversation is not the same claim as it being correct in the repo.)**
**Origin:** Direct code verification, August 1, 2026, in response to the Project Principal's
question about total-cost-of-ownership visibility for the SYSTEM_ADMIN role.
**Build order:** **Session 1 of 2.** Session 2 (`docs/32`, the SysAdmin Cost Dashboard) depends
entirely on this session's output — there is no real cost data to display until this ships.

---

## 1 — What's already confirmed, by direct read, not assumed

1. **Real token counts already exist at the point of every live model call.**
   `sovereign-api-client`'s `complete()` methods (`anthropic-client.ts`, `base-client.ts`,
   `govcloud-client.ts`) already return `usage: { input_tokens: number; output_tokens: number }`
   on every successful call. Confirmed directly in the implementation and its own test suite
   (`test_base_client.test.ts`, `test_anthropic_client.test.ts`).
2. **None of that usage data currently reaches the Logger.** Every `AGENT_STEP_COMPLETE` emission
   site inspected builds its `payload` from the *outcome* of the call (tier, fallback status,
   request/registry IDs) — never the `usage` object. It's available at the call site and
   discarded before `ctx.logger.log()` is ever called.
3. **A structurally identical precedent already exists and is already shipped.**
   `SovereignLogEvent.deployment_feedback` (`shell-contract.ts:757`) —
   `automatability_score`, `human_time_seconds`, `agent_time_seconds` — is an optional field
   already carried on `AGENT_STEP_COMPLETE` events, added to feed a future consumer (the
   Intelligence Layer) that doesn't fully exist yet. `token_usage` is the same shape of change,
   same location, same kind of forward-looking instrumentation — not a new pattern being invented.
4. **The Logger's write path needs no modification to accept this.** `ShellLogger.log()`
   (`shell.ts:211`) is a synchronous, append-only, generic `SovereignLogEvent` sink.

---

## 2 — The exact change

**`SovereignLogEvent`** (`shell-contract.ts`, both copies) gains one optional field, scoped to
`AGENT_STEP_COMPLETE` events:

```typescript
export interface SovereignLogEvent {
  // ...existing fields, unchanged...
  // AGENT_STEP_COMPLETE events — real usage from the model provider response.
  // Present only when a live call actually occurred; absent (never zero) when
  // FALLBACK_ACTIVATED served the response instead, since no live usage exists to report.
  token_usage?: {
    input_tokens: number;
    output_tokens: number;
    estimated_cost_usd?: number; // computed from a versioned static rate table — §3
  };
}
```

**Why absent, not zero, on fallback:** a `0` reads as "this call cost nothing," which is false —
it would silently understate total cost rather than honestly excluding a call that never went
live. Absence lets any future consumer (including Session 2's dashboard) distinguish "no data"
from "verified zero" — the same honesty discipline already applied elsewhere in this project
(ARC's "no seeded exhibit" disclosure, the Activity panel's session-scope banner).

## 3 — Cost calculation: a versioned static table, not a live pricing lookup

**Recommendation, worth confirming before build starts:** compute `estimated_cost_usd` from a
small, versioned, hardcoded rate table (dollars per 1K input/output tokens, keyed by model), not
a live external pricing API call. This preserves the arc's own standing record of **zero new
production dependencies** — already cited as real evidence of low integration risk in the
Strategic Plan. The table needs a code comment stating its pricing date and a manual-update
reminder. It does not need to be perfectly current to be useful — the more actionable question
for a SysAdmin is usually *relative* cost (which product or agent is expensive relative to the
others), not the exact dollar figure to the cent.

## 4 — Where the change actually happens — the real build-session checklist

The shell-contract field addition is small. **The bulk of this session's work is threading the
real `usage` object from each `complete()` call, up through its owning engine function, into its
owning hook, so it reaches the `AGENT_STEP_COMPLETE` emission with real numbers.** No new numbers
are synthesized anywhere in this session.

**Emission sites confirmed by direct grep, August 1, 2026 — a checklist to verify at build-session
start, not a claim that every site needs identical treatment:**

| Module | File | Agent step |
|---|---|---|
| VIGIL | `useApprovalBrief.ts` | vigil-approval-agent |
| VIGIL | `useTriage.ts` | vigil-triage-analyst |
| SCRIBE | `useTTDraft.ts` | scribe drafter (T&T) |
| SCRIBE | `useDraft.ts` | scribe-drafter |
| SCRIBE | `useStyleProfile.ts` | scribe-style-analyst |
| SCRIBE | `useIntermediate.ts` | scribe drafter (intermediate) |
| NEXUS | `tt-travel-queue.ts` | tt.travel-compliance-engine, tt.travel-router (two steps) |
| NEXUS | `useTTIntake.ts` | intake step |
| NEXUS | `NexusApp.tsx` | draft-gate step |
| CPMI | `useBenchmark.ts` | benchmark step |
| CPMI | `useReasoningChain.ts` | cpmi.reasoning-chain |
| LENS | `useExplanation.ts` | lens-explainer |
| COUNSEL | `useAnalysis.ts`, `usePreMortem.ts`, `useCounterargument.ts` | **Verify event-type name first.** Their own tests reference `REASONING_STEP_START/COMPLETE`, which may not be the same event type as `AGENT_STEP_COMPLETE`. Confirm before assuming these three are in scope for this change at all. |

**Two sites explicitly flagged for a scope decision at build time, not silently included or
excluded by this document:**
- `module-aria/src/tracer-integration.ts` — appears to record a *historical/lineage*
  `AGENT_STEP_COMPLETE` node for TRACER's document chain, not a live call in progress. Likely out
  of scope (no new usage to capture) — confirm directly rather than assume.
- `module-vigil/src/security-query.ts` — its own test fixture includes a `synthetic: true` flag,
  suggesting demo/synthesized data rather than a real live call. Likely out of scope for the same
  reason — confirm directly.

## 5 — Done Condition

1. `token_usage` (optional, `AGENT_STEP_COMPLETE` only) added to `SovereignLogEvent` in both
   shell-contract copies, identical, SHA-256 re-verified. Shell-contract version bumped — confirm
   the real current version first (this document assumes v1.24 per the last verified state; do
   not carry that forward blindly).
2. Versioned static rate table added (exact location TBD at build time — likely
   `sovereign-api-client` or a shared constants file), with a code comment stating its pricing
   date.
3. Every confirmed-in-scope emission site (§4) threads the real `usage` object from its
   `complete()` call through to its `AGENT_STEP_COMPLETE` emission's `token_usage` field.
4. Every `FALLBACK_ACTIVATED` path confirmed to leave `token_usage` absent (not zero) on its
   paired `AGENT_STEP_COMPLETE` event.
5. A convergence test per emission site (or one shared test helper reused per site, matching the
   existing per-hook test pattern already in place, e.g. `useApprovalBrief.test.tsx`'s own
   event-sequence assertions) confirming `token_usage` is populated from the mock client's real
   `usage` response — not hardcoded in the test.
6. The two flagged sites (§4) explicitly resolved — either included with the same treatment, or
   excluded with a one-line reason recorded in the session's Handoff, not silently skipped.

## 6 — Explicitly out of scope for this build session

- Any dashboard, screen, or UI surface — that's Build Session 2 (`docs/32`), and depends on this
  session's output.
- Any persistent, cross-session storage of cost data — Stage 2 (`docs/28`) remains a separate,
  undecided question, unaffected by this change.
- Any live external pricing API call — the static table (§3) is the v1 answer.
- Budget thresholds, alerts, or spend ceilings — a possible future enhancement, not v1.

---

*docs/31 (provisional) — Token & Cost Telemetry · August 1, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
*Build Session 1 of 2 — Session 2 (SysAdmin Cost Dashboard) depends on this session's completion*
