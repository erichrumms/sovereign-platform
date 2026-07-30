# SOVEREIGN Platform Integration Brief
## Version 1.55 | July 30, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.54
**Changed this version:** Session 75 is the largest single session of this entire arc —
the first shell-contract change since versioning began being tracked this carefully, and
all four Tier 2 backlog items closed in one pass (WH-5's Program Health redesign, WH-16,
WH-36, WH-23's full ARC reframe). Two full rounds of supplemental verification were run
given the session's size. One real error was found and corrected (a snapshot-count
double-count, 13 claimed vs. 9 actual) — a genuine methodology mistake, honestly resolved
once specifically challenged, not comparable to Session 73's fabrication. **This version
also flags something new, not a defect:** this session built substantial UI surface that
has never been seen live in a browser. The live re-walk list roughly doubles as a result.
See §21.

---

## §1-§10 — unchanged, see v1.45

---

## §11 — Current Build Status

**HEAD as of this Brief:** `e5d66ab`. Full Session 75 commit chain: `672b234` (D1/WH-5,
shell-contract + POC data + APEX metrics) → `458a028` (D2/WH-16) → `316d66f` (D3/WH-36)
→ `a588eac` (D4/WH-23) → `e5d66ab` (Handoff/SBOM).

**Shell contract: v1.23 → v1.24, a real, deliberate, GD-approved change.** GD-30,
recorded at repo root following the GD-20 precedent format, adds an optional
`point_of_contact: { name, role }` field to `ProgramStatusSnapshot`. New hash
`487054e2b66473ccbbd87e333db70910127549570ce449210a29afd444b4152f`, both copies
independently re-verified identical across two full verification rounds, not just at
close. Constraint #11 (shared-type sync) confirmed correctly observed — the change is a
pure optional-field widening, and all 14 packages were confirmed to compile and pass
against the new contract, not just the 5 packages directly touched.

**Test count: unchanged in total from Session 74 — 1,791 JS/TS + 149 e2e passing (4
skipped) + 195 Python = 2,135 passing, now independently re-confirmed across all 14
packages,** not the 5 touched directly. Session 75 added no new test cases (D1c and D3
updated existing snapshots; D4 modified a test helper without adding cases), so the
total genuinely holding steady at 2,135 while covering real new functionality is itself
a meaningful confirmation, not a red flag.

