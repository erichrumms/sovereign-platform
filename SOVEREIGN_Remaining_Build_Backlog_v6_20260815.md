# SOVEREIGN Platform — Remaining Build Backlog (v6)
## Superseding v5 (August 11, 2026) · August 15, 2026 · Governance Agent

**What changed since v5:** v5 was drafted and never placed. Nine sessions have
happened since. Three long-standing items are closed, two v5 claims are retracted as
factually wrong, an enforcement layer that did not exist in v5 is now live and
blocking, and four demonstration-surface defects were found and worked.

---

## Retracted — v5 carried these and both are wrong

| Item | Correction |
|---|---|
| **"Model governance — five unrecorded decisions (D1-D5) named in `docs/07 §8.1`"** | The decisions were recorded June 23, 2026 in Integration Brief v1.17 and restated in `docs/10 §7`. The citation was one document number off — the real location is `docs/06 §8.1`, which is titled "Decisions Required Before Stage 4 Build" and lists the *questions*. GD-42 APPROVED, August 15, 2026 |
| **"AGENT_REFERENCE.md Lessons 13-23 — a structural gap, content exists only in older Integration Brief material"** | The content was in `PROJECT_SUMMARY.md` Part 7 the entire time, in a second lineage using a different heading format. Flagged five times; nobody grepped that file. Imported at existing numbers, Session 112 |

---

## Closed since v5

| ID | Item | Closed in | Note |
|---|---|---|---|
| — | Parallel `AGENT_REFERENCE.md` lineage — two copies both called v3.5, differing across 145 lines | 108 | Three content blocks recovered including four real Lessons; provenance established — the file existed locally and was never committed |
| — | Rules 15-17 merge | 105/106 | Addendum removed |
| — | Duplicate Rule 2/3 numbering | 109 | Confirmed intentional; citation guidance recorded in the document |
| — | Rules 13/14 lineage conflict | 109 | Resolved by re-homing: parallel Rule 13's evidence into Rule 17, its Rule 14 content as Lesson 39. Rule 14 stays unassigned |
| — | Lessons 26-29 | 108 | Recovered; the "do not exist anywhere" claim retracted |
| — | Lessons 13-23 | 112 | Imported from `PROJECT_SUMMARY.md` Part 7 |
| — | 27-session manifest hole (Sessions 81-106) | 110 | 47 rows added from real git history |
| — | Four manifest SHA drifts | 112 | All four confirmed genuine and corrected |
| — | Verify script running on three dead checks for ~60 sessions | 111 | Six standing warnings resolved; four invariant checks added |
| — | SBOM version-numbering collision | 110/111 | One shared number space; derive by scanning all SBOM files and adding one |
| — | Model governance framing contradiction | GD-42 | See retraction above |
| — | GD-40's explanatory scope | Amended | Explains the World Model split only, not dedup-versus-raw |
| — | Site at 135% obligated showing "On track" | 113 | Missing upper bound in `siteStatus`; 3 tests |
| — | Program ECHO at 104% showing "On Track" on Screen 1 | 114 | Same gap at program level, found by Rule 12 root-cause search; 6 tests, proven to fail without the fix. Home now agrees with the ledger monitor's P1 flag |
| — | AgentOS ids dashed in VIGIL | 113 | Three literals dotted to match the canonical registry |
| — | Operator display "Platform Developer" under System Admin | 113 | Corrected to "Dev — System Admin" |

---

## Open — decisions awaiting the Project Principal

| ID | Item | Status |
|---|---|---|
| — | **CPMI-VRS Portfolio Status table** | "Not started" is honestly accurate. Three options identified; Option A (derive gate states from already-logged VRS events) recommended. Unchanged since v5 |
| — | **MCP-serving / persistent-service GD** | Named as needing its own decision. Still not drafted |
| — | **Program-count disclosure** | Resolve the three-surface inconsistency by on-screen disclosure, or by relabelling the scenario analyst's output. Build Agent recommends disclosure as lower-risk before the demonstration |
| — | **Three frozen hash expectations** | `check_steps_4_5.sh:19`, `preflight_check.sh:56`, `gather_repo_integrity_check.sh:27` — 12-15 contract versions stale, none called by any tracked script. **A frozen expectation in a script nobody runs should be deleted, not refreshed** |
| — | **`pull_category3_docs_to_icloud.sh`** | Marked broken with a header (Session 112). Update the target list or untrack |
| — | **Tracked synthetic log** | `sovereign-security/logs/ppbe_synthetic_seed.jsonl` is tracked. Decide deliberately before granting repository access |
| — | **`VITE_NOTION_API_KEY`** | Appears among expected environment variables; purpose undocumented. A reviewer will ask |

---

## Open — engineering, genuinely unbuilt

