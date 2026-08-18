# SOVEREIGN Platform — Session 117 Handoff

**Session type:** Single presentational deliverable — SCRIBE app-wide AI-disclosure banner
(F-20). No shell-contract changes, no new agents, no new event types, no architecture changes.
**Source spec:** `SOVEREIGN_Session117_Opening_Prompt.md` (Governance Agent / Project Principal).
**Opened at HEAD:** `199b667` (Session 117 gather-script + opening-prompt placement commit;
sits on top of Session 116 terminal HEAD `f8e646e`).
**Terminal HEAD:** recorded in `DOCUMENT_MANIFEST.tsv` at close (not here — Session 110
convention).
**Shell contract:** v1.28, `c99355ce…681b` — **confirmed unchanged and identical across both
copies at open AND at close.** No GD executed; no contract touched.

**Done-condition point reached:** D1 (full). No D2/D3/D4 this session. All 15 JS/TS suites +
the Python suite pass at close (2,063 + 195 = 2,258). `tsc` clean (SCRIBE workspace, exit 0).

---

## Commits this session (in order)

| Hash | Deliverable | Summary |
|---|---|---|
| _(D1 code)_ | D1 | F-20 — app-wide CPMI-VRS Gate 1 AI-disclosure banner in SCRIBE |

Close artifacts (`SOVEREIGN_Session117_Handoff.md`, `SBOM_Session117_Update.md`,
`DOCUMENT_MANIFEST.tsv` rows) committed after the above; terminal HEAD recorded in the manifest
via the standard follow-up chore commit (Session 110 convention — a handoff cannot record its own
terminal HEAD). Exact hashes are visible in `git log`; the manifest handoff row carries the
terminal HEAD.

---

## D1 — SCRIBE app-wide AI-disclosure banner (required; only deliverable)

**Spec (opening prompt §4):** add a permanent banner at the `ScribeApp` top level, visible above
all three tabs, using the existing blue `governanceBannerStyle` pattern from APEX/FLOWPATH, with
this exact text:

> AI disclosure (CPMI-VRS Gate 1): All drafting in SCRIBE is AI-assisted. Outputs are advisory and
> must be reviewed and approved by a qualified human before export.

### What was found (structure verified before building — Rule 6 / opening-prompt §5)

`ScribeApp` (`module-scribe/src/ScribeApp.tsx`) is a **single composition root**: one
`<section style={rootStyle}>` renders the header, then the surface toggle `<nav>`, then a single
conditional that swaps between the three tab bodies (`drafting` → StyleDNAManager/mode grid,
`tt-review` → `TTManagerReview`, `ppbe-exhibits` → `PPBEExhibitPanel`). The tabs do **not** render
through separate root components — they share one shell. This is exactly the structure the opening
prompt hoped for: a single top-level banner placed above the toggle is present on all three tabs
and cannot be missed on any one of them. No structural awkwardness to report.

