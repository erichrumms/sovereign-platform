# SOVEREIGN Platform — SBOM Update Session 73 (CORRECTED)

**Date:** 2026-07-29  
**Supersedes:** `SBOM_Session73_Update.md` (committed 6404718)  
**What was wrong in the original SBOM:**

1. The "Files modified — D1" section listed the wrong file path (`module-shell/src/ModuleNav.tsx` — does not exist) and described the change incorrectly ("Five tooltip label corrections (APEX, ARIA, LENS, NEXUS, SCRIBE)"). Actual path: `sovereign-shell/src/navigation/ModuleNav.tsx`. Actual changes: AgentOS, SCRIBE, CPMI provisional-flag removal, ARIA provisional-flag removal, module-workspace entry added.
2. The "Files modified" section omitted `sovereign-shell/src/navigation/__snapshots__/shell-nav-snapshots.test.tsx.snap` (updated in D1) and the two test files changed in D3.
3. Test count section carried the inflated awk-computed number. Corrected below.

---

**Session:** 73  
**Commits in scope:** 278e85b, 4102dc9, 484d62e, 29afdea, 3b78974, 47e5aa6

---

## 1. Files modified

### D1 — WH-26 (commit 278e85b + follow-up 3b78974)

| File | Change |
|---|---|
| `sovereign-shell/src/navigation/ModuleNav.tsx` | AgentOS label/bullets corrected; SCRIBE label changed from "Ghostwrites Your Memos" to "Drafts Your Documents"; CPMI and ARIA provisional comments removed; module-workspace entry added |
| `sovereign-shell/src/navigation/__snapshots__/shell-nav-snapshots.test.tsx.snap` | Snapshot updated to reflect corrected tooltip content |

Follow-up (commit 3b78974):
| File | Change |
|---|---|
| `sovereign-shell/src/navigation/ModuleNav.tsx` | Stale file-level JSDoc comment referencing "Ghostwrites Your Memos is PROVISIONAL" replaced; version bumped to v1.2 |

### D2 — WH-47 (commit 4102dc9)

| File | Change |
|---|---|
| `sovereign-data/src/synthetic/ppbe-seed.ts` | SYNTH-EF-E2 narrative updated (line 702): "Obligations exceeded…" → "FY2026 obligations reached 104 percent of plan…"; SYNTH-EF-D2 narrative updated (line 697): "95 percent" → "1,015K…203 percent"; portfolio header comment corrected |

### D3 — WH-44 (commit 484d62e)

| File | Change |
|---|---|
| `module-lens/src/orientation-data.ts` | `active_agents` arrays populated for all six primary products (33 agent IDs total from registry) |
| `module-lens/tests/orientation-data.test.ts` | 1 test removed ("does not fabricate agent activity inside primary products"), 3 tests added verifying real agent IDs |
| `module-lens/tests/PipelineNavigator.test.tsx` | 1 test replaced ("is honest that no AI agents run…" → "shows real registered agents for a primary product") |

### D4 — WH-13 (commit 29afdea + follow-up 47e5aa6)

| File | Change |
|---|---|
| `sovereign-data/src/synthetic/tt-seed.ts` | `SYNTH_TT_EMPLOYEES` (16 records, SYNTH-E-101–206) added |
| `sovereign-data/src/index.ts` | `SYNTH_TT_EMPLOYEES` added to public exports |
| `module-scribe/src/TTManagerReview.tsx` | `employeeNames?: Record<string, string>` prop added; `itemLabel()` updated |
| `module-scribe/src/ScribeApp.tsx` | Passes `employeeNames` lookup to `TTManagerReview` |
| `module-scribe/src/tt-synthetic-review.ts` | Draft greetings updated with first names (Marcus, Sarah, James, Patricia) |
| `module-workspace/src/WorkspaceApp.tsx` | `SYNTH_TT_EMPLOYEES` imported; `employeeNames` passed to `TTManagerReview` |

Follow-up (commit 47e5aa6):
| File | Change |
|---|---|
| `module-scribe/tests/tt-manager-review.test.tsx` | 2 tests added: `employeeNames` name-resolution path and backward-compatible fallback |

---

## 2. Test count correction

**Original SBOM claimed:** +6 tests, 1,785 passed. Both wrong — the awk command counted 4 e2e-skipped tests as JS/TS passing.

**Corrected counts (per-package individual runs, all passing):**

| Package | Before (S72) | After (S73) |
|---|---|---|
| sovereign-data | 125 | 125 |
| sovereign-api-client | 175 | 175 |
| sovereign-shell | 19 | 19 |
| module-counsel | 100 | 100 |
| module-scribe | 228 | 230 |
| module-vigil | 211 | 211 |
| module-lens | 58 | 60 |
| module-cpmi | 58 | 58 |
| module-agentos | 89 | 89 |
| module-nexus | 166 | 166 |
| module-apex | 221 | 221 |
| module-flowpath | 151 | 151 |
| module-aria | 150 | 150 |
| module-workspace | 28 | 28 |
| **Total JS/TS** | **1,779** | **1,783** |

Net: +4 test functions (module-lens +2 net, module-scribe +2). Additionally, 5 previously-failing sovereign-shell snapshot tests and 2 previously-failing module-lens tests now pass (total: +7 previously-failing tests now green). Grand passing total: 1,783 + 149 e2e + 195 Python = **2,127** — unchanged from Session 72's confirmed baseline (S72's failures are now fixed).

Note: The Session 72 Handoff's 1,779 was computed by the per-package method (correct) but included sovereign-shell's 19 total (14 pass + 5 fail) without catching the 5 failures. The 5 failures were pre-existing at Session 72 close. Session 73's D1 fixed them.

---

## 3. Packages with version impact

No package version bumps taken this session. All changes are additive or corrective.

---

## 4. Registered agents — unchanged

44 registered agents. No new registrations, no removals. Open item: `tt.escalation-monitor` (registered "VIGIL / NEXUS infrastructure") may belong in NEXUS's Pipeline Navigator `active_agents` — flagged for Governance Agent resolution.

---

## 5. Approved prompts — unchanged

20 approved prompts. No new approvals, no removals.

---

## 6. Shell contract — unchanged

v1.23. Both copies SHA-256: `6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`

---

## 7. Dependency changes

None. No new npm packages added or removed.

---

## 8. Audit posture

5 pre-existing vulnerabilities (1 moderate, 4 high). Packages: brace-expansion (×2 high), esbuild (moderate), js-yaml (×2 high), postcss (high). Unchanged from prior session. No new vulnerabilities.
