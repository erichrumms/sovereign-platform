# SOVEREIGN Platform — End-to-End Verification + Technical Assessment
## Post-Milestone: Sessions 39–42

**Date:** July 19, 2026
**HEAD at time of this document:** `a86f3dc`
**Produced by:** Build Agent (advisory input only — no governance documents edited)
**Status:** Pre-Decisional · Internal Working Document

---

## PART 1 — Verification Tooling Output

### 1a. `sovereign_session_verify.sh` — full output

```
============================================================
1. GIT STATE
============================================================
  WARN: HEAD is a86f3dc — expected dd3e4fa (may just mean new commits
        landed since this script was last updated)
  PASS: Working tree clean (ignoring this script itself)

-- Commit 12cb626 (prompt-placeholder fix) --
  PASS: 12cb626 exists

-- Commit 8080347 (Session 38 close) --
  PASS: 8080347 exists

============================================================
2. SHELL CONTRACT HASH
============================================================
  WARN: ./sovereign-shell/shell-contract.ts hash is
        91da8c18890bcc0f6fb3afb7105cf0ff7c63f8da3c5e8d1cefb08c91adbfee78
        — does NOT match documented v1.16 hash
  WARN: ./shell-contract.ts hash is
        91da8c18890bcc0f6fb3afb7105cf0ff7c63f8da3c5e8d1cefb08c91adbfee78
        — does NOT match documented v1.16 hash
  PASS: 2 copies of the shell contract found, and they are identical to each other

============================================================
3. TEST SUITES — real exit code, no truncation (Rule 7)
============================================================
  PASS: test:data — exit code 0
  PASS: test:api-client — exit code 0
  PASS: test:counsel — exit code 0
  PASS: test:scribe — exit code 0
  PASS: test:vigil — exit code 0
  PASS: test:lens — exit code 0
  PASS: test:cpmi — exit code 0
  PASS: test:agentos — exit code 0
  PASS: test:nexus — exit code 0
  PASS: test:apex — exit code 0
  PASS: test:flowpath — exit code 0
  PASS: test:aria — exit code 0
  PASS: test:e2e — exit code 0
  PASS: Python suite (./sovereign-security) exit code 0
    (195 passed, 1 warning in 12.97s)

============================================================
4. AGENT REGISTRY COUNT
============================================================
  Lines in the file claiming a total:
    998:  **Total registered agents: 36**
    1348: **Total registered agents after this addition: 44**

============================================================
5. GOVERNANCE ARTIFACTS
============================================================
  PASS: SOVEREIGN_Session38_Handoff.md found
  PASS: SBOM_Session38_Update.md found
  PASS: SOVEREIGN_Session38_PromptFix_Handoff.md found
  PASS: SBOM_Session38_PromptFix_Update.md found
  WARN: SOVEREIGN_Walkthrough_F_Findings_Report.md NOT found as standalone
  WARN: Walkthrough_F_Repeat_Pass.md NOT found as standalone

============================================================
SUMMARY: 22 pass / 5 warn / 0 fail
============================================================
```

**Investigation of each WARN:**

**HEAD WARN — script staleness, not a real problem.** The script expects `dd3e4fa`, a prior milestone HEAD. Sessions 39–42 have since landed. The two specific commit checks (`12cb626`, `8080347`) pass. Working tree is clean.

**Hash WARNs (×2) — script staleness, not a real problem.** The script documents the v1.16 hash. The repo is on v1.17 (GD-22, Session 41). The critical check — both shell-contract copies are identical to each other — PASSED. The v1.17 hash is `91da8c18...` on both copies, consistent with Session 41's close.

**Agent count — two conflicting claims in the same file, real drift.** Line 998 claims 36; line 1348 claims 44. The document was appended in waves and the earlier total was never updated. Direct count of individual `agent_id` entries in the file: the document contains 35 individually-detailed agents (in the single-field table format) plus FLOWPATH (6) and CPMI (3) agents registered in the broader registry table at lines 670–674 and 668 section — which total to 44 per the summary table at line 1348. The line-998 claim is stale. **The 44 figure is the current correct count, but the 36 claim should be removed or struck from the document to prevent future confusion.** Per Lesson 12: count the file directly; never propagate the Brief's count without verifying.

