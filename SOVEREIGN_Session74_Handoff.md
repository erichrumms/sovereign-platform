# SOVEREIGN Platform — Session 74 Handoff

**Date:** 2026-07-29  
**Prior HEAD at close:** `6ed5c27` (WH-37 BY/BY+1 gating)  
**Prior HEAD at open:** `3600641` (docs: Integration Brief v1.53, Findings Log Addendum 3)  
**Shell contract:** v1.23 · SHA-256 `6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9` · both copies verified identical, unchanged

---

## Deliverables

### D1 — WH-38: Replace variance history table with line chart (APEX)

**Commit:** `793fb69`  
**Files:** `module-apex/src/PPBEProgramDetail.tsx`, `module-apex/tests/PPBEProgramDetail.test.tsx`

**What changed (from `git show --stat 793fb69`):**
```
module-apex/src/PPBEProgramDetail.tsx        | 71 ++++++++++++++++------------
module-apex/tests/PPBEProgramDetail.test.tsx |  9 ++--
2 files changed, 46 insertions(+), 34 deletions(-)
```

The "Budget-to-actual variance history" section in `PPBEProgramDetail.tsx` was a four-column HTML table (Period / Planned / Actual / Variance). Replaced with a `recharts` `LineChart`: X-axis carries `period` labels, Y-axis formats dollar amounts via `formatCurrency`, two series: Planned (`#94a3b8`) and Actual (`#0c4a6e`). The `<Tooltip>` formatter handles `ValueType | undefined` to satisfy recharts' contravariant type. Gap 5 narrative captions remain below the chart in the DOM, unchanged.

**Dependency audit:** `recharts` was already in `module-apex/package.json` (version `^3.9.2`). No new library introduced. Zero-new-dependencies record preserved.

**Test change:** The test previously checked `getByText("FY 2027 Q1")` against table cells. Updated to `getByText(/FY 2027 Q1/)` matching the narrative caption text, plus a chart `aria-label` assertion. All 221 module-apex tests passed after this commit (D3 later added 5 more for 226 total).

---

### D2 — WH-15: PPBE exhibit figures table and cost-code bar chart (SCRIBE)

**Commit:** `39f195f`  
**Files:** `module-scribe/src/PPBEExhibitPanel.tsx`, `module-scribe/tests/PPBEExhibitPanel.test.tsx`

**What changed (from `git show --stat 39f195f`):**
```
module-scribe/src/PPBEExhibitPanel.tsx        | 147 +++++++++++++++++++++++---
module-scribe/tests/PPBEExhibitPanel.test.tsx |  25 +++++
2 files changed, 160 insertions(+), 12 deletions(-)
```

**Part (a) — Figures table:** The `<ul>/<li>` figure list was replaced with a `<table aria-label="Exhibit figures">` with three columns: Label, Value (formatted via `formatCurrency`), and Source (`source_workflow_step_id`). Styles added: `figureTableStyle`, `figThStyle`, `figTdStyle`. Removed: `figureListStyle`, `figureItemStyle`.

**Part (b) — Cost-code bar chart:** Added `aggregateByCostCode()` pure function that groups `ObligationRecord[]` by `cost_code`, summing `amount`. Added `CostCodeBarChart` component rendering an inline SVG horizontal bar chart (label column, proportional bars in `#0c4a6e`, value text). Chart renders inside the outcome block whenever `DEMO_OBLIGATIONS.length > 0`. `formatCurrency` imported from `sovereign-shell/src/format-currency` (same cross-package relative import already used in the panel for `SovereignShellContext`).

**Dependency audit:** `module-scribe/package.json` has no charting library. Chose inline SVG (no new dependency) rather than adding recharts to module-scribe. `ObligationRecord` type imported from `@sovereign/data` (already a dependency). No new production dependencies added — zero-new-dependencies record preserved.

**Tests added:** Two new assertions in `PPBEExhibitPanel.test.tsx`:
- `getByRole("table", { name: "Exhibit figures" })` — verifies table is present
- `getByRole("img", { name: "Obligations by cost code bar chart" })` — verifies chart is present
- `queryByRole("list")` not in DOM — verifies old `<ul>` is gone

232 module-scribe tests pass.

---

### D3 — WH-37: Gate BY/BY+1 execution metrics in PPBEDashboard and PPBEProgramDetail

**Commit:** `6ed5c27`  
**Files:** `module-apex/src/PPBEDashboard.tsx`, `module-apex/src/PPBEProgramDetail.tsx`, `module-apex/tests/PPBEDashboard.test.tsx`, `module-apex/tests/PPBEProgramDetail.test.tsx`

