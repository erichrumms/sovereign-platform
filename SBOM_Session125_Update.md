# SOVEREIGN Platform — SBOM Session Update
## Version 1.94 · August 20, 2026

**Supersedes:** v1.93 (`SBOM_Session124_Update.md`, Session 124). Version derived by scanning
all SBOM files on disk — highest was v1.93 — and adding one.
**Session:** 125 — extend the F-51 static-fallback placeholder gate to the two SCRIBE drafting
validators Session 124 surfaced outside the six product-intake modes. **TT (`validateTTDraft`)
fixed via clean reuse; PPBE (`validatePPBEExhibitDraft`) STOPPED and surfaced** — its engine's
static fallback carries a *different* sentinel not captured in `FALLBACK_SENTINELS`, so reuse
would ship a no-op gate (see §6). No shell-contract change, no new agents, no new event type.
Validation-logic change only.
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
| JS/TS | 2120 | High — all 15 workspaces run individually this session, every exit code 0 |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2315** | **High** |

**Change from v1.93:** **+18 JS/TS** (2102 → 2120), all in `module-scribe`. New file
`tt-draft-placeholder-gate.test.ts` adds 18 tests: 9 TT communication types × [(a) fresh static
fallback fails `validateTTDraft` with a `/placeholder/` error + (b) real body content substituted
passes]. Python unchanged. Count methodology unchanged; the 4 key-gated e2e live smokes remain
skipped and excluded. Arithmetic: 2102 + 18 = 2120 (reconciles with the verify script's independent
count).

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.**

---

## 5 — Source Changed This Session

| D | Files | Nature |
|---|---|---|
| D4 | `module-scribe/src/draft-contract.ts` | `collectPlaceholderErrors` changed from module-private to **exported** so the TT validator reuses the exact same walk (Rule 11 — one detector). No logic change to the walk or to `validateModeOutput`. |
| D4 | `module-scribe/src/tt-draft-contract.ts` | `validateTTDraft` now runs `collectPlaceholderErrors` after structural validation (imported from `./draft-contract`), mirroring `validateModeOutput`. Rejects an unedited static fallback whose body carries the shared sentinel. |
| D4 | `module-scribe/tests/tt-draft-placeholder-gate.test.ts` | NEW — the 18-test TT F-51 regression suite (9 comm types × (a)/(b)). |

**PPBE (`ppbe-exhibit-contract.ts` / `ppbe-exhibit-engine.ts`): NOT touched** — see §6.

---

## 6 — Items Outstanding for the Project Principal / Governance Agent

1. **PPBE Exhibit — STOPPED and surfaced per the opening prompt's §4 autonomous rule (NOT fixed).**
   Session 124's characterization (SBOM v1.93 §6, and its handoff §Rule 12) stated that *both* TT
   and PPBE engines "emit static fallbacks carrying the same sentinels." **Direct reproduction this
   session shows that is true for TT but false for PPBE.** The shared detector
   `isUnfilledPlaceholder` returns:
   - **TT** static fallback body → `true` (carries `unavailableCore` = "this is a static fallback,
     not a generated draft" verbatim). Clean reuse — fixed this session.
   - **PPBE** static fallback narrative → **`false`.** `ppbe-exhibit-engine.ts:160` `STATIC_NOTICE`
     reads *"this is a static fallback assembled from the governed records, not a generated
     narrative"* — different wording, captured in **neither** `FALLBACK_SENTINELS` member.

   Making the PPBE gate actually fire would require either (a) broadening `FALLBACK_SENTINELS` to
   include PPBE's distinct phrasing (redefining/expanding shared sentinel logic — the exact §4
   stop trigger, and it risks false positives on legitimate prose), or (b) rewriting the PPBE
   engine's `STATIC_NOTICE` so it is built *from* `FALLBACK_SENTINELS.unavailableCore` — a change
   to reviewer-facing generator text, not "reuse against the validator." Shipping the gate via
   plain reuse would be a **no-op safeguard on the one surface with a live export path**
   (`recordExhibitSignOff`, `ppbe-exhibit-contract.ts:288`) — a Rule-17 false safeguard, worse
   than not touching it. **Recommendation:** authorize option (b) as a next-session deliverable —
   rebuild BOTH engines' "unavailable" notices from `FALLBACK_SENTINELS.unavailableCore` (Rule 11:
   generator built from the shared constant so detector and generator cannot drift), then add the
   identical `collectPlaceholderErrors` gate to `validatePPBEExhibitDraft`. Handoff §Findings has
   the full evidence and the reproduction.

2. **TT's sentinel match is currently a coincidence, not a Rule-11 guarantee.** `TT_UNAVAILABLE`
   (`tt-draft-engine.ts:196`) is a hardcoded string that *happens* to contain `unavailableCore`
   verbatim; it is not built from `FALLBACK_SENTINELS`. The gate works today, but if that wording
   were edited the gate would silently stop firing. Folding TT's notice into option (b) above
   (build it from the constant) closes this latent drift at the same time.

3. **TT exposure remains theoretical (WH-28).** Confirmed directly this session: `TTManagerReview.tsx`
   has no Approve/Deny/Escalate control, and its "Send" action (`recordSend`) is **not** gated by
   `validateTTDraft`. The TT fix hardens the live-parse (`parseTTDraft`) and synthetic-review paths
   and is forward-correct for any future TT export gate, but does not itself block a static fallback
   from being *displayed* (the static tier bypasses `validateTTDraft`).

4. **Synthesis / Framing; F-25 / F-44 / Gate 3 / `.sovereign_check_baseline`:** untouched, per the
   opening prompt and standing constraints.

---

*SOVEREIGN Platform — SBOM Session 125 Update v1.94 · August 20, 2026*
*Supersedes v1.93 (Session 124) · Pre-Decisional · Internal Working Document*
