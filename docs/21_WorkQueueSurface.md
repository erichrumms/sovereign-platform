# docs/21 — WorkQueueSurface (Home Dashboard Phase 2)

**Prepared by:** Governance Agent, July 20, 2026
**Status:** Pre-Decisional · Internal Working Document — design authority, not yet a build session
**Resolves:** The honest "To Do / Review" placeholder built in Session 47's Home Dashboard Phase 1
**Governance Decision:** **GD-24 — proposed, not yet approved.**

---

## 1 — Addressing the checkpoint docs/20 §5 itself set

`docs/20` named a specific moment to pause: *"once a third narrow surface exists...
that's the natural point to ask whether some should consolidate into a more general
mechanism."* `ProgramStatusSurface` was that third surface (after `TaskSurface` and
`AriaCertificationSurface`). This would be the fourth. Worth actually checking, not
skipping.

**Checked directly:** `TaskSurface` deals in individually-identified `SharedTask`
records — `assigned_agent_id`, `requires_approval`, `workflow_step_id`,
`origin_request_id` per task. What Phase 2 needs is aggregate *summaries* — "VIGIL
has 5 pending approvals, highest severity P1" — not individual task records.
Forcing this into `TaskSurface`'s shape would mean either publishing every pending
item as a full `SharedTask` (a much larger integration lift across four modules,
and arguably outside what that surface was built for) or building a derived
aggregation layer on top of it — adding complexity rather than removing it.

**Conclusion: a new, narrow surface is genuinely warranted, not reflexive
pattern-repetition.** The checkpoint was honored by actually checking, not by
defaulting to "add another one."

---

## 2 — What this spec builds: `WorkQueueSurface`

### Proposed shell-contract addition (GD-24)

```typescript
export interface WorkQueueSummary {
  readonly module_id: string; // "vigil" | "scribe" | "aria" | "nexus"
  readonly queue_label: string; // human-readable, e.g. "Pending Approvals"
  readonly count: number;
  readonly highest_severity: "P1" | "P2" | "P3" | "P4" | null;
  readonly updated_at: string; // ISO timestamp
}

export interface WorkQueueSurface {
  /** Publish (or replace, by module_id + queue_label) one module's queue summary. */
  publish: (summary: WorkQueueSummary) => void;
  /** Every published summary for one module. */
  listForModule: (module_id: string) => readonly WorkQueueSummary[];
  /** Every published summary, across all modules. */
  list: () => readonly WorkQueueSummary[];
  /** Subscribe to surface changes; returns an unsubscribe function. */
  subscribe: (listener: (summaries: readonly WorkQueueSummary[]) => void) => () => void;
}
```

Same proven shape as `ProgramStatusSurface` and `AriaCertificationSurface` —
`publish`/`list`/`subscribe`, shell-owned, in-memory, one session's lifetime.
`listForModule` is the one addition, since the Home Dashboard needs to group by
source module (Pending Approvals under VIGIL, T&T Reviews under SCRIBE, etc.),
unlike `ProgramStatusSurface`'s flatter per-program shape.

### Who publishes, who reads

- **VIGIL publishes** two summaries: Pending Approvals (its approval-queue count)
  and Unacknowledged Alerts (its alert-queue count) — both counts already exist
  today as the tiles on VIGIL's own Home screen; this just also publishes them.
- **SCRIBE publishes** one summary: T&T Reviews Awaiting You (its `flags` count
  from `TTManagerReview.tsx`).
- **ARIA publishes** one summary: Certifications Awaiting You (`ClearCertificationQueue.tsx`'s
  pending count).
- **NEXUS publishes** one summary: Coordination Items (`PPBECoordinationPanel.tsx`'s
  open-item count).
- **`sovereign-shell` reads** — `PlatformHome.tsx`'s "To Do / Review" section calls
  `ctx.workQueueSurface.list()`, filtered to whichever modules the current role can
  actually see (reusing the same `isAccessible` check already built in Session 47),
  and replaces the honest placeholder with real tiles.

---

## 3 — Done Condition (for the future build session, not this document)

1. `WorkQueueSurface` and `WorkQueueSummary` added to both shell-contract copies,
   identical, SHA-256 re-verified.
2. `ShellWorkQueueSurface` implemented in `sovereign-shell/src/shell.ts`, mirroring
   `ShellAriaSurface`/`ShellProgramStatusSurface`.
3. VIGIL, SCRIBE, ARIA, NEXUS each publish their real counts, on load/change —
   exact integration points (which file, which effect) are Build Agent's to trace
   at build time, per Rule 8, not assumed here.
4. `PlatformHome.tsx`'s "To Do / Review" section reads the surface, filtered by
   role, replacing the Session 47 placeholder.
5. A convergence test per publishing module (four total, or one parameterized
   test covering all four) — same style as Session 44's APEX↔VIGIL test.

---

## 4 — Codebase facts (confirmed by direct read, July 20)

- `TaskSurface`: `shell-contract.ts:1037` — confirmed not the right shape for this
  need (§1).
- `AriaCertificationSurface`/`ProgramStatusSurface`: `sovereign-shell/src/shell.ts`
  — the templates this spec mirrors.
- VIGIL's existing counts: `VigilApp.tsx`, the "Pending approvals"/"Unacknowledged
  alerts" tiles already computed there.
- SCRIBE's count: `TTManagerReview.tsx`, `flags` array.
- ARIA's count: `ClearCertificationQueue.tsx`.
- NEXUS's count: `PPBECoordinationPanel.tsx`, tracked/open item counts.
- `PlatformHome.tsx`'s current placeholder (Session 47) — the exact section this
  spec's D4 replaces: *"Pending approvals and reviews across modules — wired in a
  future session (WorkQueueSurface)."*

---

## 5 — What comes after this — the real fourth-surface question, answered honestly

This is surface #4. Per docs/20 §5's own logic, three real instances is enough
data to generalize from — **this spec proposes that four is not yet the moment
to force consolidation**, since `WorkQueueSurface`'s shape (aggregate summaries)
is genuinely different from `TaskSurface` (individual tasks),
`AriaCertificationSurface` (certification records), and `ProgramStatusSurface`
(program status). Four surfaces, four genuinely different data shapes, is not the
same failure mode as four surfaces doing the same thing four different ways. If a
fifth need arises and it *also* turns out to be an aggregate-summary shape, that
would be the real signal to generalize `WorkQueueSurface` itself rather than
building a fifth — worth flagging now so it isn't lost later.

---

*docs/21 — WorkQueueSurface · July 20, 2026*
*GD-24 proposed, pending Project Principal approval*
*Pre-Decisional · Internal Working Document*
