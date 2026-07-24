# SOVEREIGN Platform — Agent-to-Agent Briefing
## Updated July 24, 2026 — the Session 54–61 arc closed; documentation-currency pass complete

---

## Who You Are Talking To

The Project Principal is the sole human decision-maker. Non-technical
background, highly engaged, catches process gaps fast — has independently
spotted a Build Agent authoring a governance document it shouldn't have, and
specifically declined a proposed fix (disabling Claude Code's memory feature)
in favor of one that addressed the actual root cause instead. Big picture
first, components second. Explicitly stated priorities worth keeping in view:
cross-module data reliability (the platform's real architecture is its real
risk surface), a smooth CTO demonstration, efficient operation, and security
solid enough for real companies, departments, and organizations to eventually
rely on — the demo is named explicitly as the *beginning* of that larger goal,
not the end of it. The Build Agent runs autonomously and may be unattended for
extended periods.

**Naming convention, unchanged, strictly enforced:** the two AI roles are
referred to only as "Governance Agent" and "Build Agent" throughout — no
model or product names anywhere in this or any governing document. **Tested
twice this window and both times corrected** — a commit trailer, then a
Handoff's own "Agent:" line naming a model directly. Worth extra vigilance
right after any model or tool configuration change mid-session.

**Two operational facts worth knowing before anything else:**
1. **The repo is public and cloneable:** `github.com/erichrumms/
   sovereign-platform`. Any agent with code execution should clone it
   directly for anything committed, rather than waiting on pasted content.
2. **A `docs/NN` spec being named in an opening prompt is not evidence it's
   actually in the repo, and a session's own claim about the repository's
   *state* needs the same verification as a claim about its code.** The
   first has caused two real Hard Stops (`docs/20` at Session 44, `docs/25`
   at Session 53). The second is a newer, equally real lesson: two
   consecutive sessions (60, 61) each made an inaccurate claim about
   whether two specific files were tracked and where — neither ever
   actually ran `git status` before writing it down. Verify both kinds of
   claim with the same rigor.

---

## What's New Since the Last Briefing (July 21 → July 24)

**Eight more sessions closed, one governance conversation, and one genuinely
new class of platform capability.** In order:

**`docs/29` — the largest open architecture question from the prior window,
resolved.** APEX's original "World Model" programs and PPBE's synthetic
programs turned out not to be the same real-world entities under two ID
schemes — real evidence was checked (three of four World Model programs have
a thematically similar but never-identical PPBE counterpart, consistent with
two independently-written synthetic examples, not a deliberate shared
identity) before deciding not to force-merge them. Decided instead: PPBE
gets its own native Program Detail view, and "one program, one record"
becomes a real requirement only once actual external data arrives. Module
Orientation's fate was also decided here (live status via `WorkQueueSurface`,
not retirement), and GD-28's shape (Logger read exposure, session-scoped,
scoped-by-actor with an admin toggle).

**Sessions 54–56 closed Walkthrough G's build findings**, including a real
process lesson: Session 55 shipped genuine fixes with zero test coverage and
a test-count table that didn't match the sum of its own rows. Session 56
closed both gaps directly, and every session since has treated a fully-summed,
arithmetic-verified test table as non-negotiable — this is now the single
most consistently-applied verification habit across the whole arc.

**Session 57 built `docs/29`'s decision:** the native PPBE Program Detail
view (closing WG-11, and delivering WG-8's per-program selector as the same
feature — three of the four data pieces it needed already existed and were
reused, not rebuilt) and Module Orientation's live status.

**Session 58 executed GD-28:** the Logger's `getEntries()` method — real,
working, and completely unused since it was written — finally exposed
through the shell contract (v1.22 → v1.23), and a real Activity & Decisions
tab built in the Reviewer's Workspace. One naming-convention slip in the
Handoff, caught and corrected via direct follow-on.

**Session 59** padded the synthetic PPBE fiscal-period data to a full
FY2026 (explicitly cosmetic, at direct Project Principal instruction — the
real period-scope question stays open), added decision-note reason-code
quick-insert chips to VIGIL and ARIA, and cleaned a real, recurring
memory-contamination issue at its actual root cause (a Claude Code memory
folder scoped to the home directory rather than to this project, bleeding
an unrelated project's content into session close artifacts across three
separate sessions) — without disabling the underlying feature, per direct
Project Principal decision.

**Session 60 ran the platform's first comprehensive, code-level
reliability/efficiency/security assessment** — all eleven modules, Home,
and the Workspace. Explicitly and repeatedly stated as *not* a Walkthrough
substitute, since no browser automation exists on this development machine.
Found the platform's infrastructure genuinely healthy (2,069 tests, zero
production vulnerabilities, all role gates matching the access matrix
exactly) and one real systemic finding: the session-state-resurrection bug
class already fixed twice (VIGIL approvals, SCRIBE) existed unfixed in four
more places — plus a latent, previously-invisible ordering dependency
between that bug family and any future Home-return navigation feature.

