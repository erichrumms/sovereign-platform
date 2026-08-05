# Session 89 — Cross-Module Regression Verification
## August 5, 2026

**Session type:** Regression verification (no build scope).
**Trigger:** Sessions 80–88 made extensive changes to shared, foundational code —
shell-contract.ts (v1.25 → v1.27), base-client.ts, anthropic-client.ts, and 14 live-call
sites across VIGIL, SCRIBE, NEXUS, APEX, LENS, and CPMI. Question: did any of it break
cross-module interworking, credential/key usage outside the AI-call path, reporting
flows, or the Reviewer's Workspace publish/subscribe links (docs/23)?

**Bottom line: nothing is broken.** Every standing test in the platform passes —
149 e2e tests (4 more correctly skipped as live-gated), 1,516 module/package tests
across ten workspaces, `tsc --noEmit` clean on every workspace checked. The one real
gap found is a **test-coverage** gap, not a behavior gap: the two Reviewer's Workspace
sections WH-19 added (NEXUS Travel, FLOWPATH Review) have no standing test anywhere
exercising their cross-module publish/remove contract. That contract was verified
working this session by direct exercise (Part 3). Findings F1–F3 below; no code was
changed, so per the Session 81/86 precedent there is no SBOM update.

---

## Part 1 — The real e2e suite, enumerated by reading, not inferred

`e2e/tests/` contains 12 test files (plus `harness.tsx`, `setup-dom.ts`,
`raw-import.d.ts`, `__mocks__/anthropic-key.ts`). What each actually verifies, from its
describe/test blocks:

| File | What it actually verifies |
|---|---|
| `apex-vigil-program-status-convergence.test.ts` | APEX publishes ProgramStatusSnapshots; VIGIL's ppbe_obligation brief reads them (GD-23/WF-20); subscribe convergence; obligation-rate → status thresholds; pre-GD-23 backward compat. |
| `cross-module-navigation-convergence.test.tsx` | GD-27 navigateToModule initialState: VIGIL mounts with a pre-selected request, ARIA with a pre-expanded CLEAR preview, SCRIBE with a pre-selected T&T item. |
| `home-dashboard-startup.test.tsx` | Fresh-session PlatformHome shows populated Program Health / Issues / To Do tiles and real Workspace counts without visiting any module (WG-1); role-based tile filtering; WG-17 P2 expiry sweep emits AGENT_ACTION_EXPIRED and republishes counts. |
| `pipeline.test.tsx` | Six NEXUS → AgentOS → VIGIL scenarios: approval reaches IN_PROGRESS; no-approval path skips VIGIL; CUI refused at intake (GD-10); VIGIL rejection propagates; live AgentOS-backed port; FLOWPATH-approved workflow reaches AgentOS; APEX portfolio reads. |
| `ppbe-full-cycle.test.tsx` | 32 tests: the full PPBE closed loop — cross-module constants (Constraint #11), Tier B human-gated phase transitions, COUNSEL signed records (all four types), Tier C obligation gate, ledger/dependency/coordination anomaly rules, SCRIBE exhibits behind the double gate + CLEAR, TRACER chain-of-custody completeness, Python-side trail drift check, audit-trail discipline (Constraints #4/#6). This is the reporting/export coverage: exhibit drafting, dashboard render, TRACER chains. |
| `ppbe-live-smoke.test.ts` | Fail-closed half (always runs, hermetic): all four PPBE agents degrade to labeled, validator-passing static tiers when the live provider is unavailable. Live half: 4 tests correctly gated behind `RUN_PPBE_LIVE_SMOKE=1` + `ANTHROPIC_API_KEY`, skipped in the standing suite. |
| `reviewer-workspace-convergence.test.tsx` | GD-25 contract for the three original sections: VIGIL/ARIA/SCRIBE publish real items; deciding in the Workspace removes the item and logs the right event (AGENT_ACTION_APPROVED / ARIA_CERTIFICATION_ISSUED / TIME_CORRECTION_SENT); last-write-wins; remove() of unknown id is a no-op. |
| `startup-publish-convergence.test.ts` | WG-1 startup publication populates ProgramStatusSurface, WorkQueueSurface (4 modules), and ReviewerWorkspaceSurface (asserts the three original sections, with full payloads); WG-15 SCRIBE sent-session filter; idempotent republish. |
| `tt-full-cycle.test.tsx` | Three T&T scenarios: clean travel approval → APPROVAL_NOTICE; escalation authorized at the VIGIL gate → send recordable; escalation rejected → never sendable. |
| `tt-vigil-scribe-convergence.test.tsx` | A VIGIL authorization/rejection flips SCRIBE's escalation item sendable/gated via the shared task surface, no refresh. |
| `wcag-contrast.test.ts` | 68 AA contrast checks over shell theme tokens and the full Session 29 module text/background audit inventory. |
| `work-queue-surface-convergence.test.ts` | GD-24: VIGIL/SCRIBE/ARIA/NEXUS publish real queue summaries; partitioning, subscribe, last-write-wins, unsubscribe. |

Assumption check (per the opening prompt's own instruction): the suite matches the
session's expectations with one deviation — there is no APEX MSR/QPR report-generation
e2e test; APEX reporting coverage lives in module-apex's own suite (27 suites, 234
tests, all passing). The e2e-level reporting coverage is the PPBE exhibit/TRACER/
dashboard path in `ppbe-full-cycle.test.tsx`.

## Part 2 — Targeted subset runs (all output captured in session)

Category (a) Workspace surface — `reviewer-workspace-convergence` (4/4),
`startup-publish-convergence` (6/6), `home-dashboard-startup` (4/4).
Category (b) multi-module workflows — `pipeline` (6/6), `tt-full-cycle` (3/3),
`tt-vigil-scribe-convergence` (2/2), `cross-module-navigation-convergence` (3/3),
`apex-vigil-program-status-convergence` (9/9), `work-queue-surface-convergence` (8/8).
Categories (c)+(d) — `ppbe-live-smoke` fail-closed half (4/4, live half 4 skipped as
designed), `ppbe-full-cycle` (32/32).

**Every test passed. Zero failures in the targeted subset.**

Credential handling outside the AI-call path, verified directly:
- The e2e `__mocks__/anthropic-key.ts` stub correctly forces the degraded tier for
  VIGIL's brief engine in Workspace renders (no network, deterministic).
- The fail-closed smoke half proves all four PPBE agents degrade honestly with no key.
- `git ls-files` confirms no `.env*` file is tracked; `.gitignore` lines 21–24 cover
  `.env`, `.env.local`, `.env.*.local` (the Session 85 incident class stays closed).
- sovereign-api-client's own suite (10 suites, 192 tests) passes, including the GD-34
  failure-categorization and stop_reason forwarding tests added in Sessions 87–88.

## Part 3 — The seven-tab Reviewer's Workspace verification

The Workspace has **seven** sections (`WorkspaceApp.tsx:155`): vigil, aria, scribe,
nexus, flowpath, cost, activity. (docs/23's July 30 append describes five embedded
panels + Activity; the Cost Dashboard tab was added later under GD-32/GD-34 — see F3.)

Standing coverage found by reading, per tab:
- **VIGIL / ARIA / SCRIBE** — covered twice over: cross-module e2e
  (`reviewer-workspace-convergence`, `startup-publish-convergence`) and module-workspace
  embed tests. All pass.
- **Activity & Decisions (GD-28)** and **Cost Dashboard (GD-32)** — read
  `ctx.logger.getEntries()`, not the workspace surface; covered by
  module-workspace's suite (33/33 passing, including the GD-34 fallback-category
  breakdown changed in Session 87).
