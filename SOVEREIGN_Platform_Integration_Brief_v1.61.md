# SOVEREIGN Platform Integration Brief
## Version 1.61 | August 15, 2026 | Governance Agent

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.60 (August 11, 2026) — drafted but never placed
**Status:** v1.60 closed out the live-walkthrough findings and added the Session 105
re-verification. It was never placed in the repository, and eight sessions have
happened since. This version reflects real state through Session 114 and **retracts
two claims v1.60 carried that are now known to be wrong.**

**Changed this version:** §3 records GD-42 APPROVED and GD-40's amendment. §7
replaces the rulebook status entirely — three long-standing items are closed. New
§13 records the enforcement layer, which did not exist when v1.60 was written. §9
retracts the model-governance gap claim. §14 records the Session 113/114 defect work.

---

## 1 — Platform Identity

SOVEREIGN: a governed, AI-aligned operations platform. Six products (COUNSEL,
SCRIBE, VIGIL, LENS, CPMI, AgentOS), four companion modules (FLOWPATH, NEXUS, APEX,
ARIA Suite), the Reviewer's Workspace, two governed workflow layers (Time & Travel,
PPBE), a named-but-unbuilt Intelligence Layer, and STRATA — an organisation-scoped
data substrate, governance-approved, zero code written.

---

## 2 — Real State at Session 114 Close

| Item | Value |
|---|---|
| HEAD | `25012a9` |
| Shell contract | v1.28, both copies `c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b` |
| Tests | **2,059 JS/TS + 195 Python = 2,254**, all 15 workspaces exit 0 |
| SBOM | **v1.82** (Session 114) |
| `AGENT_REFERENCE.md` | **v3.10**, 2,212 lines, `02a8fbe2f6881d206fd0f4d464f72f301d5a6a2b105030642db3ca206d11d976` |
| `Agent_Identity_Standard.md` | v1.1, 1,727 lines, `4bd67a3a…` |
| Agents / prompts | 44 / 20 (19 approved + 1 pending) — unchanged since Session 76 |
| New production dependencies | Zero since Session 62 |
| Next GD | **GD-43** |

Test count rose from 2,245 to 2,254 across Sessions 113 and 114 — nine tests added,
all covering the two obligation-threshold fixes.

---

## 3 — Governance Decisions (through GD-42)

**GD-42 — Model Governance — APPROVED August 15, 2026.** The five Local LLM
decisions were recorded June 23, 2026 and are confirmed, not re-decided. The
citation is corrected to `docs/06 §8.1`. See §9 for the retraction this forces.

**GD-40 — AMENDED August 15, 2026.** Its dataset-split explanation covers the World
Model versus PPBE difference only. A second cause — dedup-versus-raw filtering on
one dataset — is recorded separately.

GD-31 through GD-41 unchanged from v1.60. GD-41's corrected resolution language
stands: the connector's construction and operation constitutes the unconditional
answer to Stage 2 persistence, resolved once built.

---

## 4 — Cost Tracking

Unchanged in substance: **14 of 19 real live-call sites** instrumented, 5 disclosed
as a real gap (COUNSEL ×3, FLOWPATH, APEX). Session-scoped only; no cross-session
persistence exists. Gated `SYSTEM_ADMIN`/`PLATFORM_ADMIN`.

**Recorded for precision:** cost is *measured*, not *governed*. No budget, cap,
spending limit, or automatic routing of low-risk work to cheaper models exists. The
only thresholds in the codebase are travel-cost approval thresholds, which are
unrelated.

---

## 5 — Program and Staff Data (GD-33)

The three-surface program count is now explained with file-level evidence — see
GD-40's amendment. Home Dashboard 5 (PPBE seed, de-duplicated), scenario analyst 18
(same seed, raw, 5 programs × 4 fiscal years), APEX Portfolio 17 (World Model
dataset, no overlap). No surface counts wrongly; the analyst's label is the
misleading element.

**Open:** whether to resolve by on-screen disclosure or by relabelling.

---

## 6 — Reviewer's Workspace — 7 Tabs, 5 with Permanent Parity Coverage

