# SOVEREIGN Platform — Post-Session-50 Technical Assessment
**Prepared by:** Governance Agent, July 20, 2026
**Status:** Pre-Decisional · Internal Working Document · Advisory only
**This is not a build session.** No code changes, spec updates, or governance documents
were modified as part of producing this assessment.
**Note on `End_of_Session_Prompt.md`:** treated as obsolete and ignored per the assessment
request's explicit instruction.

---

## Part 1 — Standard verification pass

### Script outputs: actual findings, not a summary

All three scripts ran from HEAD `71c5e8f` (the assessment-request commit, one ahead of `6a23121`).

---

**`sovereign_session_verify.sh`**: 24 pass / 5 warn / 0 fail.

*HEAD warning* — script still expects `3c35131` (last time the script was updated). Current HEAD is
`71c5e8f`. Working tree is clean. The script's own note explains this correctly: "may just mean new
commits landed since this script was last updated." Not a defect — the script is stale, not the repo.

*Shell-contract hash warning* — script still expects the v1.16 hash. Both copies carry
`22ee233525ac2c636153cb604ec6a7c1822889a02f9d38bfbc0dda3d921f63d3` (v1.20, GD-25). The script
explicitly reports `PASS: 2 copies found, and they are identical to each other` — Constraint #11 is
satisfied. The warning is the script being stale, not a problem with the copies.

*All 15 test suites pass.* `test:workspace` and `test:e2e` are the two added this session; all
fifteen exit 0. Python suite (sovereign-security): 195 passed.

*Two governance artifact warnings* (Walkthrough F files) — pre-existing, not from Sessions 44–50;
they are referenced by the verify script's hardcoded checklist but those artifacts live elsewhere
in the repo (`SOVEREIGN_Walkthrough_F_Complete.md`). Not a new gap.

*AGENT_REFERENCE.md agent-count self-contradiction* — the verify script surfaces this indirectly
via the count-lines check: two lines claim different totals ("36" on line 1013, "44" on line 1371).
This was identified in `SOVEREIGN_EndToEnd_Assessment_20260719.md` and has not been resolved. It
is noted again here as a low-severity persistence item (see Part 3).

---

**`sovereign_platform_map.sh`**: All 15 declared workspaces confirmed. `module-workspace` is present
in both the workspaces array and as a physical directory. No unexpected workspaces. Gather scripts
are present for Sessions 9–20, 24–31, 35, 38–44, 46–47 — gap noted for Sessions 48–50 (no gather
scripts committed for those sessions, consistent with the pattern that gather scripts are committed
at session-prep time). Integration Brief shows v1.46 internally vs. v1.47 filename — pre-existing
filename/content drift, not from Sessions 44–50.

---

**`repo_integrity_check.sh`**: 9 issues found.

*Near-duplicate clusters*: The strategic plan cluster (v1, v3.3, v3.4, v3.5) is expected version
history, not a bug. The `SBOM_Session7_Update.md` cluster (module-lens vs. module-vigil) reflects
two separate module SBOM files with the same name — pre-existing, benign. The README cluster is
`.pytest_cache/README.md` vs. root `README.md` — different files, not related.

*Manifest hash mismatches*: `Agent_Identity_Standard.md` and `AGENT_REFERENCE.md` have changed
since the manifest was last hashed. Both are living governance documents that received updates
during Sessions 44–50 — specifically, `AGENT_REFERENCE.md` was updated to record the per-tab
gating pattern from GD-22. The manifest was not re-hashed after those updates. Advisory: the
manifest's utility depends on re-hashing after deliberate changes to tracked documents.

*Missing manifest entries* (`SBOM_Registry_v1.39.md`, `SBOM_Registry_v1.40.md`,
`SOVEREIGN_System_Prompt_v29.md`, `SOVEREIGN_System_Prompt_v31.md`): these appear to be files the
manifest references that were never committed to the repo, or were committed under different names.
Pre-existing; not from Sessions 44–50.

*Many governance files not tracked by `DOCUMENT_MANIFEST.tsv`*: every session handoff (Sessions
8–50), every SBOM update file, and a large number of assessment/strategy documents are flagged as
untracked. The manifest was never designed to track session artifacts — its scope is standing
governance and reference documents. The volume of this warning is cosmetic (the script produces
one line per untracked governance-pattern file) and pre-existing.

