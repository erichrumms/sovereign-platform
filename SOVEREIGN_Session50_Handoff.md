# SOVEREIGN Platform — Session 50 Handoff
**GD-25: Reviewer's Workspace, v1 (docs/23)**
Date: 2026-07-20 | HEAD at session open: `d0339f7` | HEAD at close: see `git log -1`

---

## Done Conditions — Status

| Requirement | Status |
|---|---|
| D1: Shell-contract v1.20 (both copies), `WorkspaceReviewItem` + `ReviewerWorkspaceSurface`, SHA-256 identical | DONE |
| D1: `ShellReviewerWorkspaceSurface` implemented in `sovereign-shell/src/shell.ts` (thirteenth export) | DONE |
| D2: VIGIL, ARIA, SCRIBE publish full native objects on load/change | DONE (trace below) |
| D2: `remove()` on each decision-commit path (VIGIL `onDecided`, ARIA certify handler, SCRIBE `onSent`) | DONE (trace below) |
| D3: `module-workspace` — new top-level module, five-role union gate, three per-section-gated panels, real embedded components, type-only-import narrowing | DONE |
| D4: Three convergence tests (one per publishing module), publish-from-source → render/remove-from-Workspace, one shared ctx | DONE (4 tests — 3 module loops + surface-semantics) |
| Full test suite, real exit codes | DONE (below — all 15 workspaces exit 0) |
| SHA-256 verbatim in handoff | DONE (below) |
| GD-25 impact assessment confirmed explicitly | DONE (below) |
| Role-gating verified for the five live-tested roles | DONE (below) |
| `SOVEREIGN_Session50_Handoff.md` + `SBOM_Session50_Update.md` committed and pushed | DONE (this commit; push output shown at session close) |

D1 was completed and SHA-verified **before** any D2/D3 work began (hard sequencing gate honored).

---

## Shell Contract — v1.20 SHA-256 (Constraint #11)

```
22ee233525ac2c636153cb604ec6a7c1822889a02f9d38bfbc0dda3d921f63d3  shell-contract.ts
22ee233525ac2c636153cb604ec6a7c1822889a02f9d38bfbc0dda3d921f63d3  sovereign-shell/shell-contract.ts
```

Both copies are **identical**. This is the v1.20 hash of record for GD-25.
(v1.19 hash at session open, verified before editing: `00d4a6424db153f68b5876cc1874877e0e3171d720ade9dcf3ff28a53f3b24d0` — both copies.)

---

## GD-25 Impact Assessment (stated explicitly, per the opening prompt)

**Governance decision:** GD-25 (approved by the Project Principal, July 20, 2026) authorizes exactly two new types on the shell contract, per docs/23 §2's exact interface: `WorkspaceReviewItem` and `ReviewerWorkspaceSurface`. The shell contract advances v1.19 → v1.20. Constraint #7 export count: twelve → thirteen (`reviewerWorkspaceSurface`).

