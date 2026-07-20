# SOVEREIGN Platform — Session 46 Handoff
**Date:** 2026-07-20  
**Session:** 46  
**Feature:** APEX Execution Monitoring — Charts, Selection, Drill-Through, Site Placeholder  
**Shell-contract version:** no change (v1.18 from Session 44, GD-23)  
**Commit:** (populated by close protocol)

---

## Done-Condition Traceability

| Done Condition | Status | Evidence |
|---|---|---|
| D1 — Three metric sections converted to Recharts visualizations | DONE | `PPBEDashboard.tsx`: `ObligationRateChart`, `VarianceChart`, `DependencyHealthTable` — tests D1-* pass |
| D2 — Program selection wired to existing `openProgram` infrastructure | DONE | `ApexApp.tsx` passes `onSelectProgram={openProgram}`; accessible row buttons call it — test D2-* pass |
| D3 — Per-site breakdown view, visibly disclosed as placeholder | DONE | `SiteBreakdownSection` in `PPBEDashboard.tsx`; `StatusNotice` disclosure visible on screen — tests D3-* pass |
| D4 — Handoff documents real site-schema governance requirement | DONE | See item D4 below |

---

## D1 — Chart Details

### Obligation rate — BarChart

One bar per program, height = `rate_percent` (0–100), colored by `statusFromObligationRate()`:

| Status | Color | Threshold |
|--------|-------|-----------|
| on_track | #059669 (emerald) | ≥ 80% |
| at_risk | #d97706 (amber) | ≥ 50%, < 80% |
| off_track | #dc2626 (red) | < 50% or null |

`statusFromObligationRate()` is reused exactly as found — same function as GD-23's ProgramStatusSurface publisher. No second threshold rule was invented (Constraint #2).

The chart bar itself fires `Bar.onClick` → `onSelectProgram(program_id)` for mouse users. An accessible row-button layer below the chart provides the same action for keyboard and screen-reader users and serves as the test anchor (recharts SVG click cannot be reliably asserted in jsdom).

**Narrative text** (Gap 5): each program's prose narrative is kept in the DOM as a caption below the chart — it was not deleted or hidden.

### Budget-to-actual variance — grouped BarChart

X axis: `{programId_short} {quarter}` (e.g., "ALPHA Q3"). Two bars per entry: planned (slate) and actual (navy). Ten entries total (5 programs × 2 periods from the seeded data). Narrative captions below the chart; tooltips on hover.

### Dependency health — count table (not a chart)

**Reasoning for table over chart:** Dependency health has exactly three aggregate counts (healthy, at-risk, failed) with no temporal or per-program dimension. A chart (bar or pie) would add visual complexity without adding insight — the three numbers are instantly legible as table rows. The narrative prose below provides the Gap 5 plain-language explanation. This is the same judgment applied to `MilestoneCount` in `ReportCharts.tsx`.

---

## D2 — Program Selection

`ApexApp.tsx` now passes `onSelectProgram={openProgram}` to `<PPBEDashboard>`. `openProgram` is the existing function (line 58–61 of `ApexApp.tsx`):

```ts
const openProgram = (programId: string): void => {
  setSelectedProgram(programId);
  setTab("detail");
};
```

No new state, no new navigation mechanism. The existing `selectedProgram` / `setTab("detail")` path is reused exactly (session prompt §2 requirement).

In `PPBEDashboard`, each program in the obligation-rate section gets a row button (`aria-label="View detail for {program name}"`). Clicking calls `onSelectProgram(program_id)`. The buttons only render when `onSelectProgram` is provided — they are absent (not hidden) when the prop is omitted (e.g., in isolated dashboard tests without navigation context).

---

## D3 — Per-Site Breakdown

### Local type

`SyntheticSiteBreakdown` in `module-apex/src/ppbe-site-breakdown.ts`. **Not in `sovereign-data`**. Does not extend `ProgramRecord` or any governed entity. The file header explicitly states its APEX-internal scope and the governance requirement for real data.

### Six distinct physical sites, variable participation

| Program | Participation | Sites |
|---------|--------------|-------|
| SYNTH-PRG-ALPHA (Logistics Data Interchange Modernization) | **All 6 sites** | Aberdeen, Fort Bragg, Tobyhanna, Pentagon, Corpus Christi, Letterkenny |
| SYNTH-PRG-ECHO (Depot Scheduling Pilot) | **4 sites** | Aberdeen, Fort Bragg, Tobyhanna, Corpus Christi |
| SYNTH-PRG-DELTA (Legacy Sustainment Consolidation) | **3 sites** | Fort Bragg, Corpus Christi, Letterkenny |
| SYNTH-PRG-CHARLIE (Cyber Resilience Retrofit) | **2 sites** | Pentagon, Tobyhanna |
| SYNTH-PRG-BRAVO (Supply Chain Telemetry) | **1 site** | Aberdeen only |

