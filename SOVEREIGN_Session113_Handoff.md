# SOVEREIGN Platform — Session 113 Handoff

**Session type:** Demonstration-surface defect correction (real code changes).
**Opened at:** HEAD `0f95654` · shell-contract v1.28 (`c99355ce…`, both copies identical).
**Author:** Build Agent.
**Scope:** D1 (investigate-only), D2, D3, D4 (fixes), D5 (close verification).

Session-open verification (CLAUDE.md §6): HEAD `0f956546…` matched the gather package;
both shell-contract copies = `c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`;
working tree clean. The untracked `verify_cto_questions.sh` shown in the start-of-conversation
git snapshot was not present at session open.

---

## D1 — Program count discrepancy (INVESTIGATE-ONLY — no change made)

**Finding (confirmed, file-and-line evidence):** the three counts come from **two genuinely
distinct datasets plus one filtering difference on the same dataset** — not a single counting
bug. GD-40's "PPBE-native vs World Model split" hypothesis is **partially correct**: it explains
the 17 vs the PPBE surfaces, but not the 5-vs-18 split, which is dedup-vs-raw on the *same* PPBE
seed.

| Surface | Count | Data source | Why this number |
|---|---|---|---|
| Home Dashboard "Program Health" | **5** | `ctx.programStatusSurface.list()` ← `startup-publish.ts:74` `publishProgramStatuses(createSyntheticPPBEDashboardInputs(), …)` | `publishProgramStatuses` (`ppbe-dashboard.ts:287-305`) runs `uniqueByProgramId` (`ppbe-dashboard.ts:227`) over `SYNTH_PPBE_PROGRAMS` → **5 unique** program_ids (ALPHA/BRAVO/CHARLIE/DELTA/ECHO) |
| Scenario-analyst output | **18** | `PPBEAgentsPanel.tsx:62` passes raw `inputs.programs` to the analyst | `SYNTH_PPBE_PROGRAMS` (`sovereign-data/src/synthetic/ppbe-seed.ts:145-476`) holds **18 records** = 5 programs × 4 fiscal years, **not de-duplicated** |
| APEX Portfolio Dashboard | **17** | `PortfolioDashboard.tsx:41` `adapter.listPrograms()` ← `apex-data-adapter.ts` ← `SYNTHETIC_PROGRAMS` | `synthetic-world-model.ts:604` holds **17 distinct** World-Model programs (P-100…P-413) — a *different dataset* with zero overlap with the PPBE seed |

Verified directly (not inferred): `grep` on `ppbe-seed.ts` → 18 `SYNTH_PPBE_PROGRAMS` records,
5 unique ids; `synthetic-world-model.ts` → 17 `SYNTHETIC_PROGRAMS`. Confirmed against
`sovereign-data/tests/ppbe-seed.test.ts` ("holds five programs in FY2026") and
`module-apex/tests/ppbe-data-adapter.test.tsx:35` (`obligation_rates` length 5).

**Assessment:** (a) different datasets (PPBE seed vs World Model → the 5/18 vs 17 split) **and**
(b) same dataset, different filter (dedup vs raw → the 5 vs 18 split). No single surface is
"counting wrongly": each number is internally correct for what it enumerates. The genuinely
misleading one is the scenario-analyst's **18**, which labels *program-fiscal-year rows* as
"programs."

**Recommendation (no code change this session — surfaced for the Governance Agent):**
Home's **5** is correct and demo-safe; it is the number a numerate evaluator checks on Screen 1
by eye. Do **not** change code before the demo (Lesson 45 / the session's own stated reason for
existing). The cross-surface inconsistency should be resolved by the Governance Agent as either
(a) an on-screen disclosure/label clarifying each surface's scope (recommended — lowest risk), or
(b) a later, authorized code change relabeling/counting the scenario-analyst by unique program.
GD-40 should also be corrected to note it explains only the World-Model split, not the
dedup-vs-raw one.

**Also surfaced (not fixed — beyond D1 scope):** `PPBEAgentsPanel.tsx` reads two different
datasets on one panel — evidence synthesis uses the World-Model adapter (`apexPrograms`), the
scenario analyst uses the PPBE seed (`inputs.programs`). Reported for Governance Agent awareness;
no change made.

---

## D2 — Obligation status threshold (FIXED — site surface only)