**Walkthrough F WARNs — files exist under different names.** `SOVEREIGN_Walkthrough_F_Complete.md` is present in the repo root (confirmed by platform_map output). The script expected two different standalone filenames. Not a content gap, just a naming mismatch in the script.

---

### 1b. `sovereign_platform_map.sh` — key findings

Full output: see platform_map run above.

**Noted issues requiring Governance Agent attention:**

**Integration Brief filename/content mismatch:** `SOVEREIGN_Platform_Integration_Brief_v1.47.md` has an internal version string of `v1.46`. The filename was updated; the document's own header was not. Minor, but the version string is what downstream agents read — not the filename.

**Strategic Plan similar mismatch:** `SOVEREIGN_Strategic_Plan_CTO_Demo_v3.3.md` internally says `v3.2`.

**Prompt registry cross-check — 9 MISSING reported, 2 categories:**

Category A: Script naming mismatch (files exist, registered correctly, just under versioned names).
The platform_map script expects underscore-style unversioned names (`analysis_system.md`); the actual files use kebab versioned names (`analysis-system-v1.0.md`). Confirmed present:
- `module-counsel/prompts/analysis-system-v1.0.md` (script expects `analysis_system.md`)
- `module-counsel/prompts/counter-system-v1.0.md` (script expects `counter_system.md`)
- `module-counsel/prompts/premortem-system-v1.0.md` (script expects `premortem_system.md`)
- `module-lens/prompts/explainer-system-v1.0.md` (script expects `explainer_system.md`)
- `module-scribe/prompts/drafting-system-v1.0.md` (script expects `drafting_system.md`)
- `module-scribe/prompts/style-analysis-system-v1.0.md` (script expects `style_analysis_system.md`)

Category B: **Genuinely absent — no file exists under any naming convention.** Direct `ls` confirmed:
- `module-lens/prompts/orientation_system.md` / `orientation-system-v1.0.md` — **does not exist**. The Agent Identity Standard explicitly acknowledges this at line 448–457: "PR-LENS-002 was never built" and "Prompt registrations required: None currently." The prompt is deferred by design, not silently lost.
- `module-scribe/prompts/framing_system.md` / `framing-system-v1.0.md` — **does not exist**. Not mentioned explicitly in the standard as deferred. Registered at line 310 with no qualification.
- `module-scribe/prompts/synthesis_system.md` / `synthesis-system-v1.0.md` — **does not exist**. Same situation, line 309.

`lens-orientation` and `scribe.framing`/`scribe.synthesis` are registered agents whose prompts have never been authored. The platform_map script is the first tool to surface this explicitly in the automated checks. This is not new information — the deferred status has been known — but it is now concretely confirmed by tooling.

---

### 1c. `repo_integrity_check.sh` — key findings

Full output: see run above.

**Real issues:**

1. **`12_NEXUS_Architecture.md` duplicate** — byte-identical copies at repo root and at `docs/12_NEXUS_Architecture.md`. Root copy is a stale artifact; `docs/` is the canonical location per file location reference. The root copy should be removed (or moved to For Disposal).

2. **Manifest missing files** — `SBOM_Registry_v1.39.md`, `SBOM_Registry_v1.40.md`, `SOVEREIGN_System_Prompt_v29.md`, `SOVEREIGN_System_Prompt_v31.md` are listed in `DOCUMENT_MANIFEST.tsv` but not present in the repo. These files live in iCloud, not the repository — the manifest is tracking documents across both locations. Not a content gap, but a manifest design note: any agent reading the manifest without iCloud access would see these as missing.

3. **Many handoffs not tracked by manifest** — Session handoffs 10–42 are all untracked. By design (the manifest appears to track current-state governance documents, not the historical session record). Confirming this is a policy decision, not an error.

**Not real issues:**

- `SBOM_Session7_Update.md` in two locations with different content: these are genuinely different SBOM updates from two different modules in the same session (module-lens and module-vigil). Different content, different modules.
- `.pytest_cache/README.md` vs `./README.md` content differs: pytest's own README vs the project README. Not related.
- Strategic Plan v1 vs v3.3: expected version history, both are different documents.

---

## PART 2 — E2E Test Results

### 2a. `wcag-contrast.test.ts` — full results