- **`HumanDecisionType` — UNAFFECTED.** No member added, renamed, or removed. Nothing to propagate to `sovereign-data/src/shared-types.ts` or the Python logger (Constraint #11 has nothing to sync beyond the two shell-contract copies themselves).
- **`SovereignEventType` — UNAFFECTED.** The surface carries no new event; every decision made through the Workspace emits the source module's **existing** governed events (`AGENT_ACTION_*`, `ARIA_CERTIFICATION_ISSUED`/`ARIA_VIOLATION_FLAGGED`, `HUMAN_DECISION`/`TIME_CORRECTION_SENT`).
- **`AgentClass` — UNAFFECTED.** The Workspace registers no agents (Constraint #10); no class change.
- Also unaffected: `SovereignRole`, `SovereignProduct`, `SovereignModuleContract`. Additive only: two new exported types, one new context field.
- **`AgentApprovalRequest`, `ClearEvaluationInput`, `TTReviewItem` consumed AS-IS** (docs/23 §6) — none added, renamed, or reshaped. The payload is `unknown` on the contract; the Workspace module does the narrowing via type-only imports (the `module-agentos/src/approval-port.ts` precedent, per §2).
- **No other GD executed.** No part of the deferred v1.1 state-preserving navigation (docs/23 §1 item 4) was built.

---

## Rule 8 Trace — exactly where `publish()` / `remove()` were inserted

### VIGIL
- **Item assembly traced to:** `VigilApp.tsx` — `initialRequests` (dev port `createDevApprovalPort(anchorIso).listPending()` + `makeDemoTTApprovalRequest` + the PPBE obligation case's `approval_request`) feeding `useApprovalQueue`; the live pending queue is `approvals.requests` (the hook's sorted state).
- **publish:** new `useEffect` in `VigilApp.tsx` (immediately after the GD-24 work-queue effect), keyed on `approvals.requests` → `publishVigilWorkspaceItems(approvals.requests, demoPPBEObligationCase, ctx.reviewerWorkspaceSurface, timestamp)` — new helper `module-vigil/src/vigil-workspace-publisher.ts`. `item_id` = `request_id`. **Payload = `VigilWorkspacePayload { request, obligationCase? }`** — the obligation case attaches only to the request whose `action_type === "ppbe_obligation"` and matching `request_id`. This composite is required because `ApprovalDetail`'s Tier C gate (docs/18 §6 — `ObligationDecisionPanel` + COUNSEL Decision Record ID) cannot render without `obligationCase`; both members are the real objects VigilApp already assembled — nothing reshaped.
- **remove:** `VigilApp.tsx` `ApprovalDetail` `onDecided` now calls `reviewerWorkspaceSurface.remove("vigil", requestId)` before `approvals.remove(requestId)`; the Workspace's own VIGIL panel `onDecided` does the same. The publisher additionally reconciles away any published item no longer in the live queue — this covers the `expireOverdue` auto-reject path so an expired request also leaves the Workspace.

### ARIA
- **Item assembly traced to:** `ClearCertificationQueue.tsx` — the `items` prop **default** `DEMO_ITEMS` (now exported as `CLEAR_DEMO_ITEMS`); "pending" = no record on `ctx.aria` (GD-20 surface). `AriaApp` itself held only a derived count, not the items — the opening prompt's "don't assume a variable name" warning was warranted.
- **publish:** new `useEffect` in `AriaApp.tsx` → `publishAriaWorkspaceItems(pendingItems, ctx.reviewerWorkspaceSurface, timestamp)` — new helper `module-aria/src/aria-workspace-publisher.ts`. `pendingItems` = `CLEAR_DEMO_ITEMS.filter(statusOf === "pending")`, derived via the existing `useAriaCertifications` hook (which replaced AriaApp's hand-rolled count subscription — same subscription source, Constraint #2; the GD-24 published count is unchanged in value, now derived from the actual pending items). `item_id` = `document_id`; payload = the full `ClearEvaluationInput`.
- **remove:** `ClearCertificationQueue.tsx` `decide()` — **the certify handler** — calls `ctx.reviewerWorkspaceSurface.remove("aria", input.document_id)` immediately after `ctx.aria.record(...)`. Because removal lives in the component's own decision-commit path, it fires whether the decision is made in ARIA or in the Workspace embed.

### SCRIBE
- **Item assembly traced to:** `ScribeApp.tsx` — passes `DEMO_TT_REVIEW_ITEMS` (`tt-synthetic-review.ts`, seeded from canonical `@sovereign/data` SYNTH records) to `TTManagerReview`.
- **publish:** new `useEffect` in `ScribeApp.tsx` → `publishScribeWorkspaceItems(DEMO_TT_REVIEW_ITEMS, ctx.reviewerWorkspaceSurface, timestamp)` — new helper `module-scribe/src/scribe-workspace-publisher.ts`. `item_id` = `ttReviewItemKey(item)` — the component's own private `itemKey` (selection/sent-state identity), renamed and **exported** so the publisher and the Workspace reuse one derivation (Constraint #2, no divergent duplicate). Payload = the full `TTReviewItem`.
- **remove:** `TTManagerReview`'s `onSent` callback — now wired at **both** call sites: `ScribeApp.tsx`'s `<TTManagerReview onSent={...}>` and the Workspace's SCRIBE panel — calls `remove("scribe", ttReviewItemKey(item))` after the manager records a send. Travel-kind decisions route to NEXUS (docs/17) and are untouched, per the mandate (only `onSent` is a SCRIBE decision-commit).

**Remount semantics (deliberate, per source-module behavior):** VIGIL and SCRIBE queues are session-local component state — on module remount they re-seed and re-publish, exactly mirroring their own queues. ARIA decisions persist on `ctx.aria` (shell-owned), so the pending filter keeps decided documents out of the Workspace across remounts. The surface mirrors each module's real queue semantics — it invents no persistence the source doesn't have.

---

## D3 — module-workspace

New package `@sovereign/module-workspace` (root `package.json` workspaces + `test:workspace` script):

- `module-workspace/src/index.ts` — `SovereignModuleContract`: `moduleId "module-workspace"`, `mountPath "/workspace"`, `displayName "Reviewer's Workspace"`, `minimumRole` = the five-role union per docs/23 §3 (`PLATFORM_ADMIN`, `SYSTEM_ADMIN`, `COMPLIANCE_OFFICER`, `PROGRAM_MANAGER`, `ANALYST` — the ARIA/GD-22 module-gate pattern), `agentCards: []`, structural mount gate (fail-closed, throws `ModuleAccessDeniedError`).
- `module-workspace/src/WorkspaceApp.tsx` — three per-section-gated panels using `SECTION_ROLES`/`canAccessSection`/`LockedSectionNotice` — **the exact `TAB_ROLES`/`canAccessTab` shape from `AriaApp.tsx`** (Sessions 41/49 instruction honored; no second gating mechanism). Sections: VIGIL (admins only) → real `ApprovalQueue` + `ApprovalDetail` (with `obligationCase` pass-through); ARIA (`COMPLIANCE_OFFICER` + admins) → real `ClearCertificationQueue`; SCRIBE (`PROGRAM_MANAGER`/`ANALYST` + admins) → real `TTManagerReview`. Each panel reads `ctx.reviewerWorkspaceSurface.list()` (via `useReviewerWorkspaceItems`), narrows by `module_id` with **type-only imports** (`VigilWorkspacePayload`, `ClearEvaluationInput`, `TTReviewItem`), and passes the narrowed payload straight through as props — no reshaping. Disabled tabs show honest role tooltips; empty sections state plainly that items appear as source modules publish this session.
- `module-workspace/src/useReviewerWorkspaceItems.ts` — subscribe hook (the `useAriaCertifications` shape).
- Registered in `sovereign-shell/src/register-modules.ts`.

**RECONCILIATION (surfaced, not hidden) — loader `MODULE_PRODUCT`:** the loader requires a `SovereignProduct` per module; the frozen union has no `WORKSPACE` member, and adding one is a shell-contract change GD-25 does **not** authorize. `module-workspace` maps to the **nearest existing product, `VIGIL`** (the module whose entire domain is "actions awaiting a human decision") — a loader bookkeeping entry only (tier + product on shell health-fallback events; embedded components emit under their own real products). Same posture as NEXUS's "nearest existing role" gate (Session 15). **A dedicated `WORKSPACE` product member is flagged for a future GD.** The loader's contract-validation message now reads "eleven canonical modules."

---

## Role-Gating Verification (the five roles live-tested this evening — Session 49 set)

Module gate = the five-role union; per-section per docs/23 §3. Verified by `module-workspace` tests (17 tests: mount gate for all 8 roles, per-section tab states, embed/removal) and the regenerated shell nav/PlatformHome snapshots:

| Role | Mounts module | VIGIL Approvals | ARIA Certifications | SCRIBE T&T Reviews |
|---|---|---|---|---|
| SYSTEM_ADMIN | ✓ | ✓ enabled (default) | ✓ enabled | ✓ enabled |
| PROGRAM_MANAGER | ✓ | 🔒 disabled + tooltip | 🔒 disabled + tooltip | ✓ enabled (lands here) |
| COMPLIANCE_OFFICER | ✓ | 🔒 disabled + tooltip | ✓ enabled (lands here) | 🔒 disabled + tooltip |
| ANALYST | ✓ | 🔒 disabled + tooltip | 🔒 disabled + tooltip | ✓ enabled (lands here) |
| INDEPENDENT_REVIEWER | ✗ `ModuleAccessDeniedError` (fail-closed) | — | — | — |

(`PLATFORM_ADMIN` additionally verified: mounts, all three sections enabled. `AGENT_OPERATOR`/`READ_ONLY` verified denied at the module gate.)

Shell nav/orientation counts updated accordingly (live-loader-derived, no hand-authored list — the Session 48 discipline): SYSTEM_ADMIN 10→11, PROGRAM_MANAGER 7→8, ANALYST 6→7, COMPLIANCE_OFFICER 4→5, INDEPENDENT_REVIEWER 2 (unchanged).

---

## Test Suite — Full Results (real exit codes, run at close)

```
test:shell      exit=0  Tests:  14 passed,  14 total
test:data       exit=0  Tests: 125 passed, 125 total
test:api-client exit=0  Tests: 175 passed, 175 total
test:counsel    exit=0  Tests: 100 passed, 100 total
test:scribe     exit=0  Tests: 220 passed, 220 total
test:vigil      exit=0  Tests: 177 passed, 177 total
test:lens       exit=0  Tests:  58 passed,  58 total
test:cpmi       exit=0  Tests:  58 passed,  58 total
test:agentos    exit=0  Tests:  89 passed,  89 total
test:nexus      exit=0  Tests: 159 passed, 159 total
test:apex       exit=0  Tests: 205 passed, 205 total
test:flowpath   exit=0  Tests: 135 passed, 135 total
test:aria       exit=0  Tests: 139 passed, 139 total
test:workspace  exit=0  Tests:  17 passed,  17 total   (new)
test:e2e        exit=0  Tests: 4 skipped, 136 passed, 140 total
```

All 15 workspaces exit 0 — 1,811 passed, 0 failed (the 4 e2e skips are the pre-existing live-smoke skips, unchanged).

**D4 convergence tests** (`e2e/tests/reviewer-workspace-convergence.test.tsx`, GD-23/24 style — `makeCtx` shared per scenario, real publishers, real embedded components):
1. VIGIL: dev-port requests published as-is → Workspace renders real `ApprovalQueue`/`ApprovalDetail` (STATIC brief tier, key-less) → Approve recorded in the Workspace → item leaves surface + rendered queue; `AGENT_ACTION_APPROVED` (decision_type `AGENT_APPROVAL`, `vigil-approval-req-dev-001`) is the decision of record.
2. ARIA: `CLEAR_DEMO_ITEMS` published as-is → real `ClearCertificationQueue` → Certify (note + D-3 destination/recipient) → item leaves surface; `ctx.aria.isCertified` true; `ARIA_CERTIFICATION_ISSUED` (decision_type `COMPLIANCE_CERTIFICATION`) logged.
3. SCRIBE: `DEMO_TT_REVIEW_ITEMS` published as-is → real `TTManagerReview` → ungated send recorded → item leaves surface + rendered queue; `HUMAN_DECISION`/`TIME_CORRECTION_SENT` logged with the item's `workflow_step_id`.
4. Surface semantics: last-write-wins by `module_id`+`item_id`; `remove()` of an unknown id is a safe no-op.

---

## Files Created

| File | Purpose |
|---|---|
| `module-workspace/package.json`, `tsconfig.json` | New workspace package (no new third-party deps — see SBOM) |
| `module-workspace/src/index.ts` | Module contract + five-role union gate |
| `module-workspace/src/WorkspaceApp.tsx` | Composition root; three per-section-gated panels |
| `module-workspace/src/useReviewerWorkspaceItems.ts` | Surface subscription hook |
| `module-workspace/tests/{index.test.ts, WorkspaceApp.test.tsx, test-helpers.tsx, setup-dom.ts, __mocks__/anthropic-key.ts}` | Gate + gating + embed/removal tests (17) |
| `module-vigil/src/vigil-workspace-publisher.ts` | `VigilWorkspacePayload` + publish/reconcile helper |
| `module-aria/src/aria-workspace-publisher.ts` | Publish/reconcile helper |
| `module-scribe/src/scribe-workspace-publisher.ts` | Publish/reconcile helper |
| `e2e/tests/reviewer-workspace-convergence.test.tsx` | D4 convergence tests (4) |
| `e2e/tests/__mocks__/anthropic-key.ts` | Key-less stub (ESM `import.meta` mapping — the module-vigil discipline) |

## Files Modified

| File | Change |
|---|---|
| `shell-contract.ts` + `sovereign-shell/shell-contract.ts` | v1.20: two GD-25 types, thirteenth export, changelog + impact assessment (synced, SHA-verified) |
| `sovereign-shell/src/shell.ts` | `ShellReviewerWorkspaceSurface` (mirrors `ShellWorkQueueSurface` + `remove()`); wired as thirteenth export |
| `sovereign-shell/src/module-loader/index.ts` | `MODULE_PRODUCT` + "eleven canonical modules" message (reconciliation note above) |
| `sovereign-shell/src/register-modules.ts` | Registers `workspaceModule` |
| `module-vigil/src/VigilApp.tsx` | GD-25 publish effect; `onDecided` remove |
| `module-aria/src/AriaApp.tsx` | Pending-items derivation via `useAriaCertifications`; GD-24 effect preserved; GD-25 publish effect |
| `module-aria/src/ClearCertificationQueue.tsx` | `CLEAR_DEMO_ITEMS` exported (`CLEAR_DEMO_ITEM_COUNT` now derived); `decide()` removes from the Workspace surface |
| `module-scribe/src/ScribeApp.tsx` | GD-25 publish effect; `onSent` remove wired |
| `module-scribe/src/TTManagerReview.tsx` | Private `itemKey` → exported `ttReviewItemKey` (rename only; same derivation) |
| `module-{vigil,aria,scribe}/tests/test-helpers.tsx` | `createInMemoryReviewerWorkspaceSurface` in each `makeCtx` |
| `e2e/tests/harness.tsx` | In-memory ReviewerWorkspace + Aria surfaces in `makeCtx` |
| `e2e/package.json` | jest `moduleNameMapper` for `anthropic-key` |
| `package.json` | `module-workspace` workspace + `test:workspace` script |
| `package-lock.json` | Workspace linkage only (no new third-party packages) |
| `sovereign-shell/tests/shell-nav-snapshots.test.tsx` (+ `.snap`) | Titles/counts updated to the 11-module registry; snapshots regenerated |

Also committed (housekeeping — created by earlier sessions but never tracked): `docs/23_Reviewers_Workspace_v1.md` (the GD-25 spec itself), `SOVEREIGN_Session44_Opening_Prompt.md`, `SOVEREIGN_Session47_Opening_Prompt.md`, `gather_session44_context.sh`, `gather_session47_context.sh`.

---

## Standing Constraints — Compliance

| # | Constraint | Status |
|---|---|---|
| 1 | Surface carries no governance authority | ✓ publish/remove do not log, approve, or route; decisions of record are the source modules' existing events (proven in D4) |
| 2 | No divergent duplicates | ✓ ARIA's exact gating shape reused; `ttReviewItemKey` single source; `useAriaCertifications` reused over a second subscription |
| 7 | Export count | ✓ twelve → thirteen, relaxed by GD-25 only; comment updated in both copies |
| 8 | Trace before inserting | ✓ all three assembly points traced (section above) — ARIA's items were NOT where a naive read of AriaApp suggested |
| 10 | No unregistered agents | ✓ Workspace registers none |
| 11 | Synced copies | ✓ both shell-contract copies SHA-256 identical at v1.20 (`22ee2335…f63d3`); nothing to propagate to shared-types/Python logger |
| — | `AGENT_REFERENCE.md` untouched | ✓ |
| — | v1.1 navigation NOT built | ✓ (docs/23 §1 item 4 deferred; `loader.mount()` still two-argument) |

---

## Known Pre-Existing Issues (verified present at `d0339f7`, not introduced this session)

- `npm run typecheck` (shell `tsc --noEmit`) fails with **6 pre-existing errors**: 4 × Vite `?raw` markdown imports (PPBE panels) unresolvable under plain tsc, 2 × unused-identifier warnings (`module-vigil/src/ApprovalQueue.tsx` `formatIso`, `VigilApp.tsx` `onDecisionMade` param). Verified identical error set on a clean stash of HEAD before any Session 50 change; the per-workspace jest suites (which include ts-jest compilation) are the operative gate and are fully green. Flagged for a cleanup session — not GD-25 scope.

---

## Next Session Candidates

- **`WORKSPACE` SovereignProduct member** — a small GD to end the `module-workspace → VIGIL` loader reconciliation.
- **v1.1 state-preserving navigation** (docs/23 §1 item 4 / docs/22 §5 Door 1) — the cross-module navigation primitive; `loader.mount()` still takes no initial-state parameter.
- **`HUMAN_DECISION` "context depth" field** (docs/22 §6) — separate small proposal, not yet a GD.
- The narrow-vs-general surface-registration question (docs/22 §4) — now that the Workspace's actual v1 scope is known, this is decidable.

---

*SOVEREIGN Platform · Session 50 Handoff · July 20, 2026*
*GD-25 approved by the Project Principal, July 20, 2026 · shell-contract v1.20*
*Pre-Decisional · Internal Working Document*
