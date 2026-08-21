# SOVEREIGN Platform — Session 125 Handoff

**Session:** 125
**Prior close:** Session 124, HEAD `2af445e` (manifest-record commit on top of docs-close `fa9d725`).
**Open HEAD this session:** `9ad06d5a` (Session 125 gather-script placement).
**Purpose:** Extend F-51's fix to the two SCRIBE drafting validators Session 124 surfaced outside
the six product-intake modes — `validateTTDraft` (`tt-draft-contract.ts`) and
`validatePPBEExhibitDraft` (`ppbe-exhibit-contract.ts`).
**Outcome:** **TT fixed via clean reuse of the shared detector. PPBE STOPPED and surfaced** —
direct reproduction showed the opening prompt's shared-sentinel premise is false for PPBE, which
triggers the §4 autonomous-rule stop condition. Full evidence below.
**Shell contract:** v1.28, `c99355ce…681b` — confirmed unchanged at open AND close.

---

## Done-condition traceability

### D1 — Re-confirm both validators' current behavior directly

**`validateTTDraft`** (`tt-draft-contract.ts:200`): checks `communication_type` taxonomy membership,
`body` via `typeof … === "string" && trim() !== ""` (line 211), optional `subject` the same way,
and the system-invisibility rule (`disclosesSystem`). **No placeholder exclusion** — a placeholder
is a non-empty string, so it passed.

**`validatePPBEExhibitDraft`** (`ppbe-exhibit-contract.ts:119`): checks `document_mode` membership,
`title` / `narrative` / `workflow_step_id` non-empty strings, per-figure label/value/source
traceability, and `disclosesSystem`. **No placeholder exclusion.**

**TT Approve-control status (WH-28) — confirmed directly, not taken as given:** `TTManagerReview.tsx:20`
states verbatim *"no Approve/Deny/Escalate controls (WH-28, Session 69)."* The one action present,
"Send" (`recordSend`, line 151; button `tt-send-communication`, line 284), records an audit event
and is **not** gated by `validateTTDraft` (no reference to it anywhere in the component). So no live
`validateTTDraft`-gated export path exists — TT's exposure is theoretical, as the prompt expected.
PPBE, by contrast, has a live export gate: `recordExhibitSignOff` (`ppbe-exhibit-contract.ts:264`)
re-runs `validatePPBEExhibitDraft` at line 288 before opening the double gate.

### D2 — Can the existing shared utilities be called directly against each validator's field set?

`collectPlaceholderErrors` is a **generic recursive walk over any object's string values** (it
already handles arrays and nested objects). Both `TTDraft` (`{communication_type, subject?, body}`)
and `PPBEExhibitDraft` (`{document_mode, title, narrative, figures[], workflow_step_id}`) are plain
objects whose string fields the walk visits and whose non-strings (the numeric `figure.value`) it
skips. **Structurally, both accept the walk directly** — no field-shape adapter needed. It was
module-private; this session exported it (one-line visibility change, no logic change) so the TT
validator reuses the identical detector rather than reimplementing sentinel logic (Rule 11).

**But structural acceptance is not semantic coverage.** The walk only flags a string that
`isUnfilledPlaceholder` recognizes — i.e. one containing a member of `FALLBACK_SENTINELS`. Whether
each engine's *actual* static fallback contains such a member is the D3 question, and the answer
differs between the two surfaces.

### D3 — Reproduce before fixing (generate each static fallback, check the gate) — run pre-fix

A diagnostic harness (`module-scribe/tests/_repro_s125.test.ts`, run then removed) generated each
engine's real static fallback and ran it through both its validator and the shared detector:

| Surface | Static fallback field content (real, from the engine) | `validate*` accepts unedited? (F-51 present) | `isUnfilledPlaceholder` recognizes it? |
|---|---|---|---|
| **TT** | body = `"[Drafting service unavailable — this is a static fallback, not a generated draft. Compose…]"` | **YES — accepted (defect)** | **YES** — contains `unavailableCore` verbatim |
| **PPBE** | narrative = `"[Drafting service unavailable — this is a static fallback assembled from the governed records, not a generated narrative. Complete…]"` | **YES — accepted (defect)** | **NO** — different wording |

`FALLBACK_SENTINELS` = `{ placeholderSuffix: "— supply before export]", unavailableCore: "this is a
static fallback, not a generated draft" }`. PPBE's `STATIC_NOTICE` (`ppbe-exhibit-engine.ts:160`)
contains **neither** — its phrasing *"a static fallback assembled from the governed records, not a
generated narrative"* is a distinct string.

**This corrects Session 124's characterization.** SBOM v1.93 §6 and the Session 124 handoff §Rule 12
stated both engines "emit static fallbacks carrying the same sentinels." That is true for TT and
**false for PPBE** — Session 124 inferred it from the shared pattern without tracing PPBE's actual
notice string (Rule 8 — a symptom match is not a traced path). The reproduction traces it.

### D4 — The fix (TT only; PPBE stopped, see §Findings)

**TT — clean reuse.** After the existing structural checks, `validateTTDraft` now runs
`collectPlaceholderErrors` and returns those errors, mirroring `validateModeOutput` exactly. Real
diff (`git show d75e4ac -- module-scribe/src/tt-draft-contract.ts`):

