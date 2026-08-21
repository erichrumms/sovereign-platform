# SOVEREIGN Platform — SBOM Registry
## Version 1.96 (MERGED) · August 20, 2026 · Build Agent (mechanical merge)

**Supersedes:** v1.83 (MERGED, August 15, 2026, covering everything in v1.74 plus
Sessions 107–114), and the per-session updates v1.84 (Session 115) through v1.95
(Session 126). The only two merged-registry files previously on disk are
`SBOM_Registry_v1.44.md` (July 30, through Session 76) and
`SBOM_Registry_v1.83_MERGED.md` (August 15, through Session 114). This version
supersedes both.

**Authorship note.** This merge was performed by a Build Agent session (Session 127)
per the Remaining Build Backlog's own standing instruction: the merge "is a mechanical
merge of verbatim source text and must be performed by a Build Agent session against
the real files, not authored from summary." No code, tests, or governance content were
authored this session — the sole output is this derived registry, assembled by copying
verbatim source text from each session's own SBOM file.

**Numbering.** Per the convention settled in Sessions 110–111, per-session updates and
merged registries **share one number space**. The next number is derived by scanning
every SBOM file on disk and adding one. The highest label present at this session's open
is v1.95 (Session 126), so this registry is **v1.96**.

**Merges (two newly-closed sets, plus v1.83 carried forward):**
1. **The six genuinely-unmerged sessions named in v1.83 §6** — Sessions 99, 101, 102,
   103, 104, and 106. v1.83 recorded these as unmerged because no verbatim SBOM source
   was available to it. **All six source files are now present on disk** and are merged
   here verbatim. The v1.83 §6 backlog is thereby closed.
2. **Sessions 115 through 126** (per-session updates v1.84–v1.95), merged here from
   verbatim per-session sources.
3. **Everything already in v1.83** — Sessions 107–114 — carried forward verbatim from
   `SBOM_Registry_v1.83_MERGED.md` §5, unaltered.

A remaining provenance nuance about Sessions 77–105 is surfaced in §6; it is recorded,
not acted on.

---

## 1 — Shell Contract History

Carried forward from v1.83, extended through Session 126.

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.25 | GD-31 Build Session 1 | Optional `token_usage?` added to `SovereignLogEvent` | `d22694a3…` |
| v1.26 | GD-33 Build Session | `reports_to?: string` added to `SovereignUser` | `42a479ca…` |
| v1.27 | Session 87 (GD-34) | `FallbackCategory` type; `fallback_category?`; `duration_ms?`, `stop_reason?`, `responded_at?` on `token_usage` | `3570923c…` |
| **v1.28** | **Session 91 (docs/34 Phase 3)** | **`SUPERVISOR` added to `SovereignRole`** | `c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b` |
| v1.28 | Sessions 92–126 | **Unchanged.** Both copies re-verified byte-identical at every session close, most recently Session 126, and again at Session 127 open | `c99355ce…` |

