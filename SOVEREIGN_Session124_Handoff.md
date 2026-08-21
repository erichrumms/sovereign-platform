# SOVEREIGN Platform — Session 124 Handoff

**Session:** 124
**Prior close:** Session 123, HEAD `f651f2c` (manifest-record commit `d229efc` on top).
**Open HEAD this session:** `f275da2` (Session 124 gather-script placement).
**Purpose:** F-51 — SCRIBE's static-fallback schema validation accepted unedited placeholder
text as satisfying the schema, so "Draft satisfies the schema — ready for human approval" (and
therefore Approve & export) was reachable with nothing typed. Understood and closed across all
six product-intake drafting modes.
**Shell contract:** v1.28, `c99355ce…681b` — confirmed unchanged at open AND close.

---

## Done-condition traceability

### D1 — Locate Rule Change Proposal's schema-validation logic; confirm why placeholder passes

**Location:** `module-scribe/src/draft-contract.ts`, `validateRuleChangeProposal` (lines 235–247),
reached through the shared entry point `validateModeOutput(mode, value)` (line 265).

**What it checked:** each of the five required fields (`rule_id`, `current_rule`, `proposed_rule`,
`justification`, `regulatory_source`) via `isNonEmptyString`, which is exactly
`typeof v === "string" && v.trim() !== ""` (line 95–97).

**Why the unedited fallback passed (confirmed, not inferred):** the static tier-3 fallback for the
mode (`draft-engine.ts` `STATIC_TEMPLATES.rule_change_proposal`, lines 205–211) fills every field
with either `PLACEHOLDER("RULE_ID")` → `"[RULE_ID — supply before export]"` or the long-form
`UNAVAILABLE` notice. Both are **non-empty strings**, so every `isNonEmptyString` check returned
true and `validateModeOutput` returned `{ valid: true }`. The validator tested *presence of a
string*, never *whether the string was still an unedited placeholder*. The Export gate
(`useExport.ts` — both `isExportable`, line 69, and `approve`'s Gate-3 re-check, line 91) calls
this same `validateModeOutput`, so the "ready for approval" state and the Approve button were both
enabled on placeholder-only content.

### D2 — One shared function or six separate implementations?

**One shared function, parameterized per mode.** `validateModeOutput(mode, value)` dispatches
through a `MODE_VALIDATORS` table (lines 250–257) to six per-mode validator functions, all built on
the same `isNonEmptyString` primitive. The Export gate and the live-response parse path
(`parseDraft`) both funnel through this one entry point. **Consequence for the fix:** a single
placeholder gate added to `validateModeOutput` closes the defect for all six modes and both call
sites at once. Per the opening prompt, D3 still tested every mode individually, because a shared
function can be fed different content per mode.

### D3 — Per-mode reproduction (generate static fallback, attempt "ready for approval" unedited)

Ran each mode's `staticDraftFallback(mode)` output through `validateModeOutput(mode, …)` with **no
field edited** (diagnostic harness, run pre-fix, then removed). Result — **the defect was present
in all six**:

| Mode | Target | Pre-fix: unedited fallback accepted? | Post-fix: rejected until edited? |
|---|---|---|---|
| `correspondence_draft` | NEXUS | **YES — accepted (defect)** | Yes — rejected |
| `program_narrative` | NEXUS | **YES — accepted (defect)** | Yes — rejected |
| `report_commentary` | APEX | **YES — accepted (defect)** | Yes — rejected |
| `vvr_description` | FLOWPATH | **YES — accepted (defect)** | Yes — rejected |
| `governance_memo` | CPMI | **YES — accepted (defect)** | Yes — rejected |
| `rule_change_proposal` | ARIA | **YES — accepted (defect)** | Yes — rejected |

No mode's fallback was garbled/nonsensical content (the "must surface" content-quality case did not
arise) — every fallback was well-formed placeholder text; the defect was specifically the
placeholder-passing bug the prompt described.

### D4 — The fix + regression tests

**Approach (autonomous decision):** substring match against the two known static-fallback
sentinels, added as a scan in the shared `validateModeOutput` after structural validation. The
sentinel fragments are defined once in `draft-contract.ts` and `draft-engine.ts` builds its
fallback strings *from* them, so the generator and the detector cannot drift (Rule 11 — one
computation). The schema *definitions* were not touched (they live in `@sovereign/data`); only the
validation call path changed — inside the "may decide independently" scope.

Real diff of the core change (`git show efce624`):

```
@@ export function validateModeOutput(mode: SCRIBEMode, value: unknown): ValidationResult
-  return MODE_VALIDATORS[mode](value);
+  // First: structural schema check. If the shape is wrong, return those errors.
+  const structural = MODE_VALIDATORS[mode](value);
+  if (!structural.valid) return structural;
+  // Then: reject an unedited static fallback. A draft can be perfectly schema-shaped
+  // and still be nothing but placeholder text (F-51) — that must not satisfy the gate.
+  const placeholderErrors: string[] = [];
+  collectPlaceholderErrors(value, "", placeholderErrors);
+  return result(placeholderErrors);
```

New in `draft-contract.ts`: `FALLBACK_SENTINELS` (`placeholderSuffix: "— supply before export]"`,
`unavailableCore: "this is a static fallback, not a generated draft"`), `isUnfilledPlaceholder`,
and a recursive `collectPlaceholderErrors` walker (covers nested `action_items` and string
arrays). In `draft-engine.ts`, `UNAVAILABLE` and `PLACEHOLDER` are rebuilt from those constants —
the produced strings are **byte-identical** to before (verified: `[FIELD — supply before export]`
and the full unavailable notice are unchanged).