```
+import { collectPlaceholderErrors } from "./draft-contract";
@@ export function validateTTDraft(value: unknown): ValidationResult {
         "the tool name never appears in outgoing communications (docs/17 §6.4)"
     );
   }
-  return result(errors);
+  // Structural errors first — if the shape is wrong, don't also complain about placeholders.
+  if (errors.length > 0) return result(errors);
+  // Then reject an unedited static fallback. The TT static tier (tt-draft-engine.ts
+  // TT_UNAVAILABLE) is schema-SHAPED — a non-empty body — but is nothing but placeholder
+  // text the manager MUST replace before sending. It carries the shared FALLBACK_SENTINELS
+  // core, so the same detector the six SCRIBE modes use (F-51, Session 124) recognizes it
+  // here too — one detector, one source of truth (Rule 11). Extended to this validator in
+  // Session 125 (F-51 follow-on).
+  const placeholderErrors: string[] = [];
+  collectPlaceholderErrors(value, "", placeholderErrors);
+  return result(placeholderErrors);
```

Plus a one-line visibility change in `draft-contract.ts` (`function collectPlaceholderErrors` →
`export function collectPlaceholderErrors`). No schema definitions (`@sovereign/data`) and no shell
contract touched.

**Regression tests** — new `module-scribe/tests/tt-draft-placeholder-gate.test.ts`, 18 tests,
matching Session 124's shape: for each of the 9 TT communication types, **(a)** the fresh unedited
static fallback **fails** `validateTTDraft` with a `/placeholder/` error, and **(b)** the same draft
with real body content substituted **passes**.

---

## Findings / items surfaced (not acted on)

### PPBE Exhibit — STOPPED per the opening prompt's §4 autonomous rule

The §4 stop condition is: *"if either validator … would require redefining sentinel logic rather
than reusing it — that's a sign the two systems have diverged further than assumed, stop and report
rather than force a fit."* PPBE meets it exactly. Its static fallback carries a sentinel that is
**not** in `FALLBACK_SENTINELS`, so the shared detector is a **no-op** against it. Making the gate
fire would require one of:

- **(a)** broadening `FALLBACK_SENTINELS` to include PPBE's phrasing — redefining/expanding shared
  sentinel logic (the named stop trigger); also risks false positives on legitimate prose
  containing "not a generated …".
- **(b)** rewriting `ppbe-exhibit-engine.ts` `STATIC_NOTICE` so it is built *from*
  `FALLBACK_SENTINELS.unavailableCore` — a change to reviewer-facing generator text, not "reuse
  against the validator."

Shipping the gate on PPBE via plain reuse would look like it closes F-51 for PPBE while being a
**no-op on the one surface with a live export path** (`recordExhibitSignOff` → `validatePPBEExhibitDraft`)
— a Rule-17 false safeguard, worse than leaving it visibly open. So it was not done.

**Recommendation (for a Governance Agent / Project Principal decision):** authorize **option (b)** as
a next-session deliverable — rebuild BOTH engines' "unavailable" notices *from*
`FALLBACK_SENTINELS.unavailableCore` (Rule 11: generator built from the shared constant so detector
and generator cannot drift), then add the identical `collectPlaceholderErrors` gate to
`validatePPBEExhibitDraft` (which its live `recordExhibitSignOff` path will then enforce). This is
the priority follow-on — PPBE is the surface with the real export path.

### TT's sentinel match is a coincidence, not a Rule-11 guarantee (latent drift)

`TT_UNAVAILABLE` (`tt-draft-engine.ts:196`) is a hardcoded string that *happens* to match
`unavailableCore` verbatim — it is not built from the constant. The gate works today; if that
wording were edited, it would silently stop firing. Folding TT's notice into option (b) closes this
at the same time.

### Out of scope, untouched (per opening prompt / standing constraints)

Synthesis and Framing (documented deferral); F-25; F-44; the Gate 3 attestation control;
`.sovereign_check_baseline`; the six drafting modes Session 124 fixed; the shell contract. No new
agents, prompts, event types, or GDs.

---

## Test counts (this session)

| Suite | Session 124 | Session 125 | Δ |
|---|---|---|---|
| JS/TS | 2102 | **2120** | +18 (all `module-scribe`, `tt-draft-placeholder-gate.test.ts`) |
| Python | 195 | **195** | 0 |
| **Total** | 2297 | **2315** | +18 |

Arithmetic reconciles with the verify script's independent count: 2102 + 18 = 2120. All 15 JS/TS
workspaces ran individually, every exit code 0; Python real run, exit code 0.

---

## Commits this session

| # | Commit | Deliverable |
|---|---|---|
| 1 | `d75e4ac` | `fix(scribe): extend F-51 static-fallback placeholder gate to validateTTDraft` — D4 TT fix + 18 regression tests |
| 2 | (this close commit) | `docs: Session 125 close — Handoff + SBOM v1.94` |

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
  INFO: HEAD is d75e4ac (d75e4ac2a054c329a3bf88b1fef51b02128e1dc5)
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
  JS/TS total from this run: 2120

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
  PASS: Manifest integrity: 133 file(s) checked — all present with matching SHA-256

============================================================
7. VERSION-CHAIN CONTINUITY (AGENT_REFERENCE.md)
============================================================
  PASS: Version-chain continuity: all changelog entries appear in the Supersedes chain

============================================================
8. SBOM COUNT ACCURACY
============================================================
  Most recent SBOM: SBOM_Session125_Update.md
  SBOM states: JS/TS=2120  Python=195
  Actual from this run: JS/TS=2120  Python=195
  PASS: SBOM count matches: JS/TS 2120 + Python 195 = 2315

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

*(The verify run above was executed after the SBOM was written and the fix committed, but before
this handoff was committed; its `HEAD is d75e4ac` line reflects the fix commit — the terminal HEAD
after the docs-close commit is recorded in `DOCUMENT_MANIFEST.tsv`, not here.)*

---

*SOVEREIGN Platform — Session 125 Handoff · August 20, 2026 · Pre-Decisional · Internal Working Document*