**Finding:** a **missing case**, genuinely wrong. `siteStatus` (`ppbe-site-breakdown.ts:46`) had
only a lower bound (`pct >= 80 → on_track`) and no upper bound, so `SYNTH-SITE-A3`
(Tobyhanna / SYNTH-PRG-ALPHA), seeded at 135000/100000 = **135%**, displayed **"On Track."**
Over-obligation (obligated beyond plan) is not "on track."

**Fix (real diff):**
```
--- a/module-apex/src/ppbe-site-breakdown.ts
+++ b/module-apex/src/ppbe-site-breakdown.ts
 function siteStatus(obligated: number, planned: number): SyntheticSiteBreakdown["status"] {
   if (planned === 0) return "off_track";
   const pct = Math.round((obligated / planned) * 100);
+  if (pct > 100) return "at_risk"; // over-obligation — obligated beyond plan is not "on track"
   if (pct >= 80) return "on_track";
   if (pct >= 50) return "at_risk";
   return "off_track";
 }
```
Over-obligation maps to **at_risk** (not off_track): "off_track" in this scheme is defined as
major *under*-obligation; at_risk is the proportionate "flag for review" bucket, and it stays
proportionate for a single over-obligated site inside an otherwise-healthy program (ALPHA is 97%
overall). The status enum has only three values; a new value would need a contract change (not
authorized).

**Test added** (`module-apex/tests/ppbe-site-breakdown.test.ts`, 3 tests — fails without the fix):
asserts A3 computes to 135% and is `at_risk`, that every over-obligated site is `at_risk`, and a
regression guard that 80–100% sites remain `on_track`.

**Rule 12 check — same root cause searched elsewhere, and found (REPORTED, NOT FIXED):**
the program-level `statusFromObligationRate` (`ppbe-dashboard.ts:273-279`) carries the **identical
missing-upper-bound gap**. Confirmed by running the real publish path: **SYNTH-PRG-ECHO computes
104% and currently publishes `on_track` to the Home Dashboard (Screen 1)** — even though ECHO is
the seed's deliberate "ceiling-exceeded / ADA exposure" example, flagged P1 by the ledger monitor
and as CEILING_EXCEEDED in `e2e/tests/ppbe-full-cycle.test.tsx`. All five program statuses today:
ALPHA 97% on_track · BRAVO 46% off_track · CHARLIE 95% on_track · DELTA 95% on_track ·
**ECHO 104% on_track (wrong)**.

This was **deliberately not fixed this session.** Fixing `statusFromObligationRate` flips ECHO to
`at_risk` on the Home Dashboard, moves it into the "Flagged Programs" panel (flagged 1 → 2), and
changes the `shell-nav-snapshots` snapshot — i.e. it touches a live surface (Screen 1) beyond
D2's named site surface. The opening prompt's autonomous rules state: "Any fix that would require
touching more than the surface named in its deliverable" → stop and surface. **Recommendation:**
apply the same `if (rate > 100) return "at_risk";` to `statusFromObligationRate` as an explicit,
authorized decision — it is the correct behavior and would make Home agree with the ledger
monitor — but as a deliberate Governance/Project-Principal call with the Screen-1 change made
with eyes open, not a Build-Agent side effect days before the demo.

---

## D3 — AgentOS identifier formatting (FIXED)

**Finding:** genuinely wrong. `approval-port.ts` seeded three synthetic ids with dashes; the
canonical registry (`Agent_Identity_Standard.md`), the AgentOS AgentCards
(`module-agentos/src/index.ts:74-76`), and LENS (`module-lens/src/orientation-data.ts:96-98`) all
use the dotted form. LENS renders the dotted form correctly.

**Confirmed nothing keys on the dashed strings before changing** (D3 requirement): no runtime code
joins `requesting_agent_id` to any dispatcher id (grep for `=== .*agentos` / `agent_id ===` found
none). The VIGIL tests that mention `agentos-deployer` define their own fixtures; the
approval-port suite (`approval-port.test.ts`) asserts count/risk/action-type/expiry/synthetic —
**not** agent id; the workspace/e2e tests key on `req-dev-001` (request_id), not agent id.

**Fix (real diff):** three literals changed —
`"agentos-deployer" → "agentos.deployer"`, `"agentos-exporter" → "agentos.exporter"`,
`"agentos-configurator" → "agentos.configurator"`. Full VIGIL suite: **215 passed** afterward.