- **NEXUS Travel / FLOWPATH Review (WH-19)** — **no standing test anywhere** references
  `publishNexusTravelItems`, `publishFlowpathArtifact`, or renders those two Workspace
  sections. Repo-wide grep: the publishers are referenced only by their own source,
  `NexusApp.tsx` / `FlowpathApp.tsx`, `WorkspaceApp.tsx`, and `startup-publish.ts`.
  The e2e startup test asserts only the three original sections, although WH-43 made
  startup publish NEXUS travel items too.

Because "each module's own tests pass" was explicitly not sufficient, the missing links
were verified by direct exercise: a temporary jsdom test file
(`session89-seven-tab-verification.test.tsx`, built on the real e2e `makeCtx` harness,
real `publishModuleSurfacesAtStartup`, real seed data, real `WorkspaceApp`) ran six
checks, **all passing**:

1. Startup publication lands every pending (ROUTED/ESCALATED) NEXUS travel item on the
   surface with the FULL `SubmittedTravelItem` payload, ids and workflow_step_ids intact.
2. A final outcome (APPROVED) reconciles that item OUT of the surface on republish —
   the remove contract.
3. An active FLOWPATH bundle publishes with the real `FlowpathMapperOutput` payload.
4. An approved session reconciles out; a null bundle clears the surface.
5. Render-level: one shared ctx (SYSTEM_ADMIN) shows all seven tabs; the
   VIGIL/ARIA/SCRIBE/NEXUS/FLOWPATH sections each render their real published items;
   Cost Dashboard and Activity sections render.
6. Approving a ROUTED travel item **inside the Workspace** removes it from the surface
   and logs a HUMAN_DECISION with decision_type TRAVEL_APPROVAL carrying the correct
   workflow_step_id.

The file was then deleted: adding permanent test coverage is new scope beyond a
verification session, and whether/where to add it is the Governance Agent's call
(Finding F1). Its six checks are fully described above and are mechanically
re-creatable from this report.

**Verdict: the seven-tab publish/remove contract works end to end after Sessions
80–88.** The gap is coverage, not behavior.

