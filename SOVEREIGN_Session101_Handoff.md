# SOVEREIGN Platform — Session 101 Handoff

**Session type:** Bug fix + investigation + partial placement (Part 2 blocked)
**Date:** August 10, 2026
**HEAD at close:** (see `git log -1`)

---

## What this session did

### Part 1 — Cost Dashboard coverage-text correction (done)

Investigated a live discrepancy between the on-screen Cost Dashboard disclosure and the
documented, code-confirmed list of uninstrumented live-call sites from the Integration
Brief §4 and STRATA Build Spec §7.2.

**Evidence gathered (all from source, not from prior claims):**

Independent re-audit of all Anthropic API import sites and AGENT_STEP_COMPLETE / cost-wiring:

*14 instrumented AGENT_STEP_COMPLETE sites (confirmed by @anthropic-ai import + emission + computeEstimatedCostUSD):*
module-apex/usePPBEEvidenceSynthesis.ts, module-apex/usePPBEScenarioAnalysis.ts,
module-cpmi/useBenchmark.ts, module-cpmi/useReasoningChain.ts,
module-lens/useExplanation.ts, module-nexus/NexusApp.tsx,
module-nexus/usePPBECoordinationTracking.ts, module-scribe/useDraft.ts,
module-scribe/useIntermediate.ts, module-scribe/usePPBEExhibitDraft.ts,
module-scribe/useStyleProfile.ts, module-scribe/useTTDraft.ts,
module-vigil/useApprovalBrief.ts, module-vigil/useTriage.ts

*4 genuinely non-model AGENT_STEP_COMPLETE sites (no @anthropic-ai import):*
module-aria/src/tracer-integration.ts, module-vigil/src/security-query.ts
(read-only; emits synthetic representations only),
module-nexus/src/tt-travel-queue.ts, module-nexus/src/useTTIntake.ts
(deterministic, no live model call)

*3 COUNSEL hooks — confirmed to make live model calls:*
module-counsel/src/useAnalysis.ts, useCounterargument.ts, usePreMortem.ts
All three have confirmed @anthropic-ai imports and emit REASONING_STEP_COMPLETE
(not AGENT_STEP_COMPLETE). No token_usage / computeEstimatedCostUSD wiring.
The on-screen text's claim that these "do not call the model" was false.

*Additionally confirmed but outside GD-31/GD-35 AGENT_STEP_COMPLETE scope:*
module-flowpath/src/useFlowpathElicitation.ts — @anthropic-ai import, emits
FLOWPATH_* events, no cost wiring.
module-apex/src/useApexAnalysis.ts — @anthropic-ai import, emits APEX_ANALYSIS_*
events, no cost wiring.
These two were not addressed by this fix (governance decision required on whether the
disclosure should extend to non-AGENT_STEP_COMPLETE live-call sites).

**The fix:** `module-workspace/src/WorkspaceApp.tsx` (cost-coverage-disclosure,
line ~773). Text-only change. Replaced the false grouping of "5 excluded sites" all
claimed to "do not call the model" with:
- 4 excluded non-model sites (correctly described)
- 3 COUNSEL hooks (correctly described as REASONING_STEP_COMPLETE emitters that DO
  make live model calls, excluded only because they're outside AGENT_STEP_COMPLETE scope)

Companion test description updated in WorkspaceApp.test.tsx. All 33 module-workspace
tests pass.

---

### Part 2 — Demo Script placement (stopped — diff not checklist-only)

Task called for placing `~/Downloads/SOVEREIGN_CTO_Demonstration_Script_20260810.md`
if the diff against the placed `SOVEREIGN_CTO_Demonstration_Script_20260806.md`
touched only the pre-demo checklist and status note.

**Real diff findings:** the new file is NOT checklist-only. Beyond the status note
and checklist additions (microphone-access finding, persona-reset finding, live
walkthrough completion status), it also adds:

- **Screen 8**: new STRATA beat ("And underneath this layer…") — explicitly labeled in
  the status note as "a fresh Governance Agent draft, not yet Build-Agent-verified or
  placed, unlike the rest of this script."
- **Closing section**: new Palantir Foundry Q&A preparation note — also labeled as
  unverified draft material.
- Footer and companion document reference updated to Strategic Plan v3.12.

Per task instructions, placement was not performed. Governance Agent to decide whether
to verify the Screen 8 / closing additions or strip them before a next placement pass.

---

## No new governance decisions

---

## Platform state at close

| Item | Value |
|---|---|
| Shell contract | v1.28 (unchanged) |
| Test suite | 2,050 JS/TS + 195 Python (unchanged) |
| Zero-new-production-dependency streak | Unbroken from Session 62 |
| GD Registry | `SOVEREIGN_GD_Registry_20260810.md` (unchanged) |

---

## Open items carried forward

- FLOWPATH (useFlowpathElicitation.ts) and APEX (useApexAnalysis.ts) confirmed as live
  live-call sites with no cost wiring — outside GD-31/GD-35 AGENT_STEP_COMPLETE scope.
  Governance to decide if disclosure should be extended.
- Demo Script 20260810: Screen 8 STRATA addition and closing Palantir Q&A are
  unverified Governance Agent drafts — needs a Build Agent verification pass and
  governance placement decision before the file can be placed.

---

*Session 101 — Governance Agent / Build Agent — August 10, 2026*
*Cost Dashboard text fix + investigation report (Part 2 placement blocked)*
