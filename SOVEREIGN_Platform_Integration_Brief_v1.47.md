# SOVEREIGN Platform Integration Brief
## Version 1.47 | July 18, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.46
**Changed this version:** Absorbs everything between v1.46 (July 14) and now:
Walkthrough F ran (12 findings); Session 38's 5-part response including the
WF-10 placeholder-prompt defect and same-day fix (`12cb626`); and a full
Governance Agent orientation-and-reconciliation pass (July 17-18) that
independently re-verified repo state, completed the SBOM lineage through
v1.40, discovered and documented two divergent AGENT_REFERENCE lineages,
located Lesson 13, and corrected several of its own initial errors along
the way. §11, §13, §14 substantially rewritten; Lesson 23 added.

---

## §1-§10 — unchanged, see v1.45

---

## §11 — Current Build Status

**HEAD as of this Brief:** `ca0e1c9` (July 18), verified against
`origin/main` directly via clone. Full commit chain this period:
`1e08b9c` (Session Findings Note + verification scripts) →
`3352780`/`c6514b5` (SBOM audit placement, later superseded) →
`0febc35`/`671f063` (AGENT_REFERENCE manifest corrections) →
`33c5455` (v1.40 manifest) → `6b0c707` (repo SBOM artifact removed,
Lesson 13) → `1e0023d` (Brief v1.47 + docs/18 v1.1 + AGENT_REFERENCE
Unified v3.0 placed; lineage-merge and prompt-deviation decisions
recorded) → `c023baf` (45 root files → iCloud For Disposal) → `9ba5fde`
(verification script committed) → `ca0e1c9` (stray .docx → For Disposal).

**Test count: RESOLVED at 1923** (1728 JS/TS + 195 Python), independently
re-derived July 17 — all 13 workspace suites run individually with real
exit codes, per-workspace counts summed by hand; Python run live, not
collect-only. Exactly matches the Session 38 PromptFix update's own claim:
two independent derivations, hours apart, identical result.

**Walkthrough F: ran since v1.46; repeat pass still not run.** 12 findings;
Session 38 addressed most. Part 2's placeholder-prompt defect was caught,
honestly reported, and fixed same-day (`12cb626` — commit verified, diff
matches its message). Parts 1, 3, 5 and the WF-11 original card types
remain unverified live. The repeat pass (Priorities 1-5, per
`SOVEREIGN_Walkthrough_F_Complete.md` §4) is the actual next step and has
been since July 17.

**Shell contract v1.16: triple-confirmed** — Session 28 governance record,
ten subsequent sessions' open/close checks, and a live `sha256sum` July 17,
all agreeing on `521a62da…b7b4fd5fb7`, both synced copies identical.

**Verification tooling now exists and is committed:**
`sovereign_session_verify.sh`, `sovereign_platform_map.sh`, and
`repo_integrity_check.sh` (bash 3.2 compatible) — all at the repo root, all
read-only, run at session open and at milestone close per the
AGENT_REFERENCE Unified v3.0 trigger discipline.

---

## §13 — Open Governance Items

**CLOSED this version:**
- Test count re-verification — resolved at 1923 (§11).
- `lens-orientation` prompt question — resolved as a documentation defect:
  the agent is real, working, and intentionally non-LLM (static Pipeline
  Navigator); the registry's "Orientation Dialogue Agent / LLM-Backed: Yes"
  description is what's wrong. Documented in the Agent Identity Standard's
  Session Findings Note (committed, `1e08b9c`).
- Commit-status uncertainty on the Session Findings Note and scripts —
  confirmed pushed.
- Session 38 + PromptFix SBOM processing — complete: official lineage
  extended to v1.40 (iCloud, Lesson 13 compliant), placed via
  `place_governance_doc.sh` with checksum MATCH, manifest verified.
- Walkthrough F document naming — confirmed with the Project Principal:
  `SOVEREIGN_Walkthrough_F_Complete.md` is the single compiled source; the
  two standalone filenames never existed as committed files.