Confirmed SCRIBE had **no** local banner primitive — no `banners.tsx`, no `GovernanceBanner`
anywhere in `module-scribe/src` (matches the opening prompt's Critical Codebase Fact). This is
net-new UI.

### What was built

1. **New file `module-scribe/src/banners.tsx`** — a local Category-2 governance-guardrail
   primitive: `governanceBannerStyle` (blue `#eff6ff` background, `#1e40af` text, `#2563eb`
   left border — byte-for-byte the APEX/FLOWPATH values), a `GovernanceBanner` wrapper, and a
   `Gate1Banner` carrying the exact disclosure text above.
2. **`module-scribe/src/ScribeApp.tsx`** — imported `Gate1Banner` and rendered `<Gate1Banner />`
   at the top level, immediately below the header and **above** the surface-toggle `<nav>`, so it
   is permanent across all three tabs and rendered exactly once.
3. **`module-scribe/tests/ScribeApp.test.tsx`** — +4 tests (see below).

### Style-constant decision (D1 explicitly asks this to be documented)

**Duplicated the style locally rather than importing it.** No module in this codebase imports from
another `module-*` (verified by grep across `module-scribe`, `module-apex`, `module-flowpath`).
APEX and FLOWPATH each carry their own `banners.tsx` with their own copy of `governanceBannerStyle`
— duplication *is* the established convention. Importing from `module-apex` would have introduced
the first cross-module import in the repository and reached outside `module-scribe/src`. The local
copy is the cleaner choice and keeps the entire change inside `module-scribe/src` + its own tests.

### Test evidence — banner on all three tabs (opening-prompt close requirement)

New `describe("ScribeApp F-20 — CPMI-VRS Gate 1 AI-disclosure banner is app-wide")` block:

| Test | Asserts |
|---|---|
| default (Drafting Modes) tab | exact `AI disclosure (CPMI-VRS Gate 1):` label + full disclosure text present |
| after clicking Time & Travel Review tab | full disclosure text still present |
| after clicking PPBE Exhibits tab | full disclosure text still present |
| single-instance | disclosure text renders exactly once (not duplicated per-tab) |

All four pass. Full `ScribeApp.test.tsx`: 10/10 pass.

### Out of scope, left untouched (as directed)

`module-scribe/src/SmartCapturePanel.tsx:61` (unrelated small disclosure line — Smart Capture is
out of the demonstration by decision). Not modified.

---

## Close verification

- **`sovereign_session_verify.sh`** — full output quoted below. 29 pass / 1 warn / 1 fail. The
  single **FAIL** is the SBOM-count-accuracy check comparing against the *previous* SBOM
  (`SBOM_Session116_Update.md`, 2059) while the live run is 2063 — expected mid-close and resolved
  by `SBOM_Session117_Update.md` (this session) stating 2063. The **WARN** is the uncommitted
  working tree captured before the close commits. Both are pre-close artifacts, not defects.
- **Full test suite, all workspaces, real exit codes** — all 15 JS/TS `test:*` scripts exit 0
  (total 2063); Python pytest exit 0 (195). Via the verify script (Rule 7 — real exit codes, no
  truncation).
- **`tsc` clean** — SCRIBE workspace `npx tsc --noEmit` exit 0.
- **Shell-contract SHA** — `shasum -a 256 shell-contract.ts sovereign-shell/shell-contract.ts`
  both `c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b` (v1.28) — unchanged,
  identical, both copies, at close. `.sovereign_check_baseline` not raised.

### `sovereign_session_verify.sh` full output (verbatim)

```
Running against: /Users/developmentsystem/Developer/sovereign-platform

============================================================
1. GIT STATE
============================================================
  INFO: HEAD is 199b667 (199b66756a5bbe8a010750ca23ff17bdd06c2451)
  (HEAD is informational — terminal HEAD is recorded in DOCUMENT_MANIFEST.tsv at close)
  WARN: Working tree has uncommitted tracked-file changes:
     M module-scribe/src/ScribeApp.tsx
     M module-scribe/tests/ScribeApp.test.tsx

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
  JS/TS total from this run: 2063

-- Python: ./sovereign-security via python3 -m pytest --
  Exit code: 0
    sovereign-security/test_sovereign_logger.py ............................ [ 76%]
    .............................................                            [100%]

    =============================== warnings summary ===============================
    ../../Library/Python/3.9/lib/python/site-packages/urllib3/__init__.py:35
      /Users/developmentsystem/Library/Python/3.9/lib/python/site-packages/urllib3/__init__.py:35: NotOpenSSLWarning: urllib3 v2 only supports OpenSSL 1.1.1+, currently the 'ssl' module is compiled with 'LibreSSL 2.8.3'. See: https://github.com/urllib3/urllib3/issues/3020
        warnings.warn(

    -- Docs: https://docs.pytest.org/en/stable/how-to/capture-warnings.html
    ======================= 195 passed, 1 warning in 12.31s ========================
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
  PASS: Manifest integrity: 116 file(s) checked — all present with matching SHA-256

============================================================
7. VERSION-CHAIN CONTINUITY (AGENT_REFERENCE.md)
============================================================
  PASS: Version-chain continuity: all changelog entries appear in the Supersedes chain

============================================================
8. SBOM COUNT ACCURACY
============================================================
  Most recent SBOM: SBOM_Session116_Update.md
  SBOM states: JS/TS=2059  Python=195
  Actual from this run: JS/TS=2063  Python=195
  FAIL: SBOM count mismatch: SBOM says JS/TS=2059 Python=195 but actual is JS/TS=2063 Python=195

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
SUMMARY: 29 pass / 1 warn / 1 fail
============================================================
```

**Note on the SBOM-count FAIL (Session 8 of the verify script):** the check always compares the
live count against the *most recent SBOM on disk at the time it runs*. During a close, that is the
prior session's SBOM until this session's SBOM is committed. After `SBOM_Session117_Update.md`
(JS/TS=2063, Python=195) lands, a re-run resolves to PASS. This is the normal mid-close state, not
a defect — noted here so it is not mistaken for one (Lesson 43: a check's output is information to
investigate, and this one is understood).

---

## Findings / blockers surfaced (not acted on)

None new. F-25 remains the standing structural item from Session 116 (SCRIBE product-mode exports
do not publish into destination queues — governance decision required, not a Build Agent repair).
Untouched this session; recorded here and in the SBOM for continuity.

---

## Next session

No dependency created by this session. F-20 is closed. The open governance item is F-25 (structural
cross-module publish surface). Nothing in this session's change constrains the ordering of future
work.

---

*SOVEREIGN Platform — Session 117 Handoff · August 17, 2026*
*Pre-Decisional · Internal Working Document*
