# SOVEREIGN Platform — SBOM Session Update
## Version 1.93 · August 20, 2026

**Supersedes:** v1.92 (`SBOM_Session123_Update.md`, Session 123). Version derived by scanning
all SBOM files on disk — highest was v1.92 — and adding one.
**Session:** 124 — close F-51: SCRIBE's static-fallback schema validation accepted unedited
placeholder text as satisfying the schema, enabling Approve & export with no human content
typed. Fixed across all six product-intake drafting modes. No shell-contract change, no new
agents, no new event type. Validation-logic change only.
**Build Agent close commit:** (see DOCUMENT_MANIFEST.tsv terminal HEAD row)

---

## 1 — Shell Contract

**v1.28 — unchanged.** Both copies byte-identical, SHA
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`. Confirmed unchanged at open
AND close. No GD raised (next GD remains **GD-43**).

---

## 2 — Agent and Prompt Registry

**Agents: 44 — unchanged.** **Prompts: 20 (19 approved + 1 pending) — unchanged.**

---

## 3 — Test Counts

| Suite | Count | Confidence |
|---|---|---|
| JS/TS | 2102 | High — all 15 workspaces run individually this session, every exit code 0 |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2297** | **High** |

**Change from v1.92:** **+13 JS/TS** (2089 → 2102), all in `module-scribe`. New file
`draft-placeholder-gate.test.ts` adds 13 tests: 1 sentinel-detection test + 6 modes × (a) fresh
static fallback fails the gate + (b) real content substituted passes. `draft-engine.test.ts` was
edited (assertions corrected to the fixed behavior) but its test count is unchanged. Python
unchanged. Count methodology unchanged; the 4 key-gated e2e live smokes remain skipped and
excluded.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.**

---

## 5 — Source Changed This Session

| D | Files | Nature |
|---|---|---|
| D4 | `module-scribe/src/draft-contract.ts` | `FALLBACK_SENTINELS` (single source of truth), `isUnfilledPlaceholder`, `collectPlaceholderErrors`; `validateModeOutput` now rejects unedited-placeholder content after structural validation |
| D4 | `module-scribe/src/draft-engine.ts` | `PLACEHOLDER` / `UNAVAILABLE` fallback strings now built FROM `FALLBACK_SENTINELS` so generator and detector cannot drift (strings byte-identical to before) |
| D4 | `module-scribe/tests/draft-placeholder-gate.test.ts` | NEW — the 13-test F-51 regression suite (per-mode (a)/(b)) |
| D4 | `module-scribe/tests/draft-engine.test.ts` | Two tests that encoded the old (buggy) "static fallback is schema-valid" behavior corrected to assert it is schema-shaped but NOT export-valid until edited |

---

## 6 — Items Outstanding for the Project Principal / Governance Agent

1. **Rule 12 finding — same defect class latent in two SCRIBE surfaces OUTSIDE the six named
   modes (surfaced, not fixed — out of this session's scope):** `validateTTDraft`
   (`tt-draft-contract.ts`) and `validatePPBEExhibitDraft` (`ppbe-exhibit-contract.ts`) both use
   the same non-empty-string-only checks with no placeholder exclusion, and both engines emit
   static fallbacks carrying the same sentinels. TT Manager Review has **no** Approve control
   (WH-28), so its exposure is limited; PPBE Exhibit **does** have an export path. Whether either
   is used live in the demonstration, and whether to extend the F-51 fix to them, is a governance
   decision. Handoff §Rule 12 has the evidence.
2. **Synthesis / Framing:** untouched, per the opening prompt (documented deferral, not a defect).
3. **F-25 / F-44 / Gate 3 / `.sovereign_check_baseline`:** untouched.

---

*SOVEREIGN Platform — SBOM Session 124 Update v1.93 · August 20, 2026*
*Supersedes v1.92 (Session 123) · Pre-Decisional · Internal Working Document*
