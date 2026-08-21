# SOVEREIGN Platform — SBOM Session Update
## Version 1.95 · August 20, 2026

**Supersedes:** v1.94 (`SBOM_Session125_Update.md`, Session 125). Version derived by scanning
all SBOM files on disk — highest was v1.94 — and adding one.
**Session:** 126 — close PPBE Exhibit's F-51 gap via the authorized option (b): rebuild both TT's
and PPBE's "unavailable" static-fallback notices *from* `FALLBACK_SENTINELS.unavailableCore`
(not hardcoded), then add the placeholder-rejection gate to `validatePPBEExhibitDraft`. No
shell-contract change, no new agents, no new event type. Validation-logic + generator-text change only.
**Build Agent close commit:** (see DOCUMENT_MANIFEST.tsv terminal HEAD row)

---

## 1 — Shell Contract

**v1.28 — unchanged.** Both copies byte-identical, SHA
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`. Confirmed unchanged at open
AND close. No GD raised (next GD remains **GD-43**).

---

## 2 — Agent and Prompt Registry

**Agents: 44 — unchanged.** **Prompts: 20 (19 approved + 1 pending) — unchanged.** The PPBE exhibit
drafting prompt (`ppbe/prompts/exhibit_drafting_system.md`) remains **PENDING** (synthetic-data only);
this session did not touch prompt status.

---

## 3 — Test Counts

| Suite | Count | Confidence |
|---|---|---|
| JS/TS | 2126 | High — all 15 workspaces run individually this session via `sovereign_session_verify.sh`, every exit code 0 |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2321** | **High** |

**Change from v1.94:** **+6 JS/TS** (2120 → 2126), all in `module-scribe`. New file
`ppbe-exhibit-placeholder-gate.test.ts` adds 6 tests: 3 PPBE document modes (BUDGET_EXHIBIT,
CONGRESSIONAL_JUSTIFICATION, EVALUATION_REPORT) × [(a) fresh static fallback fails
`validatePPBEExhibitDraft` with a `/placeholder/` error + (b) same draft with real narrative
substituted passes]. Python unchanged. Count methodology unchanged; the 4 key-gated e2e live
smokes remain skipped and excluded. Arithmetic: 2120 + 6 = 2126 (reconciles with the verify
script's independent count of 2126 this session).

**No net e2e test-count change.** Three e2e tests had assertions added/updated *within* existing
`it()` blocks (not new cases), so `test:e2e` stays at 164 total (160 passed + 4 skipped). See §5.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.**

---

## 5 — Source Changed This Session

| D | Files | Nature |
|---|---|---|
| D2 | `module-scribe/src/tt-draft-engine.ts` | `TT_UNAVAILABLE` now built **from** `FALLBACK_SENTINELS.unavailableCore` (imported from `./draft-contract`) rather than a hardcoded copy. Resulting string is **byte-identical** to before — it already matched the sentinel wording — so no TT test asserts changed text. Closes the latent-drift item Session 125 §6.2 flagged (Rule 11: generator built from the shared constant). |
| D2 | `module-scribe/src/ppbe-exhibit-engine.ts` | `STATIC_NOTICE` rebuilt from `FALLBACK_SENTINELS.unavailableCore`. Wording changed to preserve **and sharpen** the real governed-record distinction D1 confirmed: PPBE's static tier assembles real figures + citations from governed records; only the narrative prose is non-generated. New text states exactly that. |
| D4 | `module-scribe/src/ppbe-exhibit-contract.ts` | `validatePPBEExhibitDraft` now runs `collectPlaceholderErrors` after the structural/traceability checks (imported from `./draft-contract`), mirroring `validateModeOutput` and `validateTTDraft`. Closes F-51 at the live export/sign-off gate (`recordExhibitSignOff` re-runs this validator). |
| D4 | `module-scribe/tests/ppbe-exhibit-placeholder-gate.test.ts` | **NEW** — the 6-test PPBE F-51 regression suite (3 modes × (a)/(b)). |
| D4 | `module-scribe/tests/ppbe-exhibit-drafter.test.ts` | Updated the one existing test whose expectation flips: the unedited static fallback previously **passed** validation (the F-51 gap) and now correctly **fails** on the placeholder gate; traceability assertion preserved and made explicit. |
| — | `e2e/tests/ppbe-full-cycle.test.tsx` | Expectation updates only (no source change): the fake-live-body and double-gate draft now use a completed narrative; added assertions that the raw unedited fallback fails the validator and cannot open the sign-off gate. |
| — | `e2e/tests/ppbe-live-smoke.test.ts` | Expectation updates only: the fail-closed exhibit assertion now proves the static tier is schema+source valid but held by the placeholder gate; the opt-in LIVE half asserts validity only on the live path. |

---

## 6 — Items Outstanding for the Project Principal / Governance Agent

1. **`STATIC_NOTICE` reviewer-facing text changed (a generator-text change, surfaced not hidden).**
   Old: *"[Drafting service unavailable — this is a static fallback assembled from the governed
   records, not a generated narrative. Complete the document from the cited records before review.]"*
   New: *"[Drafting service unavailable — this is a static fallback, not a generated draft. The
   figures and citations below are assembled from the governed records; the narrative is not.
   Complete the document from the cited records before review.]"* This is more accurate (the old
   text implied the whole document was "assembled from the governed records"; in fact only the
   figures/citations are — the narrative body is a mechanical count sentence). No governance doc
   authored/edited by the Build Agent. If the Governance Agent wants different reviewer phrasing,
   the only invariant is that the notice **must contain** `FALLBACK_SENTINELS.unavailableCore`
   verbatim, or the gate silently stops firing.

2. **§4 surface question — assessed, NOT a stop.** The opening prompt asked to surface it if PPBE's
   static tier populates real governed data in a way that makes "static fallback" a *misleading*
   label. Assessment: it is **not** misleading. "Static" means "not model-generated"; the figures
   are real governed records assembled deterministically (never fabricated), and the narrative is a
   non-generated count sentence. The label is accurate and the new notice states the distinction
   explicitly. No disclosure-accuracy escalation required. (Full reasoning in the handoff §Findings.)

3. **Three e2e tests carried the pre-F-51 assumption; updated, not worked around.** They used the
   raw static fallback as a stand-in for a live model body / asserted it passes validation. That is
   the exact behavior the authorized D4 gate inverts. Updated to use completed drafts and to assert
   the raw fallback is correctly held. The opt-in LIVE-half exhibit assertion was logic-corrected for
   F-51 but is **not exercised in the standing (hermetic) suite** (Rule 9 — recorded as unverified-in-CI).

4. **Synthesis / Framing; F-25 / F-44 / Gate 3 / `recordExhibitSignOff` beyond the gate;
   `.sovereign_check_baseline`:** untouched, per the opening prompt and standing constraints.

---

*SOVEREIGN Platform — SBOM Session 126 Update v1.95 · August 20, 2026*
*Supersedes v1.94 (Session 125) · Pre-Decisional · Internal Working Document*
