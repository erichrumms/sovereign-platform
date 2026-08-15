# SOVEREIGN Platform — Session 114 Handoff

**Session type:** Single-defect correction on a live demonstration surface (real code change).
**Opened at:** HEAD `9d3f689` · shell-contract v1.28 (`c99355ce…`, both copies identical).
**Author:** Build Agent.
**Scope:** D1 (verify), D2 (fix), D3 (test), D4 (snapshot/Screen-1), D5 (close verification).

Session-open verification (CLAUDE.md §6): HEAD `9d3f689cf06a9f7e21abcd527a0b49d8743ab350`
confirmed by `git rev-parse`; working tree clean; both shell-contract copies =
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b` (diff clean, identical).

**Tier 0 deviation (recorded per opening prompt §1):** no gather script was written for this
session. Repository state was confirmed directly in Terminal 2 — HEAD, clean tree, both
shell-contract copies identical — because the scope is one function, its tests, and (as it turned
out) no snapshot. This is a deliberate, recorded exception, not a skipped step.

---

## D1 — Verify before changing (CONFIRMED)

Every Governance Agent assertion in the opening prompt was checked against the real code before any
change.

**The gap is real.** `statusFromObligationRate` (`ppbe-dashboard.ts:273-279` at open) read:
```
if (rate === null || rate < 50) return "off_track";
if (rate < 80) return "at_risk";
return "on_track";
```
A lower bound only, no upper bound — any rate ≥ 80, including 104%, returned `on_track`.

**The five FY2026 program rates** (the primary/first-listed fiscal year, which
`publishProgramStatuses` uses via `uniqueByProgramId` + `obligationsForYear`), computed from the
real seed (`sovereign-data/src/synthetic/ppbe-seed.ts`) and cross-checked against the existing
`module-apex/tests/ppbe-data-adapter.test.tsx:39` (which already asserts ECHO = 104):

| Program | Obligated (FY2026) | Plan (FY2026) | Rate | Status at open |
|---|---|---|---|---|
| SYNTH-PRG-ALPHA | 802,000 | 825,000 | 97% | on_track |
| SYNTH-PRG-BRAVO | 267,000 | 580,000 | 46% | off_track |
| SYNTH-PRG-CHARLIE | 296,000 | 310,000 | 95% | on_track |
| SYNTH-PRG-DELTA | 485,000 | 510,000 | 95% | on_track |
| **SYNTH-PRG-ECHO** | **458,000** | **440,000** | **104%** | **on_track (wrong)** |

**ECHO is the only program above 100%, and the only one that flips.** ALPHA/CHARLIE/DELTA sit at
95–97% (below 100, stay `on_track`); BRAVO at 46% stays `off_track`. No more than one program
changes status — Screen-1 impact is exactly as authorized.

**The disagreement is confirmed:** ECHO is the seed's deliberate ceiling-exceeded / Anti-Deficiency
exposure example. The ledger monitor flags exceedance P1 (`ppbe-ledger-monitor.test.ts:117`,
CEILING_EXCEEDED / P1) and `e2e/tests/ppbe-full-cycle.test.tsx` asserts CEILING_EXCEEDED for it —
yet the Home Dashboard published `on_track`. Alerting and dashboard disagreed. This was flagged for
authorization in the Session 113 handoff (§ "For the Governance Agent", item 2) and SBOM v1.81 §6.

---

## D2 — Apply the fix (DONE — mirrors the site-level change exactly)

**Real diff:**
```
--- a/module-apex/src/ppbe-dashboard.ts
+++ b/module-apex/src/ppbe-dashboard.ts
 export function statusFromObligationRate(
   rate: number | null
 ): "on_track" | "at_risk" | "off_track" {
-  if (rate === null || rate < 50) return "off_track";
+  if (rate === null) return "off_track";
+  if (rate > 100) return "at_risk"; // over-obligation — obligated beyond plan is not "on track"
+  if (rate < 50) return "off_track";
   if (rate < 80) return "at_risk";
   return "on_track";
 }
