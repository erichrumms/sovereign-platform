# SOVEREIGN Platform — Defect Class Register
## docs/40 · Version 1.0 · August 13, 2026 · Governance Agent
**Classification:** Pre-Decisional · Internal Working Document
**Baseline commit:** `d16a613` · Tier 1 checks live in `.githooks/pre-commit`

---

## 1 — Why this document exists

Sessions 107 through 111 produced no platform change. They drained pre-existing
governance-record debt. The Project Principal's assessment: too much time is spent
investigating and fixing issues, sometimes making them worse, and lessons discussed
but not written down produce the same defects in the next session.

This register exists so that a defect class, once identified, becomes either an
enforced check or an explicitly recorded gap. **Never an intention.**

**The governing distinction:** a lesson is advisory. A check is enforced. Rules 11,
12, and 17 were written in Sessions 94-95 and violated repeatedly afterward. The
verify script's four invariant checks, added in Session 111 and made a stated close
requirement, caught four real manifest drifts on their first run.

---

## 2 — Defect classes, with measured frequency

Frequencies from a content scan of 421 markdown files, August 13, 2026. "Docs"
counts documents mentioning the class; it measures how often a class is *discussed*,
which is a proxy for how often it recurs.

| # | Class | Docs | What it looks like | Enforced? |
|---|---|---|---|---|
| DC-1 | **Duplicate / parallel state** | 200 | Two copies of one canonical artifact drifting apart; two lists hardcoded independently | Partial — manifest SHA check (verify v5 §6) |
| DC-2 | **Stale hardcoded value** | 183 | A figure, hash, or version frozen in place while its source moved | **Yes** — Tier 1 check 4 |
| DC-3 | **Scope deferred, then misread** | 166 | Unbuilt authorized scope mistaken for a defect; deferral not recorded where the reader looks | No — Lesson 42 only |
| DC-4 | **Cross-artifact drift** | 91 | Spec and code disagree; contract and shared types disagree; emitted event absent from union | **Yes** — Tier 1 check 2 |
| DC-5 | **Unverified claim** | 93 | A document asserts something never checked against the artifact | Partial — verify v5 §6-9 |
| DC-6 | **Citation error** | 78 | A reference to a document, section, or number that does not resolve | No — Lesson 40 only |
| DC-7 | **Silent failure** | 73 | Something fails or resets with no disclosure to the operator | No |
| DC-8 | **"Not a bug" misdiagnosis** | 70 | Expected behavior investigated as a defect, or a real defect dismissed | No — Lesson 42 only |
| DC-9 | **Test gap / test asserts the wrong thing** | 51 | A passing test that verifies a label rather than a behavior | No — Lesson 41 only |
| DC-10 | **Root cause not searched elsewhere** | 27 | One instance fixed; identical instances left | No — Rule 12 (advisory) |

**Five of ten classes have no enforced check.** That is the honest state and the
work queue.

---

## 3 — Risk tiers

| Tier | Consequence | Examples | Where time actually goes |
|---|---|---|---|
| **T1 — Cosmetic** | A reader notices | "Platform Developer" label under System Admin | Minimal |
| **T2 — Efficiency-draining** | Sessions consumed | Parallel `AGENT_REFERENCE.md` lineage; 27-session manifest hole; three verify checks dead ~60 sessions | **This is the tier that costs the most.** Sessions 107-111 |
| **T3 — Demo-damaging** | A false claim on a live surface | Cost Dashboard excluded-site text; "consult the platform audit log" for a log that does not exist | Small count, high cost |
| **T4 — Trust-destroying** | The record itself is wrong | Session 73 fabricated status report; GD-40 and GD-41 recorded language contradicting the decision | Rare, existential |

**T2 is almost entirely mechanically detectable, and was undetected until Session 111.**

---

## 4 — Enforcement architecture

| Tier | Mechanism | Behavior | Status |
|---|---|---|---|
| 0 | Context gather script | Blocks paste on "N of N, 0 missing" failure | Live |
| **1** | **`.githooks/pre-commit`** | **BLOCKS the commit when drift grows.** Override: `--no-verify` plus a recorded reason in the handoff | **Live as of `d16a613`** |
| 2 | `sovereign_session_verify.sh` v5 | Full output quoted at every close | Live since Session 111 |
| 3 | Periodic (~10 sessions) | Report only — orphan hunt, lineage divergence | Not built |

**Tier 1 fails only when drift *grows* above a recorded baseline.** Pre-existing debt
is counted and visible, never a permanent alarm. An absolute check would have blocked
every commit on day one and been disabled within a week.

