# SOVEREIGN Platform — Session 53 Handoff

**Date:** July 21, 2026  
**GD:** GD-27 — Cross-Module Navigation Primitive, "Door 1" (docs/25; design authorities docs/22 §5, docs/23 §1 item 4)  
**Shell-contract:** v1.21 → v1.22  
**HEAD at open:** `270d537d38160c06640ff727ca7d5adec4d8ea99` (Session 52 close — confirmed no intervening session)

---

## Session Summary

Executed GD-27 in full: widened `SovereignModuleContract.mount()` with an optional third
parameter `initialState?: unknown`, added `navigateToModule` as the fourteenth member of
`SovereignShellContext`, implemented the primitive by generalizing the host's mount/unmount
sequence, threaded narrowed initial state through VIGIL, ARIA, and SCRIBE, added real
"Open in [module]" actions to the Reviewer's Workspace's three sections (the first real
consumer), and added three convergence tests proving the target module actually mounts with
the named item pre-selected.

---

## Done Condition — Status

| Deliverable | Status |
|------|--------|
| D1 — mount() widened + `navigateToModule` added, both copies, SHA-verified at v1.22 | DONE |
| D2 — `navigateToModule` implemented as a real ctx-level primitive | DONE — home documented below |
| D3 — VIGIL / ARIA / SCRIBE narrow and use `initialState` | DONE |
| D4 — real "Open in [module]" actions in all three Workspace sections | DONE |
| D5 — three convergence tests (one per wired module) | DONE — all passing |

---

## FINDINGS (spec-vs-reality reconciliations — recorded here, spec files untouched)

1. **`docs/25_Cross_Module_Navigation_Primitive.md` does not exist in the repository.**
   The opening prompt names it as the session's source and instructs "read it first," but
   the file is absent from `docs/` and has never existed in git history on any branch
   (`git log --all -- "docs/25*"` is empty; docs stop at 24). The build proceeded on the
   opening prompt's own embedded reproduction of the spec (§3's exact interfaces and the
   full §4 Done Condition), which was sufficient and unambiguous. Per this session's new
   boundary rule, Build Agent did **not** author docs/25 — governance documents are
   Governance Agent's to author. **Governance Agent should commit the real docs/25**, and
   until then this handoff plus the shell-contract v1.22 changelog entry are the de facto
   record of what GD-27 authorized.

2. **`sovereign-api-client/src/types.ts` — sync question answered: NO sync needed.**
   Verified by direct read: the file copies exactly three types — `SovereignProduct`,
   `SovereignTier`, and `ClearanceLevel`. GD-27 touches `SovereignModuleContract` and
   `SovereignShellContext`, neither of which is copied there. Its governance obligation
   ("Any change to SovereignProduct or SovereignTier... requires a matching update here")
   has nothing to propagate for this GD. File untouched, stated explicitly per the opening
   prompt's §1 requirement.

