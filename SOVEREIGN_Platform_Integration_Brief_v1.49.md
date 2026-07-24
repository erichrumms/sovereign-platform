# SOVEREIGN Platform Integration Brief
## Version 1.49 | July 24, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.48
**Changed this version:** Absorbs the entire Session 54–61 arc — eight sessions, one governance
conversation (`docs/29`) resolving the largest open architecture question left from the prior
version, one comprehensive platform-wide assessment (Session 60), and the closure of that
assessment's entire build scope (Session 61). §11, §13, §14, §18, §20, §21 substantially
rewritten; two new Lessons added (26, 27) capturing this arc's real process findings.

---

## §1-§10 — unchanged, see v1.45

---

## §11 — Current Build Status

**HEAD as of this Brief:** `6f2c8ec` (July 24), verified against `origin/main` directly. This
period's real commit chain, main content commits only: `893979f` (Session 54, WG-1/2/3/4/5/12/13)
→ `8e7c610` (Session 55, WG-15/16/17) → `b98926d` (Session 56, real test coverage for Session
55's gaps) → `b68a8ce`/`af4f695` (`docs/29` — the WG-11/WG-7/WG-14 governance decisions) →
`baa27b0` (Session 57 — native PPBE Program Detail view + Module Orientation live status) →
`6c6b340` (Session 58 — GD-28, Activity & Decisions tab) → `4d471e0` (Session 59 — WG-6 demo
padding, decision-note reason codes) → `409d3a4` (Session 60 — end-to-end R/E/S assessment) →
`b6fd8bc` (Session 61 — the session-state-resurrection family + Home-return navigation, all
seven deliverables) → `6f2c8ec` (Session 61 close).

**Walkthrough G's build findings: fully closed.** Every WG-numbered finding from the original
walkthrough is either built (WG-1 through WG-5, WG-7, WG-8, WG-11 through WG-17) or correctly,
deliberately deferred (WG-9, pending a real external data source) or still genuinely open as its
own governance question (WG-6's real, non-cosmetic resolution — Session 59 padded the synthetic
data for demo purposes only, at explicit Project Principal direction, leaving the underlying
question of the variance chart's real period scope untouched).

**The live Walkthrough repeat pass on Home Dashboard remains open — now the single oldest
unclosed item in the entire platform's development history, open since Session 54.** Session
61's own close carries a specific, concrete reason this now matters more than it did: the
sequence "enter a module, decide an item, return Home via the breadcrumb, re-enter the module"
exercises Session 61's D1 (live subscription) and D6 (Home-return) together, and has never been
confirmed in an actual browser — no browser automation exists on this development machine, so
this cannot be closed any other way.

**Shell contract: v1.23**, one real version increment since v1.48's v1.22 — GD-28 (Session 58),
widening `SovereignShellContext["logger"]` with a `getEntries()` read method. Hash
`6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`, both copies verified
identical through Session 61's close. **Still fourteen context exports** — GD-28 widened an
existing export's type; it did not add a fifteenth.

**Test count: 2,106 passed** (1,911 JS/TS across 15 workspaces + 195 Python) **+ 4
deliberately-skipped opt-in live tests**, independently re-verified by direct arithmetic at
Session 61's close — the same discipline every session since 56 has held to, after Session 55's
own test-count table was found not to match the sum of its own rows.

**A genuinely new, named platform pattern emerged this arc: the module-local session store.**
First built for VIGIL's approval queue (Session 54, closing the original WG-13 resurrection bug).
Session 60's comprehensive assessment found the identical bug class — state reset on component
remount, with no session-scoped persistence — in four more places across four different modules.
Session 61 built the pattern's missing piece (real subscribe/notify, not just a passive
mount-time-seeded singleton) and applied it to all four, bringing the total to six instances
sharing one shape. `AGENT_REFERENCE.md` v3.3 now names this pattern explicitly, the same
treatment shell-owned surfaces already had.

**A real, still-open architecture question surfaced by Session 60, not yet resolved:** seven
modules share an identical pattern for reading `VITE_ANTHROPIC_API_KEY` — architecturally correct
for a build-time, client-compiled variable, but a real pre-production gate, since no real key
exists anywhere in the platform yet and Vite compiles any `VITE_`-prefixed variable directly into
the browser bundle. Needs a deliberate decision (server-side proxy vs. runtime injection) before
any real key is ever configured — not urgent for a synthetic-data demo, genuinely urgent before
this platform ever touches real, sensitive information.

---

## §13 — Open Governance Items

**CLOSED this version:**
- `docs/29`'s three decisions (WG-11+WG-8's program-model split, WG-7's live status, WG-14/GD-28's
  Activity View) — all decided AND built, Sessions 57–58.
