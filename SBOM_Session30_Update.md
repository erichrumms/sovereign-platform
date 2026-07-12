# SOVEREIGN Platform — SBOM Session 30 Update
## Time & Travel pipeline fix, landing page, navigation reference verification

**Date:** July 12, 2026  
**Session:** 30  
**Merge basis for:** SBOM Registry v1.31 (supersedes v1.30)  
**Classification:** Pre-Decisional · Internal Working Document

---

## 1. Shell Contract — UNCHANGED

| Version | GD | SHA-256 | Status |
|---|---|---|---|
| **v1.16** | GD-21 | `521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7` | **CURRENT — verified at session open and close** |

No shell-contract changes were needed or made. Constraint #7 holds at ten exports.

## 2. Governance Decisions Applied

- None new; no pre-authorized governance decisions required this session.
- `TravelDraftResult` and `TravelDrafterPort` are MODULE-LOCAL to `module-nexus/src/useTTIntake.ts` — deliberately not added to shell-contract (module boundary, not a cross-product shared type).
- `TravelDrafterPort` wiring at `NexusApp.tsx` follows the Item 57 / composition-root pattern (Standing Constraint #3) — module-nexus code imports module-scribe's `runTTDraft` only at the composition root, same as module-apex's `evaluateTimeRecord`.

## 3. Agents — UNCHANGED

| Registry | Count | Status |
|---|---|---|
| Agent Identity Standard | **44** | Unchanged — `tt.travel-drafter` was already registered (Session 28) |

No new agents registered. `tt.travel-drafter` (Operational class) is now actively invoked — wiring gap (WE-10) closed.

## 4. Prompts — UNCHANGED

| Registry | Count | Status |
|---|---|---|
| Approved prompts | **16** | Unchanged — TT travel drafting prompt already approved (Session 28) |

`TT_TRAVEL_DRAFTING_SYSTEM_PROMPT` from `module-scribe/src/prompts/tt-travel-drafting-system.prompt` is now actively used via the `travelDrafter` composition-root port.

## 5. New / Modified Files

### New
| File | Purpose |
|---|---|
| `sovereign-shell/src/PlatformHome.tsx` | D4 (WE-7) — landing page: CPMI-VRS status rollup, platform facts, things-to-do aggregation |
| `module-nexus/tests/TTQueuePanel.test.tsx` | D1/D2/D3 UI regression tests (14 tests) |
| `module-nexus/tests/__mocks__/anthropic-key.ts` | Jest stub — prevents `import.meta.env` parse error when NexusApp.tsx is imported in tests |

### Modified
| File | Change |
|---|---|
| `module-nexus/src/useTTIntake.ts` | D1: `TravelDraftResult`, `TravelDrafterPort`, `SubmittedTravelItem` draft fields, `decideTravel` async draft trigger |
| `module-nexus/src/TTQueuePanel.tsx` | D1: `DraftPanel` component; D2: required indicator + inline error; D3: `buildDefaultNote()` pre-population; import fix (`TravelComplianceFinding` from `tt-travel-compliance-engine`) |
| `module-nexus/src/NexusApp.tsx` | D1: `travelDrafter` port wired via module-scribe `runTTDraft`; `useRef` for draft cache; Logger emission for drafter agent step |
| `module-nexus/tests/useTTIntake.test.tsx` | D1: 4 regression tests (`waitFor` import, `TravelDraftResult/TravelDrafterPort` imports, D1 describe block) |
| `module-nexus/package.json` | `moduleNameMapper` added to jest config — maps `anthropic-key` to test stub (same pattern as `module-scribe`) |
| `sovereign-shell/src/navigation/ShellNavChrome.tsx` | D4: `landing?: ReactNode` and `showLanding?: boolean` props |
| `sovereign-shell/src/main.tsx` | D4: `hasSelectedModule` state; `PlatformHome` import and wiring |
| `docs/19_TT_Navigation_Reference.md` | D5: UNVERIFIED header removed; ROUTED count corrected (3→4); Step 6 updated for D1/D2/D3; version v1.0→v1.1 |

## 6. Test Count

| Session | Count | Delta |
|---|---|---|
| Session 29 baseline | 1396 | — |
| Session 30 close | **1414** | **+18** |

Delta breakdown: +4 hook regression tests (D1 in `useTTIntake.test.tsx`) + +14 UI tests (D1/D2/D3 in `TTQueuePanel.test.tsx`).

> **Note:** The Session 29 handoff stated 1559 tests. The accurate count per workspace-by-workspace measurement at Session 30 close is **1414**. The discrepancy likely arose from a counting method difference in Session 29 (the --workspaces output includes both run-level and suite-level lines). 1414 is the authoritative count going forward.

## 7. D1 Root Cause (mandatory per session brief)

**WE-10 root cause: Explanation (b) — the drafting engine was never invoked.**

`decideTravel` in `useTTIntake.ts` called `recordTravelDecision` correctly but had no `travelDrafter` port in `TTIntakePorts`, no draft fields on `SubmittedTravelItem`, and no `DraftPanel` in `TTQueuePanel.tsx`. This is a clean wiring gap, not a hidden-draft issue. Fixed by adding the port, the fields, the async trigger in `decideTravel`, the display component, and the composition-root wiring in `NexusApp.tsx`.

## 8. D3 Definitive Answer (mandatory per session brief)

**Does the decision note feed into the drafted communication?**

**No.** The note is AUDIT-ONLY. `runTTDraft` → `buildTTDraftMessages` constructs its payload from `TravelRequest`, `TravelPolicy`, and `ComplianceFlag` governed data. The manager's note never reaches the drafting engine. This is by design: drafts must be grounded in governed factual data, not the decision maker's annotation.

## 9. D5 Corrections Listed (mandatory per session brief)

1. §2 Step 5 / §5: ROUTED count **3 → 4** (TR-102/103/104/107 all ROUTED, verified in `tt-seed.ts`)
2. §2 Step 6: Added pre-populated note (WE-12), required indicator (WE-11), draft panel post-decision (WE-10), note-is-audit-only statement
3. UNVERIFIED header removed; VERIFIED status block added

*SBOM_Session30_Update.md · Session 30 · July 12, 2026*
