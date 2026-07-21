# docs/25 — Cross-Module Navigation Primitive ("Door 1")

**Prepared by:** Governance Agent, July 21, 2026
**Design authority:** `docs/22_Informed_Decision_Making.md` §5 (Door 1) and
`docs/23_Reviewers_Workspace_v1.md` §1 item 4 — this spec builds the capability both explicitly
deferred at the time.
**Status:** Pre-Decisional · Internal Working Document
**Governance Decision:** **GD-27 — proposed, not yet approved.**

---

## 1 — What this actually is, now that the Workspace exists to clarify it

When Door 1 was first named, "go deeper" was framed loosely as "jump to the full module." Now
that the Reviewer's Workspace v1 is real and embeds the actual decision components inline, the
use case sharpens: **a reviewer looking at one specific item inside the Workspace (a single VIGIL
request, a single ARIA certification, a single SCRIBE review) may want to see it inside that
module's own full app — where related items, other queues, and surrounding context the Workspace
deliberately doesn't carry are all visible.** The Workspace shows the curated, single-item view;
Door 1 lets a reviewer step into the fuller picture without losing their place.

## 2 — The two real gaps, confirmed by direct source read, July 21

1. **`ModuleContract.mount()`** (`shell-contract.ts:1353`) takes exactly two arguments —
   `(ctx, el)`. No initial-state parameter exists.
2. **No shell-level primitive lets one module trigger navigation into another.** The existing
   mount/unmount logic (`onSelectModule` in `sovereign-shell/src/main.tsx`) is shell-internal —
   only triggered by clicking the sidebar. Modules only ever receive `ctx`; nothing on `ctx`
   today lets a module say "open a different module for me."

Confirmed concretely: VIGIL's own `mount()` (`module-vigil/src/index.ts`) does
`root.render(createElement(VigilApp, { ctx }))` — no room for an incoming selection today. The
same is true for ARIA and SCRIBE.

---

## 3 — The design

### Shell-contract addition (GD-27)

```typescript
export interface ModuleContract {
  // ...existing fields unchanged...
  mount: (ctx: SovereignShellContext, el: HTMLElement, initialState?: unknown) => void;
}
```

One new optional parameter on an existing method — not a new type, not a new surface. Opaque
(`unknown`), same reasoning as `WorkspaceReviewItem`'s payload (docs/23 §2): the shell cannot
import each module's own state shape without inverting the dependency direction every module
already depends on. Each target module narrows its own incoming `initialState` itself.

### A new `ctx` primitive, so any module can trigger navigation

```typescript
export interface SovereignShellContext {
  // ...existing fields unchanged...
  navigateToModule: (moduleId: string, initialState?: unknown) => void;
}
```

Implemented once, in the shell, wrapping the same mount/unmount sequence `onSelectModule`
already performs — generalized so it's callable from *any* module holding `ctx`, not just the
sidebar. This is genuinely new shell wiring, not just a signature change — `onSelectModule`'s
logic currently lives only in `main.tsx`; this spec moves the reusable part of it onto `ctx`.

### Scope for v1 — narrow, matching every other build tonight

**Build the general primitive once. Wire it into exactly three modules — VIGIL, ARIA, SCRIBE —
the same three the Workspace already embeds.** Do not update the other seven modules' `mount()`
functions; they have no current caller and no confirmed need. A future module can adopt the
primitive the same way a second data surface would follow `ProgramStatusSurface`'s template
(`AGENT_REFERENCE`'s own established convention for this kind of thing).

Each of the three:
- Accepts `initialState` in `mount()`, narrows it to its own real shape (e.g.,
  `{ selectedRequestId?: string }` for VIGIL), and threads it as a new optional prop into its
  root App component.
- The root component uses it as the *initial* value of whatever local selection state it
  already has (VIGIL's queue selection, APEX's `selectedProgram` precedent shows the pattern —
  though APEX itself is not in v1's wiring scope) — not a new selection mechanism, just an
  externally-supplied starting value for one that already exists or is added for this purpose.

**The Workspace calls `ctx.navigateToModule("module-vigil", { selectedRequestId })`** from
within its own embedded VIGIL section, giving the reviewer a real "open in VIGIL" action next to
the embedded decision — the first real consumer of the primitive, not a hypothetical one.

---

## 4 — Done Condition (for the future build session, not this document)

1. `mount()`'s signature widened in both shell-contract copies (the third parameter), SHA-256
   re-verified identical.
2. `navigateToModule` added to `SovereignShellContext`, implemented in `sovereign-shell/src/shell.ts`
   (or `main.tsx`, wherever the mount/unmount sequence can be generalized from — Build Agent to
   confirm the right home at build time, per Rule 8).
3. VIGIL, ARIA, and SCRIBE each accept and narrow `initialState`, threading it into their root
   component as a new optional prop.
4. The Workspace's three embedded sections each gain a real "open in \[module\]" action calling
   `navigateToModule` with the relevant item's id.
5. A test per wired module (three total) confirming the full loop: call `navigateToModule`,
   confirm the target module actually opens with the right item pre-selected.

---

## 5 — What's explicitly out of scope

- Wiring the other seven modules — no confirmed need yet.
- Any change to how the Workspace itself embeds real components (docs/23) — this spec only adds
  an additional action alongside the existing embedded experience, it doesn't change it.
- Any change to `WorkspaceReviewItem`, `ReviewerWorkspaceSurface`, or any other surface built
  tonight.

---

*docs/25 — Cross-Module Navigation Primitive ("Door 1") · July 21, 2026*
*GD-27 proposed, pending Project Principal approval*
*Design authority: docs/22_Informed_Decision_Making.md §5; docs/23_Reviewers_Workspace_v1.md §1*
*Pre-Decisional · Internal Working Document*