## Part 4 — Full regression baseline

Full e2e suite (`cd e2e && npx jest`): **12/12 suites passed, 149 passed, 4 skipped
(live-gated by design), 0 failures.** Per suite:

| Suite | Result |
|---|---|
| reviewer-workspace-convergence | 4 passed |
| startup-publish-convergence | 6 passed |
| home-dashboard-startup | 4 passed |
| cross-module-navigation-convergence | 3 passed |
| pipeline | 6 passed |
| tt-full-cycle | 3 passed |
| tt-vigil-scribe-convergence | 2 passed |
| work-queue-surface-convergence | 8 passed |
| apex-vigil-program-status-convergence | 9 passed |
| ppbe-full-cycle | 32 passed |
| ppbe-live-smoke | 4 passed, 4 skipped (live half, gated) |
| wcag-contrast | 68 passed |

Beyond the mandate, every workspace changed (or consuming changed code) tonight was
also run:

| Workspace | Suites | Tests |
|---|---|---|
| sovereign-api-client | 10 passed | 192 passed |
| module-vigil | 31 passed | 215 passed |
| module-scribe | 29 passed | 243 passed |
| module-nexus | 20 passed | 172 passed |
| module-apex | 27 passed | 234 passed |
| module-lens | 9 passed | 63 passed |
| module-cpmi | 16 passed | 62 passed |
| module-flowpath | 14 passed | 152 passed |
| module-aria | 13 passed | 150 passed |
| module-workspace | 2 passed | 33 passed |

`tsc --noEmit`: clean (exit 0) on e2e, sovereign-shell, module-workspace,
sovereign-api-client, module-vigil, module-nexus, module-flowpath.

## Findings for Governance Agent / Project Principal review (no code changed)

### F1 — WH-19 Workspace sections (NEXUS Travel, FLOWPATH Review) have zero standing test coverage

**Problem.** The cross-module publish/remove contract for two of the seven Workspace
tabs is exercised by no test in the repository — not in e2e, not in module-workspace,
not in module-nexus/module-flowpath. It was verified working this session only by a
temporary test that has been deleted. A future regression in these links would be
invisible to the standing suite.

**Evidence.** Repo-wide grep for the publisher symbols returns only source files.
`startup-publish-convergence.test.ts` asserts three sections while `startup-publish.ts`
(WH-43) publishes four.

**Options.**
- **(a) Recommended:** authorize a permanent e2e convergence test replicating this
  session's six verified checks (described in Part 3; mechanically re-creatable). Same
  pattern as the existing `reviewer-workspace-convergence.test.tsx` — no new approach.
- (b) Minimal: extend `startup-publish-convergence.test.ts` with a NEXUS-section
  assertion only (covers the WH-43 publish, not the remove contract or FLOWPATH).
- (c) Accept and document the gap.

### F2 — `deployment_feedback` is absent from every AGENT_STEP_COMPLETE emit, platform-wide (pre-existing, not a Session 80–88 regression)

**Problem.** shell-contract Section 9 lists `deployment_feedback` as frozen Intelligence
Layer exposure on every AGENT_STEP_COMPLETE event. No emit site in any module populates
it — `ShellLogger.validate` warns on every such event ("Automatability Scorer exposure
incomplete"), visible throughout tonight's test output.

**Evidence.** Grep across all module sources: 22 files emit AGENT_STEP_COMPLETE-related
code, zero reference `deployment_feedback`. The validator warn dates to the initial
June 15 platform import; the GD-31 sites (Session ~80) never populated it. Verified
identical behavior before and after tonight's changes — this is a standing gap, not a
new break.

**Options.**
- (a) Governance decision to design real `deployment_feedback` capture (needs
  human-time/agent-time measurement semantics — not a mechanical fix).
- (b) Governance decision to scope Section 9's "every AGENT_STEP_COMPLETE" claim to the
  sites where it is meaningful, and quiet the warn accordingly.
- (c) Leave as-is (the warn is advisory and does not affect any test result).

### F3 — Documentation/test wording drift on the Workspace's section count (surfacing only — governance documents are not the Build Agent's to author)

**Problem.** docs/23's July 30 append records five embedded panels + Activity (six
sections); the module now has seven (Cost Dashboard, GD-32, extended by GD-34 F1 in
Session 87). Similarly, `startup-publish-convergence.test.ts`'s test name still says
"all three sections" post-WH-43. Neither is a behavior defect; both would mislead a
future reader doing exactly this session's kind of verification.

**Options.** docs/23 update is the Governance Agent's; the test-name/assertion update
could ride along with F1(a) or F1(b) if authorized.

## Session close

- No code changed → no SBOM update (Session 81/86 precedent, per the opening prompt).
- This report is the session deliverable, committed and pushed.
- Temporary verification file deleted before close; working tree otherwise untouched.

*Session 89 · August 5, 2026 · Build Agent*