Unchanged. WH-43 remains resolved, live-confirmed, with the publish/consume
mechanism independently re-audited at code level.

---

## 7 — Rulebook Status — `AGENT_REFERENCE.md` v3.10

**Replaces v1.60 §7 entirely. Three items v1.60 carried as open are closed.**

- **Rules 15-17 merged** (Sessions 105/106). The addendum is gone.
- **Duplicate Rule 2/3 numbering — resolved, intentional.** Part I preserves the
  repo lineage's own rules; Part II supersedes for current practice. Citation
  guidance is recorded in the document (Session 109). Cite "Part I Rule 2" or
  "Part II Rule 2" explicitly.
- **Rule 14 — permanently unassigned** by decision of August 6, 2026.
- **Lessons 13-23 — closed** (Session 112). They existed in `PROJECT_SUMMARY.md`
  Part 7 the entire time, in a second lineage using a different heading format,
  after five flaggings. Imported at their existing numbers.
- **Lessons 26-29 — closed** (Session 108). Recovered from a parallel lineage copy
  that was produced in July and never committed.
- **Rules 13/14 lineage conflict — resolved by re-homing** (Session 109). The
  parallel copy's Rule 13 evidence folded into Rule 17; its Rule 14 content became
  Lesson 39.

**Still open:** Lessons 40-45 exist in `docs/40_Defect_Class_Register.md` §6 but
were never added to `AGENT_REFERENCE.md`, which runs 1-39 continuous. Two lineages
again.

**Four locations hold numbered lessons and they collide** — `AGENT_REFERENCE.md`,
`PROJECT_SUMMARY.md` (different content at shared numbers), 
`AGENT_BACKGROUND_AND_LESSONS_LEARNED.md` (never examined), and scattered handoffs.
**Neither lineage is renumbered**; that would break every existing citation.

---

## 8 — Test Suite

**2,059 JS/TS + 195 Python = 2,254.** Re-run at every session close with full output
quoted into the record. Nine tests added across Sessions 113-114, all proven to fail
without their corresponding fix.

**Recorded honestly:** there is no CI pipeline and no coverage measurement. Tests run
because the close protocol requires them, not because a server enforces it. Seven of
277 test files use mocking; the rest exercise real code paths.

---

## 9 — Known Open Items

**Retracted this version — v1.60 carried these and both are wrong:**

- **"Model governance — five unrecorded decisions."** The decisions were recorded
  June 23, 2026. The citation was one document number off. See GD-42.
- **"Rules 15-17 unmerged; duplicate Rule 2/3 unresolved; Lessons 13-23 gap."** All
  three closed. See §7.

**Genuinely open, governance:**
- CPMI-VRS Portfolio Status table — "Not started" honestly accurate; three options
  identified, Option A recommended. Awaiting decision.
- MCP-serving / persistent-service question — needs its own GD, not yet drafted.
- AI-output evaluation framework — real gap, correctly not urgent.
- Program-count disclosure — on-screen or relabel. See §5.
- Three frozen hash expectations in `check_steps_4_5.sh`, `preflight_check.sh`,
  `gather_repo_integrity_check.sh`, 12-15 contract versions stale, none called by any
  tracked script. **A frozen expectation in a script nobody runs should be deleted,
  not refreshed.** Project Principal decision.
- `pull_category3_docs_to_icloud.sh` — marked broken with a header (Session 112);
  update target list or untrack.

**Genuinely open, engineering:**
- Constraint #11 gap: three inference event types added at shell contract v1.6 were
  never propagated to `sovereign-data/src/shared-types.ts`. Mandated in the Session
  13 done condition; approximately ninety-eight sessions did not catch it.
- Spec/build event-name divergence: `docs/06 §4.4` names four event types; the code
  emits three, one matching. Would break Stage 4 if built as written.
- `MODEL_HASH_MISMATCH` reaches the audit log but no alert dispatcher. Unbuilt Stage
  4 scope, not a defect.
- `module-agentos/src/agent-dispatcher.ts` holds a dashed copy of three AgentOS agent
  ids; VIGIL was dotted in Session 113, agentos was not.