**What changed (from `git show --stat 6ed5c27`):**
```
module-apex/src/PPBEDashboard.tsx            |  19 +++-
module-apex/src/PPBEProgramDetail.tsx        | 158 +++++++++++++++------------
module-apex/tests/PPBEDashboard.test.tsx     |  53 ++++++++-
module-apex/tests/PPBEProgramDetail.test.tsx |  53 +++++++--
4 files changed, 198 insertions(+), 85 deletions(-)
```

**Code trace result:** Both `PPBEDashboard.tsx` and `PPBEProgramDetail.tsx` were confirmed to render execution-shaped fields — obligation rate percentage, on-track/at-risk/off-track status badge, and the budget-to-actual variance chart with "Actual" series — when BY (FY2027) or BY+1 (FY2028) year tabs were selected. docs/18 treats BY as a formal budget request and BY+1 as having no obligation concept. These execution metrics were structurally misleading for budget years.

**Fix — PPBEDashboard.tsx:**
```typescript
const isBudgetYear = selectedFiscalYear === 'FY 2027' || selectedFiscalYear === 'FY 2028';
```
When `isBudgetYear` is true: the "Obligation rate" section renders a `StatusNotice` instead of `ObligationRateChart`. The "Budget-to-actual variance" section renders a `StatusNotice` instead of `VarianceChart`. Sections "Dependency health", "Learning velocity", "PPBE audit-trail activity", and "Per-site breakdown" are unaffected.

**Fix — PPBEProgramDetail.tsx:** Same `isBudgetYear` flag gates Section 1 (Obligation status — rate, badge, narrative, totals table) and Section 2 (Budget-to-actual variance chart + narrative captions). Sections 3 and 4 (Dependency health, Site breakdown) unaffected. `StatusNotice` imported from `./banners` (was not previously imported in this component).

**Test changes:** Both test fixtures were updated from `fiscal_year: "FY 2027"` to `"FY 2026"` (CY — Current Year) as the baseline execution year, so existing execution-metric assertions continue to test the correct year. Obligation timestamps updated to `2025-10-15` (dashboard) and `2026-01-15/2026-04-10` (detail) to correctly map to FY2026 via `fiscalYearOf`. Five new BY/BY+1 planning-notice assertions added.

**Evidence standard note:** This is a code trace only. Live browser confirmation that BY/BY+1 tabs actually render the planning notices (and that the year tabs switch correctly) has not been performed — no browser automation exists in this repo. This Brief must not claim code-trace equivalence to the evidentiary standard used for Parts 4/6 walkthroughs.

---

### D4 — D3-6: Module health dots investigation — STOP, design decision required

**No commit. No code change.**

**Location found:** `sovereign-shell/src/navigation/ModuleNav.tsx:179`
```tsx
<HealthDot status={m.lastHealth?.status} />
```
`HealthDot` component at lines 263–288: renders an 8×8px circle, color-coded HEALTHY/DEGRADED/UNAVAILABLE/unknown. `m.lastHealth` comes from `RegisteredModuleView.lastHealth` returned by `ModuleLoader.list()` (`module-loader/index.ts:528`).

**Infrastructure that exists:** `startHealthPolling()` (line 419) starts a `setInterval` calling `pollAll()`. `pollAll()` calls `pollModule()` (line 450) for each mounted module, which calls `entry.module.healthCheck()`, updates `entry.lastHealth`, and logs fallback events. Three-tier fallback (live → cache → static UNAVAILABLE) is fully implemented.

**Two-part gap preventing dots from showing real data:**
1. `startHealthPolling()` is never called anywhere in the codebase.
2. Even if it were, `pollModule()` mutates `entry.lastHealth` on the JS object but does not trigger React re-renders. The host (`main.tsx:163`) calls `loader.list()` on every render (which would pick up updated `lastHealth`), but `forceRender()` (`main.tsx:157`) is only called after module mount, not after health poll completion.

**Why this is a design decision, not a small wire:** Completing the wiring requires: (a) deciding where to call `startHealthPolling()` (app init? `useEffect` in `SovereignShellRoot`?), and (b) deciding how to propagate poll completions to React — either add an `onUpdated` callback parameter to `startHealthPolling()` that calls `forceRender()`, or run a separate `setInterval` in a host `useEffect` that calls `loader.pollAll().then(forceRender)`. Both options require decisions about polling lifecycle, interval selection, and error surface. This is Stage 2 scope, not a one-liner.

**Current behavior:** Dots show `health: unknown` (muted gray) which is honest — the `aria-label` says "unknown." Not a live-looking wired feature that displays wrong data; a placeholder that correctly represents the current state.

**Recommendation to Governance Agent:** Scope a Stage 2 GD authorizing the polling lifecycle design. The implementation is straightforward once the architectural decision is recorded.

---

## Findings (spec-vs-reality reconciliations)

### F1 — WH-38: Target was PPBEProgramDetail, not PPBEDashboard
`PPBEDashboard.tsx` already rendered variance as a grouped `BarChart` (not a table). The actual table target was `PPBEProgramDetail.tsx` Section 2. No spec error — the session prompt correctly identified "Execution Monitoring's variance history" — but the implementation target required verification.