**60 tests, 0 failed, EXIT 0.** The test passed on the following three coverage layers:

**Layer 1: Shell theme tokens on dark backgrounds (WE-2) — 11 tests, all pass.** Shell dark-side tokens (text.primary, text.secondary, text.muted, identityText, all semantic colors) verified against all four dark backgrounds (bg.base/#0D1018, bg.raised/#13161F, bg.panel/#191D2A, bg.elevated/#252A3A) at ≥4.5:1. The identity purple (#6B4FA0) correctly fails as text and is flagged as framing-only.

**Layer 2: Module outlet background (Gap 3 root cause) — 2 tests, all pass.** The outlet is light (#ffffff), confirmed to give the module text palette a passing ratio, and confirmed that the old dark outlet (#0D1018) would fail — the mechanism, not just the value, is pinned.

**Layer 3: Module pair inventory (47 tests, all pass).** The full Session 29 audit inventory of inline text/background pairs. **Important note on the test name format:** pairs with `bold=false` in the test name (e.g., `#475569 on #ffffff (14px) — false`) are labeled `false` because the text is not classified as "large text" requiring the lower 3.0:1 threshold — not because the pair fails AA. Every pair in the inventory meets its applicable threshold (4.5:1 or 3.0:1 for large text). The test IS enforcing AA compliance for these pairs, and they all pass.

**What this test does NOT cover — direct relevance to WF-14:**

WF-14 (platform-wide low-contrast text, Home page and APEX Execution Monitoring) was flagged as "never formally tested" in this session prompt. The test confirms: it is still not tested.

Investigation revealed `#94a3b8` (Tailwind slate-400) is used as a text color in six locations across three modules:
- `sovereign-shell/src/PlatformHome.tsx:331` — `factDetailStyle`, 12px, on `#ffffff` background
- `module-apex/src/PPBEAgentsPanel.tsx:240` — disabled button text, on `#f1f5f9`
- `module-apex/src/PPBEAgentsPanel.tsx:247` — phase tag text, on `#f1f5f9`
- `module-counsel/src/PreMortemStudio.tsx:206` — source tag, 11px
- `module-counsel/src/CounterargumentPanel.tsx:279` — source tag, 11px
- `module-counsel/src/DecisionFramer.tsx:235,305` — field hint, 12px
- `module-counsel/src/AnalysisPanel.tsx:178` — source tag, 11px

`#94a3b8` has a relative luminance of approximately 0.383. Against `#ffffff` (L=1.0), the contrast ratio is approximately **(1.05) / (0.433) ≈ 2.42:1**. Against `#f1f5f9` (L≈0.913), it is approximately **2.22:1**. Both fail WCAG AA (4.5:1 for normal text, 3.0:1 for large text) by a wide margin.

None of these pairs appear in the `wcag-contrast.test.ts` audit inventory. The test passes because it checks the Session 29 inventory — which was written before these components were built or before these specific pairs were catalogued. WF-14 is not closed. The test's EXIT 0 is genuine but does not mean WCAG compliance on the screens WF-14 describes.

---

### 2b. `ppbe-live-smoke.test.ts` — full results

**8 tests total: 4 passed, 4 skipped. EXIT 0.**

The 4 passing tests exercise the **static/fallback path only** — all four PPBE agents (evidence-synthesizer, scenario-analyst, exhibit-drafter, coordination-assistant) degrade correctly when the live provider is unavailable. Each produces a labeled, validator-passing static response. This is confirmed real behavior, not a test no-op.

The 4 skipped tests are the **live path** — one real API call per agent against the Anthropic API. All four are marked `○ skipped` in the output with reason: `live provider unavailable (smoke: fail-closed half)`. This matches the session summary log: `tier=static validator=PASS detail: live provider unavailable`.

Per Rule 9: the live provider was never reached. The test exercises the fallback correctly and the fallback path works. But the live PPBE prompt path — an API call that actually invokes `ppbe-evidence-synthesizer` against real model output — has not been exercised in any test run visible here. The 4-test pass is honest and correct for what it covers; it does not confirm the live path functions.

---

## PART 3 — Technical Assessment (Advisory Only)

This assessment is advisory input for the Project Principal and Governance Agent. It does not edit any governance document, spec, or code.

---

### Q1: Is the current plan's sequencing still right?

**Yes, the Sessions 39–42 arc was the right work at the right time.** The walkthrough findings (WF-13–WF-28) and GD-22 together were surface-level debt that would have contaminated any further architectural work. The role-based access matrix specifically needed to land before any new module adds role gating — building on a single-role `minimumRole` field in an architecture that will have at least 10 modules is expensive to retrofit after the fact. That's done.

For the next priorities, here is an honest reorder recommendation:

**Do next: The cross-module data-access architecture Hard-Stop (Session 40).** This is the clearest latent sequencing risk. Right now, each module operates as though it doesn't need to know what other modules hold. That's worked so far because the interactions have been minimal. The Reviewer's Workspace consolidation (a proposed future direction) requires modules to share context, and the PPBE/TT workflows already have implicit cross-module assumptions. Addressing this boundary before consolidation work starts costs much less than addressing it after.

**Deprioritize slightly: SCRIBE visual redesign.** The platform has no visual regression tests. A SCRIBE redesign before that baseline exists creates work that's invisible to the test suite. The redesign will look fine when it lands and be invisible when it subtly breaks. This isn't a reason to defer forever, but it's a reason not to do it first.

**Sequence the Reviewer's Workspace after the data-access architecture, not before.** It depends on the answer.

---

### Q2: What's fragile?

**ARIA per-tab gating (D3, Session 41 — first sub-module gate in the codebase):**

The implementation is structurally sound. The `canAccessTab()` function uses the same `hasRole()` call as module-level gates; the `TAB_ROLES` record is explicit and testable. The one structural note: the default active tab is computed as `TAB_ORDER.find(canAccessTab) ?? "clear"`. If a user somehow passes the module-level gate (`PLATFORM_ADMIN | SYSTEM_ADMIN | COMPLIANCE_OFFICER | PROGRAM_MANAGER | ANALYST`) but has no tab access under `TAB_ROLES`, the fallback is "clear" — a tab they can't use. The DevPersonaToggle's all-8-roles expansion makes it possible to exercise this edge case from the dev toolbar: `READ_ONLY` passes no tab gate but would pass no module gate either (excluded from ARIA's minimum roles), so the edge case is unreachable via the approved role matrix. It's not a bug; it's a sharp corner that becomes relevant if the role matrix changes.

More importantly: ARIA is the only module with intra-module role gating. Every other module gates at mount. This is currently one instance of a pattern. If a second module adopts it for different reasons, there will be two implementations of the same concept with no shared abstraction or documented standard. The pattern should be captured in the architecture standard (or AGENT_REFERENCE) before it's copied, so future implementations don't diverge.

**`#94a3b8` in PlatformHome, APEX, and COUNSEL (documented above in Part 2a):**

This is the most concrete failure in the codebase that a test doesn't catch. It fails AA by approximately 2:1 — not a marginal case, not a large-text exception. It shows up in hint text, source attribution tags, disabled states. These are secondary elements (not primary content), but WCAG compliance at the product level applies to all visible text. This should be added to the WCAG test inventory and fixed before any client walkthrough where a screen reader audit could be run.

**The lens-orientation and SCRIBE framing/synthesis prompts registered but never built:**

`lens-orientation` (PR-LENS-002) was deferred by explicit decision; the Agent Identity Standard documents this clearly. That's fine. The SCRIBE prompts (`framing_system.md`, `synthesis_system.md`) are registered with no such qualification. These are the more ambiguous case: if they were deferred, the standard should say so. If they were supposed to be built and weren't, that's a gap. Neither the standard nor any session handoff I can see states explicitly that SCRIBE framing and synthesis were deferred. This should be resolved in the next governance cycle — either formally defer them (update the standard) or schedule a prompt-authoring session.

**The Python logger taxonomy (per Lesson 6 / GD-15):**

Lesson 6 notes that the Python logger taxonomy drifted ~30 event types behind the shell-contract over Sessions 1–16, and GD-15 was a dedicated catch-up pass. The Python test suite passes (195 tests, EXIT 0) but this assessment cannot confirm from a unit test run whether the taxonomy is current through GD-22 (Session 41). The `sovereign_session_verify.sh` does not check the Python logger event list against the shell-contract. If GD-22's role widening had any Python-side implications and those weren't propagated, the drift is silent. This should be verified directly.

---

### Q3: What should the Project Principal hear directly?

**The `wcag-contrast.test.ts` is doing real work on what it tests, but it gives false confidence about the overall WCAG state.** The test name format (`— false` appearing in many test names) looks to a human reader like those pairs fail AA, but it just means "non-large text." All tested pairs pass. The real issue is what's not tested: `#94a3b8` appears in the Home page and COUNSEL and APEX in significant volume and fails AA at approximately 2.4:1. WF-14 (platform-wide low-contrast text, Home page and APEX Execution Monitoring) is real and not closed. The test EXIT 0 does not change that. If the next client walkthrough includes an accessibility review, these screens will fail it.

**The agent count drift (36 vs 44 in the same document) should be resolved before the next session that gates on a correct count.** Lesson 12 exists precisely because this has caused session halts before. The Build Agent's Session 41 handoff reported 44 agents and didn't flag the conflicting internal claim at line 998. The Governance Agent's next post-session cycle should either strike the old count or replace the document structure so only one claim exists.

**The verification script is itself becoming stale.** `sovereign_session_verify.sh` expects the HEAD and hash from a pre-Session-41 milestone. Running it at the current state produces 5 WARNs immediately, 2 of which are script staleness and 3 of which are real signals. When a script produces multiple false WARNs every time it runs, the real WARNs start to feel like false WARNs too. The script should be updated at each milestone — same trigger as when it's meant to be run.

**The PPBE live smoke path has not been exercised.** The test says "PASS" and that's honest — the static fallback path works correctly. But the four approved PPBE prompts have never run against a real model in a test context. This is fine for now (the prompts are approved and manually authored), but the live path is "validated" only in the sense that the prompts are syntactically correct and the fallback works — not in the sense that the model actually produces valid output for the platform's use case. Before any PPBE live demo, this should be tested manually.

---

### Q4: Is platform test coverage proportional to what's now built?

**The 1,739 number is real but tells a narrower story than it appears to.**

What the test suite covers well:
- Three-tier fallback logic (every LLM-backed module has this tested)
- Shell-contract type correctness
- Role gate enforcement at module mount
- The VIGIL approval decision machinery (thorough)
- PPBE workflow layer (static tier; live tier not covered)
- ARIA rule evaluation (deterministic paths)

What the test suite covers thinly or not at all:

**`sovereign-shell` has zero test coverage.** The module loader, role-gating logic in the nav, DevPersonaToggle, PlatformHome, the shell host integration — none of it is tested. This is the surface that new users (and walkthrough participants) see first. A regression in the sidebar or the DevPersonaToggle would be invisible to the test suite.

**Visual rendering** has no coverage beyond the WCAG contrast inventory. No snapshot tests. A component that renders structurally wrong (a missing section, a layout collapse) doesn't fail any test.

**The e2e suite tests the static/fallback path.** Per Rule 9: a test that passes via fallback does not confirm the real path works. The four live PPBE paths, the vigil-approval-agent live brief, the FLOWPATH workflow synthesis, the NEXUS classification — none of these exercise real model API calls in any test run visible here.

**Cross-module interactions are not tested.** Every module is tested in isolation. There is no test that exercises what happens when AgentOS routes to VIGIL, or when NEXUS classifies a request that ends up in FLOWPATH. These pathways exist architecturally but are not verified end-to-end.

**The 1,739 number is not inflated** — the tests are real and the assertions are meaningful. But it primarily measures code correctness in well-defined unit scenarios. The surface where real failures would first appear (rendering, cross-module flow, live model integration) has thin coverage relative to its risk.

---

## Close Note

This document is advisory input. Nothing here has been acted on; no governance documents, specs, or code have been changed as part of producing it. The Project Principal and Governance Agent should weigh these findings and decide which, if any, warrant action before the next session or walkthrough.

---

*SOVEREIGN Platform · End-to-End Verification + Technical Assessment · July 19, 2026*
*HEAD at assessment time: `a86f3dc` · Shell contract: v1.17 (GD-22)*
*Advisory only — Build Agent output for Project Principal + Governance Agent review*
*Pre-Decisional · Internal Working Document*