**Left alone (reported, not fixed — beyond D3's named surface):**
`module-agentos/src/agent-dispatcher.ts:45-49` (`SYNTHETIC_DISPATCH_AGENTS`) holds a second,
independent dashed copy of the same three ids; its own comment says it deliberately mirrors the
VIGIL seeds. There is no runtime join, so this session's change does not break anything, but the
two synthetic sources now differ in id form. Aligning `agent-dispatcher.ts` (and its
`module-agentos` tests) to the dotted form is a separate, in-kind follow-up for a future session.

---

## D4 — Operator display label (FIXED)

**Finding:** not deliberate — an inconsistency. Every `DEV_PERSONA_NAMES` entry
(`sovereign-shell/src/main.tsx:84-94`) is `"Dev — [Role]"` except `SYSTEM_ADMIN`, which read
`"Platform Developer"` (present since Session 41 / GD-22, commit `2c0fe9e`). `docs/40 §3` already
classifies this exact item as a T1 cosmetic defect ("'Platform Developer' label under System
Admin"). No test or snapshot keys on the string.

**Fix (real diff):** `SYSTEM_ADMIN: "Platform Developer" → "Dev — System Admin"`. sovereign-shell
suite (16 snapshots) unchanged and passing.

---

## D5 — Close verification

**Full suite (real exit codes, via `sovereign_session_verify.sh`):** all 15 JS/TS workspaces
PASS; Python PASS.
- **JS/TS total: 2053** (was 2050 at Session 112 → **+3**, exactly the three new D2
  site-breakdown tests).
- **Python: 195 passed** (unchanged).

`sovereign_session_verify.sh` summary: **29 pass / 1 warn / 1 fail.** The single FAIL is check 8
(SBOM count accuracy): the most recent *committed* SBOM (Session 112) states JS/TS=2050, actual is
2053. **This is an expected mid-session artifact of the +3 tests** — `SBOM_Session113_Update.md`
(below) states 2053 and resolves it; re-run at final close confirms. Checks 6 (manifest-to-disk,
101 files all match), 7 (version-chain continuity), 9 (PLACEMENT_LOG existence) all PASS.

`./sovereign_tier1_checks.sh`: **Tier 1 clear.** `EMITTED_NOT_IN_CONTRACT` at baseline (4);
`STALE_CONTRACT_HASH_IN_TOOLING` at baseline (3). No baseline was raised. The `UNSET` lines
(`EVENTTYPE_NOT_PROPAGATED=79`, `LOGGER_EVENTS_UNROUTED=94`) are the parked, deliberately-not-
baselined checks per `docs/40 §5` — unchanged by this session.

**Shell contract (Constraint #11):** not touched; both copies identical at close =
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`.

**Governance-document placement:** none this session. `PLACEMENT_LOG.tsv` unchanged (CLAUDE.md §5
applies only to commits following a governance placement).

---

## Commits this session

| Deliverable | Commit | Summary |
|---|---|---|
| D2 | `6a310d0` | over-obligated sites (>100%) → at_risk + test |
| D3 | `b9a1ca7` | dot-form the three VIGIL synthetic AgentOS agent ids |
| D4 | `b97e96b` | operator label under System Admin → "Dev — System Admin" |

(Handoff + SBOM + manifest rows committed after these; terminal HEAD recorded in the
`DOCUMENT_MANIFEST.tsv` Session 113 handoff row after the final push, per the Session 110
convention — not in this handoff.)

---

## For the Governance Agent — items surfaced, not acted on

1. **D1:** cross-surface program-count inconsistency is a real dataset split (PPBE seed vs World
   Model) + a dedup-vs-raw filter difference. Recommend on-screen disclosure over a code change;
   correct GD-40 (it explains only the World-Model split). `PPBEAgentsPanel` reads two datasets on
   one panel.
2. **D2 / Rule 12:** `statusFromObligationRate` has the same missing-upper-bound gap; ECHO 104%
   shows "On Track" on Home. Recommend the same fix as an authorized Screen-1 change.
3. **D3:** `module-agentos/src/agent-dispatcher.ts` still holds a dashed copy of the three agent
   ids; align in a future session (touches `module-agentos` tests).
