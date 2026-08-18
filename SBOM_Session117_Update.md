# SOVEREIGN Platform — SBOM Session Update
## Version 1.86 · August 17, 2026

**Supersedes:** v1.85 (`SBOM_Session116_Update.md`, Session 116). Version derived by scanning
all SBOM files on disk — highest was v1.85 — and adding one.
**Session:** 117 — SCRIBE app-wide AI-disclosure banner (F-20). Single deliverable (D1). No
shell-contract change, no new agents, no new event type, no architecture change. Presentational
addition only.
**Build Agent close commit:** (see DOCUMENT_MANIFEST.tsv terminal HEAD row)

---

## 1 — Shell Contract

**v1.28 — unchanged.** Both copies byte-identical, SHA
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`. Confirmed unchanged at open
AND close. No GD raised (next GD remains **GD-43**). No Constraint #11 propagation — no contract
change.

---

## 2 — Agent and Prompt Registry

**Agents: 44 — unchanged.** No new agents. **Prompts: 20 (19 approved + 1 pending) — unchanged.**

---

## 3 — Test Counts

| Suite | Count | Confidence |
|---|---|---|
| JS/TS | 2063 | High — all 15 suites pass, real exit codes via `sovereign_session_verify.sh` |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2258** | **High** |

**Change from v1.85:** **+4 JS/TS** (2059 → 2063). All four are new assertions in
`module-scribe/tests/ScribeApp.test.tsx` covering the F-20 banner: exact disclosure text on the
default Drafting Modes tab, banner still present after switching to Time & Travel Review, banner
still present after switching to PPBE Exhibits, and a single-instance check (rendered once at the
top level, not duplicated per-tab). Python unchanged.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.** No packages added or removed. Vulnerability posture unchanged.

---

## 5 — Source Changed This Session (F-20 — SCRIBE AI-disclosure banner)

| File | Nature |
|---|---|
| `module-scribe/src/banners.tsx` | **New file.** Local Category-2 governance-guardrail primitive: `governanceBannerStyle` (blue `#eff6ff`/`#1e40af`, matching APEX/FLOWPATH), `GovernanceBanner`, and `Gate1Banner` (the exact CPMI-VRS Gate 1 disclosure text). |
| `module-scribe/src/ScribeApp.tsx` | Import `Gate1Banner`; render it at the composition-root top level, above the surface toggle, so it appears on all three tabs. |
| `module-scribe/tests/ScribeApp.test.tsx` | +4 tests (see §3). |

**Style-constant decision (documented per D1):** duplicated the `governanceBannerStyle` locally in
a new `module-scribe/src/banners.tsx` rather than importing from `module-apex`/`module-flowpath`.
No module in this codebase imports from another `module-*`; each module keeps its own `banners.tsx`
(APEX and FLOWPATH both do). Importing across the boundary would have been the first cross-module
import in the repo — the local copy is the cleaner, convention-matching choice and keeps the change
inside `module-scribe/src`.

**Scope:** exactly `ScribeApp.tsx` + one new style/constants file + its own tests — within the
opening prompt's two-files-plus-tests bound. `SmartCapturePanel.tsx:61` left untouched (out of
scope by decision).

---

## 6 — Items Outstanding for the Project Principal / Governance Agent

1. **F-25 (structural):** SCRIBE's six product-aligned drafting modes navigate to the destination
   product but never publish an item into its queue — still open from Session 116. Needs a
   cross-module publish surface + destination ingestion (+ likely a new `SovereignEventType`) — a
   governance decision, not a Build Agent repair.
2. **`.sovereign_check_baseline`:** unchanged this session — not raised (opening-prompt §6 forbids
   it). Any pre-existing Tier-1 findings reflect Stage-4-unbuilt scope (Lessons 41–44), unrelated
   to this presentational change.

---

*SOVEREIGN Platform — SBOM Session 117 Update v1.86 · August 17, 2026*
*Supersedes v1.85 (Session 116) · Pre-Decisional · Internal Working Document*