### F2 — WH-15: ExhibitFigure has no cost_code field
`ExhibitFigure` in `ppbe-exhibit-contract.ts` has only `label`, `value`, and `source_workflow_step_id`. Cost-code aggregation for D2(b) was built from `ObligationRecord.cost_code` via `DEMO_OBLIGATIONS` (the raw input data), not from the processed figure list. This is correct by design (figures are post-aggregated; obligations carry the cost-code origin).

### F3 — WH-15: module-scribe has no charting library
`module-scribe/package.json` contains no recharts or equivalent. Used inline SVG for the cost-code chart to preserve zero-new-dependencies. recharts exists in module-apex but adding it to module-scribe would change module-scribe's production dependency list.

### F4 — WH-37: Test fixtures required update when BY gating was added
The existing `PPBEDashboard.test.tsx` and `PPBEProgramDetail.test.tsx` used `fiscal_year: "FY 2027"` fixtures, which would have produced planning-notice output after BY gating. Both were updated to `"FY 2026"` (CY) as the baseline execution year. The change is mechanically correct and the arithmetic confirms it: all execution-metric assertions continue to pass unchanged on FY2026 data.

### F5 — WH-37: Obligation timestamp fiscal-quarter alignment (PPBEDashboard test)
The dashboard test obligation at timestamp `"2026-01-15"` maps to `synthPeriodForTimestamp` → "FY 2026 Q2" (January = Q2), but the plan period was "FY 2026 Q1" (Oct–Dec 2025). Changed timestamp to `"2025-10-15"` (month 10 ≥ 10 → FY2026 Q1) so the obligation aligns with the plan period and the narrative assertion matches.

---

## Test counts (per-package — no workspace-level aggregation)

| Package | Suites | Tests |
|---|---|---|
| module-apex | 25 | 226 |
| module-scribe | 25 | 232 |
| sovereign-shell | 2 | 19 |
| module-aria | 13 | 150 |
| module-vigil | 31 | 211 |
| module-nexus | 19 | 166 |
| module-cpmi | 16 | 58 |
| module-counsel | 13 | 100 |
| module-agentos | 17 | 89 |
| module-lens | 9 | 61 |
| module-workspace | 2 | 28 |
| sovereign-data | 9 | 125 |
| module-flowpath | 14 | 151 |
| sovereign-api-client | 10 | 175 |
| **JS/TS total** | **209** | **1,791** |
| e2e | 12 | 149 passing, 4 skipped |
| Python (sovereign-security/) | — | 195 |
| **Grand total passing** | | **2,135** |

Prior baseline: 1,784 JS/TS + 149 e2e + 195 Python = 2,128 passing.  
Delta: +7 JS/TS tests (D2: +2, D3: +5). e2e and Python unchanged.

---

## TypeScript
`tsc --noEmit` clean on all 14 source workspaces (e2e has no lint script, expected).

---

## npm audit

```
# npm audit report

brace-expansion  <=5.0.7
Severity: high
brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups
brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash
fix available via npm audit fix

esbuild  <=0.24.2
Severity: moderate
esbuild enables any website to send any requests to the development server
fix available via npm audit fix --force (breaking change — vite@8.1.5)

js-yaml  <=3.14.2
Severity: high
JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases
fix available via npm audit fix

postcss  <=8.5.17
Severity: high
PostCSS: Path Traversal in Previous Source Map Auto-Loading
fix available via npm audit fix

5 vulnerabilities (1 moderate, 4 high) — all pre-existing, unchanged from Session 73.
```

---

## Shell contract
v1.23 · SHA-256 `6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`  
Both copies identical and verified:
- `/sovereign-platform/shell-contract.ts` ✓
- `/sovereign-platform/sovereign-shell/shell-contract.ts` ✓

Not touched this session.

---

## Commits this session

| Commit | Message |
|---|---|
| `793fb69` | fix(WH-38): replace variance history table with line chart in PPBEProgramDetail |
| `39f195f` | feat(WH-15): replace figure bullet list with table; add cost-code bar chart in SCRIBE |
| `6ed5c27` | fix(WH-37): gate BY/BY+1 execution metrics in PPBEDashboard and PPBEProgramDetail |

---

## Open items / next session

- **D4 (D3-6) — Module health dots:** Infrastructure complete, two-part React-polling gap documented above. Governance Agent decision required before Stage 2 implementation (see D4 findings).
- **WH-37 live browser confirmation:** Code trace confirmed the gating logic is correct. Live confirmation that BY/BY+1 tabs display the planning notices in the browser remains outstanding.
- **D2 (WH-15) LLM tier:** SCRIBE's exhibit drafting panel shows static-tier output in dev (no API key). Live-tier test requires a real API key environment.