---

## 5 — Tier 1 checks — exact commands and pass conditions

Run: `./sovereign_tier1_checks.sh` · Baselines: `.sovereign_check_baseline`

### ACTIVE — measure what their names claim

**T1-2 — `EMITTED_NOT_IN_CONTRACT` — baseline 4**
Event types emitted in TypeScript but absent from the `SovereignEventType` union.
Pass: count ≤ 4. Current members outside the union:
`PPBE_EVALUATION_FINDING`, `TT_AUDIT_DEADLINE`, `TT_BUDGET_EXHAUSTION`,
`TT_ESCALATION_ROUTED`.
Catches: DC-4. Would have caught the `docs/06 §4.4` spec-vs-build name divergence.

**T1-4 — `STALE_CONTRACT_HASH_IN_TOOLING` — baseline 9**
64-character hash literals in repo-root `.sh` files that are not the current
shell-contract hash. Pass: count ≤ 9.
Catches: DC-2. This is the class that left three verify checks dead for ~60 sessions.

### PARKED — the parser does not measure the stated property

**Do not baseline these until the extraction is proven. A number that means nothing
is worse than no check.**

**T1-1 — `EVENTTYPE_NOT_PROPAGATED` — reported 79 of 98, NOT TRUSTED**
Claims 79 contract event types are missing from `sovereign-data/src/shared-types.ts`,
including `AGENT_STEP_COMPLETE` and `AGENT_ACTION_APPROVED` — both of which the
Session 10 handoff records as propagated and verified. Shared-types almost certainly
imports or re-exports rather than restating members, so a literal-string comparison
sees almost nothing.
**The real gap, independently confirmed:** `grep -c "INFERENCE_CALL\|INFERENCE_PROVIDER_FALLBACK\|MODEL_HASH_MISMATCH" sovereign-data/src/shared-types.ts` returns **0**. Three
inference event types added at shell contract v1.6 (GD-8, Session 13) were never
propagated, though the Session 13 done condition required it under Constraint #11.
**To activate:** parse shared-types by resolving imports and re-exports, not by
literal string match. Then baseline at the real number.

**T1-3 — `LOGGER_EVENTS_UNROUTED` — reported 94 of 99, NOT A DEFECT COUNT**
`sovereign_alerts.py` states plainly that not every Logger event warrants an alert.
Six event types dispatch; the rest deliberately do not. 94 is approximately the
correct answer to "how many events do not alert," which is not drift.
**To activate:** add an explicit `INTENTIONALLY_NOT_DISPATCHED` frozenset to
`sovereign_alerts.py`, then check that every logger event type appears in exactly one
of P1, P2, or that set. The delta then means "an event type nobody decided about."
Would have caught `MODEL_HASH_MISMATCH` falling through silently.

---

## 6 — Lessons 40 through 45

Checked against all 28 existing lesson titles in `AGENT_REFERENCE.md`. No duplicates.
Follows the Session 94 precedent, where FINDING A/B/C became Rules 11, 12, and 17.

**Lesson 40: A citation to a section heading is not a citation to its content.**
`docs/06 §8.1` is titled "Decisions Required Before Stage 4 Build" and lists five open
questions. The answers were recorded the day before in Integration Brief v1.17 and
restated in `docs/10 §7`. Two governance documents cited `docs/07 §8.1` — one document
number off — and reported the decisions as unrecorded. A manufactured gap that
consumed three sessions.

**Lesson 41: A passing test can verify the label rather than the behavior.**
`test_inference_logger.test.ts` includes a green test named "emits MODEL_HASH_MISMATCH
at P1." It verifies that the TypeScript emitter writes the string "P1". The Python
dispatcher that decides what actually alerts was never touched by it — and
`MODEL_HASH_MISMATCH` is in neither `P1_EVENT_TYPES` nor `P2_EVENT_TYPES`, so no alert
is raised at all. Three layers agreeing with each other, none checking the assertion.

**Lesson 42: Unbuilt authorized scope is not a defect.**
The missing alert routing looked like a bug. It is a Stage 4 deliverable specified in
`docs/06 §4.4`, in a stage never authorized. "Specified but unbuilt" and "built wrong"
require opposite responses: one is a scope decision, the other is a fix.

**Lesson 43: A new check's first run tests the check, not the codebase.**
Session 111's version-chain check produced five false positives from a multi-line grep.
The Tier 1 checks produced two more on their first run — one an integer-parsing bug,
two measuring their own parsers. Budget one correction pass into every new check, and
never baseline a number before its parser is proven.

