# SBOM Session 35 Update
**Date:** July 13, 2026 · **Session:** 35 (Combined: PPBE smoke harness · cross-module gap fix · prompt count reconciliation)
**For merge into:** SBOM Registry (current merged registry v1.35; backlog after this update spans Sessions 27–35)

---

## New Components

| Component | Path | Kind | Notes |
|---|---|---|---|
| tt-escalation-surface | `module-vigil/src/tt-escalation-surface.ts` | Internal source (module-vigil) | Publishes decided TT formal-escalation authorizations to ctx.taskSurface (GD-19). No new package. |
| useVigilEscalationAuthorizations | `module-scribe/src/useVigilEscalationAuthorizations.ts` | Internal source (module-scribe) | Subscribes to ctx.taskSurface; returns the live-authorized ComplianceFlag id set. |
| tt-escalation-surface tests | `module-vigil/tests/tt-escalation-surface.test.ts` | Tests (11) | Classification, publish mechanics, decision-path matrix incl. Gate 2 blocking. |
| useVigilEscalationAuthorizations tests | `module-scribe/tests/useVigilEscalationAuthorizations.test.tsx` | Tests (8) | Hook set semantics + TTManagerReview in-place flip. |
| tt-vigil-scribe convergence | `e2e/tests/tt-vigil-scribe-convergence.test.tsx` | Tests (2) | Live cross-module scenario: real VIGIL hook + real SCRIBE component, one shared ctx. |
| ppbe-live-smoke harness | `e2e/tests/ppbe-live-smoke.test.ts` | Tests (8 registered: 4 hermetic fail-closed + 4 key-gated live) | First execution of the four APPROVED PPBE prompt files against the full Session 33 seed. Live half requires RUN_PPBE_LIVE_SMOKE=1 + ANTHROPIC_API_KEY. |

## Changed Components

| Component | Path | Change |
|---|---|---|
| useApprovalDecision | `module-vigil/src/useApprovalDecision.ts` | Publishes decided TT escalations to taskSurface after the Logger emit (APPROVE/REJECT only). |
| TTManagerReview | `module-scribe/src/TTManagerReview.tsx` | Sendable = seeded state OR live VIGIL authorization (useVigilEscalationAuthorizations). |
| vigil test helpers | `module-vigil/tests/test-helpers.tsx` | +createInMemoryTaskSurface, +taskSurface on makeCtx. |
| scribe test helpers | `module-scribe/tests/test-helpers.tsx` | +createInMemoryTaskSurface, +taskSurface on makeCtx. |

## Unchanged Governance Artifacts

- **Shell contract:** v1.16, both copies SHA-256 `521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7` — verified at open and close, never touched. No GD this session.
- **Agent registry:** 44 — unchanged, no new agents.
- **Prompt registry:** **20 registered = 19 approved + 1 pending (PR-SCRIBE-004)** — CONFIRMED by direct on-disk census this session (Part 3). No prompt file added, edited, or re-statused. PR-SCRIBE-004 = `module-scribe/prompts/style-analysis-system-v1.0.md` (registered 2026-06-17, `module-scribe/prompts/CHANGELOG.md`). Historical note for the registry record: Sessions 27–30 handoffs' "Approved prompts: 16" was the *registered* count (15 approved + 1 pending at that time).
- **Production packages:** no additions, no removals, no version changes. `npm audit --omit=dev`: 0 vulnerabilities.
- **sovereign-data:** 1.6.0 — unchanged (no entity or seed change).

## Test Count Totals (exit codes verified per workspace)

| Suite | Count |
|---|---|
| JS/TS passing | **1705** (data 125 · api-client 174 · counsel 100 · scribe 216 · vigil 167 · lens 58 · cpmi 58 · agentos 89 · nexus 153 · apex 186 · flowpath 133 · aria 139 · e2e 107) |
| JS/TS key-gated (skipped by design) | 4 (e2e live smoke — e2e registers 111) |
| Python | **195** |
| **Platform total passing** | **1900** |

Delta vs. Session 33 / wrap-up (1875): +25 passing (vigil +11, scribe +8, e2e +6) + 4 gated.

## Commits

`26cb198` (Part 2 — gap fix) · `c8a5ff4` (Part 1 — smoke harness) · session-close docs commit. Base: `45a35b2`. All on `main`.

---
*SBOM_Session35_Update.md · July 13, 2026*
