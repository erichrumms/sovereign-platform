# SOVEREIGN Platform — Session 126 Handoff

**Session:** 126
**Prior close:** Session 125, terminal HEAD `5864d99` (manifest-record commit `9d65c9d` on top).
**Open HEAD this session:** `fe9a5b4` (Session 126 gather-script placement).
**Purpose:** Close PPBE Exhibit's F-51 gap via the authorized **option (b)**: rebuild both TT's
and PPBE's "unavailable" static-fallback notices *from* `FALLBACK_SENTINELS.unavailableCore`
(not hardcoded), then add the placeholder-rejection gate to `validatePPBEExhibitDraft`.
**Outcome:** All four done-conditions met. PPBE's static tier confirmed to assemble real
governed-record data (figures + citations) — that distinction preserved and sharpened, not
erased. Gate wired at the live export path. **No shell-contract change.** Full suite green
(JS/TS 2126 + Python 195 = 2321).
**Shell contract:** v1.28, `c99355ce…681b` — confirmed unchanged at open AND close.

---

## Done-condition traceability

### D1 — Investigate before rewriting

**What each notice currently says (confirmed by direct read, not inference — Rule 8):**

- **`TT_UNAVAILABLE`** (`tt-draft-engine.ts:196`): *"[Drafting service unavailable — this is a
  static fallback, not a generated draft. Compose the communication from the compliance record
  before sending.]"* — contains `FALLBACK_SENTINELS.unavailableCore` (*"this is a static fallback,
  not a generated draft"*) verbatim, but as a **hardcoded** copy, not built from the constant
  (matches the opening prompt's "by coincidence, not by construction").
- **`STATIC_NOTICE`** (`ppbe-exhibit-engine.ts:160`): *"[Drafting service unavailable — this is a
  static fallback assembled from the governed records, not a generated narrative. Complete the
  document from the cited records before review.]"* — contains **neither** sentinel member.

**Does PPBE's static tier do anything behaviorally distinct? YES — confirmed.** `staticExhibitDraft`
(`ppbe-exhibit-engine.ts:170`) is **not** a pure-template fallback. In every mode it constructs, from
real governed input:
- `figures[]` — real obligation amounts / evaluation findings, each carrying a real
  `source_workflow_step_id` that must resolve to a supplied governed record (traceability enforced);