**No shell-contract change has occurred since Session 91.** Thirty-five consecutive
sessions (92 through 126) with the contract untouched and verified identical at each
close. Session 127 (this merge) re-verified both copies at open:
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`, identical.

---

## 2 — Agent and Prompt Registry

**Agents: 44. Prompts: 20 (19 approved + 1 pending).** Unchanged from Session 76 through
Session 126 — fifty sessions. Confirmed by direct count in the Session 107 currency
review, the Sessions 107–114 confirmation note appended to `Agent_Identity_Standard.md`
v1.2, and re-stated unchanged in every per-session SBOM from Session 115 through 126.

The single pending prompt is the PPBE exhibit drafting prompt
(`ppbe/prompts/exhibit_drafting_system.md`), confirmed still **PENDING** (synthetic-data
only) at Session 126; no session in this window changed prompt status.

---

## 3 — Test Count History

Carried forward from v1.83, extended through Session 126. The older recovered sessions
(99, 101–104, 106) sit in the flat 2,050 era and are shown for completeness.

| Session | JS/TS | Python | Total | Note |
|---|---|---|---|---|
| 105 | 2,050 | 195 | 2,245 | Independently re-run from zero across all 15 workspaces |
| 99, 101–104, 106 | 2,050 | 195 | 2,245 | Recovered this merge — all documentation/governance/text-fix sessions, no test delta |
| 107–112 | 2,050 | 195 | 2,245 | Unchanged. Documentation and governance sessions |
| 113 | 2,053 | 195 | 2,248 | +3 — `module-apex/tests/ppbe-site-breakdown.test.ts` (over-obligated sites) |
| 114 | 2,059 | 195 | 2,254 | +6 — `module-apex/tests/ppbe-dashboard.test.ts` (over-obligated programs) |
| 115 | 2,059 | 195 | 2,254 | 0 — governance-document placement pass, no code change |
| 116 | 2,059 | 195 | 2,254 | 0 net — five apex assertions + one shell snapshot updated in place, none added |
| 117 | 2,063 | 195 | 2,258 | +4 — `module-scribe/tests/ScribeApp.test.tsx` (F-20 banner) |
| 118 | 2,079 | 195 | 2,274 | +16 — nexus +7, apex +7, shell +2 (F-40/42/45/47/48/49/50) |
| 119 | 2,080 | 195 | 2,275 | +1 — `PortfolioDashboard.test.tsx` renamed-column pin (F-41) |
| 120 | 2,081 | 195 | 2,276 | +1 — `PortfolioDashboard.test.tsx` bare-name pin (prefix strip) |
| 121 | 2,082 | 195 | 2,277 | +1 — `ProgramDetailView.test.tsx` renamed-label pin (F-41 family) |
| 122 | 2,090 | 195 | 2,285 | +8 — Gate 1 standardization across six modules |
| 123 | 2,089 | 195 | 2,284 | **−1** — one obsolete FLOWPATH panel-level GD-10 test removed; coverage moved to the all-tabs test |
| 124 | 2,102 | 195 | 2,297 | +13 — `draft-placeholder-gate.test.ts` (F-51, 6 modes ×(a)/(b) + 1 sentinel test) |
| 125 | 2,120 | 195 | 2,315 | +18 — `tt-draft-placeholder-gate.test.ts` (9 comm types ×(a)/(b)) |
| **126** | **2,126** | 195 | **2,321** | +6 — `ppbe-exhibit-placeholder-gate.test.ts` (3 PPBE modes ×(a)/(b)) |

**Chain verification (Session 127, D3):** every session's stated "before" count in this
window equals the immediately preceding session's "after" count. The one decrease
(Session 123, −1) is self-documented as the removal of a single obsolete panel-level
test whose coverage moved to the FlowpathApp all-tabs test — a real, explained change,
not a break. **No break in the test-count chain was found.** Python is flat at 195 for
the entire window.

**Historical notes carried forward, not smoothed over:**
- The v1.74 merge found a real arithmetic error — two sessions' totals had silently
  dropped a whole package's count from a restatement, understating both by 20.
  Corrected there; recorded here so the correction is not lost.
- Session 112 anomaly, recorded: the verify script's full run recorded `test:shell` as
  exit 139 (segmentation fault). Re-run standalone it passed cleanly at 20 tests.
  Transient, not reproducible, unrelated to any change that session.

**Count methodology (Sessions 118–126):** the platform total is the sum of per-workspace
passing counts; the 4 key-gated e2e live-smoke tests remain skipped and are excluded, as
noted in each session's own SBOM.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies from Session 62 through Session 126.** Independently
confirmed at every session close in this window (Sessions 99, 101–104, 106 and 115–126
each record "zero new production dependencies").

Vulnerability posture unchanged across the window: 5 findings (1 moderate, 4 high) —
brace-expansion, esbuild, js-yaml, postcss — **all in development tooling, none on the
runtime surface.** Unremediated and recorded as such.

---

## 5 — Per-Session Records

Three provenance blocks: §5.1 the six sessions recovered this merge (verbatim from their
own SBOM files); §5.2 Sessions 107–114 carried forward verbatim from v1.83 §5; §5.3
Sessions 115–126 merged this session from verbatim sources.

### 5.1 — Recovered sessions (99, 101–104, 106) — previously §6-unmerged

These six were named as genuinely unmerged in v1.83 §6 for lack of an available verbatim
source. Their source SBOM files are now present on disk and are reproduced here.

#### Session 99 (v1.67) — Governance recording
Session type: Governance recording — six decisions made, zero lines of STRATA code
written. No production dependencies added or removed; no shell-contract changes; no new
code modules.

Governance documents created or updated: `SOVEREIGN_GD_Registry_20260810.md` (new —
GD-36 through GD-41 approved); `docs/37_STRATA_Architecture_Overview.md`,
`docs/38_STRATA_Layer3_Semantic_Modeling_Build_Spec.md`,
`docs/39_STRATA_Integration_Work_Scope_and_Schedule.md` (approval status recorded);
`PLACEMENT_LOG.tsv` (five new entries); `SOVEREIGN_Session99_Handoff.md` (new);
`SBOM_Session99_Update.md`.

GD registry state: GD-36 through GD-41 moved from PROPOSED to APPROVED; next available
GD-42. Two approval notes carried forward: (1) GD-40's subject was always entity
resolution for the two program datasets — the Session 98 draft mislabel as "MCP registry
serving" is corrected in `SOVEREIGN_GD_Registry_20260810.md`; MCP serving is a separate
open concern needing its own future GD. (2) GD-38's approval authorizes the
`SCHEMA_APPROVAL` mechanism; the actual shell-contract change is deferred to Phase 3+.
Open governance questions recorded: schema authority for the STRATA object registry vs.
shell contract (blocks Phase 3); MCP-serving governance (needs its own GD before Phase
3); Intelligence Layer pipeline-position disagreement (docs/13+15 vs docs/16).
Platform state: shell contract v1.28 unchanged; JS/TS 2,050; Python 195.

#### Session 101 (v1.69) — Cost Dashboard text fix
Session type: Bug fix + investigation + partial placement (Part 2 blocked). No
production dependencies; no shell-contract changes; no new governance decisions; no new
code modules.

One on-screen text correction to the Cost Dashboard coverage disclosure
(`module-workspace/src/WorkspaceApp.tsx`). The prior text falsely claimed the three
COUNSEL hooks (`useAnalysis.ts`, `useCounterargument.ts`, `usePreMortem.ts`) "do not
call the model." An independent audit confirmed they have `@anthropic-ai` imports and
emit `REASONING_STEP_COMPLETE` events. The corrected text distinguishes the 4 genuinely
non-model excluded sites from the 3 COUNSEL hooks that make live model calls but are
outside `AGENT_STEP_COMPLETE` scope. Demo Script placement (Part 2) was not performed —
the diff against the placed August 6 script touched Screen 8 and the closing section
with unverified Governance Agent draft material, which did not meet the checklist-only
criterion. Files changed: `module-workspace/src/WorkspaceApp.tsx`,
`module-workspace/tests/WorkspaceApp.test.tsx`, `SOVEREIGN_Session101_Handoff.md`,
`SBOM_Session101_Update.md`. Platform state: shell contract v1.28 unchanged; JS/TS
2,050; Python 195.

#### Session 102 (v1.70) — Demo Script checklist-only placement
Session type: Demo Script placement — closes Part 2 of Session 101. No production
dependencies; no shell-contract changes; no new governance decisions; no new code
modules.

Placed the checklist-only revision of the CTO Demonstration Script: the August 6 script
(`SOVEREIGN_CTO_Demonstration_Script_20260806.md`) was replaced with
`SOVEREIGN_CTO_Demonstration_Script_20260810.md`. Diff confirmed: only the top status
note, the pre-demo checklist (microphone-access finding, persona-reset finding,
walkthrough-completion status), and footer changed. Screens 1–8 and the closing section
byte-identical to the placed version. Files changed:
`SOVEREIGN_CTO_Demonstration_Script_20260806.md` (git rm),
`SOVEREIGN_CTO_Demonstration_Script_20260810.md` (added),
`SOVEREIGN_Session102_Handoff.md`, `SBOM_Session102_Update.md`. Platform state: shell
contract v1.28 unchanged; JS/TS 2,050; Python 195.

#### Session 103 (v1.71) — Platform audit-log claim correction
Session type: Targeted text correction — platform audit log claim. No production
dependencies; no shell-contract changes; no new governance decisions; no new code
modules.

Corrected two disclosure banners in `module-workspace/src/WorkspaceApp.tsx` that
directed reviewers to "the platform audit log" — a resource that does not exist. The
banners now accurately state that no cross-session history exists and name the specific
reason: Stage 2 persistence (docs/28) has not been built. Change covers both the
Activity & Decisions disclosure and the Cost Dashboard disclosure, which shared the same
false claim. All 23 WorkspaceApp tests pass without modification — the tests check
`/session-scoped only/i` and `/in-memory/i`, both unchanged. Files changed:
`module-workspace/src/WorkspaceApp.tsx`, `SOVEREIGN_Session103_Handoff.md`,
`SBOM_Session103_Update.md`. Platform state: shell contract v1.28 unchanged; JS/TS
2,050; Python 195.

#### Session 104 (v1.72) — GD-41 resolution-language correction
Session type: Governance-record correction — GD-41 resolution language. No production
dependencies; no shell-contract changes; no new governance decisions; no new code
modules.

Corrected GD-41's recorded Decision field across the GD Registry and all cited source
documents. The original Decision field hedged the resolution of Stage 2 persistence
(docs/28), deferring it to a future explicit decision. The actual Project Principal
answer was unconditional: building and operating the Layer 1 connector is the answer to
Stage 2 persistence — no further separate decision required after that point. Seven
locations in four files updated. Files changed:
`SOVEREIGN_GD_Registry_20260810.md` (GD-41 Decision field in two locations),
`docs/37_STRATA_Architecture_Overview.md` (§8 item 6 open → resolved by GD-41),
`docs/39_STRATA_Integration_Work_Scope_and_Schedule.md` (four locations: §1 scope
statement, §2 Phase 8 note, §5.2 GD-41 Decision field, R12 risk-register mitigation),
`SOVEREIGN_Session103_Handoff.md` (claim (b) corrected), `SOVEREIGN_Session104_Handoff.md`,
`SBOM_Session104_Update.md`. Platform state: shell contract v1.28 unchanged; JS/TS
2,050; Python 195.

#### Session 106 (v1.74) — Three July 30 addenda merged
Session type: Document merge — three July 30 addenda spliced into primary documents. No
production dependencies; no shell-contract changes; no new governance decisions; no new
code modules.

Performed the three real document merges that the July 31, 2026 commit (`c2d9f5c`) had
claimed to complete but had not: the three addendum files were placed in that commit;
DOCUMENT_MANIFEST.tsv was written as if the splices into the primary documents were done;
they were not. This session performed all three actual merges, removed the addendum
files, and corrected the manifest. Files changed: `AGENT_REFERENCE.md` (Lessons 30–38
spliced after Lesson 25; Rules 15–17 spliced after Rule 14; header v3.4 → v3.5; footer
corrected from stale "v3.0" to "v3.5"); `Agent_Identity_Standard.md` (July 30
Confirmation Note (Sessions 71–76) appended; merge note records absence of claimed July
27 note); `docs/28_Logger_Write_Only_Provenance_Gap.md` (July 30 emission-site survey
appended to §5; closing signature updated); `AGENT_REFERENCE_Addendum_20260730.md`,
`Agent_Identity_Standard_Append_20260730.md`,
`docs/docs_28_Logger_Provenance_Append_20260730.md` (all deleted after merge);
`DOCUMENT_MANIFEST.tsv` (three rows corrected with real post-merge SHA-256 values; inline
comment added); `SOVEREIGN_Session106_Handoff.md`, `SBOM_Session106_Update.md`.
Post-merge document state: `AGENT_REFERENCE.md` SHA
`fa7f21d22cb72a6c7267b1c655f8eb95655f0a2438ed4a6fd627ff12b29c6e7a`, 1,899 lines (v3.5);
`Agent_Identity_Standard.md` SHA
`6d7940b73b24bc2d96344ed26c85f0e34b5e47d9cca4ff851ba8d23726c24960`, 1,651 lines (44
agents); `docs/28` SHA
`0fe35eaaa11a7ad5ef85cbffa04c74fd3434f909efbb489bc8b80b6c3fc966c9`, 132 lines. Platform
state: shell contract v1.28 unchanged; JS/TS 2,050; Python 195.

*(Note on the v1.74 label: Session 106's per-session update carries the label v1.74 — the
same number as the never-placed merged-registry draft v1.83 supersedes. Both were
occupied because the number space is shared and the merged draft was never placed. This
is the collision v1.83's supersedes line records; it does not affect this recovery.)*

### 5.2 — Sessions 107–114 (carried forward verbatim from v1.83 §5)

#### Session 107 (v1.75) — Governance document currency
`AGENT_REFERENCE.md` stale test figure corrected (934 → the real count, with its source
session attached). `Agent_Identity_Standard.md` header corrected v1.0 → v1.1; Sessions
77–106 confirmation note appended; `deployment_feedback` gap documented. Read-only
investigation established that the canonical registry uses dotted ids for product agents
and that VIGIL's dashed form was the deviation.

#### Session 108 (v1.76) — Parallel lineage recovery
`AGENT_REFERENCE.md` v3.5 → v3.6, 2,006 lines. Three content blocks recovered from a
second copy (1,993 lines, SHA `14aa83ad…`) that had been produced locally in July and
**never committed**: Lessons 26–29, the Rule 10 July 26 amendment, and the session-store
extraction decision. The manifest's claim that the SHA "described a file state that never
existed" was **retracted** — the state existed; the commit never happened.

#### Session 109 (v1.77) — Rules 13/14 resolution
`AGENT_REFERENCE.md` v3.6 → v3.7. The parallel lineage's Rule 13 evidence folded into
canonical Rule 17; its Rule 14 content re-homed as **Lesson 39**, leaving Rule 14
permanently unassigned. Duplicate Rule 2/3 numbering confirmed intentional and citation
guidance recorded — closing a finding carried open across multiple System Prompt
versions. Session 108's handoff HEAD corrected. Manifest: 3 stale rows fixed, 12 rows
added.

#### Session 110 (v1.78) — Conventions and the manifest gap
`AGENT_REFERENCE.md` v3.7 → v3.8. **Handoff close tables no longer carry a HEAD value** —
it cannot be accurate when written, and three consecutive sessions recorded a wrong one.
Terminal HEAD moves to `DOCUMENT_MANIFEST.tsv`. SBOM numbering settled as one shared
space with a derivation rule. **47 manifest rows added** for Sessions 81–98 and 101–106,
closing a 27-session hole. Downloads inventory found System Prompt v37 and v38 present,
retracting a "no file on disk anywhere" claim.

#### Session 111 (v1.79) — The verify script becomes a real check
`sovereign_session_verify.sh` v4 → v5, 186 → 364 lines. **Four invariant checks added:**
manifest-to-disk SHA integrity, version-chain continuity, SBOM count accuracy,
PLACEMENT_LOG file existence. **Six standing warnings resolved**, every one a real
staleness — an expected HEAD frozen since Session 43, a contract hash frozen at v1.20
since Session 51, filename checks pointing at files that do not exist. Running the script
with full output quoted became a stated close requirement. **First run found four real
manifest SHA drifts.**

#### Session 112 (v1.80) — Lessons 13–23 and the enforcement layer
`AGENT_REFERENCE.md` v3.9 → v3.10, 2,212 lines. **Lessons 13–23 imported verbatim from
`PROJECT_SUMMARY.md` Part 7** — flagged as a structural gap five times, the content
having been in the repository the whole time in a second lineage using a different
heading format. Four manifest SHA drifts corrected. `docs/40` §10 appended.
`pull_category3_docs_to_icloud.sh` marked broken. Three frozen hash expectations reported
and **deliberately not refreshed** — a frozen expectation in a script nobody runs should
be deleted.

#### Session 113 (v1.81) — Demonstration-surface defects
Program-count discrepancy **investigated, not changed**: three surfaces, two distinct
datasets plus one dedup-versus-raw filter difference, established with file-level
evidence. Disclosure recommended over a code change. Site obligation status fixed — a
site at 135% displayed "On track"; over-obligation now flags `at_risk`, +3 tests. VIGIL's
three AgentOS ids dotted. Operator label corrected. **A Rule 12 root-cause search found
the same missing upper bound at program level and reported it rather than fixing it**,
because it touched a surface beyond the deliverable's scope.

#### Session 114 (v1.82) — The Screen 1 correction
`statusFromObligationRate` gained the over-obligation case reported by Session 113.
**Program ECHO, at 104%, had been publishing "On Track" to the Home Dashboard while the
platform's own ledger monitor flagged it P1 for exceeding its ceiling and the end-to-end
test asserted CEILING_EXCEEDED.** Alerting and dashboard disagreed; they now agree. +6
tests, proven to fail without the fix by reverting the source. Flagged programs moved 1 →
2. **A Session 113 prediction that this would change a snapshot was checked and found
wrong** — that snapshot renders hardcoded fixtures, not the live seed.

### 5.3 — Sessions 115–126 (merged this session from verbatim sources)

#### Session 115 (v1.84) — Governance-document placement pass
Nine documents placed; no code change. Shell contract v1.28 unchanged (SHA
`c99355ce…681b`). Agents 44, prompts 20 unchanged. JS/TS 2,059; Python 195 (no change —
placement-only session). Zero new production dependencies.

Documents placed: `AGENT_REFERENCE.md` (v3.10 → v3.11, Lessons 40–45 imported, Lessons
1–45 continuous); `Agent_Identity_Standard.md` (v1.1 → v1.2, Sessions 107–114
confirmation, agent-id formatting); `SOVEREIGN_Platform_Integration_Brief_v1.61.md`
(supersedes v1.58); `SOVEREIGN_Strategic_Plan_CTO_Demo_v3.14.md` (supersedes v3.11);
`SOVEREIGN_Remaining_Build_Backlog_v6_20260815.md` (supersedes v3_20260806; **renamed**,
D1); `GD-42_APPROVED_and_GD-40_Amendment.md` (source for GD Registry entry, not the
registry); `SOVEREIGN_CTO_Framework_Applied_v2.md` (new family, authored name preserved);
`SBOM_Registry_v1.83_MERGED.md` (supersedes v1.44 (disk) and v1.74 (never placed));
`DOCUMENT_MANIFEST.tsv` (Session 115 batch, 111 rows verified against disk). One filename
reconciliation (D1): staged `SOVEREIGN_Remaining_Build_Backlog_v6.md` placed as
`..._v6_20260815.md` to match the on-disk version+date convention; its manifest row
corrected to agree — the only content change to any staged document this session.
Superseded versions (Brief v1.58, Strategic Plan v3.11, Backlog v3_20260806, SBOM
registry v1.44) not deleted — historical record. Items outstanding: GD Registry does not
yet contain GD-42 or the GD-40 amendment (Governance Agent scope);
`DOCUMENT_MANIFEST_v4.tsv` stale July-31 artifact in `~/Downloads` reported not deleted;
`AGENT_REFERENCE.md` v3.11 manual copy to iCloud root + project knowledge still pending
(eighth consecutive session).

#### Session 116 (v1.85) — Demonstration-surface repair
D1 investigations, D2 text fixes, D3/D4 optional polish. Shell contract v1.28 unchanged.
Agents 44, prompts 20 unchanged. JS/TS 2,059 (none net — five apex assertions + one shell
snapshot set updated in place to match the intentional F-9/F-11 narrative change and the
F-10 label; no tests added or removed); Python 195. Zero new production dependencies.

Source changed: `module-apex/src/banners.tsx`, `module-aria/src/banners.tsx`,
`module-flowpath/src/banners.tsx` (F-18 — classification refusal wording);
`module-workspace/src/WorkspaceApp.tsx` (F-32, F-35 — banner text; cost-coverage
plain-English + `<details>` toggle); `module-scribe/src/TTManagerReview.tsx` (F-37 —
draft header text); `sovereign-shell/src/main.tsx` (F-1 — dev-user clearance reseed CUI →
UNCLASSIFIED); `module-apex/src/ppbe-dashboard.ts` (F-9, F-11 — `obligationRate()`
narrative currency format, percent de-dup); `sovereign-shell/src/PlatformHome.tsx` (F-10
— "As of FY 2026 Q4" reporting-period label); `module-nexus/src/NexusApp.tsx` (F-16 —
GD-10 boundary colour amber → blue guardrail); five apex test files +
`sovereign-shell/…/*.snap` (test/snapshot updates for intentional changes);
`verify_engineering_profile.sh` (F-4 — now tracked). Items outstanding: **F-25
(structural)** — SCRIBE's six product-aligned drafting modes navigate to the destination
product but never publish an item into its queue; needs a cross-module publish surface +
destination ingestion (+ likely a new `SovereignEventType`) — a governance decision, not
a Build Agent repair; **F-20** investigated, ready to build, not applied; F-37 follow-on
(real edit capability for TT Review draft); `.sovereign_check_baseline` — the pre-commit
Tier-1 hook suggested raising `EVENTTYPE_NOT_PROPAGATED` (79) and `LOGGER_EVENTS_UNROUTED`
(94), **not actioned** (opening-prompt §5 forbids raising any baseline; pre-existing
Stage-4-unbuilt scope, Lessons 41–44); report-only F-8, F-22, F-31, F-39.

#### Session 117 (v1.86) — SCRIBE app-wide AI-disclosure banner (F-20)
Single deliverable; presentational addition only. Shell contract v1.28 unchanged. Agents
44, prompts 20 unchanged. JS/TS 2,063 (**+4**, all new assertions in
`module-scribe/tests/ScribeApp.test.tsx`: exact disclosure text on the default Drafting
Modes tab, banner still present after switching to Time & Travel Review, banner still
present after switching to PPBE Exhibits, single-instance check); Python 195. Zero new
production dependencies.

Source changed: `module-scribe/src/banners.tsx` (**new file** — local Category-2
governance-guardrail primitive: `governanceBannerStyle` (blue `#eff6ff`/`#1e40af`,
matching APEX/FLOWPATH), `GovernanceBanner`, `Gate1Banner` (the exact CPMI-VRS Gate 1
disclosure text)); `module-scribe/src/ScribeApp.tsx` (import `Gate1Banner`, render at the
composition-root top level above the surface toggle, so it appears on all three tabs);
`module-scribe/tests/ScribeApp.test.tsx` (+4). Style-constant decision (D1): duplicated
`governanceBannerStyle` locally rather than importing from `module-apex`/`module-flowpath`
— no module in this codebase imports from another `module-*`; the local copy is the
convention-matching choice. `SmartCapturePanel.tsx:61` left untouched (out of scope).
Items outstanding: F-25 (structural) still open from Session 116; `.sovereign_check_baseline`
unchanged.

#### Session 118 (v1.87) — Demonstration-surface repair, F-40–F-50
Seven fixes built, two report-only findings, two addendum investigations (F-41, F-43).
Shell contract v1.28 unchanged. Agents 44, prompts 20 unchanged. JS/TS 2,079 (**+16**:
module-nexus +7 (2 hook return-contract tests + 3 F-50 form-preservation tests in new
`TTIntakeForms.test.tsx`, 2 F-49 routing-table tests in new `RequestIntakePanel.test.tsx`);
module-apex +7 (2 F-40/F-45 percent-symbol tripwire tests in new
`percent-symbol-convention.test.tsx`, 2 F-48 table tests, 3 F-42 program-context tests);
sovereign-shell +2 (F-47 bar-colour and overflow-marker tests)); Python 195. Zero new
production dependencies.

Source changed: `module-nexus/src/useTTIntake.ts` (F-50 — `submitTravel`/`submitTime`
return a commit-success boolean, was void); `module-nexus/src/TTIntakeForms.tsx` (F-50 —
form bodies clear state only on a successful commit); `module-nexus/tests/TTIntakeForms.test.tsx`
(new, 3 tests) + `module-nexus/tests/useTTIntake.test.tsx` (+2);
`module-apex/src/PortfolioDashboard.tsx`, `ReportCharts.tsx`, `synthetic-world-model.ts`,
`ppbe-dashboard.ts`, `ppbe-ledger-monitor.ts`, `ppbe-scenario-analyst.ts`,
`module-flowpath/src/benchmark-scenarios.ts`, `synthetic-elicitation.ts`,
`IndividualWorkstyle.tsx`, `sovereign-data/src/synthetic/staff-seed.ts`, `ppbe-seed.ts`
(F-40/45 — "N percent" → "N%", "percentage points" → "points" across narrative/evidence
strings); `module-apex/tests/percent-symbol-convention.test.tsx` (new tripwire, 2 tests)
+ six existing apex test files updated; `module-apex/src/PPBEProgramDetail.tsx` (F-48 —
"Actual" → "Obligated", site table reordered with computed Variance column) +
`PPBEDashboard.tsx` (F-48 Rule 12 — same relabel); `module-nexus/src/RequestIntakePanel.tsx`
(F-49 — TRAVEL_REQUEST + TIME_RECORD routing rows); `module-apex/src/ReportGenerationPanel.tsx`
(F-42 — new optional `initialProgramId` prop) + `ApexApp.tsx` (F-42 — passes
`selectedProgram`); `sovereign-shell/src/PlatformHome.tsx` (F-47 — bar fill keyed to
status, striped end marker for >100%) + `shell-nav-snapshots.test.tsx` (+2 tests, 4
snapshots updated, diff verified bar-markup only). Items outstanding: **F-46 — no defect
found in the repository** (rehearsal-observed "DOE PPBE Reform" and garbled clause exist
nowhere in code, git history, or loaded regulatory source; recommended live re-check);
**F-41** — all 17 World Model responsible parties are "Program Manager <name>"
(report-only; column-rename decision is Governance Agent's); F-43 resolves to a real
target (no fix needed); F-31 "Walkthrough B" is real/tracked (docs/13); F-25 standing;
`.sovereign_check_baseline` untouched.

#### Session 119 (v1.88) — F-41 column rename
Single deliverable, label-level change only. Shell contract v1.28 unchanged. Agents 44,
prompts 20 unchanged. JS/TS 2,080 (**+1**, one new test in
`module-apex/tests/PortfolioDashboard.test.tsx` asserting the renamed column header);
Python 195. Zero new production dependencies.

Source changed: `module-apex/src/PortfolioDashboard.tsx` (column header "Responsible
party" → "Program Manager", one `<th>`); `module-apex/tests/PortfolioDashboard.test.tsx`
(+1 test pinning the new header and absence of the old). Items outstanding (the opening
prompt's stop condition — reported, not acted on): the same program-level label appears
at `ProgramDetailView.tsx:85`; `ProvenancePanel.tsx:40` also uses "Responsible party" but
as a DC-3 provenance-record field (different semantic context, probably correctly left as
is); data-redundancy observation — with the column titled "Program Manager," each cell
reads "Program Manager Dana Jones", so stripping the prefix from the 17 seed values would
touch `synthetic-world-model.ts` (out of scope); F-25 / F-44 untouched.

#### Session 120 (v1.89) — Program-Manager prefix strip (F-41 follow-on)
Single deliverable, seed-data label change only. Shell contract v1.28 unchanged. Agents
44, prompts 20 unchanged. JS/TS 2,081 (**+1**, one new test in
`PortfolioDashboard.test.tsx` pinning the bare names and absence of the old prefixed
form); Python 195. Zero new production dependencies.

Source changed: `module-apex/src/synthetic-world-model.ts` (17 program-level
`responsible_party` values "Program Manager <name>" → "<name>"; the 11 provenance-record
values in DC-3 context deliberately unchanged); `PortfolioDashboard.test.tsx` (+1). Items
outstanding: D1 nuance — `ProvenancePanel.tsx` / `report-generator.ts` render
`ProvenanceRecord.responsible_party` (populated from `risk_flags[].provenance` via
`apex-analysis.ts:144`) — same field NAME, different entity, so the DC-3 context keeps its
role-prefixed values; `ProgramDetailView.tsx:85` label still open from Session 119;
transient test-runner note — one full `module-apex` run showed a suite-level worker
failure on `ProvenancePanel.test.tsx` with all executed tests passing, suite passed in
isolation and in two consecutive full re-runs (29/29 suites, 252/252 tests), not
reproducible; F-25 / F-44 / Gate 3 untouched.

#### Session 121 (v1.90) — Program Detail label rename + nine-convention survey
D1: Program Detail header label rename (one line). D2: nine-convention consistency
survey, **report-only, zero code changes**. Shell contract v1.28 unchanged. Agents 44,
prompts 20 unchanged. JS/TS 2,082 (**+1**, one new test in `ProgramDetailView.test.tsx`
pinning the renamed header label); Python 195. Zero new production dependencies.

Source changed: `module-apex/src/ProgramDetailView.tsx` (header label "Responsible
party:" → "Program Manager:", one line, D1); `ProgramDetailView.test.tsx` (+1). D2
produced zero code changes — all D2 output is the survey report in the handoff. D2
findings: **6 substantive** (2 banner-wording/coverage gaps in NEXUS and SCRIBE, 2
missing/misleading AI disclosures in VIGIL and LENS, 1 fixed-colour completion bar in
APEX ReportCharts, 1 partial-coverage pattern across COUNSEL/APEX/FLOWPATH Gate 1
banners); conventions 2, 3, 4, 8, 9 confirmed clean platform-wide. None fixed this
session, by instruction.

#### Session 122 (v1.91) — Gate 1 standardization (D1–D8)
All eight deliverables completed: the six fix-recommended Session 121 survey findings plus
platform-wide Gate 1 standardization. Shell contract v1.28 unchanged. Agents 44, prompts
20 unchanged. JS/TS 2,090 (**+8**: module-vigil +2, module-scribe +1, module-lens +1,
module-apex +2, module-flowpath +1, module-counsel +1); Python 195. Zero new production
dependencies.

Source changed: D1 `module-vigil/src/banners.tsx` (**new**) + `VigilApp.tsx` (app-wide
Gate 1 banner, F-20 pattern); D2 `module-nexus/src/NexusApp.tsx` (GD-10 inline banner →
corrected F-18 wording, intake framing kept); D3 `module-scribe/src/banners.tsx`,
`ScribeApp.tsx` (`ClassificationBoundaryBanner` added at composition root beside Gate 1);
D4 `module-lens/src/LensApp.tsx` (banner sentence extended: Explainer answers
AI-generated/advisory); D5 `module-apex/src/ReportCharts.tsx` (completion bar keyed to
program status, F-47 map); D6 `module-apex/src/ApexApp.tsx`, `PortfolioDashboard.tsx`,
`GateRunnerPanel.tsx`, `ReportGenerationPanel.tsx` (Gate 1 consolidated to root across 5
tabs, 3 panel instances removed); D7 `module-flowpath/src/FlowpathApp.tsx`,
`SessionManager.tsx`, `ElicitationDialogue.tsx`, `GateRunnerPanel.tsx` (Gate 1
consolidated to root, 3 panel instances removed); D8 `module-counsel/src/DecisionFramer.tsx`,
`CounselApp.tsx` (`Gate1DisclosureStrip` extracted, rendered at root for all post-framing
stages, acknowledge gate untouched); 9 test files across six modules (+8 tests, 4
panel-level pins updated). Items outstanding: **survey correction** — FLOWPATH had THREE
panel-level Gate 1 instances, not the five the Session 121 survey stated (five was the
GD-10 surface count); follow-on observation — with Gate 1 consolidated, the GD-10 banners
still render at panel level in APEX/FLOWPATH (a placement asymmetry), not in scope this
session; Gate 1 coverage now uniform across all seven AI-assisted modules (SCRIBE, NEXUS,
VIGIL, LENS, APEX, FLOWPATH, COUNSEL); ARIA/AgentOS correctly carry none; F-25 / F-44 /
Gate 3 / `.sovereign_check_baseline` untouched.

#### Session 123 (v1.92) — GD-10 root consolidation (Session 122 follow-on)
Close the GD-10/Gate 1 placement asymmetry: GD-10 consolidated to the APEX and FLOWPATH
composition roots (D1, D2). Banner placement change only — GD-10 wording unchanged. Shell
contract v1.28 unchanged. Agents 44, prompts 20 unchanged. JS/TS 2,089 (**−1**: the two
consolidations strengthened existing assertions rather than adding tests; one obsolete
FLOWPATH test — `SessionManager` "renders the GD-10 classification boundary banner" —
removed because GD-10 no longer renders at panel level, its coverage moving to the
FlowpathApp all-tabs test; net −1); Python 195. Zero new production dependencies.

Source changed: D1 `module-apex/src/ApexApp.tsx` (`ClassificationBoundaryBanner` added at
root beside `Gate1Banner`), `PortfolioDashboard.tsx`, `GateRunnerPanel.tsx`,
`ReportGenerationPanel.tsx` (panel-level GD-10 instance + import removed, 3 panels); D2
`module-flowpath/src/FlowpathApp.tsx` (banner added at root), `SessionManager.tsx`,
`ElicitationDialogue.tsx`, `WorkflowArtifactReview.tsx`, `IndividualWorkstyle.tsx`,
`GateRunnerPanel.tsx` (panel-level GD-10 instance + import removed, 5 panels); 6 test
files (4 panel pins updated, 1 obsolete test removed, 2 all-tabs tests extended to both
banners). Items outstanding: **premise correction (Rule 8 / Lesson 26)** — the opening
prompt stated FLOWPATH's GD-10 sat at "three panel-level locations"; in fact GD-10
rendered on **all five** FLOWPATH tab-components, so the consolidation deduplicates rather
than closing a coverage gap; only APEX had the two-uncovered-tabs gap the follow-on
described. Gate 1 + GD-10 placement now symmetric across the two flagged modules; F-25 /
F-44 / Gate 3 / `.sovereign_check_baseline` and COUNSEL/VIGIL/LENS/NEXUS/SCRIBE untouched.

#### Session 124 (v1.93) — F-51 SCRIBE static-fallback placeholder gate
Close F-51: SCRIBE's static-fallback schema validation accepted unedited placeholder text
as satisfying the schema, enabling Approve & export with no human content typed. Fixed
across all six product-intake drafting modes. Validation-logic change only. Shell contract
v1.28 unchanged. Agents 44, prompts 20 unchanged. JS/TS 2,102 (**+13**, all in
`module-scribe`: new file `draft-placeholder-gate.test.ts` — 1 sentinel-detection test + 6
modes ×[(a) fresh static fallback fails the gate + (b) real content substituted passes];
`draft-engine.test.ts` edited but count unchanged); Python 195. Zero new production
dependencies.

Source changed (all D4): `module-scribe/src/draft-contract.ts` (`FALLBACK_SENTINELS`
(single source of truth), `isUnfilledPlaceholder`, `collectPlaceholderErrors`;
`validateModeOutput` now rejects unedited-placeholder content after structural
validation); `draft-engine.ts` (`PLACEHOLDER`/`UNAVAILABLE` fallback strings now built
FROM `FALLBACK_SENTINELS` so generator and detector cannot drift — strings byte-identical
to before); `tests/draft-placeholder-gate.test.ts` (new, 13 tests); `tests/draft-engine.test.ts`
(two tests encoding the old buggy behavior corrected). Items outstanding: **Rule 12
finding — same defect class latent in two SCRIBE surfaces outside the six named modes
(surfaced, not fixed)**: `validateTTDraft` (`tt-draft-contract.ts`) and
`validatePPBEExhibitDraft` (`ppbe-exhibit-contract.ts`) both use the same
non-empty-string-only checks with no placeholder exclusion, and both engines emit static
fallbacks carrying the same sentinels; TT Manager Review has no Approve control (WH-28),
so its exposure is limited; PPBE Exhibit does have an export path — a governance decision;
Synthesis/Framing untouched; F-25 / F-44 / Gate 3 / `.sovereign_check_baseline` untouched.

#### Session 125 (v1.94) — F-51 gate extended to validateTTDraft; PPBE stopped/surfaced
Extend the F-51 static-fallback placeholder gate to the two SCRIBE drafting validators
Session 124 surfaced. **TT (`validateTTDraft`) fixed via clean reuse; PPBE
(`validatePPBEExhibitDraft`) STOPPED and surfaced** — its engine's static fallback
carries a different sentinel not captured in `FALLBACK_SENTINELS`, so reuse would ship a
no-op gate. Validation-logic change only. Shell contract v1.28 unchanged. Agents 44,
prompts 20 unchanged. JS/TS 2,120 (**+18**, all in `module-scribe`: new file
`tt-draft-placeholder-gate.test.ts` — 9 TT communication types ×[(a) fresh static
fallback fails `validateTTDraft` with a `/placeholder/` error + (b) real body substituted
passes]; arithmetic 2,102 + 18 = 2,120); Python 195. Zero new production dependencies.

Source changed (all D4): `module-scribe/src/draft-contract.ts` (`collectPlaceholderErrors`
changed module-private → **exported** so the TT validator reuses the exact same walk —
Rule 11, one detector; no logic change); `tt-draft-contract.ts` (`validateTTDraft` now
runs `collectPlaceholderErrors` after structural validation, mirroring `validateModeOutput`);
`tests/tt-draft-placeholder-gate.test.ts` (new, 18 tests). PPBE
(`ppbe-exhibit-contract.ts` / `ppbe-exhibit-engine.ts`) NOT touched. Items outstanding:
**PPBE Exhibit STOPPED and surfaced per §4 autonomous rule** — direct reproduction shows
the shared detector `isUnfilledPlaceholder` returns `true` for the TT static fallback
(carries `unavailableCore` = "this is a static fallback, not a generated draft" verbatim)
but **`false`** for the PPBE static narrative (`ppbe-exhibit-engine.ts:160` `STATIC_NOTICE`
reads different wording captured in neither `FALLBACK_SENTINELS` member); shipping the
gate via plain reuse would be a no-op safeguard on the one surface with a live export path
(`recordExhibitSignOff`, `ppbe-exhibit-contract.ts:288`) — a Rule-17 false safeguard.
**Recommendation: authorize option (b)** — rebuild both engines' "unavailable" notices
from `FALLBACK_SENTINELS.unavailableCore`, then add the identical gate to
`validatePPBEExhibitDraft`. TT's sentinel match is currently a coincidence, not a Rule-11
guarantee (`TT_UNAVAILABLE`, `tt-draft-engine.ts:196`, hardcoded). TT exposure remains
theoretical (WH-28): `TTManagerReview.tsx` has no Approve/Deny/Escalate control and its
Send action (`recordSend`) is not gated by `validateTTDraft`. Synthesis/Framing; F-25 /
F-44 / Gate 3 / `.sovereign_check_baseline` untouched.

#### Session 126 (v1.95) — F-51 closed for PPBE exhibits via option (b)
Close PPBE Exhibit's F-51 gap via the authorized option (b): rebuild both TT's and PPBE's
"unavailable" static-fallback notices FROM `FALLBACK_SENTINELS.unavailableCore` (not
hardcoded), then add the placeholder-rejection gate to `validatePPBEExhibitDraft`.
Validation-logic + generator-text change only. Shell contract v1.28 unchanged. Agents 44,
prompts 20 unchanged (PPBE exhibit drafting prompt remains PENDING, synthetic-data only).
JS/TS 2,126 (**+6**, all in `module-scribe`: new file `ppbe-exhibit-placeholder-gate.test.ts`
— 3 PPBE modes (BUDGET_EXHIBIT, CONGRESSIONAL_JUSTIFICATION, EVALUATION_REPORT) ×[(a)
fresh static fallback fails `validatePPBEExhibitDraft` with a `/placeholder/` error + (b)
real narrative substituted passes]; arithmetic 2,120 + 6 = 2,126); Python 195. No net e2e
test-count change (three e2e tests had assertions added/updated within existing `it()`
blocks; `test:e2e` stays 164 total — 160 passed + 4 skipped). Zero new production
dependencies.

Source changed: D2 `module-scribe/src/tt-draft-engine.ts` (`TT_UNAVAILABLE` now built FROM
`FALLBACK_SENTINELS.unavailableCore`; resulting string byte-identical to before, so no TT
test asserts changed text; closes the Session 125 §6.2 latent-drift item, Rule 11); D2
`ppbe-exhibit-engine.ts` (`STATIC_NOTICE` rebuilt from `FALLBACK_SENTINELS.unavailableCore`;
wording changed to preserve and sharpen the governed-record distinction — PPBE's static
tier assembles real figures + citations from governed records, only the narrative prose is
non-generated); D4 `ppbe-exhibit-contract.ts` (`validatePPBEExhibitDraft` now runs
`collectPlaceholderErrors` after structural/traceability checks, mirroring
`validateModeOutput`/`validateTTDraft`; closes F-51 at the live sign-off gate
`recordExhibitSignOff`); D4 `tests/ppbe-exhibit-placeholder-gate.test.ts` (new, 6 tests);
`tests/ppbe-exhibit-drafter.test.ts` (one existing test flipped — unedited static fallback
previously passed, now correctly fails); e2e `ppbe-full-cycle.test.tsx` and
`ppbe-live-smoke.test.ts` (expectation updates only, no source change). Items outstanding:
**`STATIC_NOTICE` reviewer-facing text changed** (surfaced, not hidden; old and new
wording quoted in the Session 126 handoff/SBOM; invariant is the notice must contain
`FALLBACK_SENTINELS.unavailableCore` verbatim or the gate silently stops firing); **§4
surface question assessed, NOT a stop** — "static" is not a misleading label (figures are
real governed records assembled deterministically, the narrative is a non-generated count
sentence); three e2e tests carried the pre-F-51 assumption and were updated, not worked
around (the opt-in LIVE-half exhibit assertion is not exercised in the standing hermetic
suite — Rule 9, recorded as unverified-in-CI); Synthesis/Framing; F-25 / F-44 / Gate 3 /
`recordExhibitSignOff` beyond the gate; `.sovereign_check_baseline` untouched.

---

## 6 — What Remains Genuinely Unmerged

**The v1.83 §6 backlog is closed.** All six sessions v1.83 named as genuinely unmerged —
99, 101, 102, 103, 104, 106 — had, at v1.83's time, no verbatim SBOM source available to
merge from. Their source files are now present on disk and are merged verbatim in §5.1
above. Nothing from that named set remains.

**Sessions 115–126** are merged verbatim in §5.3. Nothing in the "since v1.83" range
remains.

**One provenance nuance is surfaced here, recorded not acted on** (per Session 127
opening-prompt §4 — a surface, not a stop): v1.83 §5 reproduces Sessions 107–114 verbatim
but carries Sessions 77–106 only as the assertion "everything in v1.74," where v1.74 was a
merged-registry draft **never placed on disk**. This registry carries 107–114 forward from
v1.83 unaltered (§5.2) and does not reproduce 77–106 verbatim — that content lives in
v1.83 in summary-derived-from-v1.74 form only. Many of the per-session SBOM source files
for that range **do exist on disk** (e.g. `SBOM_Session80–98`, `100`, `105`; Sessions
77–79 under the non-standard names `SBOM_TCO1/TCO2/GD33_Update.md`; Sessions 86 and 89
recorded reflections/verifications with no SBOM). A future pass could verbatim-merge that
range if the Governance Agent wants the registry fully verbatim end-to-end. That decision,
and whether it is worth doing, belongs to the Governance Agent / Project Principal — it was
not in this session's authorized scope (the six named + the twelve since v1.83).

---

## 7 — Governance Decisions in This Window

**Sessions 99–106.** GD-36 through GD-41 moved PROPOSED → APPROVED (Session 99). GD-40's
subject corrected to entity resolution for the two program datasets (the MCP-serving
mislabel removed). GD-38's approval authorizes the `SCHEMA_APPROVAL` mechanism; the
shell-contract change is deferred to Phase 3+. GD-41's Decision field corrected to the
unconditional Project Principal answer (Session 104). Next available after Session 106:
**GD-42.**

**Sessions 115–126.** **GD-42 — APPROVED August 15, 2026** and **GD-40 — AMENDED August
15, 2026**, recorded in the placed source document `GD-42_APPROVED_and_GD-40_Amendment.md`
(Session 115); the GD Registry file itself did not yet contain them at Session 115 close
(Governance Agent scope). Every session from 115 through 126 records **next available
GD-43**; no session in this window raised a GD, and no shell-contract change was raised by
any.

No shell-contract change occurred anywhere in this window.

---

## 8 — The Enforcement Layer

Carried forward from v1.83 §8; unchanged in mechanism through Session 126.

| Tier | Mechanism | State at Session 126 |
|---|---|---|
| 0 | Context gather script | Live; blocked a paste correctly in Session 113 |
| 1 | `.githooks/pre-commit` | **Live and BLOCKING** on growing cross-artifact drift. Baselines `EMITTED_NOT_IN_CONTRACT=4`, `STALE_CONTRACT_HASH_IN_TOOLING=3` |
| 2 | `sovereign_session_verify.sh` v5 | Four invariant checks, full output quoted at every close |
| 3 | Periodic orphan and lineage scan | **Not built** |

Two Tier 1 checks are **parked rather than baselined** because their parsers do not
measure the property they name. `.githooks/commit-msg` strips attribution trailers and is
verified holding: zero trailers, zero model names across the last 60 commits.
`core.hooksPath` must be set once per clone — the directory is versioned, the pointer is
not. Session 116 recorded that the pre-commit Tier-1 hook suggested raising
`EVENTTYPE_NOT_PROPAGATED` (79) and `LOGGER_EVENTS_UNROUTED` (94); both were **not
actioned** across Sessions 116–126 — they reflect pre-existing Stage-4-unbuilt scope
(Lessons 41–44), and opening prompts forbid raising any baseline. `.sovereign_check_baseline`
was left untouched by every session in this window.

---

*SOVEREIGN Platform — SBOM Registry v1.96 (MERGED) · August 20, 2026 · Build Agent mechanical merge (Session 127)*
*Supersedes v1.83 (MERGED, through Session 114) and per-session updates v1.84–v1.95 (Sessions 115–126).*
*Closes the v1.83 §6 backlog: Sessions 99, 101–104, 106 recovered verbatim from disk.*
*Merges Sessions 115–126 from verbatim sources. Test-count chain verified unbroken 114→126.*
*Individual per-session SBOM files are NOT deleted — they remain the primary source record.*
*Pre-Decisional · Internal Working Document*