**Lesson 44: Specification and implementation diverge in names before they diverge in
behavior.** `docs/06 §4.4` names `INFERENCE_ANOMALY`, `MODEL_DRIFT_DETECTED`,
`INFERENCE_FALLBACK`, `INFERENCE_PERFORMANCE_ANOMALY`. The code emits `INFERENCE_CALL`,
`INFERENCE_PROVIDER_FALLBACK`, `MODEL_HASH_MISMATCH`. Only one matches. Nothing fails
today because the dispatcher extension is unbuilt — it would fail the day it is built.

**Lesson 45: When a claim fails verification, change the claim, not the code.**
Especially before a demonstration. Altering code so a document becomes true is how a
self-correction record becomes worthless. Every check script in this repo states this
in its own output.

---

## 7 — The lessons numbering collision — four locations, recorded not resolved

| Location | Lessons present | Content at shared numbers |
|---|---|---|
| `AGENT_REFERENCE.md` | 1-12, 24-39 | Session-practice lessons |
| `PROJECT_SUMMARY.md` (June 1) | 1-30, full text | **Entirely different lessons** |
| `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md` | 11 references | Not examined this arc |
| Session handoffs | Scattered | Citations to the above |

**Example of the collision:** Lesson 24 is "Boundary conditions in synthetic data" in
`PROJECT_SUMMARY.md` and "A `docs/NN` spec being referenced is not evidence it's in the
repo" in `AGENT_REFERENCE.md`. Both are real. They share a number.

**The Lessons 13-23 gap is closed — and was never what it appeared to be.**
`AGENT_REFERENCE.md` records those numbers as missing content believed to be in older
Integration Brief material, flagged five times. They exist in full in
`PROJECT_SUMMARY.md` Part 7: role separation as a design constraint (13), the data
model *being* the intelligence layer (14), production-grade meaning failure handling
plus observability plus maintainability (15), sandbox constraints as architecture (16),
data constants at module level (17), identity vs. semantic color (18), fix known issues
first (19), the Domain Translator pattern (20), structural replacement over disabled
buttons (21), policy-as-data (22), reasoning chains at point of decision (23).

**Decision required — Project Principal.** Recommended: import 13-23 into
`AGENT_REFERENCE.md` at their existing numbers, since those slots are genuinely empty
there, and record that 1-12 and 24-30 are different lessons sharing numbers across the
two lineages. **Do not renumber either lineage** — that breaks every existing citation.

---

## 8 — Corrections to prior findings, recorded here

**Git attribution is partially identifying, not anonymous.** Commits record
`Erich Rummel <developmentsystem@Erichs-Mac-mini.local>`. The name resolves correctly
from the system; only the email is hostname-derived. Prior documents describing commits
as carrying "the machine hostname" understate this. The Project Principal decision of
August 12, 2026 to leave attribution as is remains correct and is unaffected.

**A second enforced hook already existed and was unknown.** `.githooks/commit-msg`,
580 bytes, dated July 24, 2026 — three weeks before this work. `core.hooksPath` was
already set to `.githooks`. **Session 111's verify script did not know about it, and no
document in this arc mentions it.** An enforced check nobody has read is itself a DC-1
instance. Read it before the next session.

---

## 9 — Open work, in priority order

1. **Activate T1-1** — resolve imports/re-exports in shared-types; baseline at the real
   number. The three inference event types are a confirmed genuine gap.
2. **Activate T1-3** — add `INTENTIONALLY_NOT_DISPATCHED` to `sovereign_alerts.py`.
3. **Read `.githooks/commit-msg`** and record what it enforces.
4. **Decide the lessons import** (§7).
5. **Build Tier 3** — periodic orphan and lineage-divergence scan.
6. **DC-6, DC-7, DC-8, DC-9, DC-10 have no enforced check.** DC-9 is the highest value:
   a test that asserts a label rather than a behavior is invisible to every other check.

---

## 10 — Session 112 findings (D4)

**§9 items 3 and 4 are closed as of this session.**
Item 3 (`core.hooksPath` / commit-msg): read below. Item 4 (lessons import): executed
as D2 — Project Principal decision August 13, 2026.

---

**(a) Attribution is a documented three-layer control, not an absence.**

The three layers, in order of precedence: `.claude/settings.json` sets suppression —
that setting is known not to work (upstream defect, built-in instruction overrides it).
`CLAUDE.md §2` is the primary control — Build Agent reads it at session open.
`.githooks/commit-msg` is the enforced backstop — strips `Co-Authored-By:`, "Generated
with", and session URLs from every commit. Thirteen historical commits carrying trailers
are deliberately preserved (rewriting shared history is ruled out; they are a documented
known gap). **Verified holding this session:** zero attribution trailers and zero model
names across the last 60 commits (`git log --oneline -60 | grep -iE "co-authored|generated with|claude\.ai"` returned nothing).

