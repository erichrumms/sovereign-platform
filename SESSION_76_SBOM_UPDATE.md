# SBOM Update — Session 76

**Date:** 2026-07-30  
**Session:** 76  
**Shell contract version:** v1.24 (unchanged)  
**Shell contract hash:** `487054e2b66473ccbbd87e333db70910127549570ce449210a29afd444b4152f`

---

## Deliverables

### D1 — WH-49 · Fiscal Year Navigation Fix

**Commit:** `d4e3447`  
**Packages modified:** `module-apex`  
**Files:**

| File | Change |
|------|--------|
| `module-apex/src/ApexApp.tsx` | Added `ppbeDetailFiscalYear` state; `onSelectProgram` callback now captures fiscal year alongside program ID and passes it to `PPBEProgramDetail` as `initialFiscalYear`. |
| `module-apex/src/PPBEDashboard.tsx` | `onSelectProgram` prop signature extended to `(programId, fiscalYear)`. `handleSelectProgram` wrapper injects `selectedFiscalYear`. Conditional pass-through preserves "no buttons when no prop" behavior. |
| `module-apex/src/PPBEProgramDetail.tsx` | Added `initialFiscalYear?: string` prop. `useState` initializer honors it when valid for the program, otherwise falls back to `"FY 2026"` or first available year. |
| `module-apex/tests/PPBEDashboard.test.tsx` | Updated callback assertion from single-arg to two-arg: `toHaveBeenCalledWith("PRG-001", expect.any(String))`. |

**Shell contract delta:** None. `initialFiscalYear` is module-internal; `onSelectProgram` signature change is module-local.

---

### D2 — WH-48 · Variance Prose → Table

**Commit:** `9b718f4`  
**Packages modified:** `module-apex`  
**Files:**

| File | Change |
|------|--------|
| `module-apex/src/PPBEDashboard.tsx` | Replaced per-period prose narrative captions in portfolio-level variance section with a `<table aria-label="Budget-to-actual variance by period">` (Period \| Planned \| Actual \| Variance). Period cell prefixed with `shortId(program_id)`. Color-coded variance column. |
| `module-apex/src/PPBEProgramDetail.tsx` | Same table replacement for single-program variance section. Period column shows period only (no program prefix). |
| `module-apex/tests/PPBEDashboard.test.tsx` | Replaced prose-narrative regex assertion with aria-label and period-cell text assertions. Updated comment noting variance prose replaced by table (WH-48). |

**Shell contract delta:** None.

---

### D3 — WH-50 · StrictMode Investigation

**Commit:** None. Investigation only — no code changes.  
**Packages modified:** None.  
**Finding:** TRAVEL_APPROVAL and TIME_CORRECTION_SENT events are emitted inside event handlers, not `useEffect` bodies. StrictMode double-invoke is not a mechanism for extra Activity log entries. Full findings in SESSION_76_HANDOFF.md.

---

### D4 — WH-52 · Sidebar Badge Investigation

**Commit:** None. Investigation only — no code changes.  
**Packages modified:** None.  
**Finding:** The floating grey element is the `InfoBadge` tooltip (ModuleNav.tsx:227–261), a portal-rendered hover popover introduced by WG-2 (Session 54). No defect. Full finding in SESSION_76_HANDOFF.md.

---

## Component Inventory Delta (Session 76)

No new components, hooks, or types introduced. No shell contract changes. Functional changes:

- `PPBEDashboard.onSelectProgram` signature: `(id: string) => void` → `(id: string, fiscalYear: string) => void`
- `PPBEProgramDetail` new optional prop: `initialFiscalYear?: string`
- Both variance sections: prose captions → `<table>` with `aria-label="Budget-to-actual variance by period"`

---

## Packages Not Modified This Session

All 13 other packages (module-agentos, module-aria, module-counsel, module-cpmi, module-flowpath, module-lens, module-nexus, module-scribe, module-vigil, module-workspace, sovereign-api-client, sovereign-data, sovereign-shell) and e2e suite are unchanged. Their test counts are stable at the Session 75 baseline.