- The entire `docs/30` §2 build scope (the session-state-resurrection family + Home-return
  navigation) — decided in the Session 60 assessment, built in full in Session 61, in the
  required order the assessment's own D3-9 finding identified.
- A real, recurring accuracy issue in two consecutive sessions' own close documentation: whether
  the Session 55 close artifacts sit tracked at the repo root or untracked elsewhere. Resolved by
  direct verification, twice, at Governance Agent review — they are tracked, at the repo root,
  clean. Treated as genuinely settled now.
- A real, recurring memory-contamination issue (Sessions 44, 49, 58) — traced to its actual root
  cause (a Claude Code memory folder scoped to the home directory rather than to this project) and
  cleaned directly at the source in Session 59, per the Project Principal's explicit decision to
  keep project memory enabled rather than disable the feature.

**NEW / UPDATED this version:**

| Item | Detail | Target |
|---|---|---|
| Live Walkthrough repeat pass | The oldest unclosed item in the platform's history; now carries a specific reason (Session 61's D1+D6 sequence) that raises its priority | Needs the Project Principal in a real browser — nothing else can close this |
| D4-6 — shared Anthropic API key architecture | Real pre-production gate, not urgent today | A real decision before any real key is configured |
| WG-6's real resolution | Session 59's fix was explicitly cosmetic/demo-only, at direct Project Principal request | Still needs a real decision on the variance chart's actual period scope |
| D3-6 — module health dots | Wired to nothing (`pollAll()`/`startHealthPolling()` exist, never called) | Decide: finish wiring, or remove the dead UI |
| D4-5 — ARIA/VIGIL banner overclaim | The banner states enforcement that actually happens elsewhere in the platform | Decide: soften the banner, or extend real enforcement to match it |
| D4-9 — LENS's incomplete source-document set | A content-authoring task, not a code task | Needs someone to write the missing governance-explanation documents |
| D3-8, D3-10 | Two small, genuinely optional fold-ins from the Session 60 assessment, never reached | Low priority; ride along with any session touching adjacent code |
| A seventh module-local session-store instance | Not yet needed | Worth a real governance conversation about a shared helper extraction, the same threshold `docs/SOVEREIGN_Shell_Surface_Reference_20260721.md` already names for shell-owned surfaces |

**UNCHANGED, genuinely carried forward:** `docs/16` WF-12 corrections; WF-2, WF-6, WF-8 (best
decided live); ARIA-EXPORT-GD; F-2/F-3; the `Agent_Identity_Standard.md` PPBE Status-field
lineage discrepancy (still needs a direct `git log -p` check before correcting either way);
`PPBE-RECORD`; `docs/27`'s EG-A, EG-B, EG-D (EG-E was resolved this version — see `docs/22`);
`docs/26`'s larger vision, unaddressed.

---

## §14 — SBOM Status

**A real, open gap, not yet closed as of this version.** SBOM Registry v1.41 covered through
Session 53. Eight real session updates exist since (Sessions 54 through 61), each individually
committed and available, but **not yet merged into a new registry version.** This Brief flags the
gap explicitly rather than asserting a number that hasn't actually been re-derived — matching this
project's own standing discipline about carried-forward figures. **Do not treat v1.41 as current
for anything in the Session 54–61 arc.** Merging this into v1.42 is real, valuable, mechanical
work, not yet done — flagged here so the next session that needs it doesn't assume it exists.

---

## §15-§17 — unchanged from v1.45

---

## §18 — Agent and Prompt Registry

**44 agents, unchanged across all eight sessions this window** — confirmed explicitly, session by
session. Zero new agent identities across the entire Session 54–61 arc; every session's own close
report states this directly.

