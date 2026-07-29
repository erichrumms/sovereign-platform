# Session 71 Handoff — SOVEREIGN Platform Build

**Date:** 2026-07-28
**Commits:** 0ab1610 (WH-43) → 38071f2 (WH-34/35/41) → 0748cca (WH-42)
**Branch:** main (pushed)

---

## Completed Work

### WH-43 — Workspace NEXUS Travel badge miscount
- **Root cause:** `publishNexusTravelItems` only counted ROUTED items as "pending." NEXUS's Travel & Time Queue also surfaces ESCALATED items (pending senior-authority decision). Two separate computations for the same set — Rule 11 violation.
- **Fix (nexus-workspace-publisher.ts):** Pending set now includes ROUTED | ESCALATED.
- **Fix (WorkspaceApp.tsx):** When an item transitions to ESCALATED, the decision callback now publishes an updated surface payload (read-only card, no action buttons) rather than removing the entry. APPROVED/DENIED still remove the item as final outcomes.
- **Fix (startup-publish.ts):** Added NEXUS travel items (ROUTED + ESCALATED from seed) at startup, matching the pre-existing VIGIL/ARIA/SCRIBE pattern.
- **Rule 12:** FLOWPATH Review and Activity panels examined — FLOWPATH uses a session store with APPROVED-state check; no ESCALATED equivalent. Same root cause isolated to NEXUS Travel.

### WH-34 / WH-35 / WH-41 — Obligation rate wrong for multi-year programs
- **Root cause (WH-34):** WG-6 (Session 70) expanded `SYNTH_PPBE_PROGRAMS` from 5 entries to 18 (FY2025–FY2028 per program_id). `buildPPBEDashboard` and `publishProgramStatuses` iterated all 18 entries without deduplication. For each entry the denominator was that year's planned amount, but the numerator summed ALL obligations across all years, so the last-written year (FY2028) determined the visible rate — e.g. DELTA showed 338% instead of ~95%.
- **Fix (ppbe-dashboard.ts):**
  - `uniqueByProgramId()`: deduplicates `ProgramRecord[]` by `program_id`, preserving first occurrence (= FY2026/primary entry).
  - `obligationsForYear()`: filters `ObligationRecord[]` to those whose `fiscalYearOfTimestamp(o.timestamp)` matches a given fiscal year.
  - `buildPPBEDashboard` and `publishProgramStatuses` now deduplicate first, then pass year-scoped obligations as the second argument to `obligationRate()`.
- **WH-35 re-verified:** ALPHA FY2026 = 97% → on_track badge correct.
- **WH-41 re-verified:** DELTA FY2026 = 95% → false-positive 338% gone; no longer falsely flagged.
- **Fiscal-year selector default fix (PPBEDashboard.tsx, PPBEProgramDetail.tsx):** Both components hardcoded `useState('FY 2026')`. Changed to lazy initializer: `availableYears.includes('FY 2026') ? 'FY 2026' : (availableYears[0] ?? 'FY 2026')`. Prevents empty render when test fixtures or future data contain no FY2026 entries.
- **Stale test updates:** FY2025 Q4 actuals (OB-A9/OB-B6 added by WG-6) added to `ppbe-data-adapter.test.tsx`; learning velocity updated 13/20 → 15/22 in three assertion sites; obligation timestamp in `PPBEDashboard.test.tsx` corrected to map to FY2027 Q1.

### WH-42 — READ_ONLY sees completely locked Home Dashboard instead of honest empty state
- **Root cause:** `ModuleStatusPanel` in `PlatformHome.tsx` rendered ALL 11 registered modules. For READ_ONLY (only module-lens accessible), 10 rendered as locked rows (opacity 0.55, 🔒, "Requires…"). This is a To Do / Review section, not a module directory — locked entries do not belong here.
- **Fix (PlatformHome.tsx):**
  - Added `const accessibleModules = modules.filter(isAccessible);` before the render pass.
  - Removed the `if (!accessible)` branch entirely — no locked rows are rendered.
  - Added an "No modules are accessible to your current role." empty-state guard for the zero-accessible case.
  - READ_ONLY now sees only LENS (Clear status, no queue items) — an honest empty state.
- **Snapshots:** 4 snapshots updated (PROGRAM_MANAGER/ANALYST/COMPLIANCE_OFFICER/INDEPENDENT_REVIEWER locked rows gone); 1 new READ_ONLY snapshot added asserting no "Requires" or 🔒 text.

---

## D4 — Not started (optional, deferred)

WH-40 (PPBE Workflow Agents panel unresponsive), WH-45 (raw validator text on Travel Request form), WH-39 (Site breakdown column reorder) were listed as optional. D1–D3 completed cleanly; D4 is a clean handoff item for the next session.

---

## Platform-Wide Test Count (re-derived 2026-07-28)

| Package | Tests |
|---|---|
| sovereign-shell | 19 |
| module-apex | 218 |
| sovereign-data | 125 |
| module-counsel | 100 |
| module-scribe | 228 |
| module-lens | 58 |
| module-nexus | 165 |
| module-cpmi | 58 |
| module-vigil | 211 |
| module-flowpath | 151 |
| module-aria | 150 |
| module-workspace | 28 |
| module-agentos | 89 |
| sovereign-api-client | 175 |
| **Total** | **1,775** |

All passing. tsc clean. 5 pre-existing audit findings (unchanged).

---

## Known Flags for Governance Agent

**ECHO 104% / "on-track" narrative mismatch (carried from Session 70)** — ECHO's FY2026 obligation rate is 104% (obligated $458k against $440k plan), yet the `EvaluationFinding` narrative marks it "on-track." The ADA ceiling-exceeded anomaly and the "on-track" finding narrative were authored independently. Resolution requires a governance decision on whether to update the finding narrative or add a suppression note. No fix applied.

**WH-40, WH-45, WH-39 (D4 deferred)** — Three optional walkthrough issues not reached this session. Low severity; none block the current demo path.

---

## TypeScript Status
- sovereign-shell: clean
- module-apex: clean
- sovereign-data: clean (verified during D2)