**Implication:** describing attribution as "not working" or "absent" conflates the broken
settings.json layer with the two layers that do work. The accurate description is:
one suppression mechanism is confirmed non-functional; two others are active and holding.

---

**(b) `core.hooksPath` must be set once per clone — hook enforcement does not survive a fresh clone automatically.**

The `.githooks/` directory is version-controlled. The git configuration setting
`core.hooksPath = .githooks` is not — it is set per-clone, not persisted in any tracked
file. A fresh clone of this repository has hooks disabled until the setting is
established (`git config core.hooksPath .githooks`). Confirmed: `core.hooksPath` is
already set in the current clone (hooks are active). A CI environment or a new
development machine cloning fresh would need this step added explicitly. This is the
Tier 1 enforcement gap with highest likelihood of causing a silent miss in the future.

---

**(c) CLAUDE.md is a sixth enforced-convention location — no session in the 106-111 arc consulted it.**

CLAUDE.md is the primary control for attribution suppression (§2), the naming convention
(§1), the `git push` requirement (§3), governance-document authorship (§4), PLACEMENT_LOG
discipline (§5), and the verify-before-claim rule (§6). It is the document the Build
Agent is explicitly instructed to read before any commit. Sessions 106-111 neither
referenced it in their Handoffs nor cited it as a source for any decision. The Tier 1
pre-commit hook (`.githooks/pre-commit`) and the Session 111 verify script both ran and
were built during that arc — neither was cross-referenced with CLAUDE.md. This is a
DC-1 instance: the canonical convention document and the enforcement layer both exist;
neither knows the other does.

---

**(d) T1-4 was corrected three times in one evening — the middle state must be on the record.**

T1-4 (`STALE_CONTRACT_HASH_IN_TOOLING`) went through three states before settling:

| State | Grep pattern | Count | Problem |
|---|---|---|---|
| **Too broad** (initial) | Any 64-char hex in `*.sh` | 9 | Matched legitimate input-file checksums in gather scripts (Rule 10 discipline) — blocked a valid commit on a false positive |
| **Too narrow** (narrowed) | Only lines containing the word "shell-contract" | 0 | The frozen expectations use `EXPECTED_AGENT_REF_HASH` and similar — none reference "shell-contract" in the same line; check went blind |
| **Correct** (widened) | Lines whose first token is `EXPECTED_*=` or `KNOWN_*=`, or lines containing "Expected hash" | 3 | Finds the three frozen hash assignments by their role (stored expectation) rather than their referent |

The baseline of 3 reflects the correct final state. The middle state (count → 0) went
undetected because the check produced no block and no output — silence looked like
success. Lesson 43 applies: the second correction pass confirmed the parser, not the
codebase.

---

**(e) Lesson 43 gains a second clause.**

Existing clause: *a check's first run tests the check, not the codebase.*

New clause: **a check's first block tests your willingness to keep it.** T1-4's first
block was a false positive (a gather script's legitimate checksum). The correct response
was to fix the check's scope, not the gather script. The response that would have been
easier was to raise the baseline or widen the exclusion until the block went away.
The pressure to quiet a check is strongest the first time it inconveniences you —
exactly the moment when the check is most likely to be correctly identifying a real gap
in the check's own precision, not a real gap in the code. Both "fix the check" and
"raise the baseline" feel similar under pressure; only one is the right call in each case.

The distinction: if the check fired because the codebase drifted, raise nothing — fix
the drift. If the check fired because the check's own parser was wrong, fix the parser
and verify the corrected count before baselining it. Raising a baseline without
verifying the corrected count is how drift hides.

---

**`.githooks/commit-msg` — content recorded (§9 item 3):**

11 lines. Strips three patterns from every commit message: `Co-Authored-By:` lines,
"Generated with" lines (with and without the 🤖 prefix), and `https://claude.ai/code/session_*`
URLs. Dated July 24, 2026 — three weeks before the Tier 1 pre-commit hook was built.
Both hooks run because `core.hooksPath = .githooks` points at the directory containing
both. This is the backstop CLAUDE.md §2 describes.

---

*SOVEREIGN Platform · docs/40 Defect Class Register · v1.0 · August 13, 2026*
*Pre-Decisional · Internal Working Document*
