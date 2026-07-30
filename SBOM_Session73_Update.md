# SOVEREIGN Platform — SBOM Update Session 73

**Date:** 2026-07-29  
**Session:** 73  
**Commits in scope:** 278e85b, 4102dc9, 484d62e, 29afdea

---

## 1. Files added

| File | Package | Purpose |
|---|---|---|
| _(none)_ | — | No new files added this session |

---

## 2. Files modified

### D1 — WH-26

| File | Change |
|---|---|
| `module-shell/src/ModuleNav.tsx` | Five tooltip label corrections (APEX, ARIA, LENS, NEXUS, SCRIBE) |

### D2 — WH-47

| File | Change |
|---|---|
| `sovereign-data/src/synthetic/ppbe-seed.ts` | SYNTH-EF-D2 and SYNTH-EF-E2 narratives updated; portfolio header comment updated with 203% / 104% facts |

### D3 — WH-44

| File | Change |
|---|---|
| `module-lens/src/orientation-data.ts` | `active_agents` arrays for all six primary products populated with real registered agent IDs |
| `module-lens/tests/orientation-data.test.ts` | Replaced stale empty-agent assertions with three tests verifying real IDs |
| `module-lens/tests/PipelineNavigator.test.tsx` | Updated test to verify real agent IDs are displayed |

### D4 — WH-13

| File | Change |
|---|---|
| `sovereign-data/src/synthetic/tt-seed.ts` | `SYNTH_TT_EMPLOYEES` (16 records, SYNTH-E-101–206) added |
| `sovereign-data/src/index.ts` | `SYNTH_TT_EMPLOYEES` added to public exports |
| `module-scribe/src/TTManagerReview.tsx` | `employeeNames` prop added to `TTManagerReviewProps`; `itemLabel()` updated to surface human names |
| `module-scribe/src/ScribeApp.tsx` | Passes `employeeNames` lookup to `TTManagerReview` |
| `module-scribe/src/tt-synthetic-review.ts` | Draft greetings updated with first names; `SYNTH_TT_EMPLOYEES` referenced in header comment |
| `module-workspace/src/WorkspaceApp.tsx` | `SYNTH_TT_EMPLOYEES` imported; `employeeNames` passed to `TTManagerReview` |

---

## 3. Packages with version impact

No package version bumps taken this session. All changes are additive or corrective with no API-surface removals.

---

## 4. Registered agents — unchanged

44 registered agents. No new registrations, no removals.

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

5 pre-existing vulnerabilities (1 moderate, 4 high) — unchanged from prior session. No new vulnerabilities introduced.