**Overall Part 1 verdict:** No new integrity issues from Sessions 44–50. All WARN items are either
pre-existing or explained by stale script expectations. The working tree is clean, both
shell-contract copies are byte-identical at v1.20, and all 15 test suites pass.

---

## Part 2 — The five-surface consolidation question

The five surfaces, read side by side, with their actual implementation in `sovereign-shell/src/shell.ts`:

| # | Surface | GD | Key composition | Unique method | Item type |
|---|---|---|---|---|---|
| 9 | `TaskSurface` | GD-19 | `task_id` | `update()` — patch without replace | `SharedTask` (typed, many fields) |
| 10 | `AriaCertificationSurface` | GD-20 | `document_id` | `isCertified()` — boolean gate check | `AriaCertification` (typed, rich decision record) |
| 11 | `ProgramStatusSurface` | GD-23 | `program_id` | (none beyond base pattern) | `ProgramStatusSnapshot` (typed: percent, status, narrative) |
| 12 | `WorkQueueSurface` | GD-24 | `module_id::queue_label` | `listForModule()` — module-namespace iteration | `WorkQueueSummary` (aggregate count+severity only — no full items) |
| 13 | `ReviewerWorkspaceSurface` | GD-25 | `module_id::item_id` | `remove()` — decided items must leave, not just age out | `WorkspaceReviewItem` (opaque payload, narrowed by consumer) |

---

### Q1: Do any two actually do the same job?

**No. But the implementation engine's redundancy is now clearly visible, and that's the real finding.**

The closest pair is surfaces 12 and 13 (WorkQueue and ReviewerWorkspace): both use the
`module_id::` namespace, both have `listForModule()`. But they carry categorically different data
at the item level. `WorkQueueSurface` holds **aggregate summaries** — a named count (e.g.
"Pending Approvals: 3") for the Home Dashboard's tile layout. `ReviewerWorkspaceSurface` holds
**full individual items** — the actual `AgentApprovalRequest` or `ClearEvaluationInput` or
`TTReviewItem` — for the Workspace to render a real decision component against. You cannot
merge these without breaking one use case or the other:

- Adding full payloads to `WorkQueueSummary` would mean the Home Dashboard receives every
  full request object on every queue change, when it only needs counts and severity.
- Having the Workspace derive items from the WorkQueue surface would require that surface to
  hold opaque payloads and gain a `remove()` method — at which point you've reproduced the
  `ReviewerWorkspaceSurface` interface on the `WorkQueueSurface` and the "merge" has just
  moved the seam, not eliminated it.

The other pairs are more clearly distinct: `TaskSurface` is the only general cross-product
visibility mechanism (multiple producers, multiple consumer patterns); `AriaCertificationSurface`
is the only one with a boolean gate check (`isCertified()` is what SCRIBE's export gate calls,
not a lookup); `ProgramStatusSurface` is the only one that carries pre-composed narrative
alongside the datum, reflecting APEX's existing `obligationRate()` output.

**The reasoning that justified each addition individually still holds when they're all visible
together.** The consolidation checkpoint docs/20 §5 named was not "these will look the same at
three" — it was "three real instances is enough data to generalize from." Having now built five,
the honest read is: **the jobs are genuinely different, but the engine underneath is not**.

Every implementation in `shell.ts` is structurally identical: a `private Map`, a
`private Set<listener>`, and a `notify()` method that snapshots the Map and fans out to
listeners. Lines 539–756 in `shell.ts` are five variations on the same seventeen-line template.
This is not wrong — the pattern is correct — but it is the kind of redundancy that a sixth
copy would make worth naming directly. See Part 3 Q2.

---

### Q2: Is the pattern still right for a sixth surface?

**Yes, with a sharper entry test than was needed at three.**

The pattern (small, typed, `publish`/`list`/`subscribe`, shell-owned, no governance authority,
plain in-memory `Map`) is correct specifically for the case where one module needs to see what
another module has, and a direct cross-module import would invert the dependency direction
(modules import from the shell-contract, never the reverse). That condition hasn't changed.

