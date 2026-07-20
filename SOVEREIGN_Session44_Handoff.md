# SOVEREIGN Platform — Session 44 Handoff
**Date:** 2026-07-19  
**Session:** 44  
**Governance Document:** GD-23  
**Feature:** ProgramStatusSurface — Cross-Module Program Obligation Status  
**Shell-contract version:** v1.18  
**Commit:** 3f0db9d

---

## Done-Condition Traceability

| Done Condition | Status | Evidence |
|---|---|---|
| D1 — ProgramStatusSnapshot + ProgramStatusSurface in both shell-contract copies; ShellProgramStatusSurface in shell.ts; SHA-256 identical | DONE | SHA below; both copies match; class in sovereign-shell/src/shell.ts |
| D2 — APEX publishes ProgramStatusSnapshot per program when data loads | DONE | publishProgramStatuses() in module-apex/src/ppbe-dashboard.ts; called in ApexApp.tsx useEffect |
| D3 — VIGIL describeWhatChanges() ppbe_obligation case reads from surface (WF-20 resolution) | DONE | approval-engine.ts ppbe_obligation case; surface optional, backward-compat preserved |
| D4 — Convergence test: publish from APEX side, read from VIGIL side, one shared ctx, Session 35 style | DONE | e2e/tests/apex-vigil-program-status-convergence.test.ts; 9 tests, all pass |

---

## SHA-256 Hash of Record — shell-contract v1.18

```
a03d4b21ffdae3621d82d8378e5cd5cb8b2b09800719cca602ef1f03efdec7c7  shell-contract.ts
a03d4b21ffdae3621d82d8378e5cd5cb8b2b09800719cca602ef1f03efdec7c7  sovereign-shell/shell-contract.ts
```

Both copies identical. Constraint #11 satisfied.

Command used: `shasum -a 256 shell-contract.ts sovereign-shell/shell-contract.ts`

---

## GD-23 Impact Assessment

**HumanDecisionType:** No change. No new decision types added or modified.  
**SovereignEventType:** No change. No new event types added or modified.  
**AgentClass:** No change. No new agent classes added or modified.

ProgramStatusSurface is a read/write data surface (11th SovereignShellContext export), not a governance type. It does not affect the approval workflow schema, event taxonomy, or agent classification.

---

## Numeric Field Trace (Rule 8 Compliance)

Per Rule 8, actual code paths were traced before coding:

- **Source field:** `ObligationRateMetric.rate_percent` (type: `number | null`)
- **Computed by:** `obligationRate()` in `module-apex/src/ppbe-dashboard.ts`
- **Formula:** `Math.round((totalObligated / totalPlanned) * 100)` — returns `null` when `totalPlanned === 0`
- **Mapped to:** `ProgramStatusSnapshot.percent_obligated` (with `?? 0` coalesce for null)
- **Narrative source:** `ObligationRateMetric.narrative` — pre-composed, human-readable prose

Field confirmed as numeric before any publishing code was written.

---

## Threshold Rule for `statusFromObligationRate`

Build Agent judgment per spec (docs/20 did not specify exact thresholds):

| Rate | Status |
|---|---|
| `null` | `off_track` |
| `< 50` | `off_track` |
| `50 – 79` | `at_risk` |
| `≥ 80` | `on_track` |

Rationale: null/below-50% indicates the program has not yet committed more than half its planned funds — materially at risk. 50–79% is tracking but not on pace. 80%+ is on track for the fiscal period.

Test coverage in convergence test (`statusFromObligationRate thresholds`, 4 cases): boundary at 50, boundary at 79/80, null case.

---

## Files Changed

