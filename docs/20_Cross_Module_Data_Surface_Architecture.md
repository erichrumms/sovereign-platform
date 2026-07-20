# docs/20 — Cross-Module Data Surface Architecture

**Prepared by:** Governance Agent, July 19, 2026
**Status:** Pre-Decisional · Internal Working Document — **not yet a build session,
this is the design authority a future session gets scoped against**
**Resolves:** Session 40's Hard Stop (VIGIL could not reach APEX program data);
independently named the plan's clearest sequencing risk by
`SOVEREIGN_EndToEnd_Assessment_20260719.md`
**Governance Decision:** **GD-23 — approved by the Project Principal, July 19, 2026.
Built and verified, Session 44 (`3f0db9d`).**

---

## 1 — Why this isn't a new problem for the platform

Session 40 Hard-Stopped correctly — but not because no solution exists. The
codebase already has **two working examples of exactly this problem, solved the
same way, twice:**

1. **`TaskSurface`** (shell-contract.ts, `~line 1037`) — a generic
   publish/subscribe store keyed by `task_id`. Real, working consumer: the
   Session 35 VIGIL→SCRIBE cross-module state gap fix (GD-19).
2. **`AriaCertificationSurface`** (`ShellAriaSurface` in `sovereign-shell/src/shell.ts`,
   *"the tenth export," GD-20, shell-contract v1.15*) — a narrower,
   purpose-built surface specifically for CLEAR certification records, keyed
   by `document_id`. Real, working consumers: ARIA's Certification Queue
   writes to it; SCRIBE's export gate reads `isCertified()` from it.

**The established pattern, confirmed twice:** when one module needs to see
what another module knows, the platform does not reach across module
boundaries with a direct import. It adds a small, shell-owned, in-memory
surface with its own narrow interface, under a numbered GD and a
shell-contract version bump. This spec proposes a third instance of that same
pattern — not a new architecture.

---

## 2 — What this spec actually builds: `ProgramStatusSurface`

**Deliberately narrow**, per the Project Principal's own instruction: solves
the concrete case (VIGIL's `ppbe_obligation` approval brief needs to show
program-level financial context, per WF-20) — not a general "any module can
query any other module's arbitrary data" mechanism. See §5 for what "start
narrow" means for what comes after this.

### Proposed shell-contract addition (GD-23)

```typescript
export interface ProgramStatusSnapshot {
  readonly program_id: string;
  readonly percent_obligated: number;
  readonly status: "on_track" | "at_risk" | "off_track";
  /** Pre-composed, human-readable summary. Reuse APEX's existing narrative
      convention (confirmed real, PPBEDashboard.tsx's `m.narrative` field on
      obligation_rates) rather than building a second summarization path in
      a second module. */
  readonly narrative: string;
  readonly updated_at: string; // ISO timestamp
}

export interface ProgramStatusSurface {
  /** Publish (or replace, by program_id) a program's current status. */
  publish: (status: ProgramStatusSnapshot) => void;
  /** Look up one program's status by id. */
  get: (program_id: string) => ProgramStatusSnapshot | undefined;
  /** A read-only snapshot of every published program status. */
  list: () => readonly ProgramStatusSnapshot[];
  /** Subscribe to surface changes; returns an unsubscribe function. */
  subscribe: (listener: (statuses: readonly ProgramStatusSnapshot[]) => void) => () => void;
}
```

This is `AriaCertificationSurface`'s exact shape, field-for-field — same
`publish`/`get`/`list`/`subscribe` methods, same last-write-wins-by-id
semantics, same "shell-owned, in-memory, lifetime of one platform session"
scope. Deliberately not inventing new conventions where a proven one already
fits.

### Who publishes, who reads

- **APEX publishes** — a `ProgramStatusSnapshot` per program, whenever program
  data is loaded or changes (mirroring `PPBEDashboard.tsx`'s existing
  `obligation_rates` computation, which already produces every field this
  snapshot needs except `status`, which requires a threshold rule — Build
  Agent's judgment on where that rule lives, likely alongside the existing
  narrative-generation logic).
