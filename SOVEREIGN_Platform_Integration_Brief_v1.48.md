# SOVEREIGN Platform Integration Brief
## Version 1.48 | July 21, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.47
**Changed this version:** Absorbs everything between v1.47 (July 18) and now —
fifteen sessions (39-53), six governance decisions (GD-22 through GD-27), and
the platform's first genuinely new kind of module (the Reviewer's Workspace).
§11, §13, §14, §18, §20, §21 substantially rewritten; two new Lessons added
(24, 25).

---

## §1-§10 — unchanged, see v1.45

---

## §11 — Current Build Status

**HEAD as of this Brief:** `d9887f8` (July 21), verified against
`origin/main` directly. This period's real commit chain, main content
commits only: `876618e`…`ca9f807` (Sessions 39-43, Walkthrough F repeat
pass + GD-22) → `3f0db9d` (GD-23) → `4d07064` (Session 45) → `7044d84`
(Session 46) → `5d63733` (Session 47) → `adcc438` (Session 48) →
`83e63e9` (GD-24) → `6a23121` (GD-25 — the Reviewer's Workspace) →
(Session 51 fixes) → `270d537` (GD-26) → `a9b22ab`/`ab3a8b2` (GD-27) →
`d9887f8` (`docs/25` placement, closing the same gap `docs/20` hit at
Session 44).

**Walkthrough F: repeat pass complete and closed.** Twenty-four total
findings (WF-1 through WF-24) across the original run and the repeat pass,
all fixed and verified. **A new walkthrough is needed and has not been
written or run** — nothing built since Walkthrough F (the entire GD-22
through GD-27 arc, the Home Dashboard, the Reviewer's Workspace) has been
walked through live by a human. This is the platform's largest current
verification gap.

**Shell contract: v1.22**, six real version increments since v1.47's v1.16
— see §14 (folded into this version's SBOM section, since the shell-contract
history and the SBOM's component history are now the same story). Hash
`28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443`, both
copies verified identical.

**Test count:** carried forward with real caution, not asserted as
re-verified. The SBOM Registry v1.41 merge (§14) found that test-count
reporting discipline weakened across this window — Sessions 39-42 gave full
explicit tables; Session 44 onward increasingly reported deltas only.
**Re-run the full suite live before treating any specific number as
authoritative for a demo.**

**Six shell-owned cross-module surfaces now exist**, not one. Cataloged for
the first time in a dedicated reference document
(`SOVEREIGN_Shell_Surface_Reference_20260721.md`) — this Brief no longer
needs to enumerate them individually; that document is now the source of
truth for "what cross-module primitives exist and why."

**A genuinely new kind of module exists: the Reviewer's Workspace
(`module-workspace`, GD-25).** Every module before it shared *data* across
boundaries. This one composes real, working *UI* — VIGIL's, ARIA's, and
SCRIBE's actual decision components, embedded directly. This is a real
architectural departure worth naming plainly, not just another module in
the count.

---

## §13 — Open Governance Items

**CLOSED this version:**
- GD-22 through GD-27 — all six approved, built, and independently
  re-verified against the real repo at close, not taken from any recap.
- The cross-module data-access architecture question (Session 40's own Hard
  Stop) — resolved by `ProgramStatusSurface`, GD-23.
- The SCRIBE prompt deferral placement (open since before v1.47) — placed.
- `docs/22`, `docs/24`, `docs/25` placement — all confirmed placed as of
  this version, though `docs/25` specifically required a second pass after
  a real gap (see Lesson 25, below).
- Round-2 governance documents (`Agent_Identity_Standard.md`,
  `AGENT_REFERENCE.md`) — placed.

**NEW / UPDATED this version:**

| Item | Detail | Target |
|---|---|---|
| A new Walkthrough script | Nothing since Walkthrough F has real human eyes on it | Write, then run live — the platform's largest current gap |
| The `HUMAN_DECISION` "context depth" field | A real, concrete proposal from `docs/22` §6 — would let a decision record whether it was made from curated context alone or after going deeper | Not yet a governance decision either way |
| SCRIBE visual redesign | Still blocked on real content decisions (policy excerpt sourcing, draft-variant scope) — proposed defaults given, not confirmed | Project Principal decision |
| APEX real site-tracking schema | Session 46's placeholder is honest and disclosed but still a placeholder | Needs its own data-dictionary governance decision |
| A documentation-currency pass | Several core governance documents had gone stale by weeks to a month — this Brief is part of that pass | In progress |

**UNCHANGED, genuinely carried forward:** `docs/16` WF-12 corrections; WF-2,
WF-6, WF-8 (best decided live); ARIA-EXPORT-GD; F-2/F-3; the
`Agent_Identity_Standard.md` PPBE Status-field lineage discrepancy (still
needs a direct `git log -p` check before correcting either way); `PPBE-RECORD`.

---

## §14 — SBOM Status

**A real gap closed this version.** Sessions 39-43 had been sitting in the
repo, fully documented in their own SBOM update files, for over a month
without ever being merged into a registry version — v1.40 covered only
through Session 38+PromptFix. **SBOM Registry v1.41** closes this properly,
merging all fifteen session updates (39 through 53) on top of v1.40's real
content. iCloud archival only, per Lesson 13 — never committed to git.

**A documentation-discipline finding worth carrying forward, not just this
version:** test-count reporting in session SBOM updates got less rigorous
partway through this window — full explicit tables through Session 42,
increasingly delta-only after. v1.41's own §3 flags every inferred figure
individually rather than presenting a falsely-precise total. Worth
reinforcing as standing practice: full tables, every session, not deltas.

---

## §15-§17 — unchanged from v1.45

---

## §18 — Agent and Prompt Registry

**44 agents, unchanged across all fifteen sessions this window** — confirmed
explicitly, session by session, and independently by the SBOM v1.41 merge.
`module-workspace` (GD-25) registers zero new agents by design.

**20 prompts** = 19 approved + 1 pending (PR-SCRIBE-004), unchanged. The
SCRIBE synthesis/framing deferral (Option A, decided in the period covered
by v1.47) is now confirmed placed in `Agent_Identity_Standard.md` — no
longer an open placement item.

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.46 | July 14 | PPBE live smoke CLOSED; model identifier standardized; terminology scrub |
| v1.47 | July 18 | Walkthrough F original run + Session 38 absorbed; orientation pass; SBOM lineage completed to v1.40 |
| **v1.48** | **July 21** | **Fifteen sessions (39-53) absorbed; GD-22 through GD-27 closed; Walkthrough F repeat pass complete; the Reviewer's Workspace built — the platform's first UI-composing (not just data-sharing) cross-module capability; SBOM Registry rebuilt as v1.41, closing a five-session gap that had sat unmerged for over a month; two new Lessons added** |

---

## §20 — Full Build Roadmap

| Item | Depends on |
|---|---|
| Write and run a new Walkthrough script | Nothing — the platform's largest current gap |
| Decide the `HUMAN_DECISION` context-depth field | Nothing — small, independent, real value |
| SCRIBE visual redesign | Project Principal content decisions |
| APEX real site-tracking schema | A real data-dictionary governance decision |
| Full rehearsal | Documentation-currency pass complete; new Walkthrough run clean |
| Demo-ready | Rehearsal clean |

---

## §21 — CTO Demo Readiness Track

Critical path changed since v1.47: the Reviewer's Workspace is now real, not
a design conversation — this is a genuinely stronger demo story than v1.47
had access to, since it directly answers "how does this platform actually
help someone decide, not just see, faster." **What's missing is the same
kind of thing that was missing at v1.47's close: live human verification.**
Every headline architectural claim in this Brief is independently
re-verified against the real repo. None of it has been walked through live
since Walkthrough F. "Demo-ready" remains an honest description only after
a real walkthrough — the new one this version calls for — says so.

---

## Key Lessons — Current

Lessons 13-23: see prior Brief versions.

**Lesson 24 — a `docs/NN` spec referenced by an opening prompt is not
evidence it's in the repo.** Established this period, after it happened
twice: `docs/20` at Session 44, `docs/25` at Session 53. Both times, Build
Agent correctly Hard-Stopped rather than guess — but both times, the
underlying gap (a file downloaded but never actually placed before the
gather script ran) had already cost real session time. The fix isn't a
better Hard Stop — the Hard Stops worked exactly as designed. The fix is
verifying placement with `ls` *before* a session opens against a spec, not
discovering the gap after.

**Lesson 25 — Build Agent editing a governance document is a boundary
violation even when the content is accurate.** Session 52 saw `docs/24`
quietly restructured post-build, with genuinely correct content, by Build
Agent's own initiative. The content being right doesn't resolve the
process concern — governance documents are Governance Agent's and the
Project Principal's to author, and a well-intentioned "let me finalize this
to reflect what actually happened" instinct is still an editorial call on
governance content happening as a side effect of a build session. Every
opening prompt since has stated this explicitly, the same way
`AGENT_REFERENCE.md` was already off-limits.

---

*SOVEREIGN Platform Integration Brief v1.48 · July 21, 2026*
*Pre-Decisional · Internal Working Document*
