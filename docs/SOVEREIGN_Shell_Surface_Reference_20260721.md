# SOVEREIGN Platform — Shell-Owned Cross-Module Surface Reference

**Prepared by:** Governance Agent, July 21, 2026
**Status:** Pre-Decisional · Internal Working Document — reference, not a spec
**Why this exists:** `docs/20` §5 anticipated needing this once several surfaces
existed — it never got built. Six now exist. This catalogs all of them in one
place so a future session doesn't have to reconstruct the pattern from six
separate `docs/NN` files.

---

## The pattern, stated once

When one module needs to know what another module knows, this platform does
not reach across the module boundary with a direct import. It adds a small,
shell-owned, in-memory primitive — a `SovereignShellContext` member — under a
numbered governance decision and a shell-contract version bump. Every
instance below follows this same discipline; none was built casually.

---

## The six, in the order they were built

| # | Primitive | GD | Contract v | Shape | What it carries |
|---|---|---|---|---|---|
| 1 | `TaskSurface` | GD-19 | — | `publish`/`list`/`subscribe` | Individually-identified `SharedTask` records — a general-purpose work-item registry |
| 2 | `AriaCertificationSurface` | GD-20 | v1.15 | `record`/`isCertified`/`list`/`subscribe` | CLEAR certification records — narrow, single-purpose |
| 3 | `ProgramStatusSurface` | GD-23 | v1.18 | `publish`/`get`/`list`/`subscribe` | Per-program obligation status snapshots — narrow, single-purpose |
| 4 | `WorkQueueSurface` | GD-24 | v1.19 | `publish`/`list`/`listForModule`/`subscribe` | Aggregate pending-item **counts** per module — deliberately evaluated against reusing `TaskSurface` first; rejected because counts and individual tasks are genuinely different shapes |
| 5 | `ReviewerWorkspaceSurface` | GD-25 | v1.20 | `publish`/`remove`/`list`/`listForModule`/`subscribe` | Full, individually-identified reviewable items with an **opaque payload** — the first surface to enable embedding real, working UI across a module boundary, not just sharing data |
| 6 | `navigateToModule` | GD-27 | v1.22 | A `ctx` method, not a data surface | Navigation intent — "open this module with this state already loaded" — genuinely different from the other five, which all share data |

**Fourteen total `SovereignShellContext` exports as of v1.22** — the original
eight plus these six.

---

## What makes each one narrow, not a duplicate of another

This is the question worth asking before building a seventh — and it's the
same question `docs/20` §5 named as the right checkpoint, now actually
answered with real evidence instead of deferred:

- **`TaskSurface` vs. `WorkQueueSurface`:** individual named tasks vs.
  aggregate counts. Confirmed genuinely different when `WorkQueueSurface`
  was scoped (GD-24) — forcing counts into `TaskSurface`'s shape would have
  meant either publishing every pending item as a full task (much larger
  integration cost) or building a derived aggregation layer on top.
- **`WorkQueueSurface` vs. `ReviewerWorkspaceSurface`:** the closest pair —
  both key by `module_id` and both have `listForModule()`. But one carries
  counts, the other carries full native objects meant to be handed directly
  to a real UI component. Confirmed as genuinely different, not overlapping,
  in the post-Session-50 technical assessment that specifically checked this.
- **`ProgramStatusSurface` vs. `ReviewerWorkspaceSurface`:** one is a status
  snapshot (a fact about a program); the other is an actionable item (a
  thing to decide). Different enough that `ReviewerWorkspaceSurface` was
  built as its own surface without serious consideration of reusing
  `ProgramStatusSurface`'s shape.

**A repeated implementation pattern was found, not a repeated purpose.** The
same post-Session-50 assessment that confirmed no two surfaces do the same
job also found that all five data surfaces (everything except
`navigateToModule`) share an identical `Map` + `Set<listener>` + `notify()`
implementation template in `sovereign-shell/src/shell.ts` — five separate,
hand-written copies of the same boilerplate. **This is a real, named
threshold, not yet crossed:** a sixth *data* surface (not counting
`navigateToModule`, which is a different kind of primitive) should trigger
extracting that shared plumbing into a helper, rather than writing a sixth
copy by hand.

---

## When to build a seventh, and when not to

**Build a new surface when:** a genuine cross-module data-sharing need
exists, and it doesn't fit any existing surface's actual shape (not just its
superficial category — "another thing VIGIL needs to share" is not
automatically a `WorkQueueSurface`-shaped need).

**Don't build a new surface when:** an existing one already carries what's
needed — check `listForModule()`-style surfaces first, since they're built
for exactly this kind of extension.

**`navigateToModule` is a different kind of primitive, worth remembering as
its own category.** It doesn't share data — it shares *navigation intent*.
If a future need looks like "let one module trigger something in another,"
check whether it's actually a `navigateToModule`-shaped need before
reaching for a data surface.

---

*SOVEREIGN Platform · Shell-Owned Cross-Module Surface Reference · July 21, 2026*
*Pre-Decisional · Internal Working Document*