- `PPBEAgentsPanel` reads two different datasets on one panel.
- Module access denial has no event type in the approved taxonomy — a denial throws
  and writes an internal audit entry but emits no typed event. Self-documented in the
  module loader since June.

**Small, unresolved:** Operator display corrected Session 113. Tobyhanna 135%
corrected Session 113. ECHO 104% corrected Session 114.

---

## 10 — CTO Demonstration Readiness

**Target: Advance.** The platform has been walked live end to end and independently
re-verified at code level. Four demonstration-surface defects were found and closed
in Sessions 113-114, including two obligation-threshold errors that had Screen 1
disagreeing with the platform's own alerting.

What remains is not platform verification. It is: reading the ten-category
framework's actual questions, confirming six user roles on screen, two governance
decisions, and physical readiness on the presentation machine. Smart Capture and the
microphone are out of the demonstration by decision.

---

## 11 — STRATA Status

Unchanged. Phase 0 complete, Phase 1 mostly complete, Phase 2 demo-pause in effect,
zero STRATA code exists. Work Scope §4.3 — the Demo Script Screen 8 extension and the
Foundry Q&A answer — drafted twice, **still not verified or placed.**

---

## 12 — Independent Re-Verification

Session 105's full re-verification stands. Sessions 113 and 114 added targeted
verification: five program obligation rates computed from the real seed and
cross-checked against an existing test assertion, and tests proven to fail without
their fix by reverting the source and re-running.

---

## 13 — The Enforcement Layer (new this version)

Did not exist when v1.60 was written. **A lesson is advisory; a check is enforced.**

- **Tier 0 — gather script.** Blocks the paste on a short file count. Fired
  correctly in Session 113.
- **Tier 1 — `.githooks/pre-commit`. BLOCKS the commit** when cross-artifact drift
  grows above the baselines in `.sovereign_check_baseline`. Active:
  `EMITTED_NOT_IN_CONTRACT=4`, `STALE_CONTRACT_HASH_IN_TOOLING=3`. Two checks parked
  because their parsers do not measure the property they name — recorded rather than
  baselined. `core.hooksPath` must be set once per clone.
- **Tier 2 — `sovereign_session_verify.sh` v5**, four invariant checks: manifest-to-
  disk SHA integrity, version-chain continuity, SBOM count accuracy, PLACEMENT_LOG
  existence. Caught four real manifest drifts on its first run.
- **Tier 3 — periodic orphan and lineage scan. Not built.**
- **`.githooks/commit-msg`** strips attribution trailers. Verified holding: zero
  trailers and zero model names across the last 60 commits.

**`docs/40_Defect_Class_Register.md`** (324 lines) holds the defect taxonomy with
measured frequencies, four risk tiers, every check's exact command and pass
condition, and Lessons 40-45. Five of ten defect classes have no enforced check;
that is recorded, not assumed away.

---

## 14 — Demonstration-Surface Defect Work (Sessions 113-114)

| Defect | Outcome |
|---|---|
| Program counts disagreeing across three surfaces | **Investigated, not changed.** Cause established with file-level evidence; disclosure recommended over a code change before the demonstration |
| Site at 135% obligated showing "On track" | **Fixed** — over-obligation now flags `at_risk`; 3 tests |
| Program at 104% (ECHO) showing "On Track" on Screen 1 | **Fixed** — same missing upper bound at program level, found by a Rule 12 root-cause search; 6 tests, proven to fail without the fix |
| AgentOS ids dashed in VIGIL, dotted in LENS | **Fixed** in VIGIL; `agent-dispatcher.ts` copy left, reported |
| Operator label "Platform Developer" under System Admin | **Fixed** |

**Screen 1 now agrees with the ledger monitor's P1 CEILING_EXCEEDED flag and with
the end-to-end assertion.** Flagged programs moved 1 → 2.

A Session 113 prediction that the fix would change a snapshot was **checked and found
wrong** by Session 114 — that snapshot renders hardcoded fixtures, not the live seed.

---

*SOVEREIGN Platform Integration Brief · v1.61 · August 15, 2026 · Governance Agent*
*Retracts two v1.60 claims; records GD-42, the enforcement layer, and Sessions 112-114*
*Pre-Decisional · Internal Working Document*
