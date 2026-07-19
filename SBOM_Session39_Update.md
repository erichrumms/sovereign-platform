# SBOM Session 39 Update
**Date:** July 18, 2026 · **Session:** 39 (Walkthrough F Repeat Pass — Findings Remediation)
**For merge into:** SBOM Registry

---

## New Components

None. This session made no new files and added no new packages.

---

## Changed Components

| Component | Path | Change |
|---|---|---|
| approval-engine | `module-vigil/src/approval-engine.ts` | Added `describeWhatChanges()` private helper with plain-prose per-action-type descriptions for all 6 action types. Rewrote `staticBrief()` to use it — field-dump output replaced with grammatically complete sentences. Section headers and service-unavailable notice preserved for test contract. |
| ppbe-exhibit-engine | `module-scribe/src/ppbe-exhibit-engine.ts` | `staticExhibitDraft()` restructured: EVALUATION_REPORT mode early-returns with finding-based figures (`value: 1`, cite `f.workflow_step_id`). No change to BUDGET_EXHIBIT or CONGRESSIONAL_JUSTIFICATION logic. |
| vigil-types | `module-vigil/src/vigil-types.ts` | Added `formatIso(iso: string): string` display helper (ISO 8601 → "Jun 23, 2026, 12:00 PM"; falls back to raw string on parse failure). |
| AlertQueue | `module-vigil/src/AlertQueue.tsx` | Uses `formatIso` on `alert.timestamp` in the card meta line. |
| AlertDetail | `module-vigil/src/AlertDetail.tsx` | Uses `formatIso` on `alert.timestamp` in the Detected row. |
| ApprovalQueue | `module-vigil/src/ApprovalQueue.tsx` | `actionContext()` extended from 2 to 6 cases: adds `model_deployment` (model → target), `data_export` (dataset → destination), `configuration_change` (parameter: from → to), `send_formal_escalation_notice` (employee_id · rule_category). Uses `formatIso` on `request.submitted_at`. Queue component aria-label and heading text renamed "Actions Awaiting Your Approval" (was "Agent Approval Queue"). |
| ApprovalDetail | `module-vigil/src/ApprovalDetail.tsx` | Added `onDecisionMade?: (requestId, action, agentId, actionType) => void` optional prop; called before `onDecided` on success. `onDecided(requestId: string)` signature unchanged. Uses `formatIso` on submitted_at and expires_at display rows. |
| VigilApp | `module-vigil/src/VigilApp.tsx` | Adds `lastDecision` state + `expiredRequestCount` state. Dismissible green confirmation banner (`role="status"`) fires after each decision. Amber expired-request notice renders for any requests expired at mount. `onDecisionMade` prop wired to `<ApprovalDetail>`. Approvals tab button label renamed "Actions Awaiting Your Approval". |
| TTManagerReview | `module-scribe/src/TTManagerReview.tsx` | Queue list buttons now use `aria-pressed`, inline selection highlight matching VIGIL's pattern (border `#0c4a6e`, bg `#e0f2fe`). List converted to flex-column without browser-default bullets. |
| PPBECoordinationPanel | `module-nexus/src/PPBECoordinationPanel.tsx` | Added amber static-tier warning paragraph above the trigger button (pre-click, always visible). Notes textarea initialized with `.trim()` to remove the leading newline from `SYNTH_PPBE_MEETING_NOTES`. |
| PPBEDashboard | `module-apex/src/PPBEDashboard.tsx` | Subtitle condensed to `PPBE Phase 5 · obligation rate · variance · dependency health · learning velocity` (was a two-line prose block). |
| GateRunnerPanel | `module-apex/src/GateRunnerPanel.tsx` | `severityWord()` now returns "Risk Level 1/2/3" instead of "Priority 1/2/3" to eliminate display collision with VIGIL's P1/P2/P3 urgency scale. |
| ReportCharts | `module-apex/src/ReportCharts.tsx` | Inline severity caption updated from "Priority N risk" to "Risk Level N risk". |

---

## Changed Tests

| File | Change |
|---|---|
| `module-apex/tests/ReportCharts.test.tsx` | Assertion updated from `/Priority 2 risk/` to `/Risk Level 2 risk/` following GateRunnerPanel/ReportCharts rename. |
| `module-vigil/tests/VigilApp.test.tsx` | Tab click and aria-label queries updated from "Agent Approval Queue" to "Actions Awaiting Your Approval". |
| `module-vigil/tests/VigilAppObligation.test.tsx` | Tab click queries updated (both instances). |

---

## Unchanged Governance Artifacts

- **Shell contract:** v1.16, both copies SHA-256
  `521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7` — verified
  at open and close, never touched. No GD this session.
- **Agent registry:** 44 — unchanged. No agent registered or deregistered.
- **Prompt registry:** 20 registered (19 approved + 1 pending) — unchanged.
- **Production packages:** no additions, no removals, no version changes.
- **sovereign-data:** 1.6.0 — unchanged (no entity or seed change this session).

---

## Test Count Totals

| Suite | Count |
|---|---|
| sovereign-data | 125 |
| sovereign-api-client | 175 |
| module-counsel | 100 |
| module-scribe | 220 |
| module-vigil | 177 |
| module-lens | 58 |
| module-cpmi | 58 |
| module-agentos | 89 |
| module-nexus | 156 |
| module-apex | 191 |
| module-flowpath | 133 |
| module-aria | 139 |
| e2e | 107 passing (+ 4 key-gated skipped) |
| **JS/TS passing** | **1728** |
| Python (sovereign-security) | **195** |
| **Platform total passing** | **1923** (+ 4 key-gated) |

Delta vs. Session 38 baseline (1724 JS/TS): +4 (pre-existing count gap — 0 net new tests added this session; 3 test files modified with updated assertions).

---

## Commits

Single commit. Base: `8b37d5a`. All on `main`.

---

*SBOM_Session39_Update.md · July 18, 2026*