3. **The existing mount/unmount sequence never unmounted the previous module.**
   Confirmed by direct read before building: `onSelectModule` in `main.tsx` checked
   `isMounted(target)` and mounted the target, but nothing anywhere called
   `loader.unmount()` for the previously mounted module when switching. Consequences at
   HEAD: switching modules left the prior module "mounted" in the registry (its React
   root alive against a DOM element the new module's `createRoot` had taken over), and
   returning to it no-op'd on the `isMounted` early-return. The generalized GD-27 sequence
   fixes this: exactly one module owns the outlet at a time — whatever is mounted unmounts
   before the target mounts. Sidebar semantics are preserved: re-selecting the mounted
   module with no navigation intent is still a no-op (live state survives); a navigation
   intent forces a fresh mount, because mount() is the only point the contract delivers
   `initialState`.

4. **Pre-existing `npm run typecheck` failures at Session 52 close (not introduced or
   fixed this session).** Verified by stashing this session's changes and re-running:
   the same six errors exist at `270d537` — four `*.md?raw` import declarations
   (PPBE panels in module-apex/nexus/scribe, a Vite-ism `tsc --noEmit` can't resolve) and
   two unused-symbol TS6133s in module-vigil (`ApprovalQueue.formatIso`,
   `VigilApp` line 201 `requestId`). This session's changes add zero new typecheck errors.
   Left for a future session — fixing them was outside GD-27's scope.

5. **Session 52's handoff reported "Python (pytest) 89 passed"; this session's run of the
   same suite reports 195 passed.** Counted directly from `python3 -m pytest` in
   `sovereign-security/` (Lesson 12: counts taken directly, not carried forward). No
   Python file was touched this session.

---

## D2 — Where `navigateToModule` actually lives, and why

The primitive is split across the two files that each own half of the problem — this was
Build Agent's Rule-8 call, as the spec left it open:

- **`sovereign-shell/src/shell.ts` (composition root)** — the context member and its
  late-bound delegate (`ShellModuleNavigator`). The `SovereignShell` class IS the context,
  so the fourteenth member can only be added here. The shell cannot execute the sequence
  itself: it has no ModuleLoader and no outlet element. The host registers the real
  sequence via `SovereignShell.setNavigateToModuleHandler()` — an internal accessor NOT on
  the contract, the exact late-binding precedent of `ShellNavigation.setLabelResolver` /
  `ShellConfig.onNavigate`. Fail-loud: calling the primitive before a host registers
  throws (fail-closed; a silent no-op would swallow a real navigation intent).
- **`sovereign-shell/src/main.tsx` (host)** — the generalized sequence itself:
  `onSelectModule`'s former inline body is now `openModule(moduleId, initialState?)`, run
  by BOTH entry points (sidebar click and ctx primitive). The ctx path additionally calls
  `navigation.navigateTo(target.mountPath)` itself, since the chrome only does that for
  sidebar clicks.
- **`sovereign-shell/src/module-loader/index.ts`** — pass-through only: `mount()` gains
  the optional third parameter and hands it, opaque, to the module's widened `mount()`.
  All existing loader machinery (fail-closed access policy, agent-card registration,
  health polling) is unchanged and applies to navigated-to mounts identically.

---

## GD-27 Impact Assessment (explicit, per §3 of the opening prompt)

- **HumanDecisionType:** Unaffected.
- **SovereignEventType:** Unaffected.
- **AgentClass:** Unaffected.
- **SovereignRole / SovereignProduct:** Unaffected.
- **`sovereign-api-client/src/types.ts`:** Verified NOT affected — see Finding 2.
- **Standing Constraint #7:** relaxed thirteen → fourteen for this GD (`navigateToModule`).
- **Access control:** navigated-to mounts run the same fail-closed loader policy and each
  module's structural mount gate; ARIA's per-tab role gate is not bypassed by a navigation
  intent (an intent targeting CLEAR is honored only if the role can access CLEAR).

## D3 — The three narrowed shapes

| Module | Shape | Seeds |
|--------|-------|-------|
| VIGIL | `{ selectedRequestId?: string }` | Approvals tab + `useApprovalQueue`'s existing `selectedId` |
| ARIA | `{ selectedDocumentId?: string }` | CLEAR tab → Certification Queue view + the queue's existing per-document preview state |
| SCRIBE | `{ selectedItemKey?: string }` (ttReviewItemKey) | T&T Review surface + `TTManagerReview`'s existing `selectedKey` |

Each module narrows the contract-level `unknown` at its own mount boundary (permissive on
extra fields, strict on the one field used; malformed intent narrows to undefined = cold
mount). No new selection mechanism anywhere — externally-supplied starting values for
existing selection state only.

---

## Shell-Contract v1.22

**Hash of record (both copies, SHA-256):**
```
28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443  shell-contract.ts
28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443  sovereign-shell/shell-contract.ts
```

Copies verified identical. Prior v1.21 hash:
`96db4e55ae832e5f7e1bfb8262888adea9b659b9426c6d54284610e25b3fa541`

---

## Test Suite Results (full suite, Rule 7 — real exit codes)

| Suite | Tests | Result |
|-------|-------|--------|
| test:shell | 14 passed | ✓ EXIT 0 |
| test:api-client | 175 passed | ✓ EXIT 0 |
| test:workspace | 19 passed | ✓ EXIT 0 |
| test:vigil | 177 passed | ✓ EXIT 0 |
| test:counsel | 100 passed | ✓ EXIT 0 |
| test:aria | 139 passed | ✓ EXIT 0 |
| test:scribe | 220 passed | ✓ EXIT 0 |
| test:data | 125 passed | ✓ EXIT 0 |
| test:nexus | 159 passed | ✓ EXIT 0 |
| test:cpmi | 58 passed | ✓ EXIT 0 |
| test:agentos | 89 passed | ✓ EXIT 0 |
| test:apex | 205 passed | ✓ EXIT 0 |
| test:flowpath | 135 passed | ✓ EXIT 0 |
| test:lens | 58 passed | ✓ EXIT 0 |
| test:e2e | 139 passed, 4 skipped (143 total — 3 new GD-27 convergence tests) | ✓ EXIT 0 |
| Python (pytest, sovereign-security) | 195 passed | ✓ EXIT 0 |

The 4 skipped e2e tests are the pre-existing live-service smoke skips. One pre-existing
e2e assertion was updated (`reviewer-workspace-convergence.test.tsx`): the new "Open in
VIGIL" action legitimately makes `req-dev-001` appear twice, so `getByText` became
`getAllByText` — a consumer-side test update, not a behavior change.

---

## Files Changed

| File | Change |
|------|--------|
| `shell-contract.ts` | v1.21 → v1.22; mount() widened; `navigateToModule` fourteenth member; changelog entry |
| `sovereign-shell/shell-contract.ts` | Identical copy — same changes |
| `sovereign-shell/src/shell.ts` | `ShellModuleNavigator` delegate + `setNavigateToModuleHandler()` internal accessor |
| `sovereign-shell/src/main.tsx` | `onSelectModule` generalized into `openModule()`; handler registration; unmount-before-mount fix |
| `sovereign-shell/src/module-loader/index.ts` | `mount()` optional third param, passed opaque to the module |
| `module-vigil/src/index.ts` | mount widened; `narrowVigilInitialState()` |
| `module-vigil/src/VigilApp.tsx` | `VigilInitialState`; initial tab + seeded selection |
| `module-vigil/src/useApprovalQueue.ts` | `initialSelectedId` option seeding existing selection state |
| `module-aria/src/index.ts` | mount widened; `narrowAriaInitialState()` |
| `module-aria/src/AriaApp.tsx` | `AriaInitialState`; CLEAR tab targeting (role gate preserved) |
| `module-aria/src/ClearPanel.tsx` | `initialDocumentId` → starts on Certification Queue view |
| `module-aria/src/ClearCertificationQueue.tsx` | `initialSelectedDocumentId` seeding existing preview state |
| `module-scribe/src/index.ts` | mount widened; `narrowScribeInitialState()` |
| `module-scribe/src/ScribeApp.tsx` | `ScribeInitialState`; T&T Review surface targeting |
| `module-scribe/src/TTManagerReview.tsx` | `initialSelectedKey` seeding existing selection (unknown key → default) |
| `module-workspace/src/WorkspaceApp.tsx` | `OpenInSourceModuleActions` in all three sections (D4) |
| `e2e/tests/cross-module-navigation-convergence.test.tsx` | New — three D5 convergence tests |
| `e2e/tests/reviewer-workspace-convergence.test.tsx` | Consumer-side assertion update (see above) |
| `e2e/package.json` | jest mappings so e2e can load the real module contracts (reuses module-vigil's endpoint stub + module-scribe's raw-md transformer — no divergent duplicates) |
| `sovereign_session_verify.sh` | Pinned to Session 53 close (follow-up commit, per the 6ee0106 precedent) |
| `SOVEREIGN_Session53_Handoff.md` | This file |
| `SBOM_Session53_Update.md` | SBOM entry for this session |

---

## Standing Constraints — Status

- **Constraint #7 (context export count):** relaxed thirteen → fourteen under GD-27.
- **Constraint #11 (synced copies):** both shell-contract copies verified identical at
  v1.22 (hash above). `sovereign-api-client/src/types.ts` verified not implicated
  (Finding 2). `sovereign-data/src/shared-types.ts` / Python logger: nothing to propagate
  (no taxonomy change).
- **Out-of-scope discipline held:** the other seven modules are NOT wired (docs/25 §5);
  the Workspace's embed pattern (docs/23) unchanged — D4 only adds actions alongside it;
  no docs/NN file or AGENT_REFERENCE.md touched.

---

## Next Session

- **Governance Agent:** commit the real `docs/25` (Finding 1).
- Non-blocking carryovers: the six pre-existing typecheck errors (Finding 4); the
  `sovereign_logger.py` `APPROVED_PRODUCTS` WORKSPACE gap (docs/24 §6, from Session 52).

---

*SOVEREIGN Platform · Session 53 · GD-27 · July 21, 2026*