```
The over-obligation case returns `at_risk` and is placed before the existing lower-bound cases, per
D2. The `rate === null` guard (previously fused with `rate < 50`) is split out first so the `> 100`
comparison always runs on a number — the exact analogue of `siteStatus`'s `if (planned === 0)`
guard preceding its `if (pct > 100)` case. The inline comment is byte-identical to the site-level
one (`ppbe-site-breakdown.ts:52`), and the doc-comment threshold table was updated so the two
functions read as one decision. The status enum is unchanged (three values); no contract change.

---

## D3 — Test it (DONE — 6 new tests in the ppbe-dashboard suite, fail without the fix)

Added to `module-apex/tests/ppbe-dashboard.test.ts` (where the existing `ppbe-dashboard` tests
live):

- **`describe("statusFromObligationRate")`** — over-obligation (101/104/203 → `at_risk`);
  80–100% regression guard (80/95/97/**100** → `on_track` — 100 is exactly on plan, not over, and
  matches the pre-existing e2e threshold assertion); lower-band regression guard
  (79/50 → `at_risk`, 49/46/null → `off_track`).
- **`describe("publishProgramStatuses …")`** — drives the *real* seed through the actual publish
  path into a minimal in-memory `ProgramStatusSurface`: ECHO computes 104% and publishes `at_risk`;
  the other four are unchanged; the Home flagged set (`status !== "on_track"`) is exactly
  {SYNTH-PRG-BRAVO, SYNTH-PRG-ECHO} — count 1 → 2.

**Fail-without-fix proven:** with the source reverted (`git stash`), the over-obligation unit test,
the ECHO-publishes-`at_risk` test, and the flagged-count-1→2 test all **fail**; the "other four
unchanged" guard passes either way (correct — it does not depend on the fix). Restored and all 6
pass. No existing test broke: the e2e `statusFromObligationRate(100) === "on_track"` assertion
still holds because the fix keys on `> 100`, not `>= 100`.

---

## D4 — Snapshot / Screen-1 change (VERIFIED — no snapshot affected)

**What changed on Screen 1 (Home Dashboard):** ECHO's status badge changes **On Track → At Risk**,
moving it into the "Flagged Programs" panel; the Issues-section "N flagged" count (Home filters
`status !== "on_track"`, `PlatformHome.tsx:379,462`) moves **1 → 2** (was {BRAVO}, now
{BRAVO, ECHO}). Home now agrees with the ledger monitor's P1 flag and the end-to-end
CEILING_EXCEEDED assertion.

**Correction to the Session 113 handoff (CLAUDE.md §6 — verify, don't assume):** Session 113
predicted this fix would "change the `shell-nav-snapshots` snapshot." It does **not**. That snapshot
renders hardcoded `SAMPLE_PROGRAMS` fixtures (`shell-nav-snapshots.test.tsx:237-241`,
`P-2025-001/002/003`), **not** the live PPBE seed, so ECHO never appears in it. Verified by running
the full suites: sovereign-shell passed with all **16 snapshots unchanged**; the full APEX suite
reports **0 snapshots**. No `.snap` file in the repo renders the live-seed Home. The Screen-1
behavior is therefore captured by the six new `ppbe-dashboard` tests (D3), not by a snapshot — and
**no snapshot needed updating.** No existing test broke other than through intended behavior; no
test was adjusted to pass.

---

## D5 — Close verification

**Full suite (real exit codes, via `sovereign_session_verify.sh`):** all 15 JS/TS workspaces
PASS; Python PASS.
- **JS/TS total: 2059** (was 2053 at Session 113 close → **+6**, exactly the six new
  `ppbe-dashboard` tests).
- **Python: 195 passed** (unchanged).

`sovereign_session_verify.sh` summary: **29 pass / 1 warn / 1 fail.** The single WARN is the
working-tree uncommitted-tracked-changes notice (the two files of this change, pre-commit). The
single FAIL is check 8 (SBOM count accuracy): the most recent *committed* SBOM (Session 113) states
JS/TS=2053, actual is 2059. **This is the expected mid-session artifact of the +6 tests** —
`SBOM_Session114_Update.md` (v1.82) states 2059 and resolves it; re-run at final close confirms.
Checks 6 (manifest-to-disk, 103 files all match), 7 (version-chain continuity), 9 (PLACEMENT_LOG
existence) all PASS. Agent registry unchanged (44).

`./sovereign_tier1_checks.sh`: **Tier 1 clear.** `EMITTED_NOT_IN_CONTRACT` at baseline (4);
`STALE_CONTRACT_HASH_IN_TOOLING` at baseline (3). No baseline was raised. The `UNSET` lines
(`EVENTTYPE_NOT_PROPAGATED=79`, `LOGGER_EVENTS_UNROUTED=94`) are the parked, deliberately-not-
baselined checks per `docs/40 §5` — unchanged by this session. `.sovereign_check_baseline` not
touched.

**Shell contract (Constraint #11):** not touched; both copies identical at close =
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`.

**Governance-document placement:** none this session. `PLACEMENT_LOG.tsv` unchanged (CLAUDE.md §5
applies only to commits following a governance placement).

---

## Commits this session

| Deliverable | Commit | Summary |
|---|---|---|
| D2 + D3 | `9ed0cc9` | over-obligated programs (>100%) → at_risk in `statusFromObligationRate` + 6 tests |

(Handoff + SBOM v1.82 + manifest rows committed after this; terminal HEAD recorded in the
`DOCUMENT_MANIFEST.tsv` Session 114 handoff row after the final push, per the Session 110
convention — not in this handoff.)

---

## Close statement (opening prompt §7.7)

- **Five program rates, before → after:** ALPHA 97% on_track → on_track; BRAVO 46% off_track →
  off_track; CHARLIE 95% on_track → on_track; DELTA 95% on_track → on_track; **ECHO 104% on_track →
  at_risk.** ECHO is the only change.
- **Screen 1:** ECHO's badge On Track → At Risk; flagged-programs count 1 → 2. No snapshot changed
  (none renders the live seed).
- **Agreement restored:** the Home Dashboard now agrees with the ledger monitor's P1
  CEILING_EXCEEDED flag for ECHO and with the `ppbe-full-cycle.test.tsx` end-to-end CEILING_EXCEEDED
  assertion.

---

## For the Governance Agent — items surfaced, not acted on (unchanged from Session 113, out of scope)

1. **D1 (S113):** cross-surface program-count inconsistency (5 / 17 / 18) remains — PPBE seed vs
   World Model split + dedup-vs-raw filter. Recommend on-screen disclosure; correct GD-40.
   Untouched this session (opening prompt scope: out entirely).
2. **D3 (S113):** `module-agentos/src/agent-dispatcher.ts` still holds a dashed copy of the three
   AgentOS agent ids; align in a future session. Untouched.