**A real error was found and corrected this session, worth recording precisely.** The
original Handoff claimed 13 snapshots were updated. Directly challenged (PlatformHome
has only 9 total snapshots, making 13 arithmetically impossible if the stated "affects
PlatformHome only" claim was true), the real number was traced with actual `git show`
evidence: 9 distinct snapshots, with 4 counted twice across two separate `jest -u` runs
(one after the D1c commit, one after D3). The corrected reconciliation — 9 updated + 6
untouched (1 DevPersonaToggle + 5 ModuleNav) = 15 total — checks out cleanly. This is a
genuine methodology mistake in how a self-report was tallied, not an invented claim; it
is recorded here with the same precision this project applies to defects, because a
Handoff's own arithmetic needs to be checked, not just its plausibility.

**Zero new production dependencies — streak now confirmed through Session 75,** the
biggest session yet to preserve it. `recharts` (WH-38) and the new POC/metrics wiring
(WH-5) both reused existing dependencies; ARC's reframe (WH-23) added no new imports
beyond existing packages.

---

## §12 — unchanged, see v1.50

---

## §13 — Open Governance Items

**CLOSED this version — all four Tier 2 backlog items:**
- **WH-5 + Program Health redesign** — Home Dashboard now shows three real APEX
  metrics previously computed and unused: Dependency Health Index (75%, traced to
  source: 6 of 8 registered dependencies healthy), Learning Velocity (68%, matching
  Session 71's corrected 15/22 figure), and per-tile budget-to-actual variance — the
  variance calculation independently confirmed to reuse the WH-34 dedup fix
  (`uniqueByProgramId()`), not a new, separately-derived path. Point-of-contact data
  (name/role) added for all five FY2026 SYNTH-PRG programs, synthetic and clearly
  fictional per WH-13's precedent. POC rendering independently confirmed safe at all
  three consumption sites for records without the field (guarded, not assumed).
- **WH-16** — NEXUS's time-record card now shows SCRIBE's correspondence status,
  read-only, one direction, no cross-module write path — exactly as scoped.
- **WH-36** — Home Dashboard's To Do/Review section now uses one consistent visual
  treatment across all modules.
- **WH-23** — ARC reframed from hypothetical free-text entry to a real program
  selector with a per-program context panel (POC, CLEAR certification status,
  dependency-model coverage) and an auto-populated, reviewer-editable description.

**NEW this version, not defects — real notes for the record:**
- **ARC's exhibit-data gap is pre-existing, now more visible.** Only ALPHA and ECHO
  have seeded budget exhibits (since Sessions 32-33); BRAVO, CHARLIE, and DELTA show
  "No seeded exhibit — CLEAR status not available." This session's new UI is the first
  surface to display this per-program, surfacing a gap that already existed rather than
  introducing one. Worth adding to the backlog as a content-completion item, and worth
  knowing before a live demo picks a program to walk through ARC with.
- **ARC's COUNSEL/NEXUS routing buttons are real, not dead — but don't do what their
  label implies.** They render as fully live, clickable buttons (no disabled state) and
  do something when clicked — reveal explanatory text ("Routing is a manual step in
  this build..."). They do not cross-module route. Not a defect — a deliberate,
  disclosed limitation — but worth being ready to explain if a live demo click reveals
  it instead of navigation.
- **GD-30's approval-channel documentation gap.** Neither GD-30 nor its GD-20
  precedent records *how* Project Principal approval was actually conveyed (direct
  interview, session-opening prompt, etc.) — both correctly attribute the decision to
  the Project Principal, but the record format itself doesn't distinguish that from a
  hypothetical case where Build Agent had merely asserted approval. A real, small gap
  in the GD record format, not something Build Agent can fix unilaterally — needs a
  Governance Agent amendment to the format itself if this is worth closing.
- **GD-29 clarified: never existed as a real governance decision.** Confirmed via
  direct source check — the Session 57 Handoff's "GD-29" reference was a citation
  error for `docs/29`, corrected in that session's own Verification Addendum. The real
  sequence is GD-28 → GD-30, contiguous and accounted for.

**UNCHANGED, still open:** D3-6 (deferred, joining F2/D4-6), D4-5, D4-9, F2, D4-6, site
breakdown's fuller funds-lifecycle columns, LENS description depth.

---

## §14 — SBOM Status

**Gap now covers Sessions 54 through 75.**

---

## §21 — CTO Demo Readiness Track

**Still not restated — and the live re-walk list has grown substantially, not just by
one item.** Everything closed in Sessions 71-74 had prior UI to compare against or a
narrow, specific thing to check. Session 75 is different: it built genuinely new screen
surface — the Program Health metric boxes, the unified To Do/Review layout, and the
entire ARC flow — none of which has been seen live in a browser at all. **The live
re-walk list is now:**

1. NEXUS's Travel & Time Queue vs. the Reviewer's Workspace NEXUS Travel panel counts
2. Home Dashboard's ALPHA/DELTA obligation percentages
3. Home Dashboard under READ_ONLY — honest empty state, not a lockout
4. Execution Monitoring's BY/BY+1 tabs — planning notice renders, not execution metrics
5. **New:** Home Dashboard's Program Health tiles — Dependency Health Index and Learning
   Velocity metric boxes, per-tile variance, POC name/role all rendering correctly and
   legibly
6. **New:** NEXUS's time-record card showing the SCRIBE correspondence badge correctly
7. **New:** To Do/Review's uniform layout, confirmed consistent across roles
8. **New:** ARC's full new flow — program selection, context panel accuracy (including
   the honest "no exhibit" state for BRAVO/CHARLIE/DELTA), auto-populated description,
   and the routing buttons' actual click behavior

This is no longer a five-minute check. This is close to a real walkthrough in its own
right, given how much new surface Session 75 built. Worth treating as its own dedicated
pass rather than folding quietly into the prior four-item list.

---

## Key Lessons — Current

Lessons 1-35: see v1.51-v1.54.

**Lesson 36 — arithmetic that reconciles is not the same claim as an answer being
correct, and only a specific, falsifiable challenge reliably tells the difference.**
Round 1's snapshot answer stated "13+2=15 accounts cleanly" while admitting it couldn't
determine which snapshots were double-counted — technically true arithmetic, wrapped
around a false premise. It took a specific counter-fact (PlatformHome has only 9
snapshots, making 13 impossible under the stated "PlatformHome only" claim) to surface
the real number. A general "is this right?" would likely have gotten the same confident
restatement. Worth carrying forward as a habit: when a number is checkable against an
independent ceiling or a structural constraint, check it that way, not just by asking
whether it seems consistent with itself.

---

*SOVEREIGN Platform Integration Brief v1.55 · July 30, 2026*
*Pre-Decisional · Internal Working Document*
