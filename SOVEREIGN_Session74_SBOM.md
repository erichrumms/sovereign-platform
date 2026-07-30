# SOVEREIGN Platform — Session 74 SBOM
**Date:** 2026-07-29
**Session:** 74
**Type:** Feature / Fix — D1 (WH-38), D2 (WH-15), D3 (WH-37), D4 (D3-6 investigation)

---

## Files Changed This Session

| File | Change type | Commit | Purpose |
|------|-------------|--------|---------|
| `module-apex/src/PPBEProgramDetail.tsx` | Modified | `793fb69`, `6ed5c27` | D1: replace variance history table with recharts LineChart; D3: gate execution metrics for BY/BY+1 |
| `module-apex/tests/PPBEProgramDetail.test.tsx` | Modified | `793fb69`, `6ed5c27` | D1: update variance chart assertion; D3: add 3 BY/BY+1 planning-notice tests, shift fixture to FY2026 |
| `module-scribe/src/PPBEExhibitPanel.tsx` | Modified | `39f195f` | D2: replace figure `<ul>` with accessible table; add `aggregateByCostCode()` and inline SVG `CostCodeBarChart` |
| `module-scribe/tests/PPBEExhibitPanel.test.tsx` | Modified | `39f195f` | D2: add 2 tests for figures table and cost-code bar chart |
| `module-apex/src/PPBEDashboard.tsx` | Modified | `6ed5c27` | D3: gate obligation-rate and variance sections for BY/BY+1 |
| `module-apex/tests/PPBEDashboard.test.tsx` | Modified | `6ed5c27` | D3: add 2 BY/BY+1 planning-notice tests, shift fixture to FY2026 |
| `SOVEREIGN_Session74_Handoff.md` | New | (docs commit) | Session 74 handoff |
| `SOVEREIGN_Session74_SBOM.md` | New | (docs commit) | This file |

---

## Files Read This Session

### APEX Module
| File | Purpose |
|------|---------|
| `module-apex/src/PPBEProgramDetail.tsx` | D1: locate variance history table; D3: trace BY/BY+1 execution metric rendering |
| `module-apex/src/PPBEDashboard.tsx` | D3: trace BY/BY+1 execution metric rendering in dashboard |
| `module-apex/src/banners.tsx` | D3: verify `StatusNotice` export for import in PPBEProgramDetail |
| `module-apex/tests/PPBEProgramDetail.test.tsx` | D1/D3: understand fixture structure before updating |
| `module-apex/tests/PPBEDashboard.test.tsx` | D3: understand fixture structure before updating |
| `module-apex/package.json` | D1: confirm `recharts` is already a dependency (^3.9.2) |

### SCRIBE Module
| File | Purpose |
|------|---------|
| `module-scribe/src/PPBEExhibitPanel.tsx` | D2: read current figure list implementation (`<ul>/<li>`) |
| `module-scribe/tests/PPBEExhibitPanel.test.tsx` | D2: understand existing test coverage before adding |
| `module-scribe/package.json` | D2: confirm no charting library present; decided inline SVG |

### Shell / Shared
| File | Purpose |
|------|---------|
| `sovereign-shell/src/navigation/ModuleNav.tsx` | D4: locate `HealthDot` component and `m.lastHealth?.status` read |
| `sovereign-shell/src/module-loader/index.ts` | D4: locate `startHealthPolling()`, `pollModule()`, `list()` |
| `sovereign-shell/src/main.tsx` | D4: trace `forceRender()` call sites; confirm polling never started |
| `sovereign-shell/shell-contract.ts` | Session gate: SHA-256 verification |
| `sovereign-shell/src/format-currency.ts` | D2: confirm `formatCurrency` export for cross-package import |

### Data Contracts
| File | Purpose |
|------|---------|
| `sovereign-data/src/ppbe-exhibit-contract.ts` | D2: confirm `ExhibitFigure` fields (label, value, source_workflow_step_id — no cost_code) |
| `sovereign-data/src/index.ts` | D2: confirm `ObligationRecord` export includes `cost_code` and `amount` |

---

## New Items Introduced

### New Functions
| Function | File | Purpose |
|----------|------|---------|
| `aggregateByCostCode()` | `module-scribe/src/PPBEExhibitPanel.tsx` | Groups `ObligationRecord[]` by `cost_code`, returns sorted `{code, total}[]` |
| `CostCodeBarChart` | `module-scribe/src/PPBEExhibitPanel.tsx` | Inline SVG horizontal bar chart, no external charting library |

### Logic / Flags Added
| Item | File | Purpose |
|------|------|---------|
| `isBudgetYear` flag | `module-apex/src/PPBEDashboard.tsx` | Gates execution metric sections for FY2027/FY2028 |
| `isBudgetYear` flag | `module-apex/src/PPBEProgramDetail.tsx` | Gates execution metric sections for FY2027/FY2028 |

### New Imports
| Import | Target File | Origin |
|--------|-------------|--------|
| `ObligationRecord` | `module-scribe/src/PPBEExhibitPanel.tsx` | `@sovereign/data` (existing dep) |
| `formatCurrency` | `module-scribe/src/PPBEExhibitPanel.tsx` | `../../sovereign-shell/src/format-currency` |
| `JSX` | `module-scribe/src/PPBEExhibitPanel.tsx` | `react` (existing dep) |
| `StatusNotice` | `module-apex/src/PPBEProgramDetail.tsx` | `./banners` (existing, same package) |

---

## Dependency Audit

**New production dependencies added this session: 0**

| Package | Assessment |
|---------|------------|
| `recharts` | Already in `module-apex/package.json` (^3.9.2). Used for D1 LineChart — no version change. |
| Charting in `module-scribe` | Inline SVG used. No charting library added to module-scribe. |

**Running no-new-dependency streak:** zero new production dependencies across Sessions 62–74, confirmed.

---

## Session Metrics

| Metric | Value |
|--------|-------|
| Commits | 3 code + 1 docs = 4 total |
| Source files changed | 6 |
| New JS/TS tests | +7 (D2: 2, D3: 5) |
| New production dependencies | 0 |
| Shell contract version | v1.23 (unchanged) |
| Shell contract SHA-256 | `6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9` (both copies verified) |
| JS/TS tests passing | 1,791 (per-package) |
| e2e tests passing | 149 (4 skipped) |
| Python tests passing | 195 |
| Grand total passing | 2,135 |
| tsc | Clean — all 14 source workspaces |
| npm audit vulnerabilities | 5 (1 moderate, 4 high) — all pre-existing |
| WH findings opened | 0 |
| WH findings closed | WH-38, WH-15, WH-37 (all implemented) |
| GDs required | D3-6 (module health dots — Stage 2 design decision) |
