# SOVEREIGN Platform — SBOM Session Update
## Version 1.80 · August 13, 2026

**Supersedes:** v1.79 (Session 111, August 12, 2026)
**Session:** 112 — Governance-record correction and enforcement hardening
**Build Agent close commit:** (see DOCUMENT_MANIFEST.tsv terminal HEAD row)

---

## 1 — Shell Contract

**v1.28 — unchanged.** Both copies byte-identical, SHA
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`.
No GD was raised this session. No shell-contract change.

---

## 2 — Agent and Prompt Registry

**Agents: 44 — unchanged.** No new agents registered.
**Prompts: 20 (19 approved + 1 pending) — unchanged.** No new prompts authored or approved.

---

## 3 — Test Counts

| Suite | Count | Confidence |
|---|---|---|
| JS/TS | 2050 | High — all 15 suites pass; see note on segfault |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2245** | **High** |

Counts are unchanged from v1.79. No new test cases were added; no existing tests were removed.

**Note (test:shell segfault):** The verify script's full suite run recorded test:shell as exit code 139 (Segmentation fault: 11). test:shell was immediately re-run standalone and passed cleanly (20 tests, exit 0). The segfault is transient, not reproducible, and is unrelated to any code change this session. The confirmed JS/TS count is 2050 (14 passing suites @ 2030 + test:shell @ 20 on clean retry). Python 195 confirmed clean.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.** No packages added or removed. Vulnerability posture unchanged from v1.79 (5 vulnerabilities: 1 moderate, 4 high — brace-expansion, esbuild, js-yaml, postcss — all in dev tooling, not runtime surface).

---

## 5 — Changed Components

### AGENT_REFERENCE.md — v3.9 → v3.10

- **D2, Session 112:** Lessons 13-23 imported verbatim from `PROJECT_SUMMARY.md` Part 7 (June 1, 2026), by Project Principal decision of August 13, 2026. The structural gap note (flagged five times, most recently in System Prompt v44) replaced by the content itself.
- Character note recorded: Lessons 1-12 and 24-39 are session-practice lessons from the repo lineage; Lessons 13-23 are platform-design lessons from the project-knowledge lineage. Both lineages hold different lessons at overlapping numbers 1-12 and 24-30 — neither renumbered.
- Version line, Supersedes chain, v3.10 change entry, footer all updated.
- 2,151 lines (v3.9) → 2,212 lines (v3.10). SHA: `02a8fbe2f6881d206fd0f4d464f72f301d5a6a2b105030642db3ca206d11d976`.

### DOCUMENT_MANIFEST.tsv — five SHA corrections (D3)

Session 111's manifest integrity check found four SHA drift entries. All four confirmed genuine on disk; corrected this session. Also updated AGENT_REFERENCE.md row to v3.10. Files themselves were not modified.

| File | Recorded SHA corrected to actual SHA |
|---|---|
| SOVEREIGN_Agent_to_Agent_Briefing.md | `63fa08c2…` → `6fdc2a1f…`; line count 196 → 169 |
| SOVEREIGN_Role_Access_Matrix_20260721.md | `6a60b7ae…` → `e7b66e75…`; line count 118 → 118 |
| 30_Session60_Assessment_Action_Plan.md | `1ff6d6bc…` → `6157baa6…`; line count 133 → 166 |
| 22_Informed_Decision_Making.md | `3f270f3d…` → `1b65810c…`; line count 217 → 259 |
| AGENT_REFERENCE.md | `d11bcf90…` → `02a8fbe2…`; line count 2151 → 2212 |

### docs/40_Defect_Class_Register.md — §10 appended (D4)

98 lines added as §10 ("Session 112 findings"). Five findings recorded: (a) attribution as three-layer control, (b) core.hooksPath per-clone requirement, (c) CLAUDE.md as unconsulted sixth location, (d) T1-4 three-state correction history, (e) Lesson 43 second clause. §9 items 3 and 4 marked closed. 226 lines (v1.0) → 324 lines.

### pull_category3_docs_to_icloud.sh — broken header added (D5)

3 lines prepended marking the script broken and documenting the stale target (Integration Brief v1.57; current is v1.58+). Committed August 13, 2026 via accidental broad `git add -A`. No behavioral change. Project Principal decision required: update target list or remove from git tracking.

### PLACEMENT_LOG.tsv

Row 40 appended: AGENT_REFERENCE.md v3.10 placement (SHA `02a8fbe2…`, August 13, 2026).

---

## 6 — D5 Triage Summary (Report-Only per Opening Prompt Constraint)

Three scripts hold frozen hash expectations that are 12-15 shell-contract versions stale. None is called by any tracked script. Per the opening prompt: "A frozen expectation in a script nobody runs should be deleted, not refreshed, and that is a Project Principal decision." No hashes updated; all three reported for Project Principal action.

| Script | Frozen hash | Contract version frozen at | Last committed |
|---|---|---|---|
| `check_steps_4_5.sh:19` | `db93a631…` | v3.0 (AGENT_REFERENCE.md, July 2026) | 2026-07-18 |
| `preflight_check.sh:56` | `521a62da…` | v1.16 (shell-contract) | 2026-07-13 |
| `gather_repo_integrity_check.sh:27` | `939c2441…` (echo only, not compared) | Session 26 (shell-contract) | 2026-07-11 |

---

## 7 — Governance Documents Placed This Session

| Document | Version | SHA-256 | Lines | Destination |
|---|---|---|---|---|
| AGENT_REFERENCE.md | v3.10 | `02a8fbe2…` | 2212 | repo root + iCloud root + project knowledge |
| SOVEREIGN_Session112_Handoff.md | — | (see manifest close row) | — | repo root |
| SBOM_Session112_Update.md | v1.80 | (this file) | — | repo root |

---

*SOVEREIGN Platform — SBOM Session 112 Update v1.80 · August 13, 2026*
*Supersedes v1.79 (Session 111) · Pre-Decisional · Internal Working Document*