What has changed: the test "is a new surface the right answer here" is now more demanding because
we have five real examples to compare against. Before proposing a sixth surface, the right
questions in sequence are:

1. **Does a cross-module import actually need to be avoided?** If the consuming module could
   import directly from the publishing module without inverting the dependency graph, a surface
   is overhead.
2. **Does an existing surface already serve this data flow?** With five surfaces covering
   task-visibility, CLEAR certification, program financial status, queue counts, and full
   reviewable items, the chance that a sixth new use case fits an existing surface has grown.
3. **Is the data point or data set that needs crossing narrow enough to be a shell-contract
   type?** If answering that question requires importing one module's types into the
   shell-contract, the opaque-payload approach (surface 13's design) is the right answer —
   but "opaque payload plus type-only import narrowing" is a deliberate tradeoff, not a default.

One friction point that became apparent only after building five: the `MODULE_PRODUCT` mapping
in the loader (`sovereign-shell/src/module-loader/index.ts`) needs a `SovereignProduct` member
for each registered module. `module-workspace` is currently mapped to `"VIGIL"` because
`WORKSPACE` doesn't exist in the `SovereignProduct` union. This is a small gap that was
acceptable at one module, but would compound if more cross-module modules get added without
resolving it. A sixth surface or a second cross-module module should trigger a GD to add the
appropriate `SovereignProduct` member.

---

### Q3: ReviewerWorkspaceSurface — opaque payload plus type-only import narrowing

**Solid. One real rough edge that wasn't visible in the spec.**

What works exactly as expected:
- The type-only import pattern (`import type { AgentApprovalRequest } from
  "../../module-vigil/src/approval-contract"`) is established precedent — four prior consumers
  in the codebase already use it. The Workspace is the fifth, not the first. No new ground was
  broken; the rough edges of type-only imports were already absorbed by the prior uses.
- The opaque `unknown` payload keeps the shell-contract genuinely clean: it imports nothing from
  any module, which is the invariant the pattern protects.
- The `remove()` method works as designed — the Map's `delete()` with a conditional notify
  is simple enough to be obviously correct, and the convergence tests confirm it end-to-end.

The rough edge: the `module_id` field is typed as `string` in `WorkspaceReviewItem`, not as a
discriminated union literal (`"vigil" | "aria" | "scribe"`). The shell-contract can't narrow it
to literals without either importing the modules' own types (which violates the dependency
direction) or adding a frozen string union to the contract (which would require a GD every time
a fourth module gets added to the Workspace). The consuming Workspace module narrows by checking
`item.module_id === "vigil"` before the type assertion — which is correct — but TypeScript
doesn't enforce exhaustiveness of the `module_id` switch. If a fourth module is added to the
Workspace and its `module_id` isn't handled in the render switch, the code will compile cleanly
and the item will silently fall through to the empty-state handler.

This is a known limitation of the opaque-payload approach, not a design mistake — the spec
(`docs/23 §2`) correctly characterizes it as an intentional tradeoff. But it should be
documented at the narrowing site in `WorkspaceApp.tsx` so a future builder knows the type
checker won't catch the miss. Worth a one-line comment at the dispatch switch, not a redesign.

---

## Part 3 — Forward priority

### Q1: What's the right next priority?

**The cross-module navigation primitive (docs/22 §5, Door 1) — before expanding the Workspace
to more decision screens.**

