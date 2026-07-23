# docs/28 — The Logger's Read Path: Narrower Gap Than First Assessed

**Prepared by:** Governance Agent, July 21, 2026, from a working session with the Project Principal
**Status:** Pre-Decisional · Internal Working Document — a finding and a decision framework, not a
build spec and not a decision already made.
**Revision note:** this supersedes the version of `docs/28` written minutes earlier the same
session. The first version was based on the *public* shell-context interface and TRACER's own
documented workaround, and concluded the fix was large, open-ended infrastructure. **That
conclusion was wrong, or at least significantly overstated** — a deeper trace into the actual
implementation (prompted directly by the Project Principal noting there's no demo deadline, which
made it worth checking properly rather than assuming) found the real gap is considerably smaller.
Revising in place rather than leaving an overly pessimistic version in circulation.
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
- **Confirmed by direct search: `getEntries()` has zero consumers anywhere in the codebase.** Built,
  working, and completely unused since whenever it was written — not a stub, a real method that
  nothing currently calls.
- **The staging is deliberate and already documented**, not an oversight: *"The local append-only
  buffer is the source of truth in Stage 1, mirroring `sovereign_logger.py`'s append-only JSONL. A
  remote sink is injected in Stage 2... (Decision 21)."* A real governance decision already exists
  establishing this two-stage plan — Stage 1 (in-memory, session-durable, real) is where the
  platform currently sits; Stage 2 (a persistent remote sink) is intentionally deferred, not broken.
- **`ctx.data`** still exposes only `{ types: unknown }`, and TRACER's own documented workaround
  (§2 of the prior version) still accurately describes TRACER's specific situation — TRACER reaches
  further than a single session (it wants to trace history across time), which the Stage 1 buffer
  genuinely can't provide. That part of the original finding stands; it just isn't the whole picture.

---

## 3 — What this actually means

**A genuine, real, non-fabricated "what have I decided" view — scoped to the current session — is
close at hand, not foundational work.** The two pieces required:

1. **A shell-contract change** exposing a read path (most simply, `getEntries()` itself, or a
   filtered variant) through `SovereignShellContext["logger"]` — the standard GD process, not
   speculative architecture.
2. **A real screen** that reads from it — a genuine Activity/Decision History view, not a
   per-module workaround.

**The honest limit that remains, and should stay explicit wherever this gets built:** this is
**session-scoped**. The buffer lives in memory for as long as the browser tab does; there is no
persistent remote sink connected yet (Stage 2, per Decision 21, not yet reached). "Everything I
decided since I opened the app" is real and buildable now. "Everything ever decided, across every
session, permanently" is still genuinely separate, larger, future work — worth being precise about
which claim any screen built on this actually makes.

---

## 4 — Revised recommendation

**Build the real thing, scoped to Stage 1 — not the narrower per-Workspace workaround the first
version of this document proposed.** With no demo deadline (confirmed directly by the Project
Principal) and the actual capability already sitting one layer down, unused, there's no longer a
good reason to build something smaller and less correct instead:

- Expose `getEntries()` (or an equivalent read method) through the shell contract — a real,
  well-scoped GD, not open-ended infrastructure.
- Build a genuine Activity/Decision History view against it — showing every decision made this
  session, across every module, not just the Reviewer's Workspace's own. This is a **better** answer
  than the Workspace-local list the first version proposed: one canonical source instead of each
  screen inventing its own copy, which avoids exactly the divergent-duplicate problem this project's
  own Constraint #2 already warns against.
- **As a side effect, this also resolves the earlier-flagged Workspace/VIGIL-screen inconsistency**
  more properly than patching that specific gap would have — a real Activity view becomes the place
  to see a decision's status, rather than needing VIGIL's own screen and the Workspace to agree with
  each other in real time.
- **State the session-scope limit plainly** wherever this ships — same honesty convention as every
  other "placeholder" or "Coming Soon" label already in the platform. This is not a substitute for
  real Stage 2 persistence; it's a correct, honest answer to a narrower, real question.

**Stage 2 (a genuine persistent, cross-session audit store) remains real, separate, future work** —
not urgent now that Stage 1 turns out to cover the actual need raised tonight, but not abandoned
either. Worth its own governance conversation when it becomes the active question.

---

## 5 — What this document does NOT decide

- **The exact shape of the exposed read method** — raw `getEntries()`, or a filtered/scoped query
  (e.g., "only this actor's decisions")? Worth deciding deliberately, not defaulting to whichever is
  easiest.
- **Where the new Activity/Decision History view should live** — its own new screen, folded into
  Home, or attached to TRACER as a session-scoped companion to TRACER's own cross-session ambitions?
  Genuinely open.
- **When Stage 2 (persistent, cross-session logging) becomes a real priority** — not decided here,
  and no longer urgent given Stage 1 covers tonight's actual need.

---

## 6 — Propagation

`docs/27` §7 still correctly states the abstract principle. Worth a short cross-reference there
noting that the concrete situation turned out to be better than first assessed — Stage 1 already
provides a real, if session-scoped, answer; Stage 2 remains the genuinely open question. No other
document needs updating until the shell-contract change and the new view are actually scoped as a
real GD.

---

*docs/28 — The Logger's Read Path: Narrower Gap Than First Assessed*
*July 21, 2026 · Pre-Decisional · Internal Working Document · Revised same session*
