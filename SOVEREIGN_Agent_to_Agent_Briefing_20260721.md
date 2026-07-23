# SOVEREIGN Platform — Agent-to-Agent Briefing
## Updated July 21, 2026 — GD-22 through GD-27 closed; Reviewer's Workspace v1 built; documentation-currency pass underway

---

## Who You Are Talking To

The Project Principal is the sole human decision-maker. Non-technical
background, highly engaged, catches process gaps fast — has independently
spotted a Build Agent authoring a governance document it shouldn't have
(Session 52), and nearly caught a stale, obsolete file before it got treated
as a legitimate close-protocol checklist. Big picture first, components
second. The Build Agent runs autonomously and may be unattended for
extended periods.

**Naming convention, unchanged, strictly enforced:** the two AI roles are
referred to only as "Governance Agent" and "Build Agent" throughout — no
model or product names anywhere in this or any governing document.

**Two operational facts worth knowing before anything else:**
1. **The repo is public and cloneable:** `github.com/erichrumms/
   sovereign-platform`. Any agent with code execution should clone it
   directly for anything committed, rather than waiting on pasted content.
2. **A `docs/NN` spec being named in an opening prompt is not evidence it's
   actually in the repo.** This has caused two real Hard Stops — `docs/20`
   at Session 44, `docs/25` at Session 53. Verify with `ls` before any
   session that depends on one.

---

## What's New Since the Last Briefing (July 18 → July 21)

**A great deal of build work happened in this window — GD-22 through GD-27,
six governance decisions, roughly fifteen sessions.** In order:

**Walkthrough F repeat pass (Sessions 39-43):** twelve new findings
(WF-13-24), all fixed and re-verified live. Most significant: **GD-22**
(Session 41) — `minimumRole` widened from a single role to a role list,
closing a gap where every non-admin role, including SCRIBE's own documented
user, could not reach any module at all. ARIA got the platform's first
per-tab role gate as a direct consequence — the template every later
role-gated feature in this window reused.

**The Home Dashboard arc (Sessions 44-49):** **GD-23** built
`ProgramStatusSurface`, the platform's first cross-module data surface,
resolving an architecture question open since Session 40's own Hard Stop.
APEX's Execution Monitoring was converted from prose to real charts. The
Home Dashboard shipped in two phases — Program Health/Flagged Programs
(Session 47), then real cross-module queue tiles via **GD-24**
(`WorkQueueSurface`, Session 49). A real test-fixture drift bug was found
and fixed along the way (Session 48) — a hand-copied role list had gone
stale, giving false-passing tests for three roles.

**The Reviewer's Workspace (Sessions 50-53):** the most significant single
piece of work in this window. **GD-25** built a genuinely new kind of
platform capability — real, working VIGIL, ARIA, and SCRIBE decision
components embedded directly in one consolidated module, not summaries, not
links out. Grounded in a real design-philosophy document
(`docs/22_Informed_Decision_Making.md`) developed in direct conversation
with the Project Principal about what "informed decision-making in an
AI-enabled organization" actually requires. **GD-26** gave the Workspace a
real product identity. **GD-27** built the cross-module navigation
primitive, completing all three "doors" `docs/22` names — and found a real
pre-existing bug as a side effect (module switching had never actually
unmounted the prior module).

**Two real process lessons from this window, now standing rules:**
1. Build Agent does not author or restructure any `docs/NN` spec file or
   `AGENT_REFERENCE.md` — Session 52 saw `docs/24` quietly rewritten
   post-build with accurate content but a real boundary crossed.
2. Verify a spec's actual presence in the repo before a session that
   depends on it — Sessions 44 and 53 both hit the same placement gap.

---

## Current State (verify fresh — do not carry this forward blindly)

**HEAD:** `d9887f8` — verify via `git log -1`.

**Shell contract: v1.22.** SHA-256
`28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443`, both
copies confirmed identical. **Fourteen** `SovereignShellContext` exports —
not frozen at any fixed number; grows under governance decision as the
platform does.

**Six shell-owned cross-module primitives now exist** — `TaskSurface`,
`AriaCertificationSurface`, `ProgramStatusSurface`, `WorkQueueSurface`,
`ReviewerWorkspaceSurface`, and `navigateToModule`. Cataloged in one place
for the first time in `SOVEREIGN_Shell_Surface_Reference_20260721.md` — read
this before proposing a seventh.

**Agent registry: 44, unchanged across this entire window.** No new agent
identity was created by any of GD-22 through GD-27 — `module-workspace`
registers zero agents by design; it embeds other modules' existing
components rather than owning new ones.

**Prompt registry: 20 = 19 approved + 1 pending.** Unchanged this window.

**Eleven top-level modules now exist** (was ten) — the Reviewer's Workspace
is the newest, joining the original six primary products and four companion
modules.

---

## The Four Things That Most Commonly Break Sessions (updated)

1. **A `docs/NN` spec referenced but not actually placed.** Verify with
   `ls`, every time, before a session opens against one.
2. **A hand-copied value drifting from its real source.** Happened once
   already this window (Session 48's role-list fixture) — the fix pattern
   is always the same: derive from the live source, don't hand-copy.
3. **Build Agent editing a governance document it shouldn't.** Even
   accurate content, if it's a `docs/NN` spec or `AGENT_REFERENCE.md`, is
   out of scope — reconciliations belong in the Handoff.
4. **A chat recap treated as evidence of a real close.** The Close Protocol
   — real `git push` output shown — remains non-negotiable, unchanged since
   Session 31.

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated July 21, 2026*
*Pre-Decisional · Internal Working Document*