- `title` — the real program name + fiscal year;
- `narrative` = `` `${STATIC_NOTICE} ${body}` `` where `body` is a mechanical, non-generated count
  sentence over the real records (e.g. *"This program has 2 recorded obligations, listed in the
  figures with their source records."*).

So *only* the bracketed `STATIC_NOTICE` prefix is a non-content notice; the figures and citations are
genuine governed data. **"Assembled from the governed records" is accurate and had to survive the
rewrite** — it does (see D2).

**Exhibit-type structure (to scope D4):** three PPBE document modes —
`BUDGET_EXHIBIT`, `CONGRESSIONAL_JUSTIFICATION`, `EVALUATION_REPORT`
(`ppbe-exhibit-contract.ts:65`). D4's regression tests cover all three.

### D2 — Rebuild both notices from the sentinel

Both notices are now constructed from `FALLBACK_SENTINELS.unavailableCore` (imported from
`./draft-contract`), so the generator and the detector cannot silently drift (Rule 11).

- **TT** (`tt-draft-engine.ts`): `` `[Drafting service unavailable — ${FALLBACK_SENTINELS.unavailableCore}. Compose the communication from the compliance record before sending.]` ``. The produced string is **byte-identical** to the prior hardcoded text (it already matched the sentinel wording), so **no TT regression test asserts changed text** — nothing to update, and Session 125 §6.2's latent-drift item is closed at the same time.
- **PPBE** (`ppbe-exhibit-engine.ts`): `` `[Drafting service unavailable — ${FALLBACK_SENTINELS.unavailableCore}. The figures and citations below are assembled from the governed records; the narrative is not. Complete the document from the cited records before review.]` ``. Distinct information preserved and **sharpened** — the old text implied the whole document was "assembled from the governed records"; the new text correctly scopes that to the figures/citations (the parts that really are) and states the narrative is not generated. The reviewer-facing text change is surfaced in SBOM §6.1 (a generator-text change, not a governance-doc edit).

### D3 — Reproduce before fixing

Pre-fix (against the current, pre-D2 notice text) the existing suite test *"static tier cites only
real sources and validates in every mode"* was run and **passed** — i.e. the unedited PPBE static
fallback **satisfied `validatePPBEExhibitDraft` in all three modes**. That is the F-51 gap, documented
as the exact starting state:

```
exhibit engine
  ✓ static tier cites only real sources and validates in every mode (1 ms)
Test Suites: 1 passed, 1 total
Tests:       20 skipped, 1 passed, 21 total
```

### D4 — Add the gate

`validatePPBEExhibitDraft` (`ppbe-exhibit-contract.ts:119`) now runs `collectPlaceholderErrors` after
its structural + figure-traceability checks and returns those errors — mirroring `validateModeOutput`
and `validateTTDraft` exactly (structural first; if the shape is wrong, don't also complain about
placeholders). Because the live export path `recordExhibitSignOff` (`ppbe-exhibit-contract.ts:288`)
re-runs this validator on the human-edited draft, **F-51 is closed at the one PPBE surface with a real
export gate** — an unedited static fallback can no longer open the double gate.

**Regression tests (`ppbe-exhibit-placeholder-gate.test.ts`, NEW, +6):** 3 modes ×
[(a) fresh unedited static fallback fails with a `/placeholder/` error;
(b) the same draft with a real narrative substituted passes]. Traceability is untouched by (b),
proving the failure in (a) is *only* the placeholder gate, not the sources.

**Existing test updated (reported explicitly, not silently):** `ppbe-exhibit-drafter.test.ts`'s
*"static tier … validates in every mode"* asserted the pre-fix behavior (unedited fallback passes).
Its expectation is **flipped** — it now asserts figures cite only real records **and** the unedited
notice fails the placeholder gate. The traceability intent it was written to guard is preserved and
made explicit.

---

## Findings

**F-1 (§4 surface question — assessed, NOT a stop).** The opening prompt asked to surface it if
PPBE's static tier populates real governed data in a way that makes the label "static fallback"
itself *misleading*. Assessment: **it is not misleading.** "Static" here means "not model-generated,"
and that is exactly true — the figures are real governed records assembled deterministically (never
fabricated; the validator rejects any figure whose source was not supplied), and the narrative body
is a non-generated count sentence. A static fallback that carries real data is still a static
fallback; "static" never claimed "empty." The new `STATIC_NOTICE` states the distinction plainly.
No disclosure-accuracy escalation to the Governance Agent is required. This is a Committee-standard
*confirmed* finding (read the code at `ppbe-exhibit-engine.ts:170-230`), not a theorized one.

**F-2 (three e2e tests carried the pre-F-51 assumption — updated, not routed around).** Two e2e
suites (`ppbe-full-cycle.test.tsx`, `ppbe-live-smoke.test.ts`, 3 tests total) failed on the first
full run because they encoded the exact behavior the authorized D4 gate inverts: they used the raw
static fallback as a stand-in for a **live model body** (`liveDraft()` — now rejected by
`parseExhibitDraft`, so the tier falls to static), and asserted the raw static fallback **passes**
`validatePPBEExhibitDraft` (including feeding it straight into the sign-off gate). These are not
regressions — they are the intended effect surfacing where a test conflated "schema-valid" with
"passes the export gate." Updated to (a) use completed drafts where a live body is meant, and
(b) assert the raw unedited fallback is correctly held by the gate and cannot open sign-off.
The fail-closed design is *strengthened*: the degraded artifact is still schema-shaped and
figure-traceable, but can no longer be silently exported.

**F-3 (opt-in LIVE-half assertion logic-corrected but NOT exercised in CI — Rule 9).** The
network-gated LIVE half of `ppbe-live-smoke.test.ts` (`describe.skip` unless `RUN_PPBE_LIVE_SMOKE=1`
+ `ANTHROPIC_API_KEY`) previously asserted `valid === true` unconditionally; post-F-51 that is only
correct on the live path (a fail-closed degradation to static now correctly does not pass the export
validator). Corrected to assert validity only when `tier === "live"` and schema+source soundness on
the static path. **This path does not run in the standing hermetic suite**, so the correction is
logic-verified (tsc) but not behavior-verified this session — recorded here rather than claimed as
tested.

---

## Rule 12 — same-pattern search

The placeholder-gate pattern (`collectPlaceholderErrors` after structural checks) now exists in all
three SCRIBE draft validators: `validateModeOutput` (six modes, Session 124), `validateTTDraft`
(Session 125), and `validatePPBEExhibitDraft` (this session). **Searched for any other validator that
accepts a static/template fallback as export-valid:** the two APEX PPBE agents
(`validatePPBESynthesisReport`, `validatePPBEScenarioReport`) and NEXUS's `validateCoordinationDigest`
have static tiers, but their fallbacks are advisory-labeled reports validated against a *content*
schema (advisory label, ≥2 scenarios, zero proposals) — they are not placeholder-bearing "unavailable"
notices of the F-51 shape, and none has a `FALLBACK_SENTINELS`-style unedited-placeholder tier. **No
further F-51 instance found — checked and cleared.** (Recorded per Rule 12: a negative result is
evidence for the next session.)

---

## Close artifacts & commits

| Item | Value |
|---|---|
| D2+D4 source + scribe tests | `54eda43` — `fix(scribe): close F-51 for PPBE exhibits — sentinel-built fallback notices + placeholder gate` |
| e2e expectation updates | `d6f5a9b` — `test(e2e): update PPBE expectations for the F-51 export gate` |
| Handoff + SBOM v1.95 | (this close commit) |
| Terminal HEAD | recorded in `DOCUMENT_MANIFEST.tsv` at close, not here (Session 110 convention) |
| Shell contract | v1.28 `c99355ce…681b`, unchanged — no GD raised |
| Tests | JS/TS 2126 (+6) + Python 195 = **2321**; every workspace exit code 0 |

Source changed: `module-scribe/src/{tt-draft-engine,ppbe-exhibit-engine,ppbe-exhibit-contract}.ts`
(3 files); tests `module-scribe/tests/{ppbe-exhibit-placeholder-gate(NEW),ppbe-exhibit-drafter}.test.ts`
and `e2e/tests/{ppbe-full-cycle,ppbe-live-smoke}.test.ts`.

---

## `sovereign_session_verify.sh` — full output (close run, verbatim)

```
Running against: /Users/developmentsystem/Developer/sovereign-platform

============================================================
1. GIT STATE
============================================================
  INFO: HEAD is d6f5a9b (d6f5a9bc9d1756b899507fd15752ef0f575206ae)
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
  JS/TS total from this run: 2126

-- Python: ./sovereign-security via python3 -m pytest --
  Exit code: 0
    sovereign-security/test_sovereign_logger.py ............................ [ 76%]
    .............................................                            [100%]

    =============================== warnings summary ===============================
    ../../Library/Python/3.9/lib/python/site-packages/urllib3/__init__.py:35
      /Users/developmentsystem/Library/Python/3.9/lib/python/site-packages/urllib3/__init__.py:35: NotOpenSSLWarning: urllib3 v2 only supports OpenSSL 1.1.1+, currently the 'ssl' module is compiled with 'LibreSSL 2.8.3'. See: https://github.com/urllib3/urllib3/issues/3020
        warnings.warn(

    -- Docs: https://docs.pytest.org/en/stable/how-to/capture-warnings.html
    ======================= 195 passed, 1 warning in 12.38s ========================
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
  PASS: Manifest integrity: 135 file(s) checked — all present with matching SHA-256

============================================================
7. VERSION-CHAIN CONTINUITY (AGENT_REFERENCE.md)
============================================================
  PASS: Version-chain continuity: all changelog entries appear in the Supersedes chain

============================================================
8. SBOM COUNT ACCURACY
============================================================
  Most recent SBOM: SBOM_Session126_Update.md
  SBOM states: JS/TS=2126  Python=195
  Actual from this run: JS/TS=2126  Python=195
  PASS: SBOM count matches: JS/TS 2126 + Python 195 = 2321

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

**Note on the run above:** it was taken after the two code commits (`54eda43`, `d6f5a9b`) and after
`SBOM_Session126_Update.md` was written to disk (untracked, therefore filtered by Section 1's
`^??` filter — a new file is not an uncommitted *tracked-file* change). The handoff and SBOM are
committed immediately after this run; the terminal HEAD is recorded in `DOCUMENT_MANIFEST.tsv`.

---

*SOVEREIGN Platform — Session 126 Handoff · August 20, 2026 · Pre-Decisional · Internal Working Document*
