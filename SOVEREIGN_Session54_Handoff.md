# SOVEREIGN Platform — Session 54 Handoff
## Walkthrough G Build Session 1 · July 22, 2026

**Session:** 54
**Scope delivered:** All six deliverables — D1 (WG-1), D2 (WG-5), D3 (WG-2) required; D4 (WG-3+WG-4), D5 (WG-12), D6 (WG-13) optional — **all completed**.
**HEAD at open:** `8df1356` (verified fresh via `git log -1`; newer than the opening prompt's last-known `6619aba` — the delta was docs-only placement commits, in sync with `origin/main`).
**HEAD at close:** see the commit/push output recorded at the end of this document.
**Shell contract:** v1.22, **UNCHANGED**. Both copies SHA-256 verified identical at open and at close:
`28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443`
No governance decision was required or taken. No agent or prompt was added (registry stays 44 / 20).

---

## 1 — Done-Condition Traceability

### D1 (WG-1) — Eager surface population at shell start ✅

**Built:** `sovereign-shell/src/startup-publish.ts` (new) — one function,
`publishModuleSurfacesAtStartup(ctx)`, called from `main.tsx` at host construction
(module scope, once per page load). It calls each module's **existing** publish
functions — `publishProgramStatuses`, `publishVigilWorkQueues`,
`publishVigilWorkspaceItems`, `publishAriaWorkQueues`, `publishAriaWorkspaceItems`,
`publishScribeWorkQueues`, `publishScribeWorkspaceItems`, `publishNexusWorkQueues` —
with the same synthetic inputs each module assembles at mount (Constraint #2: zero
parallel publishers written). VIGIL's inputs come from the new shared session store
(see D6), so startup, VigilApp, and the Workspace all read one queue.

**Proof:** `e2e/tests/startup-publish-convergence.test.ts` (4 tests) — all three
surfaces populated with real seeded data by the single startup call, full payloads
(the Tier C obligation case included), idempotent last-write-wins re-publish.
`e2e/tests/home-dashboard-startup.test.tsx` (3 tests) — the **real `PlatformHome`**
rendered on a fresh session shows populated Program Health tiles, a flagged-programs
Issues badge, and queue tiles from all four publishing modules, with no module ever
mounted; the **real `WorkspaceApp`** shows non-zero counts on all three section tabs
(VIGIL = 5); role-based read filtering confirmed unchanged (an all-inaccessible role
still sees the honest empty state).

### D2 (WG-5) — Live expiry sweep ✅

**Built:** the sweep runs on mount **and every 30 seconds**
(`EXPIRY_SWEEP_INTERVAL_MS`, `approval-contract.ts`) while either VIGIL screen is
open: `VigilApp.tsx` re-arms an interval over `approvals.expireOverdue()`;
`WorkspaceApp.tsx`'s VIGIL section runs the same-cadence sweep through the shared
store (`expireVigilSessionRequests`) and removes expired items from the
`ReviewerWorkspaceSurface`. The `AGENT_ACTION_EXPIRED` event shape now lives in one
place — `agentActionExpiredEvent()` in `approval-contract.ts` — used by both sweep
paths (Constraint #2). The two screens are never mounted simultaneously (single
module outlet, confirmed in `main.tsx`'s `openModule`), so the sweeps cannot
double-emit. A P1's 15-minute window elapsing on an idle open screen now expires,
logs, and removes the request with no remount.

**Proof:** `module-vigil/tests/vigil-approval-session.test.ts` — the store sweep
expires the P1 dev request past its window, emits `AGENT_ACTION_EXPIRED` with the
exact system-event shape (actor `sof-approval-system`, no `actor`/`decision_type`,
correct `workflow_step_id`), and removes it from the shared queue.
`module-vigil/tests/useApprovalQueue.test.tsx` (pre-existing) still passes
unchanged against the refactored emit path.

### D3 (WG-2) — Sidebar tooltip via React portal ✅

**Built:** `ModuleNav.tsx`'s `InfoBadge` popover now renders through
`createPortal(…, document.body)` with `position: fixed` computed from the hovered
icon's viewport rect. `asideStyle`'s overflow is untouched (the sidebar keeps
scrolling as the module list grows). Root cause per the Findings Report confirmed:
`overflowY: "auto"` forces the unset `overflowX` to compute to `auto`, clipping
anything positioned inside the aside.

**Proof:** shell snapshot suite passes unchanged (tooltip renders on hover only);
portaled content is by construction outside the `<aside>` scroll container, so no
ancestor overflow can clip it. Live hover check recommended at the next dev-server
run (see §3, verification limits).

### D4 (WG-3 + WG-4) — APEX chart polish ✅ (with one reconciliation)

**WG-3:** an always-visible one-line codename → full-name key
(`aria-label="Program codename key"`) renders above the Obligation Rate chart —
chosen over axis rotation as the better fit for the existing compact layout.
**WG-4:** the variance chart's legend order is now deterministic — **reconciliation:**
recharts 3.9 removed `payload` from `<Legend>`'s public props (v3 makes it
context-driven; the Findings Report's suggested fix was written against the v2 API).
Equivalent, strictly-more-deterministic fix built instead: an explicit `content`
renderer (`VarianceLegendContent`, exported) with a hardcoded item order — Planned,
then Actual, matching the bar-body order.

**Proof:** `module-apex/tests/PPBEDashboard.test.tsx` Session 54 block — key line
content asserted; legend content order asserted by rendering the exported renderer
directly (recharts renders no chart internals under jsdom's zero-size container —
noted in the test).

### D5 (WG-12) — Dependency records through to the table ✅

**Built:** `PPBEDashboard.tsx` passes `inputs.dependencies` (the real
`SYNTH_PPBE_DEPENDENCIES` records — the data already existed) into
`DependencyHealthTable`, which now renders a "Dependency detail" table below the
unchanged counts table: dependency_id, source workflow, target workflow, status —
failed first, then at-risk, then healthy; handoff standard + timing requirement on
row hover. Additive only (Constraint #3): the Session 46 counts table, its
aria-label, and its narrative caption are untouched.

**Proof:** `PPBEDashboard.test.tsx` — the detail table identifies the at-risk
fixture (`D-1`, `phase-2-planning` → `phase-3-programming`, "At risk") while the
counts table's pre-existing assertions still pass.

### D6 (WG-13) — Shared session-persistent approval store ✅

**Built:** `module-vigil/src/vigil-approval-session.ts` (new) — a module-level,
lazily-assembled, session-scoped store of VIGIL's synthetic approval queue (dev
port + TT escalation + Tier C obligation case, assembled exactly as `VigilApp`
previously did inline at mount — including `openObligationGate()`'s own governed
Logger emissions, which now fire at shell start rather than first VIGIL mount).
`VigilApp` seeds `useApprovalQueue` from it; the hook's `remove()` and
`expireOverdue()` mirror removals back; the Workspace's VIGIL `onDecided` removes
from it. A decision recorded in the Workspace is therefore reflected when VIGIL's
own screen mounts later in the same session. **Deliberately NOT cross-session
history** (WG-14 — separate governance decision, per the opening prompt).
`createDevApprovalPort()` itself is unchanged (Constraint #3) — the store wraps it;
the port remains the injectable seam for the future live AgentOS backing.

**Proof:** `vigil-approval-session.test.ts` — idempotent ensure (same live queue,
same anchor), decision removal (including obligation-case clearing), no-op removal
for non-session ids, sweep behavior. Test isolation: `beforeEach` store resets
added to `VigilApp.test.tsx` / `VigilAppObligation.test.tsx`.

---

## 2 — Findings and Reconciliations (Committee format where warranted)

**F1 — Pre-existing typecheck failures at session open (shell and e2e workspaces).**
EVIDENCE: on unmodified HEAD `8df1356` (stash-baseline runs), `tsc --noEmit` in
`sovereign-shell` failed with 6 errors (4× TS2307 on `*.md?raw` imports reached
through module sources — `PPBEAgentsPanel.tsx`, `PPBECoordinationPanel.tsx`,
`PPBEExhibitPanel.tsx`; 2× TS6133 unused symbols — `formatIso` import in
`ApprovalQueue.tsx`, `requestId` param in `VigilApp.tsx`), and in `e2e` with 1
error (same `?raw` class). ROOT CAUSE: each module's `raw-import.d.ts` ambient
declaration is not visible across tsc program boundaries; the unused symbols were
plain latent errors. RESOLUTION (mechanical, this session): workspace-local
`raw-import.d.ts` copies at `sovereign-shell/src/` and `e2e/tests/` (same
declaration as module-apex's); removed the unused import; underscored the unused
parameter. All 15 workspaces + e2e now `tsc --noEmit` clean (exit 0, verified
individually). PROPAGATION: the Brief's "tsc clean" claim was true per-module but
NOT for the shell/e2e programs at open — worth a one-line correction in v1.49.

**F2 — WG-4 spec-vs-library reconciliation.** Recharts 3.9.2's `Legend` omits
`payload` from its public props (`Omit<Props, "payload" | …>` in its types) — the
Findings Report's suggested fix targets the recharts 2 API. Built the explicit
`content` renderer instead (same intent, stronger guarantee). No constraint
implicated; the Findings Report's WG-4 entry should be annotated in the
post-session cycle.

**F3 — `docs/27` is not in the repo** (`docs/22–26` and `28` are; verified by `ls`
at session open — Lesson 24 discipline). It is cited by the Walkthrough G Findings
Report as WG-5's source and by its own EG-lettered items. It did NOT block this
session (D2 is fully specified in the report), but the file needs placing before
any session that opens against the EG questions.

**F4 — Verification limits on "visually confirmed."** No browser automation exists
on this machine (no Playwright/Puppeteer/Chrome; Safari only, not scriptable here).
D1/D3/D4's visual done-conditions are verified at the DOM level by rendering the
REAL components against the REAL startup path (see §1), plus a clean production
`vite build` of the shell (exit 0 — the new cross-module import graph resolves for
the real bundler). A human browser pass remains the final confirmation — it folds
naturally into the already-planned Walkthrough repeat pass for Home Dashboard
(Findings Report, Part 5).

**F5 — Adjacent gaps observed, NOT acted on (out of scope):**
- The SCRIBE analogue of WG-13: `ScribeApp` republishes all `DEMO_TT_REVIEW_ITEMS`
  on mount, so a T&T item "sent" via the Workspace reappears if SCRIBE mounts later
  (sent-state is component-local). Same class of gap D6 fixed for VIGIL; needs its
  own small decision on where SCRIBE's session sent-state should live.
- Home's To Do / Review **counts** are point-in-time: a decision recorded in the
  Workspace updates the Workspace surface immediately, but the WorkQueueSurface
  counts refresh only when a module republishes. WG-14's Activity View (or a small
  publisher hook on the decision paths) is the right home for this.
- No expiry sweep runs while the user sits on Home (D2's stated scope covers the
  VIGIL screen and the Workspace's embedded copy). An expired item can show in
  Home's counts until a sweep-bearing screen mounts.

---

## 3 — Close Verification (real outputs, Rule 7: exit codes captured directly)

### Full test suite — explicit table (per the SBOM v1.41 rigor finding: no deltas)

| Workspace | Tests | Result | Exit code |
|---|---|---|---|
| @sovereign/data | 125 | 125 passed | 0 |
| @sovereign/api-client | 175 | 175 passed | 0 |
| @sovereign/shell | 14 (14 snapshots) | 14 passed | 0 |
| @sovereign/module-counsel | 100 | 100 passed | 0 |
| @sovereign/module-scribe | 220 | 220 passed | 0 |
| @sovereign/module-vigil | 183 | 183 passed | 0 |
| @sovereign/module-lens | 58 | 58 passed | 0 |
| @sovereign/module-cpmi | 58 | 58 passed | 0 |
| @sovereign/module-agentos | 89 | 89 passed | 0 |
| @sovereign/module-nexus | 159 | 159 passed | 0 |
| @sovereign/module-apex | 208 | 208 passed | 0 |
| @sovereign/module-flowpath | 135 | 135 passed | 0 |
| @sovereign/module-aria | 139 | 139 passed | 0 |
| @sovereign/module-workspace | 19 | 19 passed | 0 |
| @sovereign/e2e | 150 | 146 passed, 4 skipped* | 0 |
| **JS/TS total** | **1832** | **1828 passed, 4 skipped** | all 0 |
| Python (sovereign-security, pytest) | 195 | 195 passed (1 warning) | 0 |
| **Platform total** | **2027** | **2023 passed, 4 skipped** | all 0 |

*The 4 skipped are the pre-existing live-provider smoke tests (no API key in this
environment — their fail-closed halves ran and passed), unchanged from prior sessions.

New tests this session: +6 (vigil session store), +4 (startup-publish convergence),
+3 (Home/Workspace fresh-session render), +3 (APEX Session 54 block) = **+16**.

### Other gates

- `tsc --noEmit`: **exit 0 in all 15 workspaces** (run individually; shell and e2e
  were failing at session open — see F1).
- `npx vite build` (shell production bundle): **exit 0**.
- `npm audit --omit=dev`: **found 0 vulnerabilities** (exit 0).
- Shell-contract SHA-256 at close: both copies
  `28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443` — identical,
  unchanged from the hash of record.

### Commit / push

Real `git commit` and `git push` output is shown verbatim in the session close
message (non-negotiable since Session 31); the commit hash there is HEAD at close.

---

## 4 — Update Flags for the Integration Brief (v1.49 inputs)

1. Walkthrough G Build Session 1 complete: WG-1, WG-2, WG-3, WG-4, WG-5, WG-12,
   WG-13 all **FIXED** (WG-4 with the recharts-3 reconciliation noted in F2).
   Remaining WG items unchanged: WG-6/7/8/9/11 (blocked on the governance cluster),
   WG-14 (its own GD), plus the EG-lettered questions.
2. The repeat Walkthrough pass for Home Dashboard (Part 5 of the Findings Report)
   is now unblocked — WG-1 has landed.
3. `docs/27` placement gap (F3) — place before any session opening against it.
4. Shell/e2e workspace typecheck was failing at open, now clean (F1) — correct the
   standing "tsc clean" claim's scope in the Brief.
5. New standing facts for Known Codebase Facts candidates (Governance Agent's
   call): the VIGIL session store (`vigil-approval-session.ts`) is now the single
   session queue — any future VIGIL surface must read/remove through it, not
   through `createDevApprovalPort()` directly; `agentActionExpiredEvent()` is the
   single source of the expiry event shape.
6. F5's three adjacent gaps for the backlog.

---

*SOVEREIGN Session 54 Handoff · July 22, 2026 · Build Agent*
*Pre-Decisional · Internal Working Document*