**20 prompts** = 19 approved + 1 pending, unchanged.

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.47 | July 18 | Walkthrough F original run + Session 38 absorbed; orientation pass |
| v1.48 | July 21 | Fifteen sessions (39-53) absorbed; GD-22 through GD-27 closed; the Reviewer's Workspace built |
| **v1.49** | **July 24** | **Sessions 54–61 absorbed; `docs/29`'s three governance decisions closed AND built; Session 60's comprehensive assessment run and its entire `docs/30` §2 build scope closed in Session 61; shell contract v1.22 → v1.23 (GD-28); a new, named platform pattern (module-local session stores, six instances) recorded in `AGENT_REFERENCE.md`; SBOM merge gap flagged, not yet closed; two new Lessons added** |

---

## §20 — Full Build Roadmap

| Item | Depends on |
|---|---|
| Live Walkthrough repeat pass, Home Dashboard | Nothing — the platform's largest current gap, and its most load-bearing one given Session 61's D1+D6 sequence |
| D4-6 — API key architecture decision | Nothing — real, not urgent, but a genuine pre-production gate |
| WG-6's real resolution | A real decision on variance-chart period scope |
| SBOM Registry merge (v1.41 → v1.42) | Nothing — mechanical, real, not yet done |
| D3-6, D4-5, D4-9, D3-8, D3-10 | Each its own small, independent decision or task |
| SCRIBE visual redesign | Project Principal content decisions |
| `docs/26`'s larger vision | A real, separate scoping conversation once the above settle |
| Demo-ready | The Walkthrough repeat pass running clean, plus whatever the Project Principal decides is genuinely blocking versus acceptable |

---

## §21 — CTO Demo Readiness Track

**Substantially strengthened this period, but the same honest caveat as every prior version
applies in a sharper form now.** The platform's actual architecture — real cross-module data
flow, now backed by a proven, six-times-applied session-store pattern instead of one-off fixes —
is meaningfully more reliable than it was at v1.48's close. Session 60's comprehensive assessment
is real, independently-verified evidence of this, not a self-report: 2,069 tests, zero production
vulnerabilities, all eleven modules' role gates matching the access matrix exactly, before Session
61 then closed the one real systemic finding that assessment turned up.

**What "demo-ready" still genuinely depends on:** the live Walkthrough repeat pass, unreplaced by
any of this arc's work, explicitly and repeatedly stated as such throughout. Every claim in this
Brief about the platform's reliability is independently verified against the real repository —
none of it has been confirmed in an actual running browser since Walkthrough F. That gap is real,
it is the largest one left, and it should not be described as closed until a human has actually
run it.

---

## Key Lessons — Current

Lessons 1-25: see prior Brief versions and `AGENT_REFERENCE.md`.

**Lesson 26 — a session's own "process finding" needs the same verification as its code claims.**
Established this period, twice: Session 60's Handoff and its own report both repeated a claim
about two files' tracked/untracked status that was checked and found wrong; Session 61's Handoff
then made a *different* wrong claim about the same two files. Neither was a code defect — both
were findings *about* the repository's state, written with the same confidence as a verified code
claim, but never actually re-checked against `git status` before being written down. The fix
isn't more scrutiny of code specifically — it's treating every claim a session makes about the
state of the world, not just the state of the code, as needing the same direct verification.

**Lesson 27 — an ordering dependency between two fixes can be real and load-bearing even when
each fix looks complete on its own.** Session 60's assessment found four more instances of a
known bug pattern, and separately found that a completely different, seemingly-unrelated
navigation fix (Home-return) had a latent dependency on the *first* bug pattern being fixed
correctly first — not because the code shared a file or a type, but because one fix's
correctness had been silently relying on a constraint (single-module-mount) the other fix would
remove. Session 61 confirmed this held exactly as predicted. Worth asking, for any two
findings that touch the same subsystem even loosely: does fixing one change an assumption the
other was quietly depending on? — not just "are these two independent items I can schedule in
either order."

---

*SOVEREIGN Platform Integration Brief v1.49 · July 24, 2026*
*Pre-Decisional · Internal Working Document*
