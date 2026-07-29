# SOVEREIGN Platform Integration Brief
## Version 1.52 | July 28, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.51
**Changed this version:** Session 72 closed all of D4 (WH-40, WH-45, WH-39) and,
separately, fully reconciled the test-count gap v1.51 flagged rather than resolved. Both
are real, verified closures — see §11. **What remains open platform-wide is now
entirely governance decisions (WH-47, WH-26, WH-44) and content/design backlog** — no
open Build Agent-actionable defect remains from the July 28 walkthrough. **The readiness
score is still not restated** — the one gate left is the live browser re-confirmation of
WH-43/34/41/42 flagged in v1.51, unchanged by this session's work.

---

## §1-§10 — unchanged, see v1.45

---

## §11 — Current Build Status

**HEAD as of this Brief:** `6f49651` (Session 72's close), per the real `git push`
output (`f182f9b..6f49651`), not a recap. Session 72's commit chain:
- **72** (`780dac8`→`0d3bae9`→`54e6113`→`10858c8`→`d024506`): test-count reconciliation
  (Python JSONL alignment, 8 stale e2e assertions traced individually to WG-6 and Session
  71's fixes and corrected); WH-40 (PPBE Workflow Agents panel — root cause was two async
  handlers invoked with `void`, discarding rejected Promises and leaving the button
  permanently stuck at "running" with no recovery short of unmount; fixed with try/catch
  resetting to idle on failure); WH-45 (Travel Request raw validator text — fixed with
  presence checks producing plain messages before the schema validator runs, which is now
  reached only for structurally complete but semantically invalid submissions); WH-39
  (Site breakdown column order — Planned now precedes Obligated).

**Test count: independently reconciled this version — the v1.51 gap is closed, with
arithmetic shown, not just a new number accepted.** Session 72 broke the count into all
three real categories: 1,779 across the fourteen JS/TS packages, 149 e2e passing + 4
skipped, 195 Python. Reassembled against Session 69's last full baseline (2,118 = 1,923
JS/TS across fifteen workspaces + 195 Python): e2e was the missing fifteenth workspace in
Session 71's undercount, and its "4 skipped" matches the same "4 deliberately-skipped
opt-in live tests" language from every prior version of this Brief — the same tests, not
new ones. Full reassembly: 1,779 + 153 (149+4) + 195 = **2,127**, a net increase of 9 over
2,118, fully accounted for by the four named regression tests this session added (2 for
WH-40, 1 each for WH-45/WH-39 — module-apex's 218→221 and module-nexus's 165→166 match
these exactly) plus smaller additions already documented in Sessions 70–71. **2,127 is
now the confirmed platform-wide test total.**

**Shell contract: v1.23, unchanged.** Hash
`6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`, confirmed unchanged
per Session 72's own explicit statement.

**A related data point surfaced during D1's e2e fixes, not a new bug:** DELTA's real
obligation data (existing since WG-6, Session 70) now correctly trips a
`CEILING_EXCEEDED` status in the ledger monitor (1,015K obligated against a 500K
lifecycle estimate, 203%) — the e2e test simply hadn't been updated to expect it. This is
structurally the same shape as WH-33/WH-47 (a real number against a real ceiling). Not a
new WH item on its own — worth a fast check when WH-47 is decided, whether DELTA's own
`EvaluationFinding` narrative already accounts for it or needs the same treatment.

---

## §12 — unchanged, see v1.50

---

## §13 — Open Governance Items

**CLOSED this version:**
- **WH-40** — PPBE Workflow Agents panel unresponsive after interaction. Fixed via
  try/catch on both async handlers; 2 regression tests.
- **WH-45** — raw schema-validator text on Travel Request's empty submit. Fixed via
  presence-check pre-validation; 1 regression test.
- **WH-39** — Site breakdown column order. Fixed; 1 regression test.
- **Test-count discrepancy** (flagged, not closed, in v1.51) — fully reconciled; see §11.

**NEW this version:** none. No new findings surfaced during Session 72 — this was a
closure session against Session 71's explicit D4 backlog plus the test-count gap.

**UNCHANGED, still open — all now require a decision, not a build session:**
- **WH-47** — ECHO's `EvaluationFinding` narrative vs. its real 104% rate. Real
  governance decision needed.
- **WH-26** — sidebar tooltip content, five issues incl. one factual error. Real decision
  needed on scope.
- **WH-44** — LENS Pipeline Navigator's zero-agents framing, confirmed by design. Real
  decision needed: wire it or reword it.
- **WH-36, WH-37, WH-38, WH-46** — design/content backlog, none urgent. WH-37 specifically
  still needs the BY/BY+1 tabs actually opened before it's a real finding.
- **WH-15, WH-16, WH-23, D3-6, D4-5, D4-9, D4-6, F2** — unchanged from v1.50/v1.51.

---

## §14 — SBOM Status

**Gap now covers Sessions 54 through 72.** Two more real session updates (71, 72) exist
since v1.51's count, unmerged. Same standing discipline — flagged, not asserted as
current.

---

## §15-§20 — unchanged from v1.51, except:

**§20 Full Build Roadmap — remove closed items, add nothing new:**

| Item | Depends on |
|---|---|
| **Live re-confirm WH-43, WH-34/41, WH-42** | Nothing — still the single remaining gate before a new readiness score can be responsibly written. Unchanged by Session 72's work, which did not touch a browser |
| Decide WH-47 (ECHO narrative) — and check DELTA's narrative for the same pattern while at it | Nothing — real, ready |
| Decide WH-26 | Nothing — unchanged |
| Decide WH-44 | Nothing — real, ready |
| WH-15, WH-16, WH-23, WH-46, WH-36, WH-38 | Each needs its own scoping/design pass |
| WH-37 | Someone opening the BY/BY+1 tabs |
| SBOM Registry merge | Mechanical, real, now covering Sessions 54–72, still not done |
| D4-6, F2 | Deliberately deferred |

---

## §21 — CTO Demo Readiness Track

**Still not restated — but the gate is now singular and small.** v1.51 named two
conditions before a new score could be written: reconcile the test count, and
live-reconfirm the three critical Session 71 fixes. **The first is done, verified with
arithmetic in §11.** The second is unchanged — Session 72 was Build Agent code work, not
a browser session, and doesn't touch it. **The entire readiness picture now rests on one
remaining action:** open NEXUS's Travel queue and the Workspace panel side by side, open
Home Dashboard and check ALPHA/DELTA's percentages, sign in as READ_ONLY once. When that
holds, a new score has real, complete basis. Until then, this Brief continues to decline
to restate 9.6/10 rather than imply a confidence level not yet earned by live evidence.

---

## Key Lessons — Current

Lessons 1-31: see v1.51.

**Lesson 32 — a flagged discrepancy, reconciled with shown arithmetic, is worth naming as
the successful case, not just the failure that preceded it.** Lesson 31 named what went
wrong when a re-derived count didn't state its own scope. Session 72 is the other half of
that story: given the gap explicitly and asked to reconcile it, Build Agent traced eight
stale assertions to their real, individually-named root causes, recovered the missing
e2e category, and produced a total that adds up against every prior confirmed number.
Worth carrying forward as what "re-derived" should look like by default, not an
exceptional response to being caught.

---

*SOVEREIGN Platform Integration Brief v1.52 · July 28, 2026*
*Pre-Decisional · Internal Working Document*