- **VIGIL reads** — `approval-engine.ts`'s `describeWhatChanges()`, specifically
  the `ppbe_obligation` case, calls `ctx.programStatusSurface.get(program_id)`
  and includes the resulting one-line summary in the brief. This directly and
  fully resolves WF-20, which Session 39 only partially addressed (it added
  `cost_code`/`obligation_id` — data that was already local to the request —
  not the actual cross-module program context WF-20 was originally about).

---

## 3 — Done Condition (for the future build session, not this document)

1. `ProgramStatusSurface` and `ProgramStatusSnapshot` added to both
   shell-contract copies, identical, SHA-256 re-verified (Constraint #11).
2. `ShellProgramStatusSurface` implemented in `sovereign-shell/src/shell.ts`,
   mirroring `ShellAriaSurface` exactly.
3. APEX publishes on program data load/change.
4. VIGIL's `ppbe_obligation` brief reads it and includes the program summary.
5. Regression test confirming the full loop: publish from APEX's side, read
   from VIGIL's side, in one shared context — same style as Session 35's own
   convergence test for the VIGIL→SCRIBE case.

---

## 4 — Codebase facts (confirmed by direct read, July 19)

- `TaskSurface` interface: `shell-contract.ts:1037`.
- `ShellAriaSurface` (the exact template this spec copies): `sovereign-shell/src/shell.ts`,
  immediately following `ShellTaskSurface`'s own definition. Comment block
  explicitly documents it as "the tenth export (GD-20, shell-contract v1.15)."
- APEX's existing structured, narrative-bearing program data:
  `module-apex/src/PPBEDashboard.tsx`, `data.obligation_rates` — confirmed
  each entry already carries a `program_id` and a pre-composed `narrative`
  string; the raw numeric fields behind that narrative were not traced in
  this session and should be confirmed at build time, not assumed.
- VIGIL's target integration point: `module-vigil/src/approval-engine.ts`,
  `describeWhatChanges()`, the `ppbe_obligation` case — the exact function
  Session 39 already touched for WF-22's plain-language rewrite.

---

## 5 — What "start narrow, expect to expand" means concretely

**Easy expansion, no redesign needed:** any future consumer that also wants
program status — the Reviewer's Workspace consolidation idea, most likely —
reads from this same surface. `subscribe()`/`get()` already support multiple
independent consumers; this is what the pattern is for.

**Harder expansion, but already precedented:** a genuinely different kind of
cross-module data (SCRIBE draft status visible to NEXUS; FLOWPATH dependency
health visible to APEX; anything not program-status-shaped) needs its **own**
new surface, following this same template — not retrofitted into
`ProgramStatusSurface`. Resist the temptation to widen this one type to cover
an unrelated case; that's exactly the "divergent duplicate" pattern
Constraint #2 already warns against, just inverted (one bloated surface
instead of two diverging ones).

**A concrete checkpoint, not an open-ended judgment call:** once a third
narrow surface exists alongside `TaskSurface` and `AriaCertificationSurface`,
that's the natural point to ask whether some of them should consolidate into
a more general mechanism — not before, and not decided in the abstract now.
Three real instances is enough data to generalize from; two is what the
platform already had before this spec, and forcing generalization at two
would be guessing.

**Documentation obligation, once built:** add this pattern to
`AGENT_REFERENCE.md`'s Known Codebase Facts, same treatment as the ARIA
per-tab gating pattern from GD-22 — cite the reference implementation, state
plainly that a second data surface should copy this shape rather than
reinvent it. Do not let a fourth surface get built without this spec (or its
AGENT_REFERENCE entry) having been read first.

---

*docs/20 — Cross-Module Data Surface Architecture · July 19, 2026*
*GD-23 proposed, pending Project Principal approval*
*Pre-Decisional · Internal Working Document*