This produces 16 program-site records (6+4+3+2+1) across 6 distinct physical locations. `DISTINCT_SITE_COUNT` (an exported constant) equals 6 and is asserted in tests.

### Placeholder disclosure (required, not optional)

The site breakdown section renders a `<StatusNotice>` (amber, Category 1) that reads:

> **Placeholder data.** Site-level data is illustrative — a real site-tracking schema has not yet been added to the program data dictionary. A governance decision (data-dictionary approval) is required before live site data can be wired here. See Session 46 handoff item D4.

This is visible in the rendered UI. It is not a code comment. Test `D3: visible placeholder disclosure is present in the UI` verifies it is in the DOM.

---

## D4 — Real Next Step for Site Tracking

**Extending `ProgramRecord` (or adding a separate `SiteRecord` entity) for real site tracking is a genuine data-dictionary decision, not a follow-up build task.**

`ProgramRecord`'s own file header states: *"Field names are frozen by the SOVEREIGN data dictionary"* (D-P3, D-P7 approvals cited). A `site_ids` or `sites` field on `ProgramRecord` — or a new `SiteRecord` entity with a `program_id` foreign key — requires its own explicit governance approval before any future session wires real data into what D3 built as a stub.

The `SyntheticSiteBreakdown` type in `ppbe-site-breakdown.ts` is intentionally local-to-APEX and is NOT a provisional data-dictionary entry. The governance path is: propose schema → approval decision → sovereign-data entity extension → replace the synthetic adapter.

---

## New Dependency

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| `recharts` | ^3.9.2 | MIT | React-native SVG chart components (BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend) |

Added to `module-apex/package.json` `dependencies`. No wrapper layer. `recharts` ships its own TypeScript types; no `@types/recharts` needed.

**ResizeObserver mock** added to `module-apex/tests/setup-dom.ts` — jsdom does not implement `ResizeObserver`, which recharts uses internally. Mock is a no-op stub (`observe/unobserve/disconnect` do nothing).

---

## Test Results

```
Test Suites: 24 passed, 24 total
Tests:       205 passed, 205 total  (+12 vs. Session 45 baseline of 193)
```

New tests added to `PPBEDashboard.test.tsx`:
- D1: obligation rate chart container present
- D1: variance chart container present
- D1: dependency health renders as table with correct headers
- D2: program button rendered when onSelectProgram provided
- D2: button click calls onSelectProgram with correct program_id
- D2: no buttons when onSelectProgram not provided
- D3: per-site breakdown section heading present
- D3: placeholder disclosure visible in DOM
- D3: site breakdown table present with correct columns
- D3: site name renders (Aberdeen Proving Ground, shared across programs)
- D3: exactly six distinct sites in dataset (DISTINCT_SITE_COUNT === 6)
- D3: participation varies — one program with 6, one with 1, others in between

---

## Files Changed

| File | Change |
|------|--------|
| `module-apex/src/PPBEDashboard.tsx` | Replaced prose sections with charts; added `onSelectProgram` prop; added site breakdown section; added recharts imports |
| `module-apex/src/ppbe-site-breakdown.ts` | New — local APEX site-breakdown type and synthetic data (6 sites, 5 programs, variable participation) |
| `module-apex/src/ApexApp.tsx` | Pass `onSelectProgram={openProgram}` to `<PPBEDashboard>` |
| `module-apex/tests/PPBEDashboard.test.tsx` | Added 12 new tests for D1–D3; existing 2 tests preserved |
| `module-apex/tests/setup-dom.ts` | Added `global.ResizeObserver` mock for recharts |
| `module-apex/package.json` | Added `recharts ^3.9.2` to dependencies |

`sovereign-data` entities: **zero changes**. Shell contract: **zero changes**. No other module touched.

---

## What Session 47 Should Know

- The site breakdown is fully wired to the six synthetic sites. Any extension to real site data requires governance approval per D4 above.
- The `DISTINCT_SITE_COUNT` export from `ppbe-site-breakdown.ts` is available as a test assertion target — future sessions extending the synthetic dataset should update it.
- The `SyntheticSiteBreakdown` type has a `status` field derived by the same thresholds as `statusFromObligationRate` — if those thresholds ever change (unlikely, governed), the site status derivation in `ppbe-site-breakdown.ts::siteStatus()` should be kept in sync.
- `PPBEDashboard` now accepts an optional `onSelectProgram` prop. It is safe to render without it (the accessible row buttons simply don't appear).