| File | Change |
|---|---|
| `shell-contract.ts` | v1.17 → v1.18; added ProgramStatusSnapshot, ProgramStatusSurface types; 11th export in SovereignShellContext |
| `sovereign-shell/shell-contract.ts` | Identical copy (cp from root); SHA-verified |
| `sovereign-shell/src/shell.ts` | Added ShellProgramStatusSurface class; wired as this.programStatusSurface in SovereignShell constructor |
| `module-apex/src/ppbe-dashboard.ts` | Added statusFromObligationRate(), publishProgramStatuses() |
| `module-apex/src/ApexApp.tsx` | Added useEffect to call publishProgramStatuses on mount |
| `module-vigil/src/approval-engine.ts` | ppbe_obligation case reads ProgramStatusSurface; BriefDeps.programStatusSurface optional field; staticBrief() signature updated; Tier 3 forwards surface |
| `module-apex/tests/test-helpers.tsx` | Added createInMemoryProgramStatusSurface(); wired into makeCtx() to fix 4 failing tests |
| `e2e/tests/harness.tsx` | Added createInMemoryProgramStatusSurface(); wired into makeCtx() |
| `e2e/tests/apex-vigil-program-status-convergence.test.ts` | NEW — D4 convergence test (9 tests) |

---

## Spec-vs-Codebase Reconciliations

1. **docs/20 was not on disk at session start.** Rule 6 Hard Stop triggered. User pasted spec content directly. No deviation from spec in implementation.

2. **Threshold values not specified in docs/20.** Build Agent chose ≥80/50–79/<50 thresholds (documented above). Governance Agent approved GD-23 before implementation.

3. **`publishProgramStatuses` placement.** Spec said "APEX publishes" — placed in `ppbe-dashboard.ts` alongside `obligationRate()` (computation co-location pattern). Called from `ApexApp.tsx` via `useEffect`. Testable because `nowIso` is a parameter (no `Date.now()` in the function body).

4. **Pre-existing TypeScript errors.** `tsc --noEmit` exits 2 due to 6 pre-existing errors (Vite-specific `.md?raw` imports in APEX/NEXUS/SCRIBE; unused vars in VIGIL). Zero new errors introduced by GD-23.

---

## Test Results

| Workspace | Suites | Tests |
|---|---|---|
| @sovereign/data | 9 | 125 |
| @sovereign/api-client | 10 | 175 |
| module-counsel | 13 | 100 |
| module-apex | 24 | 220 |
| module-nexus | 29 | 177 |
| (other modules) | 9+16+17+18 | 58+58+89+159 |
| module-aria | 24 | 193 |
| module-flowpath | 12 | 135 |
| module-agentos | 13 | 139 |
| e2e | 7 | 128 (124 passed, 4 skipped) |

**Total: 201 suites, 1752 passed, 4 skipped, 0 failed.**

4 skipped tests are pre-existing live smoke tests requiring a real API key (`ppbe-live-smoke.test.ts`). No new skips introduced.

**New tests from GD-23:**
- `e2e/tests/apex-vigil-program-status-convergence.test.ts` — 9 tests
- `module-apex/tests/ppbe-dashboard.test.ts` — existing suite, already covered `statusFromObligationRate` (confirmed green)

---

## Standing Constraints Status

| Constraint | Status |
|---|---|
| #5 — All LLM calls through sovereign-api-client | No new LLM calls in GD-23 |
| #7 — Shell context export count (now eleven) | Updated: Section 7 comment reads "ELEVEN exports" |
| #11 — Both shell-contract copies SHA-identical | Verified: a03d4b21… |

---

## WF-20 Resolution

WF-20 (VIGIL ppbe_obligation brief lacks program financial context) is resolved. The `ppbe_obligation` case in `describeWhatChanges()` now appends `Current program status: <narrative>` when a snapshot is available on the surface. The surface is populated by APEX on mount via `publishProgramStatuses`. The convergence test (D4) exercises the full loop end-to-end.

---

## Next Session Candidates

Per `docs/` strategic plan: Round 2 post-TestFlight fixes (crash safety, coaching errors, Strava timeouts) are unrelated to SOVEREIGN. Within SOVEREIGN, the principal should consult the Strategic Plan for the next GD number and feature scope.