This became clearest while building the VIGIL section in the Workspace. A reviewer looking at
an `AgentApprovalRequest` whose `action_type === "ppbe_obligation"` now has the program's
financial context inline (the `ProgramStatusSurface` data, Session 44's contribution). But they
cannot navigate to that program in APEX to see the full obligation schedule, the exhibit history,
or the budget exhibit — not without manually opening APEX in a separate module, navigating to the
PPBE Dashboard, finding the program, and switching to the detail view. That path exists and
works, but it breaks the reviewer's context entirely.

`loader.mount()` currently takes exactly two arguments: `module_id` and the DOM element
(`sovereign-shell/src/main.tsx`, confirmed by docs/22 §5 direct-read note). Every module opens
cold at its default screen. A state-preserving navigation primitive — even a minimal one, passing
an initial-state blob that the target module optionally reads — would mean the Workspace's
"go deeper" affordance opens APEX already on the right program, or SCRIBE already on the right
draft. Without it, every new embedded decision component added to the Workspace inherits the
same friction.

Building the primitive first means every subsequent Workspace expansion (Screens 4, 5, 6 from
the fourteen in docs/22) arrives with the full three doors available, not two. Building more
screens first means more embedded components with no "go deeper" pathway, and retrofitting the
primitive later costs more (each module needs a new entry-point contract).

The deferred v1.1 state-preserving navigation (`docs/23 §1 item 4`) directly depends on this
primitive. They are not separate features — v1.1 is how the Workspace uses the primitive. So
the sequencing is: primitive first (its own GD, its own shell-contract change, non-trivial),
then v1.1 as the first real consumer.

**Expanding the Workspace to more decision screens**: this is the right follow-on after the
primitive exists, not before. The fourteen screens catalogued in docs/22 are not all equivalent
— some are well-specified (the three already built), some are mentioned but not spec'd. The
right shape is one or two new screens per session, each preceded by the same docs/23-style
design document that specifies which real component embeds, what data it needs, and how the
`remove()` path works.

---

### Q2: Real accumulating technical debt?

**Yes — three specific items, none of them blockers but all accumulating.**

**1. AGENT_REFERENCE.md agent-count self-contradiction (first flagged July 19).**
Lines 1013 and 1371 claim different totals (36 and 44). Both numbers appear to be snapshots
from different moments in the file's edit history. The July 19 assessment named this; seven
sessions later it is still unresolved. It's low-severity (the file is a reference, not an
enforced constraint) but it trains every future session to distrust the count, which defeats
the purpose of having it. A one-line reconciliation fix, sized for a non-build session.

**2. `MODULE_PRODUCT` missing a `WORKSPACE` SovereignProduct member.**
`module-workspace` maps to `"VIGIL"` in the loader's `MODULE_PRODUCT` table
(`sovereign-shell/src/module-loader/index.ts:87`) because `WORKSPACE` doesn't exist in
the frozen `SovereignProduct` union. This was flagged explicitly in the Session 50 handoff
and in the loader's own comment. Any event emitted by module-workspace carries `product: "VIGIL"`
in the Logger — which is actively misleading for audit purposes. The fix is a GD to add
`"WORKSPACE"` to `SovereignProduct`, update `MODULE_PRODUCT`, and update the module-loader's
validation comment. One shell-contract version bump. Should be the next available GD,
not deferred to the session that first needs it for real.

**3. `sovereign_session_verify.sh` frozen at old expectations.**
The script still expects HEAD at `3c35131` and the v1.16 shell-contract hash. Every session
starts by producing two WARNs that need manual interpretation before confirming they're
expected. The script's own explanatory text is correct, but requiring every session to
re-read it and manually confirm "yes, the WARN is about script staleness, not a real
problem" is noise at exactly the moment attention should be on the new work. The expected
HEAD and hash should be updated each close protocol, or the script should read them from a
small sidecar file (`verify_expectations.conf`) that the close protocol updates alongside the
handoff document. This is the only item here that would save real time at the start of the
next session.

---

### Q3: module-workspace test coverage

**17 unit tests, 4 e2e convergence tests. Thin for a module whose job is committing governed decisions.**

The 17 unit tests cover:
- Module contract (correct registration, role list, health check shape) — index.test.ts
- Per-section gating for all five live roles — WorkspaceApp.test.tsx
- One ARIA embed end-to-end: published item → certify → removal from surface + `ctx.aria` record

The 4 convergence tests (e2e/tests/reviewer-workspace-convergence.test.tsx) cover the full
publish→decide→remove loop for all three modules, plus surface semantics (last-write-wins,
no-op remove).

**What's missing at the unit level**: the VIGIL and SCRIBE removal paths in `WorkspaceApp.tsx`
are tested only in the e2e convergence suite, not in module-workspace's own tests. The
`WorkspaceApp.test.tsx` file confirms that VIGIL and SCRIBE sections render (the tab-gating
tests confirm the tabs are present and enabled), but there is no unit test that:

