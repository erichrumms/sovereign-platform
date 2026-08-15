# SOVEREIGN Platform — SBOM Session Update
## Version 1.82 · August 15, 2026

**Supersedes:** v1.81 (Session 113, August 15, 2026)
**Session:** 114 — Demonstration-surface defect correction (program-level obligation status)
**Build Agent close commit:** (see DOCUMENT_MANIFEST.tsv terminal HEAD row)

---

## 1 — Shell Contract

**v1.28 — unchanged.** Both copies byte-identical, SHA
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`.
No GD was raised this session (next GD remains GD-42). No shell-contract change. The status
enum retains its three values (`on_track` / `at_risk` / `off_track`); no fourth value was added.

---

## 2 — Agent and Prompt Registry

**Agents: 44 — unchanged.** No new agents registered.
**Prompts: 20 (19 approved + 1 pending) — unchanged.** No new prompts authored or approved.

---

## 3 — Test Counts

| Suite | Count | Confidence |
|---|---|---|
| JS/TS | 2059 | High — all 15 suites pass, real exit codes via `sovereign_session_verify.sh` |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2254** | **High** |

**Change from v1.81:** JS/TS 2053 → **2059 (+6)**. All six added tests are in
`module-apex/tests/ppbe-dashboard.test.ts` (D3): three unit cases on `statusFromObligationRate`
(over-obligation band + two regression guards) and three on `publishProgramStatuses` driven by the
real synthetic seed (ECHO publishes `at_risk`, the other four unchanged, flagged count 1 → 2). No
existing tests removed. Python unchanged at 195.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.** No packages added or removed. Vulnerability posture
unchanged from v1.81.

---

## 5 — Changed Components (source — Build Agent close artifacts, not governance documents)

### module-apex/src/ppbe-dashboard.ts — D2 (commit `9ed0cc9`)

`statusFromObligationRate` gained an over-obligation case: `if (rate > 100) return "at_risk"`,
placed before the existing lower-bound cases (the `rate === null` guard is split out first so the
`> 100` test always runs on a number). A program obligating beyond 100% of plan is no longer
published `on_track`. This mirrors `siteStatus` in `ppbe-site-breakdown.ts` exactly (Session 113
D2, commit `6a310d0`) — the same reasoning and inline comment so the two functions read as one
decision. The doc-comment threshold table was updated to state the new upper bound.

### module-apex/tests/ppbe-dashboard.test.ts — 6 NEW tests (D3, commit `9ed0cc9`)

Two describe blocks. `statusFromObligationRate`: over-obligation (101/104/203 → `at_risk`, fails
without the fix), the 80–100% band regression guard, and the lower-band regression guard.
`publishProgramStatuses` (real seed via `createSyntheticPPBEDashboardInputs`): ECHO computes 104%
and publishes `at_risk`; the other four programs are unchanged; the Home flagged set
(`status !== on_track`) is exactly {BRAVO, ECHO} — count 1 → 2.

---

## 6 — Screen 1 (Home Dashboard) impact — taken deliberately

Five FY2026 program statuses, before → after this fix:

| Program | FY2026 rate | Before | After |
|---|---|---|---|
| SYNTH-PRG-ALPHA | 97% | on_track | on_track (unchanged) |
| SYNTH-PRG-BRAVO | 46% | off_track | off_track (unchanged) |
| SYNTH-PRG-CHARLIE | 95% | on_track | on_track (unchanged) |
| SYNTH-PRG-DELTA | 95% | on_track | on_track (unchanged) |
| **SYNTH-PRG-ECHO** | **104%** | **on_track** | **at_risk** |

**ECHO is the only program above 100% and the only one that flips.** On Screen 1: ECHO's badge
changes On Track → At Risk, and the Issues section's "N flagged" count (Home filters
`status !== "on_track"`) moves **1 → 2** (BRAVO, then BRAVO + ECHO). The Home Dashboard now agrees
with the ledger monitor's P1 CEILING_EXCEEDED flag for ECHO and with the end-to-end
`ppbe-full-cycle.test.tsx` CEILING_EXCEEDED assertion.

**No snapshot was affected.** The Session 113 handoff predicted this fix would change the
`shell-nav-snapshots` snapshot; verification (D4) shows that is not so — that snapshot renders
hardcoded `SAMPLE_PROGRAMS` fixtures (`P-2025-001/002/003`), not the live seed. The full
sovereign-shell suite passed with all 16 snapshots unchanged; the full APEX suite reports 0
snapshots. The Screen-1 behavior is instead locked in by the six new tests above.

---

## 7 — Governance Documents Placed This Session

None. No Integration Brief, spec, or other governance document was authored or placed. Only Build
Agent close artifacts (this SBOM update, the Session 114 Handoff) were committed. `PLACEMENT_LOG.tsv`
unchanged.

---

*SOVEREIGN Platform — SBOM Session 114 Update v1.82 · August 15, 2026*
*Supersedes v1.81 (Session 113) · Pre-Decisional · Internal Working Document*
