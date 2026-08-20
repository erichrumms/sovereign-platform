# SOVEREIGN Platform — Session 118 Handoff
## Demonstration-Surface Repair, F-40–F-50 + Addendum F-41/F-43 · August 19, 2026 · Build Agent

**Session opened against:** HEAD `a863189` (Session 117 terminal `7f5407d` + two placement
commits, as the opening prompt anticipated). Shell contract v1.28 verified at open, both copies
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`.
**Scope:** D1 (seven Tier 0 investigations + two addendum investigations) and D2 (F-49 as
specified; F-50, F-46, F-40/45, F-48, F-42, F-47 per their D1 findings, in the Build Brief's
priority order). **Every priority-ordered item was reached — the list was completed in full.**
No shell-contract change. F-25 and `.sovereign_check_baseline` untouched, as instructed.

---

## D1 — Investigation findings (verbatim)

### F-50 — Travel Request intake form clears entirely on validation error

**FINDING:** Explicit state clear, NOT a re-mount. `TTIntakeForms.tsx:39-42` (pre-fix):
`onSubmit` called `tt.submitTravel(form)` and then unconditionally `setForm({ ...EMPTY_TRAVEL_FORM })`.
`submitTravel` (`useTTIntake.ts`) returned `void`; on a validation failure it set the hook's
`error` state and returned — the caller had no way to know, and cleared anyway.
**EVIDENCE:** `buildTravelRequest` returns `{ ok: false, errors }` on invalid input
(`tt-intake.ts:84-147`); `submitTravel` consumed it silently from the form's perspective.
**Containment check (the stop condition):** only `TTIntakeForms.tsx` calls
`submitTravel`/`submitTime` anywhere in the codebase — the hook is TT-intake-specific, not
shared form infrastructure. Contained → proceeded to D2.
**Rule 12:** the identical unconditional clear existed in `TimeIntakeFormBody` (same file,
lines 129-132). Fixed with the same contract; recorded here explicitly.

### F-42 — Export Dossier navigates without carrying program context

**FINDING:** Smaller than the brief assumed. `ApexApp.tsx:67-70` `exportDossierFor` ALREADY
stored the clicked program id in `selectedProgram` before `setTab("report")` — but
`ReportGenerationPanel` (line 102) never received it, and initialized its own dropdown to
`programs[0]` (P-100). The fix was the brief's "piece of state already available at the click
site": a new optional `initialProgramId` prop, validated against `adapter.listPrograms()` with
fallback to the first program. No navigation restructuring; the relabel fallback was not needed.

### F-47 — Program Health progress bar doesn't reflect status or overflow

**FINDING:** Confirmed one shared component — `ProgramTile` in `sovereign-shell/src/PlatformHome.tsx`
(lines 143-153 pre-fix): fixed `background: "#3b82f6"` (blue) regardless of `snapshot.status`,
width `Math.min(pct, 100)%` with no overflow treatment.
**Fix and choice made:** fill colour keyed to status via a `BAR_FILL_BY_STATUS` map using the
StatusBadge *text* colours already in the component (`#166534` green / `#854d0e` amber /
`#7f1d1d` red) so bar and badge can never disagree (Rule 11 — one status, one colour family).
Over-100%: capped bar plus a 7px striped end marker (dark-red/light-red repeating gradient) at
the right edge, absent at exactly 100%; tooltip states the real percentage ("104% obligated —
exceeds 100% of the annual plan"). This is the brief's suggested "capped bar with a distinct
end marker" default. 4 shell snapshots updated; the diff was inspected line-by-line before
`--updateSnapshot` and contained only the bar markup (colour, `position: relative`, testids).

### F-48 — Site breakdown and variance-history tables inconsistent

**FINDING:** Both components live in `module-apex/src/PPBEProgramDetail.tsx` — quarterly table
header "Actual" at line 307 (plus the chart legend `name="Actual"` at line 292, same section),
site table at lines 368-397 ordered Obligated → Planned with no Variance column.
**Fix:** header and legend relabelled "Obligated"; site table reordered to
Planned → Obligated → Variance → Status; Variance computed as `obligations_to_date −
planned_amount` (positive when over plan) and rendered with the quarterly table's exact
convention ("On plan" at zero, signed currency otherwise, same colours).
**Rule 12:** the identical "Actual" label existed on `PPBEDashboard.tsx` (legend item line 236,
bar name line 297, table header line 308) — relabelled there too. Display labels only; data
keys, section headings ("Budget-to-actual variance"), and aria-labels unchanged.

### F-40 / F-45 — "percent" spelled out — repo-wide sweep

**Every file found (the brief's grep, plus a residual re-scan after fixing):**
`module-apex`: PortfolioDashboard.tsx, ReportCharts.tsx, synthetic-world-model.ts,
ppbe-dashboard.ts, ppbe-ledger-monitor.ts, ppbe-scenario-analyst.ts, tt-pattern-analyst.ts
(comment only), PPBEProgramDetail.tsx (comment only); `module-flowpath`: flowpath-contract.ts
(comment only), synthetic-elicitation.ts, benchmark-scenarios.ts, IndividualWorkstyle.tsx;
`sovereign-data`: staff-seed.ts, ppbe-seed.ts (data strings — the brief's truncated grep showed
only its comments), program-record.ts (comment only); `shell-contract.ts` +
`sovereign-shell/shell-contract.ts` (comment only — untouchable regardless, and left untouched).
**Fixed:** every rendered/user-facing string across ~60 instances, three forms: numeric
("62 percent" → "62%"), template (`${index} percent` → `${index}%`), and word-number
("ninety-five percent" → "95%"). **Choice made:** "N percentage points" → "N points" — "8%"
would be numerically wrong, and the same file already used "roughly 8 points above the planned
rate" as its own precedent. Comments and type identifiers left unchanged (one numeric comment
line in ppbe-ledger-monitor.ts was caught by the mechanical transform — harmless, noted).
**Behaviour check:** FLOWPATH's threshold strings are parsed by `leadingNumber()`
(flowpath-contract.ts:354-357), which extracts the leading numeral regardless of unit wording —
"8%" parses identically to "8 percent". No behaviour change.
**Tripwire test added** (`module-apex/tests/percent-symbol-convention.test.tsx`): scans every
World Model string for `\d percent|percentage points` and asserts the dashboard renders
"62% complete". Six existing test files updated to the new strings.

### F-46 — ARC "DoD PPBE Reform" template typo — **NO DEFECT FOUND IN THE REPOSITORY**

**FINDING:** The observed strings do not exist in the current code, in git history, or in the
loaded content. Evidence, per the Committee Review Standard:
- `grep -rn "DOE PPBE"` across all .ts/.tsx: zero matches (the only repo-wide hit is the
  Session 118 Build Brief document itself).
- `git log -S "DOE PPBE"` and `git log -S "is always regulatory"`: no code commit has ever
  contained either string — the only match is `a863189`, the Build Brief placement commit.
- The auto-population path is fully deterministic: `ArcImpactModeler.tsx` `buildDescription()`
  (lines 69-75) produces "Proposed change to ${sourceTitle} … that depend on this regulatory
  source, …" — grammatical, and the only "Proposed change to" template in the repo. Titles come
  from `REGULATORY_SOURCES` (clear-engine.ts:47-52), where all four are correct, including
  `title: "DoD PPBE Reform"`.
- Spot-check the brief asked for: OMB Circular A-11, Anti-Deficiency Act, and Evidence Act
  titles and their markdown source files are clean; `dod-ppbe-reform.md` content is clean.
**Assessment (Lesson 45 — change the claim, not the code):** no code change was made; there is
nothing in the repository to fix. The description field is a user-editable textarea — a
mid-rehearsal edit, a stale dev bundle, or a transcription error into the brief are the
plausible explanations; this document cannot distinguish them. **Recommended live re-check:**
ARC tab → select any program → select "DoD PPBE Reform" → read the auto-populated description
against `buildDescription`'s text above.

### F-31 follow-up — "Walkthrough B" IS a live, tracked reference (report, no action)

`grep -rln "Walkthrough B"` resolves to real, placed artifacts: `docs/13_APEX_Architecture.md`
(lines 188, 323, 546-575 — Gate 3 attestation explicitly designated "a Project Principal step
during Walkthrough B", plus the D-APEX-5 benchmark-scenario requirement), live UI text in
`module-apex/src/GateRunnerPanel.tsx` (lines 152, 186), `banners.tsx`, `benchmark-scenarios.ts`,
`apex-contract.ts`, docs/15, e2e tests, and Sessions 17-19/35 close artifacts. The on-screen
reference points at a process that WAS placed — not a dangling reference.
**Bonus (invited by the brief's live-check list, investigated without clicking):** the Gate 3
control (`attestGate3`, GateRunnerPanel.tsx:74-99) requires an attestation note, emits a
`HUMAN_DECISION` / `GATE_3_ATTESTATION` Logger event (permanent audit-log entry — NOT reversible
in the audit sense), then sets component-local state PASSED and unlocks Gate 4. The UI state is
`useState` — a remount resets the panel display, but the audit event remains. The Project
Principal should treat the click as writing a permanent audit record.

### F-41 (Addendum) — Responsible Party composition — report-only

All 17 programs in `module-apex/src/synthetic-world-model.ts` carry
`responsible_party: "Program Manager <name>"` — 17 grep hits, 17 programs (4 original +
13 GD-33), zero other titles. The "Senior Analyst" on CHARLIE seen on the Home Dashboard comes
from a different data source (the PPBE seed's point-of-contact, not the World Model column).
Per the addendum: no code change made; the column-rename question is now answerable and is the
Governance Agent's decision.

### F-43 (Addendum) — "(view source data)" links — resolve to something real; no fix needed

The text at `ProgramDetailView.tsx:121` is INSIDE a button wired to
`openProvenance(flag.flag_id, flag.provenance)` (line 120), which opens the generic DC-3
`ProvenancePanel` (line 129) and emits an `apex_provenance_viewed` audit event. All three P-300
risk flags (R1/R2/R3) carry full provenance records with real `source_data` text
(synthetic-world-model.ts lines 224-263). Not inert, not a dead-end — the rehearsal question
"do they resolve?" is answered YES in code. Worth one live click to confirm rendering, but
there is no missing handler to wire.

---

## D2 — Commits (one per finding, priority order)

| Order | Finding | Commit | Result |
|---|---|---|---|
| 1 | F-50 | `8e95533` | Fixed + 5 tests |
| 2 | F-46 | — | Report-only: no defect exists in the repo (see D1) |
| 3 | F-40/45 | `5c970ea` | Fixed (~60 strings, 10 source files) + tripwire test + 6 test files updated |
| 4 | F-48 | `a5946ca` | Fixed (detail page + Rule 12 dashboard relabel) + 2 tests |
| 5 | F-49 | `108815e` | Fixed (2 rows, distinct approval pathway named) + 2 tests. Dropdown-highlight polish deliberately NOT attempted per the brief's "leave as-is" guidance |
| 6 | F-42 | `19b6233` | Fixed (context-passing, not relabel) + 3 tests |
| 7 | F-47 | `c614170` | Fixed (status colour + overflow marker) + 2 tests, 4 snapshots updated |

---

## Close verification

- **Tests:** all 15 JS/TS workspaces run individually, every exit code 0. JS/TS passing 2079
  (+16: nexus +7, apex +7, shell +2; the 4 key-gated e2e live smokes remain skipped, excluded
  from the count as in v1.86). Python 195, exit 0. **Platform total 2274 passing.**
  Arithmetic: 2063 (Session 117) + 16 new = 2079. ✓
- **tsc --noEmit:** exit 0 in all 15 workspaces.
- **Shell contract:** v1.28 unchanged at close — both copies
  `c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`. ✓
- **SBOM:** v1.87 (`SBOM_Session118_Update.md`) — derived by scan (highest on disk was v1.86).
- Terminal HEAD is recorded in `DOCUMENT_MANIFEST.tsv`, not here (Session 110 convention).

### `sovereign_session_verify.sh` — full output, verbatim

```
Running against: /Users/developmentsystem/Developer/sovereign-platform

============================================================
1. GIT STATE
============================================================
  INFO: HEAD is c614170 (c614170aba4dddd7f19f5b19b42b3c1dd9e6605f)
  (HEAD is informational — terminal HEAD is recorded in DOCUMENT_MANIFEST.tsv at close)
  PASS: Working tree: no uncommitted tracked-file changes

-- Commit 12cb626 (prompt-placeholder fix) --
  PASS: 12cb626 exists

-- Commit 8080347 (Session 38 close) --
  PASS: 8080347 exists

============================================================
2. SHELL CONTRACT HASH
============================================================
  PASS: ./sovereign-shell/shell-contract.ts matches documented v1.28 hash
  PASS: ./shell-contract.ts matches documented v1.28 hash
  PASS: 2 copies of the shell contract found, and they are identical to each other
  (Informational only — other *shell*contract* matches, not hashed as code:)
    ./GD-20_ARIA_CLEAR_ShellContract_APPROVED.md
    ./GD-30_POC_ShellContract_APPROVED.md
    ./GD-20_ARIA_CLEAR_ShellContract.md

============================================================
3. TEST SUITES — real exit code, no truncation (Rule 7)
============================================================
-- JS/TS: discovering test:* scripts from package.json --
  Found: test:shell test:data test:api-client test:counsel test:scribe test:vigil test:lens test:cpmi test:agentos test:nexus test:apex test:flowpath test:aria test:workspace test:e2e
  PASS: test:shell — exit code 0
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
  PASS: test:workspace — exit code 0
  PASS: test:e2e — exit code 0
  JS/TS total from this run: 2079

-- Python: ./sovereign-security via python3 -m pytest --
  Exit code: 0
    sovereign-security/test_sovereign_logger.py ............................ [ 76%]
    .............................................                            [100%]

    =============================== warnings summary ===============================
    ../../Library/Python/3.9/lib/python/site-packages/urllib3/__init__.py:35
      /Users/developmentsystem/Library/Python/3.9/lib/python/site-packages/urllib3/__init__.py:35: NotOpenSSLWarning: urllib3 v2 only supports OpenSSL 1.1.1+, currently the 'ssl' module is compiled with 'LibreSSL 2.8.3'. See: https://github.com/urllib3/urllib3/issues/3020
        warnings.warn(

    -- Docs: https://docs.pytest.org/en/stable/how-to/capture-warnings.html
    ======================= 195 passed, 1 warning in 12.37s ========================
  PASS: Python suite (./sovereign-security) exit code 0 (real run)

============================================================
4. AGENT REGISTRY COUNT (Lesson 12 — count the file directly)
============================================================
  Lines in the file claiming a total:
    1030:**Total registered agents: 36** — *this was the correct count at this specific point
    1388:**Total registered agents after this addition: 44**
    1689:  1013:**Total registered agents: 36** — *this was the correct count at this specific point
    1690:  1371:**Total registered agents after this addition: 44**

============================================================
5. GOVERNANCE ARTIFACTS — do they actually exist in the repo?
============================================================
  PASS: SOVEREIGN_Session38_Handoff.md found: ./SOVEREIGN_Session38_Handoff.md
  PASS: SBOM_Session38_Update.md found: ./SBOM_Session38_Update.md
  PASS: SOVEREIGN_Session38_PromptFix_Handoff.md found: ./SOVEREIGN_Session38_PromptFix_Handoff.md
  PASS: SBOM_Session38_PromptFix_Update.md found: ./SBOM_Session38_PromptFix_Update.md
  PASS: SOVEREIGN_Walkthrough_F_Complete.md found: ./SOVEREIGN_Walkthrough_F_Complete.md

============================================================
6. MANIFEST-TO-DISK INTEGRITY (DOCUMENT_MANIFEST.tsv)
============================================================
  PASS: Manifest integrity: 119 file(s) checked — all present with matching SHA-256

============================================================
7. VERSION-CHAIN CONTINUITY (AGENT_REFERENCE.md)
============================================================
  PASS: Version-chain continuity: all changelog entries appear in the Supersedes chain

============================================================
8. SBOM COUNT ACCURACY
============================================================
  Most recent SBOM: SBOM_Session118_Update.md
  SBOM states: JS/TS=2079  Python=195
  Actual from this run: JS/TS=2079  Python=195
  PASS: SBOM count matches: JS/TS 2079 + Python 195 = 2274

============================================================
9. PLACEMENT_LOG REFERENCED-FILE EXISTENCE
============================================================
  PASS: PLACEMENT_LOG: 39 of 49 placement entries have files on disk
  INFO: 10 entr(ies) not on disk — expected for superseded versions:
    SOVEREIGN_Strategic_Plan_CTO_Demo_v3.3.md
    SBOM_Registry_MergedThroughSession38_COMPLETE.md
    SBOM_Registry_v1.40.md
    SOVEREIGN_Platform_Integration_Brief_v1.47.md
    SOVEREIGN_System_Prompt_v31.md
    SOVEREIGN_Platform_Integration_Brief_v1.49.md
    SOVEREIGN_Strategic_Plan_CTO_Demo_v3.7.md
    SOVEREIGN_New_Conversation_Handoff_v7_20260724.md
    SBOM_Registry_v1.42.md
    SOVEREIGN_CTO_Demonstration_Script_20260806.md

============================================================
SUMMARY: 31 pass / 0 warn / 0 fail
============================================================
This is evidence for the Project Principal's own determination —
nothing in this script self-certifies anything as resolved.
(Rule 17: a check's existence is not evidence of its continued use —
  run this script and quote its FULL output in the handoff every close.)
```

*(A pre-SBOM run of the same script showed 30 pass / 1 fail — the single FAIL was check 8
comparing against Session 117's SBOM before `SBOM_Session118_Update.md` existed. Writing the
v1.87 update resolved it; nothing was changed to make the check pass other than recording the
real new counts.)*

---

## Blockers and findings for the Governance Agent

1. **F-46 requires a claim correction, not a fix** — the Build Brief records it as "Confirmed"
   but the defect does not exist in the repository (full evidence in D1). Recommend the live
   re-check described there before the demonstration, and correcting the finding's status in
   the next brief.
2. **F-41 and F-43 close as report-only** — column-rename decision now unblocked (all 17 are
   Program Managers); the "(view source data)" control is real and wired.
3. **F-31:** Walkthrough B is a real tracked process; the Gate 3 control writes a permanent
   `GATE_3_ATTESTATION` audit event when clicked — the Project Principal should click it only
   as the deliberate Walkthrough B step it is documented to be.
4. **F-25:** untouched, still standing, still a governance decision.
5. The remaining live-check items from the brief's "only you can confirm" list (BY tab content,
   PPBE Coordination tab, SYNTH-PRG-ECHO click path, Anomaly Triage Assistant location, the
   ~/Downloads duplicate script) were not Build Agent tasks and were not attempted.

---

*Session 118 Handoff · August 19, 2026 · Build Agent*
*Pre-Decisional · Internal Working Document*
