# SOVEREIGN Platform — Session 120 Handoff
## Program-Manager Prefix Strip (F-41 follow-on) · August 19, 2026 · Build Agent

**Session opened against:** HEAD `c4e6434` (Session 119 terminal `a12dc68` + its manifest
commit, as the opening prompt anticipated). Shell contract v1.28 verified at open, both copies
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`.
**Scope:** D1 (three confirmations) then D2 (strip the "Program Manager " prefix from the 17
program-level seed values). Both completed. No shell-contract change. F-25, F-44,
`.sovereign_check_baseline`, and the Gate 3 attestation control untouched, as instructed.

---

## D1 — Investigation findings (verbatim)

1. **All 17 program-level values share the identical literal prefix "Program Manager "** —
   same spacing, same capitalisation. Verified by full enumeration:
   `grep -c '^  responsible_party:'` = exactly 17 (lines 35, 122, 153, 205, and the 13 GD-33
   stubs). Four distinct names behind the prefix: Dana Jones (×9), Robin Vasquez (×6),
   Jordan Kim, Casey Morgan. No variant found — a single strip operation covers all 17.

2. **Consumers of the program-level field:** `PortfolioDashboard.tsx:111`
   (`p.responsible_party`) and `ProgramDetailView.tsx:85` (`program.responsible_party`) — as
   the opening prompt expected, both screens' rendered output improves. The apex-assistant
   prompt file mentions the field descriptively (no literal to change).

3. **ProvenancePanel / report-generator read a DIFFERENT entity — confirmed safe.** The same
   *file* also contains 11 `responsible_party` literals at deeper nesting, inside
   `risk_flags[].provenance` — the DC-3 `ProvenanceRecord` entity (values like "Business
   Financial Manager Alex Reed", "Integration Lead Sam Carter", "Contracting Officer
   Representative Pat Lee"). `ProvenancePanel.tsx:40` renders `ProvenanceRecord.responsible_party`
   and `report-generator.ts:97` / `GateRunnerPanel.tsx:318` read risk-finding provenance fields
   populated via `apex-analysis.ts:144` (`flag.provenance.responsible_party`). Same field NAME,
   different entity and different literals — the opening prompt's stop condition ("if they share
   this field, stop") does not trigger. The strip was scoped by indentation
   (`^  responsible_party:` — program level only) so the 11 provenance values are byte-identical
   before and after, verified by re-grep post-edit.

---

## D2 — The fix

**Commit `17df816`** — 17 program-level values changed "Program Manager <name>" → "<name>";
11 provenance values unchanged (diff: exactly 17 lines).
`ProgramDetailView.tsx`'s own "Responsible party:" label text NOT touched, per the explicit
out-of-scope instruction — that line now renders "Responsible party: Dana Jones" (accurate,
label decision still pending with the Governance Agent).

**Tests:** no existing test asserted the old prefixed program-level strings (the "Alex Reed" /
"Business Financial Manager Alex Reed" test literals are provenance-side and unaffected).
Added one test pinning the bare names and the absence of the prefixed form. `module-apex`:
252 passing (+1).

**Transient runner note (reported for honesty, not a code finding):** one full `module-apex`
run showed a suite-level worker failure on `ProvenancePanel.test.tsx` with every executed test
passing (249/249 — the crashed suite's 3 tests never ran). The suite passed in isolation and
in two consecutive full re-runs (29/29 suites, 252/252 tests, exit 0). Not reproducible; no
code implicated; noted so a recurrence has a paper trail.

---

## Close verification

- **Tests:** all 15 JS/TS workspaces run individually, every exit code 0. **JS/TS 2081
  passing** (+1 from Session 119's 2080; the 4 key-gated e2e live smokes remain skipped and
  excluded). **Python 195**, exit 0. **Platform total 2276.**
- **tsc --noEmit:** exit 0 in all 15 workspaces.
- **Shell contract:** v1.28 unchanged at close — both copies
  `c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`. ✓
- **SBOM:** v1.89 (`SBOM_Session120_Update.md`) — derived by scan (highest on disk was v1.88).
- Terminal HEAD is recorded in `DOCUMENT_MANIFEST.tsv`, not here (Session 110 convention).

### `sovereign_session_verify.sh` — full output, verbatim

```
Running against: /Users/developmentsystem/Developer/sovereign-platform

============================================================
1. GIT STATE
============================================================
  INFO: HEAD is 17df816 (17df816dd87fe9d2c60e99d7c0235573ff82d3a4)
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
  JS/TS total from this run: 2081

-- Python: ./sovereign-security via python3 -m pytest --
  Exit code: 0
    sovereign-security/test_sovereign_logger.py ............................ [ 76%]
    .............................................                            [100%]

    =============================== warnings summary ===============================
    ../../Library/Python/3.9/lib/python/site-packages/urllib3/__init__.py:35
      /Users/developmentsystem/Library/Python/3.9/lib/python/site-packages/urllib3/__init__.py:35: NotOpenSSLWarning: urllib3 v2 only supports OpenSSL 1.1.1+, currently the 'ssl' module is compiled with 'LibreSSL 2.8.3'. See: https://github.com/urllib3/urllib3/issues/3020
        warnings.warn(

    -- Docs: https://docs.pytest.org/en/stable/how-to/capture-warnings.html
    ======================= 195 passed, 1 warning in 12.30s ========================
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
  PASS: Manifest integrity: 123 file(s) checked — all present with matching SHA-256

============================================================
7. VERSION-CHAIN CONTINUITY (AGENT_REFERENCE.md)
============================================================
  PASS: Version-chain continuity: all changelog entries appear in the Supersedes chain

============================================================
8. SBOM COUNT ACCURACY
============================================================
  Most recent SBOM: SBOM_Session120_Update.md
  SBOM states: JS/TS=2081  Python=195
  Actual from this run: JS/TS=2081  Python=195
  PASS: SBOM count matches: JS/TS 2081 + Python 195 = 2276

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

---

## Open items for the Governance Agent (carried, not new)

1. `ProgramDetailView.tsx:85` label "Responsible party:" — rename decision still pending.
2. F-25 (SCRIBE export publishes nothing) — standing structural item, governance decision.
3. F-44 (no back-navigation in the shell) — architectural, deliberately not patched.
4. F-46 claim correction from Session 118 — the brief's "confirmed" typo does not exist in the
   repository; live re-check recommended before the demonstration.

---

*Session 120 Handoff · August 19, 2026 · Build Agent*
*Pre-Decisional · Internal Working Document*