| ID | Item | Status |
|---|---|---|
| — | **Constraint #11 propagation gap** | Three inference event types added at shell contract v1.6 were never propagated to `sovereign-data/src/shared-types.ts`. Mandated in the Session 13 done condition; ~98 sessions did not catch it. A `grep -c` returns 0 |
| — | **Spec/build event-name divergence** | `docs/06 §4.4` names `INFERENCE_ANOMALY`, `MODEL_DRIFT_DETECTED`, `INFERENCE_FALLBACK`, `INFERENCE_PERFORMANCE_ANOMALY`; the code emits `INFERENCE_CALL`, `INFERENCE_PROVIDER_FALLBACK`, `MODEL_HASH_MISMATCH`. One match. Would break Stage 4 if built as written |
| — | **`MODEL_HASH_MISMATCH` dispatches no alert** | In neither `P1_EVENT_TYPES` nor `P2_EVENT_TYPES`. Unbuilt Stage 4 scope, not a defect. No document may claim it raises an alert |
| — | **Module access denial has no event type** | A denial throws and writes an internal audit entry but emits no typed event; adding one is a contract change. Self-documented in the module loader since June |
| — | **`agent-dispatcher.ts` dashed agent ids** | Second copy of the three AgentOS ids, still dashed. No runtime join, no break. In-kind follow-up |
| — | **`PPBEAgentsPanel` reads two datasets** | Evidence synthesis uses the World Model adapter; the scenario analyst uses the PPBE seed. One panel, two sources |
| — | **Lessons 40-45 not in the rulebook** | They exist in `docs/40` §6; `AGENT_REFERENCE.md` runs 1-39 continuous. A third lineage forming. **New this version** |
| — | **Merged SBOM Registry** | Last merge is `SBOM_Registry_v1.44.md` (July 30). Everything since is unmerged — roughly sixty per-session files. **Under the settled convention the next number is v1.83.** The old v1.74/v1.75 drafts are dead. This is a mechanical merge of verbatim source text and must be performed by a Build Agent session against the real files, not authored from summary |

---

## Enforcement layer — new since v5, and now standing

| Tier | Mechanism | State |
|---|---|---|
| 0 | Context gather script | Live. Blocked a paste correctly in Session 113 |
| 1 | `.githooks/pre-commit` | **Live and BLOCKING.** Baselines: `EMITTED_NOT_IN_CONTRACT=4`, `STALE_CONTRACT_HASH_IN_TOOLING=3` |
| 2 | `sovereign_session_verify.sh` v5 | Live. Four invariant checks; caught four real drifts on first run |
| 3 | Periodic orphan and lineage scan | **Not built** |

**Two Tier 1 checks are parked**, not baselined, because their parsers do not measure
the property they name: `EVENTTYPE_NOT_PROPAGATED` (reports 79 of 98; shared-types
likely re-exports rather than restating) and `LOGGER_EVENTS_UNROUTED` (reports 94;
non-dispatch is deliberate design). Activating each is a defined piece of work in
`docs/40` §9.

**Never raise a baseline to make a commit pass.** That is a Project Principal
decision.

---

## Decided, not built — deferred by real decision

| ID | Item | Status |
|---|---|---|
| D3-6 | Module health dots | Deliberately deferred |
| F2 | Shared-helper extraction (seven module-local session stores) | Deferred until after the CTO demonstrations, same reasoning as D4-6 |
| D4-6 | API key architecture (live-tier hosting) | Deliberately deferred |
| — | **Git commit attribution** | **Decided August 12, 2026: left as is.** Commits carry a resolved name and a hostname-derived email. A documented three-layer control exists — `.claude/settings.json` (known non-functional upstream), `CLAUDE.md` §2 as primary control, `.githooks/commit-msg` as backstop. Thirteen historical commits carrying trailers are deliberately preserved rather than rewritten |

---

## Still open, unchanged from v5

| ID | Item |
|---|---|
| WH-51 | SCRIBE's queue-clears-on-send behaviour — real design question, never decided |
| WH-46 | NEXUS Time Record redesign (weekly grid) |
| WH-21 | NEXUS Home tile doesn't reflect the Travel & Time Queue |
| — | VIGIL's broader alert taxonomy (honeytoken / threshold-breach signals) — never directly checked |
| — | GovCloud / R7 — dormant by design, unreachable from products |
| — | Production backend-proxy migration for live API calls |
| — | Site breakdown's fuller funds-lifecycle columns |
| — | STRATA Work Scope §4.3 — Screen 8 extension and Foundry Q&A, drafted twice, never placed |
| — | Program-dataset cross-reference (`SYNTH-PRG-*` vs `P-100`) — requires a Program Manager's domain confirmation |
| — | Per-element schema review UI (Build Spec §4.6) — 4-6 sessions, scoped into Phase 5/6 |

---

*Remaining Build Backlog v6 · August 15, 2026 · Governance Agent*
*Retracts two v5 claims; records Sessions 106-114, GD-42, and the enforcement layer*
*Pre-Decisional · Internal Working Document*