- publishes a `VigilWorkspacePayload` to the surface, renders the VIGIL section, clicks Approve
  in the embedded `ApprovalDetail`, and confirms the item left the surface.
- publishes a `TTReviewItem` to the surface, renders the SCRIBE section, clicks Send in the
  embedded `TTManagerReview`, and confirms the item left the surface.

The ARIA embed test (WorkspaceApp.test.tsx lines 83–120) is exactly this shape — and it
correctly confirms both the surface removal and the `ctx.aria.isCertified()` decision of record.
VIGIL and SCRIBE lack equivalent coverage at the unit level. If the `onDecided` or `onSent`
wiring in WorkspaceApp.tsx breaks, the module-workspace unit tests won't catch it. Only the e2e
convergence test would.

The risk this creates is proportional: the Workspace's specific job is to commit governed
decisions, so the decision-commit paths are exactly the highest-risk lines in the module. Having
all three covered at the e2e level is good; having only one covered at the unit level means the
cost of finding a regression in the other two is higher than it needs to be.

**Recommendation**: add two WorkspaceApp unit tests — VIGIL embed + removal, SCRIBE embed +
removal — in the same style as the existing ARIA embed test (publish item to surface, render
section, act, confirm surface.listForModule() is empty and the corresponding Logger event fired).
Would bring module-workspace's unit tests from 17 to 19, with VIGIL, ARIA, and SCRIBE all
covered at the same level of specificity.

---

## Summary table

| Finding | Severity | Origin | Recommended action |
|---|---|---|---|
| All 15 test suites pass | ✅ healthy | Session 50 | — |
| Both shell-contract copies byte-identical at v1.20 | ✅ healthy | Session 50 | — |
| No functional overlap among five surfaces | ✅ healthy | This assessment | — |
| Implementation engine redundancy visible (five `Map+Set+notify()` copies) | advisory | Sessions 44–50 accumulated | Document at sixth-surface gate; consider extracting helper when sixth copy arrives |
| `module_id` not exhaustiveness-checked in Workspace dispatch | advisory | Session 50 design tradeoff | Add one-line comment at narrowing site in WorkspaceApp.tsx |
| AGENT_REFERENCE.md agent-count contradiction (lines 1013 vs. 1371) | low | Pre-Session 44 | One-line fix, next non-build session |
| `MODULE_PRODUCT` missing `WORKSPACE` SovereignProduct member | medium | Session 50 | Next available GD, shell-contract bump |
| `sovereign_session_verify.sh` stale expectations | low | Session 50+ | Update script expectations as part of next close protocol; or add sidecar conf file |
| VIGIL and SCRIBE removal paths untested at unit level | medium | Session 50 | Add 2 WorkspaceApp tests (VIGIL embed + removal, SCRIBE embed + removal) |
| Cross-module navigation primitive (Door 1) absent | medium | Architectural gap | Own GD, own shell-contract change; priority before next Workspace expansion |

---

## Recommended next three steps (not a build prompt — advisory)

1. **GD-26: Add `WORKSPACE` to `SovereignProduct` and update `MODULE_PRODUCT`.** Small, contained
   shell-contract change. Unblocks honest audit-trail product attribution for module-workspace.
   Can be bundled with the two additional WorkspaceApp unit tests (VIGIL + SCRIBE embed) as a
   single small session.

2. **Design document: cross-module navigation primitive (Door 1).** Equivalent to docs/20's role
   for GD-23: a design-authority document that specifies exactly what `loader.mount()` gains, how
   modules declare initial-state contracts, and what the Workspace v1.1 consumes. Should be
   written and agreed before a build session scopes it.

3. **Resolve AGENT_REFERENCE.md agent-count contradiction and update `sovereign_session_verify.sh`
   expectations.** Housekeeping; appropriate for a non-build slot or the opening of a small build
   session before the main work begins.

---

*SOVEREIGN Platform · Post-Session-50 Technical Assessment · July 20, 2026*
*Advisory only — not a build session*
*Pre-Decisional · Internal Working Document*
