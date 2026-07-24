# docs/28 — The Logger's Read Path: Narrower Gap Than First Assessed

**Prepared by:** Governance Agent, July 21, 2026, from a working session with the Project Principal
**Status:** **RESOLVED — GD-28 executed, Session 58, July 23, 2026.** This document's own
recommendation was carried out exactly as written. Retained as the historical record of the
finding and the reasoning, not as an open recommendation.
**Revision note:** this supersedes the version of `docs/28` written earlier the same session as
its original draft. The first version was based on the *public* shell-context interface and
TRACER's own documented workaround, and concluded the fix was large, open-ended infrastructure.
That conclusion was wrong, or at least significantly overstated — a deeper trace into the actual
implementation found the real gap considerably smaller. **Updated again July 24, 2026** to record
that the recommended fix actually shipped.
**Origin:** raised directly by the Project Principal while closing out Walkthrough G's Reviewer's
Workspace pass — asking whether a decision made there is retrievable anywhere, in service of the
platform's own stated purpose: recording the provenance of activity.

---

## 1 — The finding, corrected

**The public interface every screen uses to reach the audit trail (`ctx.logger`) still exposes only
`log()` — that part of the original finding holds.** What's wrong in the first version: this was
treated as evidence that no read capability exists *anywhere*, including in the underlying
implementation. It doesn't hold up. **A real, working read method already exists one layer down —
it's just never been connected to the public interface or to any screen.**

---

## 2 — The evidence, updated

- **`sovereign-shell/src/shell.ts`, `ShellLogger` class:** holds a private, append-only, in-memory
  buffer (`private readonly buffer: SovereignLogEvent[] = []`), and already implements
  `getEntries(): readonly SovereignLogEvent[]`, with its own comment stating exactly what it was
  built for: *"Read-only view of the append-only buffer (governance dashboard / tests)."*
- **Confirmed by direct search: `getEntries()` had zero consumers anywhere in the codebase at the
  time this was written.** Built, working, and completely unused since whenever it was written —
  not a stub, a real method that nothing called. **No longer true as of Session 58 — see §4.**
- **The staging is deliberate and already documented**, not an oversight: *"The local append-only
  buffer is the source of truth in Stage 1, mirroring `sovereign_logger.py`'s append-only JSONL. A
  remote sink is injected in Stage 2... (Decision 21)."* A real governance decision already exists
  establishing this two-stage plan — Stage 1 (in-memory, session-durable, real) is where the
  platform sits; Stage 2 (a persistent remote sink) remains intentionally deferred, not broken.
- **`ctx.data`** still exposes only `{ types: unknown }`, and TRACER's own documented workaround
  still accurately describes TRACER's specific situation — TRACER reaches further than a single
  session (it wants to trace history across time), which the Stage 1 buffer genuinely can't
  provide. That part of the original finding stands; it just isn't the whole picture.

---

## 3 — What this actually meant

**A genuine, real, non-fabricated "what have I decided" view, scoped to the current session, was
close at hand, not foundational work.** The two pieces required:

1. **A shell-contract change** exposing a read path through `SovereignShellContext["logger"]` —
   the standard GD process, not speculative architecture.
2. **A real screen** that reads from it.

**The honest limit that remains, and stayed explicit in what shipped:** this is **session-scoped**.
The buffer lives in memory for as long as the browser tab does; there is no persistent remote sink
connected (Stage 2, per Decision 21, still not reached). "Everything I decided since I opened the
app" is real and now live. "Everything ever decided, across every session, permanently" remains
separate, larger, future work.

---

## 4 — What actually shipped (Session 58, July 23, 2026)

**GD-28 was executed exactly as recommended in this document's decided form (`docs/29`):**

- `getEntries: () => readonly SovereignLogEvent[]` added to `SovereignShellContext["logger"]`.
  Shell contract v1.22 → v1.23. Both copies verified SHA-identical at open and close. Confirmed by
  direct trace: `getEntries()` itself required no changes — the type declaration simply caught up
  to what the runtime object already did.
- **The Activity & Decisions tab** was built as a new section in the Reviewer's Workspace (not a
  new top-level module — a real scoping call made at the time, since the Workspace already exists
  as a `SovereignProduct`, GD-26, avoiding a second new-product governance decision). Default view
  filtered to the signed-in user's own decisions (`event.actor_name === ctx.auth.user.name`); an
  admin toggle (PLATFORM_ADMIN/SYSTEM_ADMIN) shows every entry. The session-scope limit is stated
  directly in the UI via a prominent disclosure banner — the same honesty convention as every other
  placeholder/"Coming Soon" label in the platform.
- **One real collateral finding, worth keeping on record:** widening the logger interface broke
  `module-lens/src/session-events.ts`'s `withSessionCapture()`, a partial logger override that no
  longer satisfied the widened type. Fixed with a passthrough (`getEntries: () => ctx.logger.getEntries()`)
  — a genuine, if small, example of a type change having a real ripple effect worth tracing, not
  assuming was isolated to the one file it was designed for.

---

## 5 — What remains genuinely open

- **Stage 2 (a real, persistent, cross-session audit store)** — still not decided, still not
  urgent, now with a working Stage 1 in production use to learn from before committing to Stage
  2's actual shape.
- **The exact scope of the exposed read method** — shipped as unfiltered (`getEntries()` returns
  everything; the UI does its own actor-based filtering client-side). Whether a filtered/scoped
  server-side query method is ever worth adding is a real question if the entry count ever grows
  large enough for client-side filtering to matter — not a concern today.
- **Whether a sixth module-local session-store pattern (Session 61 built four more, all sharing
  one shape with `vigil-approval-session.ts`) deserves a shared helper extraction** — flagged in
  `AGENT_REFERENCE.md`, not resolved here; a different question from this document's original
  scope but worth cross-referencing since the shapes are related.

---

*docs/28 — The Logger's Read Path: Narrower Gap Than First Assessed*
*July 21, 2026 · Revised same session · Resolved July 23, 2026 (GD-28, Session 58)*
*Updated July 24, 2026 to record execution*
*Pre-Decisional · Internal Working Document*