**Session 61 — the largest single session in the platform's history — closed
all of it, in the order the dependency required.** The root fix first (real
subscribe/notify added to `vigil-approval-session.ts`, converting VIGIL's
approval consumption from mount-time seeding to a live subscription —
confirmed the file had zero subscription mechanism before this session),
then the four sibling applications (VIGIL alerts, ARIA's CPMI-VRS Gates 3/4
— including a genuine synchronous duplicate-attestation guard, independently
verified twice given how safety-critical it is — NEXUS Travel & Time,
FLOWPATH approvals), then, only once safe, real Home-return navigation and a
stale-sidebar-highlight fix. Every deliverable independently re-verified
against the actual code, not taken from the Handoff's own claims.

**A full documentation-currency pass ran the same day this Briefing was
updated** — the System Prompt, this Briefing, the Integration Brief, the New
Conversation Handoff, `AGENT_REFERENCE.md`, `docs/18`, `docs/22`, `docs/28`,
`docs/29`, `docs/30`, the Strategic Plan, and the Role Access Matrix were all
rewritten or updated to reflect the full Session 54–61 arc, not carried
forward stale.

**Two real process lessons from this window, now standing:**
1. A session's own claim about the repository's *state* — not just its
   code — needs the same direct verification as a technical claim. Two
   consecutive sessions got the same small question wrong two different
   ways, neither having actually checked `git status` first.
2. A genuine architectural ordering dependency can exist between two
   findings that share no code and no obvious connection. Confirmed real
   this window, not just a theoretical risk — Session 61's own close
   states plainly that fixing the navigation gap before the resurrection
   family would have silently reopened bugs already closed twice.

---

## Current State (verify fresh — do not carry this forward blindly)

**HEAD:** `6f2c8ec` — verify via `git log -1`.

**Shell contract: v1.23.** SHA-256
`6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`, both
copies confirmed identical through Session 61's close. **Fourteen**
`SovereignShellContext` exports — GD-28 widened an existing export's type
(the logger's `getEntries`); it did not add a fifteenth.

**Six shell-owned cross-module primitives, unchanged this window** —
`TaskSurface`, `AriaCertificationSurface`, `ProgramStatusSurface`,
`WorkQueueSurface`, `ReviewerWorkspaceSurface`, `navigateToModule`. Catalogued
in `SOVEREIGN_Shell_Surface_Reference_20260721.md`, still accurate.

**A genuinely new, named platform pattern this window: the module-local
session store.** Six instances now share one shape (module-scope `Set`
singleton + subscribe/notify + a check-then-emit mutation function, never
emit-then-record): `vigil-approval-session.ts`, `vigil-alert-session.ts`,
`aria-vrs-session.ts`, `tt-session.ts`, `flowpath-approval-session.ts`,
`scribe-sent-session.ts`. Named explicitly in `AGENT_REFERENCE.md` v3.3. A
seventh instance is worth a real governance conversation about a shared
helper, the same threshold the shell-surface reference already names for
shell-owned surfaces.

**Agent registry: 44, unchanged across the entire Session 54–61 arc.** No
new agent identity was created by any session in this window.

**Prompt registry: 20 = 19 approved + 1 pending.** Unchanged this window.

**The Reviewer's Workspace now has four sections, not three** — VIGIL
Approvals, ARIA Certifications, SCRIBE T&T Reviews, and (new, GD-28,
Session 58) Activity & Decisions, showing a reviewer's own session-scoped
decision history with an admin toggle for everyone's.

---

## The Things That Most Commonly Break Sessions (updated)

1. **A `docs/NN` spec referenced but not actually placed.** Verify with
   `ls`, every time, before a session opens against one.
2. **A session's own claim about repository state, taken at face value.**
   New this window, confirmed real twice — a Handoff's "Findings" section
   deserves the same `git status`/direct check as a code claim, not a
   pass just because it reads confidently.
3. **A hand-copied value drifting from its real source.** The fix pattern
   is always the same: derive from the live source, don't hand-copy.
4. **Build Agent editing a governance document it shouldn't.** Even
   accurate content, if it's a `docs/NN` spec or `AGENT_REFERENCE.md`, is
   out of scope — reconciliations belong in the Handoff.
5. **A chat recap treated as evidence of a real close.** The Close Protocol
   — real `git push` output shown — remains non-negotiable.
6. **An ordering dependency between two findings that look unrelated.** New
   this window — before scheduling two fixes touching the same subsystem
   independently, ask whether one's correctness quietly depends on an
   assumption the other would remove.
7. **A model name leaking into a permanent record.** Happened twice this
   window (a commit trailer, a Handoff's own header). Worth extra
   vigilance specifically right after any model or tool config changes.

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated July 24, 2026*
*Pre-Decisional · Internal Working Document*
