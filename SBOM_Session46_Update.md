# SOVEREIGN Platform — SBOM Update, Session 46
**Date:** 2026-07-20  
**Session:** 46  
**Feature:** APEX Execution Monitoring — Charts, Selection, Drill-Through, Site Placeholder  
**Commit:** (populated by close protocol)

---

## New Components

| Component | Type | Location | Introduced |
|---|---|---|---|
| `SyntheticSiteBreakdown` | TypeScript interface (exported) | `module-apex/src/ppbe-site-breakdown.ts` | Session 46 — local APEX type, not a governed entity |
| `SYNTH_SITE_BREAKDOWNS` | Readonly array (exported) | `module-apex/src/ppbe-site-breakdown.ts` | Session 46 — 16 synthetic program-site records across 6 sites |
| `DISTINCT_SITE_COUNT` | Exported constant (number) | `module-apex/src/ppbe-site-breakdown.ts` | Session 46 — equals 6; test assertion target |
| `sitesForProgram()` | Exported function | `module-apex/src/ppbe-site-breakdown.ts` | Session 46 — filter sites by program_id or return all |
| `ObligationRateChart` | React component (module-local) | `module-apex/src/PPBEDashboard.tsx` | Session 46 — recharts BarChart for obligation rates |
| `VarianceChart` | React component (module-local) | `module-apex/src/PPBEDashboard.tsx` | Session 46 — recharts grouped BarChart for variance |
| `DependencyHealthTable` | React component (module-local) | `module-apex/src/PPBEDashboard.tsx` | Session 46 — HTML table for healthy/at-risk/failed counts |
| `NarrativeTooltip` | React component (module-local) | `module-apex/src/PPBEDashboard.tsx` | Session 46 — recharts custom tooltip showing narrative prose |
| `SiteBreakdownSection` | React component (module-local) | `module-apex/src/PPBEDashboard.tsx` | Session 46 — placeholder site table with visible disclosure |

---

## Modified Components

| Component | Location | Change |
|---|---|---|
| `PPBEDashboard` | `module-apex/src/PPBEDashboard.tsx` | Added `onSelectProgram` prop; replaced prose renders with chart/table sub-components; added site breakdown section at bottom |
| `PPBEDashboardProps` | `module-apex/src/PPBEDashboard.tsx` | Added `onSelectProgram?: (programId: string) => void` |
| `ApexApp` | `module-apex/src/ApexApp.tsx` | Pass `onSelectProgram={openProgram}` to `<PPBEDashboard>` |
| `module-apex/tests/PPBEDashboard.test.tsx` | Tests | 12 new test cases; 2 existing tests preserved unchanged |
| `module-apex/tests/setup-dom.ts` | Test setup | Added `global.ResizeObserver` no-op mock for recharts |
| `module-apex/package.json` | Package | Added `recharts ^3.9.2` to `dependencies` |

---

## New External Dependency

| Package | Version | License | Scope | Purpose |
|---------|---------|---------|-------|---------|
| `recharts` | ^3.9.2 | MIT | `module-apex` production dependency | SVG chart components (BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend); ships own TypeScript types |

`recharts` is a transitive dependency of `module-apex` only. It is not hoisted to any other module's dependency tree. License is MIT — no compatibility concern with the platform's existing dependency posture.

---

## Removed Components

None. The previous prose-only renders (`{m.narrative}` per program) were replaced with sub-components that retain the narrative text as captions in the DOM — no Gap 5 content was deleted.

---

## Unchanged Modules

All other platform modules are unchanged:
- `sovereign-data` — zero entity changes; `ProgramRecord` field names remain frozen
- `sovereign-shell` — zero changes; shell contract remains v1.18 (GD-23)
- All other module packages — untouched

---

## Shell-Contract Version

No change. v1.18 (Session 44, GD-23). SHA unchanged.

---

## Test Inventory Delta

| File | Before | After | Notes |
|------|--------|-------|-------|
| `module-apex/tests/PPBEDashboard.test.tsx` | 2 tests | 14 tests | +12 for D1–D3 |
| All other test files | unchanged | unchanged | — |
| **Total** | **193 tests** | **205 tests** | All pass |