**Regression tests** — new `module-scribe/tests/draft-placeholder-gate.test.ts`, 13 tests:
- 1 test: both sentinel forms detected, real content not flagged.
- 6 tests **(a)**: each mode's fresh unedited static fallback **fails** `validateModeOutput` with a
  `/placeholder/` error.
- 6 tests **(b)**: the same draft with real content substituted into every placeholder **passes**.

Two tests in `draft-engine.test.ts` that had encoded the old buggy behavior (asserting the static
fallback was `validateModeOutput.valid === true`) were corrected to assert it is schema-*shaped*
(renders, all fields present) but **not** export-valid until edited.

---

## Findings / items surfaced (not acted on)

### Rule 12 pattern search — same defect class latent in two SCRIBE surfaces outside the six modes

Per Rule 12, after confirming the root cause I searched the codebase for the same pattern
(a validator accepting its own static fallback). **Found, and deliberately NOT fixed — outside this
session's named six-mode scope; surfaced for a governance decision:**

- `validateTTDraft` (`tt-draft-contract.ts`, `body`/`subject` checks at lines 211–215) — non-empty
  only, no placeholder exclusion. Its engine's static fallback (`tt-draft-engine.ts:197`) carries
  the identical `this is a static fallback, not a generated draft` sentinel. **Mitigating:**
  `TTManagerReview.tsx` has **no** Approve/Deny/Escalate control (WH-28, Session 69) — no equivalent
  human-gated export path.
- `validatePPBEExhibitDraft` (`ppbe-exhibit-contract.ts`, lines 132–153) — non-empty only, no
  placeholder exclusion. Its engine fallback (`ppbe-exhibit-engine.ts:161`) is non-empty and would
  pass. **`PPBEExhibitPanel.tsx` DOES have an export path** ("Export requires CLEAR…"), so this one
  is the more relevant follow-on.

Neither is among the six product-intake drafting modes (`correspondence_draft`, `program_narrative`,
`report_commentary`, `vvr_description`, `governance_memo`, `rule_change_proposal`) named in the
opening prompt, and neither was authorized in scope. **Recommendation:** a governance decision on
whether these two SCRIBE surfaces are used live in the demonstration and whether to extend the F-51
placeholder gate to their validators (the fix generalizes cleanly). Recorded also in SBOM v1.93 §6.

### Out of scope, untouched (per opening prompt / standing constraints)

Synthesis and Framing (documented deferral); F-25; F-44; the Gate 3 attestation control;
`.sovereign_check_baseline`; the shell contract. No new agents, prompts, event types, or GDs.

---

## Test counts (this session)

| Suite | Session 123 | Session 124 | Δ |
|---|---|---|---|
| JS/TS | 2089 | **2102** | +13 (all `module-scribe`) |
| Python | 195 | **195** | 0 |
| **Total** | 2284 | **2297** | +13 |

All 15 JS/TS workspaces ran individually, every exit code 0; Python real run, exit code 0.

---

## Commits this session

| # | Commit | Deliverable |
|---|---|---|
| 1 | `efce624` | `fix(scribe): reject unedited static-fallback placeholders in the draft schema gate (F-51)` — D1–D4 fix + regression tests |
| 2 | (this close commit) | `docs: Session 124 close — Handoff + SBOM v1.93` |

(Per Session 110 convention, the handoff does not record a HEAD-after-push value — the terminal HEAD
is recorded in `DOCUMENT_MANIFEST.tsv` after push, since the manifest-record commit follows this
handoff.)

---

## Close verification — `sovereign_session_verify.sh` full output (verbatim)

```
Running against: /Users/developmentsystem/Developer/sovereign-platform

============================================================
1. GIT STATE
============================================================
  INFO: HEAD is efce624 (efce624d11aeb18cde9e074379bdedb7faad10b4)
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
  JS/TS total from this run: 2102

-- Python: ./sovereign-security via python3 -m pytest --
  Exit code: 0
    sovereign-security/test_sovereign_logger.py ............................ [ 76%]
    .............................................                            [100%]

    =============================== warnings summary ===============================
    ../../Library/Python/3.9/lib/python/site-packages/urllib3/__init__.py:35
      /Users/developmentsystem/Library/Python/3.9/lib/python/site-packages/urllib3/__init__.py:35: NotOpenSSLWarning: urllib3 v2 only supports OpenSSL 1.1.1+, currently the 'ssl' module is compiled with 'LibreSSL 2.8.3'. See: https://github.com/urllib3/urllib3/issues/3020
        warnings.warn(

    -- Docs: https://docs.pytest.org/en/stable/how-to/capture-warnings.html
    ======================= 195 passed, 1 warning in 12.41s ========================
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
  PASS: Manifest integrity: 131 file(s) checked — all present with matching SHA-256

============================================================
7. VERSION-CHAIN CONTINUITY (AGENT_REFERENCE.md)
============================================================
  PASS: Version-chain continuity: all changelog entries appear in the Supersedes chain

============================================================
8. SBOM COUNT ACCURACY
============================================================
  Most recent SBOM: SBOM_Session124_Update.md
  SBOM states: JS/TS=2102  Python=195
  Actual from this run: JS/TS=2102  Python=195
  PASS: SBOM count matches: JS/TS 2102 + Python 195 = 2297

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

*(The verify run above was executed after the SBOM was written but before this handoff was
committed; its `HEAD is efce624` line therefore reflects the fix commit — the terminal HEAD after
the docs-close commit is recorded in `DOCUMENT_MANIFEST.tsv`, not here.)*

---

*SOVEREIGN Platform — Session 124 Handoff · August 20, 2026 · Pre-Decisional · Internal Working Document*
