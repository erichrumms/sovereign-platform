# SOVEREIGN Platform — SBOM Session Update
## Version 1.87 · August 19, 2026

**Supersedes:** v1.86 (`SBOM_Session117_Update.md`, Session 117). Version derived by scanning
all SBOM files on disk — highest was v1.86 — and adding one.
**Session:** 118 — demonstration-surface repair, F-40 through F-50 (extended rehearsal findings)
plus two addendum investigations (F-41, F-43). Seven fixes built, two report-only findings, two
addendum findings. No shell-contract change, no new agents, no new event type, no architecture
change.
**Build Agent close commit:** (see DOCUMENT_MANIFEST.tsv terminal HEAD row)

---

## 1 — Shell Contract

**v1.28 — unchanged.** Both copies byte-identical, SHA
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`. Confirmed unchanged at open
AND close. No GD raised (next GD remains **GD-43**). No Constraint #11 propagation — no contract
change.

---

## 2 — Agent and Prompt Registry

**Agents: 44 — unchanged.** No new agents. **Prompts: 20 (19 approved + 1 pending) — unchanged.**

---

## 3 — Test Counts

| Suite | Count | Confidence |
|---|---|---|
| JS/TS | 2079 | High — all 15 workspaces run individually this session, every exit code 0 |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2274** | **High** |

**Change from v1.86:** **+16 JS/TS** (2063 → 2079). module-nexus +7 (2 hook return-contract
tests + 3 F-50 form-preservation regression tests in new `TTIntakeForms.test.tsx`, 2 F-49
routing-table tests in new `RequestIntakePanel.test.tsx`); module-apex +7 (2 F-40/F-45
percent-symbol tripwire tests in new `percent-symbol-convention.test.tsx`, 2 F-48 table tests,
3 F-42 program-context tests); sovereign-shell +2 (F-47 bar-colour and overflow-marker tests).
Python unchanged. Count methodology: sum of per-workspace passing counts; the 4 key-gated e2e
live-smoke tests remain skipped and are excluded, same as v1.86.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.** No packages added or removed. Vulnerability posture unchanged.

---

## 5 — Source Changed This Session

| File | Finding | Nature |
|---|---|---|
| `module-nexus/src/useTTIntake.ts` | F-50 | `submitTravel`/`submitTime` return a commit-success boolean (was void) |
| `module-nexus/src/TTIntakeForms.tsx` | F-50 | Both form bodies clear state only on a successful commit |
| `module-nexus/tests/TTIntakeForms.test.tsx` | F-50 | **New file.** 3 form-preservation regression tests |
| `module-nexus/tests/useTTIntake.test.tsx` | F-50 | +2 return-contract tests |
| `module-apex/src/PortfolioDashboard.tsx` | F-40 | "N percent complete" → "N% complete" |
| `module-apex/src/ReportCharts.tsx` | F-45 | Report caption "N percent complete" → "N%" |
| `module-apex/src/synthetic-world-model.ts` | F-45 | All narrative/evidence strings to numeral+% ("N percentage points" → "N points") |
| `module-apex/src/ppbe-dashboard.ts` | F-40/45 | Narrative strings to % |
| `module-apex/src/ppbe-ledger-monitor.ts` | F-40/45 | `threshold_breached` strings to % |
| `module-apex/src/ppbe-scenario-analyst.ts` | F-40/45 | Scenario name/description to % |
| `module-flowpath/src/benchmark-scenarios.ts` | F-40/45 | Scenario prose to % |
| `module-flowpath/src/synthetic-elicitation.ts` | F-40/45 | Vocabulary threshold "8 percent" → "8%" |
| `module-flowpath/src/IndividualWorkstyle.tsx` | F-40/45 | Placeholder "e.g. 5 percent" → "e.g. 5%" |
| `sovereign-data/src/synthetic/staff-seed.ts` | F-40/45 | Baseline-value prose to numeral+% |
| `sovereign-data/src/synthetic/ppbe-seed.ts` | F-40/45 | Baseline-value prose to numeral+% |
| `module-apex/tests/percent-symbol-convention.test.tsx` | F-40/45 | **New file.** Recurrence tripwire (2 tests) |
| six existing test files (apex ×5, flowpath — none needed) | F-40/45 | Assertions updated to the new strings |
| `module-apex/src/PPBEProgramDetail.tsx` | F-48 | Quarterly table/legend "Actual" → "Obligated"; site table reordered Planned → Obligated → Variance → Status with computed Variance column |
| `module-apex/src/PPBEDashboard.tsx` | F-48 (Rule 12) | Same "Actual" → "Obligated" relabel (legend item, bar name, table header) |
| `module-nexus/src/RequestIntakePanel.tsx` | F-49 | TRAVEL_REQUEST + TIME_RECORD rows added to the routing table naming the Travel & Time Queue authority ladder |
| `module-apex/src/ReportGenerationPanel.tsx` | F-42 | New optional `initialProgramId` prop seeds the Program dropdown |
| `module-apex/src/ApexApp.tsx` | F-42 | Passes `selectedProgram` into the report panel |
| `sovereign-shell/src/PlatformHome.tsx` | F-47 | Bar fill keyed to status (badge colour family); striped end marker for >100% obligation |
| `sovereign-shell/tests/shell-nav-snapshots.test.tsx` | F-47 | +2 tests; 4 snapshots updated (diff verified as bar markup only) |

---

## 6 — Items Outstanding for the Project Principal / Governance Agent

1. **F-46 — no defect found in the repository (report-only).** The rehearsal-observed "DOE PPBE
   Reform" and garbled clause exist nowhere in code, git history (`git log -S`), or the loaded
   regulatory-source markdown. See the Session 118 Handoff D1 section for the full evidence and
   the recommended live re-check.
2. **F-41 — all 17 World Model responsible parties are "Program Manager <name>" (report-only).**
   The column-rename decision is the Governance Agent's, per the addendum.
3. **F-43 — "(view source data)" resolves to a real target (report-only, no fix needed).**
4. **F-31 — "Walkthrough B" is a real, tracked process** (docs/13), not a dangling reference.
5. **F-25:** standing structural item — untouched this session per the opening prompt.
6. **`.sovereign_check_baseline`:** untouched (opening-prompt §5 forbids it).

---

*SOVEREIGN Platform — SBOM Session 118 Update v1.87 · August 19, 2026*
*Supersedes v1.86 (Session 117) · Pre-Decisional · Internal Working Document*
