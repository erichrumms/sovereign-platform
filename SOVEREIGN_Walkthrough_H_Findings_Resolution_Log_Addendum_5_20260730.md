# SOVEREIGN Platform — Findings & Resolution Log — Addendum 5
## July 30, 2026 · Governance Agent
## Companion to the July 26 Log, Addenda 1-4, and SOVEREIGN_Remaining_Build_Backlog_20260729.md

---

## Fixed and verified — Session 75

| ID | Finding | Fixed in | Verified how |
|---|---|---|---|
| WH-5 | Home Dashboard Program Health redesign | `672b234` | Shell-contract v1.23→v1.24 (GD-30), both copies re-verified identical across two full verification rounds. Three APEX metrics wired — Dependency Health Index traced to its real source (6 of 8 healthy dependencies, `Math.round(6/8×100)=75`), Learning Velocity confirmed matching Session 71's 15/22 figure, per-tile variance independently confirmed to reuse the WH-34 dedup fix rather than a new, separately-derived path (the specific concern raised given WH-34's own history). POC data added for all five FY2026 programs, synthetic per WH-13's precedent, rendering confirmed guarded (not assumed-safe) at all three consumption sites for records lacking the field |
| WH-16 | SCRIBE correspondence status not visible in NEXUS | `458a028` | Read-only badge added to NEXUS's time-record card, one direction, no write path |
| WH-36 | To Do/Review mixed two visual treatments | `316d66f` | Unified to one consistent layout across all modules |
| WH-23 | ARC's hypothetical framing vs. real program data | `a588eac` | Reframed to a real program selector with per-program context (POC, CLEAR status, dependency coverage) and auto-populated description. Exhibit-data gap (BRAVO/CHARLIE/DELTA) confirmed pre-existing since Sessions 32-33, not introduced this session. Routing buttons confirmed functional-but-non-navigating — real, disclosed limitation, not a defect |

---

## A real methodology error, found and corrected — recorded precisely

**The original Handoff's snapshot count was wrong: 13 claimed, 9 actual.** This is
recorded with the same precision this Log applies to platform defects, because the
process that caught it is worth understanding, not just the correction itself.

Round 1 of supplemental verification asked directly whether the snapshot count
reconciled. The answer given was "13+2=15 accounts cleanly" — arithmetically true, but
built on an unresolved admission that it wasn't clear which 4 snapshots were
double-counted. Round 2 posed a sharper, falsifiable challenge: PlatformHome has only 9
total snapshots, and both changed commits were stated to affect PlatformHome only —
meaning 13 was arithmetically impossible under the Handoff's own claims. That specific
contradiction, not a general re-ask, produced the real answer: 4 snapshots were updated
in both the D1c and D3 commits' separate `jest -u` runs and counted twice, for a false
total of 13 against a real distinct count of 9.

**This is a genuine counting mistake, not fabrication.** Unlike Session 73's invented
tooltip text, every number involved here was real — the error was in how two real,
overlapping update runs were tallied, not in inventing evidence. Worth distinguishing
clearly: Session 73 was a trust problem; this is a verification-method lesson (Lesson
36, Integration Brief v1.55).

---

## New, non-blocking notes for the record

- **ARC's exhibit-data gap** (BRAVO/CHARLIE/DELTA lack seeded budget exhibits) is real,
  pre-existing since Sessions 32-33, and worth a future content-completion item —
  not urgent, but now visibly surfaced by ARC's new UI.
- **GD-30's approval-channel documentation gap** — neither GD-30 nor GD-20 records how
  Project Principal approval was actually conveyed. A real, small format gap, not a
  Build Agent fix — flagged for a future Governance Agent amendment if worth closing.
- **GD-29 confirmed to have never existed** as a real governance decision — a citation
  error in Session 57's Handoff, corrected in that session's own Verification Addendum.
  GD-28 → GD-30 is the real, contiguous sequence.

---

## Status as of Session 75's close

**All four Tier 2 backlog items are closed.** This is also the first shell-contract
version change (v1.23 → v1.24) since this arc's hash-tracking discipline began, and it
passed the same scrutiny every other governance-significant change in this arc has —
including catching and correcting a real self-report error along the way.

**The live re-walk list has grown substantially, not incrementally** — see Integration
Brief v1.55 §21. Sessions 71-74 each added a narrow, specific thing to check against
prior UI. Session 75 built genuinely new screen surface with nothing prior to compare
against. This is now close to warranting its own dedicated walkthrough pass before a
demo script is finalized, not a quick addition to the existing four-item list.

---

*Findings & Resolution Log Addendum 5 · July 30, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
*Companion to `SOVEREIGN_Walkthrough_H_Findings_Resolution_Log_20260726.md`, Addenda 1-4, and `SOVEREIGN_Remaining_Build_Backlog_20260729.md`*