- `docs/18` filename question — resolved, and it inverted: the repo copy is
  **stale v1.0** (July 11); a corrected **v1.1** (July 13, "corrected
  against actual build results") exists and was never placed. Now an open
  placement item below.
- SBOM merge-gap narrative — **corrected**: the "19 files never merged"
  conclusion was wrong; a continuous iCloud lineage (v1.8→v1.39) existed
  per Lesson 13, invisible to repo-only checks. See Lesson 23.

**NEW / UPDATED this version:**

| Item | Detail | Target |
|---|---|---|
| Walkthrough F repeat pass | Priorities 1-5, still the critical path | Next live session |
| ~~Place docs/18 v1.1~~ | **DONE, commit `1e0023d`.** Repo now holds v1.1 (417 lines, `844c23f2…`), replacing stale v1.0 | Closed |
| AGENT_REFERENCE lineage reconciliation | **DECIDED July 18 (Project Principal): MERGE.** Unified v3.0 produced — Part I = full repo lineage (Lessons 1-12, SOVEREIGN sections, unchanged), Part II = project lineage (Rules 1-10, techniques). One canonical document for repo, iCloud root, and project knowledge | Place v3.0 in all three locations |
| AGENT_REFERENCE v3.0 counter value | Both v2.0 and now v3.0 were assigned as stated assumptions continuing from v2.0; the ORIGINAL prior internal counter value (from before the repo/project lineages diverged, pre-June 26) was never recovered | Renumber v3.0 if that original value is known |
| Prompt Approval Record mechanism | **DECIDED July 18 (Project Principal): logged as a one-time deviation.** The `33495da` in-header approval stands as the record for these four prompts; the documented Approval Record process remains the standard going forward. **Monitoring condition: watch the four PPBE prompts' behavior through the Walkthrough F repeat pass — any prompt-content issue found there reopens this decision** | Monitor through Walkthrough F |
| ~~`lens-orientation` table correction~~ | **DONE.** Table entry directly edited (Agent Class, LLM-Backed field, Status, Description, prompt requirement) — file rebuilt at 1537 lines, hash `e5e207e8…`. **Not yet committed to repo** — the repo still holds the pre-fix 1527-line version (hash `a1f0f0d0…`) as of `ca0e1c9`; placement is a queued action, not yet run | Awaiting placement |
| SBOM audit errata | Four findings preserved in v1.40 §5 (Session 23 e2e undercount; Session 30 false-alarm; approval trace; api-client 174→175 untraced) | Recorded; no action required |
| ~~Dispose superseded iCloud SBOMs~~ | **DONE.** v1.38, v1.39, and the pre-Lesson-13 v1.8_MERGED all confirmed present in iCloud For Disposal (verified via `check_steps_4_5.sh`) | Closed |

**NEW, still open — documents built and verified, not yet committed:**
an updated `SOVEREIGN_Agent_to_Agent_Briefing.md` (was stale since July
14), and `SOVEREIGN_Walkthrough_F_Complete.md` (discovered to have never
been placed anywhere durable — existed only as a chat upload). Both are
queued for the same placement flow as everything else this period.

**DONE this version, not carried forward further:** root cleanup (45
files + 1 stray .docx, commits `c023baf`/`ca0e1c9`) — previously listed
as an optional ~37-file item, now closed at a higher actual count.

**UNCHANGED, genuinely carried forward:** exhibit-drafter validation
failure; Agent_Identity_Standard TT Status fields + terminology fix; PPBE
`max_tokens` host wiring; `docs/16` WF-12 corrections; WF-2, WF-6, WF-8
governance decisions (best decided live during the repeat pass);
ARIA-EXPORT-GD and F-2/F-3 (surfaced in SBOM/prompt-registry history,
still open).

---

## §14 — SBOM Status

**The official lineage is current through Session 38 + PromptFix:**
`SBOM_Registry_v1.40.md` (115 lines, `a417d2c8…fef82f2`), placed in iCloud
Governance July 18 via the checksum-verified placement flow, manifest row
confirmed. Lineage: v1.8 → … → v1.37 → v1.38 → v1.39 → **v1.40**, iCloud
archival only per Lesson 13 (Brief lineage, established June 30, first in
v1.37) — never committed to git. The July 17 repo-committed merge artifact
was an independent from-source audit of all 29 session updates; its
endpoint matched the official lineage exactly, its four errata are
preserved in v1.40 §5, and the artifact itself was removed from the repo
(`6b0c707`) with full content retained in git history at `3352780`.

## §15-§17 — unchanged from v1.45

---

## §18 — Agent and Prompt Registry

44 agents (most-reverified number in the project: direct file counts at
seven consecutive session opens/closes plus tonight's check). 20 prompts =
19 approved + 1 pending (PR-SCRIBE-004); the four PPBE approvals traceable
to `33495da`. Eight registered prompt *paths* remain stale-but-harmless
naming drift (documented in the Findings Note); `lens-orientation` table
correction pending.

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.45 | July 13 | Session 35 closed; cross-module fix; smoke harness |
| v1.46 | July 14 | PPBE live smoke CLOSED; model identifier standardized; terminology scrub |
| **v1.47** | **July 18** | **Walkthrough F + Session 38 absorbed; orientation pass: test count re-derived (1923), SBOM lineage completed to v1.40 and repo brought Lesson-13 compliant; two AGENT_REFERENCE lineages merged into Unified v3.0 per Project Principal decision; `lens-orientation` table corrected directly; docs/18 updated to v1.1; Lesson 13 located; Lesson 23 added; root cleanup completed (46 files)** |

---

## §20 — Full Build Roadmap

| Item | Depends on |
|---|---|
| Walkthrough F repeat pass, Priorities 1-5 | Nothing — the critical path |
| ~~Place docs/18 v1.1~~ | Done, commit `1e0023d` |
| Resume Walkthrough F remaining steps (A3, A5, A6, Part B) | Priorities 1-2 holding |
| Full rehearsal | Walkthrough F fully closed |
| Demo-ready | Rehearsal clean |

---

## §21 — CTO Demo Readiness Track

Critical path unchanged: repeat pass → remaining steps → rehearsal →
demo-ready. Repo-state confidence is now as strong as it has ever been —
every headline number independently re-derived, every governance document
reconciled or its gap named. What remains unverified is exactly what only
a live click-through can verify: the UI behavior Session 38 claims to have
fixed. "Demo-ready" becomes an honest description only after the repeat
pass says so.

---

## Key Lessons — Current

Lessons 13-21: see prior Brief versions. Lesson 22 (verification tooling
is not exempt from the discipline it enforces): established July 17,
unchanged.

**Lesson 23 — absence in one storage location is not absence; check every
documented location before concluding an artifact doesn't exist.**
Established July 18. The project stores artifacts in three places — the
repo, iCloud (per Lesson 13, some types iCloud-*only*), and project
knowledge — and the manifest records which. A July 17 analysis concluded
from repo-only evidence (`git log`, `ls`, `find`) that no SBOM merge had
occurred since Session 17 and that a claimed v1.39 had "no supporting
commit anywhere." Both conclusions were wrong: a continuous, properly
maintained merge lineage existed in iCloud the entire time, exactly where
Lesson 13 and the File Location Reference said it would be — locations the
analysis never checked despite both documents being in its own context.
Cost: a full 29-file reconstruction of an already-solved merge (salvaged
as an audit, but unplanned) and several confidently wrong statements
requiring correction. The rule: before declaring an artifact missing,
stale, or never-created, enumerate every storage location the governance
documents define and check each one — a conclusion drawn from one location
is a conclusion about that location only.

---

*SOVEREIGN Platform Integration Brief v1.47 · July 18, 2026*
*Pre-Decisional · Internal Working Document*
